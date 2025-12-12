// utils.js
function showMessage(message, isSuccess) {
    const alerta = document.getElementById('alerta');
    const mensaje = document.getElementById('alerta-mensaje');
    const cerrarBtn = document.getElementById('cerrar-alerta');

    // Icon logic based on success/error
    const icon = alerta.querySelector('i');
    if (icon) {
        icon.className = isSuccess ? 'fa-solid fa-check-circle' : 'fa-solid fa-triangle-exclamation';
    }

    mensaje.textContent = message;
    alerta.classList.remove('oculto', 'success', 'error'); // Remove both to start clean
    alerta.classList.add(isSuccess ? 'success' : 'error'); // Add specific class
    alerta.style.display = 'flex';

    cerrarBtn.onclick = () => {
        alerta.classList.add('oculto');
        setTimeout(() => { alerta.style.display = 'none'; }, 300); // Wait for transition
    };

    setTimeout(() => {
        alerta.classList.add('oculto');
        setTimeout(() => { alerta.style.display = 'none'; }, 300);
    }, 6000);
}

/**
 * Realiza una petición fetch añadiendo el token JWT de autenticación.
 * @param {string} url La URL a la que hacer la petición.
 * @param {object} options Las opciones para la petición fetch (method, headers, body, etc.).
 * @returns {Promise<Response>} La promesa devuelta por fetch.
 */
function fetchProtegido(url, options = {}) {
    const token = localStorage.getItem('jwt_token');

    // Si no hay token, no podemos hacer una petición autenticada.
    if (!token) {
        showMessage("No estás autenticado. Por favor, inicia sesión.", false);
        return Promise.reject('No hay token');
    }

    // Preparamos los encabezados
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Bearer ${token}`);

    // Unimos los nuevos encabezados con las opciones existentes
    const newOptions = {
        ...options,
        headers: headers
    };

    // Realizamos la petición fetch con las nuevas opciones
    return fetch(url, newOptions);
}

function parseJwt(token) {
    if (!token) {
        return null;
    }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el token JWT:", e);
        return null;
    }
}
