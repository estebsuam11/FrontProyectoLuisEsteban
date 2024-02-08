// Obtener el contexto del canvas
var ctx = document.getElementById('myChart').getContext('2d');

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

// Inicializar el gráfico
var myChart = new Chart(ctx, config);
