// public/js/recepcion/clases.js
// Backend: Supabase (a través de clasesService async)

document.addEventListener('DOMContentLoaded', () => {
    const contenedorClases       = document.getElementById('contenedorClases');
    const formInscribir          = document.getElementById('formInscribir');
    const offcanvasClassName     = document.getElementById('offcanvasClassName');
    const offcanvasClassTime     = document.getElementById('offcanvasClassTime');
    const offcanvasClassAforo    = document.getElementById('offcanvasClassAforo');
    const offcanvasListContainer = document.getElementById('offcanvasListContainer');

    let claseSeleccionadaId = null;

    // ---- Reloj ----
    const badgeFecha = document.getElementById('badgeFechaActual');
    if (badgeFecha) {
        const tick = () => {
            const f = new Date();
            const dia  = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(f);
            const mes  = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(f);
            const hora = f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            badgeFecha.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> ${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${f.getDate().toString().padStart(2,'0')} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} - ${hora}`;
        };
        tick(); setInterval(tick, 1000);
    }

    // ---- Renderizar tarjetas ----
    const renderizarClases = async () => {
        if (!contenedorClases) return;
        contenedorClases.innerHTML = '<div class="col-12 text-center py-4"><span class="spinner-border"></span></div>';

        const clases = await clasesService.obtenerClases();
        contenedorClases.innerHTML = '';

        if (!clases.length) {
            contenedorClases.innerHTML = '<div class="col-12 text-center text-muted py-4">No hay clases disponibles.</div>';
            return;
        }

        clases.forEach(clase => {
            let horario = '—';
            if (clase.fecha_hora) {
                const d = new Date(clase.fecha_hora);
                if (!isNaN(d)) horario = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} hrs`;
            }
            const coach     = clase.coach_nombre || clase.coach || '—';
            const salon     = clase.ubicacion || clase.salon || '—';
            const capacidad = clase.capacidad_max || 0;
            const inscritos = clase.inscritos ? clase.inscritos.length : 0;
            const porcentaje = clasesService.calcularPorcentajeOcupacion({ capacidad_max: capacidad, inscritos: clase.inscritos }) || 0;
            const estado     = clasesService.obtenerEstadoVisual({ capacidad_max: capacidad, inscritos: clase.inscritos });
            const llena      = clasesService.estaLlena({ capacidad_max: capacidad, inscritos: clase.inscritos });
            const cancelada  = clase.estado === 'Cancelada';

            const badgeHtml = cancelada
                ? `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1">CANCELADA</span>`
                : `<span class="badge bg-${estado.colorBadge} bg-opacity-10 text-${estado.colorBadge} border border-${estado.colorBadge} border-opacity-25 rounded-pill px-3 py-1">${estado.badge}</span>`;

            const btnPrimario = cancelada
                ? `<button class="btn btn-secondary flex-grow-1 bg-secondary bg-opacity-10 text-secondary border-0" disabled><i class="fa-solid fa-ban me-1"></i> No Disponible</button>`
                : llena
                    ? `<button class="btn btn-secondary flex-grow-1 bg-secondary bg-opacity-10 text-secondary border-0" disabled><i class="fa-solid fa-ban me-1"></i> Aforo Lleno</button>`
                    : `<button class="btn btn-primary flex-grow-1 fw-medium shadow-sm btn-inscribir" data-id="${clase.id}" data-nombre="${clase.nombre}"><i class="fa-solid fa-user-plus me-1"></i> Inscribir Socio</button>`;

            const cardHtml = `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card border-0 shadow-sm h-100 rounded-4${cancelada ? ' opacity-50 bg-light' : ''}">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                                <div class="${clase.bg_icono || 'bg-primary'} bg-opacity-10 ${clase.text_icono || 'text-primary'} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width:40px;height:40px;">
                                    <i class="fa-solid ${clase.icono || 'fa-dumbbell'} fs-5"></i>
                                </div>
                                ${clase.nombre}
                            </h5>
                            ${badgeHtml}
                        </div>
                        <div class="card-body">
                            <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2"></i> ${horario}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2"></i> Coach: ${coach}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2"></i> ${salon}</p>
                            <div class="mt-4">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="small fw-medium ${llena ? 'text-danger' : 'text-muted'}">Reservas: ${inscritos} / ${capacidad}</span>
                                    <span class="small fw-bold text-${estado.color}">${porcentaje}%</span>
                                </div>
                                <div class="progress" style="height:8px;">
                                    <div class="progress-bar bg-${cancelada ? 'secondary' : estado.color} rounded-pill" style="width:${porcentaje}%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 pb-4 pt-3">
                            <div class="d-flex gap-2">
                                ${btnPrimario}
                                <button class="btn btn-outline-${llena ? 'danger' : 'secondary'} border shadow-sm btn-ver-asistentes"
                                    data-id="${clase.id}" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAsistentes">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            contenedorClases.insertAdjacentHTML('beforeend', cardHtml);
        });

        contenedorClases.querySelectorAll('.btn-inscribir').forEach(btn => {
            btn.addEventListener('click', () => {
                claseSeleccionadaId = btn.dataset.id;
                document.getElementById('nombreClaseInscripcion') && (document.getElementById('nombreClaseInscripcion').textContent = btn.dataset.nombre);
                document.getElementById('dniInscripcion') && (document.getElementById('dniInscripcion').value = '');
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalInscribirSocio')).show();
            });
        });

        contenedorClases.querySelectorAll('.btn-ver-asistentes').forEach(btn => {
            btn.addEventListener('click', () => renderizarOffcanvas(btn.dataset.id));
        });
    };

    // ---- Offcanvas asistentes ----
    const renderizarOffcanvas = async (claseId) => {
        const clase = await clasesService.obtenerClasePorId(claseId);
        if (!clase) return;

        const inscritos  = clase.inscritos || [];
        const capacidad  = clase.capacidad_max || 0;

        if (offcanvasClassName) offcanvasClassName.textContent = clase.nombre;
        if (offcanvasClassTime) {
            let horario = '—';
            if (clase.fecha_hora) {
                const d = new Date(clase.fecha_hora);
                if (!isNaN(d)) horario = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
            }
            offcanvasClassTime.innerHTML = `<i class="fa-regular fa-clock me-1"></i> Hoy, ${horario}`;
        }
        if (offcanvasClassAforo) {
            offcanvasClassAforo.textContent = `Aforo: ${inscritos.length}/${capacidad}`;
            offcanvasClassAforo.className = `badge ${clasesService.estaLlena({ capacidad_max: capacidad, inscritos }) ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'} px-2 rounded-pill`;
        }

        if (offcanvasListContainer) {
            offcanvasListContainer.innerHTML = '';
            if (!inscritos.length) {
                offcanvasListContainer.innerHTML = '<div class="p-4 text-center text-muted small">No hay socios inscritos.</div>';
                return;
            }
            inscritos.forEach(i => {
                const nombre = i.nombre || `${i.nombres || ''} ${i.apellidos || ''}`.trim();
                const div = document.createElement('div');
                div.className = 'list-group-item bg-transparent py-3 border-bottom border-light';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0D6EFD&color=fff&rounded=true" width="32" class="rounded-circle me-3">
                            <div>
                                <h6 class="mb-0 fw-semibold text-gray-800 fs-6">${nombre}</h6>
                                <small class="text-muted">ID: ${i.socio_id || i.id}</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger border rounded-circle btn-cancelar-reserva"
                            data-clase-id="${claseId}" data-socio-id="${i.socio_id || i.id}" title="Cancelar Reserva">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>`;
                offcanvasListContainer.appendChild(div);
            });
            offcanvasListContainer.querySelectorAll('.btn-cancelar-reserva').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Cancelar la reserva de este socio?')) return;
                    await clasesService.desuscribirSocio(btn.dataset.claseId, btn.dataset.socioId);
                    await renderizarOffcanvas(btn.dataset.claseId);
                    await renderizarClases();
                });
            });
        }
    };

    // ---- Inscribir socio ----
    if (formInscribir) {
        formInscribir.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!claseSeleccionadaId) return;

            const dni = document.getElementById('dniInscripcion')?.value.trim();
            if (!dni) return;

            // Buscar socio activo por DNI
            const { data: socio } = await window.supabaseClient
                .from('socios').select('id').eq('dni', dni).eq('estado', 'Activo').maybeSingle();

            if (!socio) {
                Swal.fire({ icon: 'warning', title: 'Socio no encontrado', text: 'DNI no encontrado o socio no activo.', confirmButtonColor: '#0d6efd' });
                return;
            }

            const ok = await clasesService.inscribirSocio(claseSeleccionadaId, socio.id);
            if (ok) {
                bootstrap.Modal.getInstance(document.getElementById('modalInscribirSocio'))?.hide();
                await renderizarClases();
                Swal.fire({ icon: 'success', title: '¡Inscrito!', timer: 2000, showConfirmButton: false });
                claseSeleccionadaId = null;
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'El socio ya está inscrito o la clase está llena.', confirmButtonColor: '#0d6efd' });
            }
        });
    }

    renderizarClases();
});
