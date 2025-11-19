import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler, // Importar Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler, // Registrar Filler
  ChartDataLabels, // Registrar o plugin de datalabels
);

const PortfolioChart = () => {
    const [chartData, setChartData] = useState<{ labels: number[]; datasets: any[] }>({
        labels: [],
        datasets: [],
    });
    const [chartOptions, setChartOptions] = useState<any>({});
    const [days, setDays] = useState<number>(7);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const [snapshotsResponse, portfolioResponse] = await Promise.all([
                    axios.get('/api/portfolio/snapshots', { params: { days } }),
                    axios.get('/api/portfolio/')
                ]);

                const snapshots = snapshotsResponse.data;
                const currentPortfolioValue = portfolioResponse.data.total_value;

                const labels = snapshots.map((s: any) => new Date(s.data).getTime());
                const historicalData = snapshots.map((s: any) => s.valor_total);

                if (days <= 30) {
                    labels.push(new Date().getTime());
                    historicalData.push(currentPortfolioValue);
                }

                const data = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Valor do Portfólio',
                            data: historicalData,
                            fill: true,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1,
                            pointRadius: 0,
                        }
                    ]
                };
                setChartData(data);

                // --- OPÇÕES DINÂMICAS DO GRÁFICO ---
                const maxValue = Math.max(...historicalData);
                const suggestedMax = maxValue * 1.03; // Adiciona 3% de margem no topo

                const options: any = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#FFFFFF',
                            }
                        },
                        tooltip: {
                            backgroundColor: '#2c3e50',
                            titleColor: '#ecf0f1',
                            bodyColor: '#ecf0f1',
                            callbacks: {
                                label: function(context: any) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            notation: 'compact',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        },
                        datalabels: {
                            clamp: true, // Garante que os rótulos não saiam da área do gráfico
                            display: function(context: any) {
                                // Exibe o datalabel para o primeiro e último ponto
                                return context.dataIndex === 0 || context.dataIndex === context.dataset.data.length - 1;
                            },
                            color: '#FFFFFF',
                            align: function(context: any) {
                                // Alinha o primeiro à direita e o último à esquerda para evitar corte
                                return context.dataIndex === 0 ? 'right' : 'left';
                            },
                            offset: 8,
                            font: {
                                weight: 'bold',
                            },
                            formatter: function(value: any, context: any) {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: 'compact',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(value);
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: days <= 1 ? 'hour' : (days <= 30 ? 'day' : 'month'),
                                displayFormats: {
                                    hour: 'HH:mm',
                                    day: 'MMM dd',
                                    month: 'MMM yyyy',
                                }
                            },
                            ticks: {
                                color: '#FFFFFF',
                            },
                            grid: {
                                color: '#3a3a3a',
                            }
                        },
                        y: {
                            ticks: {
                                color: '#FFFFFF',
                                callback: function(value: any) {
                                    return new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        notation: 'compact'
                                    }).format(value);
                                },
                            },
                            grid: {
                                color: '#3a3a3a',
                            }
                        },
                    },
                };
                setChartOptions(options);

            } catch (error) {
                console.error('Error fetching portfolio chart data', error);
            }
        };
        fetchChartData();
    }, [days]);

    const timeRanges = [
        { label: '1D', value: 1 },
        { label: '7D', value: 7 },
        { label: '15D', value: 15 },
        { label: '1M', value: 30 },
        { label: '3M', value: 90 },
        { label: '6M', value: 180 },
        { label: '1A', value: 365 },
    ];

    return (
        <div className="chart-container">
            <h4>Evolução do Portfólio</h4>
            <div className="chart-controls">
                {timeRanges.map(range => (
                    <button 
                        key={range.label} 
                        onClick={() => setDays(range.value)}
                        className={days === range.value ? 'active' : ''}
                    >
                        {range.label}
                    </button>
                ))}
            </div>
            <div className="chart-wrapper">
                {chartData.labels.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>Carregando gráfico...</p>}
            </div>
        </div>
    );
};

export default PortfolioChart;