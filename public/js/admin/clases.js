// public/js/admin/clases.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Array de objetos (desde localStorage)
    let clasesMock = JSON.parse(localStorage.getItem('clasesDB')) || [];

    const contenedorClases = document.getElementById('contenedorClases');
    const formNuevaClase = document.getElementById('formNuevaClase');

    // Función para ver asistentes
    const verAsistentes = (nombreClase) => {
        // Obtener el nombre de la clase y asignarlo al título del modal
        const tituloModal = document.getElementById('nombreClaseModal');
        if (tituloModal) {
            tituloModal.textContent = nombreClase;
        }

        // Leer siempre los datos más recientes
        const clasesDB = JSON.parse(localStorage.getItem('clasesDB')) || [];
        const claseEncontrada = clasesDB.find(c => c.nombre === nombreClase);
        
        // Inyectar los nombres reales en la lista (ul)
        const listaAsistentes = document.getElementById('listaAsistentesModal');
        if (listaAsistentes) {
            if (claseEncontrada && claseEncontrada.inscritos && claseEncontrada.inscritos.length > 0) {
                listaAsistentes.innerHTML = claseEncontrada.inscritos.map((inscrito, index) => `
                    <li class="list-group-item px-0 py-3 ${index !== claseEncontrada.inscritos.length - 1 ? 'border-bottom' : 'border-bottom border-0'}">
                        <i class="fa-solid fa-user text-secondary me-3"></i> ${inscrito.nombre}
                    </li>
                `).join('');
            } else {
                listaAsistentes.innerHTML = `<li class="list-group-item px-0 py-3 text-muted">No hay inscritos.</li>`;
            }
        }

        // Mostrar el modal en pantalla usando la API nativa de Bootstrap
        const modalEl = document.getElementById('modalAsistentes');
        if (modalEl) {
            const modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.show();
        }
    };

    // 2. Renderizado Dinámico
    const renderizarClases = () => {
        if (!contenedorClases) return;

        // Limpiar contenedor
        contenedorClases.innerHTML = '';
        
        // Leer datos frescos desde localStorage
        const clasesDB = JSON.parse(localStorage.getItem('clasesDB')) || [];

        clasesDB.forEach(clase => {
            // Lógica de Aforo y Colores
            const reservasActuales = clase.inscritos ? clase.inscritos.length : (clase.reservas_actuales || 0);
            const porcentaje = Math.round((reservasActuales / clase.capacidad_max) * 100);
            const esLleno = porcentaje >= 100;

            const colorPrincipal = esLleno ? 'danger' : (porcentaje >= 80 ? 'warning' : 'primary');
            const textoBadge = esLleno ? 'Lleno' : 'Disponible';
            const colorBadge = esLleno ? 'danger' : 'success';

            // Crear el elemento de la tarjeta
            const card = document.createElement('div');
            card.className = 'col-12 col-md-6 col-xl-4';
            
            card.innerHTML = `
                <div class="card border-0 shadow-sm h-100 rounded-4">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                            <div class="bg-${colorPrincipal} bg-opacity-10 text-${colorPrincipal} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                                <i class="fa-solid ${clase.icono} fs-5"></i>
                            </div>
                            ${clase.nombre}
                        </h5>
                        <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge} border-opacity-25 rounded-pill px-3 py-1">${textoBadge}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.horario}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${clase.coach}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.salon}</p>
                        </div>
                        
                        <div class="mt-4">
                            <div class="d-flex justify-content-between align-items-end mb-1">
                                <span class="small fw-medium ${esLleno ? 'text-danger' : 'text-muted'}">Reservas actuales: ${reservasActuales} / ${clase.capacidad_max}</span>
                                <span class="small fw-bold text-${colorPrincipal}">${porcentaje}%</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-${colorPrincipal} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${reservasActuales}" aria-valuemin="0" aria-valuemax="${clase.capacidad_max}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 pb-4 pt-0">
                        <button class="btn btn-outline-${colorPrincipal} w-100 rounded-3 btn-asistentes" data-nombre="${clase.nombre}">
                            <i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes
                        </button>
                    </div>
                </div>
            `;
            
            contenedorClases.appendChild(card);
        });

        // Asignar event listeners a los nuevos botones de "Ver Asistentes"
        const botonesAsistentes = document.querySelectorAll('.btn-asistentes');
        botonesAsistentes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombreClase = e.currentTarget.getAttribute('data-nombre');
                verAsistentes(nombreClase);
            });
        });
    };

    // Renderizar la grilla inicial con los datos mockeados
    renderizarClases();

    // 3. Programar Nueva Clase (Lógica del formulario)
    if (formNuevaClase) {
        formNuevaClase.addEventListener('submit', (e) => {
            e.preventDefault();

            // Recopilar datos
            const nombre = document.getElementById('nombreClase').value;
            const selectEntrenador = document.getElementById('entrenadorClase');
            const coach = selectEntrenador.options[selectEntrenador.selectedIndex].text;
            const fechaHora = document.getElementById('fechaHoraClase').value; 
            const capacidad = parseInt(document.getElementById('capacidadClase').value);
            const salon = document.getElementById('salonClase').value;

            // Formatear la fecha ingresada (YYYY-MM-DDTHH:MM) a un texto legible
            let formattedDate = 'Por definir';
            if (fechaHora) {
                const dateObj = new Date(fechaHora);
                formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth()+1).padStart(2, '0')}/${dateObj.getFullYear()}, ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')} hrs`;
            }

            // Agregar nueva clase
            const nuevaClase = {
                id: Date.now(),
                nombre: nombre,
                horario: formattedDate,
                coach: coach,
                salon: salon,
                capacidad_max: capacidad,
                icono: 'fa-calendar-check',
                bg_icono: 'bg-primary',
                text_icono: 'text-primary',
                inscritos: [] // Inicia sin reservas
            };

            // Leer de localStorage, actualizar y guardar
            const clasesActuales = JSON.parse(localStorage.getItem('clasesDB')) || [];
            clasesActuales.push(nuevaClase);
            localStorage.setItem('clasesDB', JSON.stringify(clasesActuales));

            // Re-renderizar la grilla para mostrar la nueva tarjeta
            renderizarClases();

            // Ocultar modal usando API de Bootstrap 5
            const modalEl = document.getElementById('modalNuevaClase');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Limpiar el formulario
            formNuevaClase.reset();
        });
    }
});
