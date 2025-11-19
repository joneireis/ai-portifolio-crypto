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
import 'chartjs-adapter-date-fns';

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
);

const PortfolioChart = () => {
    const [chartData, setChartData] = useState<{ labels: number[]; datasets: any[] }>({ // Labels agora são números (timestamps)
        labels: [],
        datasets: [],
    });
    const [days, setDays] = useState<number>(7); // Estado para o período selecionado (em dias)

    useEffect(() => {
        const fetchSnapshots = async () => {
            try {
                const response = await axios.get('/api/portfolio/snapshots', { params: { days } });
                const data = {
                    labels: response.data.map((s: any) => new Date(s.data).getTime()), // Usar timestamp para TimeScale
                    datasets: [
                        {
                            label: 'Valor do Portfólio',
                            data: response.data.map((s: any) => s.valor_total),
                            fill: true, // Preencher a área abaixo da linha
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Cor de fundo da área
                            tension: 0.1,
                            pointRadius: 0, // Remover pontos
                        }
                    ]
                };
                setChartData(data);
            } catch (error) {
                console.error('Error fetching portfolio snapshots', error);
            }
        };
        fetchSnapshots();
    }, [days]); // Dependência 'days' para recarregar quando o período muda

    const options: any = { // Usar 'any' para evitar problemas de tipagem
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
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
                            label += '$' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                        return label;
                    }
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
                        return '$' + value.toLocaleString();
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