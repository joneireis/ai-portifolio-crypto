import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import AssetAllocationChart from './AssetAllocationChart';
import CostValueChart from './CostValueChart';
import PortfolioChart from './PortfolioChart';
import AssetPriceChart from './AssetPriceChart';

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
    pl_24h_change: number;
    pl_monetary: number;
}

interface PortfolioData {
    assets: Asset[];
    total_value: number;
    total_pl: number;
}

type SortDirection = 'ascending' | 'descending';

interface SortConfig {
    key: keyof Asset;
    direction: SortDirection;
}

const Portfolio: React.FC = () => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [chartData, setChartData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'valor_total', direction: 'descending' });

    const fetchPortfolioData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.get('/api/portfolio/');
            const portfolio = response.data;
            
            const assetsWithMonetaryPL = portfolio.assets.map((asset: Asset) => ({
                ...asset,
                pl_monetary: asset.valor_total - asset.custo_total,
            }));

            setPortfolioData({ ...portfolio, assets: assetsWithMonetaryPL });

            const assetsToFetch = assetsWithMonetaryPL
                .filter((asset: Asset) => {
                    const stablecoins = ['usd', 'usdc', 'usdt', 'dai'];
                    return asset.quantidade > 0 && !stablecoins.includes(asset.id_api_precos);
                })
                .map((asset: Asset) => asset.id_api_precos);

            if (assetsToFetch.length > 0) {
                try {
                    const params = new URLSearchParams();
                    assetsToFetch.forEach((id: string) => params.append('ids', id));
                    const chartResponse = await axios.get(`/api/ativos/charts/bulk?${params.toString()}&days=7`);
                    
                    const bulkChartData = chartResponse.data;
                    const newChartData: { [key: string]: any } = {};

                    for (const asset of assetsWithMonetaryPL) {
                        const assetId = asset.id_api_precos;
                        if (bulkChartData[assetId] && bulkChartData[assetId].prices) {
                            newChartData[assetId] = {
                                labels: bulkChartData[assetId].prices.map((price: [number, number]) => price[0]),
                                datasets: [
                                    {
                                        label: `Preço de ${asset.nome}`,
                                        data: bulkChartData[assetId].prices.map((price: [number, number]) => price[1]),
                                        borderColor: '#1cc88a',
                                        backgroundColor: 'rgba(28, 200, 138, 0.1)',
                                        fill: true,
                                        borderWidth: 2,
                                        tension: 0.3,
                                        pointRadius: 0,
                                        pointHoverRadius: 5,
                                    },
                                ],
                            };
                        } else {
                            newChartData[assetId] = null;
                        }
                    }
                    setChartData(newChartData);
                } catch (err) {
                    console.error(`Error fetching bulk chart data`, err);
                }
            }
        } catch (err) {
            setError('Falha ao carregar dados do portfólio.');
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolioData();
    }, [fetchPortfolioData]);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Atualizando dados automaticamente...");
            fetchPortfolioData();
        }, 300000); 

        return () => clearInterval(interval);
    }, [fetchPortfolioData]);

    const sortedAssets = useMemo(() => {
        let sortableAssets = portfolioData ? [...portfolioData.assets] : [];
        if (sortConfig !== null) {
            sortableAssets.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableAssets;
    }, [portfolioData, sortConfig]);

    const requestSort = (key: keyof Asset) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortClassName = (key: keyof Asset) => {
        if (!sortConfig) {
            return '';
        }
        return sortConfig.key === key ? sortConfig.direction : '';
    };

    if (loading) {
        return <div className="portfolio-dashboard">Carregando portfólio...</div>;
    }

    if (error) {
        return <div className="portfolio-dashboard error-message">{error}</div>;
    }

    if (!portfolioData || !sortedAssets) {
        return <div className="portfolio-dashboard">Nenhum dado de portfólio disponível.</div>;
    }

    const userAssets = portfolioData.assets;

    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Dashboard</h3>
                <button 
                    className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`} 
                    onClick={() => fetchPortfolioData()}
                    disabled={isRefreshing}
                >
                    <span className="refresh-icon">↻</span>
                    {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>

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
                        {userAssets.map((asset) => (
                            <div key={asset.id} className="chart-card">
                                <AssetPriceChart
                                    assetName={asset.nome}
                                    assetPrice={asset.preco_atual}
                                    pl_24h_change={asset.pl_24h_change}
                                    chartData={chartData[asset.id_api_precos]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th className="text-left">Ativo</th>
                        <th className="text-center">Símbolo</th>
                        <th 
                            className={`text-center sortable ${getSortClassName('quantidade')}`}
                            onClick={() => requestSort('quantidade')}
                        >
                            Quantidade
                        </th>
                        <th 
                            className={`text-center sortable ${getSortClassName('preco_medio')}`}
                            onClick={() => requestSort('preco_medio')}
                        >
                            Preço Médio
                        </th>
                        <th 
                            className={`text-center sortable ${getSortClassName('preco_atual')}`}
                            onClick={() => requestSort('preco_atual')}
                        >
                            Preço Atual
                        </th>
                        <th 
                            className={`text-center sortable ${getSortClassName('valor_total')}`}
                            onClick={() => requestSort('valor_total')}
                        >
                            Valor Total
                        </th>
                        <th 
                            className={`text-center sortable ${getSortClassName('pl_nao_realizado')}`}
                            onClick={() => requestSort('pl_nao_realizado')}
                        >
                            P/L Não Realizado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAssets.length > 0 ? (
                        sortedAssets.map(asset => (
                            <tr key={asset.id}>
                                <td className="text-left">{asset.nome}</td>
                                <td className="text-center">{asset.simbolo}</td>
                                <td className="text-center">{asset.quantidade.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                                <td className="text-center">${asset.preco_medio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="text-center">${asset.preco_atual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="text-center">${asset.valor_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className={`text-center`} style={{ color: asset.pl_nao_realizado >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                    <div>{`${asset.pl_nao_realizado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}</div>
                                    <div>{`$${asset.pl_monetary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center">Nenhum ativo para exibir.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Portfolio;
