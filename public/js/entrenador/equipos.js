document.addEventListener('DOMContentLoaded', () => {
    inicializarEquipos();
    renderizarEquipos();
    llenarSelectEquipos();
    
    const formReporte = document.getElementById('formReporteIncidencia');
    if(formReporte) {
        formReporte.addEventListener('submit', procesarReporte);
    }
});

// Sincronización y Corrección
function inicializarEquipos() {
    if (!localStorage.getItem('equiposDB')) {
        const equiposPrueba = [
            { codigo: 'M-001', nombre: 'Cinta de Correr Pro 9000', ubicacion: 'Salón Cardio 1', estado: 'Operativo' },
            { codigo: 'M-014', nombre: 'Máquina de Remo Concept2', ubicacion: 'Zona Funcional', estado: 'Operativo' },
            { codigo: 'M-005', nombre: 'Bicicleta Elíptica LifeFitness', ubicacion: 'Salón Cardio 2', estado: 'En Mantenimiento' },
            { codigo: 'M-022', nombre: 'Prensa de Piernas 45°', ubicacion: 'Zona Pesas Libres', estado: 'Fuera de Servicio' }
        ];
        localStorage.setItem('equiposDB', JSON.stringify(equiposPrueba));
    } else {
        // Corrección del error tipográfico si la DB ya existía con el 'Â'
        let equipos = JSON.parse(localStorage.getItem('equiposDB'));
        let modificado = false;
        equipos = equipos.map(eq => {
            if (eq.nombre.includes('Prensa de Piernas') && eq.nombre.includes('Â°')) {
                eq.nombre = 'Prensa de Piernas 45°';
                modificado = true;
            }
            return eq;
        });
        if (modificado) {
            localStorage.setItem('equiposDB', JSON.stringify(equipos));
        }
    }
}

// Renderizar Tabla
function renderizarEquipos() {
    const tbody = document.getElementById('tbodyEquipos');
    if (!tbody) return;
    
    tbody.innerHTML = ''; // Limpiamos la tabla
    const equipos = JSON.parse(localStorage.getItem('equiposDB')) || [];
    
    equipos.forEach(eq => {
        let badgeHtml = '';
        if (eq.estado === 'Operativo') {
            badgeHtml = '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill">Operativo</span>';
        } else if (eq.estado === 'En Mantenimiento') {
            badgeHtml = '<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill">En Mantenimiento</span>';
        } else {
            badgeHtml = '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill">Fuera de Servicio</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-medium text-gray-800">${eq.codigo}</td>
            <td class="fw-semibold text-gray-800">${eq.nombre}</td>
            <td class="text-muted"><i class="fa-solid fa-location-dot me-1 text-secondary opacity-50"></i> ${eq.ubicacion}</td>
            <td class="pe-4 text-center">${badgeHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Llenar el Select Dinámicamente
function llenarSelectEquipos() {
    const select = document.getElementById('selectEquipo');
    if (!select) return;
    
    select.innerHTML = '<option value="" selected disabled>Seleccione el equipo...</option>';
    const equipos = JSON.parse(localStorage.getItem('equiposDB')) || [];
    
    equipos.forEach(eq => {
        const option = document.createElement('option');
        option.value = eq.codigo;
        option.textContent = `${eq.codigo} - ${eq.nombre}`;
        select.appendChild(option);
    });
}

// Procesar Reporte (Submit)
function procesarReporte(e) {
    e.preventDefault();
    
    const codigo = document.getElementById('selectEquipo').value;
    const tipo = document.getElementById('selectTipoFalla').value;
    const desc = document.getElementById('descFalla').value;
    
    let equipos = JSON.parse(localStorage.getItem('equiposDB')) || [];
    
    // Buscar el equipo y actualizar su estado
    const eqIndex = equipos.findIndex(eq => eq.codigo === codigo);
    if (eqIndex !== -1) {
        if (tipo === 'Correctivo') {
            equipos[eqIndex].estado = 'Fuera de Servicio';
        } else if (tipo === 'Preventivo') {
            equipos[eqIndex].estado = 'En Mantenimiento';
        }
        
        // Guardar el array actualizado
        localStorage.setItem('equiposDB', JSON.stringify(equipos));
        
        // Cierra el modal de Bootstrap
        const modalEl = document.getElementById('modalReporte');
        if (typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        
        // Limpia el formulario
        e.target.reset();
        
        // Muestra el alert de éxito
        alert('Falla reportada exitosamente');
        
        // Vuelve a renderizar la tabla al instante
        renderizarEquipos();
    }
}
