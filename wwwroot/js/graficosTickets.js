let graficoCircularCategorias;

const inputPrioridad = document.getElementById("PrioridadIdBuscar");
inputPrioridad.onchange = function () {
     graficoCircularCategorias.destroy();
    armarGrafico();
};

const inputEstado = document.getElementById("EstadoIdBuscar");
inputEstado.onchange = function () {
     graficoCircularCategorias.destroy();
    armarGrafico();
};

const inputFechaDesde = document.getElementById("FechaInicioBuscar");
inputFechaDesde.onchange = function () {
     graficoCircularCategorias.destroy();
    armarGrafico();
};

const inputFechaHasta = document.getElementById("FechaFinBuscar");
inputFechaHasta.onchange = function () {
     graficoCircularCategorias.destroy();
    armarGrafico();
};


async function armarGrafico() {
    //const res = await authFetch("tickets");

    if (graficoCircularCategorias){
        graficoCircularCategorias.destroy();
    }

    let fechaDesde = document.getElementById("FechaInicioBuscar").value;
    let fechaHasta = document.getElementById("FechaFinBuscar").value;

    // Convertir a objetos Date
    const fecha1 = new Date(fechaDesde);
    const fecha2 = new Date(fechaHasta);

    // Comparar
    if (fecha1 > fecha2) {
        //console.log("Fecha 1 es mayor que Fecha 2");
        fechaHasta = fechaDesde;
        document.getElementById("FechaFinBuscar").value = fechaDesde;
    }

    const filtros = {
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        categoriaID: 0,
        prioridad: document.getElementById("PrioridadIdBuscar").value,
        estado: document.getElementById("EstadoIdBuscar").value
    };

    const res = await authFetch(`tickets/grafico`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filtros)
    });

    const categorias = await res.json();
    console.log(categorias);
    var labels = [];
    var data = [];
    var fondo = [];

    categorias.forEach(categoria => {
        labels.push(categoria.nombre);
        var color = generarColorAzul();
        fondo.push(color);
        data.push(categoria.cantidad);
    });

    //BUSCAR Y GUARDAR EN UNA VARIABLE EL ELEMENTO DONDE SE VA A DIBUJAR EL GRAFICO
    var ctxPie = document.getElementById("grafico-circular");

    //LUEGO INICIALIZAMOS UN ELEMENTO CHARTS QUE ES EL GRAFICO
    graficoCircularCategorias = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: fondo,
            }],
        },
    });
}

armarGrafico();

function generarColorAzul() {
    // El valor de BB será alto (128–255) para que predomine el azul.
    // Los valores de RR y GG serán bajos (0–127).
    
    let rr = Math.floor(Math.random() * 128); // 0 a 127
    let gg = Math.floor(Math.random() * 128); // 0 a 127
    let bb = Math.floor(Math.random() * 128) + 128; // 128 a 255

    // Convertimos a hexadecimal y formateamos para que tenga siempre dos dígitos.
    let colorHex = `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
    return colorHex;
}


