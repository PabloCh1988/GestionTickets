const inputFechaDesdeId = document.getElementById("FechaInicioBuscarC");
inputFechaDesdeId.onchange = function () {
    ObtenerTicketsPorClientes();
};

const inputFechaHastaId = document.getElementById("FechaFinBuscarC");
inputFechaHastaId.onchange = function () {
    ObtenerTicketsPorClientes();
};


async function ObtenerClientesDropdown() {
    await authFetch('clientess', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => DropdownClientes(data))
        .catch(error => console.log("No se pudo acceder al servicio", error))
}


async function DropdownClientes(data) {
    let bodySelect = document.getElementById("clientesDropdown");
    bodySelect.innerHTML = "";

    optFiltro = document.createElement("option");
    optFiltro.value = '';
    optFiltro.text = "[Seleccione un cliente]"

    bodySelect.add(optFiltro);

    data.forEach(element => {
        optFiltro = document.createElement("option");
        optFiltro.value = element.clienteId;
        optFiltro.text = element.nombre

        bodySelect.add(optFiltro);
    })
    // Asegurarse de que el listener se agregue después de poblar el select
    bodySelect.addEventListener("change", ObtenerTicketsPorClientes);
}


document.addEventListener("DOMContentLoaded", () => {
    const inputCliente = document.getElementById("clientesDropdown");
    if (inputCliente) {
        inputCliente.addEventListener("change", ObtenerTicketsPorClientes);
    } else {
        console.warn("Elemento 'clientesDropdown' no encontrado en el DOM.");
    }

    ObtenerClientesDropdown();
});

// Función para obtener y mostrar los tickets según los filtros seleccionados.
// async function ObtenerTicketsPorClientes() {
//     let clienteId = parseInt(document.getElementById("clientesDropdown").value);
//     let fechaDesde = document.getElementById("FechaInicioBuscarC").value;
//     let fechaHasta = document.getElementById("FechaFinBuscarC").value;
//     if (fechaDesde) filtro.FechaInicio = fechaDesde;
//     if (fechaHasta) filtro.FechaFin = fechaHasta;

//     const filtro = {
//         FechaInicio: fechaDesde,
//         FechaFin: fechaHasta,
//         ClienteId: clienteId
//     };
//     console.log(filtro)

//     await authFetch("tickets/buscar", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" }, // <--- IMPORTANTE
//         body: JSON.stringify(filtro)
//     })
//         .then(response => response.json())
//         .then(data => MostrarTicketsPorClientes(data))
//         .catch(error => Swal.fire({
//             title: "Error",
//             text: "No se pudieron obtener los clientes.",
//             icon: "error",
//             background: '#000000',
//             color: '#f1f1f1',
//             confirmButtonText: "Aceptar"
//         }));
// }

async function ObtenerTicketsPorClientes() {
    let clienteId = parseInt(document.getElementById("clientesDropdown").value);
    let fechaDesde = document.getElementById("FechaInicioBuscarC").value;
    let fechaHasta = document.getElementById("FechaFinBuscarC").value;

    // Declaramos el objeto filtro al inicio
    const filtro = {
        FechaInicio: fechaDesde || null,
        FechaFin: fechaHasta || null,
        ClienteId: clienteId || null
    };

    console.log(filtro);

    await authFetch("tickets/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filtro }) // si el backend espera { filtro: {...} }
        // body: JSON.stringify(filtro)   // si espera solo {...}
    })
        .then(response => response.json())
        .then(data => MostrarTicketsPorClientes(data))
        .catch(error =>
            Swal.fire({
                title: "Error",
                text: "No se pudieron obtener los clientes.",
                icon: "error",
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: "Aceptar"
            })
        );
}


function MostrarTicketsPorClientes(data) {
    const tabla = document.getElementById("todosLosClientesFiltro"); // <tbody> o <table>
    if (!tabla) {
        console.warn("No existe #todosLosClientesFiltro en el DOM");
        return;
    }

    tabla.innerHTML = ""; // limpiamos

    data.forEach(item => {
        const fila = document.createElement("tr");
        let prioridad = item.prioridadString;
        let clase = '';

        switch (prioridad) {
            case 'Alta':
                clase = 'badge badge-outline-danger';
                break;
            case "Media":
                clase = "badge badge-outline-warning";
                break;
            case "Baja":
                clase = "badge badge-outline-success";
                break;
            default:
                clase = "badge badge-outline-secondary"; // por si viene nulo o desconocido
                break;
        };
        fila.innerHTML = `
                <td>${item.titulo || ''}</td>
                <td>${item.estadoString || ''}</td>
                <td><span class="${clase}">${item.prioridadString || ''}</td>
                <td>${item.fechaCreacionString || ''}</td>
                <td>${item.categoriaString || ''}</td>
            `;
        tabla.appendChild(fila);
    })
}

$(document).on("change", "#clientesDropdown", ObtenerTicketsPorClientes);

ObtenerClientesDropdown();