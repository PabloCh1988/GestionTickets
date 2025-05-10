console.log("Archivo Categoria.js cargado correctamente.");

function CargarHtmlCategorias() {
    // console.log("CargarHtmlCategorias ejecutada.");
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

// ToggleEliminado actualizado para funcionar correctamente con el renderizado jQuery
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
        categoria.eliminado = !estadoActual;

        // Enviar el objeto completo actualizado
        const res = await fetch(`${API_URLCategoria}/${categoriaId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(categoria)
        });

        if (res.ok) {
            Swal.fire({
                title: "Estado actualizado",
                text: `La categoría ha sido ${categoria.eliminado ? "deshabilitada" : "habilitada"}.`,
                icon: "success",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1200
            });
            ObtenerCategorias();
        } else {
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
        let categoriaClass = item.eliminado ? "fila-desactivada" : ""; // Clase para categorías eliminadas
        let iconClass = item.eliminado ? "mdi mdi-close-box" : "mdi mdi-close"; // Ícono de habilitar/deshabilitar
        // let buttonColorClass = item.eliminado ? "btn-activado" : "btn-desactivado";
        let botonEditarVisible = item.eliminado ? "display: none;" : "";

        $('#todasLasCategorias').append(
            "<tr class='" + categoriaClass + "'>" +
                "<td>" + item.descripcion + "</td>" +
                "<td>" +
                    // Botón de edición
                    "<button class='btn btn-outline-success  mdi mdi-border-color' data-action='edit' style='" + botonEditarVisible + " onclick=\"AbrirModalEditar(" + item.categoriaId + ", '" + item.descripcion.replace(/'/g, "\\'") + "')\">" +
                    "</button>" +
                "</td>" +
                "<td>" +
                    // Botón de activación/desactivación
                    "<button class='" + "' data-action='delete' style='background: none; border: none;' onclick=\"ToggleEliminado(" + item.categoriaId + ", " + item.eliminado + ")\" title='" + (item.eliminado ? "Activar categoría" : "Desactivar categoría") + "'>" +
                        "<i class='btn btn-outline-danger " + iconClass + "'></i>" +
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
    let categoriaId = document.getElementById("CategoriaId").value;
    let descripcion = document.getElementById("Descripcion").value;


    let categoria = {
        descripcion: descripcion
    };

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

    if (crearCategoria.descripcion == "") {
        mensajesError('#errorCrear', null, "El campo Nombre es requerido.")
        return;
    } // Validar que la descripción no esté vacía

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
        alert("Error al crear: " + await res.text());
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
            headers: authHeaders(),
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


// function EliminarCategoria(categoriaId) {
// // Mostrar un mensaje de confirmación antes de eliminar la categoría
//     Swal.fire({
//         title: "Estas seguro de eliminar esta categoria?",
//         icon: 'warning',
//         background: '#000000',
//         color: '#f1f1f1',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Sí, eliminarla'
//       }).then((result) => {
//         if (result.isConfirmed) {
//             EliminarSi(categoriaId);
        
//         }
//       });
// }

// function EliminarSi(categoriaId) {
//     fetch(`${API_URLCategoria}/${categoriaId}`, {
//         method: "DELETE"
//     })
//         .then(() => {
//             Swal.fire({
//                 title: "Eliminado!",
//                 text: "La categoría ha sido eliminada.",
//                 icon: 'success',
//                 background: '#000000',
//                 color: '#f1f1f1',
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//             ObtenerCategorias();
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

// $.each(data, function (index, item) { // Recorremos cada categoría que vino desde la API.

//         let categoriaClass = item.eliminado ? "fila-desactivada" : ""; // Clase para categorías eliminadas.
//         let iconClass = item.eliminado ? "fas fa-toggle-on icono-activar" : "fas fa-toggle-off icono-activar"; // Ícono de habilitar/deshabilitar.
//         let buttonColorClass = item.eliminado ? "btn-activado" : "btn-desactivado"; // Clases para color de activación/desactivación.
//         let visibilityEditButton = item.eliminado ? "display: none;" : ""; // Ocultar botón de edición si está eliminado.

//         // Crear la fila de la categoría con descripción y los botones.
//         $('#todasLasCategorias').append(
//             "<tr class='" + categoriaClass + "'>" +
//                 "<td>" + item.descripcion + "</td>" + 
//                 "<td>" +
//                     // Botón de edición con solo el ícono, tamaño más grande y animación
//                     "<button class='btn btn-editar' data-action='edit' style='" + visibilityEditButton + " background: none; border: none;' onclick='MostrarModalEditarCategoria(" + item.id + ", \"" + item.descripcion + "\")' title='Editar categoría'>" +
//                         "<i class='fas fa-pencil-alt icono-editar'></i>" +
//                     "</button>" +
//                 "</td>" +
//                 "<td>" +
//                     // Botón de activación/desactivación con solo el ícono, tamaño más grande y animación
//                     "<button class='btn btn-activar " + buttonColorClass + "' data-action='delete' style='background: none; border: none;' onclick='EliminarCategoriaId(" + item.id + ", " + item.eliminado + ")' title='" + (item.eliminado ? "Activar categoría" : "Desactivar categoría") + "'>" +
//                         "<i class='" + iconClass + "'></i>" +
//                     "</button>" +
//                 "</td>" +
//             "</tr>"
//         );
//     });
