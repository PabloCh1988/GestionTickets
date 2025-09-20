// Asignar eventos onchange a los inputs de fecha
const inputFechaDesdeId = document.getElementById("FechaInicioBuscar");
inputFechaDesdeId.onchange = function () {
    getTicketsDesarrollador();
};

const inputFechaHastaId = document.getElementById("FechaFinBuscar");
inputFechaHastaId.onchange = function () {
    getTicketsDesarrollador();
};

async function getTicketsDesarrollador() {
    let fechaDesde = document.getElementById("FechaInicioBuscar").value;
    let fechaHasta = document.getElementById("FechaFinBuscar").value;

    // Normalizar formato a yyyy-MM-dd si existe valor
    fechaDesde = fechaDesde
        ? new Date(fechaDesde).toISOString().slice(0, 10)
        : "";
    fechaHasta = fechaHasta
        ? new Date(fechaHasta).toISOString().slice(0, 10)
        : "";

    // Validación: fechaDesde <= fechaHasta
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        fechaHasta = fechaDesde;
        document.getElementById("FechaFinBuscar").value = fechaDesde;
    }

    const filtros = {
        fechaInicio: fechaDesde || "",
        fechaFin: fechaHasta || "",
    };

    const res = await authFetch(`tickets/ticketspordesarrollador`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(filtros),
    });

    const desarrolladores = await res.json();
    const tbody = document.querySelector("#tablaTicketsPorDesarrollador tbody");
    tbody.innerHTML = "";

    desarrolladores.forEach((desarrollador) => {
        const rowDesarrollador = document.createElement("tr");
        rowDesarrollador.innerHTML = `
            <td colspan='4' style='text-align: center;' class='text-bold text-light table-info'>
                ${desarrollador.nombre} - ${desarrollador.email}
             </td>
        `;
        tbody.appendChild(rowDesarrollador);

        desarrollador.tickets.forEach((item) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.titulo || ""}</td>
                <td>${item.estadoString || ""}</td>
                <td>${item.fechaCreacionString || ""}</td>
                <td>${item.fechaCierreString || ""}</td>
            `;
            tbody.appendChild(fila);
        });
    });
}
getTicketsDesarrollador();