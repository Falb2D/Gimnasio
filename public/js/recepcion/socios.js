document.addEventListener('DOMContentLoaded', () => {

    // 1. Mock Data (6 usuarios de prueba)
    const sociosMock = [
        { dni: '76543210', nombres: 'Carlos', apellidos: 'Mendoza Rojas', estado: 'Activo', plan: 'Mensual Ilimitado', vencimiento: '15/06/2026' },
        { dni: '43210987', nombres: 'Ana María', apellidos: 'Torres', estado: 'Moroso', plan: 'Trimestral VIP', vencimiento: '01/05/2026' },
        { dni: '12345678', nombres: 'Roberto', apellidos: 'Salas Pinto', estado: 'Inactivo', plan: 'Mensual Básico', vencimiento: '--/--/----' },
        { dni: '87654321', nombres: 'Lucía', apellidos: 'Gómez', estado: 'Activo', plan: 'Anual Premium', vencimiento: '10/12/2026' },
        { dni: '11223344', nombres: 'Luis', apellidos: 'Perez', estado: 'Activo', plan: 'Trimestral VIP', vencimiento: '12/08/2026' },
        { dni: '99887766', nombres: 'Marta', apellidos: 'Gomez', estado: 'Inactivo', plan: 'Ninguno', vencimiento: '--/--/----' }
    ];

    // Reinicio forzado para solucionar el error de estructura y tener 6 usuarios base
    localStorage.setItem('sociosDB', JSON.stringify(sociosMock));

    const tablaSociosBody = document.getElementById('tablaSociosBody');
    const inputBuscarSocio = document.getElementById('inputBuscarSocio');
    const textoContadorSocios = document.getElementById('textoContadorSocios');
    const formRegistroSocio = document.getElementById('formRegistroSocio');

    // 2. Renderizar Tabla
    const renderizarTabla = (socios) => {
        if (!tablaSociosBody) return;
        
        tablaSociosBody.innerHTML = '';
        
        socios.forEach(socio => {
            // Iniciales
            const inicialNombre = socio.nombres.charAt(0).toUpperCase();
            const inicialApellido = socio.apellidos.charAt(0).toUpperCase();
            const iniciales = `${inicialNombre}${inicialApellido}`;
            
            // Estado y Badges
            let badgeClase = '';
            let vencimientoClase = 'text-muted';
            
            if (socio.estado === 'Activo') {
                badgeClase = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
            } else if (socio.estado === 'Moroso') {
                badgeClase = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                vencimientoClase = 'text-danger fw-medium';
            } else {
                badgeClase = 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-medium text-gray-800">${socio.dni}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style="width: 36px; height: 36px; font-size: 0.9rem;">
                            ${iniciales}
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${socio.nombres} ${socio.apellidos}</span>
                        </div>
                    </div>
                </td>
                <td class="text-muted">${socio.plan}</td>
                <td class="${vencimientoClase}">${socio.vencimiento}</td>
                <td class="text-center">
                    <span class="badge ${badgeClase} px-2 py-1 rounded-pill">${socio.estado}</span>
                </td>
                <td class="pe-4 text-center">
                    <button type="button" class="btn btn-sm btn-light text-primary border rounded me-1 btn-accion" data-accion="Ver perfil" title="Ver Perfil"><i class="fa-regular fa-id-badge"></i></button>
                    <button type="button" class="btn btn-sm btn-light text-success border rounded me-1 btn-accion" data-accion="Renovar plan" title="Renovar Plan"><i class="fa-solid fa-arrows-rotate"></i></button>
                    <button type="button" class="btn btn-sm btn-light text-dark border rounded me-1 btn-accion" data-accion="Generar QR" title="Generar código QR"><i class="fa-solid fa-qrcode"></i></button>
                    <button type="button" class="btn btn-sm btn-light text-danger border rounded" onclick="cancelarPlan('${socio.dni}')" title="Cancelar Plan"><i class="fa-solid fa-ban"></i></button>
                </td>
            `;
            tablaSociosBody.appendChild(tr);
        });

        // Eventos para botones de acción
        const botonesAccion = tablaSociosBody.querySelectorAll('.btn-accion');
        botonesAccion.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accion = e.currentTarget.getAttribute('data-accion');
                alert(accion);
            });
        });
    };

    // 3. Contador Total
    const actualizarContador = (cantidad) => {
        if (textoContadorSocios) {
            textoContadorSocios.innerHTML = `<i class="fa-solid fa-users me-1"></i> Total registrados: ${cantidad} socios`;
        }
    };

    // 4. Buscador
    if (inputBuscarSocio) {
        inputBuscarSocio.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const db = JSON.parse(localStorage.getItem('sociosDB')) || [];
            const sociosFiltrados = db.filter(socio => 
                socio.dni.includes(term) || 
                socio.nombres.toLowerCase().includes(term) ||
                socio.apellidos.toLowerCase().includes(term)
            );
            renderizarTabla(sociosFiltrados);
            actualizarContador(sociosFiltrados.length);
        });
    }

    // 5. Registrar Nuevo Socio
    if (formRegistroSocio) {
        formRegistroSocio.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar datos
            const nombres = document.getElementById('nombresSocio').value.trim();
            const apellidos = document.getElementById('apellidosSocio').value.trim();
            const dni = document.getElementById('dniSocio').value.trim();
            const telefono = document.getElementById('telefonoSocio').value.trim();
            const correo = document.getElementById('correoSocio').value.trim();
            const fecha = document.getElementById('fechaNacimiento').value;

            // Crear nuevo objeto
            const nuevoSocio = {
                dni: dni,
                nombres: nombres,
                apellidos: apellidos,
                plan: 'Ninguno',
                vencimiento: '--/--/----',
                estado: 'Inactivo'
            };

            // Leer db
            let db = JSON.parse(localStorage.getItem('sociosDB')) || [];
            // Agregar al inicio
            db.unshift(nuevoSocio);
            // Guardar
            localStorage.setItem('sociosDB', JSON.stringify(db));

            // Actualizar UI
            renderizarTabla(db);
            actualizarContador(db.length);

            // Cerrar modal
            const modalEl = document.getElementById('modalNuevoSocio');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Limpiar formulario y mostrar alerta
            formRegistroSocio.reset();
            alert('Socio registrado exitosamente');
        });
    }

    // Inicialización
    const sociosIniciales = JSON.parse(localStorage.getItem('sociosDB')) || [];
    renderizarTabla(sociosIniciales);
    actualizarContador(sociosIniciales.length);

    // 6. Función Global para Cancelar Plan
    window.cancelarPlan = (dni) => {
        if (confirm('¿Estás seguro de que deseas cancelar el plan actual de este socio? Pasará a estado Inactivo.')) {
            // Leer base de datos
            let db = JSON.parse(localStorage.getItem('sociosDB')) || [];
            
            // Buscar socio
            const index = db.findIndex(s => s.dni === dni);
            if (index !== -1) {
                // Actualizar propiedades
                db[index].estado = 'Inactivo';
                db[index].plan = 'Ninguno';
                db[index].vencimiento = '--/--/----';
                
                // Guardar cambios
                localStorage.setItem('sociosDB', JSON.stringify(db));
                
                // Re-renderizar UI
                renderizarTabla(db);
                actualizarContador(db.length);
                
                // Limpiar buscador si tenía texto para no confundir
                if (inputBuscarSocio) inputBuscarSocio.value = '';
            }
        }
    };
});
