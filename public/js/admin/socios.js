// public/js/admin/socios.js
// Backend: Supabase

let sociosCache = [];

const obtenerIniciales = (nombres, apellidos) =>
  (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();

const obtenerBadgeEstado = (estado) => {
  switch (estado) {
    case 'Activo':
      return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>';
    case 'Moroso':
      return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Moroso</span>';
    case 'Inactivo':
      return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>';
    default:
      return `<span class="badge bg-light text-dark">${estado}</span>`;
  }
};

const obtenerColorAvatar = (estado) => {
  switch (estado) {
    case 'Activo':   return 'bg-primary text-primary';
    case 'Moroso':   return 'bg-danger text-danger';
    case 'Inactivo': return 'bg-secondary text-secondary';
    default:         return 'bg-primary text-primary';
  }
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  const [y, m, d] = fechaISO.split('-');
  return `${d}/${m}/${y}`;
};

const calcularVencimiento = (duracionDias) => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + parseInt(duracionDias));
  return hoy.toISOString().split('T')[0];
};

// ===================== PLANES EN SELECTS =====================

async function cargarPlanesEnSelects() {
  const { data: planes, error } = await window.supabaseClient
    .from('planes')
    .select('id, nombre, precio, duracion')
    .eq('estado', 'Activo')
    .order('precio', { ascending: true });

  if (error || !planes) return;

  const selects = ['planSocio', 'editarPlan'];
  selects.forEach(selectId => {
    const el = document.getElementById(selectId);
    if (!el) return;
    el.innerHTML = '<option value="" disabled selected>Selecciona un plan...</option>';
    planes.forEach(plan => {
      const opt = document.createElement('option');
      opt.value = plan.id;
      opt.textContent = `${plan.nombre} (S/ ${parseFloat(plan.precio).toFixed(2)})`;
      opt.dataset.duracion = plan.duracion;
      opt.dataset.nombre = plan.nombre;
      el.appendChild(opt);
    });
  });
}

// ===================== TABLA =====================

const renderizarTabla = (socios) => {
  const tbody = document.getElementById('tablaSocios');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!socios || socios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron socios.</td></tr>';
    return;
  }

  socios.forEach(socio => {
    const iniciales   = obtenerIniciales(socio.nombres, socio.apellidos);
    const badgeEstado = obtenerBadgeEstado(socio.estado);
    const colorAvatar = obtenerColorAvatar(socio.estado);
    const planNombre  = socio.planes ? socio.planes.nombre : 'Sin plan';
    const vencimiento = formatearFecha(socio.vencimiento);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-4 text-gray-800 fw-medium">${socio.dni}</td>
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar ${colorAvatar} bg-opacity-10 rounded-circle d-flex align-items-center
            justify-content-center fw-bold me-3" style="width:40px;height:40px;">
            ${iniciales}
          </div>
          <div>
            <span class="fw-semibold text-gray-800 d-block">${socio.nombres} ${socio.apellidos}</span>
            <small class="text-muted">${socio.email || 'Sin correo'}</small>
          </div>
        </div>
      </td>
      <td class="text-gray-800">${planNombre}</td>
      <td class="text-gray-800">${vencimiento}</td>
      <td>${badgeEstado}</td>
      <td class="pe-4 text-center">
        <div class="btn-group gap-1">
          <button class="btn btn-sm btn-light text-secondary rounded" title="Ver Detalle"
            onclick="abrirModalVer('${socio.id}')"><i class="fa-regular fa-eye"></i></button>
          <button class="btn btn-sm btn-light text-primary rounded" title="Generar QR"
            onclick="abrirModalQR('${socio.id}')"><i class="fa-solid fa-qrcode"></i></button>
          <button class="btn btn-sm btn-light text-warning rounded" title="Editar"
            onclick="abrirModalEditar('${socio.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

// ===================== CARGAR SOCIOS =====================

async function cargarSocios() {
  const tbody = document.getElementById('tablaSocios');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

  const { data, error } = await window.supabaseClient
    .from('socios')
    .select('*, planes(nombre, duracion, precio)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar socios:', error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error al cargar socios.</td></tr>';
    return;
  }

  sociosCache = data || [];
  renderizarTabla(sociosCache);
}

// ===================== MODALES =====================

window.abrirModalVer = function (id) {
  const socio = sociosCache.find(s => s.id === id);
  if (!socio) return;

  document.getElementById('verNombres').value    = `${socio.nombres} ${socio.apellidos}`;
  document.getElementById('verCorreo').value     = socio.email || 'Sin correo registrado';
  document.getElementById('verPlan').value       = socio.planes ? socio.planes.nombre : 'Sin plan';
  document.getElementById('verVencimiento').value = formatearFecha(socio.vencimiento);
  document.getElementById('verEstado').value     = socio.estado;

  new bootstrap.Modal(document.getElementById('modalVerSocio')).show();
};

window.abrirModalQR = function (id) {
  const socio = sociosCache.find(s => s.id === id);
  if (!socio) return;

  document.getElementById('qrNombreSocio').textContent = `${socio.nombres} ${socio.apellidos}`;
  document.getElementById('qrImagen').src =
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FITFAB-DNI-${socio.dni}`;

  new bootstrap.Modal(document.getElementById('modalQRSocio')).show();
};

window.abrirModalEditar = function (id) {
  const socio = sociosCache.find(s => s.id === id);
  if (!socio) return;

  document.getElementById('editarNombres').value  = socio.nombres;
  document.getElementById('editarApellidos').value = socio.apellidos;
  document.getElementById('editarCorreo').value   = socio.email || '';
  document.getElementById('editarEstado').value   = socio.estado;

  const selectPlan = document.getElementById('editarPlan');
  if (selectPlan && socio.plan_id) {
    selectPlan.value = socio.plan_id;
  }

  selectPlan.dataset.socioId = id;
  new bootstrap.Modal(document.getElementById('modalEditarSocio')).show();
};

// ===================== INIT =====================

document.addEventListener('DOMContentLoaded', async () => {
  await cargarPlanesEnSelects();
  await cargarSocios();

  // Buscador
  const buscador = document.getElementById('buscadorSocios');
  if (buscador) {
    buscador.addEventListener('input', (e) => {
      const termino = e.target.value.toLowerCase().trim();
      const filtrados = sociosCache.filter(s => {
        const nombre = `${s.nombres} ${s.apellidos}`.toLowerCase();
        return s.dni.includes(termino) || nombre.includes(termino);
      });
      renderizarTabla(filtrados);
    });
  }

  // Registrar nuevo socio
  const formRegistro = document.getElementById('formRegistroSocio');
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectPlan  = document.getElementById('planSocio');
      const planId      = selectPlan.value;
      const planOption  = selectPlan.options[selectPlan.selectedIndex];
      const duracion    = planOption ? planOption.dataset.duracion : 30;

      const nuevoSocio = {
        nombres         : document.getElementById('nombresSocio').value.trim(),
        apellidos       : document.getElementById('apellidosSocio').value.trim(),
        dni             : document.getElementById('dniSocio').value.trim(),
        email           : document.getElementById('emailSocio').value.trim() || null,
        fecha_nacimiento: document.getElementById('fechaNacimientoSocio').value || null,
        plan_id         : planId,
        vencimiento     : calcularVencimiento(duracion),
        estado          : 'Activo'
      };

      const { error } = await window.supabaseClient.from('socios').insert(nuevoSocio);

      if (error) {
        console.error('Error al registrar socio:', error);
        Swal.fire({ title: 'Error', text: 'No se pudo registrar el socio. Verifica que el DNI no esté duplicado.', icon: 'error' });
        return;
      }

      await cargarSocios();
      formRegistro.reset();
      bootstrap.Modal.getInstance(document.getElementById('modalNuevoSocio'))?.hide();
      Swal.fire({ title: '¡Registrado!', text: 'Socio registrado correctamente.', icon: 'success' });
    });
  }

  // Editar socio
  const formEditar = document.getElementById('formEditarSocio');
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectPlan = document.getElementById('editarPlan');
      const socioId    = selectPlan.dataset.socioId;
      const planId     = selectPlan.value;
      const planOption = selectPlan.options[selectPlan.selectedIndex];
      const duracion   = planOption ? planOption.dataset.duracion : null;

      const datosActualizados = {
        nombres  : document.getElementById('editarNombres').value.trim(),
        apellidos: document.getElementById('editarApellidos').value.trim(),
        email    : document.getElementById('editarCorreo').value.trim() || null,
        plan_id  : planId,
        estado   : document.getElementById('editarEstado').value,
      };

      if (duracion) datosActualizados.vencimiento = calcularVencimiento(duracion);

      const { error } = await window.supabaseClient
        .from('socios')
        .update(datosActualizados)
        .eq('id', socioId);

      if (error) {
        console.error('Error al editar socio:', error);
        Swal.fire({ title: 'Error', text: 'No se pudo actualizar el socio.', icon: 'error' });
        return;
      }

      await cargarSocios();
      bootstrap.Modal.getInstance(document.getElementById('modalEditarSocio'))?.hide();
      Swal.fire({ title: '¡Actualizado!', text: 'Socio actualizado correctamente.', icon: 'success' });
    });
  }
});
