// public/js/recepcion/socios.js
// Backend: Supabase

let sociosCache  = [];
let planesCache  = [];
let currentSocioId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await actualizarMorosos();
    await cargarPlanes();
    await cargarSocios();
    setupBuscador();
    setupFormNuevoSocio();
    setupOffcanvasCobro();
    setupPerfilEdicion();
});

// ===================== SOCIOS =====================

async function actualizarMorosos() {
    const hoy = new Date().toISOString().split('T')[0];
    await window.supabaseClient
        .from('socios')
        .update({ estado: 'Moroso' })
        .eq('estado', 'Activo')
        .lt('vencimiento', hoy);
}

async function cargarPlanes() {
    const { data } = await window.supabaseClient
        .from('planes')
        .select('id, nombre, precio, duracion')
        .eq('estado', 'Activo')
        .order('nombre');
    planesCache = data || [];
}

async function cargarSocios() {
    const tbody = document.getElementById('tablaSociosBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

    const { data, error } = await window.supabaseClient
        .from('socios')
        .select('id, nombres, apellidos, dni, email, telefono, estado, vencimiento, plan_id, planes(nombre), created_at')
        .order('apellidos');

    if (error) {
        console.error('Error cargando socios:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error al cargar socios.</td></tr>';
        return;
    }

    sociosCache = data || [];
    renderizarTabla(sociosCache);
    actualizarContador(sociosCache.length);
}

function renderizarTabla(socios) {
    const tbody = document.getElementById('tablaSociosBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!socios.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay socios registrados.</td></tr>';
        return;
    }

    socios.forEach(socio => {
        const nombre   = socio.nombres || '';
        const apellido = socio.apellidos || '';
        const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
        const plan     = socio.planes?.nombre ?? 'Sin plan';
        const venc     = socio.vencimiento ? socio.vencimiento.split('-').reverse().join('/') : '--/--/----';
        const estado   = socio.estado || 'Inactivo';

        let badgeClase = 'bg-secondary bg-opacity-10 text-secondary';
        let vencClase  = 'text-muted';
        if (estado === 'Activo')  { badgeClase = 'bg-success bg-opacity-10 text-success'; }
        if (estado === 'Moroso')  { badgeClase = 'bg-danger bg-opacity-10 text-danger'; vencClase = 'text-danger fw-medium'; }

        const btnCobrar = estado === 'Activo'
            ? `<button class="btn btn-sm btn-light text-muted border rounded me-1" disabled title="Socio ya activo"><i class="fa-solid fa-money-bill-wave"></i></button>`
            : `<button class="btn btn-sm btn-light text-success border rounded me-1 btn-cobrar"
                data-id="${socio.id}" data-nombre="${nombre} ${apellido}" data-dni="${socio.dni}"
                title="Cobrar Membresía"><i class="fa-solid fa-money-bill-wave"></i></button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-medium text-gray-800">${socio.dni}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                        style="width:36px;height:36px;font-size:0.9rem;">${iniciales}</div>
                    <span class="fw-semibold text-gray-800">${nombre} ${apellido}</span>
                </div>
            </td>
            <td class="text-muted">${plan}</td>
            <td class="${vencClase}">${venc}</td>
            <td class="text-center">
                <span class="badge ${badgeClase} px-2 py-1 rounded-pill">${estado.toUpperCase()}</span>
            </td>
            <td class="pe-4 text-center">
                ${btnCobrar}
                <button class="btn btn-sm btn-light text-primary border rounded me-1 btn-perfil"
                    data-id="${socio.id}" title="Ver Perfil"><i class="fa-regular fa-id-badge"></i></button>
                <button class="btn btn-sm btn-light text-danger border rounded btn-baja"
                    data-id="${socio.id}" title="Dar de Baja"><i class="fa-solid fa-ban"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Eventos
    tbody.querySelectorAll('.btn-cobrar').forEach(btn => {
        btn.addEventListener('click', () => abrirOffcanvasCobro(btn.dataset.id, btn.dataset.nombre, btn.dataset.dni));
    });
    tbody.querySelectorAll('.btn-perfil').forEach(btn => {
        btn.addEventListener('click', () => abrirPerfil(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-baja').forEach(btn => {
        btn.addEventListener('click', () => darDeBaja(btn.dataset.id));
    });
}

function actualizarContador(n) {
    const el = document.getElementById('contadorSocios') || document.getElementById('textoContadorSocios');
    if (el) el.textContent = `Total registrados: ${n} socios`;
}

function setupBuscador() {
    const input = document.getElementById('inputBuscarSocio');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase().trim();
        const filtrados = sociosCache.filter(s =>
            (s.dni && s.dni.includes(t)) ||
            (`${s.nombres} ${s.apellidos}`).toLowerCase().includes(t)
        );
        renderizarTabla(filtrados);
        actualizarContador(filtrados.length);
    });
}

// ===================== NUEVO SOCIO =====================

function setupFormNuevoSocio() {
    const form = document.getElementById('formRegistroSocio');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombres   = document.getElementById('nombresSocio').value.trim();
        const apellidos = document.getElementById('apellidosSocio').value.trim();
        const dni       = document.getElementById('dniSocio').value.trim();
        const telefono  = document.getElementById('telefonoSocio').value.trim();
        const email     = document.getElementById('correoSocio').value.trim();

        if (!nombres || !apellidos || !dni || !telefono || !email) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos obligatorios.', confirmButtonColor: '#0d6efd' });
            return;
        }

        const { error } = await window.supabaseClient
            .from('socios')
            .insert({ nombres, apellidos, dni, telefono, email, estado: 'Inactivo' });

        if (error) {
            const msg = error.code === '23505' ? 'El DNI ya está registrado.' : 'No se pudo registrar el socio.';
            Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#0d6efd' });
            return;
        }

        bootstrap.Modal.getInstance(document.getElementById('modalNuevoSocio'))?.hide();
        form.reset();
        await cargarSocios();
        Swal.fire({ icon: 'success', title: '¡Socio registrado!', text: 'Ahora puedes registrar su pago para activarlo.', confirmButtonColor: '#0d6efd', timer: 3000, timerProgressBar: true });
    });
}

// ===================== DAR DE BAJA =====================

async function darDeBaja(socioId) {
    const result = await Swal.fire({
        title: '¿Dar de baja a este socio?',
        text: 'Su acceso al gimnasio quedará revocado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, dar de baja',
        cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    const { error } = await window.supabaseClient
        .from('socios').update({ estado: 'Inactivo' }).eq('id', socioId);

    if (error) { Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la baja.', confirmButtonColor: '#0d6efd' }); return; }

    await cargarSocios();
    Swal.fire({ icon: 'success', title: 'Baja procesada', timer: 2000, timerProgressBar: true, showConfirmButton: false });
}

// ===================== OFFCANVAS COBRO =====================

function abrirOffcanvasCobro(socioId, nombreCompleto, dni) {
    currentSocioId = socioId;

    const el = document.getElementById('offcanvasCobro');
    if (!el) return;

    document.getElementById('offcanvasMiembroId') && (document.getElementById('offcanvasMiembroId').value = socioId);
    document.getElementById('cobroSocioNombre') && (document.getElementById('cobroSocioNombre').textContent = nombreCompleto);
    document.getElementById('cobroSocioDNI')    && (document.getElementById('cobroSocioDNI').textContent    = dni);

    const selectPlan = document.getElementById('offcanvasSelectPlan');
    if (selectPlan) {
        selectPlan.innerHTML = '<option value="" disabled selected>Seleccionar plan...</option>';
        planesCache.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.dataset.precio   = p.precio;
            opt.dataset.duracion = p.duracion;
            opt.textContent = `${p.nombre} — S/ ${parseFloat(p.precio).toFixed(2)} (${p.duracion} días)`;
            selectPlan.appendChild(opt);
        });
    }

    const formCobro = document.getElementById('formOffcanvasCobro');
    if (formCobro) formCobro.reset();
    const montoEl = document.getElementById('offcanvasMontoTotal');
    if (montoEl) montoEl.value = '';

    bootstrap.Offcanvas.getOrCreateInstance(el).show();
}

function setupOffcanvasCobro() {
    const selectPlan = document.getElementById('offcanvasSelectPlan');
    if (selectPlan) {
        selectPlan.addEventListener('change', () => {
            const opt = selectPlan.options[selectPlan.selectedIndex];
            const montoEl = document.getElementById('offcanvasMontoTotal');
            if (montoEl && opt.dataset.precio) montoEl.value = parseFloat(opt.dataset.precio).toFixed(2);
        });
    }

    const form = document.getElementById('formOffcanvasCobro');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const socioId  = document.getElementById('offcanvasMiembroId')?.value;
        const planEl   = document.getElementById('offcanvasSelectPlan');
        const planId   = planEl?.value;
        const metodo   = document.getElementById('offcanvasMetodoPago')?.value;
        const monto    = parseFloat(document.getElementById('offcanvasMontoTotal')?.value);

        if (!socioId || !planId || !metodo || isNaN(monto)) {
            Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos del cobro.', confirmButtonColor: '#0d6efd' });
            return;
        }

        const duracion     = parseInt(planEl.options[planEl.selectedIndex].dataset.duracion || '30', 10);
        const hoy          = new Date();
        const fechaVenc    = new Date(hoy);
        fechaVenc.setDate(fechaVenc.getDate() + duracion);
        const vencimientoStr = fechaVenc.toISOString().split('T')[0];
        const fechaHoy       = hoy.toISOString().split('T')[0];

        const { error: errPago } = await window.supabaseClient
            .from('pagos')
            .insert({ socio_id: socioId, plan_id: planId, monto, fecha: fechaHoy, metodo_pago: metodo });

        if (errPago) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar el pago.', confirmButtonColor: '#0d6efd' });
            return;
        }

        await window.supabaseClient
            .from('socios')
            .update({ plan_id: planId, vencimiento: vencimientoStr, estado: 'Activo' })
            .eq('id', socioId);

        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasCobro'))?.hide();
        await cargarSocios();
        Swal.fire({
            icon: 'success',
            title: '¡Pago registrado!',
            html: `Membresía activa hasta el <strong>${vencimientoStr.split('-').reverse().join('/')}</strong>`,
            confirmButtonColor: '#0d6efd',
            timer: 3000,
            timerProgressBar: true,
        });
    });
}

// ===================== PERFIL =====================

async function abrirPerfil(socioId) {
    const { data: socio, error } = await window.supabaseClient
        .from('socios').select('*').eq('id', socioId).single();
    if (error || !socio) return;

    currentSocioId = socioId;
    const nombre = `${socio.nombres} ${socio.apellidos}`;
    const estado = socio.estado || 'Inactivo';

    document.getElementById('perfilNombre')   && (document.getElementById('perfilNombre').textContent   = nombre);
    document.getElementById('perfilDNI')      && (document.getElementById('perfilDNI').textContent      = socio.dni);
    document.getElementById('perfilEmail')    && (document.getElementById('perfilEmail').textContent    = socio.email || 'No registrado');
    document.getElementById('perfilTelefono') && (document.getElementById('perfilTelefono').textContent = socio.telefono || 'No registrado');

    const fechaReg = socio.created_at ? new Date(socio.created_at).toLocaleDateString('es-PE') : 'No registrada';
    document.getElementById('perfilRegistro') && (document.getElementById('perfilRegistro').textContent = fechaReg);

    const badge = document.getElementById('perfilEstadoBadge');
    if (badge) {
        badge.textContent = estado.toUpperCase();
        badge.className = 'badge rounded-pill px-3 py-2 fs-6';
        const cls = estado === 'Activo' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                  : estado === 'Moroso' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                  : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
        badge.classList.add(...cls.split(' '));
    }

    const modalEl = document.getElementById('modalPerfil');
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function setupPerfilEdicion() {
    const btnEmail = document.getElementById('btnEditarEmail');
    if (btnEmail) {
        btnEmail.addEventListener('click', async () => {
            const { value } = await Swal.fire({
                title: 'Editar Correo', input: 'email',
                inputValue: document.getElementById('perfilEmail')?.textContent !== 'No registrado'
                    ? document.getElementById('perfilEmail').textContent : '',
                showCancelButton: true, confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
                inputValidator: v => !v && 'Escribe un correo válido',
            });
            if (!value || !currentSocioId) return;
            await window.supabaseClient.from('socios').update({ email: value }).eq('id', currentSocioId);
            document.getElementById('perfilEmail').textContent = value;
            Swal.fire({ icon: 'success', title: 'Correo actualizado', timer: 2000, showConfirmButton: false });
        });
    }

    const btnTel = document.getElementById('btnEditarTelefono');
    if (btnTel) {
        btnTel.addEventListener('click', async () => {
            const { value } = await Swal.fire({
                title: 'Editar Teléfono', input: 'tel',
                inputValue: document.getElementById('perfilTelefono')?.textContent !== 'No registrado'
                    ? document.getElementById('perfilTelefono').textContent : '',
                showCancelButton: true, confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
                inputValidator: v => !v && 'Escribe un número válido',
            });
            if (!value || !currentSocioId) return;
            await window.supabaseClient.from('socios').update({ telefono: value }).eq('id', currentSocioId);
            document.getElementById('perfilTelefono').textContent = value;
            Swal.fire({ icon: 'success', title: 'Teléfono actualizado', timer: 2000, showConfirmButton: false });
        });
    }
}
