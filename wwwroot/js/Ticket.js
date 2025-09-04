

// }
function ObtenerCategoriaDropdown() {
    authFetch(`categorias`, { method: 'GET' })
        .then(response => {
            console.log("Respuesta cruda:", response);
            return response.json();
        })
        .then(data => {
            console.log("Categorias recibidas:", data);
            CompletarDropdown(data);
        })
        .catch(error => console.error("❌ No se pudo acceder al servicio:", error));
}

function CompletarDropdown(data) {
    let bodySelect1 = document.getElementById("ticketCategoriaId");
    let bodySelectFiltro = document.getElementById("CategoriaIdBuscar");

    if (!bodySelect1 || !bodySelectFiltro) {
        console.error("❌ Los selects no existen en el DOM todavía");
        return;
    }

    bodySelect1.innerHTML = "";
    bodySelectFiltro.innerHTML = "";

    optFiltro1 = document.createElement("option");
    optFiltro1.value = 0;
    optFiltro1.text = "[Todas las Categorias]"

    bodySelectFiltro.add(optFiltro1);
    console.log("Categorias:", data)

    data.forEach(element => {
        optmodal = document.createElement("option");
        optmodal.value = element.categoriaId;
        optmodal.text = element.descripcion

        bodySelect1.add(optmodal);

        optFiltro1 = document.createElement("option");
        optFiltro1.value = element.categoriaId;
        optFiltro1.text = element.descripcion

        bodySelectFiltro.add(optFiltro1);
        //console.log(optFiltro);
    })
    ObtenerTickets();
    //ObtenerPrioridadDropdown();
}


// document.addEventListener("DOMContentLoaded", async () => {
//   // 1. Cargo las categorías en los combos
//   await comboCategorias();

//   // 2. Asigno los eventos *después* de que el DOM y el innerHTML ya están listos
//   const inputCategoria   = document.getElementById("CategoriaIdBuscar");
//   const inputEstado      = document.getElementById("EstadoIdBuscar");
//   const inputPrioridad   = document.getElementById("PrioridadIdBuscar");
//   const inputFechaInicio = document.getElementById("FechaInicioBuscar");
//   const inputFechaFin    = document.getElementById("FechaFinBuscar");

//   if (inputCategoria) {
//     inputCategoria.addEventListener("change", () => {
//       console.log("Filtrando por categoría:", inputCategoria.value);
//       ObtenerTickets();
//     });
//   }

//   if (inputEstado) {
//     inputEstado.addEventListener("change", () => {
//       console.log("Filtrando por estado:", inputEstado.value);
//       ObtenerTickets();
//     });
//   }

//   if (inputPrioridad) {
//     inputPrioridad.addEventListener("change", () => {
//       console.log("Filtrando por prioridad:", inputPrioridad.value);
//       ObtenerTickets();
//     });
//   }

//   if (inputFechaInicio) {
//     inputFechaInicio.addEventListener("change", () => {
//       console.log("Filtrando desde fecha:", inputFechaInicio.value);
//       ObtenerTickets();
//     });
//   }

//   if (inputFechaFin) {
//     inputFechaFin.addEventListener("change", () => {
//       console.log("Filtrando hasta fecha:", inputFechaFin.value);
//       ObtenerTickets();
//     });
//   }
// });


// async function comboCategorias() {
//     try {
//         const res = await authFetch("categorias");
//         const categorias = await res.json();
//         console.log("Categorías recibidas:", categorias);

//         const comboSelectBuscar = document.querySelector("#CategoriaIdBuscar");
//         const comboSelect = document.querySelector("#ticketCategoriaId");

//         if (!comboSelect || !comboSelectBuscar) {
//             console.error("No se encontraron los combos en el DOM");
//             return;
//         }

//         let opcionesBuscar = `<option value="0">[Todas las categorias]</option>`;
//         let opciones = '';

//         categorias.forEach(cat => {
//             if (cat && cat.categoriaId && cat.descripcion) {
//                 opciones += `<option value="${cat.categoriaId}">${cat.descripcion}</option>`;
//                 opcionesBuscar += `<option value="${cat.categoriaId}">${cat.descripcion}</option>`;
//             } else {
//                 console.warn("Categoría inválida:", cat);
//             }
//         });

//         comboSelect.innerHTML = opciones;
//         comboSelectBuscar.innerHTML = opcionesBuscar;

//         console.log("Opciones generadas:", opcionesBuscar);

//         ObtenerTickets();
//     } catch (error) {
//         console.error("Error en comboCategorias:", error);
//     }
//     ObtenerTickets();
// }


// const inputCategoria = document.getElementById("CategoriaIdBuscar");
// inputCategoria.onchange = function () {
//     ObtenerTickets();
// };

// const inputEstado = document.getElementById("EstadoIdBuscar");
// inputEstado.onchange = function () {
//     ObtenerTickets();
// };

// const inputPrioridad = document.getElementById("PrioridadIdBuscar");
// inputPrioridad.onchange = function () {
//     ObtenerTickets();
// };

// const inputFechaInicio = document.getElementById("FechaInicioBuscar");
// inputFechaInicio.onchange = function () {
//     ObtenerTickets();
// };

// const inputFechaFin = document.getElementById("FechaFinBuscar");
// inputFechaFin.onchange = function () {
//     ObtenerTickets();
// };

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
// Función para obtener y mostrar los tickets según los filtros seleccionados.
async function ObtenerTickets() {
    let fechaDesde = document.getElementById("FechaInicioBuscar").value;
    let fechaHasta = document.getElementById("FechaFinBuscar").value;
    let categoriaIdBuscar = document.getElementById("CategoriaIdBuscar").value;
    let estadoBuscar = document.getElementById("EstadoIdBuscar").value;
    let prioridadBuscar = document.getElementById("PrioridadIdBuscar").value;

    const fecha1 = new Date(fechaDesde);
    const fecha2 = new Date(fechaHasta);

    if (fecha1 > fecha2) {
        fechaHasta = fechaDesde;
        document.getElementById("FechaFinBuscar").value = fechaDesde;
    }
    // Prepara el objeto de filtros para enviar a la API
    const filtro = {
        CategoriaId: categoriaIdBuscar && categoriaIdBuscar !== "0" ? parseInt(categoriaIdBuscar) : null,
        Estado: estadoBuscar && estadoBuscar !== "0" ? parseInt(estadoBuscar) : null,
        Prioridad: prioridadBuscar && prioridadBuscar !== "0" ? parseInt(prioridadBuscar) : null,
        FechaInicio: fechaDesde || null,
        FechaFin: fechaHasta || null
    };

    const res = await authFetch("tickets/filtro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtro)
    });


    const tickets = await res.json();
    console.log("Tickets recibidos:", tickets);
    const tabla = document.getElementById("todosLosTickets");
    tabla.innerHTML = "";
    // Recorre los tickets y crea una fila por cada uno
    tickets.forEach(item => {
        const clasePrioridad = obtenerClasePrioridad(item.prioridadString);
        const fila = document.createElement("tr");
        fila.innerHTML = `
                <td>${item.titulo || ''}</td>
                <td>${item.estadoString || ''}</td>
                <td><span class="${clasePrioridad}">${item.prioridadString || ''}</td>
                <td>${item.fechaCreacionString || ''}</td>
                <td>${item.categoriaString || ''}</td>
                <td><button class='btn btn-inverse-primary  mdi mdi-account-card-details' title='Datos' onclick='MostrarTicketId(${item.ticketId})'></button>
                <button class='btn btn-inverse-success mdi mdi-border-color' title='Editar' onclick='BuscarTicketId(${item.ticketId})'></button>
                <button class='btn btn-inverse-warning  mdi mdi-file-find' title='Historial' onclick='MostrarHistorial(${item.ticketId})'></button></td>
            `;
        tabla.appendChild(fila);
    });
    // $("#modalCrearTickets").hide();
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
window.addEventListener("DOMContentLoaded", () => {
    ObtenerCategoriaDropdown();
    cargarCategorias();
});



// Inicialización al navegar por hash (SPA)
window.addEventListener("hashchange", () => {
    if (location.hash === "#ticket") {
        ObtenerCategoriaDropdown(); // Vuelve a cargar combos y tickets al volver a la vista de tickets
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