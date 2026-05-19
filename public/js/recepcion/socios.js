document.addEventListener("DOMContentLoaded", () => {
  // Caché global de socios para el buscador
  let sociosDataCache = [];

  const tablaSociosBody = document.getElementById("tablaSociosBody");
  const inputBuscarSocio = document.getElementById("inputBuscarSocio");
  const textoContadorSocios = document.getElementById("textoContadorSocios");
  const contadorSocios = document.getElementById("contadorSocios");
  const formRegistroSocio = document.getElementById("formRegistroSocio");

  // 2. Renderizar Tabla
  const renderizarTabla = (socios) => {
    if (!tablaSociosBody) return;

    tablaSociosBody.innerHTML = "";

    socios.forEach((socio) => {
      // Iniciales
      const nombreReal = socio.nombre || socio.nombres || "";
      const apellidoReal = socio.apellido || socio.apellidos || "";
      const inicialNombre = nombreReal.charAt(0).toUpperCase();
      const inicialApellido = apellidoReal.charAt(0).toUpperCase();
      const iniciales = `${inicialNombre}${inicialApellido}`;

      // Estado y Badges adaptados a PostgreSQL
      let badgeClase = "";
      let vencimientoClase = "text-muted";
      const estadoMayus = socio.estado
        ? socio.estado.toUpperCase()
        : "INACTIVO";

      switch (estadoMayus) {
        case "ACTIVO":
          badgeClase = "bg-success bg-opacity-10 text-success";
          break;
        case "VENCIDO":
          badgeClase = "bg-danger bg-opacity-10 text-danger";
          vencimientoClase = "text-danger fw-medium"; // Resalta la fecha en rojo
          break;
        case "SUSPENDIDO":
        case "BAJA":
        default:
          badgeClase = "bg-secondary bg-opacity-10 text-secondary";
          break;
      }

      const btnCobrar =
        estadoMayus === "ACTIVO"
          ? `<button type="button" class="btn btn-sm btn-light text-muted border rounded me-1" disabled title="Cobro bloqueado: socio activo"><i class="fa-solid fa-money-bill-wave"></i></button>`
          : `<button type="button" class="btn btn-sm btn-light text-success border rounded me-1" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCobro" data-id="${socio.id}" data-dni="${socio.codigo_qr || socio.dni || "Sin DNI"}" data-nombre="${nombreReal} ${apellidoReal}" title="Cobrar Membresía"><i class="fa-solid fa-money-bill-wave"></i></button>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td class="ps-4 fw-medium text-gray-800">${socio.codigo_qr || socio.dni || "Sin DNI"}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style="width: 36px; height: 36px; font-size: 0.9rem;">
                            ${iniciales}
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${nombreReal} ${apellidoReal}</span>
                        </div>
                    </div>
                </td>
                <td class="text-muted">${socio.plan || "Ninguno"}</td>
                <td class="${vencimientoClase}">${socio.vencimiento || "--/--/----"}</td>
                <td class="text-center">
                    <span class="badge ${badgeClase} px-2 py-1 rounded-pill">${estadoMayus}</span>
                </td>
                <td class="pe-4 text-center">
                    ${btnCobrar}
                    <button type="button" class="btn btn-sm btn-light text-primary border rounded me-1" onclick="abrirPerfilSocio('${socio.id}', '${socio.codigo_qr || socio.dni || "Sin DNI"}', '${nombreReal}', '${apellidoReal}', '${socio.email || ""}', '${socio.telefono || ""}', '${estadoMayus}', '${socio.fecha_registro || ""}')" title="Ver Perfil"><i class="fa-regular fa-id-badge"></i></button>
                    <button type="button" class="btn btn-sm btn-light text-dark border rounded me-1 btn-accion" data-accion="Generar QR" title="Generar código QR"><i class="fa-solid fa-qrcode"></i></button>
                    <button type="button" class="btn btn-sm btn-light text-danger border rounded" onclick="cancelarPlan('${socio.id}')" title="Dar de Baja"><i class="fa-solid fa-ban"></i></button>
                </td>
            `;
      tablaSociosBody.appendChild(tr);
    });

    // Eventos para botones de acción
    const botonesAccion = tablaSociosBody.querySelectorAll(".btn-accion");
    botonesAccion.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const accion = e.currentTarget.getAttribute("data-accion");
        alert(accion);
      });
    });
  };

  // 3. Contador Total
  const actualizarContador = (cantidad) => {
    if (contadorSocios) {
      contadorSocios.innerText = `Total registrados: ${cantidad} socios`;
    } else if (textoContadorSocios) {
      textoContadorSocios.innerHTML = `<i class="fa-solid fa-users me-1"></i> Total registrados: ${cantidad} socios`;
    }
  };

  // 4. Buscador
  if (inputBuscarSocio) {
    inputBuscarSocio.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const sociosFiltrados = sociosDataCache.filter(
        (socio) =>
          (socio.dni && socio.dni.includes(term)) ||
          (socio.nombre && socio.nombre.toLowerCase().includes(term)) ||
          (socio.apellido && socio.apellido.toLowerCase().includes(term)) ||
          (socio.nombres && socio.nombres.toLowerCase().includes(term)) ||
          (socio.apellidos && socio.apellidos.toLowerCase().includes(term)),
      );
      renderizarTabla(sociosFiltrados);
      actualizarContador(sociosFiltrados.length);
    });
  }

  // 5. Registrar Nuevo Socio
  if (formRegistroSocio) {
    formRegistroSocio.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Capturar datos
      const nombre = document.getElementById("nombresSocio").value.trim();
      const apellido = document.getElementById("apellidosSocio").value.trim();
      const dni = document.getElementById("dniSocio").value.trim();
      const telefono = document.getElementById("telefonoSocio").value.trim();
      const email = document.getElementById("correoSocio").value.trim();

      // Validación básica
      if (!nombre || !apellido || !email || !telefono || !dni) {
        if (typeof Swal !== "undefined") {
          Swal.fire(
            "Atención",
            "Por favor, complete todos los campos obligatorios.",
            "warning",
          );
        } else {
          alert("Por favor, complete todos los campos obligatorios.");
        }
        return;
      }

      const nuevoSocioData = { nombre, apellido, email, telefono, dni };

      // Petición Fetch (POST) al Backend
      try {
        const response = await fetch("http://localhost:3000/api/miembros", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoSocioData),
        });

        const data = await response.json();

        // Manejo de Respuestas
        if (response.ok || response.status === 201) {
          formRegistroSocio.reset();

          // Cerrar modal
          const modalEl = document.getElementById("modalNuevoSocio");
          if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }

          if (typeof Swal !== "undefined") {
            Swal.fire({
              title: "¡Éxito!",
              text: "El socio ha sido registrado correctamente en la base de datos.",
              icon: "success",
              confirmButtonColor: "#198754",
            }).then(() => {
              cargarSociosDesdeAPI();
            });
          } else {
            alert("¡Socio registrado exitosamente!");
            cargarSociosDesdeAPI();
          }
        } else {
          if (typeof Swal !== "undefined") {
            Swal.fire(
              "Error al registrar",
              data.error || "Verifique los datos ingresados.",
              "error",
            );
          } else {
            alert(
              "Error: " + (data.error || "Verifique los datos ingresados."),
            );
          }
        }
      } catch (error) {
        console.error("Error de red al registrar socio:", error);
        if (typeof Swal !== "undefined") {
          Swal.fire(
            "Error de conexión",
            "No se pudo comunicar con el servidor.",
            "error",
          );
        } else {
          alert("Error de conexión con el servidor.");
        }
      }
    });
  }

  const MIEMBROS_API_URL = "http://127.0.0.1:3000/api/miembros";

  // 6. Cargar tabla desde API PostgreSQL
  const cargarSociosDesdeAPI = async () => {
    let datos = [];
    let mensajeError = null;

    try {
      const response = await fetch(MIEMBROS_API_URL, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        mensajeError = `No se pudo cargar el directorio de socios. Estado: ${response.status}`;
        console.error(
          "Error al cargar miembros desde la API",
          response.status,
          response.statusText,
        );
      } else {
        datos = await response.json();
        sociosDataCache = datos;
        renderizarTabla(sociosDataCache);
        actualizarContador(sociosDataCache.length);
      }
    } catch (error) {
      mensajeError = "Error de red al cargar socios. Verifica tu conexión.";
      console.error("Detalle del error frontend:", error);
    } finally {
      if (mensajeError) {
        if (tablaSociosBody) {
          tablaSociosBody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-5">
                <div class="text-muted">
                  <i class="fa-solid fa-triangle-exclamation fa-2x mb-3"></i>
                  <p class="mb-0">${mensajeError}</p>
                </div>
              </td>
            </tr>
          `;
        }
        actualizarContador(0);
      }
    }
  };

  // Llamada Inicial
  cargarSociosDesdeAPI();

  // Función para Dar de Baja (Cancelar Plan)
  window.cancelarPlan = async (idSocio) => {
    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: "¿Estás seguro de dar de baja a este socio?",
        text: "Esta acción revocará su acceso al gimnasio.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, dar de baja",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/miembros/${idSocio}/baja`,
            {
              method: "PUT",
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al procesar la baja.");
          }

          Swal.fire(
            "¡Baja Procesada!",
            "El socio ha sido dado de baja exitosamente.",
            "success",
          );
          cargarSociosDesdeAPI();
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    } else {
      if (
        confirm(
          "¿Estás seguro de dar de baja a este socio? Esta acción revocará su acceso.",
        )
      ) {
        fetch(`http://localhost:3000/api/miembros/${idSocio}/baja`, {
          method: "PUT",
        })
          .then((res) =>
            res.ok ? cargarSociosDesdeAPI() : alert("Error al dar de baja"),
          )
          .catch((err) => alert("Error: " + err));
      }
    }
  };

  // 7. Lógica del Formulario de Pagos (Offcanvas)
  const formOffcanvasCobro = document.getElementById("formOffcanvasCobro");
  if (formOffcanvasCobro) {
    formOffcanvasCobro.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Recolectar datos
      const miembro_id = document.getElementById("offcanvasMiembroId").value;
      const plan_id = document.getElementById("offcanvasSelectPlan").value;
      const metodo_pago = document.getElementById("offcanvasMetodoPago").value;
      const monto = document.getElementById("offcanvasMontoTotal").value;

      if (!miembro_id || !plan_id || !metodo_pago || !monto) {
        if (typeof Swal !== "undefined") {
          Swal.fire(
            "Atención",
            "Complete todos los campos del cobro.",
            "warning",
          );
        }
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/pagos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ miembro_id, plan_id, metodo_pago, monto }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              errorData.message ||
              "Error desconocido al procesar el pago.",
          );
        }

        // Cerrar el offcanvas
        const offcanvasEl = document.getElementById("offcanvasCobro");
        if (offcanvasEl) {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (bsOffcanvas) bsOffcanvas.hide();
        }

        // Alerta de éxito con SweetAlert2
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "¡Pago Exitoso!",
            text: "El recibo ha sido emitido y el socio está ACTIVO.",
            icon: "success",
            confirmButtonColor: "#198754",
          }).then(() => {
            cargarSociosDesdeAPI(); // Recargar la tabla
          });
        }
      } catch (error) {
        console.error("Error procesando el pago:", error);
        if (typeof Swal !== "undefined") {
          Swal.fire("Error al cobrar", error.message, "error");
        } else {
          alert("Error al cobrar: " + error.message);
        }
      }
    });
  }

  // 8. Lógica de cálculo del Offcanvas (Monto Total automático)
  const offcanvasSelectPlan = document.getElementById("offcanvasSelectPlan");
  const offcanvasMontoTotal = document.getElementById("offcanvasMontoTotal");

  if (offcanvasSelectPlan && offcanvasMontoTotal) {
    offcanvasSelectPlan.addEventListener("change", () => {
      const opcionSeleccionada =
        offcanvasSelectPlan.options[offcanvasSelectPlan.selectedIndex];
      const precioData = opcionSeleccionada.dataset.precio;

      if (precioData) {
        offcanvasMontoTotal.value = parseFloat(precioData).toFixed(2);
      } else {
        offcanvasMontoTotal.value = "";
      }
    });
  }
});

// Variable para cachear los planes y no hacer fetch por cada clic
let cachePlanesAPI = null;

// Escuchar el evento cuando el Offcanvas se va a mostrar
const offcanvasCobroEl = document.getElementById("offcanvasCobro");
if (offcanvasCobroEl) {
  offcanvasCobroEl.addEventListener("show.bs.offcanvas", async (e) => {
    // e.relatedTarget es el botón que disparó el offcanvas
    const btn = e.relatedTarget;
    if (!btn) return;

    // Leer los datos del botón
    const id = btn.getAttribute("data-id");
    const dni = btn.getAttribute("data-dni");
    const nombreCompleto = btn.getAttribute("data-nombre");

    // 1. Llenar los datos visuales del Socio y guardar el ID
    document.getElementById("offcanvasMiembroId").value = id;
    document.getElementById("cobroSocioNombre").textContent = nombreCompleto;
    document.getElementById("cobroSocioDNI").textContent = dni;

    // 2. Limpiar el formulario y montos
    document.getElementById("formOffcanvasCobro").reset();
    document.getElementById("offcanvasMontoTotal").value = "";

    // 3. Fetch de Planes a tu Backend (si no están cacheados)
    const selectPlan = document.getElementById("offcanvasSelectPlan");
    selectPlan.innerHTML =
      '<option value="" disabled selected>Cargando planes...</option>';

    try {
      if (!cachePlanesAPI) {
        const response = await fetch("http://localhost:3000/api/planes");
        if (!response.ok) throw new Error("Falló respuesta HTTP");
        cachePlanesAPI = await response.json();
      }

      // 4. Inyectar <options> dinámicas
      selectPlan.innerHTML =
        '<option value="" disabled selected>Seleccione el plan a facturar</option>';
      cachePlanesAPI.forEach((plan) => {
        const opt = document.createElement("option");
        opt.value = plan.id;
        opt.dataset.precio = plan.precio; // Lo guardamos oculto
        opt.textContent = `${plan.nombre} - S/ ${parseFloat(plan.precio).toFixed(2)}`;
        selectPlan.appendChild(opt);
      });
    } catch (error) {
      console.error("Error obteniendo planes:", error);
      selectPlan.innerHTML =
        '<option value="" disabled selected>Error de conexión</option>';
    }
  });
}

// Variable para saber qué perfil está abierto
let currentPerfilId = null;

// Función para abrir el Perfil del Socio y poblar los datos
window.abrirPerfilSocio = (
  id,
  dni,
  nombres,
  apellidos,
  email,
  telefono,
  estado,
  fechaRegistro,
) => {
  currentPerfilId = id;
  document.getElementById("perfilNombre").textContent =
    `${nombres} ${apellidos}`;
  document.getElementById("perfilDNI").textContent = dni;
  document.getElementById("perfilEmail").textContent = email || "No registrado";
  document.getElementById("perfilTelefono").textContent =
    telefono || "No registrado";

  // Si la fechaRegistro es un timestamp, podemos formatearlo
  let fechaTxt = "No registrada";
  if (fechaRegistro) {
    try {
      const dateObj = new Date(fechaRegistro);
      if (!isNaN(dateObj)) {
        fechaTxt = dateObj.toLocaleDateString("es-PE");
      } else {
        fechaTxt = fechaRegistro;
      }
    } catch (e) {
      fechaTxt = fechaRegistro;
    }
  }
  document.getElementById("perfilRegistro").textContent = fechaTxt;

  const badge = document.getElementById("perfilEstadoBadge");
  badge.textContent = estado;

  // Resetear clases del badge
  badge.className = "badge rounded-pill px-3 py-2 fs-6";
  if (estado === "ACTIVO") {
    badge.classList.add(
      "bg-success",
      "bg-opacity-10",
      "text-success",
      "border",
      "border-success",
      "border-opacity-25",
    );
  } else if (estado === "VENCIDO") {
    badge.classList.add(
      "bg-danger",
      "bg-opacity-10",
      "text-danger",
      "border",
      "border-danger",
      "border-opacity-25",
    );
  } else {
    badge.classList.add(
      "bg-secondary",
      "bg-opacity-10",
      "text-secondary",
      "border",
      "border-secondary",
      "border-opacity-25",
    );
  }

  const modalEl = document.getElementById("modalPerfil");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

// Lógica para el botón Editar Email del Modal
document.addEventListener("DOMContentLoaded", () => {
  const btnEditarEmail = document.getElementById("btnEditarEmail");
  if (btnEditarEmail) {
    btnEditarEmail.addEventListener("click", async () => {
      const emailActual = document.getElementById("perfilEmail").textContent;

      const { value: nuevoEmail } = await Swal.fire({
        title: "Editar Correo Electrónico",
        input: "email",
        inputLabel: "Nuevo correo electrónico",
        inputValue: emailActual !== "No registrado" ? emailActual : "",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        confirmButtonText: "Guardar cambios",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (!value) {
            return "¡Necesitas escribir un correo válido!";
          }
        },
      });

      if (nuevoEmail && currentPerfilId) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/miembros/${currentPerfilId}/email`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: nuevoEmail }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Error desconocido al actualizar el correo.",
            );
          }

          document.getElementById("perfilEmail").textContent = nuevoEmail;
          Swal.fire({
            title: "¡Actualizado!",
            text: "El correo ha sido modificado con éxito.",
            icon: "success",
            confirmButtonColor: "#198754",
          });

          // Opcional: Recargar la tabla en el fondo
          if (typeof cargarSociosDesdeAPI === "function") {
            // Como estamos fuera del scope de DOMContentLoaded donde está definida,
            // podemos disparar un click al botón de buscar, o recargar.
            // En este caso, la tabla se recargará la próxima vez.
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  }

  const btnEditarTelefono = document.getElementById("btnEditarTelefono");
  if (btnEditarTelefono) {
    btnEditarTelefono.addEventListener("click", async () => {
      const telActual = document.getElementById("perfilTelefono").textContent;

      const { value: nuevoTelefono } = await Swal.fire({
        title: "Editar Número de Teléfono",
        input: "tel",
        inputLabel: "Nuevo teléfono",
        inputValue: telActual !== "No registrado" ? telActual : "",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        confirmButtonText: "Guardar cambios",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (!value) {
            return "¡Necesitas escribir un número!";
          }
          if (!/^\d+$/.test(value.replace(/[\s+]/g, ""))) {
            return "¡Solo se permiten números!";
          }
        },
      });

      if (nuevoTelefono && currentPerfilId) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/miembros/${currentPerfilId}/telefono`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ telefono: nuevoTelefono }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Error desconocido al actualizar el teléfono.",
            );
          }

          document.getElementById("perfilTelefono").textContent = nuevoTelefono;
          Swal.fire({
            title: "¡Actualizado!",
            text: "El teléfono ha sido modificado con éxito.",
            icon: "success",
            confirmButtonColor: "#198754",
          });
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  }
});
