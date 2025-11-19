import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Asset {
    nome: string;
    valor_total: number;
}

interface AssetAllocationChartProps {
    assets: Asset[];
}

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ assets }) => {
    const MIN_PERCENTAGE_DISPLAY = 5; // Limite mínimo para agrupar em "Outros"

    const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.valor_total, 0);

    let filteredAssets: Asset[] = [];
    let otherValue = 0;

    assets.forEach(asset => {
        const percentage = (asset.valor_total / totalPortfolioValue) * 100;
        if (percentage >= MIN_PERCENTAGE_DISPLAY) {
            filteredAssets.push(asset);
        } else {
            otherValue += asset.valor_total;
        }
    });

    if (otherValue > 0) {
        filteredAssets.push({ nome: 'Outros', valor_total: otherValue });
    }

    // Paleta de cores moderna e mais suave
    const chartColors = [
        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#5a5c69',
        '#f8f9fc', '#a9b3c9', '#6f42c1'
    ];

    const chartData = {
        labels: filteredAssets.map(asset => asset.nome),
        datasets: [
            {
                data: filteredAssets.map(asset => asset.valor_total),
                backgroundColor: chartColors,
                hoverBackgroundColor: chartColors,
                borderWidth: 1,
                borderColor: '#2c2c2c',
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Alocação de Ativos',
                color: '#e1e8ed',
                font: {
                    size: 18,
                }
            },
            legend: {
                position: 'right',
                labels: {
                    color: '#e1e8ed',
                }
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value: number, ctx: any) => {
                    const sum = ctx.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = (value * 100 / sum);
                    return percentage > 1 ? percentage.toFixed(1) + "%" : '';
                },
                font: {
                    weight: 'bold',
                    size: 12,
                },
                anchor: 'end',
                align: 'start',
                offset: -10,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            const value = context.parsed;
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        <>
            <div style={{ position: 'relative', height: '300px' }}>
                <Pie data={chartData} options={options} />
            </div>
        </>
    );
};

export default AssetAllocationChart;
