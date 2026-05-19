// public/js/admin/clases.js
// Backend: Supabase (via clasesService)

document.addEventListener('DOMContentLoaded', async () => {
  await renderizarClases();

  // Formulario nueva clase
  const formNuevaClase = document.getElementById('formNuevaClase');
  if (formNuevaClase) {
    formNuevaClase.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectEntrenador = document.getElementById('entrenadorClase');
      const coach     = selectEntrenador.options[selectEntrenador.selectedIndex].text;
      const fechaHora = document.getElementById('fechaHoraClase').value;
      const capacidad = parseInt(document.getElementById('capacidadClase').value);
      const ubicacion = document.getElementById('ubicacionClase').value;

      let fechaHoraISO = '';
      if (fechaHora) {
        const d = new Date(fechaHora);
        if (!isNaN(d)) fechaHoraISO = d.toISOString();
      }

      const nuevaClase = {
        nombre      : document.getElementById('nombreClase').value,
        fecha_hora  : fechaHoraISO,
        coach_nombre: coach,
        ubicacion,
        capacidad_max: capacidad,
        icono       : 'fa-calendar-check',
        bg_icono    : 'bg-secondary',
        text_icono  : 'text-secondary',
        estado      : 'Activa',
      };

      const creada = await clasesService.crearClase(nuevaClase);
      if (!creada) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la clase.' });
        return;
      }

      await renderizarClases();

      const modalEl = document.getElementById('modalNuevaClase');
      bootstrap.Modal.getInstance(modalEl)?.hide();
      formNuevaClase.reset();
      Swal.fire({ icon: 'success', title: '¡Creada!', text: 'Clase creada exitosamente.' });
    });
  }

  // Formulario editar clase
  const formEditar = document.getElementById('formEditarClase');
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id        = document.getElementById('editarIdClase').value;
      const nombre    = document.getElementById('editarNombreClase').value;
      const selectEntr= document.getElementById('editarEntrenadorClase');
      const coach     = selectEntr.options[selectEntr.selectedIndex].text;
      const hora      = document.getElementById('editarHoraInicioClase').value;
      const capacidad = parseInt(document.getElementById('editarCapacidadClase').value);
      const selectUbi = document.getElementById('editarUbicacionClase');
      const ubicacion = selectUbi ? selectUbi.value : '';

      let fechaHoraISO = '';
      if (hora) {
        const now = new Date();
        const [h, m] = hora.split(':');
        now.setHours(parseInt(h || 0), parseInt(m || 0), 0, 0);
        fechaHoraISO = now.toISOString();
      }

      const datos = {
        nombre,
        fecha_hora  : fechaHoraISO,
        coach_nombre: coach,
        ubicacion,
        capacidad_max: capacidad,
      };

      await clasesService.actualizarClase(id, datos);
      await renderizarClases();

      bootstrap.Modal.getInstance(document.getElementById('modalEditarClase'))?.hide();
      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'La clase fue actualizada.' });
    });
  }
});

// ===================== RENDERIZAR =====================

async function renderizarClases() {
  const contenedor = document.getElementById('contenedorClases');
  if (!contenedor) return;
  contenedor.innerHTML = '<div class="col-12 text-center py-5"><span class="spinner-border text-primary"></span></div>';

  const clases = await clasesService.obtenerClases();

  contenedor.innerHTML = '';
  if (!clases || clases.length === 0) {
    contenedor.innerHTML = '<div class="col-12 text-center text-muted py-5">No hay clases registradas.</div>';
    return;
  }

  clases.forEach(clase => {
    const d = clase.fecha_hora ? new Date(clase.fecha_hora) : null;
    const horario = d && !isNaN(d)
      ? `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} hrs`
      : '--:-- hrs';

    const capacidad       = clase.capacidad_max || 0;
    const reservas        = clase.inscritos ? clase.inscritos.length : 0;
    const porcentaje      = clasesService.calcularPorcentajeOcupacion(clase);
    const estadoVisual    = clasesService.obtenerEstadoVisual(clase);
    const estaLlena       = clasesService.estaLlena(clase);
    const cancelada       = (clase.estado || '') === 'Cancelada';

    const actionBtn = cancelada
      ? `<button class="btn btn-sm btn-outline-success ms-2" onclick="reactivarClase('${clase.id}')"><i class="fa-solid fa-undo"></i></button>`
      : `<button class="btn btn-sm btn-outline-danger ms-2"  onclick="desactivarClase('${clase.id}')"><i class="fa-solid fa-ban"></i></button>`;

    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-xl-4';
    card.innerHTML = `
      <div class="card border-0 shadow-sm h-100 rounded-4 position-relative"
        ${cancelada ? 'style="opacity:0.6;background:#f8f9fa;"' : ''}>
        <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
            <div class="${clase.bg_icono||'bg-secondary'} bg-opacity-10 ${clase.text_icono||'text-secondary'}
              rounded p-2 me-2 d-inline-flex justify-content-center align-items-center"
              style="width:40px;height:40px;">
              <i class="fa-solid ${clase.icono||'fa-calendar-check'} fs-5"></i>
            </div>
            ${clase.nombre}
          </h5>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-${estadoVisual.colorBadge} bg-opacity-10 text-${estadoVisual.colorBadge}
              border border-${estadoVisual.colorBadge} border-opacity-25 rounded-pill px-3 py-1">
              ${estadoVisual.badge}
            </span>
            <button class="btn btn-sm btn-outline-primary ms-2"
              ${cancelada ? 'disabled' : ''} onclick="abrirModalEditar('${clase.id}')">
              <i class="fa-solid fa-pencil-alt"></i>
            </button>
            ${actionBtn}
          </div>
        </div>
        <div class="card-body">
          <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2"></i>${horario}</p>
          <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2"></i>Coach: ${clase.coach_nombre||'N/A'}</p>
          <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2"></i>${clase.ubicacion||'N/A'}</p>
          <div class="mt-4">
            <div class="d-flex justify-content-between mb-1">
              <span class="small fw-medium ${estaLlena?'text-danger':'text-muted'}">
                Reservas: ${reservas} / ${capacidad}
              </span>
              <span class="small fw-bold text-${estadoVisual.color}">${porcentaje}%</span>
            </div>
            <div class="progress" style="height:8px;">
              <div class="progress-bar bg-${estadoVisual.color} rounded-pill"
                style="width:${porcentaje}%;"></div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-white border-top-0 pb-4 pt-0">
          ${cancelada
            ? `<button class="btn btn-secondary w-100 rounded-3" disabled>No Disponible</button>`
            : `<button class="btn btn-outline-${estadoVisual.color} w-100 rounded-3 btn-asistentes"
                data-id="${clase.id}">
                <i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes
              </button>`
          }
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });

  // Botones de asistentes
  document.querySelectorAll('.btn-asistentes').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      await verAsistentes(e.currentTarget.dataset.id);
    });
  });
}

// ===================== ACCIONES =====================

async function verAsistentes(claseId) {
  const clase = await clasesService.obtenerClasePorId(claseId);
  if (!clase) return;

  document.getElementById('nombreClaseModal').textContent = clase.nombre;
  const lista = document.getElementById('listaAsistentesModal');
  if (lista) {
    if (clase.inscritos && clase.inscritos.length > 0) {
      lista.innerHTML = clase.inscritos.map((ins, i) => `
        <li class="list-group-item px-0 py-3 ${i !== clase.inscritos.length-1 ? 'border-bottom' : ''}">
          <i class="fa-solid fa-user text-secondary me-3"></i>${ins.nombre}
        </li>`).join('');
    } else {
      lista.innerHTML = '<li class="list-group-item px-0 py-3 text-muted">No hay inscritos.</li>';
    }
  }
  new bootstrap.Modal(document.getElementById('modalAsistentes')).show();
}

window.abrirModalEditar = async function (id) {
  const clase = await clasesService.obtenerClasePorId(id);
  if (!clase) return;

  document.getElementById('editarIdClase').value       = clase.id;
  document.getElementById('editarNombreClase').value   = clase.nombre || '';
  document.getElementById('editarCapacidadClase').value = clase.capacidad_max || '';

  const horaInput = document.getElementById('editarHoraInicioClase');
  if (horaInput && clase.fecha_hora) {
    const d = new Date(clase.fecha_hora);
    if (!isNaN(d)) horaInput.value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  const selectEntr = document.getElementById('editarEntrenadorClase');
  if (selectEntr && clase.coach_nombre) {
    for (let i = 0; i < selectEntr.options.length; i++) {
      if (selectEntr.options[i].text === clase.coach_nombre) {
        selectEntr.selectedIndex = i;
        break;
      }
    }
  }

  const selectUbi = document.getElementById('editarUbicacionClase');
  if (selectUbi && clase.ubicacion) selectUbi.value = clase.ubicacion;

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarClase')).show();
};

// Alias
window.abrirEditarClase = window.abrirModalEditar;

window.desactivarClase = async function (id) {
  const result = await Swal.fire({
    title: '¿Marcar como cancelada?',
    text: 'La clase quedará no disponible para reservas.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No',
  });
  if (result.isConfirmed) {
    await clasesService.cancelarClase(id);
    await renderizarClases();
    Swal.fire({ icon: 'success', title: 'Cancelada', text: 'Clase marcada como Cancelada.' });
  }
};

window.cancelarClase   = window.desactivarClase;
window.eliminarClase   = window.desactivarClase;

window.reactivarClase = async function (id) {
  await clasesService.actualizarClase(id, { estado: 'Activa' });
  await renderizarClases();
  Swal.fire({ icon: 'success', title: 'Reactivada', text: 'La clase vuelve a estar disponible.' });
};
