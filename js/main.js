const dataSetDashboard=[];
const globalData = []  ;
nombresColumnas=[];
var DatosDataLake;
const listadoDepartamentos=['Ventas','Marketing','Recursos Humanos','SST']
const listadoDeGraficos=["Barras","Torta","Rosquilla","Líneas"]




function mostrarTabla() {
    var inputFile = document.getElementById("file-3");
    var botonCargar = document.getElementById("botonCargar");
    var tablaContainer = document.getElementById("tablaContainer");

    if (inputFile.files.length > 0) {
        botonCargar.hidden=false;
    } else {
        botonCargar.disabled = true;
    }
    
    // Mostrar el contenedor de la tabla y ocultar el contenedor de carga de archivos
    tablaContainer.style.display = "block";
}

async function enviarArchivo() {
    // Mostrar el spinner mientras se envía la solicitud
    var spinner = new Spinner().spin(document.body);

    var formData = new FormData();
    var archivoCapturado = document.getElementById('file-3');
    var departamento = document.getElementById('departamento');
    formData.append('Archivo', archivoCapturado.files[0]);
    formData.append('Departamento', departamento.value);
    const startTime = performance.now();

    $.ajax({
        url: 'https://localhost:7132/api/ETL/ProbarExtraccionExcel',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            // Se ejecuta antes de enviar la solicitud
            spinner.spin(document.body);
       
        },
        success: function (data) {
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`La consulta tardó ${elapsedTime} milisegundos`);
            globalData.push(JSON.parse(data.objetoCreado));
            toastr.success("Data Extraida correctamente");
            var cargarArchivoContainer = document.getElementById("cargarArchivoContainer");
            cargarArchivoContainer.style.display = "none";
            MostrarDatos();
            ajustarModal();
        },
        error: function (error) {
            console.error('Error al enviar el archivo', error.responseText);

            // Verificar si el código de estado es 412 (Precondition Failed)
            if (error.status === 412) {
                // Mostrar un toast de error utilizando Toastr
                toastr.error(error.responseJSON.error);
            }
            spinner.stop();

        },
        complete: function () {
            // Se ejecuta después de que se completa la solicitud (éxito o error)
            spinner.stop();
        }
    });
}


function PurificarDatos() {
    var datosAntes = globalData[0].Datos.length;
    datosLimpios = globalData[0].Datos.filter(registro => {
        return !Object
            .values(registro)
            .some(value => value === null || value === "" || value === undefined);
    });
    globalData[0].Datos.length = 0;
    globalData[0].Datos=datosLimpios;
    var registrosEliminados = datosAntes - globalData[0].Datos.length;
    toastr.success("Se han limpiado " + registrosEliminados + " registros erroneos de los "+ datosAntes + " registros originales");
  }
  

async function guardarDataEnDataLake() {
    // Mostrar el spinner mientras se envía la solicitud
    var spinner = new Spinner().spin(document.body);
    extraerInformacionDataTable();
    try {
        var response = await $.ajax({
            url: 'https://localhost:7132/api/ETL/CargarObjetos',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(globalData[0]),
        });
        // Oculta la rueda de carga aquí
        spinner.stop();

        toastr.success(response.message );

    } catch (error) {
        // Oculta la rueda de carga aquí
        spinner.stop();

        const errorMessage = error.responseJSON?.error || 'Error desconocido';
        toastr.error(errorMessage );
    }
}


async function GuardarDataCombinadaEnDataSet(datosCombinados) {
    // Mostrar el spinner mientras se envía la solicitud
    var spinner = new Spinner().spin(document.body);
    try {
        var response = await $.ajax({
            url: 'https://localhost:7132/api/ETL/CargarDataCombinadaAlDataSet',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datosCombinados),
        });
        // Oculta la rueda de carga aquí
        spinner.stop();

        toastr.success(response.message );

    } catch (error) {
        // Oculta la rueda de carga aquí
        spinner.stop();

        const errorMessage = error.responseJSON?.error || 'Error desconocido';
        toastr.error(errorMessage );
    }
}


async function ObtenerDataSetPordepartamento(departamento){
    var spinner = new Spinner().spin(document.body);

    try {
        var response = await $.ajax({
            url: 'https://localhost:7132/api/ETL/ObtenerDataFinalDataSetPorDepartamento',
            type: 'GET',
            contentType: 'application/json',
            data:{codigoDepartamento: departamento },
        });
        spinner.stop();
        dataSetDashboard.push(response.datos);
        ExtrarNombresCamposColumnas();
        AgregarLienzoADashboard();
        toastr.success("Dataset para el departamento de"+" "+departamento+" "+"encontrado satisfactoriamente");
    } catch (error) {
        // Oculta la rueda de carga aquí
        spinner.stop();

        const errorMessage = error.responseJSON?.error || 'Error desconocido';
        toastr.error(errorMessage);
    }
}

async function ObtenerDataPorDepartamento() {
    // Mostrar el spinner mientras se envía la solicitud
    var spinner = new Spinner().spin(document.body);
    var departamento = document.getElementById('departamentoAGestionar').value;

    try {
        var response = await $.ajax({
            url: 'https://localhost:7132/api/ETL/ObtenerDataLakesPorDepartamento',
            type: 'GET',
            contentType: 'application/json',
            data:{codigoDepartamento: departamento },
        });
        spinner.stop();
        DatosDataLake=response;
        toastr.success("Se ha realizado la consulta de los datos del departamento"+" "+departamento+" "+"satisfactoriamente");

    } catch (error) {
        // Oculta la rueda de carga aquí
        spinner.stop();

        const errorMessage = error.responseJSON?.error || 'Error desconocido';
        toastr.error(errorMessage);
    }

    var ids = DatosDataLake.map(function(objeto) {
        return objeto.id;
    });

       rellenarModalRegistros();
       ConvertirTablasADataTables(ids);
       mostrarGestionadorBd();
}




function abrirModalNombresColumnas(){
     var tabla = $('#tablaDatos').DataTable()
     nombresColumnas=tabla.columns().header().map(d => d.textContent).toArray()
}

function guardarNombresColumnas(){
    var tabla = $('#tablaDatos').DataTable()
    nombresColumnas.forEach((nombre, index) => {
        $(tabla.column(index).header()).text(nombre);
    });
}

function extraerInformacionDataTable(){
    var tabla = $('#tablaDatos').DataTable()
    var datosTabla = tabla.rows().data().toArray();
    var Datos = [];

datosTabla.forEach(function (fila) {
    var filaObj = {};
    tabla.columns().header().each(function (columna, index) {
        var nombreColumna = $(columna).text();
        filaObj[nombreColumna] = fila[index];
    });

    Datos.push(filaObj);
});

globalData.Datos=Datos;
}

function dragEnterHandler(event) {
    event.preventDefault();
}

function dragLeaveHandler(event) {
    event.preventDefault();
}
// Función para manejar el evento de soltar archivos
// Función para manejar el evento de soltar archivos
function dropHandler(event) {
    event.preventDefault();
    
    // Obtener el archivo del evento de arrastre
    const file = event.dataTransfer.files[0];
    
    // Asignar el archivo al input file
    const inputFile = document.getElementById('file-3');
    inputFile.files = event.dataTransfer.files;
    
    // Mostrar el nombre del archivo en el span
    const fileNameSpan = document.querySelector('#nombreArchivo');
fileNameSpan.textContent = file.name;

mostrarTabla()

}

function CargarTableroVacio() {
    var divCuerpoPagina = document.getElementById('cuerpoPagina');
    divCuerpoPagina.innerHTML = '';

    var button = document.createElement("button");
    button.onclick = function() {
        CargarVistaParcialListaGraficos();
    };

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "200");
    svg.setAttribute("height", "200");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.style.backgroundColor = "#F5F7FA";

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 8V16M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);
    button.appendChild(svg);

    var texto = document.createElement("span");
    texto.innerHTML = "Añadir Gráfico";

    // Se crea un contenedor div para el texto
    var divTexto = document.createElement("div");
    divTexto.appendChild(texto);

    // Se añade el contenedor div del texto al botón
    button.appendChild(divTexto);

    divCuerpoPagina.appendChild(button);
}




function CargarVistaParcialListaGraficos(event){
    event.preventDefault(); 
    var divEnlacesEditables = document.getElementById('cuerpoPagina');
divEnlacesEditables.style.opacity = 0;

    // Espera un breve momento para que la animación se inicie
    setTimeout(function() {
        // Elimina todos los elementos hijos del contenedor de enlaces
        divEnlacesEditables.innerHTML = '';
        var contenedorDashboard = document.createElement("div");
contenedorDashboard.setAttribute("id", "contenedorDashboard");
contenedorDashboard.style.paddingTop = "20px";
contenedorDashboard.classList.add("mi-opfavo");

// Crear el elemento div enlacesEditables
var enlacesEditables = document.createElement("div");

enlacesEditables.setAttribute("id", "enlacesEditables");
enlacesEditables.classList.add("enlaces", "flex-container");

listadoDeGraficos.forEach(nombre=>{
    var nuevoGrupo=crearElementoGrupo(nombre,false);
    enlacesEditables.appendChild(nuevoGrupo);
    
    });
// Agregar el elemento enlacesEditables como hijo de contenedorDashboard
contenedorDashboard.appendChild(enlacesEditables);

// Agregar contenedorDashboard al divEnlacesEditables
divEnlacesEditables.appendChild(contenedorDashboard);

    
        divEnlacesEditables.style.opacity = 1;
    }, 500);
}

function CargarVistaParcialListaDepartamentos(){
var divEnlacesEditables = document.getElementById('enlacesEditables');
divEnlacesEditables.style.opacity = 0;

    // Espera un breve momento para que la animación se inicie
    setTimeout(function() {
        // Elimina todos los elementos hijos del contenedor de enlaces
        divEnlacesEditables.innerHTML = '';

        listadoDepartamentos.forEach(nombre=>{
            var nuevoGrupo=crearElementoGrupo(nombre,true);
            divEnlacesEditables.appendChild(nuevoGrupo);
            
            });
        divEnlacesEditables.style.opacity = 1;
    }, 500);


}

function crearElementoGrupo(nombreDepartamento,bandera){

var nuevoGrupo = document.createElement('div');
nuevoGrupo.classList.add('grupo');
var nuevoEnlace = document.createElement('a');
nuevoEnlace.href = "#";
nuevoEnlace.onclick = function() {
    ObtenerDataSetPordepartamento(nombreDepartamento.toLowerCase());
};
var nuevoDivEnlace = document.createElement('div');
nuevoDivEnlace.classList.add('enlace');
var nuevoTituloEnlace = document.createElement('span');
nuevoTituloEnlace.classList.add('titulo-enlace');
nuevoTituloEnlace.textContent = nombreDepartamento;
nuevoDivEnlace.appendChild(nuevoTituloEnlace);
nuevoEnlace.appendChild(nuevoDivEnlace);
nuevoGrupo.appendChild(nuevoEnlace);

return nuevoGrupo;
}

 


function dragOverHandler(event) {
    event.preventDefault(); // Detener el comportamiento predeterminado del navegador
}

var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', dragOverHandler);
dropZone.addEventListener('drop', dropHandler);





function ajustarModal() {
    // Obtener el contenedor modal
    var modalContainer = document.querySelector(".modal__container");

    // Aplicar el tamaño fijo al contenedor modal
    modalContainer.style.width = "80%"; // Por ejemplo, ajusta el ancho según tu preferencia
    modalContainer.style.height = "70%"; // Por ejemplo, ajusta la altura según tu preferencia
}

function agregarBotonGuardarDatos() {
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.textContent = "Guardar Datos";
    botonGuardar.onclick = function() {
        guardarDataEnDataLake();
    };
    var modalContainer = document.getElementById("tablaContainer");
    modalContainer.appendChild(botonGuardar);
}

function ResetearModalCargarDatos(){
    var divContenedor = document.getElementById("tablaContainer");

// Crear la tabla y asignarle el HTML
var tabla = document.createElement("table");
tabla.id = "tablaDatos";
tabla.className = "display";
tabla.setAttribute("cellspacing", "0");
tabla.setAttribute("width", "100%");
tabla.innerHTML = `
    <thead></thead>
    <tbody></tbody>
`;
divContenedor.appendChild(tabla);
}

function agregarBotonIrAtrasModalCargar() {
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.textContent = "Elegir otro archivo";
    botonGuardar.onclick = function() {
       
        var cargarArchivoContainer = document.getElementById("cargarArchivoContainer");
        tablaContainer
        var  tablaContainer = document.getElementById("tablaContainer");
        tablaContainer.innerHTML='';
        tablaContainer.style.display="none";
        ResetearModalCargarDatos();
        cargarArchivoContainer.style.display = "block";
    };
    var modalContainer = document.getElementById("tablaContainer");
    modalContainer.appendChild(botonGuardar);
}

function AgregarBotonPurificarDatos(){
    var botonPurificar = document.createElement("button");
    botonPurificar.setAttribute("type", "button");
    botonPurificar.classList.add("cargar");
    botonPurificar.textContent = "Purificar Datos";
    botonPurificar.onclick = function() {
        PurificarDatos();
    };

    var modalContainer = document.getElementById("tablaContainer");
    modalContainer.appendChild(botonPurificar);
}

function MostrarDatos(){
        // Obtén la tabla y el cuerpo de la tabla
        var tabla = $('#tablaDatos');
        var llaves = Object.keys(globalData[0].Datos[0]);
        var filaCabecera = tabla[0].tHead.insertRow();

        // Itera sobre las llaves e agrega celdas a la fila de cabecera
        llaves.forEach(function(llave) {
          var celda = document.createElement('td');
          celda.textContent = llave;
          filaCabecera.appendChild(celda);
        });
        // Llena la tabla con los datos
        $.each(globalData[0].Datos, function (index, rowData) {
                var row = $('<tr>');
                
                // Iterar sobre las propiedades de cada objeto y agregar celdas a la fila
                for (var key in rowData) {
                    if (rowData.hasOwnProperty(key)) {
                        row.append($('<td contenteditable="true">').text(rowData[key]));
                    }
                }
                
                // Agregar la fila a la tabla
                tabla.append(row);
            });

        var tabla = $('#tablaDatos').DataTable({
            scrollX: "300px",
            scrollY: "300px",
  scrollCollapse: true,
        });

        agregarBotonGuardarDatos();
        AgregarBotonPurificarDatos();
        agregarBotonIrAtrasModalCargar();
   // Habilitar la edición para la columna con la clase "editable"
   $('#tablaDatos').on('click', 'tr[contenteditable="true"]', function () {
        $(this).attr('contenteditable', 'true').focus();
      });

 // Deshabilitar la edición al hacer clic fuera de la celda
 $('#tablaDatos').on('blur', 'td[contenteditable="true"]', function() {
        $(this).attr('contenteditable', 'false');
        // Aquí puedes agregar lógica para guardar los cambios en tu backend
        // Puedes acceder al valor modificado usando $(this).text()
      });

      };

      
    
      function GestionarRegistrosDataWareHouse(opcion) {
        const contenidoDerecha = document.getElementById('opfavo');
    
        // Limpiar el contenido anterior si es necesario
        contenidoDerecha.innerHTML = '';
    
        // Lógica para cargar el contenido según la opción seleccionada
        if (opcion === 'opcion1') {
            contenidoDerecha.innerHTML = '<p>Contenido para la opción 1</p>';
        } else if (opcion === 'opcion2') {
            contenidoDerecha.innerHTML = '<p>Contenido para la opción 2</p>';
        }
        // Añade más casos según tus necesidades
    
        // Evita que el enlace redireccione a otra página
        return false;
    }

// TABLA



    //FUNCION SUBIR ARCHIVOS


//SUBIR ARCHIVO

'use strict';

;( function ( document, window, index )
{
	var inputs = document.querySelectorAll( '.inputfile' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				label.querySelector( 'span' ).innerHTML = fileName;
			else
				label.innerHTML = labelVal;
		});
	});
        
}( document, window, 0 ));







