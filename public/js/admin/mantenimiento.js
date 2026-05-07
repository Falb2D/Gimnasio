// Mock Data
let equiposMock = [
    { codigo: 'EQ-001', nombre: 'Cinta de Correr ProForm', serie: 'PF-2023X', ubicacion: 'Zona Cardio', estado: 'Operativo', icono: 'fa-person-running' },
    { codigo: 'EQ-014', nombre: 'Bicicleta Estática LifeFitness', serie: 'LF-C1', ubicacion: 'Sala Spinning', estado: 'En Mantenimiento', icono: 'fa-bicycle' },
    { codigo: 'EQ-032', nombre: 'Máquina de Poleas Cruzadas', serie: 'MG-300', ubicacion: 'Zona de Fuerza', estado: 'Fuera de Servicio', icono: 'fa-dumbbell' },
    { codigo: 'EQ-045', nombre: 'Prensa de Piernas Hammer Strength', serie: 'HS-LEG1', ubicacion: 'Zona de Fuerza', estado: 'Operativo', icono: 'fa-dumbbell' },
    { codigo: 'EQ-056', nombre: 'Elíptica Precor', serie: 'PR-E800', ubicacion: 'Zona Cardio', estado: 'Operativo', icono: 'fa-person-walking' }
];

document.addEventListener('DOMContentLoaded', () => {
    renderizarTabla();
    actualizarResumen();
    llenarSelectEquipos();

    const formIncidencia = document.getElementById('formIncidencia');
    if (formIncidencia) {
        formIncidencia.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectEl = document.getElementById('equipoAfectado');
            const codigo = selectEl.value;

            // Actualizar estado en mock
            const equipo = equiposMock.find(eq => eq.codigo === codigo);
            if (equipo) {
                equipo.estado = 'En Mantenimiento';
            }

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
            alert('Incidencia registrada correctamente');
        });
    }
});

function renderizarTabla() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    equiposMock.forEach(equipo => {
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
            </td>
        `;
        
        tr.querySelector('.btn-historial').addEventListener('click', () => {
            alert('Mostrando historial del equipo...');
        });
        
        tbody.appendChild(tr);
    });
}

function actualizarResumen() {
    const operativos = equiposMock.filter(e => e.estado === 'Operativo').length;
    const enMantenimiento = equiposMock.filter(e => e.estado === 'En Mantenimiento').length;
    const fueraDeServicio = equiposMock.filter(e => e.estado === 'Fuera de Servicio').length;

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
    
    equiposMock.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.codigo;
        option.textContent = `${equipo.codigo} - ${equipo.nombre}`;
        select.appendChild(option);
    });
}
