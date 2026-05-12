// public/js/auth.js
// Este script debe cargarse en el <head> de cada vista protegida antes que cualquier otra cosa

(function() {
    // 1. Verificamos si existe el rol guardado en localStorage
    const rol = localStorage.getItem('sesionRol');
    
    // 2. Si no existe (es null o undefined), bloqueamos el acceso
    if (!rol) {
        // Determinamos la ruta de vuelta al login basada en la ubicación actual
        const path = window.location.pathname;
        let loginPath = '';
        
        if (path.includes('/views/')) {
            // Si estamos dentro de views/rol/archivo.html, retrocedemos 2 niveles
            loginPath = '../../login.html';
        } else {
            loginPath = './login.html';
        }
        
        // 3. Usamos replace() en lugar de href para sobreescribir el historial
        // Esto evita que el botón "Atrás" funcione
        window.location.replace(loginPath);
    }
})();
