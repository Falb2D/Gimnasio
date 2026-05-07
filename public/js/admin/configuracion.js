// Mock Data para Planes
let planesMock = [
    { nombre: 'Mensual Básico', duracion: 30, precio: 80.00, estado: 'Activo' },
    { nombre: 'Mensual Ilimitado', duracion: 30, precio: 120.00, estado: 'Activo' },
    { nombre: 'Trimestral VIP', duracion: 90, precio: 300.00, estado: 'Activo' },
    { nombre: 'Promo Verano 2025', duracion: 60, precio: 150.00, estado: 'Inactivo' }
];

// Mock Data para Usuarios
let usuariosMock = [
    { nombres: 'Fabricio Administrador', email: 'admin@fitfab.com', rol: 'Administrador', estado: 'Activo' },
    { nombres: 'Lucía Recepción', email: 'recepcion@fitfab.com', rol: 'Recepcionista', estado: 'Activo' },
    { nombres: 'Marcos Entrenador', email: 'marcos.trainer@fitfab.com', rol: 'Entrenador', estado: 'Activo' }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizar Tablas Iniciales
    renderizarPlanes();
    renderizarUsuarios();

    // 2. Manejar Formulario de Nuevo Staff (Modal)
    const formNuevoStaff = document.getElementById('formNuevoStaff');
    if (formNuevoStaff) {
        formNuevoStaff.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitar recarga de página
            
            // Recolectar valores
            const nombres = document.getElementById('nombreStaff').value;
            const email = document.getElementById('emailStaff').value;
            const password = document.getElementById('passStaff').value; // Se simula encriptación internamente
            const rolValue = document.getElementById('rolStaff').value;
            
            // Mapear el valor del select al texto real del rol
            let rolFormateado = '';
            if (rolValue === 'admin') rolFormateado = 'Administrador';
            else if (rolValue === 'reception') rolFormateado = 'Recepcionista';
            else if (rolValue === 'trainer') rolFormateado = 'Entrenador';
            
            // Crear nuevo objeto usuario
            const nuevoUsuario = {
                nombres: nombres,
                email: email,
                rol: rolFormateado,
                estado: 'Activo' // Por defecto activo
            };
            
            // Añadir al mock y renderizar nuevamente
            usuariosMock.push(nuevoUsuario);
            renderizarUsuarios();
            
            // Cerrar el modal con Bootstrap 5 API
            const modalEl = document.getElementById('modalNuevoStaff');
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalEl);
            }
            modalInstance.hide();
            
            // Limpiar formulario y mostrar alerta
            formNuevoStaff.reset();
            alert('Usuario creado correctamente');
        });
    }

    // 2.1 Manejar Formulario de Crear Plan (Modal)
    const formCrearPlan = document.getElementById('formCrearPlan');
    if (formCrearPlan) {
        formCrearPlan.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitar recarga de página
            
            // Recolectar valores
            const nombre = document.getElementById('nombrePlan').value;
            const duracion = parseInt(document.getElementById('duracionPlan').value);
            const precio = parseFloat(document.getElementById('precioPlan').value);
            
            // Crear nuevo objeto plan
            const nuevoPlan = {
                nombre: nombre,
                duracion: duracion,
                precio: precio,
                estado: 'Activo' // Por defecto activo
            };
            
            // Añadir al mock y renderizar nuevamente
            planesMock.push(nuevoPlan);
            renderizarPlanes();
            
            // Cerrar el modal con Bootstrap 5 API
            const modalEl = document.getElementById('modalCrearPlan');
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalEl);
            }
            modalInstance.hide();
            
            // Limpiar formulario y mostrar alerta
            formCrearPlan.reset();
            alert('Plan creado exitosamente');
        });
    }

    // 3. Manejar Formulario de Datos del Gimnasio
    const formDatos = document.getElementById('formDatosGimnasio');
    if (formDatos) {
        formDatos.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simula petición exitosa al servidor
            alert('Datos del negocio actualizados exitosamente');
        });
    }
});

// Función para pintar la tabla de Planes de Membresía
function renderizarPlanes() {
    const tbody = document.getElementById('tablaPlanesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    planesMock.forEach((plan, index) => {
        let badgeHTML = '';
        if (plan.estado === 'Activo') {
            badgeHTML = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>`;
        } else {
            badgeHTML = `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>`;
        }
        
        const styleClass = plan.estado === 'Activo' ? 'text-gray-800' : 'text-muted';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-medium ${styleClass}">${plan.nombre}</td>
            <td class="text-center ${styleClass}">${plan.duracion}</td>
            <td class="text-end fw-bold ${styleClass}">S/ ${plan.precio.toFixed(2)}</td>
            <td class="text-center">${badgeHTML}</td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleEstadoPlan(${index})" title="Cambiar Estado">
                    <i class="fa-solid fa-rotate"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para pintar la tabla de Usuarios del Sistema
function renderizarUsuarios() {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usuariosMock.forEach(usuario => {
        let badgeClass = '';
        // Asignar color de badge según el rol solicitado
        if (usuario.rol === 'Administrador') {
            badgeClass = 'bg-dark';
        } else if (usuario.rol === 'Recepcionista') {
            badgeClass = 'bg-info text-dark';
        } else if (usuario.rol === 'Entrenador') {
            badgeClass = 'bg-primary';
        } else {
            badgeClass = 'bg-secondary';
        }
        
        // Icono de estado
        let statusIcon = '';
        if (usuario.estado === 'Activo') {
            statusIcon = '<i class="fa-solid fa-circle-check text-success fs-5"></i>';
        } else {
            statusIcon = '<i class="fa-solid fa-circle-xmark text-danger fs-5"></i>';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-medium text-gray-800">${usuario.nombres}</td>
            <td class="text-muted">${usuario.email}</td>
            <td class="text-center"><span class="badge ${badgeClass} px-2 py-1">${usuario.rol}</span></td>
            <td class="pe-4 text-center">${statusIcon}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Función global para cambiar el estado de un plan
window.toggleEstadoPlan = function(index) {
    if (planesMock[index]) {
        planesMock[index].estado = planesMock[index].estado === 'Activo' ? 'Inactivo' : 'Activo';
        renderizarPlanes(); // Re-renderizar la tabla para mostrar el cambio visual
    }
};
