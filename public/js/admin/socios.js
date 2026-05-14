// public/js/admin/socios.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Array de objetos JSON (mock data) cargado desde localStorage
    let sociosMock = JSON.parse(localStorage.getItem('sociosDB'));
    if (!sociosMock || sociosMock.length === 0) {
        sociosMock = [
            { id_socio: 1, dni: '73849501', nombres: 'Juan', apellidos: 'Gonzáles Pérez', plan: 'Mensual Ilimitado', vencimiento: '15/06/2026', estado: 'Activo', email: 'juan.g@email.com' },
            { id_socio: 2, dni: '45678912', nombres: 'María', apellidos: 'Rodríguez Solano', plan: 'Trimestral VIP', vencimiento: '01/05/2026', estado: 'Moroso', email: 'maria.r@email.com' },
            { id_socio: 3, dni: '12345678', nombres: 'Carlos', apellidos: 'López Vargas', plan: 'Semestral Básico', vencimiento: '20/12/2025', estado: 'Inactivo', email: 'carlos.l@email.com' },
            { id_socio: 4, dni: '87654321', nombres: 'Ana', apellidos: 'Martínez Ruiz', plan: 'Mensual Básico', vencimiento: '10/07/2026', estado: 'Activo', email: 'ana.m@email.com' },
            { id_socio: 5, dni: '76543210', nombres: 'Luis', apellidos: 'Fernández Silva', plan: 'Anual Full', vencimiento: '05/01/2027', estado: 'Activo', email: 'luis.f@email.com' }
        ];
        localStorage.setItem('sociosDB', JSON.stringify(sociosMock));
    }

    const tablaSocios = document.getElementById('tablaSocios');
    const buscadorSocios = document.getElementById('buscadorSocios');
    const formRegistroSocio = document.getElementById('formRegistroSocio');

    // Helper: Obtener iniciales para el avatar
    const obtenerIniciales = (nombres, apellidos) => {
        return (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();
    };

    // Helper: Obtener la insignia (Badge) de Bootstrap según el estado
    const obtenerBadgeEstado = (estado) => {
        switch (estado) {
            case 'Activo':
                return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>';
            case 'Moroso':
                return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Moroso</span>';
            case 'Inactivo':
                return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>';
            default:
                return `<span class="badge bg-light text-dark">${estado}</span>`;
        }
    };

    // Helper: Obtener colores para el avatar según el estado
    const obtenerColorAvatar = (estado) => {
        switch (estado) {
            case 'Activo': return 'bg-primary text-primary';
            case 'Moroso': return 'bg-danger text-danger';
            case 'Inactivo': return 'bg-secondary text-secondary';
            default: return 'bg-primary text-primary';
        }
    };

    // 2. Función para renderizar la tabla dinámicamente
    const renderizarTabla = (socios) => {
        if (!tablaSocios) return;
        
        // Limpiar el <tbody> de la tabla HTML
        tablaSocios.innerHTML = '';

        if (socios.length === 0) {
            tablaSocios.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron socios que coincidan con la búsqueda.</td></tr>';
            return;
        }

        // Inyectar dinámicamente las filas (<tr>)
        socios.forEach(socio => {
            const tr = document.createElement('tr');
            
            const iniciales = obtenerIniciales(socio.nombres, socio.apellidos);
            const badgeEstado = obtenerBadgeEstado(socio.estado);
            const colorAvatar = obtenerColorAvatar(socio.estado);

            tr.innerHTML = `
                <td class="ps-4 text-gray-800 fw-medium">${socio.dni}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar ${colorAvatar} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style="width: 40px; height: 40px;">
                            ${iniciales}
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${socio.nombres} ${socio.apellidos}</span>
                            <small class="text-muted">${socio.email}</small>
                        </div>
                    </div>
                </td>
                <td class="text-gray-800">${socio.plan}</td>
                <td class="text-gray-800">${socio.vencimiento}</td>
                <td>${badgeEstado}</td>
                <td class="pe-4 text-center">
                    <div class="btn-group gap-1">
                        <button class="btn btn-sm btn-light text-secondary rounded" title="Ver Detalle" onclick="abrirModalVer('${socio.dni}')"><i class="fa-regular fa-eye"></i></button>
                        <button class="btn btn-sm btn-light text-primary rounded" title="Generar QR" onclick="abrirModalQR('${socio.dni}')"><i class="fa-solid fa-qrcode"></i></button>
                        <button class="btn btn-sm btn-light text-warning rounded" title="Editar" onclick="abrirModalEditar('${socio.dni}')"><i class="fa-regular fa-pen-to-square"></i></button>
                    </div>
                </td>
            `;
            tablaSocios.appendChild(tr);
        });
    };

    // Renderizar la tabla inicial con todos los socios de prueba
    renderizarTabla(sociosMock);

    // 3. Lógica para la barra de búsqueda
    if (buscadorSocios) {
        // Event listener al input de búsqueda
        buscadorSocios.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            
            // Filtrar el array original por nombre, apellidos o DNI
            const filtrados = sociosMock.filter(socio => {
                const nombreCompleto = `${socio.nombres} ${socio.apellidos}`.toLowerCase();
                return socio.dni.includes(termino) || nombreCompleto.includes(termino);
            });
            
            // Volver a llamar a renderizarTabla() con los resultados
            renderizarTabla(filtrados);
        });
    }

    // 4. Lógica para el Modal de 'Registrar Nuevo Socio'
    if (formRegistroSocio) {
        // Capturar el evento 'submit' del formulario
        formRegistroSocio.addEventListener('submit', (e) => {
            // Prevén el comportamiento por defecto
            e.preventDefault();

            // Recolectar los datos del formulario en un objeto JSON
            const nuevoSocioJSON = {
                nombres: document.getElementById('nombresSocio').value,
                apellidos: document.getElementById('apellidosSocio').value,
                dni: document.getElementById('dniSocio').value,
                email: document.getElementById('emailSocio').value,
                fechaNacimiento: document.getElementById('fechaNacimientoSocio').value,
                plan_id: document.getElementById('planSocio').value
            };

            // Mostrar en consola (simulando el envío al backend)
            console.log("Datos a enviar al servidor:", JSON.stringify(nuevoSocioJSON, null, 2));

            // Simulación adicional: agregar el nuevo socio a la tabla local
            const selectPlan = document.getElementById('planSocio');
            const nombrePlanCompleto = selectPlan.options[selectPlan.selectedIndex].text;
            const nombrePlanLimpio = nombrePlanCompleto.split(' (')[0]; // Ejemplo: 'Mensual Básico'

            sociosMock.unshift({
                id_socio: Date.now(),
                dni: nuevoSocioJSON.dni,
                nombres: nuevoSocioJSON.nombres,
                apellidos: nuevoSocioJSON.apellidos,
                plan: nombrePlanLimpio,
                vencimiento: 'Por definir', // Simulación
                estado: 'Activo',
                email: nuevoSocioJSON.email || 'correo@ejemplo.com'
            });

            // Guardar en localStorage
            localStorage.setItem('sociosDB', JSON.stringify(sociosMock));

            // Re-renderizamos para ver el resultado en pantalla
            renderizarTabla(sociosMock);
            
            // Limpiar los inputs
            formRegistroSocio.reset();

            // Cerrar el modal usando la API de Bootstrap 5
            const modalElement = document.getElementById('modalNuevoSocio');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }

    // ==========================================
    // LÓGICA DE LOS MODALES DE ACCIONES
    // ==========================================
    
    // Variable global para identificar qué socio estamos editando
    let socioEnEdicionDni = null;

    window.abrirModalVer = function(dni) {
        const sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
        const socio = sociosDB.find(s => s.dni === String(dni));

        if (socio) {
            document.getElementById('verNombres').value = `${socio.nombres} ${socio.apellidos}`;
            document.getElementById('verCorreo').value = socio.email || 'Sin correo registrado';
            document.getElementById('verPlan').value = socio.plan;
            document.getElementById('verVencimiento').value = socio.vencimiento || 'N/A';
            document.getElementById('verEstado').value = socio.estado;

            const modal = new bootstrap.Modal(document.getElementById('modalVerSocio'));
            modal.show();
        }
    };

    window.abrirModalQR = function(dni) {
        const sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
        const socio = sociosDB.find(s => s.dni === String(dni));

        if (socio) {
            document.getElementById('qrNombreSocio').textContent = `${socio.nombres} ${socio.apellidos}`;
            document.getElementById('qrImagen').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FITFAB-DNI-${socio.dni}`;

            const modal = new bootstrap.Modal(document.getElementById('modalQRSocio'));
            modal.show();
        }
    };

    window.abrirModalEditar = function(dni) {
        const sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
        const socio = sociosDB.find(s => s.dni === String(dni));

        if (socio) {
            socioEnEdicionDni = String(dni);

            document.getElementById('editarNombres').value = socio.nombres;
            document.getElementById('editarApellidos').value = socio.apellidos;
            document.getElementById('editarCorreo').value = socio.email || '';
            document.getElementById('editarPlan').value = socio.plan;
            document.getElementById('editarEstado').value = socio.estado;

            const modal = new bootstrap.Modal(document.getElementById('modalEditarSocio'));
            modal.show();
        }
    };

    const formEditar = document.getElementById('formEditarSocio');
    if (formEditar) {
        formEditar.addEventListener('submit', function(e) {
            e.preventDefault();

            let sociosDB = JSON.parse(localStorage.getItem('sociosDB')) || [];
            const index = sociosDB.findIndex(s => s.dni === socioEnEdicionDni);

            if (index !== -1) {
                sociosDB[index].nombres = document.getElementById('editarNombres').value;
                sociosDB[index].apellidos = document.getElementById('editarApellidos').value;
                sociosDB[index].email = document.getElementById('editarCorreo').value;
                sociosDB[index].plan = document.getElementById('editarPlan').value;
                sociosDB[index].estado = document.getElementById('editarEstado').value;

                localStorage.setItem('sociosDB', JSON.stringify(sociosDB));
                
                // Actualizar la variable mock para futuras búsquedas
                sociosMock = sociosDB;

                const modalElement = document.getElementById('modalEditarSocio');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }

                renderizarTabla(sociosDB);
            }
        });
    }
});
