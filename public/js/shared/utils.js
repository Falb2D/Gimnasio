// public/js/shared/utils.js

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose  = document.getElementById('sidebarClose');
    const sidebar       = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
    }
    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => sidebar.classList.remove('show'));
    }

    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Cerrar Sesión') || btn.querySelector('.fa-right-from-bracket')) {
            btn.addEventListener('click', cerrarSesion);
        }
    });
});

function verificarSesion() {
    const rol = localStorage.getItem('sesionRol');
    if (!rol) {
        const path = window.location.pathname;
        const loginPath = path.includes('/views/') ? '../../login.html' : './login.html';
        window.location.replace(loginPath);
    }
}

function cerrarSesion() {
    ['sesionRol', 'sesionNombre', 'sesionId', 'token'].forEach(k => localStorage.removeItem(k));
    const path = window.location.pathname;
    window.location.replace(path.includes('/views/') ? '../../login.html' : './login.html');
}
