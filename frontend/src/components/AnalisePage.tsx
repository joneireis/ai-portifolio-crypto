// src/components/AnalisePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DcaGaugeChart from './DcaGaugeChart';
import AssetPriceChart from './AssetPriceChart'; // Importa o novo gráfico

// Define a interface para um único indicador
interface Indicador {
    nome: string;
    valor: string;
    status: string;
    statusClass: 'alerta' | 'neutro' | 'compra';
    explicacao: string;
}

// Define a interface para os dados simulados
interface DadosSimulados {
    tecnicos: Indicador[];
    onChain: Indicador[];
    precoMedioDCA: string;
}

interface Ativo {
    id: number;
    nome: string;
    simbolo: string;
    id_api_precos: string;
}

// Função para gerar dados simulados de indicadores
const gerarIndicadoresSimulados = (basePrice: number): DadosSimulados => {
    const statuses: { status: string, class: 'alerta' | 'neutro' | 'compra' }[] = [
        { status: 'Alerta', class: 'alerta' },
        { status: 'Neutro', class: 'neutro' },
        { status: 'Compra', class: 'compra' },
    ];

    const randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
    const randomValue = (base: number, percentRange: number) => (base * (1 + (Math.random() - 0.5) * percentRange));
    const randomInt = (max: number) => Math.floor(Math.random() * max);

    return {
        tecnicos: [
            { 
                nome: 'MACD Mensal', 
                valor: (Math.random() * 0.01).toFixed(4), 
                status: 'Cruzamento de Venda', 
                statusClass: 'alerta',
                explicacao: 'O MACD (Moving Average Convergence Divergence) é um indicador de momento que mostra a relação entre duas médias móveis de preços. Um cruzamento de venda cíclica no gráfico mensal pode sinalizar uma mudança de tendência de longo prazo de alta para baixa.'
            },
            { 
                nome: 'Canal Gauciano', 
                valor: ['Superior', 'Meio', 'Inferior'][randomInt(3)], 
                status: randomStatus().status, 
                statusClass: randomStatus().class,
                explicacao: 'O Canal Gauciano é um indicador de volatilidade que usa uma distribuição normal (Gaussiana) para criar bandas em torno do preço. Tocar a banda superior pode indicar uma área de sobrecompra, mas a tendência ainda pode continuar.'
            },
            { 
                nome: 'RSI Semanal', 
                valor: randomInt(100).toString(), 
                status: randomStatus().status, 
                statusClass: randomStatus().class,
                explicacao: 'O RSI (Relative Strength Index) mede a velocidade e a mudança dos movimentos de preços. No gráfico semanal, um valor de 65 está em território de alta, mas se aproximando de níveis de sobrecompra (acima de 70), o que exige cautela.'
            },
            { 
                nome: 'SMA 200 Semanal', 
                valor: `$${randomValue(basePrice * 0.7, 0.2).toFixed(2)}`, 
                status: 'Suporte', 
                statusClass: 'compra',
                explicacao: 'A Média Móvel Simples (SMA) de 200 semanas é um importante nível de suporte de longo prazo. Enquanto o preço se mantiver acima dela, a tendência de alta de longo prazo é considerada intacta.'
            },
        ],
        onChain: [
            { 
                nome: 'Preço Realizado da Rede', 
                valor: `$${randomValue(basePrice * 0.9, 0.1).toFixed(2)}`, 
                status: 'Acima', 
                statusClass: 'compra',
                explicacao: 'O Preço Realizado representa o custo base médio de todas as moedas na rede, valorizando cada uma pelo preço de sua última movimentação. Quando o preço de mercado está acima do Preço Realizado, a rede como um todo está em lucro.'
            },
            { 
                nome: 'Preço Médio do Holder de Longo Prazo', 
                valor: `$${randomValue(basePrice * 0.6, 0.3).toFixed(2)}`, 
                status: 'Abaixo', 
                statusClass: 'compra',
                explicacao: 'Este é o preço médio de aquisição das moedas mantidas por investidores de longo prazo (Long-Term Holders). É frequentemente visto como um forte nível de suporte. Se o preço de mercado está acima, indica que os investidores experientes estão em lucro.'
            },
            { 
                nome: 'Medo e Ganância', 
                valor: randomInt(100).toString(), 
                status: 'Ganância', 
                statusClass: 'alerta',
                explicacao: 'O Índice de Medo e Ganância (Fear & Greed Index) mede o sentimento do mercado. Um valor de 75 (Ganância Extrema) sugere que o mercado está eufórico e pode ser devido a uma correção.'
            },
            { 
                nome: 'Tempo Cíclico Halving', 
                valor: `${randomInt(1460)} dias pós-halving`, 
                status: 'Meio de ciclo', 
                statusClass: 'neutro',
                explicacao: 'Este indicador contextualiza o preço dentro do ciclo de 4 anos do Halving do Bitcoin. Estar a 800 dias pós-halving geralmente corresponde a uma fase de meio de ciclo, após a euforia inicial e antes da preparação para o próximo topo.'
            },
        ],
        precoMedioDCA: `$${randomValue(basePrice * 1.1, 0.4).toFixed(2)}`
    };
};


// Componente para a página de Análise Cíclica e On-Chain
const AnalisePage = () => {
    const [assets, setAssets] = useState<Ativo[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [selectedAssetPrice, setSelectedAssetPrice] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
    const [expandedGaugeExplanation, setExpandedGaugeExplanation] = useState(false);
    const [dadosIndicadores, setDadosIndicadores] = useState<DadosSimulados | null>(null);
    const [chartData, setChartData] = useState<any>(null); // Estado para o gráfico de preço
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        if (!selectedAssetId) return;
        if (isManualRefresh) {
            setIsRefreshing(true);
        }
        
        console.log(`Buscando dados para ${selectedAssetId}...`);
        try {
            const [priceResponse, chartResponse, fngResponse] = await Promise.all([
                axios.get(`/api/ativos/price/${selectedAssetId}`),
                axios.get(`/api/ativos/charts/bulk?ids=${selectedAssetId}&days=30`),
                axios.get('https://api.alternative.me/fng/')
            ]);

            const currentPrice = priceResponse.data.price;
            setSelectedAssetPrice(currentPrice);

            const bulkChartData = chartResponse.data;
            const assetChartData = bulkChartData[selectedAssetId];
            const selectedAsset = assets.find(a => a.id_api_precos === selectedAssetId);

            if (assetChartData && assetChartData.prices) {
                setChartData({
                    labels: assetChartData.prices.map((price: [number, number]) => price[0]),
                    datasets: [{
                        label: `Preço de ${selectedAsset?.nome || ''}`,
                        data: assetChartData.prices.map((price: [number, number]) => price[1]),
                        borderColor: '#1cc88a',
                        backgroundColor: 'rgba(28, 200, 138, 0.1)',
                        fill: true,
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                    }],
                });
            } else {
                setChartData(null);
            }

            const fngData = fngResponse.data.data[0];
            const fngIndicator: Indicador = {
                nome: 'Medo e Ganância',
                valor: fngData.value,
                status: fngData.value_classification,
                statusClass: fngData.value > 55 ? 'alerta' : (fngData.value < 25 ? 'compra' : 'neutro'),
                explicacao: 'O Índice de Medo e Ganância (Fear & Greed Index) mede o sentimento do mercado. Valores altos (Ganância) sugerem que o mercado está eufórico e pode ser devido a uma correção, enquanto valores baixos (Medo) podem indicar uma oportunidade de compra.'
            };

            if (selectedAsset) {
                const simulatedData = gerarIndicadoresSimulados(currentPrice);
                const onChainIndicators = simulatedData.onChain.map(indicator => 
                    indicator.nome === 'Medo e Ganância' ? fngIndicator : indicator
                );
                setDadosIndicadores({ ...simulatedData, onChain: onChainIndicators });
            }

        } catch (error) {
            console.error("Falha ao buscar dados da análise", error);
        } finally {
            if (isManualRefresh) {
                setIsRefreshing(false);
            }
        }
    }, [selectedAssetId, assets]);


    // Efeito para a carga inicial dos ativos
    useEffect(() => {
        const fetchInitialAssets = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/ativos/');
                const fetchedAssets: Ativo[] = response.data;
                setAssets(fetchedAssets);
                if (fetchedAssets.length > 0) {
                    setSelectedAssetId(fetchedAssets[0].id_api_precos);
                }
            } catch (error) {
                console.error("Falha ao carregar lista de ativos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialAssets();
    }, []);

    // Efeito para buscar dados quando o ativo selecionado muda e para o auto-refresh
    useEffect(() => {
        if (selectedAssetId) {
            fetchData();
        }

        const refreshInterval = setInterval(() => {
            if (selectedAssetId) {
                fetchData();
            }
        }, 60000); // Atualiza a cada 1 minuto

        return () => clearInterval(refreshInterval);
    }, [selectedAssetId, fetchData]);

    // Efeito para atualizar o relógio a cada segundo
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    const toggleExplicacao = (nome: string) => {
        setExpandedIndicator(prev => (prev === nome ? null : nome));
    };

    const toggleGaugeExplanation = () => {
        setExpandedGaugeExplanation(prev => !prev);
    };

    const selectedAsset = assets.find(a => a.id_api_precos === selectedAssetId);

    if (loading) {
        return <div className="portfolio-dashboard">Carregando...</div>;
    }

    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Análise Cíclica e On-Chain</h3>
                <div className="header-controls">
                    <div className="clock">
                        <span>{formatTime(currentTime)}</span>
                    </div>
                    <button 
                        className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`} 
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                    >
                        <span className="refresh-icon">↻</span>
                        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                    </button>
                    <div className="asset-selector">
                        <label htmlFor="asset-select">Ativo:</label>
                        <select
                            id="asset-select"
                            value={selectedAssetId}
                            onChange={(e) => setSelectedAssetId(e.target.value)}
                        >
                            {assets.map(asset => (
                                <option key={asset.id} value={asset.id_api_precos}>
                                    {asset.nome} ({asset.simbolo})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedAsset && (
                 <div className="analise-price-section">
                    <div className="asset-price-display">
                        <h2>{selectedAsset.nome} ({selectedAsset.simbolo})</h2>
                        <h1>
                            {selectedAssetPrice !== null
                                ? `$${selectedAssetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : 'Carregando preço...'
                            }
                        </h1>
                    </div>
                    <div className="chart-card-full">
                        <AssetPriceChart
                            assetName={selectedAsset.nome}
                            assetPrice={selectedAssetPrice || 0}
                            chartData={chartData} 
                            pl_24h_change={0}
                        />
                    </div>
                 </div>
            )}

            {dadosIndicadores && (
                <>
                    <DcaGaugeChart 
                        isExpanded={expandedGaugeExplanation} 
                        onToggleExpand={toggleGaugeExplanation} 
                        precoMedioDCA={dadosIndicadores.precoMedioDCA}
                    />
                    <div className="charts-section">
                        <div className="chart-card">
                            <h4>Indicadores Técnicos</h4>
                            <ul className="indicator-list">
                                {dadosIndicadores.tecnicos.map((indicador) => (
                                    <li key={indicador.nome} className="indicator-item-wrapper">
                                        <div className="indicator-item" onClick={() => toggleExplicacao(indicador.nome)}>
                                            <span className="indicator-name">{indicador.nome}</span>
                                            <span className="indicator-value">{indicador.valor}</span>
                                            <span className={`indicator-status ${indicador.statusClass}`}>{indicador.status}</span>
                                        </div>
                                        {expandedIndicator === indicador.nome && (
                                            <div className="indicator-explanation"><p>{indicador.explicacao}</p></div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="chart-card">
                            <h4>Indicadores On-Chain</h4>
                            <ul className="indicator-list">
                                {dadosIndicadores.onChain.map((indicador) => (
                                     <li key={indicador.nome} className="indicator-item-wrapper">
                                        <div className="indicator-item" onClick={() => toggleExplicacao(indicador.nome)}>
                                            <span className="indicator-name">{indicador.nome}</span>
                                            <span className="indicator-value">{indicador.valor}</span>
                                            <span className={`indicator-status ${indicador.statusClass}`}>{indicador.status}</span>
                                        </div>
                                        {expandedIndicator === indicador.nome && (
                                            <div className="indicator-explanation"><p>{indicador.explicacao}</p></div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalisePage;
