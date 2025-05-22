function CargarHtmlTickets() {
    fetch("ticket.html")
        .then(response => response.text())
        .then(data => { // Obtener el contenido del archivo HTML
            // Cargar el contenido del archivo HTML en el elemento con id "contenido"
            document.getElementById("contenido").innerHTML = data;
            $("#modalCrearTickets").modal('hide'); // Cierra el modal si está abierto
            ObtenerTickets(); // Llama a la función para obtener los tickets
        })
        .catch(error => console.error("Error al cargar el archivo", error))
}

const API_URLTicket = "https://localhost:7065/api/tickets";

const API_URLHistorial = "https://localhost:7065/api/historialtickets";

async function ObtenerTickets() {
    const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación

    const res = await fetch(API_URLTicket, { headers: authHeaders() });
    const tickets = await res.json();
    MostrarTickets(tickets); // Usar la función para mostrar los tickets
}


function AbrirModalCrearTicket() {
    ObtenerCategoriasDropdown(); // Carga las categorías en el dropdown
    $('#modalCrearTickets').modal('show'); // Muestra el modal
}

function MostrarTickets(data) {
    $("#todosLosTickets").empty(); // Limpiar la tabla antes de llenarla
    $.each(data, function (index, item) {
        $("#todosLosTickets").append(
            "<tr>" +
            "<td>" + item.titulo + "</td>" +
            "<td>" + item.descripcion + "</td>" +
            "<td>" + item.estado + "</td>" +
            "<td>" + item.prioridad + "</td>" +
            "<td>" + formatearFecha(item.fechaCreacion) + "</td>" +
            // "<td>" + formatearFecha(item.fechaCierre) + "</td>" +
            // "<td>" + item.usuarioClienteId + "</td>" +
            "<td>" + (item.categoria?.descripcion || '') + "</td>" +
            "<td><button class='btn btn-inverse-success  mdi mdi-border-color' onclick='BuscarTicketId(" + item.ticketId + ")'></button></td>" +
            "<td><button class='btn btn-inverse-danger   mdi mdi-close' onclick='EliminarTicket(" + item.ticketId + ")'></button></td>" +
            "<td><button class='btn btn-inverse-warning   mdi mdi-magnify' onclick='MostrarHistorial(" + item.ticketId + ")'></button></td>" +
            "</tr>"
        );
    });
}
function formatearFecha(fecha) {
    if (!fecha) return "";
    // Convierte la fecha a objeto Date
    const d = new Date(fecha);
    // Si la fecha no es válida, retorna el string original
    if (isNaN(d.getTime())) return fecha;
    // Formato: dd/mm/yyyy hh:mm
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
}

function VaciarModalTicket() {
    $("#Titulo").val("");
    $("#Descripcion").val("");
    $("#CategoriaId").val("");
    $('#errorCrearTicket').empty(); // Limpiar mensajes de error
    $('#errorCrear').empty(); // Limpiar mensajes de error
    $('#errorEditar').empty(); // Limpiar mensajes de error
    $('#modalCrearTickets').modal('hide'); // Cerrar el modal
    $('#modalEditarTickets').modal('hide'); // Cerrar el modal de edición
}


async function CrearTicket() {
    const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación

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

    // Enviar la solicitud a la API
    const response = await fetch(API_URLTicket, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(crearTicket)
    });

    if (response.ok) {
        console.log(ObtenerTickets(), "Ticket creado exitosamente.");
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
        const errorText = await response.text(); // Manejar errores
        console.log(errorText);
        mensajesError('#errorCrear', null, `Error al crear: ${errorText}`); // Si hay errores del servidor, mostrar mensajes de error

        console.error("Error al crear el ticket:", errorText);
    }
}

function BuscarTicketId(ticketId) {
    const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación

    fetch(`${API_URLTicket}/${ticketId}`, {
        method: "GET",
        headers: authHeaders()
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
    const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación

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

    try {
        const res = await fetch(`${API_URLTicket}/${ticketId}`, {
            method: "PUT",
            headers: authHeaders(),
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
        const getToken = () => localStorage.getItem("token");
    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
    }); // Configurar los headers de autenticación

    fetch(`${API_URLTicket}/${ticketId}`, {
        method: "DELETE",
        headers: authHeaders()
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

function MostrarHistorial(ticketId) {
    const getToken = () => localStorage.getItem("token");
    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
    }); // Configurar los headers de autenticación

    fetch(`${API_URLHistorial}/${ticketId}`, {
        method: "GET",
        headers: authHeaders()
    }) // Realiza la solicitud a la API
        .then(response => {
            if (!response.ok) {
                // Si la respuesta es 404 o error, mostrar Swal
                Swal.fire({
                    icon: 'info',
                    title: 'Sin historial',
                    text: 'El ticket seleccionado no tiene historial de cambios.',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonColor: '#8f5fe8',
                });
                return null;
            }
            return response.json();
        }) // Convierte la respuesta a JSON
        .then(listado => { // Maneja la respuesta
            // Si no hay historial, mostrar Swal
            if (!listado) return; // Ya se mostró el Swal
            $("#historialTickets").empty(); // Limpiar la tabla antes de llenarla
            if (Array.isArray(listado) && listado.length > 0) { // Si hay historial
                // Llenar la tabla con el historial
                $.each(listado, function (index, item) {
                    $("#historialTickets").append(
                        "<tr>" +
                        "<td>" + item.campoModificado + "</td>" +
                        "<td>" + item.valorAnterior + "</td>" +
                        "<td>" + item.valorNuevo + "</td>" +
                        "<td>" + formatearFecha(item.fechaCambio) + "</td>" +
                        "</tr>"
                    );
                });
                $("#modalHistorialTickets").modal("show"); // Muestra el modal
                // Mostrar el modal con el historial
            } else {
                // Si el array está vacío, mostrar Swal
                Swal.fire({
                    icon: 'info',
                    title: 'Sin historial',
                    text: 'El ticket seleccionado no tiene historial de cambios.',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonColor: '#8f5fe8',
                });
            }
        }) // Maneja errores de la solicitud
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el historial.',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonColor: '#8f5fe8',
            });
            console.error("Error al buscar el historial:", error);
        });
};
