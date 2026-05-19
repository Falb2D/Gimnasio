/**
 * Sistema de Gestión de Perfiles para Entrenador
 * Controla la visualización entre "Instructor de Clases" y "Coach de Piso"
 */

class PerfilEntrenador {
  constructor() {
    this.PERFIL_INSTRUCTOR = "clases";
    this.PERFIL_COACH = "piso";
    this.STORAGE_KEY = "fitfab_rol_entrenador";

    // Inicializar perfil desde localStorage o valor por defecto
    this.perfil =
      localStorage.getItem(this.STORAGE_KEY) || this.PERFIL_INSTRUCTOR;

    // Listener para cambios en localStorage
    window.addEventListener("storage", (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.perfil = e.newValue || this.PERFIL_INSTRUCTOR;
        this.aplicarCambiosPerfil();
      }
    });
  }

  /**
   * Obtener el perfil actual
   */
  getPerfil() {
    return this.perfil;
  }

  /**
   * Cambiar el perfil actual
   */
  setPerfil(nuevoPerfil) {
    if (
      nuevoPerfil !== this.PERFIL_INSTRUCTOR &&
      nuevoPerfil !== this.PERFIL_COACH
    ) {
      console.warn("Perfil inválido:", nuevoPerfil);
      return false;
    }

    this.perfil = nuevoPerfil;
    localStorage.setItem(this.STORAGE_KEY, nuevoPerfil);
    this.aplicarCambiosPerfil();
    return true;
  }

  /**
   * Validar si es Instructor de Clases
   */
  esInstructor() {
    return this.perfil === this.PERFIL_INSTRUCTOR;
  }

  /**
   * Validar si es Coach de Piso
   */
  esCoach() {
    return this.perfil === this.PERFIL_COACH;
  }

  /**
   * Aplicar cambios visuales al cambiar de perfil
   */
  aplicarCambiosPerfil() {
    // Actualizar selector de perfil (si existe)
    this.actualizarSelectorPerfil();

    // Actualizar sidebar
    this.actualizarSidebar();

    // Actualizar contenido principal (diferente según página)
    this.actualizarContenidoPrincipal();

    // Disparar evento personalizado para otros scripts
    window.dispatchEvent(
      new CustomEvent("perfilEntrenadorCambiado", {
        detail: { perfil: this.perfil },
      }),
    );
  }

  /**
   * Actualizar el selector de perfil en el header
   */
  actualizarSelectorPerfil() {
    const selectores = document.querySelectorAll("[data-perfil-selector]");
    selectores.forEach((selector) => {
      // Actualizar botones si es tipo toggle
      const botones = selector.querySelectorAll("button");
      botones.forEach((btn) => {
        btn.classList.remove("active", "btn-success", "btn-outline-secondary");

        const tipo = btn.getAttribute("data-perfil-tipo");
        if (tipo === this.perfil) {
          btn.classList.add("active", "btn-success");
          btn.classList.remove("btn-outline-secondary");
        } else {
          btn.classList.add("btn-outline-secondary");
        }
      });

      // Actualizar select si es tipo dropdown
      const select = selector.querySelector("select");
      if (select) {
        select.value = this.perfil;
      }
    });
  }

  /**
   * Inicializar eventos del selector de perfil
   */
  inicializarSelectorEventos() {
    const selector = document.querySelector("[data-perfil-selector]");
    if (!selector) return;

    selector.addEventListener("click", (event) => {
      const boton = event.target.closest("button[data-perfil-tipo]");
      if (!boton) return;
      const nuevoPerfil = boton.getAttribute("data-perfil-tipo");
      this.setPerfil(nuevoPerfil);
    });

    const select = selector.querySelector("select");
    if (select) {
      select.addEventListener("change", (event) => {
        this.setPerfil(event.target.value);
      });
    }
  }

  /**
   * Actualizar visibilidad del sidebar según perfil
   */
  actualizarSidebar() {
    // Enlaces del sidebar
    const enlaceMisClases = document.querySelector(
      'a[href*="entrenador.html"]',
    );
    const enlaceReporteEquipos = document.querySelector(
      'a[href*="entrenador_equipos.html"]',
    );

    if (enlaceMisClases) {
      if (this.esCoach()) {
        // Deshabilitar "Mis Clases"
        enlaceMisClases.classList.add("opacity-50", "pe-none");
        enlaceMisClases.style.pointerEvents = "none";
        enlaceMisClases.style.cursor = "not-allowed";
      } else {
        // Habilitar "Mis Clases"
        enlaceMisClases.classList.remove("opacity-50", "pe-none");
        enlaceMisClases.style.pointerEvents = "auto";
        enlaceMisClases.style.cursor = "pointer";
      }
    }

    if (enlaceReporteEquipos) {
      if (this.esCoach()) {
        // Destacar "Reporte de Equipos"
        enlaceReporteEquipos.classList.add(
          "bg-success",
          "bg-opacity-10",
          "fw-bold",
        );
        enlaceReporteEquipos.style.borderLeft = "3px solid #198754";
        enlaceReporteEquipos.style.paddingLeft = "calc(0.5rem - 3px)";
      } else {
        // Remover destacado
        enlaceReporteEquipos.classList.remove(
          "bg-success",
          "bg-opacity-10",
          "fw-bold",
        );
        enlaceReporteEquipos.style.borderLeft = "none";
        enlaceReporteEquipos.style.paddingLeft = "";
      }
    }
  }

  /**
   * Actualizar contenido principal según página y perfil
   */
  actualizarContenidoPrincipal() {
    // Verificar si estamos en la página de Mis Clases
    if (
      document.getElementById("contenedorClases") ||
      document.querySelector('[data-contenedor="clases"]')
    ) {
      this.actualizarVistaClases();
    }

    // Verificar si estamos en la página de Reporte de Equipos
    if (
      document.getElementById("tbodyEquipos") ||
      document.querySelector('[data-contenedor="equipos"]')
    ) {
      this.actualizarVistaEquipos();
    }
  }

  /**
   * Actualizar vista de Mis Clases
   */
  actualizarVistaClases() {
    const contenedorClases = document.getElementById("contenedorClases");
    const emptyStateCoach = document.getElementById("emptyStateCoach");
    const headerClases = document.querySelector("main h2.h3.mb-1");
    const descripcion = headerClases?.nextElementSibling;

    if (!contenedorClases) return;

    if (this.esCoach()) {
      // Ocultar tarjetas de clases y mostrar empty state de Coach de Piso
      contenedorClases.style.display = "none";
      if (emptyStateCoach) {
        emptyStateCoach.style.display = "flex";
      }

      if (headerClases) {
        headerClases.textContent = "Turno de Sala";
      }
      if (descripcion) {
        descripcion.textContent =
          "Hoy estás asignado a piso. No tienes clases grupales programadas. Recuerda monitorear el estado de los equipos.";
      }
    } else {
      // Volver a la vista de Instructor de Clases
      contenedorClases.style.display = "";
      if (emptyStateCoach) {
        emptyStateCoach.style.display = "none";
      }

      if (headerClases) {
        headerClases.textContent = "Mis Clases de Hoy";
      }
      if (descripcion) {
        descripcion.textContent =
          "Consulta tus sesiones asignadas y el listado de alumnos.";
      }
    }
  }

  /**
   * Actualizar vista de Reporte de Equipos
   */
  actualizarVistaEquipos() {
    // La vista de equipos es la misma para ambos, pero podría haber cambios futuros
    // Por ahora, solo asegurar que esté visible
    const tbody = document.getElementById("tbodyEquipos");
    if (tbody) {
      tbody.style.display = "";
    }
  }
}

// Instancia global del perfil
const perfilEntrenador = new PerfilEntrenador();

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  perfilEntrenador.inicializarSelectorEventos();
  perfilEntrenador.aplicarCambiosPerfil();
});
