// public/js/storage.js

document.addEventListener('DOMContentLoaded', () => {
    // Función auxiliar para generar inscritos mock
    const generarInscritos = (cantidad) => {
        const arr = [];
        for (let i = 1; i <= cantidad; i++) {
            arr.push({
                dni: '7000' + i.toString().padStart(4, '0'),
                nombre: `Socio de Prueba ${i}`
            });
        }
        return arr;
    };

    // Verificar si ya existe clasesDB en localStorage
    if (!localStorage.getItem('clasesDB')) {
        const clasesBase = [
            {
                id: 1,
                nombre: 'Yoga Nidra',
                horario: '18:00 - 19:00 hrs',
                coach: 'Valeria S.',
                salon: 'Salón Zen',
                capacidad_max: 20,
                icono: 'fa-spa',
                bg_icono: 'bg-primary',
                text_icono: 'text-primary',
                inscritos: generarInscritos(12)
            },
            {
                id: 2,
                nombre: 'Spinning Pro',
                horario: '19:30 - 20:30 hrs',
                coach: 'Marcos T.',
                salon: 'Salón Cardio 1',
                capacidad_max: 25,
                icono: 'fa-person-biking',
                bg_icono: 'bg-danger',
                text_icono: 'text-danger',
                inscritos: generarInscritos(25)
            },
            {
                id: 3,
                nombre: 'CrossFit WOD',
                horario: '20:30 - 21:30 hrs',
                coach: 'Luis R.',
                salon: 'Box Funcional',
                capacidad_max: 20,
                icono: 'fa-dumbbell',
                bg_icono: 'bg-warning',
                text_icono: 'text-warning',
                inscritos: generarInscritos(18)
            }
        ];
        
        // Guardar array base en localStorage
        localStorage.setItem('clasesDB', JSON.stringify(clasesBase));
        console.log('Base de datos inicializada en localStorage: clasesDB');
    }
});
