// public/js/admin/configuracion.js
// Backend: Supabase

function formatearRol(rolValue) {
  if (rolValue === "admin") return "Administrador";
  if (rolValue === "reception") return "Recepcionista";
  if (rolValue === "instructor") return "Entrenador Clases";
  if (rolValue === "coach") return "Coach de Piso";
  return "Sin Rol";
}

// ===================== PLANES =====================

async function renderizarPlanes() {
  const tbody = document.getElementById("tablaPlanesBody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';

  const { data: planes, error } = await window.supabaseClient
    .from("planes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al cargar planes:", error);
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Error al cargar planes.</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  if (!planes || planes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay planes registrados.</td></tr>';
    return;
  }

  planes.forEach((plan) => {
    const badgeHTML = plan.estado === "Activo"
      ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>`
      : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>`;

    const styleClass = plan.estado === "Activo" ? "text-gray-800" : "text-muted";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ps-4">
        <span class="d-inline-flex align-items-center justify-content-center rounded-circle border"
          style="width:18px;height:18px;background:${plan.color};border-color:rgba(0,0,0,.12);"></span>
      </td>
      <td class="fw-medium ${styleClass}">${plan.nombre}</td>
      <td class="text-center ${styleClass}">${plan.duracion} días</td>
      <td class="text-center ${styleClass}">—</td>
      <td class="text-end fw-bold ${styleClass}">S/ ${parseFloat(plan.precio).toFixed(2)}</td>
      <td class="text-center">${badgeHTML}</td>
      <td class="pe-4 text-center">
        <button class="btn btn-sm btn-outline-primary rounded me-1"
          onclick="abrirModalEditarPlan('${plan.id}')" title="Editar Plan">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary"
          onclick="toggleEstadoPlan('${plan.id}','${plan.estado}')" title="Activar/Desactivar">
          <i class="fa-solid fa-toggle-on"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleGuardarPlan(e) {
  e.preventDefault();
  const planId    = document.getElementById("planId").value;
  const nombre    = document.getElementById("nombrePlan").value.trim();
  const duracion  = parseInt(document.getElementById("duracionPlan").value, 10);
  const precio    = parseFloat(document.getElementById("precioPlan").value);
  const color     = document.getElementById("colorPlan").value;

  if (!nombre || !duracion || isNaN(precio)) {
    Swal.fire({ title: "Error", text: "Completa todos los campos requeridos", icon: "error" });
    return;
  }

  const planData = { nombre, duracion, precio, color };
  let error;

  if (planId) {
    ({ error } = await window.supabaseClient.from("planes").update(planData).eq("id", planId));
  } else {
    ({ error } = await window.supabaseClient.from("planes").insert({ ...planData, estado: "Activo" }));
  }

  if (error) {
    console.error("Error al guardar plan:", error);
    Swal.fire({ title: "Error", text: "No se pudo guardar el plan.", icon: "error" });
    return;
  }

  await renderizarPlanes();
  closeModal("modalCrearPlan");
  resetPlanForm();
  Swal.fire({ title: "¡Listo!", text: planId ? "Plan actualizado correctamente" : "Plan creado correctamente", icon: "success" });
}

window.abrirModalCrearPlan = function () {
  resetPlanForm();
};

window.abrirModalEditarPlan = async function (planId) {
  const { data: plan, error } = await window.supabaseClient
    .from("planes")
    .select("*")
    .eq("id", planId)
    .single();

  if (error || !plan) return;

  document.getElementById("planId").value           = plan.id;
  document.getElementById("nombrePlan").value        = plan.nombre;
  document.getElementById("duracionPlan").value      = plan.duracion;
  document.getElementById("precioPlan").value        = plan.precio;
  document.getElementById("colorPlan").value         = plan.color || "#0d6efd";
  document.getElementById("modalCrearPlanLabel").textContent = "Editar Plan";
  document.getElementById("botonSubmitPlan").innerHTML =
    '<i class="fa-solid fa-save me-2"></i> Actualizar Plan';

  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalCrearPlan")).show();
};

window.toggleEstadoPlan = async function (planId, estadoActual) {
  const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
  const { error } = await window.supabaseClient
    .from("planes")
    .update({ estado: nuevoEstado })
    .eq("id", planId);

  if (error) { console.error("Error al cambiar estado del plan:", error); return; }
  renderizarPlanes();
};

function resetPlanForm() {
  ["planId", "nombrePlan", "duracionPlan", "precioPlan"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const colorPlan = document.getElementById("colorPlan");
  if (colorPlan) colorPlan.value = "#0d6efd";
  const title = document.getElementById("modalCrearPlanLabel");
  if (title) title.textContent = "Crear Nuevo Plan";
  const btn = document.getElementById("botonSubmitPlan");
  if (btn) btn.innerHTML = '<i class="fa-solid fa-save me-2"></i> Guardar Plan';
}

// ===================== USUARIOS =====================

async function renderizarUsuarios() {
  const tbody = document.getElementById("tablaUsuariosBody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';

  const { data: usuarios, error } = await window.supabaseClient
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al cargar usuarios:", error);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Error al cargar usuarios.</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  if (!usuarios || usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay usuarios registrados.</td></tr>';
    return;
  }

  usuarios.forEach((usuario) => {
    const estadoBadge = usuario.estado === "Activo"
      ? `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>`
      : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ps-4 fw-medium text-gray-800">${usuario.nombres} ${usuario.apellidos}</td>
      <td class="text-muted">${usuario.email}</td>
      <td class="text-center">
        <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-pill">
          ${formatearRol(usuario.rol)}
        </span>
      </td>
      <td class="text-center">${estadoBadge}</td>
      <td class="pe-4 text-center">
        <button class="btn btn-sm btn-outline-primary rounded me-1"
          onclick="abrirModalEditarUsuario('${usuario.id}')" title="Editar Usuario">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary"
          onclick="toggleEstadoUsuario('${usuario.id}','${usuario.estado}')" title="Activar/Desactivar">
          <i class="fa-solid fa-toggle-on"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.abrirModalEditarUsuario = async function (usuarioId) {
  const { data: usuario, error } = await window.supabaseClient
    .from("usuarios")
    .select("*")
    .eq("id", usuarioId)
    .single();

  if (error || !usuario) return;

  document.getElementById("editarStaffId").value        = usuario.id;
  document.getElementById("editarDniStaff").value        = usuario.dni || "";
  document.getElementById("editarNombresStaff").value    = usuario.nombres || "";
  document.getElementById("editarApellidosStaff").value  = usuario.apellidos || "";
  document.getElementById("editarTelefonoStaff").value   = usuario.telefono || "";
  document.getElementById("editarEmailStaff").value      = usuario.email || "";
  document.getElementById("editarRolStaff").value        = usuario.rol || "instructor";
  document.getElementById("editarEstadoStaff").value     = usuario.estado || "Activo";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEditarStaff")).show();
};

window.toggleEstadoUsuario = async function (usuarioId, estadoActual) {
  const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
  const { error } = await window.supabaseClient
    .from("usuarios")
    .update({ estado: nuevoEstado })
    .eq("id", usuarioId);

  if (error) { console.error("Error al cambiar estado del usuario:", error); return; }
  renderizarUsuarios();
};

function closeModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

// ===================== INIT =====================

document.addEventListener("DOMContentLoaded", () => {
  renderizarPlanes();
  renderizarUsuarios();

  const formNuevoStaff = document.getElementById("formNuevoStaff");
  if (formNuevoStaff) {
    formNuevoStaff.addEventListener("submit", async function (e) {
      e.preventDefault();
      const dni      = document.getElementById("dniStaff").value.trim();
      const nombres  = document.getElementById("nombresStaff").value.trim();
      const apellidos= document.getElementById("apellidosStaff").value.trim();
      const telefono = document.getElementById("telefonoStaff").value.trim();
      const email    = document.getElementById("emailStaff").value.trim();
      const rol      = document.getElementById("rolStaff").value;

      if (!dni || !nombres || !apellidos || !telefono || !email || !rol) {
        Swal.fire({ title: "Error", text: "Completa todos los campos del formulario.", icon: "error" });
        return;
      }

      const { error } = await window.supabaseClient
        .from("usuarios")
        .insert({ dni, nombres, apellidos, telefono, email, rol, estado: "Activo" });

      if (error) {
        console.error("Error al crear usuario:", error);
        Swal.fire({ title: "Error", text: "No se pudo crear el usuario.", icon: "error" });
        return;
      }

      await renderizarUsuarios();
      closeModal("modalNuevoStaff");
      formNuevoStaff.reset();
      Swal.fire({ title: "Éxito", text: "Usuario creado correctamente", icon: "success" });
    });
  }

  const formEditarStaff = document.getElementById("formEditarStaff");
  if (formEditarStaff) {
    formEditarStaff.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id       = document.getElementById("editarStaffId").value;
      const dni      = document.getElementById("editarDniStaff").value.trim();
      const nombres  = document.getElementById("editarNombresStaff").value.trim();
      const apellidos= document.getElementById("editarApellidosStaff").value.trim();
      const telefono = document.getElementById("editarTelefonoStaff").value.trim();
      const email    = document.getElementById("editarEmailStaff").value.trim();
      const rol      = document.getElementById("editarRolStaff").value;
      const estado   = document.getElementById("editarEstadoStaff").value;

      if (!id || !dni || !nombres || !apellidos || !telefono || !email || !rol || !estado) {
        Swal.fire({ title: "Error", text: "Completa todos los campos del formulario.", icon: "error" });
        return;
      }

      const { error } = await window.supabaseClient
        .from("usuarios")
        .update({ dni, nombres, apellidos, telefono, email, rol, estado })
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar usuario:", error);
        Swal.fire({ title: "Error", text: "No se pudo actualizar el usuario.", icon: "error" });
        return;
      }

      await renderizarUsuarios();
      closeModal("modalEditarStaff");
      Swal.fire({ title: "Éxito", text: "Usuario actualizado correctamente", icon: "success" });
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
      Swal.fire({ title: "Éxito", text: "Datos del negocio actualizados", icon: "success" });
    });
  }
});
