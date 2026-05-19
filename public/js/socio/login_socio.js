// public/js/socio/login_socio.js

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

document.addEventListener('DOMContentLoaded', function () {
    // Si ya tiene sesión de socio, redirigir al portal
    if (localStorage.getItem('sesionRol') === 'socio') {
        window.location.replace('./views/socio/socio.html');
        return;
    }

    const form          = document.getElementById('formAccesoSocio');
    const emailInput    = document.getElementById('emailSocio');
    const passwordInput = document.getElementById('passwordSocio');
    const toggleBtn     = document.getElementById('togglePassword');
    const forgotBtn     = document.getElementById('btnOlvidePassword');
    const googleBtn     = document.getElementById('btnGoogleLogin');

    // Mostrar/ocultar contraseña
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password'
                ? '<i class="fa-solid fa-eye"></i>'
                : '<i class="fa-solid fa-eye-slash"></i>';
        });
    }

    // ¿Olvidaste tu contraseña?
    if (forgotBtn) {
        forgotBtn.addEventListener('click', function (e) {
            e.preventDefault();
            Swal.fire({
                icon: 'info',
                title: '¿Olvidaste tu contraseña?',
                html: `Tu contraseña por defecto es tu <strong>número de DNI</strong>.<br><br>
                       Si la cambiaste y no la recuerdas, acércate a recepción para que te la restablezcan.`,
                confirmButtonColor: '#0d6efd',
                confirmButtonText: 'Entendido',
            });
        });
    }

    // Botón de Google (no implementado aún)
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            Swal.fire({
                icon: 'info',
                title: 'Próximamente',
                text: 'El inicio de sesión con Google estará disponible en una próxima versión.',
                confirmButtonColor: '#0d6efd',
            });
        });
    }

    // Submit del formulario
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email    = emailInput.value.trim();
            const password = passwordInput.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            let valido = true;

            if (!emailRegex.test(email)) {
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
                valido = false;
            } else {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            }

            if (!password) {
                passwordInput.classList.add('is-invalid');
                passwordInput.classList.remove('is-valid');
                valido = false;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid');
            }

            if (!valido) return;

            const btnSubmit = form.querySelector('button[type="submit"]');
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Iniciando sesión...';
            btnSubmit.disabled  = true;

            try {
                const passwordHash = await sha256(password);

                const { data, error } = await window.supabaseClient
                    .from('socios')
                    .select('id, nombres, apellidos, estado')
                    .eq('email', email)
                    .eq('password', passwordHash)
                    .maybeSingle();

                if (error) throw error;

                if (!data) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Credenciales incorrectas',
                        text: 'El correo o la contraseña son incorrectos.',
                        confirmButtonColor: '#0d6efd',
                    });
                    btnSubmit.innerHTML = 'Iniciar Sesión <i class="fa-solid fa-chevron-right ms-2 small"></i>';
                    btnSubmit.disabled  = false;
                    return;
                }

                if (data.estado === 'Inactivo') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cuenta inactiva',
                        text: 'Tu membresía no está activa. Acércate a recepción para activarla.',
                        confirmButtonColor: '#0d6efd',
                    });
                    btnSubmit.innerHTML = 'Iniciar Sesión <i class="fa-solid fa-chevron-right ms-2 small"></i>';
                    btnSubmit.disabled  = false;
                    return;
                }

                // Sesión exitosa
                localStorage.setItem('sesionRol',    'socio');
                localStorage.setItem('sesionId',      data.id);
                localStorage.setItem('sesionNombre', `${data.nombres} ${data.apellidos}`);

                window.location.replace('./views/socio/socio.html');

            } catch (err) {
                console.error('Error en login socio:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
                    confirmButtonColor: '#0d6efd',
                });
                btnSubmit.innerHTML = 'Iniciar Sesión <i class="fa-solid fa-chevron-right ms-2 small"></i>';
                btnSubmit.disabled  = false;
            }
        });
    }
});
