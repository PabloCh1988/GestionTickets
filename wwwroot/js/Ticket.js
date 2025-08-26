// evita que la función ObtenerTickets se ejecute más de una vez al mismo tiempo
let enEjecucion = false;
// Cuando la página termina de cargar el DOM, llama a comboCategorias().
document.addEventListener("DOMContentLoaded", () => {
    comboCategorias();
    cargarCategorias(); // Carga el maps de categorías para el historial
});
// Define qué filtros disparan la búsqueda de tickets.
function configurarFiltros() {
    const campos = [
        "CategoriaIdBuscar",
        "EstadoIdBuscar",
        "PrioridadIdBuscar",
        "FechaInicioBuscar",
        "FechaFinBuscar"
    ];

    campos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener("change", () => { //A cada campo le agrega un evento change, para que cuando el usuario cambie algo se recarguen los tickets filtrados.
                ObtenerTickets(); // Filtrar al cambiar
            });
        }
    });
}


async function comboCategorias() {
    const res = await authFetch("categorias"); //Llama al endpoint "categorias" para traer todas las categorías en formato JSON.
    const categorias = await res.json();
    // Busca los combos de categoría (uno para búsqueda y otro para creación/edición).
    // Si existen, primero los vacía.
    const comboSelectBuscar = document.querySelector("#CategoriaIdBuscar");
    const comboSelect = document.querySelector("#CategoriaId");
    if (comboSelectBuscar) comboSelectBuscar.innerHTML = "";
    if (comboSelect) comboSelect.innerHTML = "";
    // Prepara el HTML de las opciones: una para "todas las categorías" en el combo de búsqueda, y otra vacía para el combo de creación/edición.
    let opcionesBuscar = `<option value="0">[Todas las categorías]</option>`;
    let opciones = '';
    // Recorre las categorías obtenidas y crea las opciones para ambos combos.
    categorias.forEach(cat => {
        const id = cat.categoriaId;
        const desc = cat.descripcion;
        opciones += `<option value="${id}">${desc}</option>`;
        opcionesBuscar += `<option value="${id}">${desc}</option>`;
    });
    // Inserta las opciones en los combos si existen.
    if (comboSelect) comboSelect.innerHTML = opciones;
    if (comboSelectBuscar) comboSelectBuscar.innerHTML = opcionesBuscar;

    // Llamamos a ObtenerTickets solo después de preparar los combos
    ObtenerTickets();
    // Y ahora sí, asignamos los eventos de filtrado
    configurarFiltros();
}
// Función para obtener y mostrar los tickets según los filtros seleccionados.
async function ObtenerTickets() {
    if (enEjecucion) return; // Si ya está en ejecución, no hacer nada
    enEjecucion = true; // Marca que está en ejecución

    try {
        // Obtiene los valores de los filtros
        const catVal = document.getElementById("CategoriaIdBuscar")?.value;
        const estVal = document.getElementById("EstadoIdBuscar")?.value;
        const priVal = document.getElementById("PrioridadIdBuscar")?.value;
        let fechaDesde = document.getElementById("FechaInicioBuscar")?.value;
        let fechaHasta = document.getElementById("FechaFinBuscar")?.value;

        // Si la fecha de inicio es mayor que la de fin, fuerza a que la fecha fin sea igual a la de inicio.
        // Esto evita errores en el filtro
        if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
            fechaHasta = fechaDesde;
            const campoHasta = document.getElementById("FechaFinBuscar");// Actualiza el campo en el formulario
            if (campoHasta) campoHasta.value = fechaHasta;
        }
        // Prepara el objeto de filtros para enviar a la API
        const filtros = {
            CategoriaId: parseInt(catVal || "0"),
            Estado: parseInt(estVal || "0"),
            Prioridad: parseInt(priVal || "0"),
            FechaInicio: fechaDesde || null,
            FechaFin: fechaHasta || null
        };
        // Llama al endpoint "tickets/filtro" con los filtros en el cuerpo de la solicitud
        const res = await authFetch("tickets/filtro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filtros)
        });
        // Intenta convertir la respuesta a JSON
        let tickets;
        try {
            tickets = await res.json();
        } catch (e) {
            tickets = null;
        }
        // Si no es un array, muestra un error con Swal
        if (!Array.isArray(tickets)) {
            Swal.fire({
                title: "Error",
                text: "No se pudieron obtener los tickets. " + (tickets?.title || tickets?.message || ""),
                icon: "error",
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: "Aceptar"
            });
            if (tickets?.errors) console.error("Errores de validación:", tickets.errors);
            return;
        }
        // Limpia la tabla antes de llenarla con los tickets obtenidos
        // Si no hay tickets, la tabla quedará vacía
        const tabla = document.getElementById("todosLosTickets");
        if (!tabla) return;
        tabla.innerHTML = "";
        // Recorre los tickets y crea una fila por cada uno
        tickets.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.titulo || ''}</td>
                <td>${item.estadoString || ''}</td>
                <td>${item.prioridadString || ''}</td>
                <td>${item.fechaCreacionString || ''}</td>
                <td>${item.categoriaString || ''}</td>
                <td><button class='btn btn-inverse-primary  mdi mdi-account-card-details' title='Datos' onclick='MostrarTicketId(${item.ticketId})'></button>
                <button class='btn btn-inverse-success mdi mdi-border-color' title='Editar' onclick='BuscarTicketId(${item.ticketId})'></button>
                <button class='btn btn-inverse-warning  mdi mdi-file-find' title='Historial' onclick='MostrarHistorial(${item.ticketId})'></button></td>
            `;
            tabla.appendChild(fila);
        });

    } finally {
        enEjecucion = false; // Marca que ya no está en ejecución
    }
}


function AbrirModalCrearTicket() {
    ObtenerCategoriasDropdown(); // Carga las categorías en el dropdown
    $('#modalCrearTickets').modal('show'); // Muestra el modal
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
    $('#modalMostrarTickets').modal('hide'); // Cerrar el modal de mostrar
    $('#modalHistorialTickets').modal('hide'); // Cerrar el modal de historial
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
        categoriaId: parseInt(categoriaId),// Asegura que sea un número
    };

    // Enviar la solicitud a la API
    const response = await authFetch(`tickets`, {
        method: "POST",
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

async function comboCategoriasEditar(selectedId) {
    const res = await authFetch("categorias");//Llama al endpoint "categorias" para traer todas las categorías en formato JSON.
    const categorias = await res.json();
    const combo = document.getElementById("CategoriaIdEditar");// Busca el combo de categoría para edición.
    if (!combo) return; // Si no existe, sale de la función.
    combo.innerHTML = ""; // Vacía el combo.
    // Recorre las categorías obtenidas y crea las opciones para el combo de edición.
    categorias.forEach(cat => {
        const id = cat.categoriaId;
        const desc = cat.descripcion;
        combo.innerHTML += `<option value="${id}" ${id == selectedId ? "selected" : ""}>${desc}</option>`;
    });
}

function BuscarTicketId(ticketId) {
    authFetch(`tickets/` + ticketId, {
        method: "GET",
    })
        .then(response => response.json()) // Convierte la respuesta en JSON y la guarda en data
        .then(async data => {
            // Rellena los campos del formulario de edición con los datos del ticket que vino del backend
            document.getElementById("ticketId").value = data.id ?? data.ticketId;
            document.getElementById("TituloEditar").value = data.titulo;
            document.getElementById("DescripcionEditar").value = data.descripcion;
            document.getElementById("PrioridadEditar").value = data.prioridad;
            await comboCategoriasEditar(data.categoriaId); // Carga las categorías en el dropdown y selecciona la del ticket
            $('#modalEditarTickets').modal('show'); // Muestra el modal de edición
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el ticket para editar.',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonColor: '#8f5fe8',
            });
            console.error("Error al buscar el ticket para editar:", error);
        });
}

function MostrarTicketId(ticketId) {
    authFetch(`tickets/` + ticketId, {
        method: "GET",
    })
        .then(response => {
            if (!response.ok) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin datos',
                    text: 'No se encontró el ticket seleccionado.',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonColor: '#8f5fe8',
                });
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;

             let categoriaDesc = categoriasMap[data.categoriaId] || data.categoriaId;
            // Limpiar la tabla antes de llenarla
            $("#MostrarTicket").empty();
            // Mostrar los datos del ticket en una fila
            $("#MostrarTicket").append(
                "<tr>" +
                "<td>" + (data.id ?? data.ticketId ?? "") + "</td>" +
                "<td>" + (data.titulo ?? "") + "</td>" +
                "<td>" + (data.descripcion ?? "") + "</td>" +
                "<td>" + (data.prioridad ?? "") + "</td>" +
                "<td>" + categoriaDesc + "</td>" +
                "<td>" + (data.usuario ?? "") + "</td>" +
                "<td>" + (data.email ?? "") + "</td>" +
                "</tr>"
            );
            $("#modalMostrarTickets").modal("show");
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el ticket.',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonColor: '#8f5fe8',
            });
            console.error("Error al buscar el ticket:", error);
        });
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
        categoriaId: categoriaId,
    };
    // console.log("ticketId:", ticketId, "editarTicket:", editarTicket);

    try {
        const res = await authFetch(`tickets/` + ticketId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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


// function EliminarTicket(ticketId) {
//     Swal.fire({
//         title: "Estas seguro de eliminar este ticket?",
//         text: "¡No podrás revertir esto!",
//         icon: 'warning',
//         background: '#000000',
//         color: '#f1f1f1',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Sí, eliminarlo'

//     }).then((result) => {
//         if (result.isConfirmed) {
//             EliminarTicketSi(ticketId);
//         }
//     });
// }

// function EliminarTicketSi(ticketId) {

//     authFetch(`tickets/` + ticketId, {
//         method: "DELETE",
//     })
//         .then(() => {
//             // Mostrar mensaje de éxito
//             Swal.fire({
//                 title: "Eliminado!",
//                 text: "El ticket ha sido eliminado.",
//                 icon: 'success',
//                 background: '#000000',
//                 color: '#f1f1f1',
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//             ObtenerTickets(); // Actualiza la lista de tickets
//         })
//         .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
// }


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
// Hacemos un map global de categorías para acceder rápido al nombre de la
// categoría desde su ID en el historial tickets
let categoriasMap = {};

async function cargarCategorias() {
    const res = await authFetch("categorias");
    const categorias = await res.json();
    categoriasMap = {};
    categorias.forEach(cat => {
        const id = cat.categoriaId;
        categoriasMap[id] = cat.descripcion;
    });
}



function MostrarHistorial(ticketId) {

    authFetch(`historialtickets/` + ticketId, {
        method: "GET",
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
                        "<td>" + (item.campoModificado === "Categoria" ? categoriasMap[item.valorAnterior] || item.valorAnterior : item.valorAnterior) + "</td>" +
                        "<td>" + (item.campoModificado === "Categoria" ? categoriasMap[item.valorNuevo] || item.valorNuevo : item.valorNuevo) + "</td>" +
                        "<td>" + formatearFecha(item.fechaCambio) + "</td>" +
                        "<td>" + (item.usuarioNombre) + "</td>" +
                        "</tr>"
                    );

                    // $("#historialTickets").append(
                    //     "<tr>" +
                    //     "<td>" + item.campoModificado + "</td>" +
                    //     "<td>" + item.valorAnterior + "</td>" +
                    //     "<td>" + item.valorNuevo + "</td>" +
                    //     "<td>" + formatearFecha(item.fechaCambio) + "</td>" +
                    //     "<td>" + (item.usuarioNombre) + "</td>" +
                    //     "</tr>"
                    // );
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

// Inicialización normal al cargar la página

document.addEventListener("DOMContentLoaded", () => {
    configurarFiltros(); // Asigna los eventos de filtrado
});

// Inicialización al navegar por hash (SPA)
window.addEventListener("hashchange", () => {
    if (location.hash === "#ticket") {
        comboCategorias(); // Vuelve a cargar combos y tickets al volver a la vista de tickets
    }
});

function ImprimirInforme() {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    // Títulos de columnas (ajusta según tus columnas visibles)
    const columns = [
        "Título", "Estado", "Prioridad", "Fecha de Creación", "Categoría"
    ];

    // Obtén las filas visibles del tbody
    const tbody = document.getElementById("todosLosTickets");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    // Extrae los datos de cada fila (ajusta los índices si cambias columnas)
    const data = rows.map(tr => {
        const tds = tr.querySelectorAll("td");
        return [
            tds[0]?.innerText || "",
            tds[1]?.innerText || "",
            tds[2]?.innerText || "",
            tds[3]?.innerText || "",
            tds[4]?.innerText || ""
        ];
    });

    // doc.setFontSize(16);
    // doc.text("Gestión de Tickets - Listado filtrado", 14, 18);

    // // Fecha de generación
    // doc.setFontSize(10);
    // doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 25);

    doc.setFontSize(18);
    doc.text("Gestión de Tickets", 14, 20);
    doc.setFontSize(14);
    doc.text("Listado filtrado", 14, 30);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);
    // Genera la tabla
    doc.autoTable({
        head: [columns],
        body: data,
        startY: 40,
        styles: { fontSize: 9 }
    });

    doc.save("Listado_Tickets_Filtrados.pdf");
}