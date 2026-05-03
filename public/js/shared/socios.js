document.addEventListener('DOMContentLoaded', function() {
    // Basic search functionality for Socios
    const buscadorSocios = document.getElementById('buscadorSocios');
    const tablaSocios = document.getElementById('tablaSocios');

    if (buscadorSocios && tablaSocios) {
        buscadorSocios.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase();
            const filas = tablaSocios.getElementsByTagName('tr');

            Array.from(filas).forEach(fila => {
                const dni = fila.cells[0].textContent.toLowerCase();
                const nombre = fila.cells[1].textContent.toLowerCase();
                
                if (dni.includes(termino) || nombre.includes(termino)) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }

    // Handle form submission inside Modal
    const formRegistroSocio = document.getElementById('formRegistroSocio');
    if (formRegistroSocio) {
        formRegistroSocio.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real application, this would send data to the backend via AJAX/fetch
            
            // Get form values
            const nombres = document.getElementById('nombresSocio').value;
            const apellidos = document.getElementById('apellidosSocio').value;
            
            // Show alert or toast
            alert(`Socio registrado exitosamente: ${nombres} ${apellidos}`);
            
            // Hide modal using Bootstrap API
            const modalEl = document.getElementById('modalNuevoSocio');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            // Reset form
            formRegistroSocio.reset();
        });
    }
});
