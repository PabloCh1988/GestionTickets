const Base_API_URL = "https://localhost:7065/api/";


function getToken() {
    return localStorage.getItem("token");
}

function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

function getEmail() {
    return localStorage.getItem("email");
}

function saveTokens(token, refreshToken) {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
}

function refreshToken() {
    return fetch(Base_API_URL + "auth/refresh-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: getEmail(),
            refreshToken: getRefreshToken()
        })
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Error al refrescar el token");
            }
            return response.json();
        })
        .then(function (data) {
            saveTokens(data.token, data.refreshToken);
            return data.token;
        });
}

function authFetch(url, options, retry) {
    retry = typeof retry === 'undefined' ? true : retry; // Por defecto, reintentar si el token ha expirado
    options = options || {}; // Asegurarse de que options esté definido
    options.headers = options.headers || {}; // Asegurarse de que headers esté definido
    options.headers["Authorization"] = "Bearer " + getToken(); // Agregar el token al encabezado de autorización
    options.headers["Content-Type"] = "application/json"; // Asegurar el tipo de contenido

    return fetch(Base_API_URL + url, options).then(function (response) {
        if (response.status === 401 && retry) {
            // Si el token ha expirado, intentar refrescarlo
            return refreshToken().then(function (newToken) {
                // Reintentar la solicitud con el nuevo token
                options.headers["Authorization"] = "Bearer " + newToken;
                return fetch(Base_API_URL + url, options);
            }).catch(function (error) {
                console.error("Error al refrescar el token:", error);
                return response;
            });
        }
        return response; // Esto asegura que siempre se retorna la respuesta
    });
}

