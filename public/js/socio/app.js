document.addEventListener('DOMContentLoaded', () => {
    // 1. Simulación de Usuario Logueado (Mock Data)
    const socioActual = {
        nombre: 'Carlos Mendoza',
        numero: '12345',
        plan: 'Mensual Ilimitado',
        vencimiento: '15 Jun 2026',
        estado: 'Activo' // Prueba cambiándolo a 'Moroso'
    };

    // 2. Enrutador básico para ejecutar lógica según la vista actual
    const path = window.location.pathname;

    if (path.includes('socio.html') || path.endsWith('/socio/')) {
        renderizarMiQR(socioActual);
    } else if (path.includes('socio_clases.html')) {
        renderizarClases(socioActual);
    } else if (path.includes('socio_pagos.html')) {
        renderizarPagos(socioActual);
    }
});

// ==========================================
// LÓGICA VISTA: MI QR
// ==========================================
function renderizarMiQR(socio) {
    const badgeEstado = document.getElementById('badgeEstado');
    const qrContainer = document.getElementById('qrcode');
    
    if (!qrContainer || !badgeEstado) return;

    if (socio.estado === 'Activo') {
        badgeEstado.innerHTML = `<span class="fw-bold text-success fs-6"><i class="fa-solid fa-circle-check me-2"></i> Membresía Activa</span>`;
        badgeEstado.className = 'd-inline-block bg-success bg-opacity-10 px-4 py-2 rounded-pill border border-success border-opacity-25 mb-3 shadow-sm';
        
        qrContainer.innerHTML = '';
        if(typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: `QR-SOCIO-${socio.numero}-${socio.estado}`,
                width: 220,
                height: 220,
                colorDark : "#1e293b",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    } else {
        badgeEstado.innerHTML = `<span class="fw-bold text-danger fs-6"><i class="fa-solid fa-triangle-exclamation me-2"></i> Membresía Vencida</span>`;
        badgeEstado.className = 'd-inline-block bg-danger bg-opacity-10 px-4 py-2 rounded-pill border border-danger border-opacity-25 mb-3 shadow-sm';
        
        qrContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center p-4 text-danger" style="height: 220px;">
                <i class="fa-solid fa-ban fs-1 mb-3"></i>
                <h5 class="fw-bold">Acceso Denegado</h5>
                <small class="text-center text-muted">Regulariza tu pago en recepción para recuperar el acceso.</small>
            </div>
        `;
    }
}

// ==========================================
// LÓGICA VISTA: RESERVAR CLASES
// ==========================================
function renderizarClases(socio) {
    const contenedor = document.getElementById('contenedorClases');
    if (!contenedor) return;

    let clasesDB = JSON.parse(localStorage.getItem('clasesDB'));
    
    if (!clasesDB) {
        clasesDB = [
            { id: 1, nombre: 'Yoga Integral', capacidad: 20, inscritos: ['Juan', 'Ana', 'Luisa', 'Marta', 'Leo'] },
            { id: 2, nombre: 'CrossFit WOD', capacidad: 20, inscritos: ['Pedro', 'Rosa', 'Luis', 'Alberto', 'Maria', 'Jose', 'Diego', 'Ana'] },
            { id: 3, nombre: 'Spinning Pro', capacidad: 25, inscritos: Array.from({length: 25}, (_, i) => `Alumno ${i}`) } // Llena
        ];
        localStorage.setItem('clasesDB', JSON.stringify(clasesDB));
    }

    contenedor.innerHTML = '';

    clasesDB.forEach(clase => {
        if (!clase.inscritos) clase.inscritos = [];
        
        const lugaresDisponibles = clase.capacidad - clase.inscritos.length;
        const yaEstaInscrito = clase.inscritos.includes(socio.nombre);
        
        let botonHtml = '';
        if (yaEstaInscrito) {
            botonHtml = `<button class="btn btn-outline-danger w-100 fw-bold py-3 shadow-sm" onclick="cancelarReserva(${clase.id}, '${socio.nombre}', '${clase.nombre}')"><i class="fa-solid fa-xmark me-2"></i> Cancelar Reserva</button>`;
        } else if (lugaresDisponibles <= 0) {
            botonHtml = `<button class="btn btn-secondary w-100 fw-bold disabled py-3"><i class="fa-solid fa-ban me-2"></i> Clase Llena</button>`;
        } else {
            botonHtml = `<button class="btn btn-primary w-100 fw-bold py-3 shadow-sm" onclick="reservarLugar(${clase.id}, '${socio.nombre}', '${clase.nombre}')">Reservar mi lugar</button>`;
        }

        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4 mb-4';
        
        // Estilos para tarjeta de clase llena
        const cardOpacity = lugaresDisponibles <= 0 ? 'opacity-75 bg-light' : '';
        const badgeBg = lugaresDisponibles <= 0 ? 'bg-secondary text-secondary border-secondary' : 'bg-primary text-primary border-primary';
        const placesBg = lugaresDisponibles <= 0 ? 'bg-danger bg-opacity-10 border-danger' : 'bg-light border-secondary border-opacity-10';
        const placesText = lugaresDisponibles <= 0 ? 'text-danger' : 'text-gray-800';
        const numbersBg = lugaresDisponibles <= 0 ? 'bg-white text-danger shadow-sm' : 'bg-success bg-opacity-10 text-success';

        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${cardOpacity}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="badge ${badgeBg} bg-opacity-10 mb-2 rounded-pill px-3 py-1 border border-opacity-25">FITFAB Studio</span>
                            <h5 class="fw-bold text-gray-800 mb-1">${clase.nombre}</h5>
                            <p class="text-muted small mb-0"><i class="fa-solid fa-user-ninja me-1 text-secondary"></i> Coach Fitfab</p>
                        </div>
                        <div class="bg-light rounded p-2 text-center border shadow-sm">
                            <span class="d-block fw-bold text-primary fs-5 lh-1">--:--</span>
                            <span class="d-block text-muted mt-1" style="font-size: 0.65rem; font-weight: 700;">HRS</span>
                        </div>
                    </div>
                    
                    <div class="${placesBg} rounded-3 p-3 mb-4 border">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold ${placesText} small"><i class="fa-solid fa-users ${lugaresDisponibles <= 0 ? 'text-danger' : 'text-primary'} me-2"></i> Lugares disponibles</span>
                            <span class="fw-bold ${numbersBg} px-2 py-1 rounded">${lugaresDisponibles} / ${clase.capacidad}</span>
                        </div>
                    </div>
                    
                    ${botonHtml}
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

window.reservarLugar = function(idClase, nombreSocio, nombreClase) {
    // Si SweetAlert2 está disponible, mostrar confirmación
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¡Reserva Confirmada!',
            html: `Tu lugar en <b>${nombreClase}</b> ha sido asegurado con éxito.`,
            icon: 'success',
            confirmButtonText: 'Genial, gracias',
            confirmButtonColor: '#0d6efd',
            customClass: { popup: 'rounded-4 shadow-lg' }
        }).then(() => {
            ejecutarReserva(idClase, nombreSocio);
        });
    } else {
        alert(`Reserva confirmada para ${nombreClase}`);
        ejecutarReserva(idClase, nombreSocio);
    }
};

function ejecutarReserva(idClase, nombreSocio) {
    let clasesDB = JSON.parse(localStorage.getItem('clasesDB')) || [];
    const index = clasesDB.findIndex(c => c.id === idClase);
    
    if (index !== -1) {
        if (!clasesDB[index].inscritos) clasesDB[index].inscritos = [];
        const lugaresDisponibles = clasesDB[index].capacidad - clasesDB[index].inscritos.length;
        
        if (lugaresDisponibles > 0 && !clasesDB[index].inscritos.includes(nombreSocio)) {
            clasesDB[index].inscritos.push(nombreSocio);
            localStorage.setItem('clasesDB', JSON.stringify(clasesDB));
            renderizarClases({ nombre: nombreSocio });
        }
    }
}

window.cancelarReserva = function(idClase, nombreSocio, nombreClase) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¿Cancelar Reserva?',
            html: `¿Estás seguro de que deseas cancelar tu reserva para <b>${nombreClase}</b>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener',
            customClass: { popup: 'rounded-4 shadow-lg' }
        }).then((result) => {
            if (result.isConfirmed) {
                ejecutarCancelacion(idClase, nombreSocio);
                Swal.fire({
                    title: '¡Cancelada!',
                    text: 'Tu cupo ha sido liberado.',
                    icon: 'success',
                    confirmButtonColor: '#0d6efd',
                    customClass: { popup: 'rounded-4 shadow-lg' }
                });
            }
        });
    } else {
        if (confirm('¿Estás seguro de que deseas cancelar tu reserva para esta clase?')) {
            ejecutarCancelacion(idClase, nombreSocio);
        }
    }
};

function ejecutarCancelacion(idClase, nombreSocio) {
    let clasesDB = JSON.parse(localStorage.getItem('clasesDB')) || [];
    const index = clasesDB.findIndex(c => c.id === idClase);
    
    if (index !== -1 && clasesDB[index].inscritos) {
        clasesDB[index].inscritos = clasesDB[index].inscritos.filter(nombre => nombre !== nombreSocio);
        localStorage.setItem('clasesDB', JSON.stringify(clasesDB));
        renderizarClases({ nombre: nombreSocio, estado: 'Activo' });
    }
}

// ==========================================
// LÓGICA VISTA: MIS PAGOS
// ==========================================
function renderizarPagos(socio) {
    const listGroup = document.getElementById('historialPagosList');
    if (!listGroup) return;

    const historial = [
        { id: 'B001-004523', fecha: '15 May 2026', metodo: 'Yape / Plin', icono: 'fa-mobile-screen-button', textClass: 'text-primary', monto: 'S/ 120.00' },
        { id: 'B001-004112', fecha: '15 Abr 2026', metodo: 'Efectivo', icono: 'fa-money-bill-wave', textClass: 'text-success', monto: 'S/ 120.00' },
        { id: 'B001-003889', fecha: '15 Mar 2026', metodo: 'Transferencia', icono: 'fa-money-bill-transfer', textClass: 'text-info', monto: 'S/ 120.00' }
    ];

    listGroup.innerHTML = '';
    historial.forEach((pago, index) => {
        let bgClass = '';
        if (index > 0) bgClass = 'bg-light bg-opacity-50';
        
        let roundedClass = '';
        if (index === historial.length - 1) roundedClass = 'rounded-bottom-4';
        
        listGroup.innerHTML += `
            <div class="list-group-item p-4 border-0 border-bottom border-light ${bgClass} ${roundedClass}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="fw-bold text-gray-800 mb-2">${pago.monto}</h5>
                        <span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2">
                            <i class="fa-solid ${pago.icono} ${pago.textClass} me-1"></i> ${pago.metodo}
                        </span>
                    </div>
                    <div class="text-end">
                        <span class="text-muted small fw-medium d-block">${pago.fecha}</span>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary fw-medium px-3 rounded-pill" onclick="verComprobante('${pago.id}')">
                        <i class="fa-solid fa-file-invoice me-1"></i> Ver Comprobante
                    </button>
                </div>
            </div>
        `;
    });
}
