/**
 * clasesService.js - Servicio centralizado para la gestión de Clases Grupales
 * Fuente Única de Verdad para todas las vistas: Admin, Recepción, Entrenador y Socio
 */

class ClasesService {
  constructor() {
    this.STORAGE_KEY = "clasesDB";
    this.inicializarDatos();
  }

  /**
   * Inicializar datos en localStorage si no existen
   */
  inicializarDatos() {
    if (localStorage.getItem(this.STORAGE_KEY)) return;

    const generarInscritos = (cantidad) => {
      const arr = [];
      for (let i = 1; i <= cantidad; i++) {
        arr.push({
          dni: "7000" + i.toString().padStart(4, "0"),
          nombre: `Socio de Prueba ${i}`,
        });
      }
      return arr;
    };

    const clasesBase = [
      {
        id: 1,
        nombre: "Yoga Nidra",
        horario: "18:00 - 19:00 hrs",
        coach: "Valeria S.",
        salon: "Salón Zen",
        capacidad_max: 20,
        icono: "fa-spa",
        bg_icono: "bg-primary",
        text_icono: "text-primary",
        inscritos: generarInscritos(12),
        estado: "Activa",
      },
      {
        id: 2,
        nombre: "Spinning Pro",
        horario: "19:30 - 20:30 hrs",
        coach: "Marcos T.",
        salon: "Salón Cardio 1",
        capacidad_max: 25,
        icono: "fa-person-biking",
        bg_icono: "bg-danger",
        text_icono: "text-danger",
        inscritos: generarInscritos(25),
        estado: "Activa",
      },
      {
        id: 3,
        nombre: "CrossFit WOD",
        horario: "20:30 - 21:30 hrs",
        coach: "Luis R.",
        salon: "Box Funcional",
        capacidad_max: 20,
        icono: "fa-dumbbell",
        bg_icono: "bg-warning",
        text_icono: "text-warning",
        inscritos: generarInscritos(18),
        estado: "Activa",
      },
    ];

    // Normalizar claves para compatibilidad: añadir coach_nombre, ubicacion y fecha_hora (si se puede extraer)
    const clasesNormalizadas = clasesBase.map((c) => {
      const nueva = { ...c };
      // coach_nombre y ubicacion: mantener consistencia
      nueva.coach_nombre = c.coach || c.coach_nombre || "";
      nueva.ubicacion = c.salon || c.ubicacion || "";
      // intentar extraer hora desde campo horario (ej. '18:00 - 19:00 hrs')
      if (c.horario) {
        const m = c.horario.toString().match(/(\d{1,2}:\d{2})/);
        if (m) {
          const now = new Date();
          const parts = m[1].split(":");
          now.setHours(parseInt(parts[0] || 0), parseInt(parts[1] || 0), 0, 0);
          nueva.fecha_hora = now.toISOString();
        } else {
          nueva.fecha_hora = "";
        }
      } else {
        nueva.fecha_hora = c.fecha_hora || "";
      }
      return nueva;
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clasesNormalizadas));
  }

  /**
   * Obtener todas las clases
   */
  obtenerClases() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
  }

  /**
   * Obtener una clase por ID
   */
  obtenerClasePorId(id) {
    const clases = this.obtenerClases();
    return clases.find((c) => c.id === parseInt(id));
  }

  /**
   * Obtener una clase por nombre
   */
  obtenerClasePorNombre(nombre) {
    const clases = this.obtenerClases();
    return clases.find((c) => c.nombre === nombre);
  }

  /**
   * Crear una nueva clase
   */
  crearClase(datos) {
    const clases = this.obtenerClases();
    // Normalizar y almacenar tanto las claves nuevas (fecha_hora, coach_nombre, ubicacion)
    // como las claves legacy (horario, coach, salon) para compatibilidad entre vistas
    const fechaHoraIso =
      datos.fecha_hora ||
      (datos.horario && Date.parse(datos.horario)
        ? new Date(datos.horario).toISOString()
        : datos.fecha_hora || "");
    const horaVisual = (function () {
      if (datos.horario) return datos.horario;
      if (datos.fecha_hora) {
        const d = new Date(datos.fecha_hora);
        if (!isNaN(d))
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} hrs`;
      }
      return "--:-- hrs";
    })();

    const nuevaClase = {
      id: Date.now(),
      nombre: datos.nombre || "Sin nombre",
      fecha_hora: datos.fecha_hora || "",
      horario: horaVisual,
      coach_nombre: datos.coach_nombre || datos.coach || "Sin asignar",
      coach: datos.coach || datos.coach_nombre || "Sin asignar",
      ubicacion: datos.ubicacion || datos.salon || "Sin ubicación",
      salon: datos.salon || datos.ubicacion || "Sin ubicación",
      capacidad_max: parseInt(datos.capacidad_max) || 20,
      icono: datos.icono || "fa-regular fa-calendar-check",
      bg_icono: datos.bg_icono || "bg-secondary",
      text_icono: datos.text_icono || "text-secondary",
      inscritos: [],
      estado: datos.estado || "Activa",
    };
    clases.push(nuevaClase);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clases));
    return nuevaClase;
  }

  /**
   * Actualizar una clase
   */
  actualizarClase(id, datos) {
    const clases = this.obtenerClases();
    const index = clases.findIndex((c) => c.id === parseInt(id));
    if (index === -1) return null;

    clases[index] = {
      ...clases[index],
      ...datos,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clases));
    return clases[index];
  }

  /**
   * Eliminar una clase
   */
  eliminarClase(id) {
    const clases = this.obtenerClases();
    const filtered = clases.filter((c) => c.id !== parseInt(id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Marcar una clase como cancelada (no borra)
   */
  cancelarClase(id) {
    const clases = this.obtenerClases();
    const index = clases.findIndex((c) => c.id === parseInt(id));
    if (index === -1) return null;
    clases[index] = {
      ...clases[index],
      estado: "Cancelada",
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clases));
    return clases[index];
  }

  /**
   * Inscribir un socio en una clase
   */
  inscribirSocio(claseId, dni, nombreSocio) {
    const clases = this.obtenerClases();
    const clase = clases.find((c) => c.id === parseInt(claseId));
    if (!clase) return false;

    // Verificar si el socio ya está inscrito
    const yaInscrito = clase.inscritos.some((i) => i.dni === dni);
    if (yaInscrito) return false;

    clase.inscritos.push({
      dni: dni,
      nombre: nombreSocio,
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clases));
    return true;
  }

  /**
   * Desuscribir un socio de una clase
   */
  desuscribirSocio(claseId, dni) {
    const clases = this.obtenerClases();
    const clase = clases.find((c) => c.id === parseInt(claseId));
    if (!clase) return false;

    clase.inscritos = clase.inscritos.filter((i) => i.dni !== dni);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clases));
    return true;
  }

  /**
   * Calcular porcentaje de ocupación (CORREGIDO: evita NaN)
   */
  calcularPorcentajeOcupacion(clase) {
    if (!clase || !clase.capacidad_max || clase.capacidad_max <= 0) {
      return 0;
    }
    const reservasActuales = clase.inscritos ? clase.inscritos.length : 0;
    return Math.round((reservasActuales / clase.capacidad_max) * 100);
  }

  /**
   * Verificar si una clase está llena
   */
  estaLlena(clase) {
    if (!clase) return false;
    const reservasActuales = clase.inscritos ? clase.inscritos.length : 0;
    return reservasActuales >= clase.capacidad_max;
  }

  /**
   * Obtener el estado visual de una clase
   */
  obtenerEstadoVisual(clase) {
    // Si la clase está cancelada, prioridad a ese estado
    const estadoClase = clase && (clase.estado || clase.estado_clase);
    if (estadoClase === "Cancelada") {
      return {
        color: "danger",
        badge: "Cancelada",
        colorBadge: "danger",
      };
    }

    const porcentaje = this.calcularPorcentajeOcupacion(clase);
    let estado = {
      color: "success",
      badge: "Cupos Libres",
      colorBadge: "success",
    };

    if (porcentaje >= 100) {
      estado = {
        color: "danger",
        badge: "Clase Llena",
        colorBadge: "danger",
      };
    } else if (porcentaje >= 80) {
      estado = {
        color: "warning",
        badge: "Casi Lleno",
        colorBadge: "warning",
      };
    }

    return estado;
  }
}

// Instancia global del servicio
const clasesService = new ClasesService();
