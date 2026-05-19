// public/js/admin/mantenimiento.js
// Backend: Supabase

let equiposCache = [];

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  const d = new Date(fechaISO);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const getBadgeEquipo = (estado) => {
  switch (estado) {
    case 'Operativo':
      return { clase: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25', icono: 'fa-check' };
    case 'En Mantenimiento':
      return { clase: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25', icono: 'fa-screwdriver-wrench' };
    case 'Fuera de Servicio':
      return { clase: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25', icono: 'fa-ban' };
    default:
      return { clase: 'bg-secondary bg-opacity-10 text-secondary border', icono: 'fa-circle' };
  }
};

// ===================== EQUIPOS =====================

async function cargarEquipos() {
  const tbody = document.querySelector('table tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

  const { data, error } = await window.supabaseClient
    .from('equipos')
    .select('*')
    .order('codigo', { ascending: true });

  if (error) {
    console.error('Error al cargar equipos:', error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar equipos.</td></tr>';
    return;
  }

  equiposCache = data || [];
  renderizarTabla();
  actualizarResumen();
  llenarSelectEquipos();
}

function renderizarTabla() {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (equiposCache.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay equipos registrados.</td></tr>';
    return;
  }

  equiposCache.forEach(equipo => {
    const badge = getBadgeEquipo(equipo.estado);
    const btnOperativo = equipo.estado !== 'Operativo'
      ? `<button class="btn btn-sm btn-outline-success rounded ms-1 btn-operativo"
          data-codigo="${equipo.id}" title="Marcar Operativo">
          <i class="fa-solid fa-check"></i>
        </button>`
      : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-4 text-gray-800 fw-medium">${equipo.codigo}</td>
      <td>
        <div class="d-flex align-items-center">
          <div class="bg-light rounded p-2 me-3 border">
            <i class="fa-solid ${equipo.icono||'fa-dumbbell'} text-secondary fs-5" style="width:24px;text-align:center;"></i>
          </div>
          <div>
            <span class="fw-semibold text-gray-800 d-block">${equipo.nombre}</span>
            <small class="text-muted">Serie: ${equipo.serie||'N/A'}</small>
          </div>
        </div>
      </td>
      <td class="text-gray-800">${equipo.ubicacion||'N/A'}</td>
      <td>
        <span class="badge ${badge.clase} px-2 py-1 rounded-pill">
          <i class="fa-solid ${badge.icono} me-1"></i>${equipo.estado}
        </span>
      </td>
      <td class="pe-4 text-center">
        <button class="btn btn-sm btn-light text-secondary rounded btn-historial"
          data-id="${equipo.id}" title="Ver Historial">
          <i class="fa-solid fa-clock-rotate-left"></i>
        </button>
        ${btnOperativo}
      </td>
    `;

    tr.querySelector('.btn-historial').addEventListener('click', () => verHistorial(equipo.id));
    const btnOp = tr.querySelector('.btn-operativo');
    if (btnOp) btnOp.addEventListener('click', () => marcarOperativo(equipo.id));

    tbody.appendChild(tr);
  });
}

function actualizarResumen() {
  const operativos      = equiposCache.filter(e => e.estado === 'Operativo').length;
  const enMantenimiento = equiposCache.filter(e => e.estado === 'En Mantenimiento').length;
  const fueraDeServicio = equiposCache.filter(e => e.estado === 'Fuera de Servicio').length;

  const el1 = document.getElementById('countOperativos');
  const el2 = document.getElementById('countMantenimiento');
  const el3 = document.getElementById('countFuera');

  if (el1) el1.textContent = operativos;
  if (el2) el2.textContent = enMantenimiento;
  if (el3) el3.textContent = fueraDeServicio;
}

function llenarSelectEquipos() {
  const select = document.getElementById('equipoAfectado');
  if (!select) return;
  select.innerHTML = '<option value="" selected disabled>Buscar y seleccionar equipo...</option>';
  equiposCache.forEach(eq => {
    const opt = document.createElement('option');
    opt.value = eq.id;
    opt.textContent = `${eq.codigo} - ${eq.nombre}`;
    select.appendChild(opt);
  });
}

async function marcarOperativo(equipoId) {
  const { error } = await window.supabaseClient
    .from('equipos')
    .update({ estado: 'Operativo' })
    .eq('id', equipoId);

  if (error) { console.error('Error marcarOperativo:', error); return; }
  await cargarEquipos();
  Swal.fire({ title: '¡Actualizado!', text: 'Equipo marcado como operativo', icon: 'success', confirmButtonColor: '#198754' });
}

async function verHistorial(equipoId) {
  const { data, error } = await window.supabaseClient
    .from('incidencias')
    .select('*')
    .eq('equipo_id', equipoId)
    .order('fecha', { ascending: false });

  if (error || !data || data.length === 0) {
    Swal.fire({ title: 'Sin incidencias', text: 'Este equipo no tiene incidencias registradas', icon: 'info', confirmButtonColor: '#0d6efd', confirmButtonText: 'Entendido' });
    return;
  }

  const equipo = equiposCache.find(e => e.id === equipoId);
  const listHTML = '<ul class="list-group text-start mt-3">' +
    data.map(inc => `
      <li class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1 fw-bold">${inc.tipo||'N/A'}</h6>
          <small class="text-muted">${formatearFecha(inc.fecha)}</small>
        </div>
        <p class="mb-1 small">${inc.descripcion||''}</p>
        <small class="text-muted">Técnico: ${inc.responsable||'No especificado'}</small>
      </li>`).join('') + '</ul>';

  Swal.fire({
    title: `Historial: ${equipo ? equipo.codigo : ''}`,
    html: listHTML,
    icon: 'info',
    confirmButtonColor: '#0d6efd',
    confirmButtonText: 'Cerrar',
  });
}

// ===================== INCIDENCIAS =====================

document.addEventListener('DOMContentLoaded', async () => {
  await cargarEquipos();

  const formIncidencia = document.getElementById('formIncidencia');
  if (formIncidencia) {
    formIncidencia.addEventListener('submit', async function (e) {
      e.preventDefault();

      const equipoId    = document.getElementById('equipoAfectado').value;
      const radioTipo   = document.querySelector('input[name="tipoMantenimiento"]:checked');
      const tipo        = radioTipo ? radioTipo.value : 'No especificado';
      const radioEstado = document.querySelector('input[name="estadoIncidencia"]:checked');
      const nuevoEstado = radioEstado ? radioEstado.value : 'En Mantenimiento';
      const descripcion = document.getElementById('descProblema').value;
      const responsable = document.getElementById('responsableMant').value;

      // Guardar incidencia
      const { error: errInc } = await window.supabaseClient
        .from('incidencias')
        .insert({ equipo_id: equipoId, tipo, descripcion, responsable });

      if (errInc) {
        console.error('Error al guardar incidencia:', errInc);
        Swal.fire({ title: 'Error', text: 'No se pudo registrar la incidencia.', icon: 'error' });
        return;
      }

      // Actualizar estado del equipo
      const { error: errEq } = await window.supabaseClient
        .from('equipos')
        .update({ estado: nuevoEstado })
        .eq('id', equipoId);

      if (errEq) console.error('Error al actualizar estado equipo:', errEq);

      await cargarEquipos();

      const offcanvasEl = document.getElementById('offcanvasIncidencia');
      bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).hide();
      formIncidencia.reset();

      Swal.fire({ title: '¡Registrado!', text: 'Incidencia registrada correctamente', icon: 'success', confirmButtonColor: '#ffc107' });
    });
  }
});
