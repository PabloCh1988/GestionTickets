async function ObtenerDesarrolladores() {
    const res = await authFetch("desarrolladores");
    const desarrolladores = await res.json();
    $('#todosLosDesarrolladores').empty();
    desarrolladores.forEach(desarrollador => {
        let desarrolloDesactivado = desarrollador.eliminado ? "fila-desactivada" : ""; // Clase para clientes eliminados
        let iconoDesHabilitado = desarrollador.eliminado ? "mdi mdi-close-box" : "mdi mdi-close"; // Ícono de habilitar/deshabilitar
        let botonEditarDesVisible = desarrollador.eliminado ? "display: none;" : "";

        $('#todosLosDesarrolladores').append(
            "<tr class='" + desarrolloDesactivado + "'>" +
            "<td>" + desarrollador.nombre + "</td>" +
            "<td>" + desarrollador.dni + "</td>" +
            "<td>" + desarrollador.email + "</td>" +
            "<td>" + desarrollador.telefono + "</td>" +
            "<td>" + desarrollador.observaciones + "</td>" +
            "<td>" + (desarrollador.puestoLaboralDescripcion ?? "") + "</td>" +
            "<td>" +
            // Botón de edición
            "<button class='btn btn-inverse-success mdi mdi-border-color' title='Editar' data-action='edit' style='" + botonEditarDesVisible + "' onclick=\"BuscarDesarrolladorId(" + desarrollador.desarrolladorId + ")\">" + "</button>" + 
            // Botón de activación/desactivación
            "<button class='' data-action='delete' style='background: none; border: none;' onclick=\"EliminarDesarrollador(" + desarrollador.desarrolladorId + ", " + desarrollador.eliminado + ")\" title='" + (desarrollador.eliminado ? "Activar desarrollador" : "Desactivar desarrollador") + "'>" +
            "<i class='btn btn-inverse-danger " + iconoDesHabilitado + "'></i>" +
            "</button>" +
            "</td>" +
            "</tr>"
        );
    });
}




function VaciarModalDesarrollo() {
    $("#NombreDesarrollador").val("");
    $("#DniDesarrollador").val("");
    $("#EmailDesarrollador").val("");
    $("#TelefonoDesarrollador").val("");
    $("#ObservacionesDesarrollador").val("");
    $("#DesarrolladorId").val(0); // Reiniciar el ID del cliente
    $('#errorCrearDesarrollador').empty(); // Limpiar los mensajes de error
    $('#errorEditarDesarrollador').empty(); // Limpiar los mensajes de error
    $('#modalCrearDesarrollador').modal('hide'); // Ocultar el modal
    $('#modalEditarDesarrollador').modal('hide'); // Ocultar el modal de edición
    limpiarBackdropBootstrap(); // Limpiar el backdrop de Bootstrap

}


async function comboPuestosCrear(selectedId = null) {
    try {
        const res = await authFetch("puestoslaborales");
        if (!res.ok) {
            console.error("Error al obtener puestos laborales. Código:", res.status);
            return;
        }

        const puestos = await res.json();

        const combo = document.getElementById("PuestoLaboral");
        if (!combo) {
            console.error("❌ No se encontró el select con id='PuestoLaboral'");
            return;
        }

        combo.innerHTML = "<option value=''>Seleccione un puesto</option>";
        puestos.forEach(puesto => {
            const id = puesto.puestoLaboralId; // Ajustá esta línea según el nombre real
            const desc = puesto.descripcion;
            combo.innerHTML += `<option value="${id}" ${id == selectedId ? "selected" : ""}>${desc}</option>`;
        });

    } catch (error) {
        console.error("Error en comboPuestosCrear:", error);
    }
}

async function CrearDesarrollador() {
const puestoLaboralId = document.getElementById("PuestoLaboral").value;

const crearDesarrollador = {
    nombre: document.getElementById("NombreDesarrollador").value.trim(),
    dni: document.getElementById("DniDesarrollador").value.trim(),
    email: document.getElementById("EmailDesarrollador").value.trim(),
    telefono: document.getElementById("TelefonoDesarrollador").value.trim(),
    observaciones: document.getElementById("ObservacionesDesarrollador").value.trim(),
    puestoLaboralId: puestoLaboralId ? parseInt(puestoLaboralId) : null
};

    // Validar que ingrese un nombre
    if (crearDesarrollador.nombre == "" || crearDesarrollador.dni == "" || crearDesarrollador.email == "") {
        mensajesError('#errorCrearDesarrollador', null, "El Nombre, el DNI y el Email son requeridos.")
        return;
    }
    if (crearDesarrollador.dni.length !== 8) {
    mensajesError('#errorCrearDesarrollador', null, "El DNI debe tener 8 dígitos.");
    return;
}

    const res = await authFetch(`desarrolladores`, {
        method: "POST",
        body: JSON.stringify(crearDesarrollador)
    }); // Realizar la petición a la API

    if (res.ok) {
        document.getElementById("DesarrolladorId").value = 0; // Reiniciar el ID del cliente
        document.getElementById("NombreDesarrollador").value = ""; // Limpiar el campo Nombre
        document.getElementById("DniDesarrollador").value = ""; // Limpiar el campo DNI
        document.getElementById("EmailDesarrollador").value = "";
        document.getElementById("TelefonoDesarrollador").value = "";
        document.getElementById("ObservacionesDesarrollador").value = "";
        comboPuestosCrear(); // Llenar el combo de puestos laborales
        // document.getElementById("PuestoLaboral").value = ""; // Limpiar el campo Puesto Laboral
        // Reiniciar el modal de creación
        $('#errorCrearDesarrollador').empty(); // Limpiar los mensajes de error
        ObtenerDesarrolladores();
        $('#modalCrearDesarrollador').modal('hide'); // Ocultar el modal de creación
        limpiarBackdropBootstrap();
        VaciarModalDesarrollo();

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Desarrollador creado",
            background: '#000000',
            color: '#f1f1f1',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        const errorText = await res.text();
        mensajesError('#errorCrearDesarrollador', null, `Error al crear: ${errorText}`);
    }
}

async function comboPuestosEditar(selectedId = null) {
    const res = await authFetch("puestoslaborales");
    const puestos = await res.json();
    const combo = document.getElementById("PuestoLaboralEditar");
    if (!combo) return;
    combo.innerHTML = "<option value=''>Seleccione un puesto</option>";
    puestos.forEach(puesto => {
        const id = puesto.puestoLaboralId;
        const desc = puesto.descripcion;
        combo.innerHTML += `<option value="${id}" ${id == selectedId ? "selected" : ""}>${desc}</option>`;
    });
}

function BuscarDesarrolladorId(desarrolladorId) {
    authFetch(`desarrolladores/` + desarrolladorId, {
        method: "GET",
    })
        .then(response => response.json())
        .then(async data => {
            if (data) {
                document.getElementById("DesarrolladorId").value = data.desarrolladorId;
                document.getElementById("NombreEditarDesarrollador").value = data.nombre;
                document.getElementById("DniEditarDesarrollador").value = data.dni;
                document.getElementById("EmailEditarDesarrollador").value = data.email;
                document.getElementById("TelefonoEditarDesarrollador").value = data.telefono;
                document.getElementById("ObservacionesEditarDesarrollador").value = data.observaciones;
                await comboPuestosEditar(data.puestoLaboralId); // <-- Llenar el combo y seleccionar el valor
                var modal = new bootstrap.Modal(document.getElementById('modalEditarDesarrollador'));
                modal.show();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No encontrado',
                    text: 'No se encontró el desarrollador con el ID proporcionado.',
                    background: '#000000',
                    color: '#f1f1f1',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error("Error al buscar el desarrollador:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al buscar el desarrollador.',
                background: '#000000',
                color: '#f1f1f1',
                confirmButtonText: 'Aceptar'
            });
        });
}

async function EditarDesarrollador() {
    const desarrolladorId = document.getElementById("DesarrolladorId").value; // Obtener el ID del cliente desde el input
    const nombre = document.getElementById("NombreEditarDesarrollador").value.trim();
    const dni = document.getElementById("DniEditarDesarrollador").value;
    const email = document.getElementById("EmailEditarDesarrollador").value;
    const telefono = document.getElementById("TelefonoEditarDesarrollador").value;
    const observaciones = document.getElementById("ObservacionesEditarDesarrollador").value;
    const puestoLaboralId = document.getElementById("PuestoLaboralEditar").value; // Asumiendo que tienes un select para el puesto laboral

    const editarDesarrollador = {
        desarrolladorId: parseInt(desarrolladorId),
        nombre: nombre,
        dni: dni,
        email: email,
        telefono: telefono,
        observaciones: observaciones,
        puestoLaboralId: puestoLaboralId

    };
    if (!nombre.trim() || !dni || dni == 0) {
        mensajesError('#modalEditarDesarrollador', null, "Por favor ingrese Nombre y Dni.");
        return;
    }
    if (dni.length !== 8) {
    mensajesError('#modalEditarDesarrollador', null, "El DNI debe tener 8 digitos.");
    return;
}

    try {
        const res = await authFetch(`desarrolladores/` + desarrolladorId, {
            method: "PUT",
            body: JSON.stringify(editarDesarrollador)
        });
        if (res.ok) {
            $('#modalEditarDesarrollador').modal('hide'); // Cierra el modal
            ObtenerDesarrolladores(); // Actualiza la lista de clientes
            VaciarModalDesarrollo(); // Limpia el modal
            // Mostrar mensaje de éxito
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Desarrollador actualizado",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            const errorText = await res.text();
            mensajesError('#modalEditarDesarrollador', null, `Error al actualizar: ${errorText}`);
        };
    }
    catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error al actualizar el desarrollador:", error);
        mensajesError('#modalEditarDesarrollador', null, "Ocurrió un error al intentar actualizar el desarrollador.");
    }
}

async function EliminarDesarrollador(desarrolladorId, estadoActual) {


    try {
        // Obtener el cliente antes de actualizar
        const resGet = await authFetch(`desarrolladores/` + desarrolladorId);
        if (!resGet.ok) {
            throw new Error("No se pudo obtener el desarrollador actual");
        }
        const desarrollador = await resGet.json(); // HACE UN GET PARA BUSCAR LOS CLIENTES POR ID
        desarrollador.eliminado = !estadoActual; // Cambiar el estado de eliminado

        // Enviar el objeto completo actualizado
        const res = await authFetch(`desarrolladores/` + desarrolladorId, {
            method: "PUT",
            body: JSON.stringify(desarrollador)
        });
        // Verificar si la respuesta fue exitosa
        if (res.ok) {
            Swal.fire({ // Mostrar mensaje de éxito
                title: "Estado actualizado",
                text: `El desarrollador ha sido ${desarrollador.eliminado ? "deshabilitado" : "habilitado"}.`,
                icon: "success",
                background: '#000000',
                color: '#f1f1f1',
                showConfirmButton: false,
                timer: 1200
            });
            ObtenerDesarrolladores(); // Actualizar la lista de cliente
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
        console.error("Error al actualizar el estado del desarrollador:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error al intentar actualizar el estado del desarrollador.",
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

// Llenar el combo cada vez que se muestra el modal de crear desarrollador


// Llama a esto DESPUÉS de que el contenido HTML haya sido cargado con cargarVistaPorHash
function inicializarEventosDesarrollador() {
    const btn = document.getElementById("btnNuevoDesarrollador");
    if (btn) {
        btn.addEventListener("click", function () {
            comboPuestosCrear().then(() => {
                const modal = new bootstrap.Modal(document.getElementById('modalCrearDesarrollador'));
                modal.show();
            });
        });
    }
}


