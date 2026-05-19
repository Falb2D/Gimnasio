// public/js/login.js

(function verificarSesionActiva() {
    const rol = localStorage.getItem('sesionRol');
    if (!rol) return;
    switch (rol) {
        case 'administrador': window.location.replace('./views/admin/index.html'); break;
        case 'recepcionista': window.location.replace('./views/recepcion/recepcion.html'); break;
        case 'entrenador':    window.location.replace('./views/entrenador/entrenador.html'); break;
    }
})();

const RUTAS_POR_ROL = {
    admin      : { sesion: 'administrador', ruta: './views/admin/index.html' },
    reception  : { sesion: 'recepcionista', ruta: './views/recepcion/recepcion.html' },
    instructor : { sesion: 'entrenador',    ruta: './views/entrenador/entrenador.html' },
    coach      : { sesion: 'entrenador',    ruta: './views/entrenador/entrenador.html' },
};

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const formLogin     = document.getElementById('formLogin');
    const inputUsuario  = document.getElementById('inputUsuario');
    const inputPassword = document.getElementById('inputPassword');
    const btnSubmit     = document.getElementById('btnSubmit');

    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usuario  = inputUsuario.value.trim();
        const password = inputPassword.value;

        if (!usuario || !password) return;

        if (btnSubmit) {
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" style="width:1rem;height:1rem;border-width:2px;"></span> Verificando...';
            btnSubmit.disabled  = true;
        }

        const passwordHash = await sha256(password);

        const { data, error } = await window.supabaseClient
            .from('usuarios')
            .select('id, nombres, apellidos, rol, estado, password')
            .eq('username', usuario)
            .eq('estado', 'Activo')
            .single();

        if (error || !data) {
            mostrarError('Usuario no encontrado o inactivo.');
            resetBtn();
            return;
        }

        if (data.password !== passwordHash) {
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
