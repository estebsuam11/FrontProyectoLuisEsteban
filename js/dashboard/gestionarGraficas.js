var instanciasGraficos = {};
var divAeliminar;

function generarIdContenedorGrafica() {
  var id = "Grafico-numero-" + generarGUID();
  return id;
}

function generarGUID() {
  // Genera un GUID aleatorio
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

function generarGrafica(idDivContenedor,esRecreado){
    // Obtener el contexto del canvas
    var idCanvas=idDivContenedor+'-canvas';
var ctx = document.getElementById(idDivContenedor+'-canvas').getContext('2d');



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

if(esRecreado){
destruirInstancia(idCanvas);
}


instanciasGraficos[idCanvas]  = new Chart(ctx, config);
hacerDraggable(idCanvas,idDivContenedor);
}


function destruirInstancia(idCanvas) {
  // Verificar si existe un gráfico con ese ID y si es así, destruirlo
  if (instanciasGraficos[idCanvas]) {
      instanciasGraficos[idCanvas].destroy();
      delete instanciasGraficos[idCanvas]; // Eliminar la referencia del objeto charts
  }
}

function hacerDraggable(idCanvas,idContenedor) {
  interact('#' + idContenedor)
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
    
            RecrearCanvas(idCanvas,idContenedor)
          
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
          containment: 'parent',
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


function AbrirModalConfirmarEliminación(divContenedor){
  divAeliminar = divContenedor;
  $('#modalConfirmarEliminacio').modal('show');
}

function CerrarModalConfirmarEliminacion(){
  $('#modalConfirmarEliminacio').modal('hide');
}

function EliminarGrafica(){
  $(divAeliminar).remove();
    $('#modalConfirmarEliminacio').modal('hide');
    toastr.success("Gráfica eliminada correctamente"); 
}

function AgregarGraficaAlLienzo(){

  var contenedorGraficas = document.getElementById("cuerpoPagina");
  var idGrafica=generarIdContenedorGrafica();
  // Crear el div contenedor para el canvas
  var divContenedor = document.createElement('div');
  divContenedor.id=idGrafica;
  divContenedor.classList.add('resize-drag'); // Agregar la clase para hacer draggable
  divContenedor.style.width = '200px';
  divContenedor.style.height = '200px';
  divContenedor.style.border = '1px solid black';
  divContenedor.style.position = 'relative'; // Establecer posición relativa

  // Crear el botón para eliminar
  var botonEliminar = document.createElement('button');
  botonEliminar.textContent = 'x';
  botonEliminar.style.position = 'absolute'; // Establecer posición absoluta
  botonEliminar.style.top = '5px'; // Colocar 5px de distancia desde la parte superior
  botonEliminar.style.right = '5px'; // Colocar 5px de distancia desde la parte derecha
  botonEliminar.onclick = function() {
    AbrirModalConfirmarEliminación(divContenedor);
  };

  // Crear el canvas y configurarlo
  var canvas = document.createElement('canvas');
  canvas.id = idGrafica+'-canvas';
  canvas.width = divContenedor.offsetWidth; // Establecer el ancho del canvas igual al ancho del div contenedor
  canvas.height = divContenedor.offsetHeight; // Establecer la altura del canvas igual a la altura del div contenedor

  // Agregar el canvas al div contenedor
  divContenedor.appendChild(canvas);

  // Agregar el botón eliminar al div contenedor
  divContenedor.appendChild(botonEliminar);

  // Agregar el div contenedor al contenedor de gráficas
  contenedorGraficas.appendChild(divContenedor);

  // Generar la gráfica en el canvas
  generarGrafica(idGrafica,false);
}

function AgregarLienzoADashboard() {
  var contenedorGraficas = document.getElementById("cuerpoPagina");
  contenedorGraficas.innerHTML='';
}

function RecrearCanvas(idCanvas,idContenedor){
       var canvas=document.getElementById(idCanvas)
       document.getElementById(idContenedor).removeChild(canvas);
  
    var contendorGrafica=document.getElementById(idContenedor)
    var canvas = document.createElement('canvas');
    canvas.id = idCanvas;
    canvas.width = contendorGrafica.offsetWidth; // Establecer el ancho del canvas igual al ancho del div contenedor
    canvas.height = contendorGrafica.offsetHeight;
    contendorGrafica.appendChild(canvas);
    generarGrafica(idContenedor,true);
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


    
    function agregarSidebarAlBody() {
      // HTML del sidebar
      var sidebarHTML = `      
          <div id="sidebar" class="sidebar">
          <div class="sidebar-arrow" onclick="toggleSidebar()">
          <svg fill="#000000" width="72px" height="72px" viewBox="0 0 1920.00 1920.00" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="30.72"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m1352.005.012 176.13 176.13-783.864 783.989 783.864 783.74L1352.005 1920 391.887 960.13z" fill-rule="evenodd"></path> </g></svg>
          </div>
            <span>Agregar Gráfica</span>
            
            <ul>
              <li><a href="#"><svg height="70px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style="fill:#FED159;" cx="257.107" cy="256.104" r="246.892"></circle> <path style="fill:#F64B4A;" d="M503.988,256.105H257.109V9.214C393.457,9.214,503.988,119.757,503.988,256.105z"></path> <path style="fill:#65B4BB;" d="M257.113,9.226v246.879L82.532,430.686c-96.406-96.418-96.406-252.744,0-349.15 C130.747,33.321,193.93,9.226,257.113,9.226z"></path> <path d="M437.126,74.944c-99.836-99.834-262.279-99.836-362.112,0c-15.733,15.732-29.331,33.372-40.416,52.431 c-2.544,4.374-1.061,9.984,3.315,12.529c4.373,2.545,9.983,1.061,12.529-3.314c10.289-17.691,22.917-34.072,37.532-48.686 c44.018-44.018,101.147-67.116,158.931-69.325v233.624l-145.49,145.488c-3.579,3.579-3.579,9.38,0,12.959 c1.79,1.79,4.135,2.684,6.481,2.684c2.345,0,4.691-0.894,6.481-2.684l145.488-145.488h91.213c5.062,0,9.164-4.103,9.164-9.164 s-4.102-9.164-9.164-9.164h-85.846V18.578c57.786,2.209,114.913,25.307,158.931,69.325s67.115,101.147,69.325,158.933H388.954 c-5.062,0-9.164,4.103-9.164,9.164c0,5.061,4.102,9.164,9.164,9.164H493.49c-2.209,57.786-25.307,114.913-69.325,158.933 c-92.688,92.689-243.503,92.689-336.192,0c-32.212-32.212-54.373-72.644-64.087-116.926c-9.46-43.13-6.803-87.92,7.684-129.529 c1.664-4.78-0.861-10.003-5.641-11.668c-4.774-1.664-10.003,0.861-11.668,5.641c-15.603,44.81-18.464,93.042-8.277,139.483 c10.465,47.709,34.336,91.265,69.028,125.958c49.918,49.917,115.488,74.876,181.057,74.876s131.139-24.959,181.057-74.876 C536.959,337.221,536.959,174.779,437.126,74.944z"></path> </g></svg></a></li>
              <li><a href="#"><svg height="70px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style="fill:#FED159;" cx="257.107" cy="256.104" r="246.892"></circle> <path style="fill:#F64B4A;" d="M503.988,256.105H257.109V9.214C393.457,9.214,503.988,119.757,503.988,256.105z"></path> <path style="fill:#65B4BB;" d="M257.113,9.226v246.879L82.532,430.686c-96.406-96.418-96.406-252.744,0-349.15 C130.747,33.321,193.93,9.226,257.113,9.226z"></path> <path d="M437.126,74.944c-99.836-99.834-262.279-99.836-362.112,0c-15.733,15.732-29.331,33.372-40.416,52.431 c-2.544,4.374-1.061,9.984,3.315,12.529c4.373,2.545,9.983,1.061,12.529-3.314c10.289-17.691,22.917-34.072,37.532-48.686 c44.018-44.018,101.147-67.116,158.931-69.325v233.624l-145.49,145.488c-3.579,3.579-3.579,9.38,0,12.959 c1.79,1.79,4.135,2.684,6.481,2.684c2.345,0,4.691-0.894,6.481-2.684l145.488-145.488h91.213c5.062,0,9.164-4.103,9.164-9.164 s-4.102-9.164-9.164-9.164h-85.846V18.578c57.786,2.209,114.913,25.307,158.931,69.325s67.115,101.147,69.325,158.933H388.954 c-5.062,0-9.164,4.103-9.164,9.164c0,5.061,4.102,9.164,9.164,9.164H493.49c-2.209,57.786-25.307,114.913-69.325,158.933 c-92.688,92.689-243.503,92.689-336.192,0c-32.212-32.212-54.373-72.644-64.087-116.926c-9.46-43.13-6.803-87.92,7.684-129.529 c1.664-4.78-0.861-10.003-5.641-11.668c-4.774-1.664-10.003,0.861-11.668,5.641c-15.603,44.81-18.464,93.042-8.277,139.483 c10.465,47.709,34.336,91.265,69.028,125.958c49.918,49.917,115.488,74.876,181.057,74.876s131.139-24.959,181.057-74.876 C536.959,337.221,536.959,174.779,437.126,74.944z"></path> </g></svg></a></li>
            </ul>
          </div>

      `;
      
      // Crear un elemento div para contener el sidebar
      var cuerpoPagina=document.getElementById("cuerpoPagina");
      var sidebarContainer = document.createElement("div");
      sidebarContainer.innerHTML = sidebarHTML;
      
      // Agregar el sidebar al body del documento
      cuerpoPagina.appendChild(sidebarContainer);
    }
    
    // Función para mostrar u ocultar el sidebar
    function toggleSidebar() {
      var sidebar = document.getElementById("sidebar");
      if (sidebar.style.right === "-300px") {
        sidebar.style.right = "0";
      } else {
        sidebar.style.right = "-300px";
      }
    }
    

  
  // this function is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

// Escuchar el evento de cambio de tamaño del contenedor


