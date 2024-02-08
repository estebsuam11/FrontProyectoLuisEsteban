function crearTablasGestion(id, DatosDataLake) {
    var tabla = document.createElement("table");
    var tablaId = "tablaGestionarDatos-" + id; 
    tabla.id = tablaId;
    tabla.className = "display"; // Agregar la clase "display"

    // Agregar el atributo cellspacing="0" y width="100%"
    tabla.setAttribute("cellspacing", "0");
    tabla.setAttribute("width", "100%");

    // Crear thead y tbody
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");

    // Crear cabeceras de la tabla y agregarlas a thead
    var filasCabecera = CrearCabecerasTabla(Object.keys(DatosDataLake[0]));
    thead.appendChild(filasCabecera);

    // Crear filas de datos y agregarlas a tbody
    DatosDataLake.forEach(objetoDataLake => {
        var row = document.createElement('tr');
        Object.values(objetoDataLake).forEach(value => {
            var cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = value;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    // Agregar thead y tbody a la tabla
    tabla.appendChild(thead);
    tabla.appendChild(tbody);

    // Agregar la tabla al contenedor deseado
  document.getElementById("vistaGestionarDatos").appendChild(tabla);
  document.getElementById("vistaGestionarDatos").style.overflowY = "auto"; 

    // Ocultar el contenedor de carga de archivos
    var consultarDatosContainer = document.getElementById("consultarDatosContainer");
    consultarDatosContainer.style.display = "none";
}




function CrearCabecerasTabla(llaves){
    var filaCabecera = document.createElement("tr");
    
    llaves.forEach(function(llave) {
        var celdaCabecera = document.createElement('td'); 
        celdaCabecera.textContent = llave;
        filaCabecera.appendChild(celdaCabecera);
    });

    return filaCabecera;

}


function mostrarGestionadorBd() {
    var elegirDepartamento = document.getElementById("departamento");
    var botonCargar = document.getElementById("botonConsultarDatos");
    var tablaContainer = document.getElementById("vistaGestionarDatos");

    if (elegirDepartamento.selectedIndex === -1) {
        botonCargar.hidden=false;
    } else {
        botonCargar.disabled = true;
    }
    
    tablaContainer.style.display = "block";
}

function rellenarModalRegistros(){

    DatosDataLake.forEach(data=>{
        crearTablasGestion(data.id,data.datos);
    });

    var consultarDatosContainer = document.getElementById("consultarDatosContainer");
    consultarDatosContainer.style.display = "none";

    agregarBotonCombinarDatos();
}

function ConvertirTablasADataTables(listaIds){
    listaIds.forEach(idTabla=>{
        $('#tablaGestionarDatos-' + idTabla).DataTable({
            scrollX: true,
            scrollY: "300px",
            scrollCollapse: true
        });
    });
}

function agregarBotonCombinarDatos() {
    // Crear el botón
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.textContent = "Centralizar Datos";
    // botonGuardar.onclick = function() {
    //     guardarDataEnDataLake();
    // };
    modalGestionarData

    // Agregar el botón al modal
    var gestionarDatosContainer = document.getElementById("modalGestionarData");

    gestionarDatosContainer.appendChild(botonGuardar);
}