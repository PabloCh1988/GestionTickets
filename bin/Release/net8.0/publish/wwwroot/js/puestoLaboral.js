async function ObtenerPuestos() {
    const res = await authFetch(`puestoslaborales`);
    const puestoslaborales = await res.json();
    renderizarPuestosJQuery(puestoslaborales); // Usar el renderizado jQuery personalizado
}

// Función para eliminar una categoría y mostrar un mensaje de confirmación
async function ToggleEliminadoPuesto(puestoLaboralId, estadoActual2) {
    try {
        // Obtener la categoría completa antes de actualizar
        const resGet = await authFetch(`puestoslaborales/` + puestoLaboralId);
        if (!resGet.ok) {
            throw new Error("No se pudo obtener el puesto actual");
        }
        const puesto = await resGet.json();
        puesto.eliminado = !estadoActual2; // Cambiar el estado de eliminado

        // Enviar el objeto completo actualizado
        const res = await authFetch(`puestoslaborales/` + puestoLaboralId, {
            method: "PUT",
            body: JSON.stringify(puesto)
        });
        // Verificar si la respuesta fue exitosa
        if (res.ok) {
            Swal.fire({ // Mostrar mensaje de éxito
                title: "Estado actualizado",
                text: `El puesto ha sido ${puesto.eliminado ? "deshabilitada" : "habilitada"}.`,
                icon: "success",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1200
            });
            ObtenerPuestos(); // Actualizar la lista de categorías
        } else { // Si hubo un error, mostrar mensaje de error
            // Obtener el mensaje de error del servidor
            const errorText = await res.text();
            Swal.fire({
                title: "Error",
                text: `Error al actualizar el estado: ${errorText}`,
                icon: "error",
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        console.error("Error al actualizar el estado del puesto:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al intentar actualizar el estado del puesto.",
            icon: "error",
            background: '#000000',
            color: '#f1f1f1',
            confirmButtonText: "Aceptar"
        });
    }
}

// Renderiza las categorías usando jQuery y el estilo solicitado
function renderizarPuestosJQuery(data) {
    $('#todosLosPuestos').empty();
    $.each(data, function (index, item) {
        let puestoDesactivado = item.eliminado ? "fila-desactivada" : ""; // Clase para categorías eliminadas
        let iconoPuestoHabilitado = item.eliminado ? "mdi mdi-close-box" : "mdi mdi-close"; // Ícono de habilitar/deshabilitar
        let botonEditarPuestoVisible = item.eliminado ? "display: none;" : "";
        let botonActivarPuestoVisible = item.eliminado ? "display: none;" : "";

        $('#todosLosPuestos').append(
            "<tr class='" + puestoDesactivado + "'>" +
            "<td>" + item.descripcion + "</td>" +
            "<td>" +
            // Botón de edición
            "<button class='btn btn-inverse-success mdi mdi-border-color mx-1' title='Editar' data-action='edit' style='" + botonEditarPuestoVisible + "' onclick=\"AbrirModalEditarPuesto(" + item.puestoLaboralId + ", '" + item.descripcion.replace(/'/g, "\\'") + "')\">" +
            "</button>" +

            // Botón de activar/desactivar
            "<button class='btn btn-inverse-primary mdi mdi-account-card-details mx-1' title='Categorias' data-action='edit' style='" + botonActivarPuestoVisible + "' onclick=\"AbrirModalCrearPuestoCat(" + item.puestoLaboralId + ", '" + item.descripcion.replace(/'/g, "\\'") + "')\">" +
            "</button>" +

            // Botón de activación/desactivación
            "<button class='mx-1' data-action='delete' style='background: none; border: none;' onclick=\"ToggleEliminadoPuesto(" + item.puestoLaboralId + ", " + item.eliminado + ")\" title='" + (item.eliminado ? "Activar Puesto Laboral" : "Desactivar Puesto Laboral") + "'>" +
            "<i class='btn btn-inverse-danger " + iconoPuestoHabilitado + "'></i>" +
            "</button>" +
            "</td>" +
            "</tr>"
        );
    });
};




function AbrirModalEditarPuesto(puestoLaboralId, descripcion) {
    $('#modalCrearPuestos').modal('hide');
    limpiarBackdropBootstrap();
    setTimeout(function () {
        $("#DescripcionLaboral").val(descripcion);
        $("#PuestoLaboralId").val(puestoLaboralId);
        $('#modalCrearPuestos').modal('show');
    }, 300); // 300 ms de espera
}


function VaciarModalPuesto() {
    $("#DescripcionLaboral").val("");
    $("#PuestoLaboralId").val("");
    $('#modalCrearPuestos').modal('hide');
    $('#errorCrearPuesto').empty();
    limpiarBackdropBootstrap();
    $('#modalCrearCatPorPuestos').modal('hide');
    $('#errorCrearPuestoCat').empty();
}

function GuardarPuesto() {
    let puestoLaboralId = document.getElementById("PuestoLaboralId").value; // Obtener el ID de la categoría
    let descripcion = document.getElementById("DescripcionLaboral").value; // Obtener el valor de la descripción

    // Crear un objeto con la descripción
    let puestoLab = {
        descripcion: descripcion
    };
    // Validar que la descripción no esté vacía
    if (descripcion.descripcion == "") {
        mensajesError('#errorCrearPuesto', null, "El campo Descripcion es requerido.")
        return;
    }

    if (puestoLaboralId) { // Si categoriaId tiene un valor, actualiza
        EditarPuesto(puestoLaboralId, puestoLab); // Actualizar la categoría
    } else { // Si no tiene valor, crea una nueva categoría
        CrearPuestos();
    }
}

async function CrearPuestos() {
    const crearPuesto = {
        descripcion: document.getElementById("DescripcionLaboral").value.trim()
    }; // Crear un objeto con la descripción
    // Validar que la descripción no esté vacía
    if (crearPuesto.descripcion == "") {
        mensajesError('#errorCrearPuesto', null, "El campo Nombre es requerido.")
        return;
    }

    const res = await authFetch(`puestoslaborales`, {
        method: "POST",
        body: JSON.stringify(crearPuesto)
    }); // Realizar la petición a la API

    if (res.ok) {
        document.getElementById("DescripcionLaboral").value = ""; // Limpiar el campo de descripción
        document.getElementById("PuestoLaboralId").value = 0;
        $('#errorCrearPuesto').empty(); // Limpiar los mensajes de error
        ObtenerPuestos();
        VaciarModalPuesto();

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Categoría creada",
            background: '#000000',
            color: '#f1f1f1',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        const errorText = await res.text();
        mensajesError('#errorCrearPuesto', null, `Error al crear: ${errorText}`);
    }
}

async function EditarPuesto(puestoLaboralId) {
    // Obtener los valores del formulario
    const descripcion = document.getElementById("DescripcionLaboral").value.trim();

    // Validar que la descripción no esté vacía
    if (!descripcion) {
        mensajesError('#errorCrearPuesto', null, "El campo Nombre es requerido.");
        return;
    }

    // Crear el objeto con los datos de la categoría
    const editarPuesto = {
        puestoLaboralId: puestoLaboralId, // Usar el ID pasado como argumento
        descripcion: descripcion
    };

    try {
        // Realizar la solicitud PUT a la API
        const res = await authFetch(`puestoslaborales/` + puestoLaboralId, {
            method: "PUT",
            body: JSON.stringify(editarPuesto)
        });

        if (res.ok) {
            // Si la solicitud fue exitosa, limpiar el modal y actualizar la lista
            VaciarModalPuesto();
            ObtenerPuestos();
        } else {
            // Si la solicitud falla, mostrar el mensaje de error devuelto por el servidor
            const errorText = await res.text();
            mensajesError('#errorCrearPuesto', null, `Error al actualizar: ${errorText}`);
        }
    } catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error al actualizar el Puesto:", error);
        mensajesError('#errorCrearPuesto', null, "Ocurrió un error al intentar actualizar el Puesto.");
    }
}

function MostrarCatPorPuesto(data) {
    $("#CatSeleccionadas").empty();
    $.each(data, function (index, cat) {
        var descripcion = cat.categoria && cat.categoria.descripcion ? cat.categoria.descripcion : "Sin descripción";
        var fila = "<tr>" +
            "<td>" + descripcion + "</td>" +
            "<td><button class='btn btn-inverse-danger mdi mdi-close' onclick='EliminarCatPorPuesto(" + cat.categoriaPorPuestoId + ")'></button></td>" +
            "</tr>";
        $("#CatSeleccionadas").append(fila);
    });
}


async function AbrirModalCrearPuestoCat(puestoLaboralId) {
    $('#modalCrearCatPorPuestos').modal('hide');
    limpiarBackdropBootstrap();

    $("#PuestoLaboralId").val(puestoLaboralId);

    try {
        const res = await authFetch(`puestoslaborales/${puestoLaboralId}`);
        if (res.ok) {
            const puesto = await res.json();
            $("#NombrePuestoLaboral").text(puesto.descripcion || "");
        } else {
            $("#NombrePuestoLaboral").text("");
        }
    } catch (error) {
        $("#NombrePuestoLaboral").text("");
    }
    $('#modalCrearCatPorPuestos').modal('show');
    $('#errorCrearPuestoCat').empty();

    // 1. Obtener las categorías asociadas al puesto laboral
    try {
        const res = await authFetch(`categoriasporpuestos/${puestoLaboralId}`);
        if (res.ok) {
            const data = await res.json();
            // 2. Mostrar las categorías asociadas en el modal
            MostrarCatPorPuesto(data);
        } else {
            $("#CatSeleccionadas").empty();
            $("#CatSeleccionadas").append("<tr><td colspan='2'>No hay categorías asociadas.</td></tr>");
        }
    } catch (error) {
        console.error("Error al obtener categorías por puesto:", error);
        $("#CatSeleccionadas").empty();
        $("#CatSeleccionadas").append("<tr><td colspan='2'>Error al cargar categorías.</td></tr>");
    }
}

async function GuardarCatPorPuesto() {
    const pLaboralId = document.getElementById("PuestoLaboralId").value; // Obtener el ID del puesto laboral
    const categoriasSeleccionadas = document.getElementById("CategoriasPorPuesto").value; // Obtener las categorías seleccionadas
    const categoriasPorPuesto = {
        puestoLaboralId: pLaboralId, // ID del puesto laboral
        categoriaId: categoriasSeleccionadas // Array de IDs de categorías seleccionadas
    };

    // Validar que se hayan seleccionado categorías
    if (categoriasSeleccionadas.length === 0) {
        mensajesError('#errorCrearPuestoCat', null, "Debe seleccionar al menos una categoría.");
        return;
    }
    try {
        // Realizar la solicitud POST a la API
        const res = await authFetch(`categoriasporpuestos`, {
            method: "POST",
            body: JSON.stringify(categoriasPorPuesto)
        });

        if (res.ok) {
            // Si la solicitud fue exitosa, limpiar el modal y actualizar la lista
            VaciarModalPuesto();
            ObtenerPuestos();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Categorías asignadas al puesto laboral",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            // Si la solicitud falla, mostrar el mensaje de error devuelto por el servidor
            const errorText = await res.text();
            mensajesError('#errorCrearPuestoCat', null, `Error al asignar categorías: ${errorText}`);
        }
    } catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error al asignar categorías al puesto laboral:", error);
        mensajesError('#errorCrearPuestoCat', null, "Ocurrió un error al intentar asignar las categorías al puesto laboral.");
    }
}
function EliminarCatPorPuesto(categoriaPorPuestoId) {
    const res = authFetch(`categoriasporpuestos/${categoriaPorPuestoId}`, {
        method: "DELETE"
    });
    res.then(response => {
        if (response.ok) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Categoría eliminada del puesto laboral",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
            });
            // Actualizar la lista de categorías asociadas al puesto laboral
            $('#modalCrearCatPorPuestos').modal('hide');
            ObtenerPuestos();
        }
    }).catch(error => {
        console.error("Error al eliminar la categoría del puesto laboral:", error);
    });
}

async function imprimirPuestos() {

    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Gestión de Tickets", 14, 20);
    doc.setFontSize(14);
    doc.text("Listado de Puestos Laborales", 14, 30);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    const response = await authFetch(`puestoslaborales`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al obtener Puestos:", response.status, errorText);
        alert("Error al cargar las Puestos.");
        return;
    }

    const data = await response.json();

    // Filtrar solo las categorías no eliminadas
    const puestosNoEliminados = data.filter(p => !p.eliminado);

    const columnas = ["Nombre"];
    const filas = puestosNoEliminados.map(p => [p.descripcion]);

    doc.autoTable({
        head: [columnas],
        body: filas,
        startY: 40,
        styles: { fontSize: 10 }
    });

    doc.save("Listado_Puestos_Laborales.pdf");
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

function limpiarBackdropBootstrap() {
    // Elimina cualquier backdrop de Bootstrap que haya quedado
    $('.modal-backdrop').remove();
    // Elimina la clase modal-open del body si quedó
    $('body').removeClass('modal-open');
    // Elimina el estilo de padding del body
    $('body').css('padding-right', '');
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("todosLosPuestos")) {
        ObtenerPuestos();
    }
});