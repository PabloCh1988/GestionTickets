const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
}); // Configurar los headers de autenticación

export { getToken, authHeaders };