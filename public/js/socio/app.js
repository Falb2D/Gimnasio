// public/js/socio/app.js

let socioActual = null;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatearFecha(fechaISO) {
    if (!fechaISO) return '—';
    const [y, m, d] = fechaISO.split('-');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

function calcularEstado(socio) {
    if (socio.estado === 'Moroso' || socio.estado === 'Inactivo') return 'Deudor';
    if (!socio.vencimiento) return 'Activo';
    const hoy = new Date();
    const vence = new Date(socio.vencimiento);
    const diasRestantes = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 0) return 'Deudor';
    if (diasRestantes <= 7) return 'Alerta';
    return 'Activo';
}

function iconoMetodo(metodo) {
    if (!metodo) return { icono: 'fa-money-bill-wave', clase: 'text-success' };
    const m = metodo.toLowerCase();
    if (m.includes('yape') || m.includes('plin') || m.includes('transferencia'))
        return { icono: 'fa-mobile-screen-button', clase: 'text-primary' };
    if (m.includes('tarjeta') || m.includes('visa') || m.includes('mastercard'))
        return { icono: 'fa-credit-card', clase: 'text-info' };
    return { icono: 'fa-money-bill-wave', clase: 'text-success' };
}

// ─── CARGA DATOS SOCIO ────────────────────────────────────────────────────────

async function cargarSocio() {
    const id = localStorage.getItem('sesionId');
    if (!id || !window.supabaseClient) return null;

    const { data, error } = await window.supabaseClient
        .from('socios')
        .select('*, planes(nombre, precio, duracion)')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data;
}

// ─── ACTUALIZAR UI GLOBAL (sidebar + banner) ──────────────────────────────────

function actualizarEstadoGlobal(socio, estadoUI) {
    // Banner de estado
    const banner = document.getElementById('portalEstadoBanner');
    if (banner) {
        let cls = 'alert-success', icon = 'fa-circle-check', titulo = 'Membresía Activa';
        let msg = 'Tu acceso y reservas están disponibles.';

        if (estadoUI === 'Alerta') {
            cls = 'alert-warning'; icon = 'fa-triangle-exclamation'; titulo = 'Vence Pronto';
            msg = `Tu plan vence el ${formatearFecha(socio.vencimiento)}. Renueva para evitar suspensiones.`;
        } else if (estadoUI === 'Deudor') {
            cls = 'alert-danger'; icon = 'fa-lock'; titulo = 'Reservas suspendidas';
            msg = 'Regulariza tu pago en recepción para volver a reservar clases.';
        }

        banner.innerHTML = `
            <div class="alert ${cls} d-flex align-items-center gap-3 mb-4 rounded-4" role="alert">
                <i class="fa-solid ${icon} fs-4"></i>
                <div>
                    <p class="fw-semibold mb-1">${titulo}</p>
                    <p class="mb-0 small">${msg}</p>
                </div>
            </div>`;
    }

    // Bloquear nav de clases si es Deudor
    const navClases = document.getElementById('navReservarClases');
    if (navClases) {
        const existeLock = navClases.querySelector('.nav-status-lock');
        if (estadoUI === 'Deudor' && !existeLock) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger text-white nav-status-lock ms-auto';
            badge.textContent = 'Bloqueado';
            navClases.appendChild(badge);
        } else if (estadoUI !== 'Deudor' && existeLock) {
            existeLock.remove();
        }
    }
}

// ─── VISTA: MI QR ─────────────────────────────────────────────────────────────

function renderizarMiQR(socio, estadoUI) {
    const badgeEstado  = document.getElementById('badgeEstado');
    const qrContainer  = document.getElementById('qrcode');
    const estadoMsg    = document.getElementById('estadoMensaje');
    const socioCard    = document.getElementById('socioCard');
    const nombreEl     = document.querySelector('#socioCard h4');
    const numeroEl     = document.querySelector('#socioCard .text-muted.fw-medium.small');
    const planEl       = document.querySelector('#socioCard .fw-bold.text-dark.small');
    const venceEl      = document.querySelectorAll('#socioCard .fw-bold.text-dark.small')[1];

    // Datos del socio
    if (nombreEl) nombreEl.textContent = `${socio.nombres} ${socio.apellidos}`;
    if (numeroEl) numeroEl.textContent = `Socio #${socio.dni || socio.id.slice(0, 6).toUpperCase()}`;
    if (planEl)   planEl.textContent   = socio.planes?.nombre || 'Sin plan';
    if (venceEl)  venceEl.textContent  = formatearFecha(socio.vencimiento);

    // Avatar dinámico
    const avatarEl = document.querySelector('#socioCard img.rounded-circle');
    if (avatarEl) {
        const nombre = encodeURIComponent(`${socio.nombres} ${socio.apellidos}`);
        avatarEl.src = `https://ui-avatars.com/api/?name=${nombre}&background=f8fafc&color=0d6efd&rounded=true&size=120`;
    }

    if (!qrContainer || !badgeEstado) return;

    socioCard?.classList.remove('status-active', 'status-alert', 'status-deudor');
    qrContainer.classList.remove('qr-locked');
    qrContainer.innerHTML = '';
    if (estadoMsg) estadoMsg.innerHTML = '';

    if (estadoUI === 'Activo' || estadoUI === 'Alerta') {
        socioCard?.classList.add(estadoUI === 'Activo' ? 'status-active' : 'status-alert');

        if (estadoUI === 'Activo') {
            badgeEstado.className = 'estado-badge d-inline-block estado-active px-4 py-2 rounded-pill border mb-3 shadow-sm';
            badgeEstado.innerHTML = `<span class="fw-bold text-success fs-6"><i class="fa-solid fa-circle-check me-2"></i>Membresía Activa</span>`;
        } else {
            badgeEstado.className = 'estado-badge d-inline-block estado-alert px-4 py-2 rounded-pill border mb-3 shadow-sm';
            badgeEstado.innerHTML = `<span class="fw-bold text-warning fs-6"><i class="fa-solid fa-circle-exclamation me-2"></i>Vence Pronto</span>`;
        }

        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: `FITFAB-${socio.id}`,
                width: 220, height: 220,
                colorDark: '#0f172a', colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        if (estadoUI === 'Alerta' && estadoMsg) {
            estadoMsg.innerHTML = `
                <div class="alert alert-warning rounded-4 py-3 mb-0">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i>
                    <strong>Tu pase vence el ${formatearFecha(socio.vencimiento)}</strong> — renueva para no perder el acceso.
                </div>`;
        } else if (estadoMsg) {
            estadoMsg.innerHTML = `<p class="text-muted small mb-0">Presenta este código en recepción para ingresar.</p>`;
        }

    } else {
        socioCard?.classList.add('status-deudor');
        badgeEstado.className = 'estado-badge d-inline-block estado-deudor px-4 py-2 rounded-pill border mb-3 shadow-sm';
        badgeEstado.innerHTML = `<span class="fw-bold text-danger fs-6"><i class="fa-solid fa-lock me-2"></i>Membresía Vencida</span>`;
        qrContainer.classList.add('qr-locked');
        qrContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-danger" style="min-height:220px">
                <i class="fa-solid fa-lock fa-3x mb-3"></i>
                <h5 class="fw-bold mb-2">Acceso Suspendido</h5>
                <p class="text-muted small text-center mb-0">Regulariza tu pago para volver a usar tu pase.</p>
            </div>`;
        if (estadoMsg) {
            estadoMsg.innerHTML = `<button class="btn btn-danger w-100 rounded-pill py-2" onclick="mostrarRegularizarPago()">Regularizar Pago</button>`;
        }
    }
}

// ─── VISTA: RESERVAR CLASES ───────────────────────────────────────────────────

async function renderizarClases(socio, estadoUI) {
    const contenedor = document.getElementById('contenedorClases');
    if (!contenedor) return;

    contenedor.innerHTML = '<div class="col-12 text-center py-5"><span class="spinner-border text-primary"></span></div>';

    if (estadoUI === 'Deudor') {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="card border-0 rounded-4 p-4 shadow-sm text-center">
                    <h5 class="fw-bold text-danger mb-2"><i class="fa-solid fa-lock me-2"></i>Reservas Suspendidas</h5>
                    <p class="text-muted mb-0">Acércate a recepción para regularizar tu pago y volver a reservar.</p>
                </div>
            </div>`;
        return;
    }

    // Calcular fechas para el filtro de 3 días
    const dias   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const fechaDias = [0, 1, 2].map(offset => {
        const d = new Date(); d.setDate(d.getDate() + offset); return d;
    });
    const fechaStrs = fechaDias.map(d => d.toISOString().split('T')[0]);

    // Actualizar labels dinámicos del filtro
    const labelHoy     = document.querySelector('label[for="btnHoy"]');
    const labelManana  = document.querySelector('label[for="btnManana"]');
    const labelTercero = document.querySelector('label[for="btnMiercoles"]');
    if (labelHoy)     labelHoy.textContent     = 'Hoy';
    if (labelManana)  labelManana.textContent   = 'Mañana';
    if (labelTercero) labelTercero.textContent  = `${dias[fechaDias[2].getDay()]} ${fechaDias[2].getDate()} ${meses[fechaDias[2].getMonth()]}`;

    const obtenerFechaFiltro = () => {
        if (document.getElementById('btnManana')?.checked)   return fechaStrs[1];
        if (document.getElementById('btnMiercoles')?.checked) return fechaStrs[2];
        return fechaStrs[0]; // Hoy por defecto
    };

    const renderClasesFiltradas = async (fechaFiltro) => {
        contenedor.innerHTML = '<div class="col-12 text-center py-5"><span class="spinner-border text-primary"></span></div>';

        const desde = `${fechaFiltro}T00:00:00`;
        const hasta = `${fechaFiltro}T23:59:59`;

        const { data: clases, error } = await window.supabaseClient
            .from('clases')
            .select('*, inscripciones(socio_id)')
            .neq('estado', 'Cancelada')
            .gte('fecha_hora', desde)
            .lte('fecha_hora', hasta)
            .order('fecha_hora', { ascending: true });

        if (error) {
            contenedor.innerHTML = '<div class="col-12 text-center text-danger py-4">Error al cargar clases.</div>';
            return;
        }

        contenedor.innerHTML = '';
        if (!clases || clases.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center text-muted py-5">No hay clases disponibles para este día.</div>';
            return;
        }

        clases.forEach(clase => {
            buildClaseCard(clase, socio, contenedor);
        });
    };

    // Conectar botones del filtro
    ['btnHoy', 'btnManana', 'btnMiercoles'].forEach((id, i) => {
        const radio = document.getElementById(id);
        if (radio) radio.addEventListener('change', () => { if (radio.checked) renderClasesFiltradas(fechaStrs[i]); });
    });

    await renderClasesFiltradas(obtenerFechaFiltro());
}

function buildClaseCard(clase, socio, contenedor) {
    const inscripciones = clase.inscripciones || [];
    const capacidad  = clase.capacidad_max || clase.capacidad || 0;
    const inscritos  = inscripciones.length;
    const lugares    = capacidad - inscritos;
    const yaInscrito = inscripciones.some(i => i.socio_id === socio.id);
    const llena      = lugares <= 0 && !yaInscrito;

    const horario = clase.fecha_hora
        ? new Date(clase.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        : (clase.horario || '—');

    let botonHtml = '';
    if (yaInscrito) {
        botonHtml = `<button class="btn btn-outline-danger w-100 fw-bold py-2"
            onclick="cancelarReserva('${clase.id}','${clase.nombre}')">
            <i class="fa-solid fa-xmark me-2"></i>Cancelar Reserva</button>`;
    } else if (llena) {
        botonHtml = `<button class="btn btn-secondary w-100 fw-bold py-2" disabled>
            <i class="fa-solid fa-ban me-2"></i>Clase Llena</button>`;
    } else {
        botonHtml = `<button class="btn btn-primary w-100 fw-bold py-2"
            onclick="reservarLugar('${clase.id}','${clase.nombre}')">
            <i class="fa-solid fa-calendar-plus me-2"></i>Reservar mi lugar</button>`;
    }

    const placesBg   = llena ? 'bg-danger bg-opacity-10 border-danger' : 'bg-light border-secondary border-opacity-10';
    const placesText = llena ? 'text-danger' : 'text-gray-800';

    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4 mb-4';
    col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mb-2 rounded-pill px-3 py-1">FITFAB Studio</span>
                        <h5 class="fw-bold mb-1">${clase.nombre}</h5>
                        <p class="text-muted small mb-0"><i class="fa-solid fa-user-ninja me-1 text-secondary"></i>${clase.instructor_nombre || clase.coach || 'Entrenador'}</p>
                    </div>
                    <div class="bg-light rounded p-2 text-center border shadow-sm">
                        <span class="d-block fw-bold text-primary fs-5 lh-1">${horario}</span>
                        <span class="d-block text-muted mt-1" style="font-size:0.65rem;font-weight:700">HRS</span>
                    </div>
                </div>
                <div class="${placesBg} rounded-3 p-3 mb-4 border">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-semibold ${placesText} small"><i class="fa-solid fa-users me-2"></i>Lugares disponibles</span>
                        <span class="fw-bold px-2 py-1 rounded ${llena ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}">${lugares} / ${capacidad}</span>
                    </div>
                </div>
                ${botonHtml}
            </div>
        </div>`;
    contenedor.appendChild(col);
}

window.reservarLugar = async function(idClase, nombreClase) {
    const confirm = await Swal.fire({
        title: '¿Reservar lugar?',
        html: `Confirma tu reserva en <b>${nombreClase}</b>.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, reservar',
        cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    const { error } = await window.supabaseClient
        .from('inscripciones')
        .insert({ clase_id: idClase, socio_id: socioActual.id });

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la reserva.', confirmButtonColor: '#0d6efd' });
        return;
    }

    Swal.fire({ icon: 'success', title: '¡Reservado!', html: `Tu lugar en <b>${nombreClase}</b> fue asegurado.`, timer: 2000, showConfirmButton: false });
    await renderizarClases(socioActual, calcularEstado(socioActual));
};

window.cancelarReserva = async function(idClase, nombreClase) {
    const confirm = await Swal.fire({
        title: '¿Cancelar reserva?',
        html: `¿Seguro que quieres cancelar <b>${nombreClase}</b>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No'
    });
    if (!confirm.isConfirmed) return;

    const { error } = await window.supabaseClient
        .from('inscripciones')
        .delete()
        .eq('clase_id', idClase)
        .eq('socio_id', socioActual.id);

    if (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la reserva.', confirmButtonColor: '#0d6efd' });
        return;
    }

    Swal.fire({ icon: 'success', title: '¡Cancelada!', text: 'Tu cupo ha sido liberado.', timer: 2000, showConfirmButton: false });
    await renderizarClases(socioActual, calcularEstado(socioActual));
};

// ─── VISTA: MIS PAGOS ─────────────────────────────────────────────────────────

async function renderizarPagos(socio) {
    const listGroup = document.getElementById('historialPagosList');
    if (!listGroup) return;

    // Actualizar cabecera de resumen (plan y vencimiento)
    const elPlanNombre  = document.getElementById('resumenPlanNombre');
    const elVencimiento = document.getElementById('resumenVencimiento');
    const elBadge       = document.getElementById('estadoPagoBadge');
    if (elPlanNombre)  elPlanNombre.textContent  = socio.planes?.nombre || 'Sin plan';
    if (elVencimiento) elVencimiento.textContent = formatearFecha(socio.vencimiento);
    if (elBadge) {
        const estadoUI = calcularEstado(socio);
        const badges = {
            Activo : { cls: 'badge bg-white text-success rounded-pill px-3 py-2 fw-bold shadow-sm', txt: '<i class="fa-solid fa-circle-check me-1"></i>Activo' },
            Alerta : { cls: 'badge bg-white text-warning rounded-pill px-3 py-2 fw-bold shadow-sm', txt: '<i class="fa-solid fa-triangle-exclamation me-1"></i>Por vencer' },
            Deudor : { cls: 'badge bg-white text-danger rounded-pill px-3 py-2 fw-bold shadow-sm',  txt: '<i class="fa-solid fa-lock me-1"></i>Suspendido' },
        };
        const b = badges[estadoUI] || badges.Activo;
        elBadge.className = b.cls;
        elBadge.innerHTML = b.txt;
    }

    listGroup.innerHTML = '<div class="text-center py-4"><span class="spinner-border text-primary"></span></div>';

    const { data: pagos, error } = await window.supabaseClient
        .from('pagos')
        .select('*, planes(nombre)')
        .eq('socio_id', socio.id)
        .order('fecha', { ascending: false });

    if (error) {
        listGroup.innerHTML = '<div class="text-center text-danger py-4">Error al cargar historial.</div>';
        return;
    }

    if (!pagos || pagos.length === 0) {
        listGroup.innerHTML = '<div class="list-group-item text-center text-muted py-4">No hay pagos registrados.</div>';
        return;
    }

    listGroup.innerHTML = '';
    pagos.forEach((pago, idx) => {
        const { icono, clase } = iconoMetodo(pago.metodo_pago);
        const bgClass    = idx > 0 ? 'bg-light bg-opacity-50' : '';
        const roundedClass = idx === pagos.length - 1 ? 'rounded-bottom-4' : '';

        listGroup.innerHTML += `
            <div class="list-group-item p-4 border-0 border-bottom border-light ${bgClass} ${roundedClass}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="fw-bold mb-2">S/ ${parseFloat(pago.monto).toFixed(2)}</h5>
                        <span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2 me-1">
                            <i class="fa-solid ${icono} ${clase} me-1"></i>${pago.metodo_pago || 'Efectivo'}
                        </span>
                        <span class="badge bg-light text-muted border border-secondary border-opacity-10 py-1 px-2">
                            <i class="fa-solid fa-crown text-warning me-1"></i>${pago.planes?.nombre || 'Plan'}
                        </span>
                    </div>
                    <span class="text-muted small fw-medium">${formatearFecha(pago.fecha)}</span>
                </div>
            </div>`;
    });

    // Actualizar resumen de estado de pagos en la misma vista si existe
    const el = document.getElementById('estadoPagoAlert');
    if (!el) return;
    const estadoUI = calcularEstado(socio);
    if (estadoUI === 'Activo') {
        el.className = 'alert alert-success d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm';
        el.innerHTML = `<i class="fa-solid fa-face-smile-wink fs-4 me-3"></i><div class="small fw-medium">¡Estás al día con tus pagos!</div>`;
    } else if (estadoUI === 'Alerta') {
        el.className = 'alert alert-warning d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm';
        el.innerHTML = `<i class="fa-solid fa-triangle-exclamation fs-4 me-3"></i><div class="small fw-medium">Tu plan vence el ${formatearFecha(socio.vencimiento)}. Renueva pronto.</div>`;
    } else {
        el.className = 'alert alert-danger d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm';
        el.innerHTML = `<i class="fa-solid fa-lock fs-4 me-3"></i><div class="small fw-medium">Tu membresía está suspendida. Acércate a recepción.</div>`;
    }
}

// ─── FUNCIÓN GLOBAL: REGULARIZAR ─────────────────────────────────────────────

window.mostrarRegularizarPago = function() {
    Swal.fire({
        icon: 'info',
        title: 'Regulariza tu pago',
        text: 'Acércate a recepción de FITFAB para regularizar tu membresía y reactivar tu acceso.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#0d6efd'
    });
};

// ─── INIT ─────────────────────────────────────────────────────────────────────

async function actualizarMorosos() {
    const hoy = new Date().toISOString().split('T')[0];
    await window.supabaseClient
        .from('socios')
        .update({ estado: 'Moroso' })
        .eq('estado', 'Activo')
        .lt('vencimiento', hoy);
}

document.addEventListener('DOMContentLoaded', async () => {
    await actualizarMorosos();
    socioActual = await cargarSocio();
    if (!socioActual) return;

    const estadoUI = calcularEstado(socioActual);
    const path = window.location.pathname;

    actualizarEstadoGlobal(socioActual, estadoUI);

    if (path.includes('socio.html') || path.endsWith('/socio/')) {
        renderizarMiQR(socioActual, estadoUI);
    } else if (path.includes('socio_clases.html')) {
        await renderizarClases(socioActual, estadoUI);
    } else if (path.includes('socio_pagos.html')) {
        await renderizarPagos(socioActual);
    }
});
