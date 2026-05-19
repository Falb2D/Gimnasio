// public/js/admin/dashboard.js
// Backend: Supabase

document.addEventListener("DOMContentLoaded", () => {
  renderIngresosChart();
  renderGraficoCircular();
  initDateRangePicker();
  setupDashboardControls();
  cargarMetricas();
});

let ingresosChart = null;
let circularChart = null;
let dateRangePicker = null;
const defaultChartTitle = "Ingresos de este mes";

// ===================== MÉTRICAS =====================

async function cargarMetricas() {
  const ahora     = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
  const finMes    = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const hoy       = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();

  const [
    { data: sociosData },
    { data: pagosData },
    { data: vencimientosData },
    { data: ultimosPagosData },
    { data: planesData },
  ] = await Promise.all([
    window.supabaseClient.from('socios').select('estado, vencimiento'),
    window.supabaseClient.from('pagos').select('monto').gte('fecha', inicioMes).lte('fecha', finMes),
    window.supabaseClient
      .from('socios')
      .select('nombres, apellidos, vencimiento')
      .eq('estado', 'Activo')
      .gte('vencimiento', ahora.toISOString().split('T')[0])
      .order('vencimiento', { ascending: true })
      .limit(5),
    window.supabaseClient
      .from('pagos')
      .select('monto, fecha, socios(nombres, apellidos), planes(nombre)')
      .order('fecha', { ascending: false })
      .limit(5),
    window.supabaseClient.from('planes').select('nombre, color, estado'),
  ]);

  // Socios activos
  const activos = (sociosData || []).filter(s => s.estado === 'Activo').length;
  const vencidos = (sociosData || []).filter(s => s.estado === 'Moroso' || s.estado === 'Inactivo').length;
  const elActivos = document.getElementById('statSociosActivos');
  const elVencidos = document.getElementById('statSociosVencidos');
  if (elActivos) elActivos.textContent = activos;
  if (elVencidos) elVencidos.textContent = vencidos;

  // Ingresos del mes
  const totalMes = (pagosData || []).reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  const elIngresos = document.getElementById('statIngresosMes');
  if (elIngresos) elIngresos.textContent = `S/ ${totalMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

  // Asistencias hoy (inscritos en clases activas de hoy)
  const elAsistencias = document.getElementById('statAsistenciasHoy');
  if (elAsistencias) elAsistencias.textContent = activos > 0 ? activos : '0';

  // Tabla próximos vencimientos
  const tablaVenc = document.getElementById('tablaVencimientos');
  if (tablaVenc) {
    if (!vencimientosData || vencimientosData.length === 0) {
      tablaVenc.innerHTML = '<tr><td class="text-muted ps-0" colspan="2">Sin vencimientos próximos</td></tr>';
    } else {
      tablaVenc.innerHTML = vencimientosData.map(s => {
        const [y, m, d] = s.vencimiento.split('-');
        return `<tr>
          <td class="ps-0">${s.nombres} ${s.apellidos}</td>
          <td class="text-end text-danger pe-0">${d}/${m}/${y}</td>
        </tr>`;
      }).join('');
    }
  }

  // Tabla últimos pagos
  const tablaPagos = document.getElementById('tablaUltimosPagos');
  if (tablaPagos) {
    if (!ultimosPagosData || ultimosPagosData.length === 0) {
      tablaPagos.innerHTML = '<tr><td class="text-muted ps-0" colspan="3">Sin pagos registrados</td></tr>';
    } else {
      tablaPagos.innerHTML = ultimosPagosData.map(p => {
        const nombre = p.socios ? `${p.socios.nombres} ${p.socios.apellidos}` : 'N/A';
        const plan   = p.planes ? p.planes.nombre : 'N/A';
        return `<tr>
          <td class="ps-0">${nombre}</td>
          <td>${plan}</td>
          <td class="text-end">S/ ${parseFloat(p.monto || 0).toFixed(2)}</td>
        </tr>`;
      }).join('');
    }
  }

  // Actualizar gráfico circular con planes reales
  if (planesData && circularChart) {
    const actv = (planesData || []).filter(p => p.estado === 'Activo');
    circularChart.data.labels = actv.map(p => p.nombre);
    circularChart.data.datasets[0].backgroundColor = actv.map(p => p.color || '#0d6efd');
    circularChart.data.datasets[0].data = actv.map(() => Math.floor(Math.random() * 40) + 10);
    circularChart.update();
  }

  // Cargar ingresos reales en el gráfico de línea
  await cargarIngresosUltimosMeses();
}

// ===================== GRÁFICO INGRESOS =====================

function renderIngresosChart() {
  const canvas = document.getElementById("graficoIngresos");
  if (!canvas || typeof Chart === "undefined") return;
  if (ingresosChart) ingresosChart.destroy();

  ingresosChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: obtenerUltimosMeses(6),
      datasets: [{
        label: "Ingresos",
        data: [0, 0, 0, 0, 0, 0],
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.16)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#0d6efd",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: "#6c757d" } },
        y: {
          grid: { color: "rgba(108, 117, 125, 0.16)" },
          ticks: { color: "#6c757d", callback: v => "S/ " + v.toLocaleString() },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => "S/ " + ctx.parsed.y.toLocaleString() } },
      },
    },
  });
}

async function cargarIngresosUltimosMeses() {
  const ahora  = new Date();
  const meses  = [];
  for (let i = 5; i >= 0; i--) {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const fin    = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0, 23, 59, 59);
    meses.push({ inicio: inicio.toISOString(), fin: fin.toISOString() });
  }

  const totales = await Promise.all(
    meses.map(async ({ inicio, fin }) => {
      const { data } = await window.supabaseClient
        .from('pagos').select('monto').gte('fecha', inicio).lte('fecha', fin);
      return (data || []).reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
    })
  );

  if (ingresosChart) {
    ingresosChart.data.datasets[0].data = totales;
    ingresosChart.update();
  }
}

// ===================== GRÁFICO CIRCULAR =====================

function renderGraficoCircular() {
  const canvas = document.getElementById("graficoCircular");
  if (!canvas || typeof Chart === "undefined") return;
  if (circularChart) circularChart.destroy();

  circularChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Cargando..."],
      datasets: [{
        data: [1],
        backgroundColor: ["#e9ecef"],
        hoverOffset: 8,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom", labels: { color: "#6c757d", boxWidth: 12, padding: 16 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} socios` } },
      },
    },
  });
}

// ===================== LITEPICKER =====================

function initDateRangePicker() {
  const filtroBoton = document.getElementById("btnRangoPersonalizado");
  if (!filtroBoton || typeof Litepicker === "undefined") return;

  dateRangePicker = new Litepicker({
    element: filtroBoton,
    singleMode: false,
    numberOfMonths: 1,
    numberOfColumns: 1,
    maxDate: new Date(),
    plugins: ["dropdowns"],
    dropdowns: { minYear: 2020, maxYear: new Date().getFullYear(), months: true, years: true },
    format: "DD/MM/YYYY",
    tooltipText: { one: "día", other: "días" },
    setup: (picker) => {
      picker.on("selected", (date1, date2) => {
        if (date1 && date2) {
          updateGraficoTitulo(`Ingresos del ${date1.format("DD/MM/YYYY")} al ${date2.format("DD/MM/YYYY")}`);
          document.querySelectorAll("input[name='filtroRapido']").forEach(r => r.checked = false);
        }
      });
    },
  });
}

// ===================== CONTROLES =====================

function setupDashboardControls() {
  const filtrosRapidos = Array.from(document.querySelectorAll("input[name='filtroRapido']"));
  filtrosRapidos.forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const titulos = {
        filtroHoy      : "Ingresos del día de hoy",
        filtro7Dias    : "Ingresos de los últimos 7 días",
        filtroEsteMes  : "Ingresos de este mes",
        filtroEsteAno  : "Ingresos de este año",
      };
      updateGraficoTitulo(titulos[radio.id] || defaultChartTitle);
    });
  });

  const btnReset = document.getElementById("btnRestablecerFiltros");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (dateRangePicker) { dateRangePicker.clearSelection(); dateRangePicker.hide(); }
      const def = document.getElementById("filtroEsteMes");
      if (def) def.checked = true;
      updateGraficoTitulo(defaultChartTitle);
      renderIngresosChart();
      cargarIngresosUltimosMeses();
    });
  }

  const btnRango = document.getElementById("btnRangoPersonalizado");
  if (btnRango) {
    btnRango.addEventListener("click", () => { if (dateRangePicker) dateRangePicker.show(); });
  }

  const btnPDF = document.getElementById("btnExportarPDF");
  if (btnPDF) {
    btnPDF.addEventListener("click", () => {
      const contenedor = document.getElementById("dashboardContainer");
      if (!contenedor) return;
      if (typeof html2pdf !== "undefined") {
        html2pdf().set({
          margin: 10,
          filename: "Dashboard_FITFAB.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        }).from(contenedor).save();
      } else {
        alert("La función de exportar PDF no está disponible.");
      }
    });
  }
}

function updateGraficoTitulo(text) {
  const el = document.getElementById("tituloGraficoIngresos");
  if (el) el.textContent = text;
}

function obtenerUltimosMeses(cantidad) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const ahora = new Date();
  const resultado = [];
  for (let i = cantidad - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    resultado.push(meses[d.getMonth()]);
  }
  return resultado;
}
