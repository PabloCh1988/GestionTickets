async function ObtenerClientesDropdown(){
        const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación
    const res = await fetch('https://localhost:7065/api/clientess', { headers: authHeaders() });
    const clientes = await res.json();
    CompletarClientesDropdown(clientes); // Usar el renderizado jQuery personalizado
}

function CompletarClientesDropdown(data) {
    const activo = data.filter(item => item.eliminado === false  || item.eliminado == null);
    $("#ClienteId").empty();
    $.each(activo, function(index, item) {
        $('#ClienteId').append(
            "<option value='"+ item.clienteId + "'>" + item.nombre + "</option>"            
        )
    })

    $("#ClienteIdEditar").empty();
    $.each(activo, function(index, item) {
        $('#ClienteIdEditar').append(
            "<option value='"+ item.clienteId + "'>" + item.nombre + "</option>"            
        )
    })

    $("#ClienteIdBuscar").empty();
    $.each(activo, function(index, item) {
        $('#ClienteIdBuscar').append(
            "<option value='"+ item.clienteId + "'>" + item.nombre + "</option>"            
        )
    })
    
}