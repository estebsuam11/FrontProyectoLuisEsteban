function generarGrafica(){
    // Obtener el contexto del canvas
var ctx = document.getElementById('myChart').getContext('2d');

// Datos de ejemplo: ventas mensuales
var ventasMensuales = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{
        label: 'Ventas',
        data: [120, 180, 200, 150, 220, 250],
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Color de las barras
        borderColor: 'rgba(54, 162, 235, 1)', // Color del borde de las barras
        borderWidth: 1
    }]
};

// Configuración del gráfico
var config = {
    type: 'bar',
    data: ventasMensuales,
    options: {
        scales: {
            y: {
                beginAtZero: true // Empezar en cero en el eje Y
            }
        }
    }
};
// Inicializar el gráfico
var myChart = new Chart(ctx, config);
hacerDraggable();
}


function hacerDraggable() {
    interact('.resize-drag')
    .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },
  
      listeners: {
        move (event) {
          var target = event.target
          var x = (parseFloat(target.getAttribute('data-x')) || 0)
          var y = (parseFloat(target.getAttribute('data-y')) || 0)
  
          // update the element's style
          target.style.width = event.rect.width + 'px'
          target.style.height = event.rect.height + 'px'
  
          // translate when resizing from top or left edges
          x += event.deltaRect.left
          y += event.deltaRect.top
  
          target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
  
          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
          var chartInstance = Chart.getChart("myChart");

// Destruir la instancia del gráfico
if (chartInstance) {
    chartInstance.destroy();
}
            RecrearCanvas()
          
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),
  
        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 }
        })
      ],
  
      inertia: true
    })
    .draggable({
      listeners: { move: window.dragMoveListener },
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true
        })
      ]
    });
}

function ajustarTamanoCanvas(chart) {
    // Obtener el canvas del gráfico
    var canvas = chart.canvas;

    // Establecer el ancho y el alto deseados del canvas
    var canvasAncho = 400; // Ejemplo de ancho
    var canvasAlto = 400; // Ejemplo de alto

    // Establecer el ancho y el alto del canvas
    canvas.width = canvasAncho;
    canvas.height = canvasAlto;

    // Actualizar el gráfico
    chart.update({
        duration: 0, // Opcional: establecer la duración de la animación a 0 para que no haya animación
        lazy: false // Opcional: forzar la actualización inmediata del gráfico
    });
}



function agregarLienzoADashboard() {
    var contenedorGraficas = document.getElementById("cuerpoPagina");
contenedorGraficas.innerHTML='';
    // Crear el div contenedor para el canvas
    var divContenedor = document.createElement('div');
    divContenedor.id="luis";
    divContenedor.classList.add('resize-drag'); // Agregar la clase para hacer draggable
    divContenedor.style.width = '200px';
    divContenedor.style.height = '200px';
    divContenedor.style.border = '1px solid black';

    // Crear el canvas y configurarlo
    var canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    canvas.width = divContenedor.offsetWidth; // Establecer el ancho del canvas igual al ancho del div contenedor
    canvas.height = divContenedor.offsetHeight; // Establecer la altura del canvas igual a la altura del div contenedor

    // Agregar el canvas al div contenedor
    divContenedor.appendChild(canvas);

    // Agregar el div contenedor al contenedor de gráficas
    contenedorGraficas.appendChild(divContenedor);

    // Generar la gráfica en el canvas
    generarGrafica();
}

function RecrearCanvas(){
    var contendorGrafica=document.getElementById("luis")
    var canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    canvas.width = contendorGrafica.offsetWidth; // Establecer el ancho del canvas igual al ancho del div contenedor
    canvas.height = contendorGrafica.offsetHeight;
    contendorGrafica.appendChild(canvas);
    generarGrafica();
}




  function dragMoveListener (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
  
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)

    }

  
  // this function is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

// Escuchar el evento de cambio de tamaño del contenedor


