function AbrirModal() {
    const modal = document.getElementById('modalCargarDatos');
    if (modal) {
        modal.classList.add('modal--show');
    }
}

function AbrirModalGestionBd() {
    const modal = document.getElementById('modalGestionBd');
    if (modal) {
        modal.classList.add('modal--show');
    }
}
function CerrarModalGestionBd() {
    const modal = document.getElementById('modalGestionBd');
    if (modal) {
        modal.classList.remove('modal--show');
    }
}

function CerrarModal() {
    const modal = document.getElementById('modalCargarDatos');
    if (modal) {
        modal.classList.remove('modal--show');
    }
}

function AbrirModalCrearGrafico(tipoGrafico) {
    almacenTipoGrafico = tipoGrafico;
    $('#modalCrearGrafica').modal('show');
}

function CerrarModalCrearGrafico() {
    $('#modalCrearGrafica').modal('hide');
}

function AbrirModalConfirmarEliminación(divContenedor) {
    divAeliminar = divContenedor;
    $('#modalConfirmarEliminacio').modal('show');
}

function CerrarModalConfirmarEliminacionGrafica(){
    $('#modalConfirmarEliminacio').modal('hide');
}

function AbrirModalEditarGrafica(idGrafica) {
    idGraficaAeditar = idGrafica;
    var datosGrafico = almacenamientoDatosEjesGraficos[idGrafica];
    let idSelects = ["selectXEditarGrafica", "selectYEditarGrafica"]
    VaciarSelects(idSelects);
    AgregarNombresCamposASelect(idSelects);
    $('#colorPickerEditarGrafica').val(datosGrafico.colorElegido);
    $('#selectXEditarGrafica').val(datosGrafico.nombreCampoEjeX);
    $('#selectYEditarGrafica').val(datosGrafico.nombreCampoEjeY);
    $('#modalEditarGrafica').modal('show');
}

function AbrirModalEditarFiltro(idFiltro) {
   idFiltroAEditar=idFiltro;
   let idSelects = ["selectEditarFiltro"]
   VaciarSelects(idSelects);
   AgregarNombresCamposASelect(idSelects);;
    $('#selectEditarFiltro').val(datosGrafico.nombreCampoEjeY);
    $('#modalEditarFiltro').modal('show');
}


function CerrarModalEditarGrafica() {
    idGraficaAeditar = null;
    $('#modalEditarGrafica').modal('hide');
}

function CerrarModalEditarFiltro() {;
    $('#modalEditarFiltro').modal('hide');
}

function AbrirModalCrearFiltro() {
    $('#modalCrearFiltro').modal('show');
}

function CerrarModalCrearFiltro() {;
    $('#modalCrearFiltro').modal('hide');
}


function AbrirModalConfirmarEliminaciónFiltro(divContenedor) {
    filtroAEliminar = divContenedor;
    $('#modalConfirmarEliminacionFiltro').modal('show');
}

function CerrarModalConfirmarEliminacionFiltro(){
    filtroAEliminar=null;
    $('#modalConfirmarEliminacionFiltro').modal('hide');
}

$('#modalCrearFiltro').on('shown.bs.modal', function () {
    let idSelects = ["selectCrearFiltro"]
    VaciarSelects(idSelects);
    AgregarNombresCamposASelect(idSelects);
});

$('#modalEditarFiltro').on('shown.bs.modal', function () {
    let idSelects = ["selectEditarFiltro"]
    VaciarSelects(idSelects);
    AgregarNombresCamposASelect(idSelects);
});
 
function VaciarSelects(idSelects){
    idSelects.forEach(id => {
        var select = document.getElementById(id);
        select.innerHTML = '';
    });
}

$('#selectX, #selectY').change(function () {
    var selectedValue = $(this).val(); 

    $('#selectX, #selectY')
        .not($(this))
        .find('option')
        .prop('disabled', false);
    $('#selectX, #selectY')
        .not($(this))
        .find('option[value="' + selectedValue + '"]')
        .prop('disabled', true); 

    $('#selectX, #selectY')
        .not($(this))
        .change(function () {
            var deselectedValue = $(this).val(); 
            $(this)
                .find('option[value="' + deselectedValue + '"]')
                .prop('disabled', false); 
        });
});

$('#modalCrearGrafica').on('shown.bs.modal', function () {
    let idSelects = ["selectX", "selectY"]
    VaciarSelects(idSelects);
    AgregarNombresCamposASelect(idSelects);
});
