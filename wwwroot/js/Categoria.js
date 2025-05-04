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
    const res = await fetch(API_URLCategoria); //Realizar la petición a la API
    const categorias = await res.json(); //Convertir la respuesta a JSON
    const tbody = document.querySelector("#categorias tbody"); //Seleccionar el tbody de la tabla
    tbody.innerHTML = ""; //Limpiar el contenido del tbody

    categorias.forEach(cat => { //Recorrer cada categoría y crear una fila en la tabla
        const row = document.createElement("tr"); //Crear una nueva fila
        //Agregar el contenido de la fila con los datos de la categoría

        row.innerHTML = ` 
            <td>${cat.categoriaId}</td>
            <td>${cat.descripcion}</td>
            <td><button class="btn btn-outline-success" onclick="AbrirModalEditar(${cat.categoriaId}, '${cat.descripcion}')">Editar</button></td>
            <td><button class="btn btn-outline-danger" onclick="EliminarCategoria(${cat.categoriaId})">Eliminar</button></td>
        `;
        tbody.appendChild(row); //Agregar la fila al tbody
    });
}

function AbrirModalEditar(categoriaId, descripcion) {
    $("#Descripcion").val(descripcion); //Asignar el valor de la descripción al input del modal
    $("#CategoriaId").val(categoriaId); //Asignar el valor del ID al input del modal
    $('#modalCrearCategorias').modal('show'); //Mostrar el modal
}

// function ObtenerCategorias() {
//     fetch(API_URLCategoria)
//         .then(response => response.json())
//         .then(data => MostrarCategorias(data))
//         .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
// }

// function MostrarCategorias(data) {
//     $("#categorias").empty();
//     $.each(data, function (i, item) {
//         $("#categorias").append(`
//             <tr>
//                 <td>${item.categoriaId}</td>
//                 <td>${item.descripcion}</td>
//                 <td><button class="btn btn-outline-success" onclick="EditarCategoria(${item.categoriaId})">Editar</button></td>
//                 <td><button class="btn btn-outline-danger" onclick="EliminarCategoria(${item.categoriaId})">Eliminar</button></td>
//             </tr>`);
//     });
// }

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
    } else {
        alert("Error al crear: " + await res.text());
    }
}

async function EditarCategorias(categoriaId) {
    let idCategoria = document.getElementById("CategoriaId").value;
    let editarCategoria = {
        categoriaId: idCategoria,
        descripcion: document.getElementById("Descripcion").value
    } // Crear un objeto con la descripción y el ID de la categoría

    if (editarCategoria.descripcion == "") {
        mensajesError('#errorCrear', null, "El campo Nombre es requerido.")
        return;
    } // Validar que la descripción no esté vacía

    const res = await fetch(`${API_URLCategoria}/${categoriaId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(editarCategoria)
    })  // Realizar la petición a la API
        .then(response => response.json) // // Convertir la respuesta a JSON
    .then(response => {
            if (response.codigo != 1) {
                document.getElementById("errorCategoria").textContent = response.mensaje;
                alert("Error al actualizar: " +  res.text()); // Mostrar mensaje de error
            }
            else {
                document.getElementById("CategoriaId").value = 0; // Limpiar el campo de ID
                document.getElementById("Descripcion").value = ""; // Limpiar el campo de descripción
                $('#errorCrear').empty(); // Limpiar los mensajes de error
                ObtenerCategorias();
                VaciarModal();
            }
        })
    // if (res.ok) {
    //     document.getElementById("CategoriaId").value = 0; // Limpiar el campo de ID
    //     document.getElementById("Descripcion").value = ""; // Limpiar el campo de descripción
    //     $('#errorCrear').empty(); // Limpiar los mensajes de error
    //     ObtenerCategorias();
    //     VaciarModal();
    // } else {
    //     alert("Error al actualizar: " + await res.text()); // Mostrar mensaje de error
    // }
}

// function GuardarCategoria() {
//     let categoriaId = document.getElementById("CategoriaId").value;
//     let descripcion = document.getElementById("Descripcion").value;


//     let categoria = {
//         descripcion: descripcion
//     };

//     if (categoriaId) { // Si categoriaId tiene un valor, actualiza
//         GuardarCategoriaActualizada(categoriaId, categoria);
//     } else { // Si no tiene valor, crea una nueva categoría
//         CrearCategoria();
//     }
// }

// function CrearCategoria() {
//     let crearCategoria = {
//         descripcion: document.getElementById("Descripcion").value,
//     }
//     if (crearCategoria.descripcion == "") {
//         mensajesError('#errorCrear', null, "El campo Descripcion es requerido.")
//         return;
//     }
//     fetch(API_URLCategoria, {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(crearCategoria)
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.status == undefined || data.status == 204) {
//                 VaciarModal();
//                 ObtenerCategorias();
//             } else {
//                 mensajesError('#errorCrear', data);
//             }
//         })
//         .catch(error => console.error("No se pudo acceder a la API, verifique el mensaje de error: ", error));
// }

// function EditarCategoria(categoriaId) {
//     fetch(`${API_URLCategoria}/${categoriaId}`)
//         .then(response => response.json())
//         .then(data => {
//             $("#Descripcion").val(data.descripcion);
//             $("#CategoriaId").val(data.categoriaId);
//             $('#modalCrearCategorias').modal('show');
//         })
//         .catch(error => console.error("No se pudo acceder a la API, verifique el mensaje de error: ", error));
// }

// function GuardarCategoriaActualizada(categoriaId, categoria) {
//     fetch(`${API_URLCategoria}/${categoriaId}`, {
//         method: "PUT",
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(categoria)
//     })

//         .then(response => response.json())
//         .then(data => {
//             if (data.status == undefined || data.status == 204) {
//                 document.getElementById("CategoriaId").value = 0;
//                 document.getElementById("Descripcion").value = "";
//                 VaciarModal();
//                 ObtenerCategorias();
//             } else {
//                 mensajesError('#errorCrear', data);
//             }
//         })
//         .catch(error => console.error("No se pudo acceder a la API, verifique el mensaje de error: ", error));
// }

function EliminarCategoria(categoriaId) {
    let siElimina = confirm("¿Está seguro de eliminar esta categoría?.")
    if (siElimina == true) {
        EliminarSi(categoriaId);
    }
}

function EliminarSi(categoriaId) {
    fetch(`${API_URLCategoria}/${categoriaId}`, {
        method: "DELETE"
    })
        .then(() => {
            ObtenerCategorias();
        })
        .catch(error => console.error("No se pudo acceder a la api, verifique el mensaje de error: ", error))
}

// function ActualizarCategoria(categoriaId) {
//     fetch(`${API_URLCategoria}/${categoriaId}`)
//         .then(response => response.json())
//         .then(data => {
//             $("#Descripcion").val(data.descripcion);
//             $("#categoriaId").val(data.categoriaId);
//             $('#modalCrearCategorias').modal('show');
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