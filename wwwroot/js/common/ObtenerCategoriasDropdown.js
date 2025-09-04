async function ObtenerCategoriasDropdown() {

   const res = await authFetch("categorias");
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

    $("#CategoriasPorPuesto").empty();
    $.each(activo, function(index, item) {
        $('#CategoriasPorPuesto').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })
    $("#CategoriaIdBuscarC").empty();
    $.each(activo, function(index, item) {
        $('#CategoriaIdBuscarC').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })

}