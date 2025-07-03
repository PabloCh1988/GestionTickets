async function ObtenerPuestos() {
    const res = await authFetch(`puestoslaborales`);
    const puestoslaborales = await res.json();
    renderizarPuestosJQuery(puestoslaborales); // Usar el renderizado jQuery personalizado
}

// Función para eliminar una categoría y mostrar un mensaje de confirmación
async function ToggleEliminado(puestoLaboralId, estadoActual) {
    try {
        // Obtener la categoría completa antes de actualizar
        const resGet = await authFetch(`puestoslaborales/` + puestoLaboralId);
        if (!resGet.ok) {
            throw new Error("No se pudo obtener el puesto actual");
        }
        const puesto = await resGet.json();
        puesto.eliminado = !estadoActual; // Cambiar el estado de eliminado

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

        $('#todosLosPuestos').append(
            "<tr class='" + puestoDesactivado + "'>" +
                "<td>" + item.descripcion + "</td>" +
                "<td>" +
                    // Botón de edición
                    "<button class='btn btn-inverse-success mdi mdi-border-color' data-action='edit' style='" + botonEditarPuestoVisible + "' onclick=\"AbrirModalEditar(" + item.puestoLaboralId + ", '" + item.descripcion.replace(/'/g, "\\'") + "')\">" +
                    "</button>" +
                
                    // Botón de activación/desactivación
                    "<button class='' data-action='delete' style='background: none; border: none;' onclick=\"ToggleEliminado(" + item.puestoLaboralId + ", " + item.eliminado + ")\" title='" + (item.eliminado ? "Activar Puesto laboral" : "Desactivar Puesto laboral") + "'>" +
                        "<i class='btn btn-inverse-danger " + iconoPuestoHabilitado + "'></i>" +
                    "</button>" +
                "</td>" +
            "</tr>"
        );
    });
}


function AbrirModalEditar(puestoLaboralId, descripcion) {
    $('#modalCrearPuestos').modal('hide');
    limpiarBackdropBootstrap();
    setTimeout(function() {
        $("#DescripcionLaboral").val(descripcion);
        $("#PuestoLaboralId").val(puestoLaboralId);
        $('#modalCrearPuestos').modal('show');
    }, 300); // 300 ms de espera
}


function VaciarModal() {
    $("#DescripcionLaboral").val("");
    $("#PuestoLaboralId").val("");
    $('#modalCrearPuestos').modal('hide');
    $('#errorCrearPuesto').empty();
    limpiarBackdropBootstrap();
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
        VaciarModal();

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
            VaciarModal();
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