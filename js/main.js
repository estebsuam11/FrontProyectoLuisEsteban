const btn = document.querySelector('#menu-btn');
        const menu = document.querySelector('#sidemenu');
    
        btn.addEventListener('click', e =>{
            menu.classList.toggle("menu-expanded");
            menu.classList.toggle("menu-collapsed");
    
            document.querySelector('body').classList.toggle('body-expanded');
    });

const globalData = []  ;


function habilitarBoton() {
        // Obtén el input de tipo file y el botón
        var archivoInput = document.getElementById('file-3');
        var botonCargar = document.getElementById('botonCargar');
      
        // Habilita el botón si se ha seleccionado un archivo
        botonCargar.disabled = !archivoInput.value;
      }

    //CARGAR ARCHIVOS

async function enviarArchivo() {
        var formData = new FormData();
        var archivoCapturado = document.getElementById('file-3');
        var departamento = document.getElementById('departamento');
        formData.append('Archivo', archivoCapturado.files[0]);
        formData.append('Departamento', departamento.value);

        $.ajax({
            url: 'https://localhost:7132/api/ETL/ProbarExtraccionExcel', // Reemplaza '/api/tu-endpoint' con la URL de tu endpoint en ASP.NET
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
                console.log('Archivo enviado correctamente', data);
                globalData.push(JSON.parse(data.objetoCreado));
                MostrarDatos();
        },
        error: function (error) {
                
                console.error('Error al enviar el archivo', error.responseText);
        }
        });
}

async function guardarDataEnDataLake() {
    try {
        // Muestra la rueda de carga aquí

       

        // Espera a que la promesa se resuelva
        await $.ajax({
            url: 'https://localhost:7132/api/ETL/CargarObjetos',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(globalData[0]),
        });

        // Oculta la rueda de carga aquí

        console.log('Archivo enviado correctamente');

    } catch (error) {
        // Oculta la rueda de carga aquí

        const errorMessage = error.responseJSON?.error || 'Error desconocido';
        console.error('Error al enviar el archivo', errorMessage);
    }
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

        var tabla = $('#tablaDatos').DataTable();

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







