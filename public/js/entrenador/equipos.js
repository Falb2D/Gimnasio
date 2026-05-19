// public/js/entrenador/equipos.js

let equiposCache = [];

async function cargarEquipos() {
    const tbody = document.getElementById('tbodyEquipos');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

    const { data, error } = await window.supabaseClient
        .from('equipos')
        .select('*')
        .order('codigo', { ascending: true });

    if (error) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error al cargar equipos.</td></tr>';
        return;
    }

    equiposCache = data || [];
    renderizarTabla();
    llenarSelectEquipos();
}

function renderizarTabla() {
    const tbody = document.getElementById('tbodyEquipos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (equiposCache.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay equipos registrados.</td></tr>';
        return;
    }

    equiposCache.forEach(eq => {
        let badgeHtml = '';
        if (eq.estado === 'Operativo') {
            badgeHtml = '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill"><i class="fa-solid fa-check me-1"></i>Operativo</span>';
        } else if (eq.estado === 'En Mantenimiento') {
            badgeHtml = '<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill"><i class="fa-solid fa-screwdriver-wrench me-1"></i>En Mantenimiento</span>';
        } else {
            badgeHtml = '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill"><i class="fa-solid fa-ban me-1"></i>Fuera de Servicio</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4 fw-medium text-gray-800">${eq.codigo}</td>
            <td class="fw-semibold text-gray-800">${eq.nombre}</td>
            <td class="text-muted"><i class="fa-solid fa-location-dot me-1 text-secondary opacity-50"></i>${eq.ubicacion || 'N/A'}</td>
            <td class="pe-4 text-center">${badgeHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function llenarSelectEquipos() {
    const select = document.getElementById('selectEquipo');
    if (!select) return;
    select.innerHTML = '<option value="" selected disabled>Seleccione el equipo...</option>';
    equiposCache.forEach(eq => {
        const opt = document.createElement('option');
        opt.value = eq.id;
        opt.textContent = `${eq.codigo} — ${eq.nombre}`;
        select.appendChild(opt);
    });
}

async function procesarReporte(e) {
    e.preventDefault();

    const equipoId   = document.getElementById('selectEquipo').value;
    const tipo       = document.getElementById('selectTipoFalla').value;
    const descripcion = document.getElementById('descFalla').value.trim();
    const responsable = localStorage.getItem('sesionNombre') || 'Entrenador';

    if (!equipoId || !tipo || !descripcion) return;

    const nuevoEstado = tipo === 'Correctivo' ? 'Fuera de Servicio' : 'En Mantenimiento';

    const btnEnviar = document.querySelector('button[form="formReporteIncidencia"]');
    if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...'; }

    // Registrar incidencia
    const { error: errInc } = await window.supabaseClient
        .from('incidencias')
        .insert({ equipo_id: equipoId, tipo, descripcion, responsable });

    if (errInc) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar el reporte.', confirmButtonColor: '#dc3545' });
        if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Enviar Reporte'; }
        return;
    }

    // Actualizar estado del equipo
    await window.supabaseClient
        .from('equipos')
        .update({ estado: nuevoEstado })
        .eq('id', equipoId);

    // Cerrar modal
    const modalEl = document.getElementById('modalReporte');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    e.target.reset();
    if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Enviar Reporte'; }

    await cargarEquipos();

    Swal.fire({
        icon: 'success',
        title: '¡Reporte Enviado!',
        text: 'La falla ha sido registrada y el estado del equipo actualizado.',
        confirmButtonColor: '#198754',
        timer: 2500,
        showConfirmButton: false
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarEquipos();

    const formReporte = document.getElementById('formReporteIncidencia');
    if (formReporte) formReporte.addEventListener('submit', procesarReporte);
});
