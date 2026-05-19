// public/js/recepcion/pagos.js
// Backend: Supabase

document.addEventListener('DOMContentLoaded', async () => {
    const inputFiltroFecha = document.getElementById('filtroFechaCaja');
    if (inputFiltroFecha) {
        inputFiltroFecha.value = new Date().toISOString().split('T')[0];
        inputFiltroFecha.addEventListener('change', () => cargarHistorialCaja(inputFiltroFecha.value));
    }

    await cargarHistorialCaja(new Date().toISOString().split('T')[0]);
});

async function cargarHistorialCaja(fecha) {
    const tbody      = document.getElementById('tablaHistorialBody');
    const badgeTotal = document.getElementById('badgeTotalCaja');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

    const inicio = `${fecha}T00:00:00`;
    const fin    = `${fecha}T23:59:59`;

    const { data: pagos, error } = await window.supabaseClient
        .from('pagos')
        .select('*, socios(nombres, apellidos, dni, email), planes(nombre)')
        .gte('fecha', inicio)
        .lte('fecha', fin)
        .order('fecha', { ascending: false });

    if (error) {
        console.error('Error cargando caja:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error al cargar datos.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    const lista = pagos || [];

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay movimientos registrados para esta fecha.</td></tr>';
        if (badgeTotal) badgeTotal.innerHTML = '<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ 0.00';
        return;
    }

    let total = 0;
    lista.forEach(pago => {
        total += parseFloat(pago.monto || 0);
        const nombre  = pago.socios ? `${pago.socios.nombres} ${pago.socios.apellidos}` : 'N/A';
        const plan    = pago.planes?.nombre ?? 'N/A';
        const hora    = pago.fecha ? new Date(pago.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--';
        const metodo  = pago.metodo_pago || 'N/A';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 text-gray-800 fw-medium">${hora}</td>
            <td class="fw-semibold text-gray-800">${nombre}</td>
            <td class="text-muted">${plan}</td>
            <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto || 0).toFixed(2)}</td>
            <td><span class="badge bg-light text-dark border"><i class="fa-solid fa-money-bill-transfer text-success me-1"></i> ${metodo}</span></td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-sm"
                    onclick="simularEnvioEmail('${nombre}', '${plan}', '${pago.monto}', '${pago.fecha}', '${metodo}', '${pago.socios?.email ?? ''}')"
                    title="Reenviar Boleta">
                    <i class="fa-solid fa-paper-plane me-1"></i> Reenviar Email
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (badgeTotal) badgeTotal.innerHTML = `<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

window.simularEnvioEmail = function(nombre, plan, monto, fecha, metodo, email) {
    if (!email) {
        Swal.fire('Atención', 'El socio no tiene correo registrado.', 'warning');
        return;
    }
    Swal.fire({
        icon: 'success',
        title: '¡Boleta enviada!',
        text: `Boleta enviada a ${email} (simulación).`,
        confirmButtonColor: '#0d6efd',
    });
};
