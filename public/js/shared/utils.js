// public/js/shared/utils.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Simulación de Autenticación
    verificarSesion();

    // 2. Control de Sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');

    // Manejar el toggle para mostrar la barra
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            // Dependiendo del CSS custom, podría ser 'active' en lugar de 'show'
            // sidebar.classList.toggle('active');
        });
    }

    // Manejar el botón para cerrar la barra en vista móvil
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('show');
            // sidebar.classList.remove('active');
        });
    }

    // 3. Configurar botones de Cerrar Sesión
    // Encontramos todos los botones de la página. Si incluyen el texto 'Cerrar Sesión' o el ícono FontAwesome, les atamos el evento.
    const botones = document.querySelectorAll('button');
    botones.forEach(btn => {
        if (btn.textContent.includes('Cerrar Sesión') || btn.querySelector('.fa-right-from-bracket')) {
            btn.addEventListener('click', cerrarSesion);
        }
    });
});

/**
 * Función para simular verificación de sesión
 * Comprueba si existe el token en el localStorage.
 */
function verificarSesion() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("Advertencia: No hay sesión activa (token no encontrado en localStorage). Se deberá redirigir al login.");
    }
}

/**
 * Función para cerrar la sesión
 * Elimina el token y redirige al login de staff.
 */
function cerrarSesion() {
    localStorage.removeItem('token');
    
    // Calcular el path correcto hacia views/login.html
    const path = window.location.pathname;
    
    // Si estamos dentro de un subdirectorio de views (ej. views/admin/)
    // usamos '../login.html' para retroceder una carpeta hacia views/
    if (path.includes('/views/')) {
        window.location.href = '../login.html';
    } else {
        // Si estamos en la raíz del proyecto
        window.location.href = './views/login.html';
    }
}
