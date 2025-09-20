let graficoCircularCategorias;
let graficoBarrasTicketsCerrados;

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

  if (graficoCircularCategorias) {
    graficoCircularCategorias.destroy();
  }

  let fechaDesde = document.getElementById("FechaInicioBuscar").value;
  let fechaHasta = document.getElementById("FechaFinBuscar").value;

  // Normalizar formato a yyyy-MM-dd si existe valor
  fechaDesde = fechaDesde
    ? new Date(fechaDesde).toISOString().slice(0, 10)
    : "";
  fechaHasta = fechaHasta
    ? new Date(fechaHasta).toISOString().slice(0, 10)
    : "";

  // Validación: fechaDesde <= fechaHasta
  if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
    fechaHasta = fechaDesde;
    document.getElementById("FechaFinBuscar").value = fechaDesde;
  }

  const filtros = {
    fechaInicio: fechaDesde || "",
    fechaFin: fechaHasta || "",
    categoriaId: 0,
    prioridad:
      parseInt(document.getElementById("PrioridadIdBuscar").value) || 0,
    estado: parseInt(document.getElementById("EstadoIdBuscar").value) || 0,
  };

  const res = await authFetch(`tickets/grafico`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filtros),
  });

  const categorias = await res.json();
  console.log(categorias);
  var labels = [];
  var data = [];
  var fondo = [];

  categorias.forEach((categoria) => {
    labels.push(categoria.nombre);
    var color = generarColorAzul();
    fondo.push(color);
    data.push(categoria.cantidad);
  });

  //BUSCAR Y GUARDAR EN UNA VARIABLE EL ELEMENTO DONDE SE VA A DIBUJAR EL GRAFICO
  var ctxPie = document.getElementById("grafico-circular");

  //LUEGO INICIALIZAMOS UN ELEMENTO CHARTS QUE ES EL GRAFICO
  graficoCircularCategorias = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: fondo,
        },
      ],
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
  let colorHex = `#${rr.toString(16).padStart(2, "0")}${gg
    .toString(16)
    .padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`;
  return colorHex;
}

async function armarGraficoBarrasTicketsCerrados() {
  const res = await authFetch("tickets/tickets-cerrados-por-mes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}) // Puedes enviar filtros si lo necesitas
  });

  const datos = await res.json();

  const labels = datos.map(d => d.mes); // Ej: ["2025-01", "2025-02", ...]
  const cantidades = datos.map(d => d.cantidad);

  const ctxBar = document.getElementById("grafico-barras");

  // Destruye el gráfico anterior si existe
  if (graficoBarrasTicketsCerrados) {
    graficoBarrasTicketsCerrados.destroy();
  }

  graficoBarrasTicketsCerrados = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tickets cerrados por mes',
        data: cantidades,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

armarGraficoBarrasTicketsCerrados();