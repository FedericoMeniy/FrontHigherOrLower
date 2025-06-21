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

    // --- NUEVA FUNCIÓN ---
/**
 * Realiza una petición fetch añadiendo el token JWT de autenticación.
 * @param {string} url La URL a la que hacer la petición.
 * @param {object} options Las opciones para la petición fetch (method, headers, body, etc.).
 * @returns {Promise<Response>} La promesa devuelta por fetch.
 */
function fetchProtegido(url, options = {}) {
    const token = localStorage.getItem('jwtToken');

    // Si no hay token, no podemos hacer una petición autenticada.
    if (!token) {
        showMessage("No estás autenticado. Por favor, inicia sesión.", false);
        // Podrías redirigir al login aquí si quieres.
        // document.getElementById('login-form').style.display = 'flex';
        // document.getElementById('menu-container').style.display = 'none';
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
}

function parseJwt(token) {
    if (!token) { 
        return null; 
    }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el token JWT:", e);
        return null;
    }
}
