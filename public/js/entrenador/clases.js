document.addEventListener('DOMContentLoaded', () => {
    iniciarReloj();
});

function iniciarReloj() {
    const reloj = document.getElementById('relojEntrenador');
    if (!reloj) return;

    const actualizarReloj = () => {
        const ahora = new Date();

        // Arreglos para formatear el día y el mes
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const diaNombre = dias[ahora.getDay()];
        const diaNumero = String(ahora.getDate()).padStart(2, '0');
        const mesNombre = meses[ahora.getMonth()];
        
        // Formatear fecha: 'Jueves, 07 de Mayo'
        const fechaFormateada = `${diaNombre}, ${diaNumero} de ${mesNombre}`;

        // Formatear hora: '18:30:00'
        const horaFormateada = ahora.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });

        // Concatenar el string final
        const textoFinal = `Hoy: ${fechaFormateada} - ${horaFormateada}`;

        // Inyectar en el elemento (usamos innerHTML para preservar el ícono que tenía originalmente)
        reloj.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> ${textoFinal}`;
    };

    // Ejecutar la lógica una vez antes del setInterval para evitar el retraso inicial
    actualizarReloj();

    // Crear un setInterval que se ejecute cada 1000 milisegundos (1 segundo)
    setInterval(actualizarReloj, 1000);
}

// Función para generar alumnos genéricos (mock)
function generarAlumnos(cantidad) {
    const alumnos = [];
    for (let i = 1; i <= cantidad; i++) {
        // Generar un DNI aleatorio de 8 dígitos para darle realismo
        const dni = Math.floor(10000000 + Math.random() * 90000000);
        alumnos.push({
            nombre: `Alumno ${i}`,
            dni: dni.toString()
        });
    }
    return alumnos;
}

// Mock data de las clases del entrenador
const clasesEntrenador = [
    {
        id: 1,
        nombre: 'CrossFit WOD',
        hora: '18:00',
        inscritos: generarAlumnos(15) // Coincide con 15/20
    },
    {
        id: 2,
        nombre: 'HIIT Avanzado',
        hora: '19:30',
        inscritos: generarAlumnos(25) // Coincide con 25/25
    }
];

// Renderizado dinámico del Offcanvas
function abrirListaAsistentes(idClase) {
    // Buscar la clase correspondiente
    const clase = clasesEntrenador.find(c => c.id === idClase);
    if (!clase) return;

    // Actualizar el título y la hora del Offcanvas
    document.getElementById('ocNombreClase').textContent = clase.nombre;
    document.getElementById('ocHoraClase').textContent = clase.hora;

    // Vaciar el contenedor de la lista de alumnos
    const listaAlumnos = document.getElementById('listaAlumnos');
    listaAlumnos.innerHTML = '';

    // Recorrer el array inscritos e inyectar el HTML por cada alumno
    clase.inscritos.forEach((alumno, index) => {
        const itemHTML = `
            <div class="list-group-item py-3">
                <div class="d-flex align-items-center">
                    <div class="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold border" style="width: 40px; height: 40px;">
                        ${index + 1}
                    </div>
                    <div>
                        <h6 class="mb-0 fw-semibold text-gray-800">${alumno.nombre}</h6>
                        <small class="text-muted">DNI: ${alumno.dni}</small>
                    </div>
                </div>
            </div>
        `;
        listaAlumnos.innerHTML += itemHTML;
    });
}
