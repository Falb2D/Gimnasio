document.addEventListener('DOMContentLoaded', () => {

    // 1. Obtener datos desde localStorage (inicializado por storage.js)
    let clasesRecepcionMock = JSON.parse(localStorage.getItem('clasesDB')) || [];

    let claseSeleccionadaId = null;

    const contenedorClases = document.getElementById('contenedorClases');
    const formInscribir = document.getElementById('formInscribir');

    const offcanvasClassName = document.getElementById('offcanvasClassName');
    const offcanvasClassTime = document.getElementById('offcanvasClassTime');
    const offcanvasClassAforo = document.getElementById('offcanvasClassAforo');
    const offcanvasListContainer = document.getElementById('offcanvasListContainer');

    // Función para mostrar fecha y hora dinámica (reloj en vivo)
    const mostrarFechaActual = () => {
        const badgeFecha = document.getElementById('badgeFechaActual');
        if (!badgeFecha) return;

        const actualizarReloj = () => {
            const fecha = new Date();
            
            // Lógica de Fecha
            const opcionesDia = { weekday: 'long' };
            const opcionesMes = { month: 'long' };
            
            let diaSemana = new Intl.DateTimeFormat('es-ES', opcionesDia).format(fecha);
            let diaNumero = fecha.getDate().toString().padStart(2, '0');
            let mes = new Intl.DateTimeFormat('es-ES', opcionesMes).format(fecha);
            
            diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
            mes = mes.charAt(0).toUpperCase() + mes.slice(1);
            
            // Lógica de Hora
            const horaActual = fecha.toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            badgeFecha.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> ${diaSemana}, ${diaNumero} de ${mes} - ${horaActual}`;
        };

        // Ejecutar inmediatamente para evitar retraso visual de 1 segundo
        actualizarReloj();
        
        // Iniciar intervalo de actualización
        setInterval(actualizarReloj, 1000);
    };

    // 2. Renderizado Dinámico de Clases
    const renderizarClases = () => {
        if (!contenedorClases) return;
        
        clasesRecepcionMock = JSON.parse(localStorage.getItem('clasesDB')) || [];
        
        contenedorClases.innerHTML = '';
        
        clasesRecepcionMock.forEach(clase => {
            const reservasActuales = clase.inscritos.length;
            const porcentaje = Math.floor((reservasActuales / clase.capacidad_max) * 100);
            
            let colorClase = '';
            let textoBadge = '';
            
            if (porcentaje < 80) {
                colorClase = 'success';
                textoBadge = 'Cupos Libres';
            } else if (porcentaje >= 80 && porcentaje < 100) {
                colorClase = 'warning';
                textoBadge = 'Casi Lleno';
            } else {
                colorClase = 'danger';
                textoBadge = 'Clase Llena';
            }

            const estaLlena = reservasActuales >= clase.capacidad_max;

            const cardHtml = `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card border-0 shadow-sm h-100 rounded-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                                <div class="${clase.bg_icono} bg-opacity-10 ${clase.text_icono} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                                    <i class="fa-solid ${clase.icono} fs-5"></i>
                                </div>
                                ${clase.nombre}
                            </h5>
                            <span class="badge bg-${colorClase} bg-opacity-10 text-${colorClase} border border-${colorClase} border-opacity-25 rounded-pill px-3 py-1">${textoBadge}</span>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.horario}</p>
                                <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${clase.coach}</p>
                                <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.salon}</p>
                            </div>
                            
                            <div class="mt-4">
                                <div class="d-flex justify-content-between align-items-end mb-1">
                                    <span class="small fw-medium ${estaLlena ? 'text-danger' : 'text-muted'}">Reservas: ${reservasActuales} / ${clase.capacidad_max}</span>
                                    <span class="small fw-bold text-${colorClase}">${porcentaje}%</span>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar bg-${colorClase} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${reservasActuales}" aria-valuemin="0" aria-valuemax="${clase.capacidad_max}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 pb-4 pt-3">
                            <div class="d-flex gap-2">
                                ${estaLlena ? `
                                    <button class="btn btn-secondary flex-grow-1 fw-medium bg-secondary bg-opacity-10 text-secondary border-0" disabled>
                                        <i class="fa-solid fa-ban me-1"></i> Aforo Lleno
                                    </button>
                                ` : `
                                    <button class="btn btn-primary flex-grow-1 fw-medium shadow-sm btn-inscribir" data-id="${clase.id}" data-nombre="${clase.nombre}">
                                        <i class="fa-solid fa-user-plus me-1"></i> Inscribir Socio
                                    </button>
                                `}
                                <button class="btn btn-outline-${estaLlena ? 'danger' : 'secondary'} border shadow-sm btn-ver-asistentes" data-id="${clase.id}" title="Lista de Asistentes" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAsistentes">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            contenedorClases.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Eventos para Inscribir
        const botonesInscribir = contenedorClases.querySelectorAll('.btn-inscribir');
        botonesInscribir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const nombre = e.currentTarget.getAttribute('data-nombre');
                
                claseSeleccionadaId = id;
                document.getElementById('nombreClaseInscripcion').innerText = nombre;
                document.getElementById('dniInscripcion').value = '';

                let modal = bootstrap.Modal.getInstance(document.getElementById('modalInscribirSocio'));
                if (!modal) modal = new bootstrap.Modal(document.getElementById('modalInscribirSocio'));
                modal.show();
            });
        });

        // Eventos para Ver Asistentes (Abrir Offcanvas)
        const botonesAsistentes = contenedorClases.querySelectorAll('.btn-ver-asistentes');
        botonesAsistentes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                renderizarOffcanvas(id);
            });
        });
    };

    // 3. Renderizar Offcanvas (Lista de Inscritos y Cabecera)
    const renderizarOffcanvas = (claseId) => {
        clasesRecepcionMock = JSON.parse(localStorage.getItem('clasesDB')) || [];
        const clase = clasesRecepcionMock.find(c => c.id === claseId);
        if (!clase) return;

        const reservasActuales = clase.inscritos.length;

        // Renderizar Cabecera
        if (offcanvasClassName) offcanvasClassName.innerText = clase.nombre;
        if (offcanvasClassTime) offcanvasClassTime.innerHTML = `<i class="fa-regular fa-clock me-1"></i> Hoy, ${clase.horario.split(' - ')[0]}`;
        if (offcanvasClassAforo) {
            offcanvasClassAforo.innerText = `Aforo: ${reservasActuales}/${clase.capacidad_max}`;
            // Cambiar color de badge de la cabecera si está lleno
            if (reservasActuales >= clase.capacidad_max) {
                offcanvasClassAforo.className = "badge bg-danger bg-opacity-10 text-danger px-2 rounded-pill";
            } else {
                offcanvasClassAforo.className = "badge bg-primary bg-opacity-10 text-primary px-2 rounded-pill";
            }
        }

        // Renderizar Lista de Inscritos
        if (offcanvasListContainer) {
            offcanvasListContainer.innerHTML = '';
            
            if (clase.inscritos.length === 0) {
                offcanvasListContainer.innerHTML = `<div class="p-4 text-center text-muted small">No hay socios inscritos.</div>`;
                return;
            }

            clase.inscritos.forEach(inscrito => {
                const itemHtml = `
                    <div class="list-group-item bg-transparent py-3 border-bottom border-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img src="https://ui-avatars.com/api/?name=${inscrito.nombre.replace(/ /g, '+')}&background=0D6EFD&color=fff&rounded=true" width="32" class="rounded-circle me-3">
                                <div>
                                    <h6 class="mb-0 fw-semibold text-gray-800 fs-6">${inscrito.nombre}</h6>
                                    <small class="text-muted">DNI: ${inscrito.dni}</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger border rounded-circle btn-cancelar-reserva" data-clase-id="${clase.id}" data-socio-dni="${inscrito.dni}" title="Cancelar Reserva">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                offcanvasListContainer.insertAdjacentHTML('beforeend', itemHtml);
            });

            // Asignar eventos a los botones de cancelar reserva
            const botonesCancelar = offcanvasListContainer.querySelectorAll('.btn-cancelar-reserva');
            botonesCancelar.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cId = parseInt(e.currentTarget.getAttribute('data-clase-id'));
                    const sDni = e.currentTarget.getAttribute('data-socio-dni');
                    
                    if (confirm('¿Desea cancelar la reserva de este socio?')) {
                        cancelarReserva(cId, sDni);
                    }
                });
            });
        }
    };

    // 4. Lógica para Cancelar Reserva
    const cancelarReserva = (claseId, socioDni) => {
        clasesRecepcionMock = JSON.parse(localStorage.getItem('clasesDB')) || [];
        const claseIndex = clasesRecepcionMock.findIndex(c => c.id === claseId);
        if (claseIndex !== -1) {
            const clase = clasesRecepcionMock[claseIndex];
            
            // Remover al socio del array de inscritos
            clase.inscritos = clase.inscritos.filter(i => i.dni !== socioDni);

            // Sobrescribir localStorage
            localStorage.setItem('clasesDB', JSON.stringify(clasesRecepcionMock));

            // Re-renderizar ambas vistas para actualizar la UI en vivo
            renderizarOffcanvas(claseId);
            renderizarClases();
        }
    };

    // 5. Lógica para Confirmar Reserva (Nueva Inscripción Modal)
    if (formInscribir) {
        formInscribir.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (claseSeleccionadaId !== null) {
                clasesRecepcionMock = JSON.parse(localStorage.getItem('clasesDB')) || [];
                const claseIndex = clasesRecepcionMock.findIndex(c => c.id === claseSeleccionadaId);
                
                if (claseIndex !== -1) {
                    const clase = clasesRecepcionMock[claseIndex];
                    const reservasActuales = clase.inscritos.length;
                    
                    if (reservasActuales < clase.capacidad_max) {
                        const dni = document.getElementById('dniInscripcion').value.trim();
                        
                        // Agregar al array directamente
                        clase.inscritos.push({
                            dni: dni,
                            nombre: 'Socio Nuevo (' + dni + ')'
                        });
                        
                        // Sobrescribir localStorage
                        localStorage.setItem('clasesDB', JSON.stringify(clasesRecepcionMock));
                        
                        // Actualizar UI
                        renderizarClases();
                        
                        // Ocultar Modal
                        const modalEl = document.getElementById('modalInscribirSocio');
                        const modalInstance = bootstrap.Modal.getInstance(modalEl);
                        if (modalInstance) {
                            modalInstance.hide();
                        }
                        
                        alert('Socio inscrito correctamente en la clase');
                        claseSeleccionadaId = null;
                    }
                }
            }
        });
    }

    // Inicialización
    mostrarFechaActual();
    renderizarClases();

});
