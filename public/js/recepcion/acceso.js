// public/js/recepcion/acceso.js
const sociosAccesoMock = [
    { dni: '76543210', nombres: 'Carlos Mendoza Rojas', plan: 'Mensual VIP', vencimiento: '15/06/2026', estado: 'Activo' },
    { dni: '43210987', nombres: 'Ana María Torres', plan: 'Mensual Básico', vencimiento: '01/05/2026', estado: 'Moroso' },
    { dni: '12345678', nombres: 'Luis Pérez', plan: 'Trimestral', vencimiento: '10/01/2026', estado: 'Inactivo' }
];

document.addEventListener('DOMContentLoaded', () => {
    const btnValidar = document.getElementById('btnValidar');
    const inputIngreso = document.getElementById('inputIngreso');
    const resultadoPanel = document.getElementById('resultadoPanel');
    
    // Guardar el estado inicial (Esperando)
    const htmlEsperando = `
        <div id="estadoEsperando" class="text-center text-muted">
            <div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm" style="width: 80px; height: 80px;">
                <i class="fa-solid fa-id-card fs-1 text-secondary opacity-50"></i>
            </div>
            <h4 class="fw-bold text-gray-800">Esperando validación</h4>
            <p>Pase el código QR por el lector o ingrese los datos manualmente.</p>
        </div>
    `;

    let timerId;

    if (btnValidar) {
        btnValidar.addEventListener('click', function() {
            const dni = inputIngreso.value.trim();
            if (!dni) return;

            // Limpiar timer anterior si el recepcionista vuelve a intentar rápido
            if (timerId) clearTimeout(timerId);

            // Buscar en el mock
            const socio = sociosAccesoMock.find(s => s.dni === dni);

            if (!socio) {
                // ESTADO: NO ENCONTRADO
                resultadoPanel.innerHTML = `
                    <div id="estadoInvalido" class="text-center w-100" style="transform: scale(0.95); transition: transform 0.2s ease-out;">
                        <div class="card bg-warning bg-opacity-10 border-warning border-opacity-50 border-2 rounded-4 shadow-sm w-100 p-5">
                            <div class="bg-warning text-dark rounded-circle d-inline-flex justify-content-center align-items-center mx-auto mb-4 shadow" style="width: 90px; height: 90px;">
                                <i class="fa-solid fa-triangle-exclamation fs-1"></i>
                            </div>
                            <h3 class="fw-bold text-dark mb-2">Socio no encontrado</h3>
                            <p class="text-muted fs-5 mb-0">El código ingresado no corresponde a ningún usuario registrado en el sistema.</p>
                        </div>
                    </div>
                `;
            } else if (socio.estado === 'Activo') {
                // ESTADO: ACTIVO (PERMITIDO)
                const foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(socio.nombres)}&background=fff&color=198754&rounded=true&size=100`;
                resultadoPanel.innerHTML = `
                    <div id="estadoPermitido" class="text-center w-100" style="transform: scale(0.95); transition: transform 0.2s ease-out;">
                        <div class="card bg-success bg-opacity-10 border-success border-opacity-50 border-2 rounded-4 shadow-sm w-100 p-5">
                            <div class="bg-success text-white rounded-circle d-inline-flex justify-content-center align-items-center mx-auto mb-3 shadow" style="width: 90px; height: 90px;">
                                <i class="fa-solid fa-check fs-1"></i>
                            </div>
                            <img src="${foto}" alt="Foto Socio" class="rounded-circle border border-3 border-white shadow-sm mx-auto mb-3" width="100">
                            <h3 class="fw-bold text-success mb-1">${socio.nombres}</h3>
                            <h5 class="fw-semibold text-dark mb-4">DNI: ${socio.dni}</h5>
                            <div class="d-inline-block bg-white px-4 py-2 rounded-pill shadow-sm">
                                <h4 class="fw-bold text-success m-0"><i class="fa-solid fa-unlock-keyhole me-2"></i> ACCESO PERMITIDO</h4>
                            </div>
                            <p class="text-muted fw-medium mt-3 mb-0">Plan: ${socio.plan} - Vence: ${socio.vencimiento}</p>
                        </div>
                    </div>
                `;
            } else {
                // ESTADO: MOROSO / INACTIVO (DENEGADO)
                const foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(socio.nombres)}&background=fff&color=dc3545&rounded=true&size=100`;
                let mensajeExtra = socio.estado === 'Moroso' ? 'Deuda Pendiente' : 'Suscripción Vencida';
                
                resultadoPanel.innerHTML = `
                    <div id="estadoDenegado" class="text-center w-100" style="transform: scale(0.95); transition: transform 0.2s ease-out;">
                        <div class="card bg-danger bg-opacity-10 border-danger border-opacity-50 border-2 rounded-4 shadow-sm w-100 p-5">
                            <div class="bg-danger text-white rounded-circle d-inline-flex justify-content-center align-items-center mx-auto mb-3 shadow" style="width: 90px; height: 90px;">
                                <i class="fa-solid fa-xmark fs-1"></i>
                            </div>
                            <img src="${foto}" alt="Foto Socio" class="rounded-circle border border-3 border-white shadow-sm mx-auto mb-3" width="100">
                            <h3 class="fw-bold text-danger mb-1">${socio.nombres}</h3>
                            <h5 class="fw-semibold text-dark mb-4">DNI: ${socio.dni}</h5>
                            <div class="d-inline-block bg-white px-4 py-2 rounded-pill shadow-sm">
                                <h4 class="fw-bold text-danger m-0"><i class="fa-solid fa-hand me-2"></i> ACCESO DENEGADO</h4>
                            </div>
                            <p class="text-danger fw-medium mt-3 mb-0">Comuníquese con administración (${mensajeExtra}).</p>
                        </div>
                    </div>
                `;
            }

            // Efecto sutil de animación (volver al tamaño original)
            setTimeout(() => {
                const child = resultadoPanel.firstElementChild;
                if (child) {
                    child.style.transform = 'scale(1)';
                }
            }, 50);

            // Temporizador de Limpieza: 5 Segundos
            timerId = setTimeout(() => {
                inputIngreso.value = '';
                resultadoPanel.innerHTML = htmlEsperando;
            }, 5000);
        });
    }
});
