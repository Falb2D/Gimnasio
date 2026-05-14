// public/js/admin/mantenimiento.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Inicialización de DB en localStorage
    if (!localStorage.getItem('equiposDB')) {
        const equiposMock = [
            { codigo: 'EQ-001', nombre: 'Cinta de Correr ProForm', serie: 'PF-2023X', ubicacion: 'Zona Cardio', estado: 'Operativo', icono: 'fa-person-running' },
            { codigo: 'EQ-014', nombre: 'Bicicleta Estática LifeFitness', serie: 'LF-C1', ubicacion: 'Sala Spinning', estado: 'En Mantenimiento', icono: 'fa-bicycle' },
            { codigo: 'EQ-032', nombre: 'Máquina de Poleas Cruzadas', serie: 'MG-300', ubicacion: 'Zona de Fuerza', estado: 'Fuera de Servicio', icono: 'fa-dumbbell' },
            { codigo: 'EQ-045', nombre: 'Prensa de Piernas Hammer Strength', serie: 'HS-LEG1', ubicacion: 'Zona de Fuerza', estado: 'Operativo', icono: 'fa-dumbbell' },
            { codigo: 'EQ-056', nombre: 'Elíptica Precor', serie: 'PR-E800', ubicacion: 'Zona Cardio', estado: 'Operativo', icono: 'fa-person-walking' }
        ];
        localStorage.setItem('equiposDB', JSON.stringify(equiposMock));
    }

    if (!localStorage.getItem('incidenciasDB')) {
        localStorage.setItem('incidenciasDB', JSON.stringify([]));
    }

    renderizarTabla();
    actualizarResumen();
    llenarSelectEquipos();

    const formIncidencia = document.getElementById('formIncidencia');
    if (formIncidencia) {
        formIncidencia.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectEl = document.getElementById('equipoAfectado');
            const codigo = selectEl.value;
            
            // Capturar datos del formulario
            const radioTipoMant = document.querySelector('input[name="tipoMantenimiento"]:checked');
            const tipoMant = radioTipoMant ? radioTipoMant.value : 'No especificado';
            
            const radioEstado = document.querySelector('input[name="estadoIncidencia"]:checked');
            const nuevoEstado = radioEstado ? radioEstado.value : 'En Mantenimiento';
            
            const desc = document.getElementById('descProblema').value;
            const responsable = document.getElementById('responsableMant').value;
            
            // Fecha actual
            const hoy = new Date();
            const fecha = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;

            // Actualizar estado en equiposDB
            let equiposDB = JSON.parse(localStorage.getItem('equiposDB')) || [];
            const index = equiposDB.findIndex(eq => eq.codigo === codigo);
            if (index !== -1) {
                equiposDB[index].estado = nuevoEstado;
                localStorage.setItem('equiposDB', JSON.stringify(equiposDB));
            }

            // Guardar en incidenciasDB
            let incidenciasDB = JSON.parse(localStorage.getItem('incidenciasDB')) || [];
            incidenciasDB.unshift({
                codigo: codigo,
                fecha: fecha,
                tipo: tipoMant,
                descripcion: desc,
                responsable: responsable
            });
            localStorage.setItem('incidenciasDB', JSON.stringify(incidenciasDB));

            // Reflejar cambios
            renderizarTabla();
            actualizarResumen();

            // Cerrar panel lateral
            const offcanvasEl = document.getElementById('offcanvasIncidencia');
            let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (!offcanvasInstance) {
                offcanvasInstance = new bootstrap.Offcanvas(offcanvasEl);
            }
            offcanvasInstance.hide();
            
            // Limpiar y notificar
            formIncidencia.reset();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'Incidencia registrada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#ffc107',
                    confirmButtonText: 'Aceptar'
                });
            } else {
                alert('Incidencia registrada correctamente');
            }
        });
    }
});

function renderizarTabla() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let equiposDB = JSON.parse(localStorage.getItem('equiposDB')) || [];
    
    equiposDB.forEach(equipo => {
        let badgeClass = '';
        let badgeIcon = '';
        
        switch(equipo.estado) {
            case 'Operativo':
                badgeClass = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
                badgeIcon = 'fa-check';
                break;
            case 'En Mantenimiento':
                badgeClass = 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
                badgeIcon = 'fa-screwdriver-wrench';
                break;
            case 'Fuera de Servicio':
                badgeClass = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                badgeIcon = 'fa-ban';
                break;
        }

        // Botón operativo (solo si no está operativo)
        const btnOperativoHTML = equipo.estado !== 'Operativo' 
            ? `<button class="btn btn-sm btn-outline-success rounded ms-1 btn-operativo" title="Marcar Operativo"><i class="fa-solid fa-check"></i></button>`
            : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 text-gray-800 fw-medium">${equipo.codigo}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-light rounded p-2 me-3 border">
                        <i class="fa-solid ${equipo.icono} text-secondary fs-5" style="width:24px; text-align:center;"></i>
                    </div>
                    <div>
                        <span class="fw-semibold text-gray-800 d-block">${equipo.nombre}</span>
                        <small class="text-muted">Serie: ${equipo.serie}</small>
                    </div>
                </div>
            </td>
            <td class="text-gray-800">${equipo.ubicacion}</td>
            <td><span class="badge ${badgeClass} px-2 py-1 rounded-pill"><i class="fa-solid ${badgeIcon} me-1"></i> ${equipo.estado}</span></td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-light text-secondary rounded btn-historial" title="Ver Historial"><i class="fa-solid fa-clock-rotate-left"></i></button>
                ${btnOperativoHTML}
            </td>
        `;
        
        // Evento para Ver Historial
        tr.querySelector('.btn-historial').addEventListener('click', () => {
            verHistorial(equipo.codigo);
        });

        // Evento para Marcar Operativo
        const btnOperativo = tr.querySelector('.btn-operativo');
        if (btnOperativo) {
            btnOperativo.addEventListener('click', () => {
                marcarOperativo(equipo.codigo);
            });
        }
        
        tbody.appendChild(tr);
    });
}

function actualizarResumen() {
    let equiposDB = JSON.parse(localStorage.getItem('equiposDB')) || [];
    
    const operativos = equiposDB.filter(e => e.estado === 'Operativo').length;
    const enMantenimiento = equiposDB.filter(e => e.estado === 'En Mantenimiento').length;
    const fueraDeServicio = equiposDB.filter(e => e.estado === 'Fuera de Servicio').length;

    const countOperativos = document.getElementById('countOperativos');
    const countMantenimiento = document.getElementById('countMantenimiento');
    const countFuera = document.getElementById('countFuera');

    if (countOperativos) countOperativos.textContent = operativos;
    if (countMantenimiento) countMantenimiento.textContent = enMantenimiento;
    if (countFuera) countFuera.textContent = fueraDeServicio;
}

function llenarSelectEquipos() {
    const select = document.getElementById('equipoAfectado');
    if (!select) return;
    
    select.innerHTML = '<option value="" selected disabled>Buscar y seleccionar equipo...</option>';
    
    let equiposDB = JSON.parse(localStorage.getItem('equiposDB')) || [];
    equiposDB.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.codigo;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        select.appendChild(option);
    });
}

function marcarOperativo(codigo) {
    let equiposDB = JSON.parse(localStorage.getItem('equiposDB')) || [];
    const index = equiposDB.findIndex(eq => eq.codigo === codigo);
    
    if (index !== -1) {
        equiposDB[index].estado = 'Operativo';
        localStorage.setItem('equiposDB', JSON.stringify(equiposDB));
        
        // Re-renderizar tabla y resumen
        renderizarTabla();
        actualizarResumen();
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¡Actualizado!',
                text: 'Equipo marcado como operativo',
                icon: 'success',
                confirmButtonColor: '#198754' // Verde
            });
        } else {
            alert('Equipo marcado como operativo');
        }
    }
}

function verHistorial(codigo) {
    let incidenciasDB = JSON.parse(localStorage.getItem('incidenciasDB')) || [];
    const historial = incidenciasDB.filter(inc => inc.codigo === codigo);
    
    if (historial.length > 0) {
        let listHTML = '<ul class="list-group text-start mt-3">';
        historial.forEach(inc => {
            listHTML += `
                <li class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 fw-bold">${inc.tipo}</h6>
                        <small class="text-muted">${inc.fecha}</small>
                    </div>
                    <p class="mb-1 small">${inc.descripcion}</p>
                    <small class="text-muted">Técnico: ${inc.responsable || 'No especificado'}</small>
                </li>
            `;
        });
        listHTML += '</ul>';
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: `Historial: ${codigo}`,
                html: listHTML,
                icon: 'info',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Cerrar'
            });
        }
    } else {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Sin incidencias',
                text: 'Este equipo no tiene incidencias registradas',
                icon: 'info',
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Entendido'
            });
        } else {
            alert('Este equipo no tiene incidencias registradas');
        }
    }
}
