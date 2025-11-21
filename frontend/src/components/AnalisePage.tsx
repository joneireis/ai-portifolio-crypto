// src/components/AnalisePage.tsx
import React, { useState, useEffect } from 'react';
import DcaGaugeChart from './DcaGaugeChart';

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

// Função para gerar dados simulados de indicadores
const gerarIndicadoresSimulados = (ativo: string): DadosSimulados => {
    const statuses: { status: string, class: 'alerta' | 'neutro' | 'compra' }[] = [
        { status: 'Alerta', class: 'alerta' },
        { status: 'Neutro', class: 'neutro' },
        { status: 'Compra', class: 'compra' },
    ];

    const randomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
    const randomValue = (base: number, percentRange: number) => (base * (1 + (Math.random() - 0.5) * percentRange));
    const randomInt = (max: number) => Math.floor(Math.random() * max);

    const basePrice = ativo === 'BTC' ? 60000 : 3000;

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
    // Estado para o ativo selecionado no dropdown
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    // Estado para o horário atual
    const [currentTime, setCurrentTime] = useState(new Date());
    // Estado para controlar qual indicador está expandido
    const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
    // Estado para controlar a expansão da explicação do gráfico Gauge
    const [expandedGaugeExplanation, setExpandedGaugeExplanation] = useState(false);
    // Estado para os dados dos indicadores
    const [dadosIndicadores, setDadosIndicadores] = useState<DadosSimulados>(gerarIndicadoresSimulados(selectedAsset));


    // Efeito para atualizar o relógio a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(timer);
    }, []);

    // Efeito para atualizar os indicadores quando o ativo mudar
    useEffect(() => {
        setDadosIndicadores(gerarIndicadoresSimulados(selectedAsset));
    }, [selectedAsset]);

    // Função para formatar o horário
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Função para alternar a visibilidade da explicação de um indicador
    const toggleExplicacao = (nome: string) => {
        setExpandedIndicator(prev => (prev === nome ? null : nome));
    };

    // Função para alternar a visibilidade da explicação do gráfico Gauge
    const toggleGaugeExplanation = () => {
        setExpandedGaugeExplanation(prev => !prev);
    };

    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Análise Cíclica e On-Chain</h3>
                <div className="header-controls">
                    {/* Relógio Online */}
                    <div className="clock">
                        <span>{formatTime(currentTime)}</span>
                    </div>
                    {/* Seletor de Ativo */}
                    <div className="asset-selector">
                        <label htmlFor="asset-select">Ativo:</label>
                        <select
                            id="asset-select"
                            value={selectedAsset}
                            onChange={(e) => setSelectedAsset(e.target.value)}
                        >
                            {/* TODO: Popular dinamicamente com ativos do portfólio */}
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Gráfico de Medidor DCA Tático */}
            <DcaGaugeChart 
                isExpanded={expandedGaugeExplanation} 
                onToggleExpand={toggleGaugeExplanation} 
                precoMedioDCA={dadosIndicadores.precoMedioDCA}
            />

            <div className="charts-section">
                {/* Painel de Indicadores Técnicos */}
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
                                    <div className="indicator-explanation">
                                        <p>{indicador.explicacao}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Painel de Indicadores On-Chain */}
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
                                    <div className="indicator-explanation">
                                        <p>{indicador.explicacao}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalisePage;
