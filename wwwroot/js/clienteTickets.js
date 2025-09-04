//HACER PRIMERO EL METODO PARA ARMAR EL COMBO DESPLEGABLE DE CATEGORIAS
async function comboCategorias() {

    const res = await authFetch("categorias");

    const categorias = await res.json();

    const comboSelectBuscar = document.querySelector("#CategoriaIdBuscar");
    comboSelectBuscar.innerHTML = "";


    let opcionesBuscar = `<option value="0">[Todas las categorias]</option>`;
    categorias.forEach(cat => {

        opcionesBuscar += `<option value="${cat.categoriaId}">${cat.descripcion}</option>`;
    });

    comboSelectBuscar.innerHTML = opcionesBuscar;

    getTickets();
}

const inputPrioridadId = document.getElementById("PrioridadIdBuscar");
inputPrioridadId.onchange = function () {
    getTickets();
};

const inputEstadoId = document.getElementById("EstadoIdBuscar");
inputEstadoId.onchange = function () {
    getTickets();
};

const inputFechaDesdeId = document.getElementById("FechaInicioBuscar");
inputFechaDesdeId.onchange = function () {
    getTickets();
};

const inputFechaHastaId = document.getElementById("FechaFinBuscar");
inputFechaHastaId.onchange = function () {
    getTickets();
};

const inputCategoriaId = document.getElementById("CategoriaIdBuscar");
inputCategoriaId.onchange = function () {
    getTickets();
};


function obtenerClasePrioridad(prioridad) {
    switch (prioridad) {
        case "Alta":
            return "badge badge-outline-danger";
        case "Media":
            return "badge badge-outline-warning";
        case "Baja":
            return "badge badge-outline-success";
        default:
            return "badge badge-outline-secondary"; // por si viene nulo o desconocido
    }
}


async function getTickets() {
    let fechaDesde = document.getElementById("FechaInicioBuscar").value;
    let fechaHasta = document.getElementById("FechaFinBuscar").value;

    const fecha1 = new Date(fechaDesde);
    const fecha2 = new Date(fechaHasta);

    if (fecha1 > fecha2) {
        fechaHasta = fechaDesde;
        document.getElementById("FechaFinBuscar").value = fechaDesde;
    }

    const filtros = {
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        categoriaID: document.getElementById("CategoriaIdBuscar").value,
        prioridad: document.getElementById("PrioridadIdBuscar").value,
        estado: document.getElementById("EstadoIdBuscar").value
    };

    const res = await authFetch(`tickets/ticketsporcategoria`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filtros)
    });


    const categorias = await res.json();
    const tbody = document.querySelector("#tablaTickets tbody");
    tbody.innerHTML = "";

    categorias.forEach(categoria => {

        const rowCategoria = document.createElement("tr");
        rowCategoria.innerHTML = `          
            <td class='text-bold text-light table-primary' colspan='4'>${categoria.nombre}</td>          
        `;
        tbody.appendChild(rowCategoria);


        categoria.tickets.forEach(item => {
            const clasePrioridad = obtenerClasePrioridad(item.prioridadString);
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.titulo || ''}</td>
                <td>${item.estadoString || ''}</td>
                <td><span class="${clasePrioridad}">${item.prioridadString || ''}</td>
                <td>${item.fechaCreacionString || ''}</td>
            `;
            tbody.appendChild(fila);
        });

    });
}


comboCategorias();