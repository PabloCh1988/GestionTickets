async function ObtenerClientes() {
    const res = await authFetch("clientess");
    const clientes = await res.json();
    $('#todosLosClientes').empty();
    clientes.forEach(cliente => {
        let clienteDesactivado = cliente.eliminado ? "fila-desactivada" : ""; // Clase para clientes eliminados
        let iconoHabilitado = cliente.eliminado ? "mdi mdi-close-box" : "mdi mdi-close"; // Ícono de habilitar/deshabilitar
        let botonEditarVisible = cliente.eliminado ? "display: none;" : "";

        $('#todosLosClientes').append(
            "<tr class='" + clienteDesactivado + "'>" +
            "<td>" + cliente.nombre + "</td>" +
            "<td>" + cliente.dni + "</td>" +
            "<td>" + cliente.email + "</td>" +
            "<td>" + cliente.telefono + "</td>" +
            "<td>" + cliente.observaciones + "</td>" +
            "<td>" +
            // Botón de edición
            "<button class='btn btn-inverse-success mdi mdi-border-color' data-action='edit' style='" + botonEditarVisible + "' onclick=\"BuscarClientesId(" + cliente.clienteId + ")\">" + "</button>" + 
            // Botón de activación/desactivación
            "<button class='' data-action='delete' style='background: none; border: none;' onclick=\"EliminarCliente(" + cliente.clienteId + ", " + cliente.eliminado + ")\" title='" + (cliente.eliminado ? "Activar cliente" : "Desactivar cliente") + "'>" +
            "<i class='btn btn-inverse-danger " + iconoHabilitado + "'></i>" +
            "</button>" +
            "</td>" +
            "</tr>"
        );
    });
}


function VaciarModalClientes() {
    $("#Nombre").val("");
    $("#Email").val("");
    $("#Telefono").val("");
    $("#Observaciones").val("");
    $("#ClienteId").val(0); // Reiniciar el ID del cliente
    $('#errorCrear').empty(); // Limpiar los mensajes de error
    $('#errorEditar').empty(); // Limpiar los mensajes de error
    $('#modalCrearClientes').modal('hide'); // Ocultar el modal
    $('#modalEditarClientes').modal('hide'); // Ocultar el modal de edición
    limpiarBackdropBootstrap(); // Limpiar el backdrop de Bootstrap

}

async function CrearCliente() {
    const crearCliente = {
        nombre: document.getElementById("Nombre").value.trim(),
        dni: document.getElementById("Dni").value.trim(),
        email: document.getElementById("Email").value.trim(),
        telefono: document.getElementById("Telefono").value.trim(),
        observaciones: document.getElementById("Observaciones").value.trim()
    }; // Crear un objeto con la descripción
    // Validar que ingrese un nombre
    if (crearCliente.nombre == "" || crearCliente.dni == "" || crearCliente.email == "") {
        mensajesError('#errorCrear', null, "El Nombre, el DNI y el Email son requeridos.")
        return;
    }
    if (crearCliente.dni.length !== 8) {
    mensajesError('#errorCrear', null, "El DNI debe tener 8 dígitos.");
    return;
}

    const res = await authFetch(`clientess`, {
        method: "POST",
        body: JSON.stringify(crearCliente)
    }); // Realizar la petición a la API

    if (res.ok) {
        document.getElementById("ClienteId").value = 0; // Reiniciar el ID del cliente
        document.getElementById("Nombre").value = ""; // Limpiar el campo Nombre
        document.getElementById("Dni").value = ""; // Limpiar el campo DNI
        document.getElementById("Email").value = "";
        document.getElementById("Telefono").value = "";
        document.getElementById("Observaciones").value = "";
        $('#errorCrear').empty(); // Limpiar los mensajes de error
        ObtenerClientes();
        $('#modalCrearClientes').modal('hide'); // Ocultar el modal de creación
        limpiarBackdropBootstrap();
        VaciarModalClientes();

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Cliente creado",
            background: '#000000',
            color: '#f1f1f1',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        const errorText = await res.text();
        mensajesError('#errorCrear', null, `Error al crear: ${errorText}`);
    }
}
function BuscarClientesId(clienteId) {

    authFetch(`clientess/` + clienteId, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Llenar los campos del modal de edición con los datos del cliente
                document.getElementById("ClienteId").value = data.clienteId;
                document.getElementById("NombreEditar").value = data.nombre;
                document.getElementById("DniEditar").value = data.dni;
                document.getElementById("EmailEditar").value = data.email;
                document.getElementById("TelefonoEditar").value = data.telefono;
                document.getElementById("ObservacionesEditar").value = data.observaciones;
                $('#modalEditarClientes').modal('show'); // Mostrar el modal de edición
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No encontrado',
                    text: 'No se encontró el cliente con el ID proporcionado.',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error("Error al buscar el cliente:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al buscar el cliente.',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: 'Aceptar'
            });
        });
}
async function EditarCliente() {
    // const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    // const authHeaders = () => ({
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${getToken()}`
    // }); // Configurar los headers de autenticación
    const clienteId = document.getElementById("ClienteId").value; // Obtener el ID del cliente desde el input
    const nombre = document.getElementById("NombreEditar").value.trim();
    const dni = document.getElementById("DniEditar").value;
    const email = document.getElementById("EmailEditar").value;
    const telefono = document.getElementById("TelefonoEditar").value;
    const observaciones = document.getElementById("ObservacionesEditar").value;

    const editarCliente = {
        clienteId: parseInt(clienteId),
        nombre: nombre,
        dni: dni,
        email: email,
        telefono: telefono,
        observaciones: observaciones
    };
    if (!nombre.trim() || !dni || dni == 0) {
        mensajesError('#errorEditar', null, "Por favor ingrese Nombre y Dni.");
        return;
    }
    if (dni.length !== 8) {
    mensajesError('#errorEditar', null, "El DNI debe tener 8 digitos.");
    return;
}

    try {
        const res = await authFetch(`clientess/` + clienteId, {
            method: "PUT",
            body: JSON.stringify(editarCliente)
        });
        if (res.ok) {
            $('#modalEditarClientes').modal('hide'); // Cierra el modal
            ObtenerClientes(); // Actualiza la lista de clientes
            VaciarModalClientes(); // Limpia el modal
            // Mostrar mensaje de éxito
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Cliente actualizado",
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
        console.error("Error al actualizar el cliente:", error);
        mensajesError('#errorEditar', null, "Ocurrió un error al intentar actualizar el cliente.");
    }
}

async function EliminarCliente(clienteId, estadoActual) {
    // const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    // const authHeaders = () => ({
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${getToken()}`
    // }); // Configurar los headers de autenticación

    try {
        // Obtener el cliente antes de actualizar
        const resGet = await authFetch(`clientess/` + clienteId);
        if (!resGet.ok) {
            throw new Error("No se pudo obtener el cliente actual");
        }
        const cliente = await resGet.json(); // HACE UN GET PARA BUSCAR LOS CLIENTES POR ID
        cliente.eliminado = !estadoActual; // Cambiar el estado de eliminado

        // Enviar el objeto completo actualizado
        const res = await authFetch(`clientess/` + clienteId, {
            method: "PUT",
            body: JSON.stringify(cliente)
        });
        // Verificar si la respuesta fue exitosa
        if (res.ok) {
            Swal.fire({ // Mostrar mensaje de éxito
                title: "Estado actualizado",
                text: `El cliente ha sido ${cliente.eliminado ? "deshabilitado" : "habilitado"}.`,
                icon: "success",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1200
            });
            ObtenerClientes(); // Actualizar la lista de cliente
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
        console.error("Error al actualizar el estado del cliente:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al intentar actualizar el estado del cliente.",
            icon: "error",
            background: '#000000',
            color: '#f1f1f1',
            confirmButtonText: "Aceptar"
        });
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

function limpiarBackdropBootstrap() {
    // Elimina cualquier backdrop de Bootstrap que haya quedado
    $('.modal-backdrop').remove();
    // Elimina la clase modal-open del body si quedó
    $('body').removeClass('modal-open');
    // Elimina el estilo de padding del body
    $('body').css('padding-right', '');
}

function ImprimirInformePdf() {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    // Títulos de columnas
    const columns = [
        "Nombre", "D.N.I.", "Email", "Teléfono", "Observaciones"
    ];

    // Obtén las filas visibles del tbody, filtrando solo las que NO están eliminadas
    const tbody = document.getElementById("todosLosClientes");
    const rows = Array.from(tbody.querySelectorAll("tr"))
        .filter(tr => !tr.classList.contains("fila-desactivada"));

    // Extrae los datos de cada fila
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
    doc.text("Listado de Clientes", 14, 30);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    // Genera la tabla
    doc.autoTable({
        head: [columns],
        body: data,
        startY: 40,
        styles: { fontSize: 9 }
    });

    doc.save("Listado_Clientes.pdf");
}