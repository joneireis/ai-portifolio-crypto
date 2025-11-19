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
    const [chartData, setChartData] = useState<{ labels: number[]; datasets: any[] }>({ // Labels agora são números (timestamps)
        labels: [],
        datasets: [],
    });
    const [days, setDays] = useState<number>(7); // Estado para o período selecionado (em dias)

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                // Realiza as duas chamadas de API em paralelo
                const [snapshotsResponse, portfolioResponse] = await Promise.all([
                    axios.get('/api/portfolio/snapshots', { params: { days } }),
                    axios.get('/api/portfolio/')
                ]);

                const snapshots = snapshotsResponse.data;
                const currentPortfolioValue = portfolioResponse.data.total_value;

                // Prepara os dados históricos
                const labels = snapshots.map((s: any) => new Date(s.data).getTime());
                const historicalData = snapshots.map((s: any) => s.valor_total);

                // Adiciona o ponto de dados atual (ao vivo) ao final do gráfico
                // Apenas se o período incluir "hoje"
                if (days <= 30) { // Adiciona o ponto ao vivo para períodos de até 1 mês
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
            } catch (error) {
                console.error('Error fetching portfolio chart data', error);
            }
        };
        fetchChartData();
    }, [days]); // Dependência 'days' para recarregar quando o período muda

    const options: any = { // Usar 'any' para evitar problemas de tipagem
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 50, // Adiciona padding no topo para não cortar o datalabel
                left: 30,
                right: 30,
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#FFFFFF',
                }
            },
            tooltip: {
                backgroundColor: '#2c3e50', // Cor de fundo mais escura
                titleColor: '#ecf0f1', // Cor do título
                bodyColor: '#ecf0f1', // Cor do corpo
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            // Formatação compacta para o tooltip
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
                display: function(context: any) {
                    // Exibe o datalabel apenas para o último ponto de dados
                    return context.dataIndex === context.dataset.data.length - 1;
                },
                color: '#FFFFFF',
                align: 'top',
                offset: 8,
                font: {
                    weight: 'bold',
                },
                formatter: function(value: any, context: any) {
                    // Formata o valor da mesma forma que o tooltip e o eixo Y
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
                type: 'time', // Usar escala de tempo
                time: {
                    unit: days <= 1 ? 'hour' : (days <= 30 ? 'day' : 'month'), // Unidade dinâmica
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
                        // Formatação compacta para o eixo Y
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
                {chartData.labels.length > 0 ? <Line data={chartData} options={options} /> : <p>Carregando gráfico...</p>}
            </div>
        </div>
    );
};

export default PortfolioChart;