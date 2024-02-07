const btn = document.querySelector('#menu-btn');
        const menu = document.querySelector('#sidemenu');
    
        btn.addEventListener('click', e =>{
            menu.classList.toggle("menu-expanded");
            menu.classList.toggle("menu-collapsed");
    
            document.querySelector('body').classList.toggle('body-expanded');
    });

const globalData = []  ;
nombresColumnas=[];


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



async function guardarDataEnDataLake() {
    // Mostrar el spinner mientras se envía la solicitud
    var spinner = new Spinner().spin(document.body);

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
        console.error(errorMessage);
    }
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


// Función para manejar el evento de arrastrar sobre la zona de soltar
function dragOverHandler(event) {
    event.preventDefault(); // Detener el comportamiento predeterminado del navegador
}

// Obtener la zona de soltar archivos
var dropZone = document.getElementById('dropZone');

// Agregar eventos de arrastrar y soltar a la zona destinada para soltar archivos
dropZone.addEventListener('dragover', dragOverHandler);
dropZone.addEventListener('drop', dropHandler);


// Agregar el evento drop al contenedor donde se permite soltar archivos




function ajustarModal() {
    // Obtener el contenedor modal
    var modalContainer = document.querySelector(".modal__container");

    // Aplicar el tamaño fijo al contenedor modal
    modalContainer.style.width = "80%"; // Por ejemplo, ajusta el ancho según tu preferencia
    modalContainer.style.height = "70%"; // Por ejemplo, ajusta la altura según tu preferencia
}

function agregarBotonGuardarDatos() {
    // Crear el botón
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.textContent = "Guardar Datos";

    // Agregar el botón al modal
    var modalContainer = document.querySelector(".modal__container");
    modalContainer.appendChild(botonGuardar);
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
            scrollX: true,
            scrollY: "300px",
  scrollCollapse: true,
        });

        agregarBotonGuardarDatos();
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







