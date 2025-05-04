const signUpButton = document.getElementById('signUp'); 
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container'); //

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


const apiBase = "https://localhost:7065/api/auth"; //MEDIO DE CONEXION A LA API

document.getElementById("registerForm").addEventListener("submit", async (e) => { // Agregar el evento de envío al formulario de registro
    e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
    // Obtener los valores de los campos del formulario
    const data = {
        nombreCompleto: document.getElementById("regNombre").value,
        email: document.getElementById("regEmail").value,
        password: document.getElementById("regPassword").value
    };

    const response = await fetch(`${apiBase}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }); // Enviar la solicitud POST a la API

    const result = await response.text(); // Obtener la respuesta de la API
    alert(result);
});

document.getElementById("loginForm").addEventListener("submit", async (e) => { // Agregar el evento de envío al formulario de inicio de sesión
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
        // document.getElementById("tokenOutput").textContent = result.token;
        localStorage.setItem("token", result.token); // Guardar el token en el almacenamiento local
        window.location.href = "main.html"; // Redirigir a la página principal
    } else {
        alert("Login fallido");
    }
});

 //FUNCION DE LEER TOKEN DEL DISPOSITIVO
 const getToken = () => localStorage.getItem("token");

 async function cerrarSesion() {
     const token = getToken();//
     const email = localStorage.getItem("email"); // suponiendo que guardaste el email al hacer login

     if (!token || !email) { //
         localStorage.removeItem("token");
         localStorage.removeItem("email");
         window.location.href = "index.html";
         return;
     }

     try {
         const res = await fetch("https://localhost:7065/api/auth/logout", {
             method: "POST",
             headers: {
                 "Content-Type": "application/json",
                 "Authorization": `Bearer ${token}`
             },
             body: JSON.stringify({ email })
         });

         if (res.ok) {
             alert("Sesión cerrada correctamente");
         } else {
             alert("Error al cerrar sesión: " + await res.text());
         }
     } catch (error) {
         console.error("Error en logout:", error);
     }

     // Limpiar token y redirigir
     localStorage.removeItem("token");
     localStorage.removeItem("email");
     window.location.href = "index.html";
 }