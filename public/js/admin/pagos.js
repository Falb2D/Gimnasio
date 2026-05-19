// public/js/admin/pagos.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Helper: Mapeo de íconos según método de pago
    const getIconoMetodo = (metodo) => {
        if (!metodo) return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
        switch(metodo.toLowerCase()) {
            case 'efectivo': return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
            case 'transferencia': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
            case 'transferencia bancaria': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
            case 'yape / plin': return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
            default: return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
        }
    };

    // Inyección de Datos de Prueba para la búsqueda en vivo
    let pagosDB = JSON.parse(localStorage.getItem('pagosDB')) || [];
    if (pagosDB.length === 0 || !pagosDB[0].dni) {
        pagosDB = [
            { fecha: '15/05/2026', socio: 'María Rodríguez Solano', dni: '76543210', plan: 'Trimestral VIP', monto: '300.00', metodoPago: 'Transferencia Bancaria', estado: 'Vigente' },
            { fecha: '14/05/2026', socio: 'Juan Gonzáles Pérez', dni: '43210987', plan: 'Mensual Ilimitado', monto: '120.00', metodoPago: 'Yape / Plin', estado: 'Vigente' },
            { fecha: '13/05/2026', socio: 'Pedro Sánchez', dni: '12345678', plan: 'Anual Full', monto: '1000.00', metodoPago: 'Efectivo', estado: 'Vigente' },
            { fecha: '12/05/2026', socio: 'Lucía Fernández', dni: '87654321', plan: 'Mensual Básico', monto: '80.00', metodoPago: 'Transferencia Bancaria', estado: 'Vigente' },
            { fecha: '10/05/2026', socio: 'Carlos López Vargas', dni: '11223344', plan: 'Semestral Básico', monto: '450.00', metodoPago: 'Tarjeta de Crédito', estado: 'Vigente' }
        ];
        localStorage.setItem('pagosDB', JSON.stringify(pagosDB));
    }

    const renderizarHistorialAdmin = (datos = null) => {
        const tablaPagos = document.getElementById('tablaPagos');
        const totalRecaudadoBadge = document.getElementById('totalRecaudadoBadge');
        
        if (!tablaPagos) return;
        
        // 1. Leer pagos a renderizar (Si llegan filtrados los usa, si no lee de localStorage)
        const historialPagos = datos !== null ? datos : (JSON.parse(localStorage.getItem('pagosDB')) || []);
        
        // 2. Sumar todos los montos de lo que se va a mostrar
        let total = 0;
        historialPagos.forEach(pago => {
            const monto = parseFloat(pago.monto) || 0;
            total += monto;
        });
        
        // Actualizar el indicador de Total Recaudado dinámicamente
        if (totalRecaudadoBadge) {
            totalRecaudadoBadge.innerHTML = `Total Recaudado Histórico: S/ ${total.toFixed(2)}`;
        }

        // Limpiar la tabla
        tablaPagos.innerHTML = '';

        if (historialPagos.length === 0) {
            tablaPagos.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron pagos con ese término.</td></tr>';
            return;
        }

        // 3. Recorrer el array y pintar las filas (Solo lectura)
        historialPagos.forEach((pago) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800">${pago.fecha || 'N/A'}</td>
                <td>
                    <div>
                        <span class="fw-bold">${pago.socio || 'N/A'}</span><br>
                        <small class="text-muted">DNI: ${pago.dni || 'N/A'}</small>
                    </div>
                </td>
                <td class="text-muted">${pago.plan || 'N/A'}</td>
                <td class="fw-bold text-success">S/ ${parseFloat(pago.monto || 0).toFixed(2)}</td>
                <td class="pe-4"><span class="badge bg-light text-dark border">${getIconoMetodo(pago.metodoPago)} ${pago.metodoPago || 'N/A'}</span></td>
            `;
            tablaPagos.appendChild(tr);
        });
    };

    // Ejecutar automáticamente al cargar el DOM
    renderizarHistorialAdmin();

    // 4. Lógica de Búsqueda
    const buscadorPagos = document.getElementById('buscadorPagos');
    if (buscadorPagos) {
        buscadorPagos.addEventListener('input', (e) => {
            const textoBuscado = e.target.value.toLowerCase();
            const todosLosPagos = JSON.parse(localStorage.getItem('pagosDB')) || [];
            
            const pagosFiltrados = todosLosPagos.filter(pago => {
                const nombreSocio = (pago.socio || '').toLowerCase();
                const dniSocio = (pago.dni || '').toLowerCase();
                return nombreSocio.includes(textoBuscado) || dniSocio.includes(textoBuscado);
            });
            
            renderizarHistorialAdmin(pagosFiltrados);
        });
    }
});
