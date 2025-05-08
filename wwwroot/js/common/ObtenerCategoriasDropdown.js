function ObtenerCategoriasDropdown() {
    fetch('https://localhost:7065/api/categorias')
    .then(response => response.json())
    .then(data => CompletarDropdown(data))
    .catch(error => console.log("No se pudo acceder al servicio.", error));
}

function CompletarDropdown(data) {
    $("#CategoriaId").empty();
    $.each(data, function(index, item) {
        $('#CategoriaId').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })

    $("#CategoriaIdEditar").empty();
    $.each(data, function(index, item) {
        $('#CategoriaIdEditar').append(
            "<option value='"+ item.categoriaId + "'>" + item.descripcion + "</option>"            
        )
    })
}