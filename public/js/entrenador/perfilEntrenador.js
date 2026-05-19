// public/js/entrenador/perfilEntrenador.js
// Gestiona la vista Instructor de Clases / Coach de Piso
// El perfil se determina desde el rol del usuario en Supabase

class PerfilEntrenador {
    constructor() {
        this.PERFIL_INSTRUCTOR = 'clases';
        this.PERFIL_COACH      = 'piso';
        this.perfil = this.PERFIL_INSTRUCTOR; // valor por defecto hasta cargar
    }

    async inicializar() {
        // Leer rol real desde Supabase usando el ID de sesión
        const sesionId = localStorage.getItem('sesionId');
        if (sesionId && window.supabaseClient) {
            const { data } = await window.supabaseClient
                .from('usuarios')
                .select('rol')
                .eq('id', sesionId)
                .single();
            if (data?.rol === 'coach') {
                this.perfil = this.PERFIL_COACH;
            } else {
                this.perfil = this.PERFIL_INSTRUCTOR;
            }
        }
        this.inicializarSelectorEventos();
        this.aplicarCambiosPerfil();
    }

    getPerfil() { return this.perfil; }

    setPerfil(nuevoPerfil) {
        if (nuevoPerfil !== this.PERFIL_INSTRUCTOR && nuevoPerfil !== this.PERFIL_COACH) return false;
        this.perfil = nuevoPerfil;
        this.aplicarCambiosPerfil();
        return true;
    }

    esInstructor() { return this.perfil === this.PERFIL_INSTRUCTOR; }
    esCoach()      { return this.perfil === this.PERFIL_COACH; }

    aplicarCambiosPerfil() {
        this.actualizarSelectorPerfil();
        this.actualizarSidebar();
        this.actualizarContenidoPrincipal();
        window.dispatchEvent(new CustomEvent('perfilEntrenadorCambiado', { detail: { perfil: this.perfil } }));
    }

    actualizarSelectorPerfil() {
        document.querySelectorAll('[data-perfil-selector]').forEach(selector => {
            selector.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active', 'btn-success', 'btn-outline-secondary');
                const tipo = btn.getAttribute('data-perfil-tipo');
                if (tipo === this.perfil) btn.classList.add('active', 'btn-success');
                else btn.classList.add('btn-outline-secondary');
            });
            const sel = selector.querySelector('select');
            if (sel) sel.value = this.perfil;
        });
    }

    inicializarSelectorEventos() {
        const selector = document.querySelector('[data-perfil-selector]');
        if (!selector) return;
        selector.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-perfil-tipo]');
            if (btn) this.setPerfil(btn.getAttribute('data-perfil-tipo'));
        });
        const sel = selector.querySelector('select');
        if (sel) sel.addEventListener('change', (e) => this.setPerfil(e.target.value));
    }

    actualizarSidebar() {
        const enlaceClases   = document.querySelector('a[href*="entrenador.html"]');
        const enlaceEquipos  = document.querySelector('a[href*="entrenador_equipos.html"]');

        if (enlaceClases) {
            if (this.esCoach()) {
                enlaceClases.classList.add('opacity-50', 'pe-none');
                enlaceClases.style.pointerEvents = 'none';
            } else {
                enlaceClases.classList.remove('opacity-50', 'pe-none');
                enlaceClases.style.pointerEvents = 'auto';
            }
        }
        if (enlaceEquipos) {
            if (this.esCoach()) {
                enlaceEquipos.classList.add('bg-success', 'bg-opacity-10', 'fw-bold');
                enlaceEquipos.style.borderLeft = '3px solid #198754';
            } else {
                enlaceEquipos.classList.remove('bg-success', 'bg-opacity-10', 'fw-bold');
                enlaceEquipos.style.borderLeft = 'none';
            }
        }
    }

    actualizarContenidoPrincipal() {
        if (document.getElementById('contenedorClases')) this.actualizarVistaClases();
        if (document.getElementById('tbodyEquipos'))     this.actualizarVistaEquipos();
    }

    actualizarVistaClases() {
        const contenedor  = document.getElementById('contenedorClases');
        const emptyState  = document.getElementById('emptyStateCoach');
        const headerClases = document.querySelector('main h2.h3.mb-1');
        const descripcion  = headerClases?.nextElementSibling;

        if (!contenedor) return;
        if (this.esCoach()) {
            contenedor.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            if (headerClases) headerClases.textContent = 'Turno de Sala';
            if (descripcion) descripcion.textContent = 'Hoy estás asignado a piso. Monitorea el estado de los equipos.';
        } else {
            contenedor.style.display = '';
            if (emptyState) emptyState.style.display = 'none';
            if (headerClases) headerClases.textContent = 'Mis Clases de Hoy';
            if (descripcion) descripcion.textContent = 'Consulta tus sesiones asignadas y el listado de alumnos.';
        }
    }

    actualizarVistaEquipos() {
        const tbody = document.getElementById('tbodyEquipos');
        if (tbody) tbody.style.display = '';
    }
}

const perfilEntrenador = new PerfilEntrenador();

document.addEventListener('DOMContentLoaded', () => {
    perfilEntrenador.inicializar();
});
