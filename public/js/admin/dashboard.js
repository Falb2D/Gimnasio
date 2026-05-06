document.addEventListener('DOMContentLoaded', () => {
    cargarMetricas();
    renderizarGraficos();
});

async function cargarMetricas() {
    const elIngresos = document.getElementById('ingresosMes');
    const elSocios = document.getElementById('sociosActivos');
    const elMorosos = document.getElementById('sociosMorosos');
    const elAforo = document.getElementById('aforoActual');

    // Helper para mostrar spinner si la función se llama de nuevo
    const mostrarLoader = (elemento) => {
        if (elemento) {
            elemento.innerHTML = '<span class="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>';
        }
    };

    mostrarLoader(elIngresos);
    mostrarLoader(elSocios);
    mostrarLoader(elMorosos);
    mostrarLoader(elAforo);

    // Simular una petición fetch asíncrona con setTimeout
    try {
        const datos = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ingresosMes: "S/ 62,300",
                    sociosActivos: 1350,
                    sociosMorosos: 92,
                    aforoActual: "55 / 100"
                });
            }, 800); // 800ms de retraso simulado
        });

        // Actualizar el DOM con los datos recibidos (textContent reemplaza el HTML del spinner)
        if (elIngresos) elIngresos.textContent = datos.ingresosMes;
        if (elSocios) elSocios.textContent = datos.sociosActivos;
        if (elMorosos) elMorosos.textContent = datos.sociosMorosos;
        if (elAforo) elAforo.textContent = datos.aforoActual;

    } catch (error) {
        console.error("Error al cargar las métricas:", error);
    }
}

function renderizarGraficos() {
    const canvasIngresos = document.getElementById('ingresosChart');
    const canvasSocios = document.getElementById('sociosChart');

    // Gráfico 1: Ingresos de los últimos 6 meses (Barras)
    if (canvasIngresos) {
        const ctxIngresos = canvasIngresos.getContext('2d');
        new Chart(ctxIngresos, {
            type: 'bar',
            data: {
                labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
                datasets: [{
                    label: 'Ingresos (S/)',
                    data: [48000, 52000, 60000, 55000, 58000, 62300],
                    backgroundColor: '#0d6efd', // Azul corporativo / Bootstrap primary
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Ocultar leyenda ya que solo hay una métrica
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico 2: Estado de los Socios (Doughnut)
    if (canvasSocios) {
        const ctxSocios = canvasSocios.getContext('2d');
        new Chart(ctxSocios, {
            type: 'doughnut',
            data: {
                labels: ['Activos', 'Morosos', 'Inactivos'],
                datasets: [{
                    data: [1350, 92, 120],
                    backgroundColor: [
                        '#198754', // Verde (Activos)
                        '#dc3545', // Rojo (Morosos)
                        '#6c757d'  // Gris (Inactivos)
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 13
                            }
                        }
                    }
                },
                cutout: '70%' // Hace que el donut sea más delgado (estilo moderno)
            }
        });
    }
}
