import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title, ChartDataLabels);

interface Asset {
    nome: string;
    preco_medio: number;
    quantidade: number;
    valor_total: number;
}

interface CostValueChartProps {
    assets: Asset[];
}

const CostValueChart: React.FC<CostValueChartProps> = ({ assets }) => {
    const filteredAndSortedAssets = assets
        .filter(asset => asset.quantidade > 0)
        .sort((a, b) => b.valor_total - a.valor_total);

    const chartData = {
        labels: filteredAndSortedAssets.map(asset => asset.nome),
        datasets: [
            {
                label: 'Custo Total',
                data: filteredAndSortedAssets.map(asset => asset.preco_medio * asset.quantidade),
                backgroundColor: '#f6c23e', // Amarelo
            },
            {
                label: 'Valor Atual',
                data: filteredAndSortedAssets.map(asset => asset.valor_total),
                backgroundColor: '#4e73df', // Azul
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Custo vs. Valor Atual',
                color: '#e1e8ed',
                font: {
                    size: 18,
                }
            },
            legend: {
                position: 'top',
                labels: {
                    color: '#e1e8ed',
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                display: false, // Desativado para não poluir o gráfico de barras
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#8899a6',
                },
                grid: {
                    color: '#3a3a3a',
                }
            },
            y: {
                ticks: {
                    color: '#8899a6',
                    callback: function(value: any) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
                    },
                },
                grid: {
                    color: '#3a3a3a',
                }
            },
        },
    };

    return (
        <>
            <div style={{ position: 'relative', height: '300px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </>
    );
};

export default React.memo(CostValueChart);