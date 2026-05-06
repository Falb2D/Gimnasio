// public/js/admin/pagos.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mock Data de Historial
    const historialPagos = [
        {
            fecha: '03/05/2026',
            socio: 'Ana María Torres López',
            plan: 'Mensual Ilimitado',
            monto: '120.00',
            metodoPago: 'Yape / Plin',
            estado: 'Vigente'
        },
        {
            fecha: '02/05/2026',
            socio: 'Carlos Mendoza Rojas',
            plan: 'Trimestral VIP',
            monto: '300.00',
            metodoPago: 'Efectivo',
            estado: 'Vencida'
        },
        {
            fecha: '28/04/2026',
            socio: 'Roberto Salas Pinto',
            plan: 'Anual Full',
            monto: '1000.00',
            metodoPago: 'Transferencia',
            estado: 'Cancelada'
        }
    ];

    const tablaPagos = document.getElementById('tablaPagos');
    const formRegistroPago = document.getElementById('formRegistroPago');
    const seleccionarPlan = document.getElementById('seleccionarPlan');
    const inputMonto = document.getElementById('montoPagar');

    // Helper: Mapeo de íconos según método de pago
    const getIconoMetodo = (metodo) => {
        switch(metodo.toLowerCase()) {
            case 'efectivo': return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
            case 'transferencia': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
            case 'yape / plin': return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
            default: return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
        }
    };

    // Helper: Mapeo de Badges de Bootstrap según estado
    const getBadgeEstado = (estado) => {
        switch(estado.toLowerCase()) {
            case 'vigente': return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Vigente</span>';
            case 'vencida': return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Vencida</span>';
            case 'cancelada': return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Cancelada</span>';
            default: return `<span class="badge bg-light text-dark">${estado}</span>`;
        }
    };

    // 2. Renderizar Tabla del Historial
    const renderizarHistorial = () => {
        if (!tablaPagos) return;
        
        // Limpiamos la tabla
        tablaPagos.innerHTML = '';

        if (historialPagos.length === 0) {
            tablaPagos.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay pagos registrados.</td></tr>';
            return;
        }

        // Iterar array e inyectar filas
        historialPagos.forEach(pago => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800">${pago.fecha}</td>
                <td class="fw-semibold text-gray-800">${pago.socio}</td>
                <td class="text-muted">${pago.plan}</td>
                <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto).toFixed(2)}</td>
                <td><span class="badge bg-light text-dark border">${getIconoMetodo(pago.metodoPago)} ${pago.metodoPago}</span></td>
                <td>${getBadgeEstado(pago.estado)}</td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-primary border rounded shadow-sm btn-descargar" title="Descargar Comprobante">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                </td>
            `;
            tablaPagos.appendChild(tr);
        });

        // Event listener dinámico para los nuevos botones PDF
        const botonesPdf = document.querySelectorAll('.btn-descargar');
        botonesPdf.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Descargando comprobante...');
            });
        });
    };

    // Renderizado Inicial
    renderizarHistorial();

    // 3. Lógica de Autocompletado de Precio
    if (seleccionarPlan && inputMonto) {
        seleccionarPlan.addEventListener('change', (e) => {
            const precio = e.target.value;
            if (precio) {
                inputMonto.value = parseFloat(precio).toFixed(2);
            } else {
                inputMonto.value = '';
            }
        });
    }

    // 4. Procesar Pago
    if (formRegistroPago) {
        formRegistroPago.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar valores
            const socioIngresado = document.getElementById('buscarSocio').value;
            const planSeleccionado = seleccionarPlan.options[seleccionarPlan.selectedIndex].text.split(' - ')[0]; // Para limpiar el string y obtener solo el nombre
            const montoPagar = inputMonto.value;
            const metodoSeleccionado = document.getElementById('metodoPago');
            const textoMetodo = metodoSeleccionado.options[metodoSeleccionado.selectedIndex].text;

            // Obtener fecha actual (formato DD/MM/YYYY)
            const hoy = new Date();
            const fechaFormateada = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;

            // Armar el nuevo objeto JSON
            const nuevoPago = {
                fecha: fechaFormateada,
                socio: socioIngresado,
                plan: planSeleccionado,
                monto: montoPagar,
                metodoPago: textoMetodo,
                estado: 'Vigente'
            };

            // Insertarlo al inicio del mock de base de datos
            historialPagos.unshift(nuevoPago);

            // Re-renderizar la vista
            renderizarHistorial();

            // Feedback visual
            alert('Pago registrado y comprobante generado exitosamente');

            // Limpiar formulario y resetear monto manualmente (al ser readonly no se limpia con el reset normal a veces)
            formRegistroPago.reset();
            inputMonto.value = '';
        });
    }

    // --- LÓGICA VISUAL DE PESTAÑAS (TABS) ---
    // Conservada de la versión anterior para mantener el estilo visual del subrayado azul
    const tabsLinks = document.querySelectorAll('#pagosTabs .nav-link');
    tabsLinks.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            if(event.relatedTarget) {
                // Remover estilos del tab anterior
                event.relatedTarget.classList.remove('border-bottom', 'border-primary', 'border-3', 'text-primary');
                event.relatedTarget.classList.add('text-muted');
            }
            
            // Añadir estilos al tab actual
            event.target.classList.remove('text-muted');
            event.target.classList.add('border-bottom', 'border-primary', 'border-3', 'text-primary');
        });
    });
});
