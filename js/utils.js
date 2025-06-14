// utils.js
function showMessage(message, isSuccess) {
    const alerta = document.getElementById('alerta');
    const mensaje = document.getElementById('alerta-mensaje');
    const cerrarBtn = document.getElementById('cerrar-alerta');

    mensaje.textContent = message;
    alerta.classList.remove('oculto', 'success');
    alerta.classList.toggle('success', isSuccess);
    alerta.style.display = 'flex';

    cerrarBtn.onclick = () => {
        alerta.style.display = 'none';
    };

    setTimeout(() => {
        alerta.style.display = 'none';
    }, 6000);
}
