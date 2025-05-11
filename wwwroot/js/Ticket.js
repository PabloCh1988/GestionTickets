function CargarHtmlTickets() {
    fetch("ticket.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("contenido").innerHTML = data;
            $("#modalCrearTickets").modal('hide'); // Cierra el modal si está abierto
            ObtenerTickets(); // Llama a la función para obtener los tickets
        })
        .catch(error => console.error("Error al cargar el archivo", error))
}

function ObtenerTickets() {
    fetch(API_URLTicket)
        .then(response => response.json())
        .then(data => MostrarTickets(data))
        .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
}


function AbrirModalCrearTicket() {
    ObtenerCategoriasDropdown(); // Carga las categorías en el dropdown
    $('#modalCrearTickets').modal('show'); // Muestra el modal
}


const API_URLTicket = "https://localhost:7065/api/tickets"

const getToken2 = () => localStorage.getItem("token"); // Obtener el token del localStorage

const authHeaders2 = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken2()}`
}); // Configurar los headers de autenticación



function MostrarTickets(data) {
    $("#todosLosTickets").empty(); // Limpiar la tabla antes de llenarla
    $.each(data, function (index, item) {
        $("#todosLosTickets").append(
            "<tr>" +
            // "<td>" + item.ticketId + "</td>" + // Eliminado: no mostrar el ID
            "<td>" + item.titulo + "</td>" +
            "<td>" + item.descripcion + "</td>" +
            "<td>" + item.estado + "</td>" +
            "<td>" + item.prioridad + "</td>" +
            "<td>" + formatearFecha(item.fechaCreacion) + "</td>" +
            "<td>" + formatearFecha(item.fechaCierre) + "</td>" +
            // "<td>" + item.usuarioClienteId + "</td>" +
            "<td>" + item.categoriaId + "</td>" +
            "<td><button class='btn btn-outline-success  mdi mdi-border-color' onclick='BuscarTicketId(" + item.ticketId + ")'></button></td>" +
            "<td><button class='btn btn-outline-danger   mdi mdi-close' onclick='EliminarTicket(" + item.ticketId + ")'></button></td>" +
            "</tr>"
        );
    });
}
function formatearFecha(fecha) {
    if (!fecha) return "";
    // Quita la 'T' y los milisegundos si existen
    return fecha.replace('T', ' ').split('.')[0];
}

function VaciarModalTicket() {
    $("#Titulo").val("");
    $("#Descripcion").val("");
    $("#Prioridad").val("");
    $("#CategoriaId").val("");
    $('#errorCrearTicket').empty(); // Limpiar mensajes de error
    $('#errorCrear').empty(); // Limpiar mensajes de error
    $('#errorEditar').empty(); // Limpiar mensajes de error
    $('#modalCrearTickets').modal('hide'); // Cerrar el modal
    $('#modalEditarTickets').modal('hide'); // Cerrar el modal de edición
}


async function CrearTicket() {
    // Obtener valores de los campos
    const titulo = document.getElementById("Titulo")?.value.trim();
    const descripcion = document.getElementById("Descripcion")?.value.trim();
    const prioridad = document.getElementById("Prioridad")?.value;
    const categoriaId = document.getElementById("CategoriaId").value;

    // Validar que todos los campos estén completos
    if (!titulo || !descripcion || !prioridad || !categoriaId) {
        mensajesError('#errorCrear', null, "Todos los campos son obligatorios.");
        return;
    }

    // Crear el objeto del ticket
    const crearTicket = {
        titulo: titulo,
        descripcion: descripcion,
        prioridad: prioridad,
        categoriaId: parseInt(categoriaId),
    };
    console.log(crearTicket);

    // Enviar la solicitud a la API
    // const response = await 
    const response = await fetch(API_URLTicket, {
        method: "POST",
        headers: authHeaders2(),
        body: JSON.stringify(crearTicket)
    });
    
    if (response.ok) {
    console.log (ObtenerTickets(), "Ticket creado exitosamente.");
        // Limpiar los campos del modal            
    $('#modalCrearTickets').modal('hide'); // Cerrar el modal
    ObtenerTickets();  // Actualizar la lista de tickets
    VaciarModalTicket(); // Limpiar el modal
    // Mostrar mensaje de éxito
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Ticket creado",
        background: '#000000',
        color: '#f1f1f1',
        showConfirmButton: false,
        timer: 1500
      });

    } else {
    const errorText = await response.json();
    mensajesError('#errorCrearTicket', null, errorText.message || "Error al crear el ticket."); // Si hay errores del servidor, mostrar mensajes de error

    console.error("Error al crear el ticket:", errorText);
    }  
}

function BuscarTicketId(ticketId) {
    fetch(`${API_URLTicket}/${ticketId}`, {
        method: "GET",
        headers: authHeaders2()
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Llenar los campos del modal con los datos del ticket
                document.getElementById("ticketId").value = data.ticketId; // Guardar el ID del ticket
                document.getElementById("TituloEditar").value = data.titulo;
                document.getElementById("DescripcionEditar").value = data.descripcion;
                document.getElementById("PrioridadEditar").value = data.prioridad;
                document.getElementById("CategoriaIdEditar").value = data.categoriaId;
                $('#modalEditarTickets').modal('show'); // Muestra el modal
                ObtenerCategoriasDropdown(); // Carga las categorías en el dropdown
            } else {
                console.error("No se encontró el ticket con ID:", id);
            }
        })
        .catch(error => console.error("Error al buscar el ticket:", error));
}

async function EditarTicket() {
    const ticketId = document.getElementById("ticketId").value; // Obtener el ID del ticket a editar
    const titulo = document.getElementById("TituloEditar").value.trim();
    const descripcion = document.getElementById("DescripcionEditar").value.trim();
    const prioridad = document.getElementById("PrioridadEditar").value;
    const categoriaId = document.getElementById("CategoriaIdEditar").value;

    if (!titulo || !descripcion || !prioridad || !categoriaId) {
        mensajesError('#errorEditar', null, "Todos los campos son obligatorios.");
        return;
    }

    const editarTicket = {
        ticketId: parseInt(ticketId),
        titulo: titulo,
        descripcion: descripcion,
        prioridad: prioridad,
        categoriaId: parseInt(categoriaId),
    };
    console.log("URL:", `${API_URLTicket}/${ticketId}`);
    console.log("Datos enviados:", editarTicket);


    try {
        const res = await fetch(`${API_URLTicket}/${ticketId}`, {
            method: "PUT",
            headers: authHeaders2(),
            body: JSON.stringify(editarTicket)
        });
        if (res.ok) {
            $('#modalEditarTickets').modal('hide'); // Cierra el modal
            ObtenerTickets(); // Actualiza la lista de tickets
            VaciarModalTicket(); // Limpia el modal
            // Mostrar mensaje de éxito
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Ticket actualizado",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
              });
        } else {
            const errorText = await res.text();
            mensajesError('#errorEditar', null, `Error al actualizar: ${errorText}`);
        };
    }
    catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error al actualizar la categoría:", error);
        mensajesError('#errorEditar', null, "Ocurrió un error al intentar actualizar la categoría.");
    }
}


function EliminarTicket(ticketId) {
    Swal.fire({
        title: "Estas seguro de eliminar este ticket?",
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        background: '#000000',
        color: '#f1f1f1',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'

      }).then((result) => {
        if (result.isConfirmed) {
            EliminarTicketSi(ticketId);
        }
      });
}

function EliminarTicketSi(ticketId) {
    fetch(`${API_URLTicket}/${ticketId}`, {
        method: "DELETE"
    })
        .then(() => {
            // Mostrar mensaje de éxito
            Swal.fire({
                title: "Eliminado!",
                text: "El ticket ha sido eliminado.",
                icon: 'success',
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
            });
            ObtenerTickets(); // Actualiza la lista de tickets
        })
        .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
}


function mensajesError(id, data, mensaje) {
    $(id).empty();
    if (data != null) {
        $.each(data.errors, function (index, item) {
            $(id).append(
                "<ol>",
                "<li>" + item + "</li>",
                "</ol>"
            )
        })
    }
    else {
        $(id).append(
            "<ol>",
            "<li>" + mensaje + "</li>",
            "</ol>"
        )
    }

    $(id).attr("hidden", false);
}