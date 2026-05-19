document.addEventListener("DOMContentLoaded", () => {
  iniciarReloj();
  renderizarClasesEntrenador();
});

function iniciarReloj() {
  const reloj = document.getElementById("relojEntrenador");
  if (!reloj) return;

  const actualizarReloj = () => {
    const ahora = new Date();

    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const diaNombre = dias[ahora.getDay()];
    const diaNumero = String(ahora.getDate()).padStart(2, "0");
    const mesNombre = meses[ahora.getMonth()];
    const fechaFormateada = `${diaNombre}, ${diaNumero} de ${mesNombre}`;
    const horaFormateada = ahora.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    reloj.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> Hoy: ${fechaFormateada} - ${horaFormateada}`;
  };

  actualizarReloj();
  setInterval(actualizarReloj, 1000);
}

function renderizarClasesEntrenador() {
  const contenedor = document.getElementById("contenedorClases");
  const emptyState = document.getElementById("emptyStateCoach");
  if (!contenedor) return;

  const clases = clasesService.obtenerClases() || [];
  contenedor.innerHTML = "";

  if (!clases.length) {
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");

  clases.forEach((clase) => {
    const fechaHoraRaw = clase.fecha_hora;
    let horaInicio = "";
    if (fechaHoraRaw) {
      const d = new Date(fechaHoraRaw);
      if (!isNaN(d)) {
        horaInicio = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      }
    }

    const coach = clase.coach_nombre || "";
    const ubicacion = clase.ubicacion || "";
    const capacidad = clase.capacidad_max || 0;
    const inscritos = clase.inscritos ? clase.inscritos.length : 0;
    const porcentaje = clasesService.calcularPorcentajeOcupacion(clase);
    const estadoClase = clase.estado || clase.estado_clase || "Activa";
    const cancelada = estadoClase === "Cancelada";
    const botonDisabled = cancelada ? "disabled" : "";
    const botonClase = cancelada ? "btn-secondary" : "btn-outline-success";
    const progressColor = cancelada
      ? "secondary"
      : porcentaje >= 100
        ? "danger"
        : "success";
    const textColor = cancelada
      ? "secondary"
      : porcentaje >= 100
        ? "danger"
        : "success";
    const opacityStyle = cancelada
      ? 'style="opacity:0.6; background:#f8f9fa;"'
      : "";

    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-xl-4";
    card.innerHTML = `
      <div class="card border-0 shadow-sm h-100 rounded-4 position-relative" ${opacityStyle}>
        ${cancelada ? `<div class="position-absolute top-0 end-0 m-3"><span class="badge bg-danger px-3 py-2">CLASE CANCELADA</span></div>` : ""}
        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
            <div class="bg-success bg-opacity-10 text-success rounded p-2 me-3 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
              <i class="fa-solid fa-dumbbell fs-5"></i>
            </div>
            ${clase.nombre}
          </h5>
        </div>
        <div class="card-body">
          <div class="mb-4 mt-2">
            <div class="d-flex align-items-center text-muted mb-2">
              <div class="bg-light rounded p-2 me-3 text-center" style="width: 35px;">
                <i class="fa-regular fa-clock text-success"></i>
              </div>
              <span class="fw-medium">${horaInicio}</span>
            </div>
            <div class="d-flex align-items-center text-muted mb-2">
              <div class="bg-light rounded p-2 me-3 text-center" style="width: 35px;">
                <i class="fa-solid fa-user-ninja text-success"></i>
              </div>
              <span class="fw-medium">${coach}</span>
            </div>
            <div class="d-flex align-items-center text-muted">
              <div class="bg-light rounded p-2 me-3 text-center" style="width: 35px;">
                <i class="fa-solid fa-location-dot text-success"></i>
              </div>
              <span class="fw-medium">${ubicacion}</span>
            </div>
          </div>
          <div class="p-3 bg-light rounded-3">
            <div class="d-flex justify-content-between align-items-end mb-2">
              <span class="small fw-semibold text-${cancelada ? "secondary" : textColor}">Asistentes confirmados: ${inscritos} / ${capacidad}</span>
              <span class="small fw-bold text-${cancelada ? "secondary" : textColor}">${porcentaje}%</span>
            </div>
            <div class="progress bg-white border" style="height: 10px;">
              <div class="progress-bar bg-${progressColor}" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${inscritos}" aria-valuemin="0" aria-valuemax="${capacidad}"></div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-white border-top-0 pb-4 pt-2">
          <button class="btn ${botonClase} w-100 fw-semibold" ${botonDisabled} onclick="abrirListaAsistentes(${clase.id})">
            <i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes
          </button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

window.abrirListaAsistentes = function (idClase) {
  const clase = clasesService.obtenerClasePorId(idClase);
  if (!clase) return;

  const ocNombre = document.getElementById("ocNombreClase");
  const ocHora = document.getElementById("ocHoraClase");
  const listaAlumnos = document.getElementById("listaAlumnos");

  if (ocNombre) ocNombre.textContent = clase.nombre;

  let horaInicio = "";
  if (clase.fecha_hora) {
    const d = new Date(clase.fecha_hora);
    if (!isNaN(d)) {
      horaInicio = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
  }
  if (ocHora) ocHora.textContent = horaInicio;

  const estadoClase = clase.estado || clase.estado_clase || "Activa";
  if (listaAlumnos) {
    if (estadoClase === "Cancelada") {
      listaAlumnos.innerHTML = `<div class="p-4 text-center text-danger"><h5 class="fw-bold">CLASE CANCELADA</h5><p class="small text-muted mb-0">Esta clase fue cancelada por el administrador y no tiene lista activa.</p></div>`;
    } else {
      listaAlumnos.innerHTML = "";
      const inscritos = clase.inscritos || [];
      if (!inscritos.length) {
        listaAlumnos.innerHTML = `<div class="p-4 text-center text-muted"><p class="mb-0">No hay alumnos inscritos.</p></div>`;
      } else {
        inscritos.forEach((alumno, index) => {
          listaAlumnos.innerHTML += `
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
        });
      }
    }
  }

  const offcanvasEl = document.getElementById("offcanvasAsistentes");
  if (offcanvasEl) {
    const offcanvas = new bootstrap.Offcanvas(offcanvasEl);
    offcanvas.show();
  }
};
