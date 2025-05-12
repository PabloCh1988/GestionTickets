// Cargar el contenido del archivo HTML al cargar la página
function CargarHtmlCategorias() {
    fetch("categoria.html")
        .then(response => response.text()) // Obtener el contenido del archivo HTML
        .then(data => {
            document.getElementById("contenido").innerHTML = data; // Cargar el contenido del archivo HTML en el elemento con id "contenido"
            $('#modalCrearCategorias').modal('hide'); // Ocultar el modal al cargar la página
            ObtenerCategorias();
        })
        .catch(error => console.error("Error al cargar el archivo", error))
}

const API_URLCategoria = "https://localhost:7065/api/categorias";

const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
}); // Configurar los headers de autenticación

async function ObtenerCategorias() {
    const res = await fetch(API_URLCategoria, { headers: authHeaders() });
    const categorias = await res.json();
    renderizarCategoriasJQuery(categorias); // Usar el renderizado jQuery personalizado
}

// Función para eliminar una categoría y mostrar un mensaje de confirmación
async function ToggleEliminado(categoriaId, estadoActual) {
    try {
        // Obtener la categoría completa antes de actualizar
        const resGet = await fetch(`${API_URLCategoria}/${categoriaId}`, {
            headers: authHeaders()
        });
        if (!resGet.ok) {
            throw new Error("No se pudo obtener la categoría actual");
        }
        const categoria = await resGet.json();
        categoria.eliminado = !estadoActual; // Cambiar el estado de eliminado

        // Enviar el objeto completo actualizado
        const res = await fetch(`${API_URLCategoria}/${categoriaId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(categoria)
        });
        // Verificar si la respuesta fue exitosa
        if (res.ok) {
            Swal.fire({ // Mostrar mensaje de éxito
                title: "Estado actualizado",
                text: `La categoría ha sido ${categoria.eliminado ? "deshabilitada" : "habilitada"}.`,
                icon: "success",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1200
            });
            ObtenerCategorias(); // Actualizar la lista de categorías
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
        console.error("Error al actualizar el estado de la categoría:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al intentar actualizar el estado de la categoría.",
            icon: "error",
            background: '#000000',
            color: '#f1f1f1',
            confirmButtonText: "Aceptar"
        });
    }
}

// Renderiza las categorías usando jQuery y el estilo solicitado
function renderizarCategoriasJQuery(data) {
    $('#todasLasCategorias').empty();
    $.each(data, function (index, item) {
        let categoriaDesactivada = item.eliminado ? "fila-desactivada" : ""; // Clase para categorías eliminadas
        let iconoHabilitado = item.eliminado ? "mdi mdi-close-box" : "mdi mdi-close"; // Ícono de habilitar/deshabilitar
        let botonEditarVisible = item.eliminado ? "display: none;" : "";

        $('#todasLasCategorias').append(
            "<tr class='" + categoriaDesactivada + "'>" +
                "<td>" + item.categoriaId + "</td>" +
                "<td>" + item.descripcion + "</td>" +
                "<td>" +
                    // Botón de edición
                    "<button class='btn btn-outline-success mdi mdi-border-color' data-action='edit' style='" + botonEditarVisible + "' onclick=\"AbrirModalEditar(" + item.categoriaId + ", '" + item.descripcion.replace(/'/g, "\\'") + "')\">" +
                    "</button>" +
                "</td>" +
                "<td>" +
                    // Botón de activación/desactivación
                    "<button class='' data-action='delete' style='background: none; border: none;' onclick=\"ToggleEliminado(" + item.categoriaId + ", " + item.eliminado + ")\" title='" + (item.eliminado ? "Activar categoría" : "Desactivar categoría") + "'>" +
                        "<i class='btn btn-outline-danger " + iconoHabilitado + "'></i>" +
                    "</button>" +
                "</td>" +
            "</tr>"
        );
    });
}


function AbrirModalEditar(categoriaId, descripcion) {
    $("#Descripcion").val(descripcion); //Asignar el valor de la descripción al input del modal
    $("#CategoriaId").val(categoriaId); //Asignar el valor del ID al input del modal
    $('#modalCrearCategorias').modal('show'); //Mostrar el modal
}


function VaciarModal() {
    $("#Descripcion").val("");
    $("#CategoriaId").val("");
    $('#modalCrearCategorias').modal('hide');
    $('#errorCrear').empty();
}

function GuardarCategoria() {
    let categoriaId = document.getElementById("CategoriaId").value; // Obtener el ID de la categoría
    let descripcion = document.getElementById("Descripcion").value; // Obtener el valor de la descripción

    // Crear un objeto con la descripción
    let categoria = {
        descripcion: descripcion
    };
    // Validar que la descripción no esté vacía
    if (descripcion.descripcion == "") {
        mensajesError('#errorCrear', null, "El campo Descripcion es requerido.")
        return;
    }

    if (categoriaId) { // Si categoriaId tiene un valor, actualiza
        EditarCategorias(categoriaId, categoria); // Actualizar la categoría
    } else { // Si no tiene valor, crea una nueva categoría
        CrearCategorias();
    }
}

async function CrearCategorias() {
    const crearCategoria = {
        descripcion: document.getElementById("Descripcion").value
    }; // Crear un objeto con la descripción
    // Validar que la descripción no esté vacía
    if (crearCategoria.descripcion == "") {
        mensajesError('#errorCrear', null, "El campo Nombre es requerido.")
        return;
    } 

    const res = await fetch(API_URLCategoria, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(crearCategoria)
    }); // Realizar la petición a la API

    if (res.ok) {
        document.getElementById("Descripcion").value = ""; // Limpiar el campo de descripción
        document.getElementById("CategoriaId").value = 0;
        $('#errorCrear').empty(); // Limpiar los mensajes de error
        ObtenerCategorias();
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
        // alert("Error al crear: " + await res.text());
        const errorText = await res.text();
            mensajesError('#errorCrear', null, `Error al crear: ${errorText}`);
    }
}

async function EditarCategorias(categoriaId) {
    // Obtener los valores del formulario
    const descripcion = document.getElementById("Descripcion").value.trim();

    // Validar que la descripción no esté vacía
    if (!descripcion) {
        mensajesError('#errorCrear', null, "El campo Descripción es requerido.");
        return;
    }

    // Crear el objeto con los datos de la categoría
    const editarCategoria = {
        categoriaId: categoriaId, // Usar el ID pasado como argumento
        descripcion: descripcion
    };

    try {
        // Realizar la solicitud PUT a la API
        const res = await fetch(`${API_URLCategoria}/${categoriaId}`, {
            method: "PUT",
            headers: authHeaders(), //
            body: JSON.stringify(editarCategoria)
        });

        if (res.ok) {
            // Si la solicitud fue exitosa, limpiar el modal y actualizar la lista
            VaciarModal();
            ObtenerCategorias();
        } else {
            // Si la solicitud falla, mostrar el mensaje de error devuelto por el servidor
            const errorText = await res.text();
            mensajesError('#errorCrear', null, `Error al actualizar: ${errorText}`);
        }
    } catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error al actualizar la categoría:", error);
        mensajesError('#errorCrear', null, "Ocurrió un error al intentar actualizar la categoría.");
    }
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