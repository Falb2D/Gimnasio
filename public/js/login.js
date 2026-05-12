// El Guardia Inverso: Si ya existe una sesión activa, no le mostramos el login
(function verificarSesionActiva() {
    const rolActual = localStorage.getItem('sesionRol');
    if (rolActual) {
        // Redirige al panel correspondiente para que sea imposible quedarse en la pantalla de Login
        switch(rolActual) {
            case 'administrador':
                window.location.replace('./views/admin/index.html');
                break;
            case 'recepcionista':
                window.location.replace('./views/recepcion/recepcion.html');
                break;
            case 'entrenador':
                window.location.replace('./views/entrenador/entrenador.html');
                break;
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mock Data de Usuarios
    const usuariosMock = [
        { usuario: 'admin', password: '123', rol: 'administrador', ruta: './views/admin/index.html' },
        { usuario: 'recepcion', password: '123', rol: 'recepcionista', ruta: './views/recepcion/recepcion.html' },
        { usuario: 'entrenador', password: '123', rol: 'entrenador', ruta: './views/entrenador/entrenador.html' }
    ];

    // 2. Captura del DOM
    const formLogin = document.querySelector('form'); // Captura el formulario
    const inputUsuario = document.getElementById('inputUsuario');
    const inputPassword = document.getElementById('inputPassword');
    const btnSubmit = document.getElementById('btnSubmit');

    if (formLogin) {
        // 3. Lógica de Autenticación
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita recargar la página

            const usuarioIngresado = inputUsuario.value.trim();
            const passwordIngresado = inputPassword.value.trim();

            // 4. Buscar coincidencia
            const usuarioEncontrado = usuariosMock.find(u => 
                u.usuario === usuarioIngresado && u.password === passwordIngresado
            );

            // 5. Redirección o Error
            if (usuarioEncontrado) {
                // Si coinciden: Guardar rol y simular sesión
                localStorage.setItem('sesionRol', usuarioEncontrado.rol);
                
                // UX: Animación de carga en el botón
                if (btnSubmit) {
                    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Ingresando...';
                    btnSubmit.disabled = true;
                }

                // Redirigir a la ruta definida en el mock data
                setTimeout(() => {
                    // Se usa replace() en lugar de href para reemplazar la página actual en el historial. 
                    // Así, si el usuario presiona "Atrás", no podrá volver al Login, evitando ciclos de navegación rotos.
                    window.location.replace(usuarioEncontrado.ruta);
                }, 500);

            } else {
                // Error: Credenciales incorrectas
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'Usuario o contraseña incorrectos.',
                        confirmButtonColor: '#0d6efd',
                        customClass: { popup: 'rounded-4 shadow-lg' }
                    });
                } else {
                    alert('Usuario o contraseña incorrectos');
                }
                
                // Limpiar contraseña y enfocar
                inputPassword.value = '';
                inputPassword.focus();
            }
        });
    }
});
