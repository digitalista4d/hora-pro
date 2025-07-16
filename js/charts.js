document.addEventListener('DOMContentLoaded', () => {
    const salesChartCanvas = document.getElementById('salesChart');
    const profitChartCanvas = document.getElementById('profitChart');

    if (salesChartCanvas) {
        createSalesChart(salesChartCanvas);
    }

    if (profitChartCanvas) {
        createProfitChart(profitChartCanvas);
    }
});

function createSalesChart(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Vendas (Kz)',
                data: [1200, 1900, 3000, 5000, 2300, 3200],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createProfitChart(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Serviços Design', 'Fotografia', 'Desenvolvimento Web'],
            datasets: [{
                label: 'Lucro por Categoria (Kz)',
                data: [3000, 5000, 7000],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}
