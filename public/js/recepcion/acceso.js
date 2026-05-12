document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Base de Datos (Mock Data) si no existe
    // Siempre sobrescribimos para esta prueba para tener 6 usuarios sincronizados
    const sociosMock = [
        { dni: '76543210', nombres: 'Carlos', apellidos: 'Mendoza Rojas', estado: 'Activo', plan: 'Mensual Ilimitado', vencimiento: '15/06/2026' },
        { dni: '43210987', nombres: 'Ana María', apellidos: 'Torres', estado: 'Moroso', plan: 'Trimestral VIP', vencimiento: '01/05/2026' },
        { dni: '12345678', nombres: 'Roberto', apellidos: 'Salas Pinto', estado: 'Inactivo', plan: 'Mensual Básico', vencimiento: '--/--/----' },
        { dni: '87654321', nombres: 'Lucía', apellidos: 'Gómez', estado: 'Activo', plan: 'Anual Premium', vencimiento: '10/12/2026' },
        { dni: '11223344', nombres: 'Luis', apellidos: 'Perez', estado: 'Activo', plan: 'Trimestral VIP', vencimiento: '12/08/2026' },
        { dni: '99887766', nombres: 'Marta', apellidos: 'Gomez', estado: 'Inactivo', plan: 'Ninguno', vencimiento: '--/--/----' }
    ];
    localStorage.setItem('sociosDB', JSON.stringify(sociosMock));

    // 2. Captura del DOM
    const inputIngreso = document.getElementById('inputIngreso');
    const btnValidar = document.getElementById('btnValidar');
    
    // Paneles de estado visual
    const estadoEsperando = document.getElementById('estadoEsperando');
    const estadoPermitido = document.getElementById('estadoPermitido');
    const estadoDenegado = document.getElementById('estadoDenegado');
    const estadoInvalido = document.getElementById('estadoInvalido');

    let timeoutReset = null;

    // Función auxiliar para ocultar todos los paneles
    const ocultarPaneles = () => {
        estadoEsperando.classList.add('d-none');
        estadoPermitido.classList.add('d-none');
        estadoDenegado.classList.add('d-none');
        estadoInvalido.classList.add('d-none');
    };

    // 3. Función principal de Validación
    const procesarIngreso = () => {
        const valorIngresado = inputIngreso.value.trim();
        
        if (!valorIngresado) return; // Si el input está vacío, no hacer nada

        ocultarPaneles(); // Limpiamos la vista actual
        
        // Leer base de datos actualizada
        const sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
        
        // Buscar al socio (soporta buscar por DNI numérico o Nombre)
        const socio = sociosDB.find(s => {
            const nombreCompleto = `${s.nombres} ${s.apellidos}`.toLowerCase();
            return s.dni === valorIngresado || nombreCompleto.includes(valorIngresado.toLowerCase());
        });

        // 4. Lógica Condicional y Cambio Visual Dinámico
        if (!socio) {
            // Escenario A: El socio NO existe (Ícono de advertencia)
            estadoInvalido.classList.remove('d-none');
        } else if (socio.estado === 'Activo') {
            const nombreCompleto = `${socio.nombres} ${socio.apellidos}`;
            // Escenario B: Socio existe y está 'Activo' (Mensaje Verde)
            estadoPermitido.querySelector('h3').textContent = nombreCompleto;
            estadoPermitido.querySelector('h5').textContent = `DNI: ${socio.dni}`;
            // Avatar dinámico de acuerdo al nombre
            estadoPermitido.querySelector('img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=fff&color=198754&rounded=true&size=100`;
            estadoPermitido.classList.remove('d-none');
        } else {
            const nombreCompleto = `${socio.nombres} ${socio.apellidos}`;
            // Escenario C: Socio existe pero es 'Moroso' o 'Inactivo' (Mensaje Rojo)
            estadoDenegado.querySelector('h3').textContent = nombreCompleto;
            estadoDenegado.querySelector('h5').textContent = `DNI: ${socio.dni}`;
            estadoDenegado.querySelector('img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=fff&color=dc3545&rounded=true&size=100`;
            estadoDenegado.classList.remove('d-none');
        }

        // Limpiar el input inmediatamente para no entorpecer el siguiente escaneo
        inputIngreso.value = '';

        // 5. Reinicio Automático
        // Cancelamos cualquier temporizador previo si se hacen escaneos muy seguidos
        if (timeoutReset) clearTimeout(timeoutReset);
        
        // Iniciar cuenta regresiva de 4 segundos
        timeoutReset = setTimeout(() => {
            ocultarPaneles();
            estadoEsperando.classList.remove('d-none');
            
            // Devolver automáticamente el cursor al input para lectura continua
            if(inputIngreso) inputIngreso.focus();
        }, 4000);
    };

    // 6. Asignación de Eventos
    // Evento CLICK en el botón
    if (btnValidar) {
        btnValidar.addEventListener('click', procesarIngreso);
    }

    // Evento KEYPRESS (Tecla Enter) en el input
    // Esto es vital porque los lectores de códigos de barras/QR envían un 'Enter' físico invisible al terminar de leer
    if (inputIngreso) {
        inputIngreso.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evitar que el form se envíe si llegase a existir uno
                procesarIngreso();
            }
        });
        
        // Enfocar automáticamente el input al cargar la pantalla de control de acceso
        inputIngreso.focus();
    }

    // 7. Inicialización de Cámara Web para escaneo de QR real
    let isScanningAllowed = true;
    
    // Verificamos que la librería se haya cargado desde el CDN
    if (typeof Html5Qrcode !== 'undefined') {
        const html5QrCode = new Html5Qrcode("reader");
        
        html5QrCode.start(
            { facingMode: "environment" }, // Usa la cámara trasera en móviles por defecto
            {
                fps: 10, // Cuadros por segundo (balance entre rendimiento y rapidez)
                qrbox: { width: 250, height: 250 } // Área de enfoque del escáner
            },
            (decodedText, decodedResult) => {
                // Función que se ejecuta cuando lee un código exitosamente
                if (isScanningAllowed) {
                    isScanningAllowed = false; // Pausar escaneo para evitar bucles
                    
                    // Inyectar el valor (DNI) leído de la cámara al input manual
                    inputIngreso.value = decodedText;
                    
                    // Invocar la misma función de validación que ya creamos
                    procesarIngreso();
                    
                    // Reanudar el escaneo cuando pasen los 4 segundos del setTimeout
                    setTimeout(() => {
                        isScanningAllowed = true;
                    }, 4000);
                }
            },
            (errorMessage) => {
                // Ignorar errores continuos de cuando la cámara no detecta un QR
            }
        ).catch((err) => {
            console.error("Error al iniciar la cámara: ", err);
            document.getElementById("reader").innerHTML = `<div class="mt-5 text-center text-danger"><i class="fa-solid fa-video-slash fs-2 mb-2"></i><br><b>Error de Cámara</b><p class="small text-muted mt-2">Por favor, permita el acceso a la cámara web de su navegador o revise si otro programa la está usando.</p></div>`;
        });
    }
});
