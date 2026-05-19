// public/js/login.js
// Autenticación contra tabla usuarios en Supabase

// Guardia inverso: si ya hay sesión activa, redirigir al panel
(function verificarSesionActiva() {
    const rol = localStorage.getItem('sesionRol');
    if (!rol) return;
    switch (rol) {
        case 'administrador':  window.location.replace('./views/admin/index.html'); break;
        case 'recepcionista':  window.location.replace('./views/recepcion/recepcion.html'); break;
        case 'entrenador':     window.location.replace('./views/entrenador/entrenador.html'); break;
    }
})();

const RUTAS_POR_ROL = {
    admin      : { sesion: 'administrador', ruta: './views/admin/index.html' },
    reception  : { sesion: 'recepcionista', ruta: './views/recepcion/recepcion.html' },
    instructor : { sesion: 'entrenador',    ruta: './views/entrenador/entrenador.html' },
    coach      : { sesion: 'entrenador',    ruta: './views/entrenador/entrenador.html' },
};

document.addEventListener('DOMContentLoaded', () => {
    const formLogin     = document.getElementById('formLogin');
    const inputUsuario  = document.getElementById('inputUsuario');
    const inputPassword = document.getElementById('inputPassword');
    const btnSubmit     = document.getElementById('btnSubmit');

    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario  = inputUsuario.value.trim();
        const password = inputPassword.value.trim();

        if (!usuario || !password) return;

        // UX: mostrar spinner
        if (btnSubmit) {
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Verificando...';
            btnSubmit.disabled  = true;
        }

        // Buscar usuario en Supabase por DNI o email
        const { data, error } = await window.supabaseClient
            .from('usuarios')
            .select('id, nombres, apellidos, rol, estado, password')
            .or(`dni.eq.${usuario},email.eq.${usuario}`)
            .eq('estado', 'Activo')
            .single();

        if (error || !data) {
            mostrarError('Usuario no encontrado o inactivo.');
            resetBtn();
            return;
        }

        if (data.password !== password) {
            mostrarError('Contraseña incorrecta.');
            resetBtn();
            inputPassword.value = '';
            inputPassword.focus();
            return;
        }

        const config = RUTAS_POR_ROL[data.rol];
        if (!config) {
            mostrarError('Rol no reconocido. Contacta al administrador.');
            resetBtn();
            return;
        }

        // Guardar sesión en localStorage
        localStorage.setItem('sesionRol',    config.sesion);
        localStorage.setItem('sesionNombre', `${data.nombres} ${data.apellidos}`);
        localStorage.setItem('sesionId',     data.id);

        setTimeout(() => window.location.replace(config.ruta), 500);
    });

    function resetBtn() {
        if (btnSubmit) {
            btnSubmit.innerHTML = 'Iniciar Sesión <i class="fa-solid fa-arrow-right ms-2"></i>';
            btnSubmit.disabled  = false;
        }
    }

    function mostrarError(texto) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: texto,
                confirmButtonColor: '#0d6efd',
                customClass: { popup: 'rounded-4 shadow-lg' }
            });
        } else {
            alert(texto);
        }
    }
});
