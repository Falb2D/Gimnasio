// Mock Data para Planes iniciales si no hay localStorage
const planesIniciales = [
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
    // Inicializar planesDB en localStorage si no existe
    if (!localStorage.getItem('planesDB')) {
        localStorage.setItem('planesDB', JSON.stringify(planesIniciales));
    }

    // 1. Renderizar Tablas Iniciales
    renderizarPlanes();
    renderizarUsuarios();

    // 2. Manejar Formulario de Nuevo Staff (Modal)
    const formNuevoStaff = document.getElementById('formNuevoStaff');
    if (formNuevoStaff) {
        formNuevoStaff.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const nombres = document.getElementById('nombreStaff').value;
            const email = document.getElementById('emailStaff').value;
            const password = document.getElementById('passStaff').value; 
            const rolValue = document.getElementById('rolStaff').value;
            
            let rolFormateado = '';
            if (rolValue === 'admin') rolFormateado = 'Administrador';
            else if (rolValue === 'reception') rolFormateado = 'Recepcionista';
            else if (rolValue === 'trainer') rolFormateado = 'Entrenador';
            
            const nuevoUsuario = {
                nombres: nombres,
                email: email,
                rol: rolFormateado,
                estado: 'Activo' 
            };
            
            usuariosMock.push(nuevoUsuario);
            renderizarUsuarios();
            
            const modalEl = document.getElementById('modalNuevoStaff');
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalEl);
            }
            modalInstance.hide();
            
            formNuevoStaff.reset();
            if(typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Éxito', text: 'Usuario creado correctamente', icon: 'success' });
            } else {
                alert('Usuario creado correctamente');
            }
        });
    }

    // 2.1 Manejar Formulario de Crear Plan (Modal)
    const formCrearPlan = document.getElementById('formCrearPlan');
    if (formCrearPlan) {
        formCrearPlan.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const nombre = document.getElementById('nombrePlan').value;
            const duracion = parseInt(document.getElementById('duracionPlan').value);
            const precio = parseFloat(document.getElementById('precioPlan').value);
            
            const nuevoPlan = {
                nombre: nombre,
                duracion: duracion,
                precio: precio,
                estado: 'Activo' 
            };
            
            let planesDB = JSON.parse(localStorage.getItem('planesDB')) || [];
            planesDB.push(nuevoPlan);
            localStorage.setItem('planesDB', JSON.stringify(planesDB));
            
            renderizarPlanes();
            
            const modalEl = document.getElementById('modalCrearPlan');
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalEl);
            }
            modalInstance.hide();
            
            formCrearPlan.reset();
            if(typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Éxito', text: 'Plan creado exitosamente', icon: 'success' });
            } else {
                alert('Plan creado exitosamente');
            }
        });
    }

    // 3. Manejar Formulario de Datos del Gimnasio
    const formDatos = document.getElementById('formDatosGimnasio');
    if (formDatos) {
        formDatos.addEventListener('submit', function(e) {
            e.preventDefault();
            if(typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Éxito', text: 'Datos del negocio actualizados', icon: 'success' });
            } else {
                alert('Datos del negocio actualizados exitosamente');
            }
        });
    }
});

// Función para pintar la tabla de Planes de Membresía
function renderizarPlanes() {
    const tbody = document.getElementById('tablaPlanesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let planesDB = JSON.parse(localStorage.getItem('planesDB')) || [];
    
    planesDB.forEach((plan, index) => {
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
                <button class="btn btn-sm btn-outline-primary rounded me-1" onclick="editarPrecioPlan('${plan.nombre}')" title="Editar Precio">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleEstadoPlan(${index})" title="Cambiar Estado">
                    <i class="fa-solid fa-rotate"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editarPrecioPlan = function(nombrePlan) {
    let planesDB = JSON.parse(localStorage.getItem('planesDB')) || [];
    const index = planesDB.findIndex(p => p.nombre === nombrePlan);

    if (index === -1) return;
    const plan = planesDB[index];

    Swal.fire({
        title: 'Editar Precio',
        text: `Ingrese el nuevo precio para el plan ${nombrePlan}`,
        input: 'number',
        inputValue: plan.precio,
        inputAttributes: {
            step: '0.01',
            min: '0'
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0d6efd',
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, ingrese un precio válido';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            planesDB[index].precio = parseFloat(result.value);
            localStorage.setItem('planesDB', JSON.stringify(planesDB));
            
            renderizarPlanes();
            
            Swal.fire({
                title: '¡Actualizado!',
                text: 'El precio del plan ha sido modificado.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    });
}

// Función para pintar la tabla de Usuarios del Sistema
function renderizarUsuarios() {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usuariosMock.forEach(usuario => {
        let badgeClass = '';
        if (usuario.rol === 'Administrador') {
            badgeClass = 'bg-dark';
        } else if (usuario.rol === 'Recepcionista') {
            badgeClass = 'bg-info text-dark';
        } else if (usuario.rol === 'Entrenador') {
            badgeClass = 'bg-primary';
        } else {
            badgeClass = 'bg-secondary';
        }
        
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
    let planesDB = JSON.parse(localStorage.getItem('planesDB')) || [];
    if (planesDB[index]) {
        planesDB[index].estado = planesDB[index].estado === 'Activo' ? 'Inactivo' : 'Activo';
        localStorage.setItem('planesDB', JSON.stringify(planesDB));
        renderizarPlanes();
    }
};
