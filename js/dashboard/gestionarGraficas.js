var instanciasGraficos = {};
var configuracionesGraficos={};
var almacenamientoDatosEjesGraficos={};
var hayFiltros=false;
var dataDataSetFiltrada=[]
var configuracionModalGrafico = null;
var almacenTipoGrafico=null;
var nombresColumnasDataSet=[];
var almacenarFiltros=[];
var datosPrueba = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  datasets: [{
      label: '',
      data: [120, 180, 200, 150, 220, 250],
      backgroundColor: 'rgba(54, 162, 235, 0.5)', // Color de las barras
      borderColor: 'rgba(54, 162, 235, 1)', // Color del borde de las barras
      borderWidth: 1
  }]
};

function CrearValoresEjes(nombreCampoEjeX,nombreCampoEjeY){
  var dataAUsar=hayFiltros?dataDataSetFiltrada: dataSetDashboard[0];
    let totals = dataAUsar.reduce((acc, cur) => {
        let value = cur[nombreCampoEjeX];
        acc[value] = (acc[value] || 0) + parseFloat(cur[nombreCampoEjeY]);
        return acc;
    }, {});

    return totals;
}

function PurificarDatos(){
  datosLimpios = dataSetDashboard[0].filter(registro => {
    return !Object.values(registro).some(value => value === null || value === "" || value === undefined);
});
dataSetDashboard.length = 0;
dataSetDashboard.push(datosLimpios);
}




function GuardarValoresEjeXYEjeY(idCanvas,datosEjeX,datosEjeY,ejex,ejey){

almacenamientoDatosEjesGraficos[idCanvas]={
  "nombreCampoEjeX":ejex,
  "nombreCampoEjeY":ejey,
  "datosEjeX":datosEjeX,
  "datosEjeY":datosEjeY};
}

var divAeliminar;

function llenarSelectoFiltro(nombreColumna,selector) {
  var opcionesUnicas = new Set();
  dataSetDashboard[0].forEach(function(item) {
      opcionesUnicas.add(item[nombreColumna]);
  });

      selector.innerHTML = '';
      opcionesUnicas.forEach(function(opcion) {
          var option = document.createElement('option');
          option.text = opcion;
          selector.add(option);
      });

}


function AgregarFiltroAlLienzo(){
  var nombreCampo=document.getElementById("selectCrearFiltro").value;
  var contenedorGraficas=document.getElementById("cuerpoPagina");
  var divContenedor = document.createElement('div');
  var idElementoContenedor="elementoFiltro"+"_"+nombreCampo;
  divContenedor.id=idElementoContenedor;
  divContenedor.classList.add('resize-drag'); // Agregar la clase para hacer draggable
  divContenedor.style.width = '100px';
  divContenedor.style.height = '100px';
  divContenedor.style.border = '1px solid black';
  divContenedor.style.position = 'relative'; 


  var selectContenidoFiltro = document.createElement('select');
selectContenidoFiltro.id = "selectFiltro-" + nombreCampo;
selectContenidoFiltro.multiple = true;



// Establecer estilos para simular una flecha desplegable
  divContenedor.appendChild(selectContenidoFiltro);
  contenedorGraficas.appendChild(divContenedor);
  llenarSelectoFiltro(nombreCampo,selectContenidoFiltro)
  CerrarModalCrearFiltro();
  selectContenidoFiltro.style = "width:100%"  
  CapturarYAplicarSeleccion();
  hacerDraggable(null,idElementoContenedor,false);
}

function FiltrarDatosDashboard() {
  dataDataSetFiltrada = almacenarFiltros.reduce((filteredData, filtro) => {
      return filteredData.filter(item => {
          return item[filtro.campoFiltro] && filtro.valoresFiltro.includes(item[filtro.campoFiltro]);
      });
  }, dataSetDashboard[0]);
}

function AplicarFiltrosATodasLasGraficas(){
  var idsGraficas =Object.keys(almacenamientoDatosEjesGraficos);
  idsGraficas.forEach(idGrafico=>{
let filtroConfigGrafica= almacenamientoDatosEjesGraficos[idGrafico];
var datosEjes= ExtraerDatosEjeXYEjeY(filtroConfigGrafica.nombreCampoEjeX,filtroConfigGrafica.nombreCampoEjeY);
configuracionesGraficos[idGrafico].data.labels=datosEjes[0];
configuracionesGraficos[idGrafico].data.datasets[0].data=datosEjes[1];

let idContenedor = idGrafico.replace(/-canvas$/, '');
RecrearCanvas(idGrafico,idContenedor);
  });
}




function CapturarYAplicarSeleccion() {
  document.addEventListener('change', function(event) {
      var select = event.target;
      var nombreFiltro=select.id.split("-")[1];

      if (select && select.tagName === 'SELECT' && select.id.includes('selectFiltro')) {
          var selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
          if (selectedOptions.length === 0) {
            var filtroExistenteIndex = almacenarFiltros.findIndex(filtro => filtro.campoFiltro === nombreFiltro);
            if (filtroExistenteIndex !== -1) {
                almacenarFiltros.splice(filtroExistenteIndex, 1);
            }
        } else {
            var filtroExistenteIndex = almacenarFiltros.findIndex(filtro => filtro.campoFiltro === nombreFiltro);
            if (filtroExistenteIndex !== -1) {
                almacenarFiltros[filtroExistenteIndex].valoresFiltro = selectedOptions;
            } else {

                almacenarFiltros.push({ "campoFiltro": nombreFiltro, "valoresFiltro": selectedOptions });
            }
        }
        almacenarFiltros.length>0?hayFiltros=true:hayFiltros=false;
        FiltrarDatosDashboard()
        AplicarFiltrosATodasLasGraficas();
      }

  });
}



function ExtrarNombresCamposColumnas(){
  nombresColumnasDataSet=[];
  nombresColumnasDataSet = Object.keys(dataSetDashboard[0][0]);
}

function AgregarNombresCamposASelect(idSelects) {
  idSelects.forEach(selectModal=>{
    var selectALlenar = document.getElementById(selectModal);
    nombresColumnasDataSet.forEach(function(opcion) {
      var optionX = document.createElement("option");
      optionX.text = opcion;
      optionX.value = opcion;
      selectALlenar.add(optionX); 
    });
  });
}


function AbrirModalCrearGrafico(tipoGrafico){
   almacenTipoGrafico=tipoGrafico;
  $('#modalCrearGrafica').modal('show');
}

function AbrirModalCrearFiltro(){
  // almacenTipoGrafico=tipoGrafico;
 $('#modalCrearFiltro').modal('show');
}

function CerrarModalCrearFiltro(){
  // almacenTipoGrafico=tipoGrafico;
 $('#modalCrearFiltro').modal('hide');
}

$('#modalCrearFiltro').on('shown.bs.modal', function () {
  let idSelects=["selectCrearFiltro"]
  AgregarNombresCamposASelect(idSelects);
});



$('#selectX, #selectY').change(function() {
  var selectedValue = $(this).val(); // Obtener el valor seleccionado en el select que activó el evento change

  // Desactivar la selección en el otro select
  $('#selectX, #selectY').not($(this)).find('option').prop('disabled', false); // Habilitar todas las opciones
  $('#selectX, #selectY').not($(this)).find('option[value="' + selectedValue + '"]').prop('disabled', true); // Deshabilitar la opción seleccionada

  // Si se selecciona una opción diferente en el otro select, volver a habilitar la opción seleccionada en este select
  $('#selectX, #selectY').not($(this)).change(function() {
    var deselectedValue = $(this).val(); // Obtener el valor seleccionado en el otro select
    $(this).find('option[value="' + deselectedValue + '"]').prop('disabled', false); // Habilitar la opción seleccionada
  });
});

$('#modalCrearGrafica').on('shown.bs.modal', function () {
  let idSelects=["selectX","selectY"]
  AgregarNombresCamposASelect(idSelects);
});

function CerrarModalCrearGrafico(){
  $('#modalCrearGrafica').modal('hide');
}

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

function GenerarConfiguracionGrafica(tipoGrafico,data,idCanvas,configDisenoGrafico){
  function deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(deepCopy);
    }
    
    const copy = {};
    for (let key in obj) {
      copy[key] = deepCopy(obj[key]);
    }
    
    return copy;
  }

  
  // Luego, en tu switch:
  var configuracionGrafica;
  switch (tipoGrafico) {
    case 'bar':
      configuracionGrafica = deepCopy({
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
      });
      break;
    case 'line':
      configuracionGrafica = deepCopy({
        type: 'line',
        data: data
      });
      break;
    case 'pie':
      configuracionGrafica = deepCopy({
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10
            }
          },
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
      break;
    case 'scatter':
      configuracionGrafica = deepCopy({
        type: 'scatter',
        data: data,
        options: {
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Mes'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Ventas'
              }
            }
          },
          responsive: true
        }
      });
      break;
    default:
      console.log('Tipo de gráfica desconocido.');
  }



  configuracionGrafica.data.datasets.forEach(localDataSet => {
    localDataSet.borderColor = "#000000"; 
    if (tipoGrafico !== "pie") {
      localDataSet.backgroundColor = configDisenoGrafico.color;
    } else {
      var color = Math.floor(Math.random() * 16777215).toString(16);  
      localDataSet.backgroundColor = '#' + color;
    }
  });

return configuracionGrafica
}

function generarGrafica(idDivContenedor,esRecreado,configuracionGrafica){
    // Obtener el contexto del canvasm
    var idCanvas=idDivContenedor+'-canvas';
var ctx = document.getElementById(idDivContenedor+'-canvas').getContext('2d');


if(esRecreado){
destruirInstancia(idCanvas);
}


instanciasGraficos[idCanvas]  = new Chart(ctx, configuracionGrafica);
hacerDraggable(idCanvas,idDivContenedor,true);
}


function destruirInstancia(idCanvas) {
  // Verificar si existe un gráfico con ese ID y si es así, destruirlo
  if (instanciasGraficos[idCanvas]) {
      instanciasGraficos[idCanvas].destroy();
      delete instanciasGraficos[idCanvas]; // Eliminar la referencia del objeto charts
  }
}

function hacerDraggable(idCanvas,idContenedor,esGrafica) {
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
     if(esGrafica){
      RecrearCanvas(idCanvas,idContenedor)
     }
          
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
    let idElemento=divAeliminar.id+"-canvas";
    delete configuracionesGraficos[idElemento];
    delete instanciasGraficos[idElemento];
    delete almacenamientoDatosEjesGraficos[idElemento]
    toastr.success("Gráfica eliminada correctamente"); 
}

function AgregarGraficaAlLienzo(){
  configuracionModalGrafico = null;
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
  var iconoEliminar = document.createElement("i");
  iconoEliminar.classList.add("fas", "fa-trash-alt"); // Añade las clases de Font Awesome
  botonEliminar.appendChild(iconoEliminar);
  botonEliminar.style.position = 'absolute'; // Establecer posición absoluta
  botonEliminar.style.top = '5px'; // Colocar 5px de distancia desde la parte superior
  botonEliminar.style.right = '5px'; // Colocar 5px de distancia desde la parte derecha
  botonEliminar.onclick = function() {
    AbrirModalConfirmarEliminación(divContenedor);
  };

  var botonEditar = document.createElement('button');
  var iconoEditar = document.createElement("i");
  iconoEditar.classList.add("fas", "fa-pencil-alt");
  botonEditar.appendChild(iconoEditar);
  botonEditar.style.position = 'absolute'; // Establecer posición absoluta
  botonEditar.style.top = '5px'; // Colocar 5px de distancia desde la parte superior
  botonEditar.style.right = '40px'; // Colocar 5px de distancia desde la parte derecha
  botonEditar.onclick = function() {
    AbrirModalConfirmarEliminación(divContenedor);
  };


  var etiqueta = document.createElement("span");
  etiqueta.contentEditable = true; // Hacer el elemento editable
  etiqueta.innerText = "luis";
  etiqueta.classList.add("editarNombreGrafica");
  etiqueta.style.cursor = "text"
  etiqueta.style.color=""

  // Crear el canvas y configurarlo
  var canvas = document.createElement('canvas');
  var idCanvas=idGrafica+'-canvas';
  canvas.id = idCanvas;
  canvas.width = divContenedor.offsetWidth; // Establecer el ancho del canvas igual al ancho del div contenedor
  canvas.height = divContenedor.offsetHeight; // Establecer la altura del canvas igual a la altura del div contenedor

  // Agregar el canvas al div contenedor
  divContenedor.appendChild(canvas);

  // Agregar el botón eliminar al div contenedor
  divContenedor.appendChild(botonEliminar);
  divContenedor.appendChild(botonEditar);
  divContenedor.appendChild(etiqueta);
  // Agregar el div contenedor al contenedor de gráficas
  contenedorGraficas.appendChild(divContenedor);

  var colorElegido = $('#colorPicker').val();
  var ejex = $('#selectX').val();
  var ejey=  $('#selectY').val();


 configDisenoGrafico= {
    "tipoGrafico": almacenTipoGrafico,
    "color": colorElegido,
    "ejex": ejex,
    "ejey": ejey
  };

 var datosExtraidos= ExtraerDatosEjeXYEjeY(ejex,ejey);
 var dataLlenarGrafico=GenerarConfiguracionDeDatosParaGrafica(datosExtraidos)


  var configuracionGrafica=GenerarConfiguracionGrafica(almacenTipoGrafico,dataLlenarGrafico,idCanvas,configDisenoGrafico);
  configuracionesGraficos[idCanvas]=configuracionGrafica;
  almacenTipoGrafico=null;
  // Generar la gráfica en el canvas
  generarGrafica(idGrafica,false,configuracionGrafica);

  GuardarValoresEjeXYEjeY(idCanvas,datosExtraidos[0],datosExtraidos[1],ejex,ejey);
  CerrarModalCrearGrafico();
}

function ExtraerDatosEjeXYEjeY(nombreCampoEjeX,nombreCampoEjeY){
  // var datosEjeX=ObtenerValoresUnicosDeDatosFiltrados(nombreCampoEjeX);
  var valoresEjes=CrearValoresEjes(nombreCampoEjeX,nombreCampoEjeY);
  
  const valoresEjeX = [];
  const valoresEjeY = [];
  
  for (let llave in valoresEjes) {
      valoresEjeX.push(llave);
      valoresEjeY.push(valoresEjes[llave]);
  }

  return [valoresEjeX,valoresEjeY];
  
  }


function GenerarConfiguracionDeDatosParaGrafica(datosEjes){
  var datosGrafico = {
    labels:datosEjes[0],
    datasets: [{
        label: '',
        data: datosEjes[1],
        borderWidth: 1
    }]
  };

  return datosGrafico;
}

function AgregarLienzoADashboard() {
  var contenedorGraficas = document.getElementById("cuerpoPagina");
  contenedorGraficas.innerHTML='';
  contenedorGraficas.style.display = "flex";
  contenedorGraficas.classList.remove("cuerpoPagina");
  contenedorGraficas.classList.add("cuerpoPaginaEnDashboard");
  contenedorGraficas.style.flexWrap = "wrap";
  agregarSidebarAlBody();
  
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
    var configuracion=configuracionesGraficos[idCanvas];
    generarGrafica(idContenedor,true,configuracion);
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
          <div class="sidebar-arrow" onclick="toggleSidebar()" id="divFlecha">
          <svg fill="#000000" width="72px" height="72px" viewBox="0 0 1920.00 1920.00" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="30.72"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m1352.005.012 176.13 176.13-783.864 783.989 783.864 783.74L1352.005 1920 391.887 960.13z" fill-rule="evenodd"></path> </g></svg>
          </div>
            <span>Agregar Gráfica</span>
            <ul>
            <li>
            <div class="opcion-boton">
            <svg onclick="AbrirModalCrearGrafico('pie')" height="70px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.001 512.001" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle style="fill:#FED159;" cx="257.107" cy="256.104" r="246.892"></circle> <path style="fill:#F64B4A;" d="M503.988,256.105H257.109V9.214C393.457,9.214,503.988,119.757,503.988,256.105z"></path> <path style="fill:#65B4BB;" d="M257.113,9.226v246.879L82.532,430.686c-96.406-96.418-96.406-252.744,0-349.15 C130.747,33.321,193.93,9.226,257.113,9.226z"></path> <path d="M437.126,74.944c-99.836-99.834-262.279-99.836-362.112,0c-15.733,15.732-29.331,33.372-40.416,52.431 c-2.544,4.374-1.061,9.984,3.315,12.529c4.373,2.545,9.983,1.061,12.529-3.314c10.289-17.691,22.917-34.072,37.532-48.686 c44.018-44.018,101.147-67.116,158.931-69.325v233.624l-145.49,145.488c-3.579,3.579-3.579,9.38,0,12.959 c1.79,1.79,4.135,2.684,6.481,2.684c2.345,0,4.691-0.894,6.481-2.684l145.488-145.488h91.213c5.062,0,9.164-4.103,9.164-9.164 s-4.102-9.164-9.164-9.164h-85.846V18.578c57.786,2.209,114.913,25.307,158.931,69.325s67.115,101.147,69.325,158.933H388.954 c-5.062,0-9.164,4.103-9.164,9.164c0,5.061,4.102,9.164,9.164,9.164H493.49c-2.209,57.786-25.307,114.913-69.325,158.933 c-92.688,92.689-243.503,92.689-336.192,0c-32.212-32.212-54.373-72.644-64.087-116.926c-9.46-43.13-6.803-87.92,7.684-129.529 c1.664-4.78-0.861-10.003-5.641-11.668c-4.774-1.664-10.003,0.861-11.668,5.641c-15.603,44.81-18.464,93.042-8.277,139.483 c10.465,47.709,34.336,91.265,69.028,125.958c49.918,49.917,115.488,74.876,181.057,74.876s131.139-24.959,181.057-74.876 C536.959,337.221,536.959,174.779,437.126,74.944z"></path> </g></svg>
            </div>
            </li>
            
            <li>
            <span>Gráfico de Torta</span>
            <div class="opcion-boton">
            <svg onclick="AbrirModalCrearGrafico('bar')" height="70px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000" stroke="#000000" stroke-width="11.776"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#7DD2F0;" d="M294.9,8.305H217.1c-11.978,0-21.688,9.71-21.688,21.688v452.014c0,11.978,9.71,21.688,21.688,21.688 H294.9c11.978,0,21.688-9.71,21.688-21.688V29.993C316.588,18.015,306.878,8.305,294.9,8.305z"></path> <path style="opacity:0.1;enable-background:new ;" d="M239.705,482.007V29.993c0-11.978,9.71-21.688,21.688-21.688H217.1 c-11.978,0-21.688,9.71-21.688,21.688v452.014c0,11.978,9.71,21.688,21.688,21.688h44.293 C249.415,503.695,239.705,493.985,239.705,482.007z"></path> <path style="fill:#FF6465;" d="M134.522,255.999H56.723c-11.978,0-21.688,9.71-21.688,21.688v204.32 c0,11.978,9.71,21.688,21.688,21.688h77.799c11.978,0,21.688-9.71,21.688-21.688v-204.32 C156.209,265.71,146.5,255.999,134.522,255.999z"></path> <path style="opacity:0.1;enable-background:new ;" d="M79.327,482.007v-204.32c0-11.978,9.71-21.688,21.688-21.688H56.723 c-11.978,0-21.688,9.71-21.688,21.688v204.32c0,11.978,9.71,21.688,21.688,21.688h44.293 C89.038,503.695,79.327,493.985,79.327,482.007z"></path> <path style="fill:#FFD782;" d="M455.277,165.119h-77.799c-11.978,0-21.688,9.71-21.688,21.688v295.201 c0,11.978,9.71,21.688,21.688,21.688h77.799c11.978,0,21.688-9.71,21.688-21.688V186.807 C476.965,174.829,467.255,165.119,455.277,165.119z"></path> <path style="opacity:0.1;enable-background:new ;" d="M400.084,482.007V186.806c0-11.978,9.71-21.688,21.688-21.688h-44.293 c-11.978,0-21.688,9.71-21.688,21.688v295.201c0,11.978,9.71,21.688,21.688,21.688h44.293 C409.794,503.695,400.084,493.985,400.084,482.007z"></path> <path d="M294.9,512h-77.798c-16.539,0-29.993-13.455-29.993-29.993V102.472c0-4.587,3.717-8.305,8.305-8.305 c4.588,0,8.305,3.718,8.305,8.305v379.536c0,7.379,6.004,13.383,13.383,13.383h77.799c7.379,0,13.382-6.004,13.382-13.383V29.993 c0-7.379-6.003-13.383-13.382-13.383h-77.799c-7.379,0-13.383,6.004-13.383,13.383v39.259c0,4.587-3.717,8.305-8.305,8.305 c-4.588,0-8.305-3.718-8.305-8.305V29.993C187.109,13.455,200.563,0,217.101,0h77.799c16.538,0,29.992,13.455,29.992,29.993v452.014 C324.891,498.545,311.438,512,294.9,512z"></path> <path d="M134.521,512H56.723c-16.539,0-29.993-13.455-29.993-29.993v-134.23c0-4.587,3.717-8.305,8.305-8.305 s8.305,3.718,8.305,8.305v134.23c0,7.379,6.004,13.383,13.383,13.383h77.799c7.379,0,13.383-6.004,13.383-13.383v-204.32 c0-7.379-6.004-13.383-13.383-13.383H56.723c-7.379,0-13.383,6.004-13.383,13.383v36.871c0,4.587-3.717,8.305-8.305,8.305 s-8.305-3.718-8.305-8.305v-36.87c0-16.538,13.454-29.993,29.993-29.993h77.799c16.539,0,29.993,13.455,29.993,29.993v204.32 C164.514,498.545,151.06,512,134.521,512z"></path> <path d="M455.277,512h-77.799c-16.539,0-29.993-13.455-29.993-29.993v-295.2c0-16.538,13.454-29.993,29.993-29.993h77.799 c16.539,0,29.993,13.455,29.993,29.993v195.534c0,4.587-3.717,8.305-8.305,8.305s-8.305-3.718-8.305-8.305V186.807 c0-7.379-6.004-13.383-13.383-13.383h-77.799c-7.379,0-13.383,6.004-13.383,13.383v295.2c0,7.379,6.004,13.383,13.383,13.383h77.799 c7.379,0,13.383-6.004,13.383-13.383V415.56c0-4.587,3.717-8.305,8.305-8.305s8.305,3.718,8.305,8.305v66.447 C485.27,498.545,471.816,512,455.277,512z"></path> </g></svg>            
            </div>
            </li>
            <span>Gráfico de barras</span>
            <li>
            <div class="opcion-boton">
            <svg onclick="AbrirModalCrearGrafico('line')" height="70px" width="70px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000" stroke="#000000" stroke-width="2.56"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#3FC8F2;" d="M453.98,86.378l-81.609,87.663c3.945,4.79,6.315,10.926,6.315,17.617 c0,14.025-10.413,25.611-23.929,27.466V503.56h116.259V93.123C464.509,92.866,458.583,90.367,453.98,86.378z"></path> <path style="fill:#0DAACE;" d="M453.98,86.378l-16.723,17.964V503.56h33.758V93.123C464.509,92.866,458.583,90.367,453.98,86.378z"></path> <path style="fill:#894BA2;" d="M350.953,219.391c-5.977,0-11.509-1.897-16.037-5.114l-73.081,78.503 c3.977,4.799,6.367,10.96,6.367,17.679c0,15.316-12.415,27.732-27.732,27.732c-0.324,0-0.644-0.013-0.965-0.024V503.56h115.251 V219.125C353.512,219.296,352.244,219.391,350.953,219.391z"></path> <path style="fill:#763794;" d="M350.953,219.391c-5.977,0-11.509-1.898-16.037-5.116l-13.917,14.95V503.56h33.758V219.125 C353.512,219.296,352.244,219.391,350.953,219.391z"></path> <path style="fill:#F77935;" d="M212.739,310.458c0-5.038,1.35-9.757,3.698-13.83l-71.127-62.087 c-5.051,5.3-12.174,8.609-20.074,8.609c-0.327,0-0.653-0.014-0.978-0.025V503.56h115.247V338.165 C224.637,337.656,212.739,325.451,212.739,310.458z"></path> <path style="fill:#D9510D;" d="M212.739,310.458c0-5.038,1.35-9.757,3.698-13.83l-9.565-8.348V503.56h32.633V338.165 C224.637,337.656,212.739,325.451,212.739,310.458z"></path> <path style="fill:#FFDB56;" d="M108.1,237.215L9.002,366.315V503.56h115.255V243.127C118.166,242.914,112.578,240.74,108.1,237.215z "></path> <path style="fill:#FBA806;" d="M108.1,237.215l-17.6,22.93V503.56h33.758V243.127C118.166,242.914,112.578,240.74,108.1,237.215z"></path> <g> <circle style="fill:#00D9C0;" cx="125.232" cy="215.423" r="27.731"></circle> <circle style="fill:#00D9C0;" cx="240.471" cy="310.452" r="27.731"></circle> <circle style="fill:#00D9C0;" cx="350.951" cy="191.657" r="27.731"></circle> <circle style="fill:#00D9C0;" cx="472.132" cy="65.423" r="27.731"></circle> </g> <path d="M9.002,110.422c4.661,0,8.44-3.778,8.44-8.44V8.44c0-4.662-3.779-8.44-8.44-8.44s-8.44,3.778-8.44,8.44v93.543 C0.563,106.643,4.341,110.422,9.002,110.422z"></path> <path d="M502.998,495.121h-23.543V100.843c16.444-3.397,28.844-17.99,28.844-35.425c0-19.945-16.226-36.172-36.172-36.172 c-19.944,0-36.17,16.226-36.17,36.172c0,7.749,2.456,14.929,6.621,20.821l-70.699,75.944c-5.912-4.21-13.132-6.697-20.927-6.697 c-19.944,0-36.17,16.226-36.17,36.172c0,8.721,3.102,16.731,8.261,22.984l-61.713,66.292c-5.9-4.18-13.095-6.648-20.859-6.648 c-9.754,0-18.612,3.888-25.125,10.186l-58.666-51.209c3.002-5.27,4.727-11.359,4.727-17.846c0-19.946-16.226-36.171-36.171-36.171 s-36.171,16.226-36.171,36.171c0,8.494,2.949,16.305,7.868,22.484l-79.492,103.56v-205.72c0-4.662-3.779-8.44-8.44-8.44 s-8.44,3.778-8.44,8.44v230.574V503.56c0,4.662,3.779,8.44,8.44,8.44h115.255h115.247h115.251h116.259h31.984 c4.662,0,8.44-3.778,8.44-8.44S507.66,495.121,502.998,495.121z M472.127,46.126c10.637,0,19.293,8.654,19.293,19.293 c0,10.637-8.654,19.293-19.293,19.293c-0.468,0-0.927-0.037-1.387-0.071c-0.277-0.019-0.555-0.036-0.829-0.068 c-0.43-0.05-0.853-0.118-1.274-0.195c-0.148-0.027-0.3-0.044-0.448-0.074c-0.602-0.125-1.195-0.277-1.776-0.458 c-0.029-0.009-0.056-0.02-0.086-0.029c-0.549-0.173-1.087-0.371-1.615-0.592c-0.093-0.039-0.185-0.083-0.277-0.124 c-0.452-0.198-0.897-0.412-1.331-0.643c-0.125-0.066-0.248-0.136-0.371-0.205c-0.386-0.216-0.763-0.447-1.132-0.689 c-0.147-0.097-0.296-0.194-0.441-0.295c-0.333-0.231-0.655-0.477-0.972-0.728c-0.154-0.123-0.312-0.241-0.462-0.369 c-4.206-3.541-6.888-8.839-6.888-14.755C452.836,54.782,461.49,46.126,472.127,46.126z M350.953,172.367 c7.969,0,14.824,4.858,17.762,11.767c0.009,0.021,0.017,0.043,0.026,0.064c0.224,0.533,0.423,1.079,0.6,1.635 c0.021,0.068,0.042,0.134,0.062,0.201c0.154,0.504,0.285,1.02,0.397,1.539c0.024,0.111,0.051,0.221,0.072,0.332 c0.097,0.486,0.168,0.981,0.226,1.481c0.016,0.134,0.038,0.267,0.052,0.401c0.06,0.617,0.095,1.24,0.095,1.871 c0,0.63-0.035,1.251-0.095,1.866c-0.026,0.269-0.074,0.532-0.111,0.798c-0.046,0.334-0.089,0.668-0.153,0.997 c-0.065,0.338-0.151,0.668-0.234,0.999c-0.061,0.242-0.117,0.486-0.187,0.726c-0.108,0.368-0.232,0.728-0.361,1.087 c-0.068,0.19-0.134,0.38-0.208,0.567c-0.15,0.379-0.313,0.751-0.486,1.117c-0.073,0.155-0.147,0.311-0.224,0.464 c-0.19,0.377-0.392,0.748-0.604,1.112c-0.079,0.133-0.16,0.264-0.241,0.395c-0.227,0.367-0.464,0.726-0.713,1.076 c-0.086,0.119-0.176,0.234-0.263,0.352c-0.261,0.347-0.528,0.689-0.811,1.017c-0.096,0.11-0.197,0.216-0.295,0.324 c-0.289,0.322-0.584,0.639-0.893,0.941c-0.107,0.104-0.222,0.2-0.332,0.302c-0.315,0.293-0.634,0.584-0.969,0.855 c-0.11,0.09-0.23,0.169-0.342,0.257c-0.695,0.539-1.428,1.032-2.195,1.474c-0.108,0.062-0.21,0.135-0.321,0.195 c-0.249,0.136-0.511,0.252-0.765,0.377c-0.285,0.141-0.565,0.287-0.857,0.414c-0.266,0.115-0.54,0.209-0.811,0.313 c-0.291,0.11-0.582,0.226-0.881,0.323c-0.295,0.096-0.598,0.172-0.898,0.254c-0.282,0.077-0.564,0.155-0.852,0.219 c-0.33,0.073-0.665,0.129-1,0.185c-0.293,0.05-0.585,0.099-0.881,0.135c-0.216,0.026-0.431,0.048-0.645,0.068 c-0.549,0.047-1.101,0.084-1.661,0.084c-0.602,0-1.196-0.036-1.785-0.09c-0.17-0.016-0.339-0.038-0.507-0.059 c-0.437-0.052-0.87-0.117-1.296-0.198c-0.163-0.03-0.327-0.061-0.49-0.096c-0.515-0.111-1.023-0.241-1.522-0.393 c-0.052-0.016-0.105-0.027-0.156-0.043c-0.566-0.178-1.119-0.383-1.66-0.609c-0.109-0.046-0.216-0.099-0.325-0.147 c-0.416-0.183-0.826-0.38-1.227-0.592c-0.156-0.083-0.312-0.169-0.466-0.255c-0.356-0.2-0.702-0.413-1.043-0.635 c-0.149-0.097-0.299-0.191-0.447-0.293c-5.047-3.483-8.365-9.3-8.365-15.882C331.661,181.022,340.316,172.367,350.953,172.367z M240.47,291.166c7.313,0,13.689,4.09,16.96,10.104c0,0.001,0.001,0.002,0.001,0.003c0.29,0.533,0.555,1.084,0.794,1.646 c0.013,0.033,0.027,0.065,0.04,0.098c0.219,0.523,0.415,1.06,0.589,1.606c0.023,0.071,0.045,0.141,0.066,0.212 c0.153,0.503,0.282,1.015,0.395,1.535c0.024,0.111,0.051,0.221,0.072,0.332c0.097,0.487,0.168,0.983,0.227,1.483 c0.016,0.134,0.038,0.266,0.052,0.399c0.06,0.617,0.095,1.241,0.095,1.874c0,10.637-8.654,19.293-19.293,19.293 c-0.379,0-0.748-0.035-1.122-0.056c-0.417-0.024-0.833-0.054-1.243-0.104c-0.271-0.034-0.538-0.079-0.805-0.124 c-0.335-0.054-0.67-0.111-0.998-0.182c-0.379-0.083-0.752-0.183-1.122-0.289c-0.198-0.055-0.398-0.108-0.594-0.17 c-0.522-0.168-1.036-0.354-1.539-0.565c-0.035-0.015-0.07-0.027-0.104-0.041c-6.908-2.939-11.766-9.793-11.766-17.762 c0-0.584,0.037-1.16,0.088-1.731c0.014-0.15,0.027-0.299,0.044-0.449c0.062-0.547,0.142-1.088,0.248-1.62 c0.024-0.116,0.055-0.231,0.081-0.347c0.097-0.439,0.209-0.872,0.335-1.3c0.047-0.161,0.095-0.323,0.146-0.483 c0.165-0.51,0.345-1.012,0.55-1.502c0.038-0.091,0.083-0.18,0.123-0.271c0.19-0.435,0.396-0.862,0.618-1.279 c0.062-0.116,0.122-0.233,0.186-0.348C226.89,295.194,233.215,291.166,240.47,291.166z M125.235,196.126 c10.638,0,19.292,8.654,19.292,19.292c0,5.242-2.108,9.996-5.513,13.476c-0.218,0.224-0.449,0.431-0.676,0.643 c-0.249,0.231-0.492,0.467-0.753,0.684c-0.168,0.141-0.345,0.267-0.518,0.401c-0.341,0.266-0.68,0.535-1.039,0.778 c-0.043,0.029-0.089,0.054-0.133,0.082c-3.057,2.036-6.721,3.228-10.662,3.228c-0.46,0-0.911-0.037-1.364-0.069 c-0.262-0.018-0.526-0.029-0.787-0.059c-0.547-0.061-1.087-0.142-1.619-0.248c-0.183-0.036-0.362-0.087-0.544-0.128 c-0.398-0.091-0.794-0.189-1.183-0.305c-0.19-0.056-0.377-0.119-0.565-0.181c-0.387-0.128-0.77-0.268-1.146-0.42 c-0.162-0.065-0.324-0.129-0.484-0.199c-0.434-0.19-0.861-0.396-1.277-0.617c-0.091-0.048-0.186-0.09-0.277-0.141 c-0.515-0.282-1.016-0.586-1.502-0.914c-0.07-0.047-0.136-0.101-0.206-0.15c-5.032-3.485-8.341-9.293-8.341-15.864 C105.943,204.781,114.598,196.126,125.235,196.126z M124.257,359.29c-4.661,0-8.44,3.778-8.44,8.44v127.391H17.442v-125.94 l92.767-120.852c0.152,0.07,0.311,0.122,0.464,0.189c0.707,0.313,1.421,0.61,2.152,0.878c0.181,0.066,0.365,0.123,0.547,0.186 c0.698,0.243,1.405,0.465,2.121,0.665c0.11,0.03,0.217,0.073,0.327,0.102v83.623c0,4.662,3.779,8.44,8.44,8.44 c4.661,0,8.44-3.778,8.44-8.44v-83.144c4.461-0.928,8.676-2.689,12.468-5.209l61.034,53.276c-0.016,0.047-0.027,0.097-0.043,0.145 c-0.293,0.875-0.556,1.763-0.781,2.667c-0.001,0.007-0.003,0.012-0.005,0.019c-0.225,0.905-0.414,1.824-0.569,2.754 c-0.009,0.054-0.02,0.108-0.029,0.163c-0.143,0.878-0.25,1.767-0.329,2.664c-0.013,0.158-0.025,0.315-0.036,0.473 c-0.065,0.886-0.11,1.777-0.11,2.679c0,0.587,0.017,1.17,0.045,1.75c0.007,0.138,0.018,0.275,0.026,0.413 c0.027,0.466,0.062,0.928,0.106,1.39c0.01,0.108,0.023,0.215,0.034,0.323c0.057,0.542,0.126,1.08,0.206,1.615 c0.001,0.007,0.002,0.012,0.003,0.019c2.155,14.282,12.559,25.78,26.347,29.435v149.719h-98.368V367.73 C132.697,363.068,128.918,359.29,124.257,359.29z M363.196,495.121v-47.824c0-4.662-3.778-8.44-8.44-8.44s-8.44,3.778-8.44,8.44 v47.824h-98.372V345.853c0.514-0.108,1.025-0.228,1.531-0.359c0.092-0.024,0.182-0.053,0.275-0.077 c0.451-0.119,0.899-0.245,1.342-0.383c0.189-0.059,0.375-0.123,0.563-0.185c0.344-0.113,0.688-0.226,1.026-0.348 c0.206-0.074,0.408-0.152,0.612-0.23c0.32-0.122,0.637-0.245,0.952-0.376c0.205-0.084,0.408-0.172,0.611-0.26 c0.312-0.135,0.62-0.276,0.926-0.42c0.196-0.092,0.392-0.185,0.586-0.279c0.317-0.156,0.631-0.318,0.944-0.484 c0.174-0.092,0.351-0.182,0.524-0.278c0.36-0.198,0.713-0.404,1.067-0.613c0.118-0.071,0.24-0.137,0.358-0.209 c0.471-0.287,0.935-0.585,1.392-0.893c0.074-0.05,0.145-0.104,0.219-0.154c0.377-0.259,0.751-0.523,1.117-0.796 c0.145-0.108,0.287-0.221,0.431-0.331c0.291-0.224,0.582-0.45,0.868-0.682c0.156-0.128,0.311-0.259,0.465-0.389 c0.266-0.224,0.529-0.451,0.789-0.683c0.155-0.138,0.309-0.279,0.462-0.421c0.254-0.235,0.505-0.476,0.753-0.718 c0.145-0.142,0.291-0.285,0.434-0.429c0.258-0.26,0.509-0.527,0.757-0.794c0.124-0.133,0.249-0.263,0.37-0.397 c0.302-0.334,0.595-0.675,0.883-1.02c0.062-0.073,0.126-0.145,0.188-0.219c0.35-0.425,0.691-0.859,1.022-1.3 c0.074-0.098,0.143-0.2,0.216-0.299c0.251-0.342,0.498-0.685,0.737-1.036c0.106-0.155,0.208-0.315,0.312-0.473 c0.198-0.3,0.395-0.603,0.584-0.91c0.11-0.178,0.216-0.358,0.323-0.538c0.176-0.295,0.347-0.592,0.513-0.892 c0.105-0.188,0.207-0.376,0.308-0.566c0.162-0.304,0.318-0.612,0.473-0.92c0.093-0.188,0.188-0.375,0.278-0.565 c0.158-0.333,0.308-0.67,0.456-1.007c0.074-0.17,0.152-0.336,0.223-0.507c0.186-0.442,0.361-0.889,0.529-1.34 c0.026-0.07,0.055-0.138,0.081-0.208c0.191-0.522,0.37-1.051,0.537-1.584c0.048-0.154,0.091-0.312,0.137-0.467 c0.114-0.38,0.225-0.762,0.326-1.147c0.053-0.203,0.1-0.406,0.151-0.609c0.084-0.344,0.165-0.691,0.241-1.039 c0.047-0.219,0.09-0.441,0.133-0.662c0.066-0.34,0.127-0.681,0.183-1.023c0.037-0.225,0.073-0.451,0.106-0.677 c0.051-0.35,0.095-0.703,0.135-1.057c0.025-0.219,0.052-0.438,0.073-0.658c0.037-0.387,0.064-0.776,0.089-1.167 c0.012-0.188,0.028-0.375,0.037-0.564c0.028-0.581,0.045-1.164,0.045-1.75c0-0.694-0.025-1.383-0.063-2.067 c-0.01-0.168-0.026-0.334-0.038-0.501c-0.038-0.538-0.086-1.074-0.147-1.605c-0.018-0.159-0.039-0.317-0.061-0.475 c-0.073-0.566-0.159-1.128-0.258-1.685c-0.02-0.111-0.039-0.223-0.06-0.334c-0.125-0.668-0.266-1.331-0.428-1.986v-0.002 c-0.345-1.4-0.771-2.767-1.275-4.098c-0.024-0.064-0.051-0.127-0.075-0.19c-0.21-0.548-0.434-1.09-0.671-1.625 c-0.08-0.182-0.163-0.363-0.246-0.545c-0.186-0.401-0.378-0.798-0.577-1.191c-0.078-0.154-0.145-0.312-0.225-0.465l64.073-68.826 c0.074,0.033,0.151,0.056,0.225,0.089c0.612,0.261,1.232,0.504,1.861,0.731c0.273,0.099,0.55,0.188,0.826,0.28 c0.441,0.147,0.886,0.287,1.335,0.419c0.277,0.081,0.552,0.162,0.83,0.236c0.672,0.179,1.348,0.343,2.035,0.483 c0.178,0.036,0.358,0.062,0.536,0.096c0.572,0.108,1.147,0.203,1.726,0.282c0.118,0.016,0.234,0.043,0.352,0.057v186.003 c0,4.662,3.778,8.44,8.44,8.44s8.44-3.778,8.44-8.44V225.694c0.857-0.309,1.697-0.656,2.524-1.027c0.04-0.018,0.08-0.036,0.12-0.054 c11.644-5.282,20.01-16.552,21.144-29.859c0.015-0.164,0.026-0.329,0.038-0.494c0.062-0.86,0.104-1.724,0.104-2.599 c0-0.692-0.024-1.378-0.063-2.06c-0.009-0.165-0.026-0.331-0.038-0.496c-0.038-0.538-0.086-1.072-0.146-1.604 c-0.018-0.155-0.039-0.311-0.06-0.466c-0.072-0.565-0.158-1.125-0.255-1.681c-0.019-0.11-0.038-0.222-0.06-0.332 c-0.122-0.655-0.26-1.304-0.416-1.947c-0.003-0.012-0.006-0.026-0.009-0.038c-0.343-1.399-0.767-2.767-1.268-4.097 c-0.012-0.033-0.027-0.065-0.039-0.099c-0.219-0.578-0.456-1.149-0.703-1.713c-0.075-0.172-0.154-0.343-0.233-0.514 c-0.189-0.411-0.385-0.817-0.589-1.22c-0.071-0.142-0.133-0.287-0.206-0.428l72.211-77.569c0.026,0.014,0.052,0.025,0.078,0.038 c2.283,1.203,4.709,2.167,7.248,2.864v394.822H363.196z"></path> </g></svg>
            </div>
            </li>
            <span>Gráfico de Líneas</span>
            <li>
            <div class="opcion-boton">
            <svg onclick="AbrirModalCrearGrafico('scatter')" width="70px" height="70px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#444" d="M1 15v-15h-1v16h16v-1h-15z"></path> <path fill="#444" d="M5 11c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path> <path fill="#444" d="M8 6c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path> <path fill="#444" d="M14 5c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path> <path fill="#444" d="M11 10c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path> </g></svg>
            </div>
            </li>
            <span>Gráfico de Dispersión</span>
            <li>
            <div class="opcion-boton">
            <svg width="70px" onclick="AbrirModalCrearFiltro()" height="70px" viewBox="0 0 72 72" id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="color"> <polyline fill="#fcea2b" stroke="none" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" points="36,10.9792 11,10.9792 11,16.0207 31.5,34.25 31.5,56.021 40.5,60.9792 40.5,34.25 61,16.0208 61,10.9792 36,10.9792"></polyline> <polygon fill="#F1B31C" stroke="none" points="36,57.1932 36,57.1932 39.2683,58.875 39.2683,33.9081 59.7683,15.5833 59.7683,12.1715 49.5183,12.1715 49.5183,16.0254 36.0183,32.8581"></polygon> <path fill="#fcea2b" stroke="none" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M68.0011,43.9411"></path> </g> <g id="hair"></g> <g id="skin"></g> <g id="skin-shadow"></g> <g id="line"> <polyline fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" points="36,10.9792 11,10.9792 11,16.0207 31.5,34.25 31.5,56.021 40.5,60.9792 40.5,34.25 61,16.0208 61,10.9792 36,10.9792"></polyline> <path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M68.0011,43.9411"></path> </g> </g></svg>
            </div>
            </li>
            <span>Agregar Filtro</span>

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
      var divFlecha=document.getElementById("divFlecha");
      var sidebarRightStyle = getComputedStyle(sidebar).right;
      var svgAbrir='<svg fill="#000000" width="72px" height="72px" viewBox="0 0 1920.00 1920.00" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="30.72"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m1352.005.012 176.13 176.13-783.864 783.989 783.864 783.74L1352.005 1920 391.887 960.13z" fill-rule="evenodd"></path> </g></svg>';
      var svgCerrar='<svg fill="#000000" width="72px" height="72px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="40.32"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M568.13.012 392 176.142l783.864 783.989L392 1743.87 568.13 1920l960.118-959.87z" fill-rule="evenodd"></path> </g></svg>';
    
      if (!sidebarRightStyle) {
        sidebar.style.right = "0";
      } else if (sidebarRightStyle === "-300px") {
        sidebar.style.right = "0";
        divFlecha.innerHTML=svgCerrar;
      } else {
        sidebar.style.right = "-300px";
        divFlecha.innerHTML= svgAbrir;
      }
    }
    
    

  
  // this function is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

// Escuchar el evento de cambio de tamaño del contenedor


