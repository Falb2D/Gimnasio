// public/js/recepcion/pagos.js

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar EmailJS (Reemplaza con tu Public Key real)
    if (typeof emailjs !== 'undefined') {
        emailjs.init("TU_PUBLIC_KEY_AQUI");
    }

    // Configurar el input de fecha con el día de hoy por defecto
    const inputFiltroFecha = document.getElementById('filtroFechaCaja');
    if (inputFiltroFecha) {
        const hoy = new Date().toISOString().split('T')[0];
        inputFiltroFecha.value = hoy;
    }

    // Inicializar el historial de caja
    renderizarHistorialCaja();
});

function renderizarHistorialCaja() {
    const pagosDB = JSON.parse(localStorage.getItem('pagosDB')) || [];
    const tbody = document.getElementById('tablaHistorialBody');
    const badgeTotal = document.getElementById('badgeTotalCaja');

    if (!tbody || !badgeTotal) return;

    let total = 0;
    tbody.innerHTML = '';

    if (pagosDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay movimientos registrados hoy.</td></tr>`;
        badgeTotal.innerHTML = `<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ 0.00`;
        return;
    }

    pagosDB.forEach(pago => {
        total += parseFloat(pago.monto);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 text-gray-800 fw-medium">${pago.fecha.split(' ')[1] || pago.fecha}</td>
            <td class="fw-semibold text-gray-800">${pago.socio}</td>
            <td class="text-muted">${pago.plan}</td>
            <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto).toFixed(2)}</td>
            <td><span class="badge bg-light text-dark border"><i class="fa-solid fa-money-bill-transfer text-success me-1"></i> ${pago.metodo}</span></td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-sm btn-reenviar" title="Reenviar Boleta"><i class="fa-solid fa-paper-plane me-1"></i> Reenviar Email</button>
            </td>
        `;
        
        // Asignar el evento de reenvío
        tr.querySelector('.btn-reenviar').addEventListener('click', () => {
            window.enviarBoletaEmail(pago);
        });

        tbody.appendChild(tr);
    });

    badgeTotal.innerHTML = `<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ ${total.toFixed(2)}`;
}

// Función Global para enviar correo usando EmailJS
window.enviarBoletaEmail = function(pago) {
    let sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
    const socio = sociosDB.find(s => s.dni === pago.dni);
    const emailDestino = socio ? socio.email : '';

    if (!emailDestino) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Atención', 'No se pudo enviar el correo porque el socio no tiene un correo electrónico registrado.', 'warning');
        }
        return;
    }

    // 1. Mostrar estado de Cargando
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Enviando...',
            text: 'Enviando boleta al Gmail del socio...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Parámetros que EmailJS leerá en la plantilla
    const templateParams = {
        to_email: emailDestino,
        to_name: pago.socio,
        plan: pago.plan,
        monto: `S/ ${parseFloat(pago.monto).toFixed(2)}`,
        fecha: pago.fecha,
        metodo: pago.metodo
    };

    // --- SIMULACIÓN DE ÉXITO (Eliminar cuando actives EmailJS) ---
    setTimeout(() => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¡Boleta enviada!',
                text: `¡Boleta enviada correctamente a ${emailDestino}! (Simulación)`,
                icon: 'success',
                confirmButtonColor: '#198754'
            });
        }
    }, 1500);
    // -------------------------------------------------------------
};
