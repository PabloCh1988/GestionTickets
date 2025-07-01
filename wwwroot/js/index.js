document.addEventListener("DOMContentLoaded", function () {
    const signUpButton = document.getElementById('signUp'); // Obtener el botón de registro
    const signInButton = document.getElementById('signIn'); // Obtener el botón de inicio de sesión
    const container = document.getElementById('container'); // Obtener el contenedor principal

    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });
        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    // Este script se ejecuta cuando el DOM está completamente cargado y se encarga de mostrar el nombre del usuario registrado en la página.
    // Se utiliza para personalizar la experiencia del usuario mostrando su nombre en la interfaz.
    document.addEventListener("DOMContentLoaded", () => {
        //   const token = localStorage.getItem("token");
        const nombreUsuario = localStorage.getItem("regNombre");
        //   const usuarioEmail = localStorage.getItem("regEmail");
        if (nombreUsuario) {
            document.getElementById("regNombre").textContent = nombreUsuario;
        }
    });
    // Este script maneja el registro, inicio de sesión y cierre de sesión de usuarios en una aplicación web.
    const apiBase = "https://localhost:7065/api/auth"; //MEDIO DE CONEXION A LA API

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => { // Agregar el evento de envío al formulario de registro
            e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario, es decir, que se recargue la pagina
            // Obtener los valores de los campos del formulario
            const data = {
                nombreCompleto: document.getElementById("regNombre").value, // Obtener el nombre completo
                email: document.getElementById("regEmail").value, // Obtener el email
                password: document.getElementById("regPassword").value // Obtener la contraseña
            };

            const response = await fetch(`${apiBase}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }); // Enviar la solicitud POST a la API

            const result = await response.text(); // Obtener la respuesta de la API
            // Mostrar mensaje de éxito o error
            Swal.fire({
                title: 'Respuesta del servidor',
                text: result,
                icon: 'info',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: 'Aceptar'
            });
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => { // Agregar el evento de envío al formulario de inicio de sesión
            e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
            // Obtener los valores de los campos del formulario
            const data = {
                email: document.getElementById("loginEmail").value,
                password: document.getElementById("loginPassword").value
            };

            const response = await fetch(`${apiBase}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }); // Enviar la solicitud POST a la API

            if (response.ok) {
                const result = await response.json(); // Obtener la respuesta de la API   
                localStorage.setItem("NombreCompleto", result.nombreCompleto);

                document.getElementById("regNombre").textContent = localStorage.getItem("NombreCompleto") || "Usuario";


                localStorage.setItem("token", result.token); // Guardar el token en el almacenamiento local
                // Mensaje de éxito para el usuario logueado
                Swal.fire({
                    title: 'Usuario logueado',
                    text: 'Bienvenido ' + data.email,
                    icon: 'success',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonColor: '#8f5fe8',
                    confirmButtonText: 'Aceptar'
                })
                    .then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "index.html"; // Redirigir a la página principal luego de Aceptar
                        }
                    });

            } else {
                Swal.fire({
                    title: "Login Fallido",
                    text: "Por favor verifique su usuario y contraseña.",
                    icon: 'error',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonColor: '#8f5fe8',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    }
});
// Función para cerrar sesión
// Esta función se encarga de cerrar la sesión del usuario y redirigirlo a la página de inicio de sesión
window.cerrarSesion = async function cerrarSesion() {
    const getToken = () => localStorage.getItem("token");

    const token = getToken();
    const email = localStorage.getItem("email");
    // Verificar si el token y el email existen
    if (!token || !email) {
        localStorage.removeItem("token");// Eliminar el token del almacenamiento local
        localStorage.removeItem("email");// Eliminar el email del almacenamiento local
        window.location.href = "login.html";// Redirigir a la página de inicio de sesión
        return;
    }
    // Realizar la solicitud de cierre de sesión a la API
    try {
        const res = await fetch("https://localhost:7065/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        // Verificar la respuesta de la API
        if (res.ok) {
            Swal.fire({ // Mostrar mensaje de éxito
                title: "Sesión cerrada",
                text: "Has cerrado sesión correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                window.location.href = "login.html";
            });
        } else {
            const errorText = await res.text();
            Swal.fire({
                title: "Error",
                text: `Error al cerrar sesión: ${errorText}`,
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        console.error("Error en logout:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al intentar cerrar sesión.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

