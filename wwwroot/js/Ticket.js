function CargarHtmlTickets(){
    fetch("ticket.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("contenido").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el archivo", error))
}


const API_URLTicket = "https://localhost:7065/api/tickets"

function ObtenerTickets(){
    fetch(API_URLTicket)
    .then(response => response.json())
    .then(data => MostrarTickets(data))
    .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
}

function MostrarTickets(data){
    $.each(data, function(index, item) {
        $("#todosLosTickets").append(
            "<tr>",
                "<td>" + item.ticketId + "</td>",
                "<td>" + item.titulo + "</td>",
                "<td>" + item.descripcion + "</td>",
                "<td>" + item.estado + "</td>",
                "<td>" + item.prioridad + "</td>",
                "<td>" + item.fechaCreacion + "</td>",
                "<td>" + item.fechaCierre + "</td>",
                "<td>" + item.usuarioClienteId + "</td>",
                "<td>" + item.categoriaId + "</td>",
                "<td><button class='btn btn-primary' onclick='BuscarTicketId(" + item.ticketId + ")'>Editar</button></td>",
                "<td><button class='btn btn-danger' onclick='EliminarTicket(" + item.ticketId + ")'>Eliminar</button></td>",
            "</tr>"
        );
    });
}

function CrearTicket(){
    let crearTicket = {
        titulo: document.getElementById("Titulo").value,
        descripcion: document.getElementById("Descripcion").value,
        prioridad: document.getElementById("Prioridad").value,
        categoriaId: null,
        categoria: document.getElementById("CategoriaId").value,
    }

    fetch(API_URLTicket, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(crearTicket)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status == undefined || data.status == 204)
        {
            document.getElementById("Titulo").value = "";
            document.getElementById("Descripcion").value = "";
            $('#modalCrearTickets').modal('hide');
            ObtenerTickets();
        }
        else
        {
            mensajesError('#errorCrear', data);
        }
    })
    .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
}