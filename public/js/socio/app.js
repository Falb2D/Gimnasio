let socioActual = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Simulación de Usuario Logueado (Mock Data)
  socioActual = {
    nombre: "Carlos Mendoza",
    numero: "12345",
    plan: "Mensual Ilimitado",
    vencimiento: "15 Jun 2026",
    estado: "Activo",
  };

  // 2. Enrutador básico para ejecutar lógica según la vista actual
  const path = window.location.pathname;

  if (path.includes("socio.html") || path.endsWith("/socio/")) {
    renderizarMiQR(socioActual);
  } else if (path.includes("socio_clases.html")) {
    renderizarClases(socioActual);
  } else if (path.includes("socio_pagos.html")) {
    renderizarPagos(socioActual);
  }

  actualizarEstadoGlobal(socioActual);
});

window.mostrarEstado = function (estado) {
  if (!socioActual) return;
  socioActual.estado = estado;
  const path = window.location.pathname;

  if (path.includes("socio.html") || path.endsWith("/socio/")) {
    renderizarMiQR(socioActual);
  } else if (path.includes("socio_clases.html")) {
    renderizarClases(socioActual);
  } else if (path.includes("socio_pagos.html")) {
    renderizarPagos(socioActual);
  }

  actualizarEstadoGlobal(socioActual);
};

window.mostrarRegularizarPago = function () {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "info",
      title: "Regulariza tu pago",
      html: "Acércate a la recepción de FitFab para regularizar tu pago y reactivar tu pase de acceso.",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#0d6efd",
      customClass: { popup: "rounded-4 shadow-lg" },
    });
  } else {
    alert(
      "Acércate a la recepción de FitFab para regularizar tu pago y reactivar tu pase de acceso.",
    );
  }
};

function actualizarEstadoGlobal(socio) {
  if (!socio) return;

  const banner = document.getElementById("portalEstadoBanner");
  const sidebar = document.querySelector(".sidebar");
  const navClases = document.getElementById("navReservarClases");
  const navLock = navClases
    ? navClases.querySelector(".nav-status-lock")
    : null;
  const estadoPagoBadge = document.getElementById("estadoPagoBadge");
  const estadoPagoAlert = document.getElementById("estadoPagoAlert");
  const estadoResumenPagoHeader = document.getElementById(
    "estadoResumenPagoHeader",
  );
  const estadoResumenPago = document.getElementById("estadoResumenPago");
  const deudaMonto = document.getElementById("deudaMonto");

  if (sidebar) {
    sidebar.classList.remove("status-active", "status-alert", "status-deudor");
    sidebar.classList.add(`status-${socio.estado.toLowerCase()}`);
  }

  if (navClases) {
    if (socio.estado === "Deudor") {
      navClases.classList.add("position-relative");
      if (!navLock) {
        const badge = document.createElement("span");
        badge.className = "badge bg-danger text-white nav-status-lock";
        badge.textContent = "Bloqueado";
        navClases.appendChild(badge);
      }
    } else {
      navClases.classList.remove("position-relative");
      if (navLock) {
        navLock.remove();
      }
    }
  }

  if (banner) {
    let bannerClass = "alert-success";
    let icon = "fa-circle-check";
    let titulo = "Membresía Activa";
    let mensaje = "Tu acceso y reservas están disponibles.";

    if (socio.estado === "Alerta") {
      bannerClass = "alert-warning";
      icon = "fa-triangle-exclamation";
      titulo = "Vence Pronto";
      mensaje = `Tu plan vence el ${socio.vencimiento}. Renueva pronto para evitar suspensiones.`;
    } else if (socio.estado === "Deudor") {
      bannerClass = "alert-danger";
      icon = "fa-lock";
      titulo = "Reservas suspendidas";
      mensaje =
        "Regulariza tu pago en Mis Pagos para volver a reservar clases.";
    }

    banner.innerHTML = `
      <div class="alert ${bannerClass} portal-status-banner rounded-4 d-flex align-items-center gap-3 mb-4" role="alert">
        <i class="fa-solid ${icon} fs-4"></i>
        <div>
          <p class="fw-semibold mb-1">${titulo}</p>
          <p class="mb-0 small text-muted">${mensaje}</p>
        </div>
      </div>
    `;
  }

  if (estadoPagoBadge) {
    if (socio.estado === "Activo") {
      estadoPagoBadge.className =
        "badge bg-white text-primary rounded-pill px-3 py-2 fw-bold shadow-sm";
      estadoPagoBadge.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Activo`;
    } else if (socio.estado === "Alerta") {
      estadoPagoBadge.className =
        "badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold shadow-sm";
      estadoPagoBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Vence Pronto`;
    } else {
      estadoPagoBadge.className =
        "badge bg-danger text-white rounded-pill px-3 py-2 fw-bold shadow-sm";
      estadoPagoBadge.innerHTML = `<i class="fa-solid fa-lock me-1"></i> Deudor`;
    }
  }

  if (estadoResumenPagoHeader) {
    estadoResumenPagoHeader.className =
      socio.estado === "Activo"
        ? "bg-primary text-white p-4"
        : socio.estado === "Alerta"
          ? "bg-warning text-dark p-4"
          : "bg-danger text-white p-4";
  }

  if (estadoResumenPago) {
    estadoResumenPago.classList.toggle(
      "border-danger",
      socio.estado === "Deudor",
    );
    estadoResumenPago.classList.toggle(
      "border-warning",
      socio.estado === "Alerta",
    );
    estadoResumenPago.classList.toggle(
      "border-primary",
      socio.estado === "Activo",
    );
  }

  if (deudaMonto) {
    deudaMonto.className =
      socio.estado === "Activo"
        ? "fw-bold text-success m-0"
        : socio.estado === "Alerta"
          ? "fw-bold text-warning m-0"
          : "fw-bold text-danger m-0";
    deudaMonto.textContent =
      socio.estado === "Deudor" ? "S/ 120.00" : "S/ 0.00";
  }

  if (estadoPagoAlert) {
    if (socio.estado === "Activo") {
      estadoPagoAlert.className =
        "alert alert-success d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm";
      estadoPagoAlert.innerHTML = `
        <i class="fa-solid fa-face-smile-wink fs-4 me-3"></i>
        <div class="small fw-medium">¡Estás al día con tus pagos! Disfruta de tu entrenamiento.</div>
      `;
    } else if (socio.estado === "Alerta") {
      estadoPagoAlert.className =
        "alert alert-warning d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm";
      estadoPagoAlert.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation fs-4 me-3"></i>
        <div class="small fw-medium">Tu pago vence pronto. Revisa el detalle en Mis Pagos para prevenir cortes.</div>
      `;
    } else {
      estadoPagoAlert.className =
        "alert alert-danger d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm";
      estadoPagoAlert.innerHTML = `
        <i class="fa-solid fa-lock fs-4 me-3"></i>
        <div class="small fw-medium">Tu membresía está suspendida. Acércate a recepción para regularizar tu pago.</div>
      `;
    }
  }
}

// ==========================================
// LÓGICA VISTA: MI QR
// ==========================================
function renderizarMiQR(socio) {
  const badgeEstado = document.getElementById("badgeEstado");
  const qrContainer = document.getElementById("qrcode");
  const estadoMensaje = document.getElementById("estadoMensaje");
  const socioCard = document.getElementById("socioCard");

  if (!qrContainer || !badgeEstado || !estadoMensaje || !socioCard) return;

  socioCard.classList.remove("status-active", "status-alert", "status-deudor");
  qrContainer.classList.remove("qr-locked");
  estadoMensaje.innerHTML = "";
  qrContainer.innerHTML = "";

  if (socio.estado === "Activo") {
    socioCard.classList.add("status-active");
    badgeEstado.innerHTML = `<span class="fw-bold text-success fs-6"><i class="fa-solid fa-circle-check me-2"></i> Membresía Activa</span>`;
    badgeEstado.className =
      "estado-badge d-inline-block estado-active px-4 py-2 rounded-pill border mb-3 shadow-sm";

    if (typeof QRCode !== "undefined") {
      new QRCode(qrContainer, {
        text: `QR-SOCIO-${socio.numero}-${socio.estado}`,
        width: 220,
        height: 220,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    estadoMensaje.innerHTML = `<p class="text-muted small mb-0">Tu código está listo para presentarse en recepción.</p>`;
  } else if (socio.estado === "Alerta") {
    socioCard.classList.add("status-alert");
    badgeEstado.innerHTML = `<span class="fw-bold text-warning fs-6"><i class="fa-solid fa-circle-exclamation me-2"></i> Vence Pronto</span>`;
    badgeEstado.className =
      "estado-badge d-inline-block estado-alert px-4 py-2 rounded-pill border mb-3 shadow-sm";

    if (typeof QRCode !== "undefined") {
      new QRCode(qrContainer, {
        text: `QR-SOCIO-${socio.numero}-${socio.estado}`,
        width: 220,
        height: 220,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    estadoMensaje.innerHTML = `
            <div class="alert alert-warning rounded-4 py-3 mb-0">
                <div class="d-flex align-items-start gap-2">
                    <i class="fa-solid fa-triangle-exclamation mt-1"></i>
                    <div>
                        <p class="fw-bold mb-1">Tu pase vence pronto</p>
                        <p class="mb-0 small text-muted">Renueva antes del <strong>${socio.vencimiento}</strong> para evitar la suspensión de tu acceso.</p>
                    </div>
                </div>
            </div>
        `;
  } else {
    socioCard.classList.add("status-deudor");
    badgeEstado.innerHTML = `<span class="fw-bold text-danger fs-6"><i class="fa-solid fa-lock me-2"></i> Membresía Vencida</span>`;
    badgeEstado.className =
      "estado-badge d-inline-block estado-deudor px-4 py-2 rounded-pill border mb-3 shadow-sm";

    qrContainer.classList.add("qr-locked");
    qrContainer.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-danger" style="min-height: 220px;">
                <i class="fa-solid fa-lock fa-3x mb-3"></i>
                <h5 class="fw-bold mb-2">Acceso Suspendido</h5>
                <p class="text-muted small text-center mb-0">Regulariza tu pago para volver a usar tu pase de ingreso.</p>
            </div>
        `;

    estadoMensaje.innerHTML = `
            <button class="btn btn-danger w-100 rounded-pill py-2" onclick="mostrarRegularizarPago()">Regularizar Pago</button>
        `;
  }
}

// ==========================================
// LÓGICA VISTA: RESERVAR CLASES
// ==========================================
function renderizarClases(socio) {
  const contenedor = document.getElementById("contenedorClases");
  if (!contenedor) return;

  let clasesDB = JSON.parse(localStorage.getItem("clasesDB"));

  if (!clasesDB) {
    clasesDB = [
      {
        id: 1,
        nombre: "Yoga Integral",
        capacidad: 20,
        inscritos: ["Juan", "Ana", "Luisa", "Marta", "Leo"],
      },
      {
        id: 2,
        nombre: "CrossFit WOD",
        capacidad: 20,
        inscritos: [
          "Pedro",
          "Rosa",
          "Luis",
          "Alberto",
          "Maria",
          "Jose",
          "Diego",
          "Ana",
        ],
      },
      {
        id: 3,
        nombre: "Spinning Pro",
        capacidad: 25,
        inscritos: Array.from({ length: 25 }, (_, i) => `Alumno ${i}`),
      }, // Llena
    ];
    localStorage.setItem("clasesDB", JSON.stringify(clasesDB));
  }

  contenedor.innerHTML = "";
  const filtroDias = document.querySelector(".date-filter-container");
  if (filtroDias) {
    filtroDias.style.display = socio.estado === "Deudor" ? "none" : "block";
  }

  if (socio.estado === "Deudor") {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="card locked-page-card border-0 rounded-4 p-4 mb-4 shadow-sm">
          <div class="d-flex flex-column align-items-center text-center gap-3 justify-content-center">
            <div>
              <h5 class="fw-bold mb-1 text-danger"><i class="fa-solid fa-lock me-2"></i> Reservas Suspendidas</h5>
              <p class="mb-0 text-muted">Acércate a recepción para regularizar tu pago y volver a reservar.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  clasesDB.forEach((clase) => {
    if (!clase.inscritos) clase.inscritos = [];

    // Mapeo defensivo de campos
    const estadoClase = clase.estado || clase.estado_clase || "Activa";
    const cancelada = estadoClase === "Cancelada";
    const capacidad =
      clase.capacidad || clase.capacidad_max || clase.capacidad_maxima || 0;
    const horario = clase.horario || clase.fecha_hora || clase.hora || "--:--";
    const reservasActuales = clase.inscritos
      ? clase.inscritos.length
      : clase.reservas_actuales || 0;
    const lugaresDisponibles = capacidad - reservasActuales;
    const yaEstaInscrito = clase.inscritos.includes(socio.nombre);

    let botonHtml = "";
    if (cancelada) {
      botonHtml = `<button class="btn btn-secondary w-100 fw-bold disabled py-3"><i class="fa-solid fa-ban me-2"></i> No Disponible</button>`;
    } else if (yaEstaInscrito) {
      botonHtml = `<button class="btn btn-outline-danger w-100 fw-bold py-3 shadow-sm" onclick="cancelarReserva(${clase.id}, '${socio.nombre}', '${clase.nombre}')"><i class="fa-solid fa-xmark me-2"></i> Cancelar Reserva</button>`;
    } else if (socio.estado === "Deudor") {
      botonHtml = `<button class="btn btn-danger w-100 fw-bold disabled py-3"><i class="fa-solid fa-lock me-2"></i> Reservas bloqueadas</button>`;
    } else if (lugaresDisponibles <= 0) {
      botonHtml = `<button class="btn btn-secondary w-100 fw-bold disabled py-3"><i class="fa-solid fa-ban me-2"></i> Clase Llena</button>`;
    } else {
      botonHtml = `<button class="btn btn-primary w-100 fw-bold py-3 shadow-sm" onclick="reservarLugar(${clase.id}, '${socio.nombre}', '${clase.nombre}')">Reservar mi lugar</button>`;
    }

    const card = document.createElement("div");
    card.className = "col-12 col-md-6 col-lg-4 mb-4";

    // Estilos para tarjeta
    const cardOpacity =
      cancelada
        ? "opacity-50 bg-light"
        : lugaresDisponibles <= 0
          ? "opacity-75 bg-light"
          : "";
    const badgeBg =
      cancelada
        ? "bg-danger text-danger border-danger"
        : lugaresDisponibles <= 0
          ? "bg-secondary text-secondary border-secondary"
          : "bg-primary text-primary border-primary";
    const placesBg =
      lugaresDisponibles <= 0
        ? "bg-danger bg-opacity-10 border-danger"
        : "bg-light border-secondary border-opacity-10";
    const placesText =
      lugaresDisponibles <= 0 ? "text-danger" : "text-gray-800";
    const numbersBg =
      lugaresDisponibles <= 0
        ? "bg-white text-danger shadow-sm"
        : "bg-success bg-opacity-10 text-success";

    card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${cardOpacity}">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="badge ${badgeBg} bg-opacity-10 mb-2 rounded-pill px-3 py-1 border border-opacity-25">FITFAB Studio</span>
                            <h5 class="fw-bold text-gray-800 mb-1 d-flex align-items-center">
                              ${clase.nombre}
                              ${cancelada ? `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-2 py-1 ms-2">CANCELADA</span>` : ""}
                            </h5>
                            <p class="text-muted small mb-0"><i class="fa-solid fa-user-ninja me-1 text-secondary"></i> ${clase.coach || clase.coach_nombre || "Coach"}</p>
                        </div>
                        <div class="bg-light rounded p-2 text-center border shadow-sm">
                            <span class="d-block fw-bold text-primary fs-5 lh-1">${horario}</span>
                            <span class="d-block text-muted mt-1" style="font-size: 0.65rem; font-weight: 700;">HRS</span>
                        </div>
                    </div>
                    
                    <div class="${placesBg} rounded-3 p-3 mb-4 border">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold ${placesText} small"><i class="fa-solid fa-users ${lugaresDisponibles <= 0 ? "text-danger" : "text-primary"} me-2"></i> Lugares disponibles</span>
                            <span class="fw-bold ${numbersBg} px-2 py-1 rounded">${lugaresDisponibles} / ${capacidad}</span>
                        </div>
                    </div>
                    
                    ${botonHtml}
                </div>
            </div>
        `;
    contenedor.appendChild(card);
  });
}

window.reservarLugar = function (idClase, nombreSocio, nombreClase) {
  // Si SweetAlert2 está disponible, mostrar confirmación
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¡Reserva Confirmada!",
      html: `Tu lugar en <b>${nombreClase}</b> ha sido asegurado con éxito.`,
      icon: "success",
      confirmButtonText: "Genial, gracias",
      confirmButtonColor: "#0d6efd",
      customClass: { popup: "rounded-4 shadow-lg" },
    }).then(() => {
      ejecutarReserva(idClase, nombreSocio);
    });
  } else {
    alert(`Reserva confirmada para ${nombreClase}`);
    ejecutarReserva(idClase, nombreSocio);
  }
};

function ejecutarReserva(idClase, nombreSocio) {
  let clasesDB = JSON.parse(localStorage.getItem("clasesDB")) || [];
  const index = clasesDB.findIndex((c) => c.id === idClase);

  if (index !== -1) {
    if (!clasesDB[index].inscritos) clasesDB[index].inscritos = [];
    const lugaresDisponibles =
      clasesDB[index].capacidad - clasesDB[index].inscritos.length;

    if (
      lugaresDisponibles > 0 &&
      !clasesDB[index].inscritos.includes(nombreSocio)
    ) {
      clasesDB[index].inscritos.push(nombreSocio);
      localStorage.setItem("clasesDB", JSON.stringify(clasesDB));
      renderizarClases(socioActual || { nombre: nombreSocio });
    }
  }
}

window.cancelarReserva = function (idClase, nombreSocio, nombreClase) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¿Cancelar Reserva?",
      html: `¿Estás seguro de que deseas cancelar tu reserva para <b>${nombreClase}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
      customClass: { popup: "rounded-4 shadow-lg" },
    }).then((result) => {
      if (result.isConfirmed) {
        ejecutarCancelacion(idClase, nombreSocio);
        Swal.fire({
          title: "¡Cancelada!",
          text: "Tu cupo ha sido liberado.",
          icon: "success",
          confirmButtonColor: "#0d6efd",
          customClass: { popup: "rounded-4 shadow-lg" },
        });
      }
    });
  } else {
    if (
      confirm(
        "¿Estás seguro de que deseas cancelar tu reserva para esta clase?",
      )
    ) {
      ejecutarCancelacion(idClase, nombreSocio);
    }
  }
};

function ejecutarCancelacion(idClase, nombreSocio) {
  let clasesDB = JSON.parse(localStorage.getItem("clasesDB")) || [];
  const index = clasesDB.findIndex((c) => c.id === idClase);

  if (index !== -1 && clasesDB[index].inscritos) {
    clasesDB[index].inscritos = clasesDB[index].inscritos.filter(
      (nombre) => nombre !== nombreSocio,
    );
    localStorage.setItem("clasesDB", JSON.stringify(clasesDB));
    renderizarClases(socioActual || { nombre: nombreSocio });
  }
}

// ==========================================
// LÓGICA VISTA: MIS PAGOS
// ==========================================
function renderizarPagos(socio) {
  const listGroup = document.getElementById("historialPagosList");
  if (!listGroup) return;

  const historial = [
    {
      id: "B001-004523",
      fecha: "15 May 2026",
      metodo: "Yape / Plin",
      icono: "fa-mobile-screen-button",
      textClass: "text-primary",
      monto: "S/ 120.00",
    },
    {
      id: "B001-004112",
      fecha: "15 Abr 2026",
      metodo: "Efectivo",
      icono: "fa-money-bill-wave",
      textClass: "text-success",
      monto: "S/ 120.00",
    },
    {
      id: "B001-003889",
      fecha: "15 Mar 2026",
      metodo: "Transferencia",
      icono: "fa-money-bill-transfer",
      textClass: "text-info",
      monto: "S/ 120.00",
    },
  ];

  listGroup.innerHTML = "";
  historial.forEach((pago, index) => {
    let bgClass = "";
    if (index > 0) bgClass = "bg-light bg-opacity-50";

    let roundedClass = "";
    if (index === historial.length - 1) roundedClass = "rounded-bottom-4";

    listGroup.innerHTML += `
            <div class="list-group-item p-4 border-0 border-bottom border-light ${bgClass} ${roundedClass}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="fw-bold text-gray-800 mb-2">${pago.monto}</h5>
                        <span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2">
                            <i class="fa-solid ${pago.icono} ${pago.textClass} me-1"></i> ${pago.metodo}
                        </span>
                    </div>
                    <div class="text-end">
                        <span class="text-muted small fw-medium d-block">${pago.fecha}</span>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary fw-medium px-3 rounded-pill" onclick="verComprobante('${pago.id}')">
                        <i class="fa-solid fa-file-invoice me-1"></i> Ver Comprobante
                    </button>
                </div>
            </div>
        `;
  });
}
