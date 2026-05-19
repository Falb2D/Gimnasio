document.addEventListener("DOMContentLoaded", () => {
  let claseSeleccionadaId = null;

  const contenedorClases = document.getElementById("contenedorClases");
  const formInscribir = document.getElementById("formInscribir");

  const offcanvasClassName = document.getElementById("offcanvasClassName");
  const offcanvasClassTime = document.getElementById("offcanvasClassTime");
  const offcanvasClassAforo = document.getElementById("offcanvasClassAforo");
  const offcanvasListContainer = document.getElementById(
    "offcanvasListContainer",
  );

  // Función para mostrar fecha y hora dinámica
  const mostrarFechaActual = () => {
    const badgeFecha = document.getElementById("badgeFechaActual");
    if (!badgeFecha) return;

    const actualizarReloj = () => {
      const fecha = new Date();

      const opcionesDia = { weekday: "long" };
      const opcionesMes = { month: "long" };

      let diaSemana = new Intl.DateTimeFormat("es-ES", opcionesDia).format(
        fecha,
      );
      let diaNumero = fecha.getDate().toString().padStart(2, "0");
      let mes = new Intl.DateTimeFormat("es-ES", opcionesMes).format(fecha);

      diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      mes = mes.charAt(0).toUpperCase() + mes.slice(1);

      const horaActual = fecha.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      badgeFecha.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> ${diaSemana}, ${diaNumero} de ${mes} - ${horaActual}`;
    };

    actualizarReloj();
    setInterval(actualizarReloj, 1000);
  };

  // Renderizado Dinámico de Clases (CORREGIDO: usa clasesService)
  const renderizarClases = () => {
    if (!contenedorClases) return;

    const clases = clasesService.obtenerClases();
    contenedorClases.innerHTML = "";

    clases.forEach((clase) => {
      // Mapeo defensivo
      const horarioRaw = clase.horario || clase.fecha_hora || clase.hora || "";
      let horario = "—";
      if (clase.fecha_hora) {
        const d = new Date(clase.fecha_hora);
        if (!isNaN(d))
          horario = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} hrs`;
      }
      if (horario === "—" && horarioRaw) {
        const m = horarioRaw.toString().match(/(\d{1,2}:\d{2})/);
        horario = m ? `${m[1]} hrs` : horarioRaw || "—";
      }
      const coach = clase.coach || clase.coach_nombre || "—";
      const salon = clase.salon || clase.ubicacion || "—";
      const capacidad =
        clase.capacidad_max || clase.capacidad || clase.capacidad_maxima || 0;
      const reservasActuales = clase.inscritos
        ? clase.inscritos.length
        : clase.reservas_actuales || 0;
      const porcentaje =
        clasesService.calcularPorcentajeOcupacion({
          capacidad_max: capacidad,
          inscritos: clase.inscritos,
        }) || 0;
      const estado = clasesService.obtenerEstadoVisual({
        capacidad_max: capacidad,
        inscritos: clase.inscritos,
      });
      const estaLlena = clasesService.estaLlena({
        capacidad_max: capacidad,
        inscritos: clase.inscritos,
      });
      const estadoClase = clase.estado || clase.estado_clase || "Activa";
      const cancelada = estadoClase === "Cancelada";
      const badgeHtml = cancelada
        ? `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1">CANCELADA</span>`
        : `<span class="badge bg-${estado.colorBadge} bg-opacity-10 text-${estado.colorBadge} border border-${estado.colorBadge} border-opacity-25 rounded-pill px-3 py-1">${estado.badge}</span>`;
      const cardClasses = `card border-0 shadow-sm h-100 rounded-4${cancelada ? " opacity-50 bg-light" : ""}`;
      const progressBarClass = cancelada ? "bg-secondary" : `bg-${estado.color}`;

      const cardHtml = `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="${cardClasses}">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                <div class="${clase.bg_icono} bg-opacity-10 ${clase.text_icono} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                  <i class="fa-solid ${clase.icono || "fa-regular fa-calendar-check"} fs-5"></i>
                </div>
                ${clase.nombre}
              </h5>
              ${badgeHtml}
            </div>
            <div class="card-body">
              <div class="mb-3">
                <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${horario}</p>
                <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${coach}</p>
                <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${salon}</p>
              </div>

              <div class="mt-4">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="small fw-medium ${estaLlena ? "text-danger" : "text-muted"}">Reservas: ${reservasActuales} / ${clase.capacidad_max}</span>
                  <span class="small fw-bold text-${estado.color}">${porcentaje}%</span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar ${progressBarClass} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${reservasActuales}" aria-valuemin="0" aria-valuemax="${clase.capacidad_max}"></div>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-top-0 pb-4 pt-3">
                <div class="d-flex gap-2">
                ${
                  estadoClase === "Cancelada"
                    ? `
                  <button class="btn btn-secondary flex-grow-1 fw-medium bg-secondary bg-opacity-10 text-secondary border-0" disabled>
                    <i class="fa-solid fa-ban me-1"></i> No Disponible
                  </button>
                `
                    : estaLlena
                      ? `
                  <button class="btn btn-secondary flex-grow-1 fw-medium bg-secondary bg-opacity-10 text-secondary border-0" disabled>
                    <i class="fa-solid fa-ban me-1"></i> Aforo Lleno
                  </button>
                `
                      : `
                  <button class="btn btn-primary flex-grow-1 fw-medium shadow-sm btn-inscribir" data-id="${clase.id}" data-nombre="${clase.nombre}">
                    <i class="fa-solid fa-user-plus me-1"></i> Inscribir Socio
                  </button>
                `
                }
                <button class="btn btn-outline-${estaLlena ? "danger" : "secondary"} border shadow-sm btn-ver-asistentes" data-id="${clase.id}" title="Lista de Asistentes" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAsistentes">
                  <i class="fa-solid fa-clipboard-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      contenedorClases.insertAdjacentHTML("beforeend", cardHtml);
    });

    // Eventos para Inscribir
    const botonesInscribir =
      contenedorClases.querySelectorAll(".btn-inscribir");
    botonesInscribir.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        const nombre = e.currentTarget.getAttribute("data-nombre");

        claseSeleccionadaId = id;
        document.getElementById("nombreClaseInscripcion").innerText = nombre;
        document.getElementById("dniInscripcion").value = "";

        let modal = bootstrap.Modal.getInstance(
          document.getElementById("modalInscribirSocio"),
        );
        if (!modal)
          modal = new bootstrap.Modal(
            document.getElementById("modalInscribirSocio"),
          );
        modal.show();
      });
    });

    // Eventos para Ver Asistentes
    const botonesVerAsistentes = contenedorClases.querySelectorAll(
      ".btn-ver-asistentes",
    );
    botonesVerAsistentes.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        renderizarOffcanvas(id);
      });
    });
  };

  // Renderizar Offcanvas (Lista de Inscritos y Cabecera)
  const renderizarOffcanvas = (claseId) => {
    const clase = clasesService.obtenerClasePorId(claseId);
    if (!clase) return;

    const reservasActuales = clase.inscritos ? clase.inscritos.length : 0;

    // Renderizar Cabecera
    if (offcanvasClassName) offcanvasClassName.innerText = clase.nombre;
    const horarioTexto = clase.horario || clase.fecha_hora || clase.hora || "";
    const inicio = horarioTexto.includes(" - ")
      ? horarioTexto.split(" - ")[0]
      : horarioTexto;
    if (offcanvasClassTime)
      offcanvasClassTime.innerHTML = `<i class="fa-regular fa-clock me-1"></i> Hoy, ${inicio}`;
    const capacidadReal =
      clase.capacidad_max || clase.capacidad || clase.capacidad_maxima || 0;
    if (offcanvasClassAforo) {
      offcanvasClassAforo.innerText = `Aforo: ${reservasActuales}/${capacidadReal}`;
      if (
        clasesService.estaLlena({
          capacidad_max: capacidadReal,
          inscritos: clase.inscritos,
        })
      ) {
        offcanvasClassAforo.className =
          "badge bg-danger bg-opacity-10 text-danger px-2 rounded-pill";
      } else {
        offcanvasClassAforo.className =
          "badge bg-primary bg-opacity-10 text-primary px-2 rounded-pill";
      }
    }

    // Renderizar Lista de Inscritos
    if (offcanvasListContainer) {
      offcanvasListContainer.innerHTML = "";

      if (!clase.inscritos || clase.inscritos.length === 0) {
        offcanvasListContainer.innerHTML = `<div class="p-4 text-center text-muted small">No hay socios inscritos.</div>`;
        return;
      }

      clase.inscritos.forEach((inscrito) => {
        const itemHtml = `
          <div class="list-group-item bg-transparent py-3 border-bottom border-light">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <img src="https://ui-avatars.com/api/?name=${inscrito.nombre.replace(/ /g, "+")}&background=0D6EFD&color=fff&rounded=true" width="32" class="rounded-circle me-3">
                <div>
                  <h6 class="mb-0 fw-semibold text-gray-800 fs-6">${inscrito.nombre}</h6>
                  <small class="text-muted">DNI: ${inscrito.dni}</small>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-danger border rounded-circle btn-cancelar-reserva" data-clase-id="${clase.id}" data-socio-dni="${inscrito.dni}" title="Cancelar Reserva">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        offcanvasListContainer.insertAdjacentHTML("beforeend", itemHtml);
      });

      // Asignar eventos a los botones de cancelar reserva
      const botonesCancelar = offcanvasListContainer.querySelectorAll(
        ".btn-cancelar-reserva",
      );
      botonesCancelar.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const cId = parseInt(e.currentTarget.getAttribute("data-clase-id"));
          const sDni = e.currentTarget.getAttribute("data-socio-dni");

          if (confirm("¿Desea cancelar la reserva de este socio?")) {
            cancelarReserva(cId, sDni);
          }
        });
      });
    }
  };

  // Lógica para Cancelar Reserva
  const cancelarReserva = (claseId, socioDni) => {
    clasesService.desuscribirSocio(claseId, socioDni);
    renderizarOffcanvas(claseId);
    renderizarClases();
  };

  // Lógica para Confirmar Reserva (Nueva Inscripción Modal)
  if (formInscribir) {
    formInscribir.addEventListener("submit", (e) => {
      e.preventDefault();

      if (claseSeleccionadaId !== null) {
        const clase = clasesService.obtenerClasePorId(claseSeleccionadaId);
        if (clase && !clasesService.estaLlena(clase)) {
          const dni = document.getElementById("dniInscripcion").value.trim();

          if (dni) {
            const exito = clasesService.inscribirSocio(
              claseSeleccionadaId,
              dni,
              "Socio de Prueba",
            );

            if (exito) {
              renderizarClases();

              const modalEl = document.getElementById("modalInscribirSocio");
              const modalInstance = bootstrap.Modal.getInstance(modalEl);
              if (modalInstance) {
                modalInstance.hide();
              }

              alert("Socio inscrito correctamente en la clase");
              claseSeleccionadaId = null;
            } else {
              alert(
                "El socio ya está inscrito en esta clase o no se pudo completar la inscripción",
              );
            }
          }
        }
      }
    });
  }

  // Inicialización
  mostrarFechaActual();
  renderizarClases();
});
