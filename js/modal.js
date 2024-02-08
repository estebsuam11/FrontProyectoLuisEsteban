// Función para abrir el modal
function AbrirModal() {
    const modal = document.getElementById('modalCargarDatos');
    if (modal) {
        modal.classList.add('modal--show');
    }
}

function AbrirModalGestionBd() {
    const modal = document.getElementById('modalGestionBd');
    if (modal) {
        modal.classList.add('modal--show');
    }
}

// Función para cerrar el modal
function CerrarModalGestionBd() {
    const modal = document.getElementById('modalGestionBd');
    if (modal) {
        modal.classList.remove('modal--show');
    }
}

// Función para cerrar el modal
function CerrarModal() {
    const modal = document.getElementById('modalCargarDatos');
    if (modal) {
        modal.classList.remove('modal--show');
    }
}