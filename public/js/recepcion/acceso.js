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

    // Registra el acceso en la tabla registros_acceso
    const registrarAcceso = async (socio, resultado) => {
        await window.supabaseClient
            .from('registros_acceso')
            .insert({
                socio_id : socio ? socio.id : null,
                nombres  : socio ? `${socio.nombres} ${socio.apellidos}` : null,
                dni      : socio ? socio.dni : null,
                resultado,
            })
            .then(({ error }) => { if (error) console.error('Error registrando acceso:', error); });
    };

    const procesarIngreso = async () => {
        const valor = inputIngreso ? inputIngreso.value.trim() : '';
        if (!valor) return;

        ocultarPaneles();

        const hoy = new Date().toISOString().split('T')[0];
        let query;

        // ── Detectar formato QR: "FITFAB-{uuid}" ──────────────────────────────
        if (valor.startsWith('FITFAB-')) {
            const socioId = valor.slice(7); // extrae el UUID después de "FITFAB-"
            query = window.supabaseClient
                .from('socios')
                .select('id, nombres, apellidos, dni, estado, vencimiento')
                .eq('id', socioId)
                .maybeSingle();
        } else {
            // Búsqueda manual por DNI o nombre
            query = window.supabaseClient
                .from('socios')
                .select('id, nombres, apellidos, dni, estado, vencimiento')
                .or(`dni.eq.${valor},nombres.ilike.%${valor}%`)
                .limit(1)
                .maybeSingle();
        }

        const { data, error } = await query;
        if (error) console.error('Error buscando socio:', error);

        if (!data) {
            // Socio no encontrado — código/DNI inválido
            estadoInvalido && estadoInvalido.classList.remove('d-none');
        } else {
            const nombre = `${data.nombres} ${data.apellidos}`;

            // Doble verificación: estado Activo Y vencimiento vigente
            const vencimientoVigente = data.vencimiento && data.vencimiento >= hoy;
            const accesoConcedido    = data.estado === 'Activo' && vencimientoVigente;
            const resultado          = accesoConcedido ? 'Permitido' : 'Denegado';

            if (accesoConcedido) {
                if (estadoPermitido) {
                    estadoPermitido.querySelector('h3') && (estadoPermitido.querySelector('h3').textContent = nombre);
                    estadoPermitido.querySelector('h5') && (estadoPermitido.querySelector('h5').textContent = `DNI: ${data.dni}`);
                    const img = estadoPermitido.querySelector('img');
                    if (img) img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=fff&color=198754&rounded=true&size=100`;
                    estadoPermitido.classList.remove('d-none');
                }
            } else {
                if (estadoDenegado) {
                    estadoDenegado.querySelector('h3') && (estadoDenegado.querySelector('h3').textContent = nombre);
                    estadoDenegado.querySelector('h5') && (estadoDenegado.querySelector('h5').textContent = `DNI: ${data.dni}`);
                    const img = estadoDenegado.querySelector('img');
                    if (img) img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=fff&color=dc3545&rounded=true&size=100`;
                    estadoDenegado.classList.remove('d-none');
                }
            }

            // Siempre registrar el intento de acceso
            await registrarAcceso(data, resultado);
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

    // ── Cámara QR ─────────────────────────────────────────────────────────────
    // Html5Qrcode decodifica el QR, llena el input con "FITFAB-{uuid}" y
    // dispara procesarIngreso automáticamente
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
        ).catch(() => {
            const reader = document.getElementById('reader');
            if (reader) reader.innerHTML = `
                <div class="mt-5 text-center text-danger">
                    <i class="fa-solid fa-video-slash fa-2x mb-2"></i><br>
                    <b>Error de Cámara</b>
                    <p class="small text-muted mt-2">Permita el acceso a la cámara o verifique que no esté en uso.</p>
                </div>`;
        });
    }
});
