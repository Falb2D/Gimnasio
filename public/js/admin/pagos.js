// public/js/admin/pagos.js
// Backend: Supabase

let pagosCache  = [];
let planesCache = [];

const getIconoMetodo = (metodo) => {
  if (!metodo) return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
  switch (metodo.toLowerCase()) {
    case 'efectivo':               return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
    case 'transferencia bancaria': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
    case 'yape / plin':            return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
    default:                       return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
  }
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  const [y, m, d] = fechaISO.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

// ===================== RENDER HISTORIAL =====================

const renderizarPagos = (pagos) => {
  const tbody = document.getElementById('tablaPagos');
  const badge = document.getElementById('totalRecaudadoBadge');
  if (!tbody) return;

  const total = pagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  if (badge) badge.textContent = `Total Recaudado Histórico: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  tbody.innerHTML = '';
  if (!pagos.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron pagos.</td></tr>';
    return;
  }

  pagos.forEach(pago => {
    const nombreSocio = pago.socios ? `${pago.socios.nombres} ${pago.socios.apellidos}` : 'N/A';
    const dniSocio    = pago.socios?.dni ?? 'N/A';
    const planNombre  = pago.planes?.nombre ?? 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ps-4 text-gray-800">${formatearFecha(pago.fecha)}</td>
      <td>
        <span class="fw-bold">${nombreSocio}</span><br>
        <small class="text-muted">DNI: ${dniSocio}</small>
      </td>
      <td class="text-muted">${planNombre}</td>
      <td class="fw-bold text-success">S/ ${parseFloat(pago.monto || 0).toFixed(2)}</td>
      <td class="pe-4">
        <span class="badge bg-light text-dark border">
          ${getIconoMetodo(pago.metodo_pago)} ${pago.metodo_pago || 'N/A'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

async function cargarPagos() {
  const tbody = document.getElementById('tablaPagos');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></td></tr>';

  const { data, error } = await window.supabaseClient
    .from('pagos')
    .select('*, socios(nombres, apellidos, dni), planes(nombre)')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al cargar pagos:', error);
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar datos.</td></tr>';
    return;
  }

  pagosCache = data || [];
  renderizarPagos(pagosCache);
}

// ===================== MODAL REGISTRAR PAGO =====================

async function cargarSelectores() {
  const [{ data: socios }, { data: planes }] = await Promise.all([
    window.supabaseClient.from('socios').select('id, nombres, apellidos, dni').eq('estado', 'Activo').order('apellidos'),
    window.supabaseClient.from('planes').select('id, nombre, precio, duracion').eq('estado', 'Activo').order('nombre'),
  ]);

  planesCache = planes || [];

  const selSocio = document.getElementById('pagoSocioId');
  const selPlan  = document.getElementById('pagoPlanId');

  if (selSocio) {
    selSocio.innerHTML = '<option value="" disabled selected>Seleccionar socio...</option>';
    (socios || []).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.apellidos}, ${s.nombres} — DNI: ${s.dni}`;
      selSocio.appendChild(opt);
    });
  }

  if (selPlan) {
    selPlan.innerHTML = '<option value="" disabled selected>Seleccionar plan...</option>';
    planesCache.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nombre} — S/ ${parseFloat(p.precio).toFixed(2)} (${p.duracion} días)`;
      opt.dataset.precio   = p.precio;
      opt.dataset.duracion = p.duracion;
      selPlan.appendChild(opt);
    });
  }
}

function setupModalRegistrarPago() {
  const modalEl = document.getElementById('modalRegistrarPago');
  const form    = document.getElementById('formRegistrarPago');
  const selPlan = document.getElementById('pagoPlanId');
  const btnGuardar = document.getElementById('btnGuardarPago');

  // Fecha por defecto: hoy
  const inputFecha = document.getElementById('pagoFecha');
  if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

  // Auto-rellenar monto al elegir plan
  if (selPlan) {
    selPlan.addEventListener('change', () => {
      const opt = selPlan.options[selPlan.selectedIndex];
      const inputMonto = document.getElementById('pagoMonto');
      if (inputMonto && opt.dataset.precio) {
        inputMonto.value = parseFloat(opt.dataset.precio).toFixed(2);
      }
    });
  }

  // Cargar datos del modal cuando se abre
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', () => {
      cargarSelectores();
      if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];
    });
  }

  // Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const socioId      = document.getElementById('pagoSocioId').value;
      const planId       = document.getElementById('pagoPlanId').value;
      const monto        = parseFloat(document.getElementById('pagoMonto').value);
      const fecha        = document.getElementById('pagoFecha').value;
      const metodo       = document.getElementById('pagoMetodo').value;
      const observaciones = document.getElementById('pagoObservaciones').value.trim();

      if (!socioId || !planId || isNaN(monto) || !fecha || !metodo) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa todos los campos requeridos.', confirmButtonColor: '#0d6efd' });
        return;
      }

      if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Guardando...'; }

      // Calcular nueva fecha de vencimiento
      const selPlanEl = document.getElementById('pagoPlanId');
      const duracion  = parseInt(selPlanEl.options[selPlanEl.selectedIndex].dataset.duracion || '30', 10);
      const fechaPago    = new Date(fecha + 'T12:00:00');
      const fechaVenc    = new Date(fechaPago);
      fechaVenc.setDate(fechaVenc.getDate() + duracion);
      const vencimientoStr = fechaVenc.toISOString().split('T')[0];

      // 1. Insertar pago
      const { error: errorPago } = await window.supabaseClient
        .from('pagos')
        .insert({
          socio_id: socioId,
          plan_id: planId,
          monto,
          fecha,
          metodo_pago: metodo,
          observaciones: observaciones || null,
        });

      if (errorPago) {
        console.error('Error al registrar pago:', errorPago);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar el pago.', confirmButtonColor: '#0d6efd' });
        resetBtnGuardar();
        return;
      }

      // 2. Actualizar socio: vencimiento, plan y estado Activo
      const { error: errorSocio } = await window.supabaseClient
        .from('socios')
        .update({ plan_id: planId, vencimiento: vencimientoStr, estado: 'Activo' })
        .eq('id', socioId);

      if (errorSocio) console.error('Error al actualizar socio:', errorSocio);

      // 3. Refrescar historial
      await cargarPagos();

      // Cerrar modal y limpiar
      bootstrap.Modal.getInstance(document.getElementById('modalRegistrarPago'))?.hide();
      form.reset();
      if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

      Swal.fire({
        icon: 'success',
        title: '¡Pago registrado!',
        html: `Membresía renovada hasta el <strong>${vencimientoStr.split('-').reverse().join('/')}</strong>`,
        confirmButtonColor: '#0d6efd',
        timer: 3000,
        timerProgressBar: true,
      });

      resetBtnGuardar();
    });
  }

  function resetBtnGuardar() {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = '<i class="fa-solid fa-check me-2"></i> Confirmar Pago';
    }
  }
}

// ===================== AUTO-ACTUALIZAR SOCIOS MOROSOS =====================

async function actualizarSociosMorosos() {
  const hoy = new Date().toISOString().split('T')[0];
  await window.supabaseClient
    .from('socios')
    .update({ estado: 'Moroso' })
    .eq('estado', 'Activo')
    .lt('vencimiento', hoy);
}

// ===================== INIT =====================

document.addEventListener('DOMContentLoaded', async () => {
  await actualizarSociosMorosos();
  await cargarPagos();
  setupModalRegistrarPago();

  const buscador = document.getElementById('buscadorPagos');
  if (buscador) {
    buscador.addEventListener('input', (e) => {
      const termino = e.target.value.toLowerCase().trim();
      const filtrados = pagosCache.filter(p => {
        const nombre = p.socios ? `${p.socios.nombres} ${p.socios.apellidos}`.toLowerCase() : '';
        const dni    = p.socios?.dni ?? '';
        return nombre.includes(termino) || dni.includes(termino);
      });
      renderizarPagos(filtrados);
    });
  }
});
