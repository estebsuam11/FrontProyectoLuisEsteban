const btn = document.querySelector('#menu-btn');
        const menu = document.querySelector('#sidemenu');
    
        btn.addEventListener('click', e =>{
            menu.classList.toggle("menu-expanded");
            menu.classList.toggle("menu-collapsed");
    
            document.querySelector('body').classList.toggle('body-expanded');
    });

    //CARGAR ARCHIVOS

   async function enviarArchivo() {
        var formData = new FormData();
        var archivoCapturado = document.getElementById('input-file');
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
            },
            error: function (error) {
                
                console.error('Error al enviar el archivo', error.responseText);
            }
        });
    }


// TABLA

//     const editor = new DataTable.Editor({
//         ajax: '../php/staff.php',
//         fields: [
//             {
//                 label: 'First name:',
//                 name: 'first_name'
//             },
//             {
//                 label: 'Last name:',
//                 name: 'last_name'
//             },
//             {
//                 label: 'Position:',
//                 name: 'position'
//             },
//             {
//                 label: 'Office:',
//                 name: 'office'
//             },
//             {
//                 label: 'Extension:',
//                 name: 'extn'
//             },
//             {
//                 label: 'Start date:',
//                 name: 'start_date',
//                 type: 'datetime'
//             },
//             {
//                 label: 'Salary:',
//                 name: 'salary'
//             }
//         ],
//         table: '#example'
//     });
     
//     const table = new DataTable('#example', {
//         ajax: '#',
//         buttons: [
//             { extend: 'create', editor },
//             { extend: 'edit', editor },
//             { extend: 'remove', editor }
//         ],
//         columns: [
//             {
//                 data: null,
//                 defaultContent: '',
//                 className: 'select-checkbox',
//                 orderable: false
//             },
//             { data: 'first_name' },
//             { data: 'last_name' },
//             { data: 'position' },
//             { data: 'office' },
//             { data: 'start_date' },
//             { data: 'salary', render: DataTable.render.number(null, null, 0, '$') }
//         ],
//         dom: 'Bfrtip',
//         order: [[1, 'asc']],
//         select: {
//             style: 'os',
//             selector: 'td:first-child'
//         }
//     });
     
//     // Activate an inline edit on click of a table cell
//     table.on('click', 'tbody td:not(:first-child)', function (e) {
//         editor.inline(this);
//     });


    //FUNCION SUBIR ARCHIVOS

const dropArea = document.querySelector("#drag-area");
const dragText = dropArea.querySelector('h2')
const button = dropArea.querySelector('#select');
const input = dropArea.querySelector('#input-file');
let files;

button.addEventListener('click', (e) => {
        input.click();
});

input.addEventListener('change', (e) =>{
        files = input.files;
        dropArea.classList.add('active');
        showFiles(files);
        dropArea.classList.remove('active');
});

dropArea.addEventListener('dragover', (e) =>{
        e.preventDefault();
        dropArea.classList.add('active');
        dragText.textContent = 'Suelta para cargar los archivos'
});
dropArea.addEventListener('dragleave', (e) =>{
        e.preventDefault();
        dropArea.classList.remove('active');
        dragText.textContent = 'Arrastra y suelta el archivos'
});
dropArea.addEventListener('drop', (e) =>{
        e.preventDefault();
        files = e.dataTransfer.files;
        showFiles(files);
        dropArea.classList.remove('active');
        dragText.textContent = 'Arrastra y suelta el archivos'
});

function showFiles(files){
        if(files.length = undefined){
                processFile(files);
        }else{
                for(const file of files){
                processFile(file);
                }
        }
}

function processFile(file){
        const fileReader = new FileReader();
        const id = `file-${Math.random().toString(32).substring(7)}`;

        fileReader.addEventListener('load', e =>{
                const fileUrl = fileReader.result;
                const image = `
                <div id="${id}" class=""file-container">
                        </br>
                        <img src="${fileUrl}" alt = "${file.name}" width="30px;" >
                        <div class="estatus">
                                <span>${file.name}</span>
                                <span class="status-text">
                                        loading...
                                </span>
                        </div>
                </div>
                `;

                const html = document.querySelector('#preview').innerHTML;
                document.querySelector('#preview').innerHTML = image + html ;
        });

        fileReader.readAsDataURL(file);
        uploadFile(file, id);

}
