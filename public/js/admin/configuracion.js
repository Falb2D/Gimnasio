const STORAGE_KEY_PLANES = "fitfab_planes";

function generarIdPlan() {
  return (
    "plan_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now()
  );
}

function generarCantidadSocios() {
  return Math.floor(Math.random() * 41) + 20; // 20-60 socios simulados
}

function generarIdUsuario() {
  return (
    "usuario_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now()
  );
}

function formatearRol(rolValue) {
  if (rolValue === "admin") return "Administrador";
  if (rolValue === "reception") return "Recepcionista";
  if (rolValue === "instructor") return "Entrenador Clases";
  if (rolValue === "coach") return "Coach de Piso";
  return "Sin Rol";
}

function inicializarPlanes() {
  if (localStorage.getItem(STORAGE_KEY_PLANES)) return;

  const planesIniciales = [
    {
      id: generarIdPlan(),
      nombre: "Mensual Básico",
      color: "#0d6efd",
      estado: "Activo",
      duracion: 30,
      precio: 80.0,
      cantidad_socios: generarCantidadSocios(),
    },
    {
      id: generarIdPlan(),
      nombre: "Mensual Ilimitado",
      color: "#198754",
      estado: "Activo",
      duracion: 30,
      precio: 120.0,
      cantidad_socios: generarCantidadSocios(),
    },
    {
      id: generarIdPlan(),
      nombre: "Trimestral VIP",
      color: "#fd7e14",
      estado: "Activo",
      duracion: 90,
      precio: 300.0,
      cantidad_socios: generarCantidadSocios(),
    },
    {
      id: generarIdPlan(),
      nombre: "Promo Verano 2025",
      color: "#6c757d",
      estado: "Inactivo",
      duracion: 60,
      precio: 150.0,
      cantidad_socios: generarCantidadSocios(),
    },
  ];

  localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planesIniciales));
}

// Mock Data para Usuarios
let usuariosMock = [
  {
    id: generarIdUsuario(),
    dni: "12345678",
    nombres: "Fabricio",
    apellidos: "Administrador",
    telefono: "+51 987654321",
    email: "admin@fitfab.com",
    rol: "Administrador",
    estado: "Activo",
  },
  {
    id: generarIdUsuario(),
    dni: "87654321",
    nombres: "Lucía",
    apellidos: "Recepción",
    telefono: "+51 912345678",
    email: "recepcion@fitfab.com",
    rol: "Recepcionista",
    estado: "Activo",
  },
  {
    id: generarIdUsuario(),
    dni: "23456789",
    nombres: "Marcos",
    apellidos: "Entrenador",
    telefono: "+51 923456789",
    email: "marcos.trainer@fitfab.com",
    rol: "Entrenador Clases",
    estado: "Activo",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  inicializarPlanes();
  renderizarPlanes();
  renderizarUsuarios();

  const formNuevoStaff = document.getElementById("formNuevoStaff");
  if (formNuevoStaff) {
    formNuevoStaff.addEventListener("submit", function (e) {
      e.preventDefault();
      const dni = document.getElementById("dniStaff").value.trim();
      const nombres = document.getElementById("nombresStaff").value.trim();
      const apellidos = document.getElementById("apellidosStaff").value.trim();
      const telefono = document.getElementById("telefonoStaff").value.trim();
      const email = document.getElementById("emailStaff").value.trim();
      const rolValue = document.getElementById("rolStaff").value;
      const password = document.getElementById("passStaff").value;

      if (
        !dni ||
        !nombres ||
        !apellidos ||
        !telefono ||
        !email ||
        !rolValue ||
        !password
      ) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Error",
            text: "Completa todos los campos del formulario.",
            icon: "error",
          });
        } else {
          alert("Completa todos los campos del formulario.");
        }
        return;
      }

      const nuevoUsuario = {
        id: generarIdUsuario(),
        dni,
        nombres,
        apellidos,
        telefono,
        email,
        rol: formatearRol(rolValue),
        estado: "Activo",
      };
      usuariosMock.push(nuevoUsuario);
      renderizarUsuarios();

      const modalEl = document.getElementById("modalNuevoStaff");
      let modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl);
      }
      modalInstance.hide();
      formNuevoStaff.reset();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Éxito",
          text: "Usuario creado correctamente",
          icon: "success",
        });
      } else {
        alert("Usuario creado correctamente");
      }
    });
  }

  const formEditarStaff = document.getElementById("formEditarStaff");
  if (formEditarStaff) {
    formEditarStaff.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("editarStaffId").value;
      const dni = document.getElementById("editarDniStaff").value.trim();
      const nombres = document
        .getElementById("editarNombresStaff")
        .value.trim();
      const apellidos = document
        .getElementById("editarApellidosStaff")
        .value.trim();
      const telefono = document
        .getElementById("editarTelefonoStaff")
        .value.trim();
      const email = document.getElementById("editarEmailStaff").value.trim();
      const rolValue = document.getElementById("editarRolStaff").value;
      const estado = document.getElementById("editarEstadoStaff").value;

      if (
        !id ||
        !dni ||
        !nombres ||
        !apellidos ||
        !telefono ||
        !email ||
        !rolValue ||
        !estado
      ) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Error",
            text: "Completa todos los campos del formulario.",
            icon: "error",
          });
        } else {
          alert("Completa todos los campos del formulario.");
        }
        return;
      }

      const usuarioIndex = usuariosMock.findIndex((u) => u.id === id);
      if (usuarioIndex === -1) return;

      usuariosMock[usuarioIndex] = {
        ...usuariosMock[usuarioIndex],
        dni,
        nombres,
        apellidos,
        telefono,
        email,
        rol: formatearRol(rolValue),
        estado,
      };

      renderizarUsuarios();
      const modalEl = document.getElementById("modalEditarStaff");
      let modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalEl);
      }
      modalInstance.hide();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Éxito",
          text: "Usuario actualizado correctamente",
          icon: "success",
        });
      } else {
        alert("Usuario actualizado correctamente");
      }
    });
  }

  const formCrearPlan = document.getElementById("formCrearPlan");
  if (formCrearPlan) {
    formCrearPlan.addEventListener("submit", handleGuardarPlan);
  }

  const formDatos = document.getElementById("formDatosGimnasio");
  if (formDatos) {
    formDatos.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Éxito",
          text: "Datos del negocio actualizados",
          icon: "success",
        });
      } else {
        alert("Datos del negocio actualizados exitosamente");
      }
    });
  }
});

function handleGuardarPlan(e) {
  e.preventDefault();
  const planIdInput = document.getElementById("planId");
  const nombrePlan = document.getElementById("nombrePlan").value.trim();
  const duracionPlan = parseInt(
    document.getElementById("duracionPlan").value,
    10,
  );
  const precioPlan = parseFloat(document.getElementById("precioPlan").value);
  const colorPlan = document.getElementById("colorPlan").value;

  if (!nombrePlan || !duracionPlan || isNaN(precioPlan)) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Error",
        text: "Completa todos los campos requeridos",
        icon: "error",
      });
    } else {
      alert("Completa todos los campos requeridos");
    }
    return;
  }

  const id = planIdInput.value || generarIdPlan();
  let planesDB = JSON.parse(localStorage.getItem(STORAGE_KEY_PLANES)) || [];
  const index = planesDB.findIndex((plan) => plan.id === id);

  const planGuardado = {
    id,
    nombre: nombrePlan,
    duracion: duracionPlan,
    precio: precioPlan,
    color: colorPlan,
    estado: index >= 0 ? planesDB[index].estado : "Activo",
    cantidad_socios:
      index >= 0 ? planesDB[index].cantidad_socios : generarCantidadSocios(),
  };

  if (index >= 0) {
    planesDB[index] = planGuardado;
  } else {
    planesDB.push(planGuardado);
  }
  localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planesDB));
  renderizarPlanes();
  closeModal("modalCrearPlan");
  resetPlanForm();

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¡Listo!",
      text:
        index >= 0
          ? "Plan actualizado correctamente"
          : "Plan creado correctamente",
      icon: "success",
    });
  } else {
    alert(
      index >= 0
        ? "Plan actualizado correctamente"
        : "Plan creado correctamente",
    );
  }
}

function renderizarUsuarios() {
  const tbody = document.getElementById("tablaUsuariosBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  usuariosMock.forEach((usuario) => {
    const rolBadge = usuario.rol === "Activo" ? usuario.rol : usuario.rol;
    const estadoBadge =
      usuario.estado === "Activo"
        ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>`
        : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ps-4 fw-medium text-gray-800">
        ${usuario.nombres} ${usuario.apellidos}
      </td>
      <td class="text-muted">${usuario.email}</td>
      <td class="text-center">
        <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">${usuario.rol}</span>
      </td>
      <td class="text-center">${estadoBadge}</td>
      <td class="pe-4 text-center">
        <button class="btn btn-sm btn-outline-primary rounded me-1" onclick="abrirModalEditarUsuario('${usuario.id}')" title="Editar Usuario">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="toggleEstadoUsuario('${usuario.id}')" title="Activar/Desactivar Usuario">
          <i class="fa-solid fa-toggle-on"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.abrirModalEditarUsuario = function (usuarioId) {
  const usuario = usuariosMock.find((item) => item.id === usuarioId);
  if (!usuario) return;

  document.getElementById("editarStaffId").value = usuario.id;
  document.getElementById("editarDniStaff").value = usuario.dni || "";
  document.getElementById("editarNombresStaff").value = usuario.nombres || "";
  document.getElementById("editarApellidosStaff").value =
    usuario.apellidos || "";
  document.getElementById("editarTelefonoStaff").value = usuario.telefono || "";
  document.getElementById("editarEmailStaff").value = usuario.email || "";

  const valorRol =
    usuario.rol === "Administrador"
      ? "admin"
      : usuario.rol === "Recepcionista"
        ? "reception"
        : usuario.rol === "Coach de Piso"
          ? "coach"
          : "instructor";
  document.getElementById("editarRolStaff").value = valorRol;
  document.getElementById("editarEstadoStaff").value =
    usuario.estado || "Activo";

  const modalEl = document.getElementById("modalEditarStaff");
  let modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
};

window.toggleEstadoUsuario = function (usuarioId) {
  const index = usuariosMock.findIndex((item) => item.id === usuarioId);
  if (index === -1) return;
  usuariosMock[index].estado =
    usuariosMock[index].estado === "Activo" ? "Inactivo" : "Activo";
  renderizarUsuarios();
};

function closeModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;
  let modalInstance = bootstrap.Modal.getInstance(modalEl);
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalEl);
  }
  modalInstance.hide();
}

function resetPlanForm() {
  const planIdInput = document.getElementById("planId");
  const nombrePlan = document.getElementById("nombrePlan");
  const duracionPlan = document.getElementById("duracionPlan");
  const precioPlan = document.getElementById("precioPlan");
  const colorPlan = document.getElementById("colorPlan");
  const modalTitle = document.getElementById("modalCrearPlanLabel");
  const botonSubmit = document.getElementById("botonSubmitPlan");

  if (
    !planIdInput ||
    !nombrePlan ||
    !duracionPlan ||
    !precioPlan ||
    !colorPlan ||
    !modalTitle ||
    !botonSubmit
  )
    return;

  planIdInput.value = "";
  nombrePlan.value = "";
  duracionPlan.value = "";
  precioPlan.value = "";
  colorPlan.value = "#0d6efd";
  modalTitle.textContent = "Crear Nuevo Plan";
  botonSubmit.innerHTML = '<i class="fa-solid fa-save me-2"></i> Guardar Plan';
}

function renderizarPlanes() {
  const tbody = document.getElementById("tablaPlanesBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const planesDB = JSON.parse(localStorage.getItem(STORAGE_KEY_PLANES)) || [];

  planesDB.forEach((plan) => {
    const badgeHTML =
      plan.estado === "Activo"
        ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>`
        : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>`;

    const styleClass =
      plan.estado === "Activo" ? "text-gray-800" : "text-muted";
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="ps-4">
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle border" style="width: 18px; height: 18px; background: ${plan.color}; border-color: rgba(0,0,0,.12);"></span>
            </td>
            <td class="fw-medium ${styleClass}">${plan.nombre}</td>
            <td class="text-center ${styleClass}">${plan.duracion}</td>
            <td class="text-center ${styleClass}">${plan.cantidad_socios}</td>
            <td class="text-end fw-bold ${styleClass}">S/ ${plan.precio.toFixed(2)}</td>
            <td class="text-center">${badgeHTML}</td>
            <td class="pe-4 text-center">
                <button class="btn btn-sm btn-outline-primary rounded me-1" onclick="abrirModalEditarPlan('${plan.id}')" title="Editar Plan">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="toggleEstadoPlan('${plan.id}')" title="Activar/Desactivar">
                    <i class="fa-solid fa-toggle-on"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

window.abrirModalCrearPlan = function () {
  resetPlanForm();
};

window.abrirModalEditarPlan = function (planId) {
  const planesDB = JSON.parse(localStorage.getItem(STORAGE_KEY_PLANES)) || [];
  const plan = planesDB.find((item) => item.id === planId);
  if (!plan) return;

  const planIdInput = document.getElementById("planId");
  const nombrePlan = document.getElementById("nombrePlan");
  const duracionPlan = document.getElementById("duracionPlan");
  const precioPlan = document.getElementById("precioPlan");
  const colorPlan = document.getElementById("colorPlan");
  const modalTitle = document.getElementById("modalCrearPlanLabel");
  const botonSubmit = document.getElementById("botonSubmitPlan");

  if (
    !planIdInput ||
    !nombrePlan ||
    !duracionPlan ||
    !precioPlan ||
    !colorPlan ||
    !modalTitle ||
    !botonSubmit
  )
    return;

  planIdInput.value = plan.id;
  nombrePlan.value = plan.nombre;
  duracionPlan.value = plan.duracion;
  precioPlan.value = plan.precio;
  colorPlan.value = plan.color || "#0d6efd";
  modalTitle.textContent = "Editar Plan";
  botonSubmit.innerHTML =
    '<i class="fa-solid fa-save me-2"></i> Actualizar Plan';

  const modalEl = document.getElementById("modalCrearPlan");
  let modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
};

window.toggleEstadoPlan = function (planId) {
  const planesDB = JSON.parse(localStorage.getItem(STORAGE_KEY_PLANES)) || [];
  const index = planesDB.findIndex((item) => item.id === planId);
  if (index === -1) return;

  planesDB[index].estado =
    planesDB[index].estado === "Activo" ? "Inactivo" : "Activo";
  localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planesDB));
  renderizarPlanes();
};
