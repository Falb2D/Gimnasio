document.addEventListener("DOMContentLoaded", () => {
  renderIngresosChart();
  renderGraficoCircular();
  initDateRangePicker();
  setupDashboardControls();
});

let ingresosChart = null;
let circularChart = null;
let dateRangePicker = null;
const defaultChartTitle = "Ingresos de este mes";

function renderIngresosChart() {
  const canvas = document.getElementById("graficoIngresos");
  if (!canvas || typeof Chart === "undefined") return;

  if (ingresosChart) {
    ingresosChart.destroy();
  }

  ingresosChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
      datasets: [
        {
          label: "Ingresos",
          data: [2200, 2450, 1980, 2750, 3050, 3280],
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.16)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#0d6efd",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6c757d" },
        },
        y: {
          grid: { color: "rgba(108, 117, 125, 0.16)" },
          ticks: {
            color: "#6c757d",
            callback: (value) => "$" + value,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => "$" + context.parsed.y,
          },
        },
      },
    },
  });
}

function obtenerDistribucionSociosPorPlan() {
  const planes = JSON.parse(localStorage.getItem("fitfab_planes")) || [];
  const planesActivos = planes.filter((plan) => plan.estado === "Activo");

  return planesActivos.map((plan) => ({
    nombre: plan.nombre,
    cantidad: Number(plan.cantidad_socios) || 0,
    color: plan.color || "#0d6efd",
  }));
}

function renderGraficoCircular() {
  const canvas = document.getElementById("graficoCircular");
  if (!canvas || typeof Chart === "undefined") return;

  if (circularChart) {
    circularChart.destroy();
  }

  const distribucion = obtenerDistribucionSociosPorPlan();
  const labels = distribucion.map((item) => item.nombre);
  const data = distribucion.map((item) => item.cantidad);
  const backgroundColor = distribucion.map((item) => item.color);

  const hasData = data.some((value) => value > 0);
  const chartLabels = hasData ? labels : ["Sin socios registrados"];
  const chartData = hasData ? data : [1];
  const chartColors = hasData ? backgroundColor : ["#e9ecef"];

  circularChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          hoverOffset: 8,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#6c757d", boxWidth: 12, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "Plan";
              const value = context.parsed || 0;
              return `${label}: ${value} socios`;
            },
          },
        },
      },
    },
  });
}

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
    dropdowns: {
      minYear: 2020,
      maxYear: new Date().getFullYear(),
      months: true,
      years: true,
    },
    format: "DD/MM/YYYY",
    tooltipText: {
      one: "día",
      other: "días",
    },
    setup: (picker) => {
      picker.on("selected", (date1, date2) => {
        if (date1 && date2) {
          const inicio = date1.format("DD/MM/YYYY");
          const fin = date2.format("DD/MM/YYYY");
          updateGraficoTitulo(`Ingresos del ${inicio} al ${fin}`);
          document
            .querySelectorAll("input[name='filtroRapido']")
            .forEach((radio) => {
              radio.checked = false;
            });
        }
      });
    },
  });
}

function setupDashboardControls() {
  const btnRangoPersonalizado = document.getElementById(
    "btnRangoPersonalizado",
  );
  const btnRestablecerFiltros = document.getElementById(
    "btnRestablecerFiltros",
  );
  const tituloGrafico = document.getElementById("tituloGraficoIngresos");
  const filtrosRapidos = Array.from(
    document.querySelectorAll("input[name='filtroRapido']"),
  );
  const btnExportarPDF = document.getElementById("btnExportarPDF");

  filtrosRapidos.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked || !tituloGrafico) return;
      switch (radio.id) {
        case "filtroHoy":
          updateGraficoTitulo("Ingresos del día de hoy");
          break;
        case "filtro7Dias":
          updateGraficoTitulo("Ingresos de los últimos 7 días");
          break;
        case "filtroEsteMes":
          updateGraficoTitulo("Ingresos de este mes");
          break;
        case "filtroEsteAno":
          updateGraficoTitulo("Ingresos de este año");
          break;
      }
    });
  });

  if (btnRangoPersonalizado) {
    btnRangoPersonalizado.addEventListener("click", () => {
      if (dateRangePicker) {
        dateRangePicker.show();
      }
    });
  }

  if (btnRestablecerFiltros) {
    btnRestablecerFiltros.addEventListener("click", () => {
      if (dateRangePicker) {
        dateRangePicker.clearSelection();
        dateRangePicker.hide();
      }
      const defaultFilter = document.getElementById("filtroEsteMes");
      if (defaultFilter) {
        defaultFilter.checked = true;
      }
      updateGraficoTitulo(defaultChartTitle);
      renderIngresosChart();
    });
  }

  if (btnExportarPDF) {
    btnExportarPDF.addEventListener("click", () => {
      const contenedorPrincipal = document.getElementById("dashboardContainer");
      if (!contenedorPrincipal) return;

      const opciones = {
        margin: 10,
        filename: "Dashboard_FITFAB.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      if (typeof html2pdf !== "undefined") {
        html2pdf().set(opciones).from(contenedorPrincipal).save();
      } else {
        alert("La función de exportar PDF no está disponible.");
      }
    });
  }
}

function updateGraficoTitulo(text) {
  const tituloGrafico = document.getElementById("tituloGraficoIngresos");
  if (!tituloGrafico) return;
  tituloGrafico.textContent = text;
}
