// public/js/admin/pagos.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Ya no usamos Mock Data, todo se lee dinámicamente de pagosDB en localStorage
    
    // Inicialización preventiva: Si vaciaron el localStorage o no visitaron "Socios" antes
    if (!localStorage.getItem('sociosDB')) {
        const sociosMock = [
            { id_socio: 1, dni: '73849501', nombres: 'Juan', apellidos: 'Gonzáles Pérez', plan: 'Mensual Ilimitado', vencimiento: '15/06/2026', estado: 'Activo', email: 'juan.g@email.com' },
            { id_socio: 2, dni: '45678912', nombres: 'María', apellidos: 'Rodríguez Solano', plan: 'Trimestral VIP', vencimiento: '01/05/2026', estado: 'Moroso', email: 'maria.r@email.com' },
            { id_socio: 3, dni: '12345678', nombres: 'Carlos', apellidos: 'López Vargas', plan: 'Semestral Básico', vencimiento: '20/12/2025', estado: 'Inactivo', email: 'carlos.l@email.com' },
            { id_socio: 4, dni: '87654321', nombres: 'Ana', apellidos: 'Martínez Ruiz', plan: 'Mensual Básico', vencimiento: '10/07/2026', estado: 'Activo', email: 'ana.m@email.com' },
            { id_socio: 5, dni: '76543210', nombres: 'Luis', apellidos: 'Fernández Silva', plan: 'Anual Full', vencimiento: '05/01/2027', estado: 'Activo', email: 'luis.f@email.com' }
        ];
        localStorage.setItem('sociosDB', JSON.stringify(sociosMock));
    }

    const tablaPagos = document.getElementById('tablaPagos');
    const formRegistroPago = document.getElementById('formRegistroPago') || document.getElementById('formPago'); 
    const seleccionarPlan = document.getElementById('seleccionarPlan') || document.getElementById('selectPlan'); 
    const inputMonto = document.getElementById('montoPagar') || document.getElementById('inputMonto'); 
    
    // Forzar readonly desde JS por si no está en el HTML
    if (inputMonto) inputMonto.readOnly = true;

    // Helper: Mapeo de íconos según método de pago
    const getIconoMetodo = (metodo) => {
        switch(metodo.toLowerCase()) {
            case 'efectivo': return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
            case 'transferencia': return '<i class="fa-solid fa-building-columns text-secondary me-1"></i>';
            case 'yape / plin': return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
            default: return '<i class="fa-solid fa-credit-card text-info me-1"></i>';
        }
    };

    // Helper: Mapeo de Badges de Bootstrap según estado
    const getBadgeEstado = (estado) => {
        switch(estado.toLowerCase()) {
            case 'vigente': return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Vigente</span>';
            case 'vencida': return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Vencida</span>';
            case 'cancelada': return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Cancelada</span>';
            default: return `<span class="badge bg-light text-dark">${estado}</span>`;
        }
    };

    // 2. Renderizar Tabla del Historial
    const renderizarHistorial = () => {
        if (!tablaPagos) return;
        
        let historialPagos = JSON.parse(localStorage.getItem('pagosDB')) || [];

        // Limpiamos la tabla
        tablaPagos.innerHTML = '';

        if (historialPagos.length === 0) {
            tablaPagos.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay pagos registrados en el sistema.</td></tr>';
            return;
        }

        // Iterar array e inyectar filas
        historialPagos.forEach((pago, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800">${pago.fecha}</td>
                <td class="fw-semibold text-gray-800">${pago.socio}</td>
                <td class="text-muted">${pago.plan}</td>
                <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto).toFixed(2)}</td>
                <td><span class="badge bg-light text-dark border">${getIconoMetodo(pago.metodoPago)} ${pago.metodoPago}</span></td>
                <td>${getBadgeEstado(pago.estado)}</td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-primary border rounded shadow-sm btn-descargar" data-index="${index}" title="Descargar Comprobante">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                </td>
            `;
            tablaPagos.appendChild(tr);
        });

        // Event listener dinámico para los nuevos botones PDF
        const botonesPdf = document.querySelectorAll('.btn-descargar');
        botonesPdf.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Capturar el botón aunque hagan clic en el ícono interior
                const boton = e.currentTarget; 
                const index = boton.getAttribute('data-index');
                const pago = historialPagos[index];
                
                if (typeof window.jspdf !== 'undefined') {
                    generarPDFComprobante(pago);
                } else {
                    alert("La librería PDF no ha cargado correctamente.");
                }
            });
        });
    };

    // Función creadora del PDF
    const generarPDFComprobante = (pago) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Colores y Fuentes
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(13, 110, 253); // Azul primary Bootstrap
        doc.text("FITFAB S.A.C.", 105, 20, null, null, "center");

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("Comprobante de Pago", 105, 30, null, null, "center");
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35); // Línea separadora

        // Datos del Recibo
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        
        // Columna Izquierda
        doc.setFont("helvetica", "bold");
        doc.text("Cliente:", 20, 50);
        doc.text("DNI / Doc:", 20, 60);
        doc.text("Fecha:", 20, 70);
        doc.text("Plan:", 20, 80);
        doc.text("Método:", 20, 90);
        
        // Columna Derecha (Valores)
        doc.setFont("helvetica", "normal");
        doc.text(pago.socio, 60, 50);
        doc.text(pago.dni || "N/A", 60, 60);
        doc.text(pago.fecha, 60, 70);
        doc.text(pago.plan, 60, 80);
        doc.text(pago.metodoPago, 60, 90);

        // Caja del Monto Total
        doc.setFillColor(248, 249, 250); // bg-light
        doc.rect(20, 105, 170, 25, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("TOTAL PAGADO:", 30, 122);
        doc.setTextColor(25, 135, 84); // success green
        doc.text(`S/ ${parseFloat(pago.monto).toFixed(2)}`, 140, 122);

        // Footer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("¡Gracias por confiar en FITFAB!", 105, 150, null, null, "center");
        doc.text("Este es un comprobante de control interno.", 105, 157, null, null, "center");

        // Guardar y descargar
        doc.save(`Recibo_FITFAB_${pago.socio.replace(/\s+/g, '_')}.pdf`);
        
        // Notificar éxito sin interrumpir
        Swal.fire({
            title: 'Descargando',
            text: 'Tu comprobante en PDF se está descargando...',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    // Renderizado Inicial
    renderizarHistorial();

    // 3. Lógica de Autocompletado de Precio
    if (seleccionarPlan && inputMonto) {
        seleccionarPlan.addEventListener('change', (e) => {
            const precio = e.target.value;
            if (precio) {
                inputMonto.value = parseFloat(precio).toFixed(2);
            } else {
                inputMonto.value = '';
            }
        });
    }

    // Buscador de Socios: Feedback visual (Autocompletado de confirmación)
    const buscarSocioInput = document.getElementById('buscarSocio') || document.getElementById('inputBuscarSocio');
    let feedbackSocio = document.getElementById('mensajeSocio');
    
    // Si no existe en el HTML (porque usan la versión anterior), lo creamos dinámicamente
    if (buscarSocioInput && !feedbackSocio) {
        feedbackSocio = document.createElement('div');
        feedbackSocio.id = 'mensajeSocio';
        feedbackSocio.className = 'w-100 form-text mt-1 d-none';
        buscarSocioInput.parentNode.parentNode.appendChild(feedbackSocio);
    }

    if (buscarSocioInput && feedbackSocio) {
        buscarSocioInput.addEventListener('input', (e) => {
            const dni = e.target.value.trim();
            // Buscar cuando tenga al menos 8 dígitos
            if (dni.length >= 8) {
                const sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
                const socio = sociosDB.find(s => s.dni === dni);
                
                feedbackSocio.classList.remove('d-none'); // Mostrar el div
                
                if (socio) {
                    feedbackSocio.className = 'text-success fw-bold mt-1 small';
                    feedbackSocio.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Socio encontrado: ${socio.nombres} ${socio.apellidos}`;
                } else {
                    feedbackSocio.className = 'text-danger fw-bold mt-1 small';
                    feedbackSocio.innerHTML = `<i class="fa-solid fa-xmark-circle me-1"></i> DNI no registrado.`;
                }
            } else {
                feedbackSocio.classList.add('d-none');
                feedbackSocio.innerHTML = '';
            }
        });
    }

    // 4. Procesar Pago
    if (formRegistroPago) {
        formRegistroPago.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar DNI
            const dniSocio = buscarSocioInput.value.trim();
            const planSeleccionado = seleccionarPlan.options[seleccionarPlan.selectedIndex].text.split(' - ')[0]; 
            const montoPagar = inputMonto.value;
            
            // Soporta la modificación del HTML a readonly input o select
            const metodoInput = document.getElementById('metodoPago');
            const textoMetodo = metodoInput.tagName.toLowerCase() === 'select' ? 
                metodoInput.options[metodoInput.selectedIndex].text : 
                metodoInput.value;

            // Leer BD de socios compartida
            let sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
            const indexSocio = sociosDB.findIndex(s => s.dni === dniSocio);

            if (indexSocio === -1) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Socio no encontrado', 'Verifique que el DNI sea correcto y pertenezca a un socio registrado.', 'error');
                } else {
                    alert('Socio no encontrado.');
                }
                return;
            }

            const socioEncontrado = sociosDB[indexSocio];

            // 🛑 NUEVA VALIDACIÓN: Verificar si el socio ya está activo
            const estadoActual = (socioEncontrado.estado || '').trim().toLowerCase();
            if (estadoActual === 'activo' || estadoActual === 'vigente') {
                if (typeof Swal !== 'undefined') {
                    Swal.fire(
                        'Operación denegada', 
                        `El socio ya cuenta con una membresía vigente hasta el ${socioEncontrado.vencimiento}`, 
                        'error'
                    );
                } else {
                    alert(`Operación denegada. El socio ya cuenta con una membresía vigente hasta el ${socioEncontrado.vencimiento}`);
                }
                return; // Detiene la ejecución del pago
            }

            // Fechas
            const hoy = new Date();
            const fechaFormateada = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;

            // Calcular nuevo vencimiento (sumando 1 mes exacto a la fecha actual)
            const nuevaFechaVencimiento = new Date(hoy);
            nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + 1);
            const vencimientoStr = nuevaFechaVencimiento.toISOString().split('T')[0]; // "YYYY-MM-DD" que usa el Administrador

            // Actualizar estado del Socio
            sociosDB[indexSocio].plan = planSeleccionado;
            sociosDB[indexSocio].estado = 'Activo';
            sociosDB[indexSocio].vencimiento = vencimientoStr;
            localStorage.setItem('sociosDB', JSON.stringify(sociosDB));

            // Armar el nuevo Pago
            const nuevoPago = {
                fecha: fechaFormateada,
                socio: `${socioEncontrado.nombres} ${socioEncontrado.apellidos}`,
                dni: dniSocio,
                plan: planSeleccionado,
                monto: montoPagar,
                metodoPago: textoMetodo,
                estado: 'Vigente'
            };

            // Guardar en la base de datos de pagos (pagosDB)
            let pagosDB = JSON.parse(localStorage.getItem('pagosDB')) || [];
            pagosDB.unshift(nuevoPago); // Para que aparezca primero
            localStorage.setItem('pagosDB', JSON.stringify(pagosDB));

            // Re-renderizar la tabla de la vista con datos persistentes
            renderizarHistorial();

            // Feedback visual con SweetAlert2
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Pago Registrado Exitosamente. El socio ahora está Activo.',
                    icon: 'success',
                    confirmButtonColor: '#198754'
                });
            } else {
                alert('Pago Registrado Exitosamente. El socio ahora está Activo.');
            }

            // Limpiar formulario y reiniciar UI
            formRegistroPago.reset();
            inputMonto.value = '0.00';
            if (feedbackSocio) {
                feedbackSocio.classList.add('d-none');
                feedbackSocio.innerHTML = '';
            }
        });
    }

    // --- LÓGICA VISUAL DE PESTAÑAS (TABS) ---
    // Conservada de la versión anterior para mantener el estilo visual del subrayado azul
    const tabsLinks = document.querySelectorAll('#pagosTabs .nav-link');
    tabsLinks.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            if(event.relatedTarget) {
                // Remover estilos del tab anterior
                event.relatedTarget.classList.remove('border-bottom', 'border-primary', 'border-3', 'text-primary');
                event.relatedTarget.classList.add('text-muted');
            }
            
            // Añadir estilos al tab actual
            event.target.classList.remove('text-muted');
            event.target.classList.add('border-bottom', 'border-primary', 'border-3', 'text-primary');
        });
    });
});
