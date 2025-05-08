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
    const tbody = document.querySelector("#categorias tbody"); // Seleccionar el tbody de la tabla
    if (!tbody) {
        console.error("El elemento <tbody> no existe en el DOM.");
        return;
    }

    const res = await fetch(API_URLCategoria); // Realizar la petición a la API
    const categorias = await res.json(); // Convertir la respuesta a JSON
    tbody.innerHTML = ""; // Limpiar el contenido del tbody

    categorias.forEach(cat => { // Recorrer cada categoría y crear una fila en la tabla
        const row = document.createElement("tr"); // Crear una nueva fila
        row.innerHTML = `
            <td>${cat.categoriaId}</td>
            <td>${cat.descripcion}</td>
            <td><button class="btn btn-outline-success" onclick="AbrirModalEditar(${cat.categoriaId}, '${cat.descripcion}')">Editar</button></td>
            <td><button class="btn btn-outline-danger" onclick="EliminarCategoria(${cat.categoriaId})">Eliminar</button></td>
        `;
        tbody.appendChild(row); // Agregar la fila al tbody
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


function EliminarCategoria(categoriaId) {
// Mostrar un mensaje de confirmación antes de eliminar la categoría
    Swal.fire({
        title: "Estas seguro de eliminar esta categoria?",
        icon: 'warning',
        background: '#000000',
        color: '#f1f1f1',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarla'
      }).then((result) => {
        if (result.isConfirmed) {
            EliminarSi(categoriaId);
        
        }
      });
}

function EliminarSi(categoriaId) {
    fetch(`${API_URLCategoria}/${categoriaId}`, {
        method: "DELETE"
    })
        .then(() => {
            Swal.fire({
                title: "Eliminado!",
                text: "La categoría ha sido eliminada.",
                icon: 'success',
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
            });
            ObtenerCategorias();
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