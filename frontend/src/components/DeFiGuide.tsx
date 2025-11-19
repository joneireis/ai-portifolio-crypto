import React from 'react';
import { Link } from 'react-router-dom'; // Importa o componente Link

const DeFiGuide = () => {
    const codeStyle: React.CSSProperties = {
        backgroundColor: '#333',
        padding: '2px 6px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        border: '1px solid #444'
    };

    return (
        <div>
            <h2>Guia para Registro de Operações DeFi</h2>
            <p style={{textAlign: 'left', maxWidth: '800px', margin: '0 auto 30px auto' }}>
                Este guia explica como registrar e acompanhar seus investimentos em diversas plataformas DeFi, como Lending e Pools de Liquidez. A ideia principal é criar um "Ativo Virtual" que representa sua posição.
            </p>

            <div className="content-card">
                <h3>1. Operações de Lending e Staking</h3>
                <p>
                    Para registrar e acompanhar seus investimentos em plataformas de Lending (como a Fluid.io) ou Staking, siga este guia. A ideia principal é criar um "Ativo Virtual" que representa sua posição na plataforma.
                </p>
                <h4>Passo 1: Crie um "Ativo Virtual"</h4>
                <p>
                    Primeiro, você precisa de um ativo para representar seu investimento. Cadastre-o na página <Link to="/ativos">Ativos</Link>.
                </p>
                <p><strong>Exemplo:</strong> Se você investiu USDC na Fluid.io:</p>
                <ul>
                    <li><strong>Nome:</strong> <code style={codeStyle}>Fluid Lending USDC</code></li>
                    <li><strong>Símbolo:</strong> <code style={codeStyle}>fUSDC</code></li>
                    <li><strong>ID API Preços:</strong> <code style={codeStyle}>usd-coin</code> (ou o ID do ativo correspondente na <a href="https://www.coingecko.com/en/api/documentation" target="_blank" rel="noopener noreferrer">CoinGecko</a>)</li>
                </ul>
                <h4>Passo 2: Registre as Operações como Transações</h4>
                <p>Use o formulário de "Registrar Transação" com os seguintes tipos:</p>
                <dl>
                    <dt><strong>Para o Investimento Inicial:</strong></dt>
                    <dd>
                        Use o tipo <strong>Compra</strong>. A quantidade é o valor que você investiu (ex: 1000 USDC) e o preço unitário é <code style={codeStyle}>1</code>.
                    </dd>
                    <br/>
                    <dt><strong>Para os Rendimentos (Juros):</strong></dt>
                    <dd>
                        Use o tipo <strong>Claim Lending</strong> ou <strong>Claim Staking</strong>. A quantidade é o valor do rendimento que você ganhou (ex: 5.5 USDC). O preço unitário será automaticamente <code style={codeStyle}>0</code>.
                    </dd>
                    <br/>
                    <dt><strong>Para Resgatar o Valor:</strong></dt>
                    <dd>
                        Use o tipo <strong>Venda</strong>. A quantidade é o valor que você retirou da plataforma. O preço unitário é <code style={codeStyle}>1</code>.
                    </dd>
                </dl>
            </div>

            <div className="content-card">
                <h3>2. Operações de Pools de Liquidez (LP) - Uniswap V3</h3>
                <p>
                    Esta é uma abordagem simplificada para registrar o investimento e o lucro/prejuízo realizado.
                </p>
                <h4>Passo 1: Crie um "Ativo Virtual" para a Posição LP</h4>
                <p><strong>Exemplo:</strong> Para uma posição LP de WETH/USDC na Uniswap V3:</p>
                <ul>
                    <li><strong>Nome:</strong> <code style={codeStyle}>Uniswap LP (WETH/USDC)</code></li>
                    <li><strong>Símbolo:</strong> <code style={codeStyle}>UNI-LP-WETHUSDC</code></li>
                    <li><strong>ID API Preços:</strong> <code style={codeStyle}>usd</code> (O sistema não rastreará o valor em tempo real.)</li>
                </ul>
                <h4>Passo 2: Registre as Operações como Transações</h4>
                <dl>
                    <dt><strong>Para Adicionar Liquidez (Investimento Inicial):</strong></dt>
                    <dd>
                        Use o tipo <strong>Compra</strong>. A quantidade será <code style={codeStyle}>1</code>. O preço unitário será o <strong>valor total em USD</strong> que você investiu.
                    </dd>
                    <br/>
                    <dt><strong>Para Coletar Taxas (Fees):</strong></dt>
                    <dd>
                        Use o tipo <strong>Claim Staking</strong>. A quantidade será o valor em USD das taxas que você coletou. O preço unitário será <code style={codeStyle}>1</code>.
                    </dd>
                    <br/>
                    <dt><strong>Para Remover Liquidez (Fechar Posição):</strong></dt>
                    <dd>
                        Use o tipo <strong>Venda</strong>. A quantidade será <code style={codeStyle}>1</code>. O preço unitário será o <strong>valor total em USD</strong> que você recebeu de volta.
                    </dd>
                </dl>
                <p style={{fontWeight: 'bold', color: '#e74c3c'}}>
                    Atenção: O sistema não rastreia o valor atual da sua posição LP em tempo real.
                </p>
            </div>
        </div>
    );
};

export default DeFiGuide;