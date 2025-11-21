import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Title } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Title);

interface AssetPriceChartProps {
    chartData: any;
    assetName: string;
    assetPrice: number;
    pl_24h_change: number;
}

const AssetPriceChart: React.FC<AssetPriceChartProps> = ({ chartData, assetName, assetPrice, pl_24h_change }) => {
    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: [
                    assetName,
                    assetPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                ],
                color: '#e1e8ed',
                font: {
                    size: 16,
                }
            },
            tooltip: {
                enabled: false, // Desativa completamente os tooltips
            },
            legend: {
                display: false,
            },
            datalabels: {
                display: false, // Garante que o plugin de datalabels está desativado
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'dd/MM', // Formato mais curto
                    }
                },
                ticks: {
                    display: true,
                    color: '#8899a6',
                    maxRotation: 0, // Evita rotação
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 7, // Limita o número de ticks
                },
                grid: {
                    display: false, // Remove a grade do eixo X para um visual mais limpo
                }
            },
            y: {
                ticks: {
                    display: true, // Mostra os ticks do eixo Y
                    color: '#8899a6',
                    callback: function(value: any) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
                    },
                    maxTicksLimit: 6, // Limita o número de ticks no eixo Y
                },
                grid: {
                    color: '#3a3a3a',
                }
            },
        },
    };

    const isPositive = pl_24h_change >= 0;
    const changeColor = isPositive ? '#2ecc71' : '#e74c3c';
    const arrow = isPositive ? '▲' : '▼';

    return (
        <div style={{ position: 'relative', height: '280px' }}>
            <div style={{ height: '250px' }}>
                {chartData ? <Line data={chartData} options={options} /> : <p>Carregando gráfico...</p>}
            </div>
            <div style={{ color: changeColor, textAlign: 'center', paddingTop: '5px' }}>
                {typeof pl_24h_change === 'number' ? (
                    <>
                        <span>{arrow} </span>
                        <span>{pl_24h_change.toFixed(2)}%</span>
                    </>
                ) : (
                    <span>--</span>
                )}
            </div>
        </div>
    );
};

export default React.memo(AssetPriceChart);