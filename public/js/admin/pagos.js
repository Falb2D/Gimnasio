// public/js/admin/pagos.js
// Backend: Supabase

let pagosCache = [];

const getIconoMetodo = (metodo) => {
  if (!metodo) return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
  switch (metodo.toLowerCase()) {
    case 'efectivo':             return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
    case 'transferencia bancaria': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
    case 'yape / plin':          return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
    default:                     return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
  }
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/A';
  const d = new Date(fechaISO);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const renderizarPagos = (pagos) => {
  const tbody   = document.getElementById('tablaPagos');
  const badge   = document.getElementById('totalRecaudadoBadge');
  if (!tbody) return;

  const total = pagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  if (badge) badge.textContent = `Total Recaudado Histórico: S/ ${total.toFixed(2)}`;

  tbody.innerHTML = '';
  if (!pagos || pagos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron pagos.</td></tr>';
    return;
  }

  pagos.forEach(pago => {
    const nombreSocio = pago.socios
      ? `${pago.socios.nombres} ${pago.socios.apellidos}`
      : 'N/A';
    const dniSocio  = pago.socios ? pago.socios.dni : 'N/A';
    const planNombre = pago.planes ? pago.planes.nombre : 'N/A';

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
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar pagos.</td></tr>';
    return;
  }

  pagosCache = data || [];
  renderizarPagos(pagosCache);
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarPagos();

  const buscador = document.getElementById('buscadorPagos');
  if (buscador) {
    buscador.addEventListener('input', (e) => {
      const termino = e.target.value.toLowerCase().trim();
      const filtrados = pagosCache.filter(p => {
        const nombre = p.socios ? `${p.socios.nombres} ${p.socios.apellidos}`.toLowerCase() : '';
        const dni    = p.socios ? p.socios.dni : '';
        return nombre.includes(termino) || dni.includes(termino);
      });
      renderizarPagos(filtrados);
    });
  }
});
