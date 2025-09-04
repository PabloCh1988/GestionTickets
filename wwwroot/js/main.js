// function cargarVista(view) {
//     fetch(`../views/${view}.html`)
//         .then(res => res.text())
//         .then(html => {
//             const app = document.getElementById('app');
//             app.innerHTML = html;
//             if (view === 'categoria') {
//                 ObtenerCategorias();
//             } else if (view === 'ticket') {
//                 ObtenerTickets();
//             } else if (view === 'cliente') {
//                 ObtenerClientes();
//             } else if (view === 'puestolaboral') {
//                 ObtenerPuestos();
//             } else if (view === 'desarrollador') {
//                 ObtenerDesarrolladores();
//                 inicializarEventosDesarrollador();
//             }

//             // Ejecutar scripts de la vista si los hay
//             const tempDiv = document.createElement('div');
//             tempDiv.innerHTML = html;
//             const scripts = tempDiv.querySelectorAll('script');

//             scripts.forEach(script => {
//                 const nuevoScript = document.createElement('script');
//                 if (script.src) {
//                     nuevoScript.src = script.src;
//                 } else {
//                     nuevoScript.textContent = script.textContent;
//                 }
//                 document.body.appendChild(nuevoScript);
//             });
//         });
// }
function cargarVista(view) {
    fetch(`../views/${view}.html`)
        .then(res => res.text())
        .then(html => {
            const app = document.getElementById('app');
            app.innerHTML = html;

            // Inyectar scripts embebidos si hay
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const scripts = tempDiv.querySelectorAll('script');

            let scriptsPendientes = scripts.length;
            if (scriptsPendientes === 0) {
                ejecutarInicializacion(view);
            }

            scripts.forEach(script => {
                const nuevoScript = document.createElement('script');
                if (script.src) {
                    nuevoScript.src = script.src;
                    nuevoScript.onload = () => {
                        scriptsPendientes--;
                        if (scriptsPendientes === 0) {
                            ejecutarInicializacion(view);
                        }
                    };
                } else {
                    nuevoScript.textContent = script.textContent;
                    scriptsPendientes--;
                }
                document.body.appendChild(nuevoScript);

                // Si es inline, ya podemos verificar si todos cargaron
                if (scriptsPendientes === 0) {
                    ejecutarInicializacion(view);
                }
            });
        });
}

function ejecutarInicializacion(view) {
    switch (view) {
        case 'categoria':
            if (typeof ObtenerCategorias === "function") {
                ObtenerCategorias();
            }
            break;
        case 'ticket':
            if (typeof ObtenerTickets === "function") {
                ObtenerTickets();
            }
            break;
        case 'cliente':
            if (typeof ObtenerClientes === "function") {
                ObtenerClientes();
            }
            break;
        case 'puestolaboral':
            if (typeof ObtenerPuestos === "function") {
                ObtenerPuestos();
            }
            break;
        case 'desarrollador':
            if (typeof ObtenerDesarrolladores === "function") {
                ObtenerDesarrolladores();
                inicializarEventosDesarrollador();
            }
            break;
        case 'ticketsPorClientes':
            if (typeof ObtenerClientesDropdown === "function") {
                ObtenerClientesDropdown();
            }
            break;
        case 'graficosTickets':
            if (typeof armarGrafico === "function") {
                armarGrafico();
            }
            break;
        case 'clienteTickets':
            if (typeof getTickets === "function") {
                getTickets();
            }
            break;
    }
}


function cargarVistaPorHash() {
    let vista = window.location.hash.replace('#', '') || 'home';
    cargarVista(vista);
    actualizarLinkActivo();
}

function navigateTo(vista) {
    window.location.hash = vista;
}

function actualizarLinkActivo() {
    const vistaActual = window.location.hash.replace('#', '') || 'home';

    const todosItemsNav = document.querySelectorAll('.nav-item');
    todosItemsNav.forEach(item => item.classList.remove('active'));

    const todosLinks = document.querySelectorAll('a[href^="#"]');
    todosLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        if (href === vistaActual) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
// Escuchar cambios en la URL con hash
window.addEventListener('hashchange', cargarVistaPorHash);

window.addEventListener('load', actualizarLinkActivo);

// Cargar vista inicial
window.addEventListener('DOMContentLoaded', () => {
    actualizarLinkActivo();
    cargarVistaPorHash();
    // verificarUsuario();
});
