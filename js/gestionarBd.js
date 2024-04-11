function crearTablasGestion(id, DatosDataLake) {
    var container = document.createElement("div");
    container.className = "tabla-container";
    container.id="div_contenedor_tablaGestionarDatos-" + id
    var tabla = document.createElement("table");
    var tablaId = "tablaGestionarDatos-" + id; 
    tabla.id = tablaId;
    tabla.className = "display"; 
    tabla.setAttribute("cellspacing", "0");
    tabla.setAttribute("width", "100%");
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");
    tabla.appendChild(thead);
    var filaCabecera=thead.insertRow();
    var encabezados = CrearCabecerasTabla(Object.keys(DatosDataLake[0]),filaCabecera);
    thead.appendChild(encabezados);
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
    tabla.appendChild(tbody);
    var deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '<i class="fa fa-trash"></i>'; 
    deleteButton.addEventListener('click', function() {
        EliminarRegistroPorId(id);
    });
    deleteButton.style.fontSize = '20px';
    deleteButton.style.color = 'red';

    container.appendChild(deleteButton);
    container.appendChild(tabla);
    document.getElementById("vistaGestionarDatos").appendChild(container);
    document.getElementById("vistaGestionarDatos").style.overflowY = "auto"; 
    var consultarDatosContainer = document.getElementById("consultarDatosContainer");
    consultarDatosContainer.style.display = "none";
}

function EliminarRegistroDataLake(id) {
    var vista = document.getElementById("vistaGestionarDatos");
    var elemento = vista.querySelector("#" + "div_contenedor_tablaGestionarDatos-" + id);
    if (elemento) {
        var modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
        modal.show();

        document.getElementById('confirmarEliminar').addEventListener('click', function() {
            EliminarRegistroPorId(id);
            // vista.removeChild(elemento);
            modal.hide();
        });
    }
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
    agregarBotonVolverGestionDataLake();
}


function rellenarModalDataSet(data){
    RellenarModalDatosDataSet(data);
    $('#tablaGestionarDatosDataSet').DataTable({
        scrollCollapse: true,
        scrollY: '200px',
        scrollX:'100px'
    });

    let elementoCreado=document.getElementById("tablaGestionarDatosDataSet");
    elementoCreado.style.border="solid";
    elementoCreado.style.marginBottom="30px";
    var consultarDatosContainer = document.getElementById("consultarDatosDataSetContainer");
    consultarDatosContainer.style.display = "none";
    document.getElementById("vistaGestionarDatosDataSet").style.display="block";

    agregarBotonVolver();
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
    var botonGuardar = document.createElement("button");
    botonGuardar.setAttribute("type", "button");
    botonGuardar.classList.add("cargar");
    botonGuardar.id="botonGuardarDataLake"
    botonGuardar.textContent = "Centralizar Datos";
    botonGuardar.onclick = function() {
        CombinarDatosDataLake();
    };
    
    var botonVolver = document.createElement("button");
    botonVolver.setAttribute("type", "button");
    botonVolver.classList.add("cargar");
    botonVolver.textContent = "Volver";
    botonVolver.id="botonVolverDataLake"
    botonVolver.onclick = function() {
        VolerAtrasConsultaDataLake();
    };
    
    var gestionarDatosContainer = document.getElementById("modalGestionarData");
    gestionarDatosContainer.appendChild(botonGuardar);
    gestionarDatosContainer.appendChild(botonVolver);
}

function agregarBotonVolver() {
    var botonVolver = document.createElement("button");
    botonVolver.setAttribute("type", "button");
    botonVolver.classList.add("cargar");
    botonVolver.id="botonVolverDataSet"
    botonVolver.textContent = "Volver";
    botonVolver.onclick = function() {
        VolerAtrasConsultaDataSet();
    };
    var gestionarDatosContainer = document.getElementById("modalGestionDataSets");

    gestionarDatosContainer.appendChild(botonVolver);
}

function agregarBotonVolverGestionDataLake() {
    var botonVolver = document.createElement("button");
    botonVolver.setAttribute("type", "button");
    botonVolver.classList.add("cargar");
    botonVolver.id="botonVolverDataLake"
    botonVolver.textContent = "Volver";
    botonVolver.onclick = function() {
        VolerAtrasConsultaDataSet();
    };
    var gestionarDatosContainer = document.getElementById("modalGestionDataSets");

    gestionarDatosContainer.appendChild(botonVolver);
}

function agregarBotonCargarOtroArchivo() {
    var botonVolver = document.createElement("button");
    botonVolver.setAttribute("type", "button");
    botonVolver.classList.add("cargar");
    botonVolver.id="botonCargarOtroArchivo"
    botonVolver.textContent = "Volver";
    botonVolver.onclick = function() {
        VolerAtrasCargarArchivo();
    };
    var gestionarDatosContainer = document.getElementById("tablaContainer");
    gestionarDatosContainer.appendChild(botonVolver);
}

function VolerAtrasCargarArchivo(){
    var gestionarDatosContainer = document.getElementById("contenedorModalCargarDatos");
var botonEliminar = gestionarDatosContainer.querySelector("#botonCargarOtroArchivo");
var vistaTabla = document.getElementById("tablaContainer");
vistaTabla.innerHTML='';
var tablaDatos = document.createElement("table");
tablaDatos.id = "tablaDatos";
tablaDatos.className = "display";
tablaDatos.setAttribute("cellspacing", "0");
tablaDatos.setAttribute("width", "100%");

var thead = document.createElement("thead");
tablaDatos.appendChild(thead);

var tbody = document.createElement("tbody");
tablaDatos.appendChild(tbody);

vistaTabla.appendChild(tablaDatos);

if (botonEliminar) {
    botonEliminar.remove();
}

    vistaTabla.style.direction="none";
    var consultarDatosContainer = document.getElementById("cargarArchivoContainer");
    consultarDatosContainer.style.display = "block";

    gestionarDatosContainer.style='';
}

function VolerAtrasConsultaDataSet(){
    var gestionarDatosContainer = document.getElementById("modalGestionDataSets");
var botonEliminar = gestionarDatosContainer.querySelector("#botonVolverDataSet");
var vistaTabla=document.getElementById("vistaGestionarDatosDataSet");
if (botonEliminar) {
    botonEliminar.remove();
}
    vistaTabla.innerHTML='';
    vistaTabla.style.direction="none";
    var consultarDatosContainer = document.getElementById("consultarDatosDataSetContainer");
    consultarDatosContainer.style.display = "block";
}


function VolerAtrasConsultaDataLake(){
    var gestionarDatosContainer = document.getElementById("modalGestionarData");
var botonEliminar = gestionarDatosContainer.querySelector("#botonVolverDataLake");
var botonGuardar = gestionarDatosContainer.querySelector("#botonGuardarDataLake");

var vistaTabla=document.getElementById("vistaGestionarDatos");
if (botonEliminar) {
    botonEliminar.remove();
}
if (botonGuardar) {
    botonGuardar.remove();
}
var botonCargar = document.getElementById("botonConsultarDatos");
botonCargar.disabled=false;
    vistaTabla.innerHTML='';
    vistaTabla.style.direction="none";
    var consultarDatosContainer = document.getElementById("consultarDatosContainer");
    consultarDatosContainer.style.display = "block";
}

function RellenarModalDatosDataSet(data){
    var tabla = document.createElement("table");
    var tablaId = "tablaGestionarDatosDataSet"; 
    tabla.id = tablaId;
    tabla.className = "display"; 
    tabla.setAttribute("cellspacing", "0");
    tabla.setAttribute("width", "100%");

    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");
    tabla.appendChild(thead);
    var filaCabecera=thead.insertRow();
    var encabezados = CrearCabecerasTabla(Object.keys(data[0]),filaCabecera);
    thead.appendChild(encabezados);
    data.forEach(objetoDataLake => {
        var row = document.createElement('tr');
        Object.values(objetoDataLake).forEach(value => {
            var cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = value;
            row.append(cell);
        });
        tbody.append(row);
    });

    tabla.appendChild(tbody);

  document.getElementById("vistaGestionarDatosDataSet").appendChild(tabla);
  document.getElementById("vistaGestionarDatosDataSet").style.overflowY = "auto"; 
    var consultarDatosContainer = document.getElementById("consultarDatosDataSetContainer");
    consultarDatosContainer.style.display = "none";
}