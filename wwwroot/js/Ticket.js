async function comboCategoriasTickets() {

    const res = await authFetch("categorias");

    const categorias = await res.json();

    const comboSelectBuscar = document.querySelector("#BuscarCategoriaId");
    // const comboSelectOpciones = document.querySelector("#ticketCategoriaId");
    comboSelectBuscar.innerHTML = "";
    // comboSelectOpciones.innerHTML = "";


    let opcionesBuscar = `<option value="0">[Todas las categorias]</option>`;
    categorias.forEach(cat => {

        opcionesBuscar += `<option value="${cat.categoriaId}">${cat.descripcion}</option>`;
    });

    comboSelectBuscar.innerHTML = opcionesBuscar;

     ObtenerTickets();
}


const inputPrioridad = document.getElementById("PrioridadIdBuscar");
inputPrioridad.onchange = function () {
    ObtenerTickets();
};

const inputEstado = document.getElementById("EstadoIdBuscar");
inputEstado.onchange = function () {
    ObtenerTickets();
};

const inputFechaDesde = document.getElementById("BuscarFechaInicio");
inputFechaDesde.onchange = function () {
    ObtenerTickets();
};

const inputFechaHasta = document.getElementById("BuscarFechaFin");
inputFechaHasta.onchange = function () {
    ObtenerTickets();
};

const inputCategoria = document.getElementById("BuscarCategoriaId");
inputCategoria.onchange = function () {
    ObtenerTickets();
};



// function ObtenerCategoriaDropdown() {
//     authFetch(`categorias`, { method: 'GET' })
//         .then(response => {
//             console.log("Respuesta cruda:", response);
//             return response.json();
//         })
//         .then(data => {
//             console.log("Categorias recibidas:", data);
//             CompletarDropdown(data);
//         })
//         .catch(error => console.error("❌ No se pudo acceder al servicio:", error));
// }

function CompletarDropdown(data) {
    let bodySelect1 = document.getElementById("ticketCategoriaId");
    let bodySelectFiltro = document.getElementById("BuscarCategoriaId");

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
    let fechaDesde = document.getElementById("BuscarFechaInicio").value;
    let fechaHasta = document.getElementById("BuscarFechaFin").value;
    let categoriaIdBuscar = document.getElementById("BuscarCategoriaId").value;
    let estadoBuscar = document.getElementById("EstadoIdBuscar").value;
    let prioridadBuscar = document.getElementById("PrioridadIdBuscar").value;

    const fecha1 = new Date(fechaDesde);
    const fecha2 = new Date(fechaHasta);

    if (fecha1 > fecha2) {
        fechaHasta = fechaDesde;
        document.getElementById("BuscarFechaFin").value = fechaDesde;
    }
    // Prepara el objeto de filtros para enviar a la API
    const filtro = {
        categoriaId: categoriaIdBuscar && categoriaIdBuscar !== "0" ? parseInt(categoriaIdBuscar) : null,
        estado: estadoBuscar && estadoBuscar !== "0" ? parseInt(estadoBuscar) : null,
        prioridad: prioridadBuscar && prioridadBuscar !== "0" ? parseInt(prioridadBuscar) : null,
        fechaInicio: fechaDesde || null,
        fechaFin: fechaHasta || null
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


// function ImprimirInforme() {
//     const jsPDF = window.jspdf.jsPDF;
//     const doc = new jsPDF();

//     // Títulos de columnas (ajusta según tus columnas visibles)
//     const columns = [
//         "Título", "Estado", "Prioridad", "Fecha de Creación", "Categoría"
//     ];

//     // Obtén las filas visibles del tbody
//     const tbody = document.getElementById("todosLosTickets");
//     const rows = Array.from(tbody.querySelectorAll("tr"));

//     // Extrae los datos de cada fila (ajusta los índices si cambias columnas)
//     const data = rows.map(tr => {
//         const tds = tr.querySelectorAll("td");
//         return [
//             tds[0]?.innerText || "",
//             tds[1]?.innerText || "",
//             tds[2]?.innerText || "",
//             tds[3]?.innerText || "",
//             tds[4]?.innerText || ""
//         ];
//     });

//     doc.setFontSize(18);
//     doc.text("Gestión de Tickets", 14, 20);
//     doc.setFontSize(14);
//     doc.text("Listado filtrado", 14, 30);
//     doc.setFontSize(10);
//     doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);
//     // Genera la tabla
//     doc.autoTable({
//         head: [columns],
//         body: data,
//         startY: 40,
//         styles: { fontSize: 9 }
//     });

//     doc.save("Listado_Tickets_Filtrados.pdf");
// }

function ImprimirInforme() {
    // Crear una instancia del documento PDF
    var doc = new jsPDF();
    // Alternativa para orientación horizontal: var doc = new jsPDF('l', 'mm', [297, 210]);

    // Placeholder para total de páginas
    var totalPagesExp = "{total_pages_count_string}";

    // Función que se ejecuta en cada página del PDF
    var pageContent = function (data) {
        // Dibujar rectángulos decorativos en el encabezado
        doc.setDrawColor(153, 102, 255); // Lila intenso
        doc.setLineWidth(0.7);
        doc.rect(14, 10, 30, 20, 'S'); // Caja izquierda
        doc.rect(44, 10, 151, 20, 'S'); // Caja principal

        // Texto del encabezado
        doc.setFontSize(12);
        doc.text("Listado de Tickets", 46, 15);
        doc.text("Con métodos de búsqueda", 46, 22);
        doc.text("Version del sistema: 1.0.0", 46, 28.5);

        // Líneas horizontales decorativas
        doc.setLineWidth(0.5);
        doc.line(44, 17, 195, 17, 'S');
        doc.line(44, 24, 195, 24, 'S');

        // Obtener dimensiones de la página
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        // Pie de página con número de página
        var str = "Pagina " + data.pageCount;
        if (typeof doc.putTotalPages == 'function') {
            str += " de " + totalPagesExp;
        }

        // Línea decorativa del pie
        doc.setLineWidth(8);
        doc.setDrawColor(153, 102, 255) // Lila intenso
        doc.setTextColor(255, 255, 255); //texto blanco
        doc.line(14, pageHeight - 11, 196, pageHeight - 11);

        // Texto del pie de página
        doc.setFontSize(10);
        doc.setFontStyle('bold');
        doc.text(str, 17, pageHeight - 10);
    };

    // Obtener la tabla HTML por su ID
    var elem = document.getElementById("tablaTickets");

    // Convertir la tabla HTML en formato compatible con autoTable
    var res = doc.autoTableHtmlToJson(elem);

    // Eliminar la columna 5 (índice 5) tanto del encabezado como de los datos
    res.columns.splice(5, 1);
    res.data = res.data.map(row => {
        row.splice(5, 1);
        return row;
    });

    // Generar la tabla en el PDF con estilos personalizados
    doc.autoTable(res.columns, res.data, {
        addPageContent: pageContent, // Agrega encabezado y pie en cada página
        margin: { top: 32 }, // Margen superior para dejar espacio al encabezado
        styles: {
            fillStyle: 'DF',
            overflow: 'linebreak',
            columnWidth: 110,
            lineWidth: 0.1,
            lineColor: [238, 238, 238]
        },
        headerStyles: {
            fillColor: [153, 102, 255], // Lila intenso
            textColor: [255, 255, 255]
        },
        columnStyles: {
            0: { columnWidth: 28 }, // Fecha
            1: { columnWidth: 62 }, // Título
            2: { columnWidth: 50 }, // Categoría
            3: { columnWidth: 20 }, // Prioridad
            4: { columnWidth: 20 }  // Estado
        },
        createdHeaderCell: function (cell, opts) {
            // Alineación centrada para columnas específicas en el encabezado
            if (opts.column.index == 0 || opts.column.index == 3 || opts.column.index == 4) {
                cell.styles.halign = 'center';
            }
            cell.styles.fontSize = 8;
        },
        createdCell: function (cell, opts) {
            // Alineación centrada y tamaño de fuente para celdas
            cell.styles.fontSize = 7;
            if (opts.column.index == 0 || opts.column.index == 3 || opts.column.index == 4) {
                cell.styles.halign = 'center';
            }
        }
    });

    // Calcular el total de páginas antes de mostrar el PDF
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    // Mostrar el PDF en una nueva ventana dentro de un iframe
    var string = doc.output('datauristring');
    var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>";
    var x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();
}

comboCategoriasTickets();