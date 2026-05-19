// public/js/recepcion/acceso.js
// Backend: Supabase

document.addEventListener('DOMContentLoaded', () => {
    const inputIngreso    = document.getElementById('inputIngreso');
    const btnValidar      = document.getElementById('btnValidar');
    const estadoEsperando = document.getElementById('estadoEsperando');
    const estadoPermitido = document.getElementById('estadoPermitido');
    const estadoDenegado  = document.getElementById('estadoDenegado');
    const estadoInvalido  = document.getElementById('estadoInvalido');

    let timeoutReset = null;

    const ocultarPaneles = () => {
        [estadoEsperando, estadoPermitido, estadoDenegado, estadoInvalido]
            .forEach(el => el && el.classList.add('d-none'));
    };

    const procesarIngreso = async () => {
        const valor = inputIngreso ? inputIngreso.value.trim() : '';
        if (!valor) return;

        ocultarPaneles();

        // Buscar socio en Supabase por DNI
        const { data, error } = await window.supabaseClient
            .from('socios')
            .select('id, nombres, apellidos, dni, estado')
            .or(`dni.eq.${valor},nombres.ilike.%${valor}%`)
            .limit(1)
            .maybeSingle();

        if (error) console.error('Error buscando socio:', error);

        if (!data) {
            estadoInvalido && estadoInvalido.classList.remove('d-none');
        } else if (data.estado === 'Activo') {
            const nombre = `${data.nombres} ${data.apellidos}`;
            if (estadoPermitido) {
                estadoPermitido.querySelector('h3') && (estadoPermitido.querySelector('h3').textContent = nombre);
                estadoPermitido.querySelector('h5') && (estadoPermitido.querySelector('h5').textContent = `DNI: ${data.dni}`);
                const img = estadoPermitido.querySelector('img');
                if (img) img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=fff&color=198754&rounded=true&size=100`;
                estadoPermitido.classList.remove('d-none');
            }
        } else {
            const nombre = `${data.nombres} ${data.apellidos}`;
            if (estadoDenegado) {
                estadoDenegado.querySelector('h3') && (estadoDenegado.querySelector('h3').textContent = nombre);
                estadoDenegado.querySelector('h5') && (estadoDenegado.querySelector('h5').textContent = `DNI: ${data.dni}`);
                const img = estadoDenegado.querySelector('img');
                if (img) img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=fff&color=dc3545&rounded=true&size=100`;
                estadoDenegado.classList.remove('d-none');
            }
        }

        if (inputIngreso) inputIngreso.value = '';

        if (timeoutReset) clearTimeout(timeoutReset);
        timeoutReset = setTimeout(() => {
            ocultarPaneles();
            estadoEsperando && estadoEsperando.classList.remove('d-none');
            if (inputIngreso) inputIngreso.focus();
        }, 4000);
    };

    if (btnValidar) btnValidar.addEventListener('click', procesarIngreso);

    if (inputIngreso) {
        inputIngreso.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); procesarIngreso(); }
        });
        inputIngreso.focus();
    }

    // Cámara QR (sin cambios — la librería Html5Qrcode llena el input y dispara procesarIngreso)
    let isScanningAllowed = true;
    if (typeof Html5Qrcode !== 'undefined') {
        const html5QrCode = new Html5Qrcode('reader');
        html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                if (isScanningAllowed) {
                    isScanningAllowed = false;
                    if (inputIngreso) inputIngreso.value = decodedText;
                    procesarIngreso();
                    setTimeout(() => { isScanningAllowed = true; }, 4000);
                }
            },
            () => {}
        ).catch(err => {
            const reader = document.getElementById('reader');
            if (reader) reader.innerHTML = `<div class="mt-5 text-center text-danger"><i class="fa-solid fa-video-slash fa-2x mb-2"></i><br><b>Error de Cámara</b><p class="small text-muted mt-2">Permita el acceso a la cámara o verifique que no esté en uso.</p></div>`;
        });
    }
});
