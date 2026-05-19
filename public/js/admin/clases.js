// public/js/admin/clases.js
// Usa clasesService como fuente única de verdad

document.addEventListener("DOMContentLoaded", () => {
  const contenedorClases = document.getElementById("contenedorClases");
  const formNuevaClase = document.getElementById("formNuevaClase");

  // Función para ver asistentes
  const verAsistentes = (nombreClase) => {
    const tituloModal = document.getElementById("nombreClaseModal");
    if (tituloModal) {
      tituloModal.textContent = nombreClase;
    }

    const clase = clasesService.obtenerClasePorNombre(nombreClase);

    // Inyectar los nombres reales en la lista (ul)
    const listaAsistentes = document.getElementById("listaAsistentesModal");
    if (listaAsistentes) {
      if (clase && clase.inscritos && clase.inscritos.length > 0) {
        listaAsistentes.innerHTML = clase.inscritos
          .map((inscrito, index) => {
            return `
            <li class="list-group-item px-0 py-3 ${index !== clase.inscritos.length - 1 ? "border-bottom" : "border-bottom border-0"}">
              <i class="fa-solid fa-user text-secondary me-3"></i> ${inscrito.nombre}
            </li>
          `;
          })
          .join("");
      } else {
        listaAsistentes.innerHTML = `<li class="list-group-item px-0 py-3 text-muted">No hay inscritos.</li>`;
      }
    }

    // Mostrar el modal en pantalla usando la API nativa de Bootstrap
    const modalEl = document.getElementById("modalAsistentes");
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  };

  // Renderizado Dinámico (CORREGIDO: usa clasesService)
  const renderizarClases = () => {
    if (!contenedorClases) return;

    // Limpiar contenedor
    contenedorClases.innerHTML = "";

    // Obtener datos desde clasesService
    const clases = clasesService.obtenerClases();

    clases.forEach((clase) => {
      // Mapeo EXACTO: usar las claves de la base de datos
      const fechaHoraRaw = clase.fecha_hora;
      let horario = "";
      if (fechaHoraRaw) {
        const d = new Date(fechaHoraRaw);
        if (!isNaN(d)) {
          horario = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} hrs`;
        }
      }

      const coach = clase.coach_nombre ?? "";
      const salon = clase.ubicacion ?? "";
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
      const estadoVisual = clasesService.obtenerEstadoVisual(clase);
      const estaLlena = clasesService.estaLlena({
        capacidad_max: capacidad,
        inscritos: clase.inscritos,
      });
      const estadoClase = clase.estado || clase.estado_clase || "Activa";
      const cancelada = estadoClase === "Cancelada";
      const actionButtonHtml = cancelada
        ? `<button class="btn btn-sm btn-outline-success ms-2" onclick="reactivarClase(${clase.id})"><i class="fa-solid fa-undo"></i></button>`
        : `<button class="btn btn-sm btn-outline-danger ms-2" onclick="desactivarClase(${clase.id})"><i class="fa-solid fa-ban"></i></button>`;

      const card = document.createElement("div");
      card.className = "col-12 col-md-6 col-xl-4";

      const opacityStyle = cancelada
        ? 'style="opacity:0.6; background:#f8f9fa;"'
        : "";

      card.innerHTML = `
        <div class="card border-0 shadow-sm h-100 rounded-4 position-relative" ${opacityStyle}>
          <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
              <div class="${clase.bg_icono || "bg-secondary"} bg-opacity-10 ${clase.text_icono || "text-secondary"} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                <i class="fa-solid ${clase.icono || "fa-regular fa-calendar-check"} fs-5"></i>
              </div>
              ${clase.nombre}
            </h5>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-${estadoVisual.colorBadge} bg-opacity-10 text-${estadoVisual.colorBadge} border border-${estadoVisual.colorBadge} border-opacity-25 rounded-pill px-3 py-1">${estadoVisual.badge}</span>
              <button class="btn btn-sm btn-outline-primary ms-2" ${cancelada ? "disabled" : ""} onclick="abrirModalEditar(${clase.id})">
                <i class="fa-solid fa-pencil-alt"></i>
              </button>
              ${actionButtonHtml}
            </div>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${horario}</p>
              <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${coach}</p>
              <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${salon}</p>
            </div>

            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-end mb-1">
                <span class="small fw-medium ${estaLlena ? "text-danger" : "text-muted"}">Reservas: ${reservasActuales} / ${capacidad}</span>
                <span class="small fw-bold text-${estadoVisual.color}">${porcentaje}%</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-${estadoVisual.color} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${reservasActuales}" aria-valuemin="0" aria-valuemax="${capacidad}"></div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0 pb-4 pt-0">
            ${estadoClase === "Cancelada" ? `<button class="btn btn-secondary w-100 rounded-3" disabled>No Disponible</button>` : `<button class="btn btn-outline-${estadoVisual.color} w-100 rounded-3 btn-asistentes" data-nombre="${clase.nombre}"><i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes</button>`}
          </div>
        </div>
      `;

      contenedorClases.appendChild(card);
    });

    // Asignar event listeners a los nuevos botones de "Ver Asistentes"
    const botonesAsistentes = document.querySelectorAll(".btn-asistentes");
    botonesAsistentes.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const nombreClase = e.currentTarget.getAttribute("data-nombre");
        verAsistentes(nombreClase);
      });
    });
  };

  // Renderizar la grilla inicial
  renderizarClases();

  // Programar Nueva Clase (Lógica del formulario)
  if (formNuevaClase) {
    formNuevaClase.addEventListener("submit", (e) => {
      e.preventDefault();

      // Recopilar datos
      const nombre = document.getElementById("nombreClase").value;
      const selectEntrenador = document.getElementById("entrenadorClase");
      const coach =
        selectEntrenador.options[selectEntrenador.selectedIndex].text;
      const fechaHora = document.getElementById("fechaHoraClase").value;
      const capacidad = parseInt(
        document.getElementById("capacidadClase").value,
      );
      const ubicacion = document.getElementById("ubicacionClase").value;

      // Formatear y guardar fecha_hora (ISO) si existe
      let fechaHoraISO = "";
      if (fechaHora) {
        const dateObj = new Date(fechaHora);
        if (!isNaN(dateObj)) fechaHoraISO = dateObj.toISOString();
      }

      // Crear nueva clase usando claves consistentes con la base de datos
      const nuevaClase = {
        id: Date.now(),
        nombre: nombre,
        fecha_hora: fechaHoraISO,
        coach_nombre: coach,
        ubicacion: ubicacion,
        capacidad_max: capacidad,
        icono: "fa-regular fa-calendar-check",
        bg_icono: "bg-secondary",
        text_icono: "text-secondary",
        inscritos: [],
        estado: "Activa",
      };

      clasesService.crearClase(nuevaClase);

      // Re-renderizar la grilla
      renderizarClases();

      // Ocultar modal
      const modalEl = document.getElementById("modalNuevaClase");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Limpiar el formulario
      formNuevaClase.reset();

      alert("Clase creada exitosamente");
    });
  }

  // Lógica para eliminar clase
  window.eliminarClase = function (id) {
    // Reemplazado: marcar clase como Cancelada en lugar de borrar
    Swal.fire({
      title: "¿Marcar como cancelada?",
      text: "Esto marcará la clase como 'Cancelada' y no podrá reservarse.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, marcar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        clasesService.cancelarClase(id);
        renderizarClases();
        Swal.fire("Hecho", "La clase fue marcada como Cancelada.", "success");
      }
    });
  };

  // Abrir modal de edición de clase (global)
  window.abrirEditarClase = function (id) {
    const clase = clasesService.obtenerClasePorId(id);
    if (!clase) return;

    // Asegurar que exista el modal en el DOM
    const modalEl = document.getElementById("modalEditarClase");
    if (!modalEl) return;

    // Rellenar campos del formulario
    document.getElementById("editarIdClase").value = clase.id;
    document.getElementById("editarNombreClase").value = clase.nombre || "";
    const selectEntr = document.getElementById("editarEntrenadorClase");
    if (selectEntr) {
      // seleccionar por texto usando la clave exacta coach_nombre
      for (let i = 0; i < selectEntr.options.length; i++) {
        if (selectEntr.options[i].text === clase.coach_nombre) {
          selectEntr.selectedIndex = i;
          break;
        }
      }
    }
    // Rellenar hora de inicio en formato HH:MM (input type=time) usando exclusivamente clase.fecha_hora
    const horaInput = document.getElementById("editarHoraInicioClase");
    let horaVal = "";
    if (clase.fecha_hora) {
      const d = new Date(clase.fecha_hora);
      if (!isNaN(d))
        horaVal = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    if (horaInput) horaInput.value = horaVal;
    document.getElementById("editarCapacidadClase").value =
      clase.capacidad_max || clase.capacidad || clase.capacidad_maxima || "";
    const ubicacionSel = document.getElementById("editarUbicacionClase");
    if (ubicacionSel) {
      for (let i = 0; i < ubicacionSel.options.length; i++) {
        if (ubicacionSel.options[i].value === clase.ubicacion) {
          ubicacionSel.selectedIndex = i;
          break;
        }
      }
    }

    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  };

  // Alias requerido por la plantilla de botones
  window.abrirModalEditar = function (id) {
    window.abrirEditarClase(id);
  };

  // Submit del formulario de edición
  const formEditar = document.getElementById("formEditarClase");
  if (formEditar) {
    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById("editarIdClase").value);
      const nombre = document.getElementById("editarNombreClase").value;
      const selectEntr = document.getElementById("editarEntrenadorClase");
      const coach = selectEntr.options[selectEntr.selectedIndex].text;
      const fecha = document.getElementById("editarHoraInicioClase").value;
      const capacidad = parseInt(
        document.getElementById("editarCapacidadClase").value,
      );
      const ubicacion = document.getElementById("editarUbicacionClase").value;

      // Guardar usando las claves exactas: fecha_hora, coach_nombre, ubicacion
      const datos = {
        nombre: nombre,
        fecha_hora: fecha
          ? (function () {
              const now = new Date();
              const parts = fecha.split(":");
              now.setHours(
                parseInt(parts[0] || 0),
                parseInt(parts[1] || 0),
                0,
                0,
              );
              return now.toISOString();
            })()
          : "",
        coach_nombre: coach,
        ubicacion: ubicacion,
        capacidad_max: capacidad,
      };

      clasesService.actualizarClase(id, datos);
      renderizarClases();

      const modalEl = document.getElementById("modalEditarClase");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "La clase fue actualizada.",
      });
    });
  }

  // Cancelar clase (no borra, marca estado)
  window.cancelarClase = function (id) {
    Swal.fire({
      title: "¿Confirmar cancelación?",
      text: "La clase se marcará como Cancelada y dejará de estar disponible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar clase",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    }).then((result) => {
      if (result.isConfirmed) {
        clasesService.cancelarClase(id);
        renderizarClases();
        Swal.fire({
          icon: "success",
          title: "Cancelada",
          text: "La clase fue marcada como Cancelada.",
        });
      }
    });
  };

  window.desactivarClase = function (id) {
    window.cancelarClase(id);
  };

  window.reactivarClase = function (id) {
    const clase = clasesService.obtenerClasePorId(id);
    if (!clase) return;
    clasesService.actualizarClase(id, { estado: "Activa" });
    renderizarClases();
    Swal.fire({
      icon: "success",
      title: "Reactivada",
      text: "La clase fue reactivada y vuelve a estar disponible.",
    });
  };
});
