// public/js/shared/utils.js

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ===================== SESIÓN =====================

const SESSION_TIMEOUT_MS  = 30 * 60 * 1000; // 30 minutos de inactividad
const SESSION_WARNING_MS  = 29 * 60 * 1000; // aviso al minuto 29

let _timeoutHandle  = null;
let _warningHandle  = null;
let _warningSwal    = null;

function _resetSessionTimer() {
    clearTimeout(_timeoutHandle);
    clearTimeout(_warningHandle);

    // Si hay una alerta de advertencia abierta, cerrarla
    if (_warningSwal) { _warningSwal.close(); _warningSwal = null; }

    _warningHandle = setTimeout(_mostrarAvisoExpiracion, SESSION_WARNING_MS);
    _timeoutHandle = setTimeout(_expirarSesion, SESSION_TIMEOUT_MS);
}

function _mostrarAvisoExpiracion() {
    if (typeof Swal === 'undefined') return;
    let segundos = 60;
    _warningSwal = Swal.fire({
        icon: 'warning',
        title: 'Sesión por expirar',
        html: `Tu sesión cerrará por inactividad en <strong id="cuentaRegresiva">60</strong> segundos.`,
        confirmButtonText: 'Seguir conectado',
        confirmButtonColor: '#0d6efd',
        allowOutsideClick: false,
        didOpen: () => {
            const intervalo = setInterval(() => {
                segundos--;
                const el = document.getElementById('cuentaRegresiva');
                if (el) el.textContent = segundos;
                if (segundos <= 0) clearInterval(intervalo);
            }, 1000);
        }
    });
    _warningSwal.then(result => {
        if (result.isConfirmed) {
            _resetSessionTimer();
        }
    });
}

function _getLoginPath() {
    const rol  = localStorage.getItem('sesionRol');
    const path = window.location.pathname;
    const esSocio = rol === 'socio' || path.includes('/socio/');
    if (esSocio) {
        return path.includes('/views/') ? '../../login_socio.html' : './login_socio.html';
    }
    return path.includes('/views/') ? '../../login.html' : './login.html';
}

function _expirarSesion() {
    if (_warningSwal) { _warningSwal.close(); _warningSwal = null; }
    const loginPath = _getLoginPath();
    ['sesionRol', 'sesionNombre', 'sesionId', 'token'].forEach(k => localStorage.removeItem(k));

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Sesión expirada',
            text: 'Cerraste sesión por inactividad.',
            confirmButtonColor: '#0d6efd',
            allowOutsideClick: false,
        }).then(() => window.location.replace(loginPath));
    } else {
        window.location.replace(loginPath);
    }
}

function _iniciarMonitorInactividad() {
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => {
        document.addEventListener(ev, _resetSessionTimer, { passive: true });
    });
    _resetSessionTimer();
}

// ===================== INIT =====================

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    _iniciarMonitorInactividad();

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
    if (rol) return;
    const path = window.location.pathname;
    if (path.endsWith('login.html') || path.endsWith('login_socio.html') || path === '/' || path === '') return;
    window.location.replace(_getLoginPath());
}

function cerrarSesion() {
    clearTimeout(_timeoutHandle);
    clearTimeout(_warningHandle);
    const loginPath = _getLoginPath();
    ['sesionRol', 'sesionNombre', 'sesionId', 'token'].forEach(k => localStorage.removeItem(k));
    window.location.replace(loginPath);
}
