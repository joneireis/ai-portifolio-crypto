import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssetAllocationChart from './AssetAllocationChart';
import CostValueChart from './CostValueChart';
import PortfolioChart from './PortfolioChart';
import AssetPriceChart from './AssetPriceChart';
import SaleSimulator from './SaleSimulator';

interface Asset {
    id: number;
    nome: string;
    simbolo: string;
    id_api_precos: string;
    quantidade: number;
    custo_total: number;
    preco_medio: number;
    preco_atual: number;
    valor_total: number;
    pl_nao_realizado: number;
}

interface PortfolioData {
    assets: Asset[];
    total_value: number;
    total_pl: number;
}

const Portfolio: React.FC = () => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [chartData, setChartData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/portfolio/');
                setPortfolioData(response.data);

                const chartDataPromises = response.data.assets.map(async (asset: Asset) => {
                    if (asset.quantidade > 0) {
                        try {
                            const chartResponse = await axios.get(`/api/ativos/charts/${asset.id_api_precos}?days=7`);
                            return {
                                [asset.id_api_precos]: {
                                    labels: chartResponse.data.prices.map((price: [number, number]) => price[0]),
                                    datasets: [
                                        {
                                            label: `Preço de ${asset.nome}`,
                                            data: chartResponse.data.prices.map((price: [number, number]) => price[1]),
                                            borderColor: '#1cc88a', // Verde
                                            backgroundColor: 'rgba(28, 200, 138, 0.1)', // Verde com transparência
                                            fill: true,
                                            borderWidth: 2,
                                            tension: 0.3,
                                            pointRadius: 0,
                                            pointHoverRadius: 5,
                                        },
                                    ],
                                }
                            };
                        } catch (err) {
                            console.error(`Error fetching chart data for ${asset.id_api_precos}`, err);
                            return { [asset.id_api_precos]: null };
                        }
                    }
                    return null;
                });

                const chartDataResults = await Promise.all(chartDataPromises);
                const chartDataMap = chartDataResults.reduce((acc, curr) => {
                    if (curr) {
                        return { ...acc, ...curr };
                    }
                    return acc;
                }, {});
                setChartData(chartDataMap);

            } catch (err) {
                setError('Falha ao carregar dados do portfólio.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolioData();
    }, []);

    if (loading) {
        return <div className="portfolio-dashboard">Carregando portfólio...</div>;
    }

    if (error) {
        return <div className="portfolio-dashboard error-message">{error}</div>;
    }

    if (!portfolioData || !portfolioData.assets) {
        return <div className="portfolio-dashboard">Nenhum dado de portfólio disponível.</div>;
    }

    const userAssets = portfolioData.assets;

    return (
        <div className="portfolio-dashboard">
            <div className="summary-cards">
                <div className="card">
                    <h3>Valor Total do Portfólio</h3>
                    <p>${portfolioData.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="card">
                    <h3>Lucro/Prejuízo Não Realizado</h3>
                    <p style={{ color: portfolioData.total_pl >= 0 ? '#2ecc71' : '#e74c3c' }}>
                        ${portfolioData.total_pl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-card-full">
                    <PortfolioChart />
                </div>

                <div className="charts-row">
                    <div className="chart-card">
                        <AssetAllocationChart assets={userAssets} />
                    </div>
                    <div className="chart-card">
                        <CostValueChart assets={userAssets} />
                    </div>
                </div>

                <div className="chart-card-full">
                    <div className="charts-grid">
                        {userAssets.map((asset, index) => (
                            <div key={asset.id} className="chart-card">
                                <AssetPriceChart
                                    assetName={asset.nome}
                                    chartData={chartData[asset.id_api_precos]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h3>Dashboard</h3>
            <table>
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Símbolo</th>
                        <th>Quantidade</th>
                        <th>Preço Médio</th>
                        <th>Preço Atual</th>
                        <th>Valor Total</th>
                        <th>P/L Não Realizado (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {userAssets.length > 0 ? (
                        userAssets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.nome}</td>
                                <td>{asset.simbolo}</td>
                                <td>{asset.quantidade.toLocaleString()}</td>
                                <td>${asset.preco_medio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>${asset.preco_atual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>${asset.valor_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ color: asset.pl_nao_realizado >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                    {`${asset.pl_nao_realizado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7}>Nenhum ativo para exibir.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Portfolio;
