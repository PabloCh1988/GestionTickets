// Flag para evitar llamadas múltiples simultáneas
let enEjecucion = false;

document.addEventListener("DOMContentLoaded", () => {
    comboCategorias(); // Solo esto
});

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
            elemento.addEventListener("change", () => {
                ObtenerTickets(); // Filtrar al cambiar
            });
        }
    });
}


async function comboCategorias() {
    const res = await authFetch("categorias");
    const categorias = await res.json();

    const comboSelectBuscar = document.querySelector("#CategoriaIdBuscar");
    const comboSelect = document.querySelector("#CategoriaId");
    if (comboSelectBuscar) comboSelectBuscar.innerHTML = "";
    if (comboSelect) comboSelect.innerHTML = "";

    let opcionesBuscar = `<option value="0">[Todas las categorías]</option>`;
    let opciones = '';

    categorias.forEach(cat => {
        const id = cat.id || cat.categoriaId;
        const desc = cat.descripcion;
        opciones += `<option value="${id}">${desc}</option>`;
        opcionesBuscar += `<option value="${id}">${desc}</option>`;
    });

    if (comboSelect) comboSelect.innerHTML = opciones;
    if (comboSelectBuscar) comboSelectBuscar.innerHTML = opcionesBuscar;

    // Llamamos a ObtenerTickets solo después de preparar los combos
    ObtenerTickets();
    // Y ahora sí, asignamos los eventos de filtrado
    configurarFiltros();
}

async function ObtenerTickets() {
    if (enEjecucion) return;
    enEjecucion = true;

    try {
        const catVal = document.getElementById("CategoriaIdBuscar")?.value;
        const estVal = document.getElementById("EstadoIdBuscar")?.value;
        const priVal = document.getElementById("PrioridadIdBuscar")?.value;
        let fechaDesde = document.getElementById("FechaInicioBuscar")?.value;
        let fechaHasta = document.getElementById("FechaFinBuscar")?.value;

        // Validación: si fechaDesde > fechaHasta, igualarlas
        if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
            fechaHasta = fechaDesde;
            const campoHasta = document.getElementById("FechaFinBuscar");
            if (campoHasta) campoHasta.value = fechaHasta;
        }

        const filtros = {
            CategoriaId: parseInt(catVal || "0"),
            Estado: parseInt(estVal || "0"),
            Prioridad: parseInt(priVal || "0"),
            FechaInicio: fechaDesde || null,
            FechaFin: fechaHasta || null
        };

        const res = await authFetch("tickets/filtro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filtros)
        });

        let tickets;
        try {
            tickets = await res.json();
        } catch (e) {
            tickets = null;
        }

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

        const tabla = document.getElementById("todosLosTickets");
        if (!tabla) return;
        tabla.innerHTML = "";

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
        enEjecucion = false;
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
        categoriaId: parseInt(categoriaId),
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
    const res = await authFetch("categorias");
    const categorias = await res.json();
    const combo = document.getElementById("CategoriaIdEditar");
    if (!combo) return;
    combo.innerHTML = "";
    categorias.forEach(cat => {
        const id = cat.id || cat.categoriaId;
        const desc = cat.descripcion;
        combo.innerHTML += `<option value="${id}" ${id == selectedId ? "selected" : ""}>${desc}</option>`;
    });
}

function BuscarTicketId(ticketId) {
    authFetch(`tickets/` + ticketId, {
        method: "GET",
    })
    .then(response => response.json())
    .then(async data => {
        document.getElementById("ticketId").value = data.id ?? data.ticketId;
        document.getElementById("TituloEditar").value = data.titulo;
        document.getElementById("DescripcionEditar").value = data.descripcion;
        document.getElementById("PrioridadEditar").value = data.prioridad;
        await comboCategoriasEditar(data.categoriaId); 
        $('#modalEditarTickets').modal('show');
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
            // Limpiar la tabla antes de llenarla
            $("#MostrarTicket").empty();
            // Mostrar los datos del ticket en una fila
            $("#MostrarTicket").append(
                "<tr>" +
                "<td>" + (data.id ?? data.ticketId ?? "") + "</td>" +
                "<td>" + (data.titulo ?? "") + "</td>" +
                "<td>" + (data.descripcion ?? "") + "</td>" +
                "<td>" + (data.prioridad ?? "") + "</td>" +
                "<td>" + (data.categoriaId ?? "") + "</td>" +
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
                        "<td>" + item.valorAnterior + "</td>" +
                        "<td>" + item.valorNuevo + "</td>" +
                        "<td>" + formatearFecha(item.fechaCambio) + "</td>" +
                        "<td>" + (item.usuarioNombre) + "</td>" +
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

// Inicialización normal al cargar la página

document.addEventListener("DOMContentLoaded", () => {
    comboCategorias(); // Llena los combos y llama a ObtenerTickets
    configurarFiltros(); // Asigna los eventos de filtrado
});

// Inicialización al navegar por hash (SPA)
window.addEventListener("hashchange", () => {
    if (location.hash === "#ticket") {
        comboCategorias(); // Vuelve a cargar combos y tickets al volver a la vista de tickets
    }
});

// function ImprimirInforme() {
//     const jsPDF = window.jspdf.jsPDF;
//     const doc = new jsPDF();

    

//     // var doc = new jsPDF();
//     // //var doc = new jsPDF('l', 'mm', [297, 210]);

//     var totalPagesExp = "{total_pages_count_string}"; 
//     var pageContent = function (data) {
//         doc.setFontSize(18);
//     doc.text("Gestión de Tickets", 14, 20);
//     doc.setFontSize(14);
//     doc.text("Listado de Categorías", 14, 30);
//     doc.setFontSize(10);
//     doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

//     //     doc.setDrawColor(78, 115, 223); 
//     //     doc.setLineWidth(0.7);
//     //     doc.rect(14, 10, 30, 20, 'S');
//     //     doc.rect(44, 10, 151, 20, 'S');

//     //     doc.setFontSize(12);
//     //     doc.text("Listado de Tickets", 46, 15);
//         // doc.text("Con métodos de búsqueda", 46, 22);
//         //  doc.text("Version del sistema: 1.0.0", 46, 28.5);
        
        
//         doc.setLineWidth(0.5);
//         doc.line(44, 17, 195, 17, 'S');

//          doc.line(44, 24, 195, 24, 'S');
      

//         var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//         var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

//         // FOOTER
//         var str = "Pagina " + data.pageCount;
//         // Total page number plugin only available in jspdf v1.0+
//         if (typeof doc.putTotalPages == 'function') {
//             str = str + " de " + totalPagesExp;
//         }

//         doc.setLineWidth(8);
//         doc.setDrawColor(78, 115, 223);
//         doc.setTextColor(255, 255, 255);
//         doc.line(14, pageHeight - 11, 196, pageHeight - 11);

//         doc.setFontSize(10);

//         doc.setFontStyle('bold');

//         doc.text(str, 17, pageHeight - 10);
//     };


//     var elem = document.getElementById("todosLosTickets");
//     var res = doc.autoTableHtmlToJson(elem);

//     // Eliminar la columna 5 (índice 5)
//     res.columns.splice(5, 1); // Elimina la columna de encabezado
//     res.data = res.data.map(row => {
//         row.splice(5, 1); // Elimina la celda correspondiente de cada fila
//         return row;
//     });

//     doc.autoTable(res.columns, res.data,
//         {
//             addPageContent: pageContent,
//             margin: { top: 32 },
//             styles: {
//                 fillStyle: 'DF',
//                 overflow: 'linebreak',
//                 columnWidth: 110,
//                 lineWidth: 0.1,
//                 lineColor: [238, 238, 238]
//             },
//             headerStyles: {
//                 fillColor: [78, 115, 223],
//                 textColor: [255, 255, 255]
//             },
//             columnStyles: {
//                 0: { columnWidth: 28 },//FECHA
//                 1: { columnWidth: 62 },//TITULO
//                 2: { columnWidth: 50 },//CATEGORIA
//                 3: { columnWidth: 20 },//PRIORIDAD
//                 4: { columnWidth: 20 }//ESTADO
//             },
//             createdHeaderCell: function (cell, opts) {
//                 if (opts.column.index == 0 || opts.column.index == 3 || opts.column.index == 4) {
//                     cell.styles.halign = 'center';
//                 }
//                 cell.styles.fontSize = 8;
//             },
//             createdCell: function (cell, opts) {
//                 cell.styles.fontSize = 7;
//                 if (opts.column.index == 0 || opts.column.index == 3 || opts.column.index == 4) {
//                     cell.styles.halign = 'center';
//                 }
//             }
//         }
//     );

//     // ESTO SE LLAMA ANTES DE ABRIR EL PDF PARA QUE MUESTRE EN EL PDF EL NRO TOTAL DE PAGINAS. ACA CALCULA EL TOTAL DE PAGINAS.
//     if (typeof doc.putTotalPages === 'function') {
//         doc.putTotalPages(totalPagesExp);
//     }

//     //doc.save('Listado de Tickets.pdf')

//     var string = doc.output('datauristring'); // Obtiene el string del PDF generado
//     var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>" 
    
//     // Abrir el PDF en una nueva ventana
//     var x = window.open(); // Abrir una nueva ventana
//     x.document.open(); // Abrir el documento
//     x.document.write(iframe); // Escribir el contenido del iframe en la nueva ventana
//     x.document.close(); // Cerrar el documento para que se renderice
// }

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