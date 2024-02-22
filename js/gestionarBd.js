function crearTablasGestion(id, DatosDataLake) {
    var tabla = document.createElement("table");
    var tablaId = "tablaGestionarDatos-" + id; 
    tabla.id = tablaId;
    tabla.className = "display"; 
    // Agregar el atributo cellspacing="0" y width="100%"
    tabla.setAttribute("cellspacing", "0");
    tabla.setAttribute("width", "100%");

    // Crear thead y tbody
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");
    tabla.appendChild(thead);
    // Crear cabeceras de la tabla y agregarlas a thead
    var filaCabecera=thead.insertRow();
    var encabezados = CrearCabecerasTabla(Object.keys(DatosDataLake[0]),filaCabecera);
    thead.appendChild(encabezados);

    // Crear filas de datos y agregarlas a tbody
    DatosDataLake.forEach(objetoDataLake => {
        var row = document.createElement('tr');
        Object.values(objetoDataLake).forEach(value => {
            var cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = value;
            row.append(cell);
        });
        tbody.append(row);
    });

    // Agregar thead y tbody a la tabla

    tabla.appendChild(tbody);

    // Agregar la tabla al contenedor deseado
  document.getElementById("vistaGestionarDatos").appendChild(tabla);
  document.getElementById("vistaGestionarDatos").style.overflowY = "auto"; 

    // Ocultar el contenedor de carga de archivos
    var consultarDatosContainer = document.getElementById("consultarDatosContainer");
    consultarDatosContainer.style.display = "none";
}

function CombinarDatosDataLake(){
    var discrepancias=verificarColumnasElementosDataLake();
    if(discrepancias.length>0){
        toastr.error("hay discrepancias entre los objetos del dataLake" );
        let idsConDiscrepancias = discrepancias.map(obj => obj.id);
        MarcarDivErroneo(idsConDiscrepancias);
    }else{
        let objetoCombinado = {
            "datos": [],
            "departamentoOrigen": DatosDataLake[0].departamentoOrigen
          };
          
          // Recorrer el array de objetos y combinar los datos
          DatosDataLake.forEach(objeto => {
            objetoCombinado.datos.push(...objeto.datos);
          });
          GuardarDataCombinadaEnDataSet(objetoCombinado);
    }
}

function MarcarDivErroneo(idsDiscrepancias){
    idsDiscrepancias.forEach(id=>{
        var elemento=document.getElementById("tablaGestionarDatos-"+id+"_wrapper")
        elemento.style.backgroundColor="#F1D90F"
    });
}


function verificarColumnasElementosDataLake() {
    let maxColumnas = DatosDataLake.reduce((max, obj) => {
        return Math.max(max, Object.keys(obj.datos[0]).length);
    }, 0);

    let discrepancias = [];
    DatosDataLake.forEach(obj => {
        let numColumnas = Object.keys(obj.datos[0]).length;
        if (numColumnas !== maxColumnas) {
            discrepancias.push({ id: obj.id, cantidadCampos: numColumnas });
        }
    });

    return discrepancias;
}


function CrearCabecerasTabla(llaves,filaCabecera){
    
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
            scrollCollapse: true,
            scrollY: '200px',
            scrollX:'100px'
        });

        let elementoCreado=document.getElementById("tablaGestionarDatos-" + idTabla+"_wrapper");
        elementoCreado.style.border="solid";
        elementoCreado.style.marginBottom="30px";
    });
}

function agregarBotonCombinarDatos() {
    // Crear el botón
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.textContent = "Centralizar Datos";
    botonGuardar.onclick = function() {
        CombinarDatosDataLake();
    };
    modalGestionarData

    // Agregar el botón al modal
    var gestionarDatosContainer = document.getElementById("modalGestionarData");

    gestionarDatosContainer.appendChild(botonGuardar);
}