document.addEventListener('DOMContentLoaded', () => {

    // 1. Mock Data (Diccionario de Precios)
    const preciosPlanes = {
        'Mensual Básico': 80.00,
        'Mensual Ilimitado': 120.00,
        'Trimestral VIP': 300.00
    };

    // 2. Mock Data (Historial Diario)
    const historialCajaMock = [
        {
            hora: '10:45 AM',
            socio: 'Lucía Mendoza',
            plan: 'Mensual Ilimitado',
            monto: 120.00,
            metodo: 'yape_plin'
        },
        {
            hora: '09:15 AM',
            socio: 'Jorge Ramírez',
            plan: 'Mensual Básico',
            monto: 80.00,
            metodo: 'efectivo'
        }
    ];

    const planCobro = document.getElementById('planCobro');
    const montoRecibido = document.getElementById('montoRecibido');
    const formNuevoCobro = document.getElementById('formNuevoCobro');
    const tablaHistorialCaja = document.getElementById('tablaHistorialCaja');
    const textoTotalCaja = document.getElementById('textoTotalCaja');

    // 3. Autocompletado de Precio
    if (planCobro && montoRecibido) {
        planCobro.addEventListener('change', (e) => {
            const planSeleccionado = e.target.value;
            const precio = preciosPlanes[planSeleccionado];
            if (precio !== undefined) {
                montoRecibido.value = precio.toFixed(2);
            } else {
                montoRecibido.value = '';
            }
        });
    }

    // Helper: Formatear método para badge
    const obtenerBadgeMetodo = (metodo) => {
        if (metodo === 'efectivo') {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-money-bill-wave text-success me-1"></i> Efectivo</span>';
        } else if (metodo === 'transferencia') {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-building-columns text-info me-1"></i> Transferencia</span>';
        } else {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-mobile-screen text-primary me-1"></i> Yape / Plin</span>';
        }
    };

    // 4. Renderizar Historial
    const renderizarHistorial = () => {
        if (!tablaHistorialCaja) return;
        
        tablaHistorialCaja.innerHTML = '';
        
        historialCajaMock.forEach(mov => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800 fw-medium">${mov.hora}</td>
                <td class="fw-semibold text-gray-800">${mov.socio}</td>
                <td class="text-muted">${mov.plan}</td>
                <td class="fw-bold text-gray-800">S/ ${mov.monto.toFixed(2)}</td>
                <td>${obtenerBadgeMetodo(mov.metodo)}</td>
                <td class="pe-4 text-center">
                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm btn-reimprimir" title="Reimprimir Comprobante"><i class="fa-solid fa-print me-1"></i> Reimprimir</button>
                </td>
            `;
            tablaHistorialCaja.appendChild(tr);
        });

        // Eventos para botones Reimprimir
        const botonesReimprimir = tablaHistorialCaja.querySelectorAll('.btn-reimprimir');
        botonesReimprimir.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Reimprimiendo ticket...');
            });
        });
    };

    // 5. Calcular Total en Caja
    const actualizarTotalCaja = () => {
        if (!textoTotalCaja) return;
        
        const total = historialCajaMock.reduce((sum, mov) => sum + mov.monto, 0);
        textoTotalCaja.innerHTML = `<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ ${total.toFixed(2)}`;
    };

    // 6. Procesar Cobro
    if (formNuevoCobro) {
        formNuevoCobro.addEventListener('submit', (e) => {
            e.preventDefault();

            const socio = document.getElementById('buscarSocio').value.trim();
            const plan = document.getElementById('planCobro').value;
            const metodo = document.getElementById('metodoPago').value;
            const monto = parseFloat(document.getElementById('montoRecibido').value);

            // Hora actual
            const horaActual = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            const nuevoMovimiento = {
                hora: horaActual,
                socio: socio,
                plan: plan,
                monto: monto,
                metodo: metodo
            };

            // Agregar al inicio
            historialCajaMock.unshift(nuevoMovimiento);

            // Actualizar vista
            renderizarHistorial();
            actualizarTotalCaja();

            // Limpiar formulario y mostrar alerta
            formNuevoCobro.reset();
            document.getElementById('montoRecibido').value = ''; // Limpiar el campo readonly
            alert('Pago procesado y comprobante emitido correctamente');
        });
    }

    // Estilos para las Tabs (preservar comportamiento visual)
    const tabsLinks = document.querySelectorAll('#recepcionPagosTabs .nav-link');
    tabsLinks.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            event.relatedTarget.classList.remove('border-bottom', 'border-primary', 'border-3', 'text-primary');
            event.relatedTarget.classList.add('text-muted');
            event.target.classList.remove('text-muted');
            event.target.classList.add('border-bottom', 'border-primary', 'border-3', 'text-primary');
        });
    });

    // 7. Render Inicial
    renderizarHistorial();
    actualizarTotalCaja();

});
