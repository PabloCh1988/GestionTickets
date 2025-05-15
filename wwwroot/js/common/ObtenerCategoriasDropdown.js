async function ObtenerCategoriasDropdown() {
        const getToken = () => localStorage.getItem("token"); // Obtener el token del localStorage

    const authHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }); // Configurar los headers de autenticación

   const res = await fetch('https://localhost:7065/api/categorias', { headers: authHeaders() });
   const catDropdown = await res.json();
   CompletarDropdown(catDropdown); // Usar el renderizado jQuery personalizado
   }


function CompletarDropdown(data) {
    const activo = data.filter(item => item.eliminado === false  || item.eliminado == null);
    $("#CategoriaId").empty();
    $.each(activo, function(index, item) {
        $('#CategoriaId').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })

    $("#CategoriaIdEditar").empty();
    $.each(activo, function(index, item) {
        $('#CategoriaIdEditar').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })
}