document.addEventListener('DOMContentLoaded', function() {
    // 1. Bar Chart - Ingresos de los últimos 6 meses
    const ctxIngresos = document.getElementById('ingresosChart');
    if (ctxIngresos) {
        new Chart(ctxIngresos, {
            type: 'bar',
            data: {
                labels: ['Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril'],
                datasets: [{
                    label: 'Ingresos (S/)',
                    data: [42000, 45500, 51000, 48200, 53000, 56400],
                    backgroundColor: '#0d6efd',
                    borderRadius: 6,
                    borderWidth: 0,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' S/ ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e2e8f0',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    }

    // 2. Doughnut Chart - Estado de los Socios
    const ctxSocios = document.getElementById('sociosChart');
    if (ctxSocios) {
        new Chart(ctxSocios, {
            type: 'doughnut',
            data: {
                labels: ['Activos', 'Morosos', 'Inactivos'],
                datasets: [{
                    data: [65, 15, 20],
                    backgroundColor: [
                        '#198754', // Success green
                        '#dc3545', // Danger red
                        '#6c757d'  // Secondary gray
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ' + context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
});
