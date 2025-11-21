import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Portfolio from './components/Portfolio';
import DeFiGuide from './components/DeFiGuide';
import AtivosPage from './components/AtivosPage';
import TransacoesPage from './components/TransacoesPage';
import SettingsPage from './components/SettingsPage';

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

function App() {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const response = await axios.get('/api/portfolio/');
                setPortfolioData(response.data);
            } catch (err) {
                console.error('Falha ao carregar dados do portfólio no App.tsx', err);
            }
        };
        fetchPortfolioData();
    }, []);

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Crypto Portfolio</h1>
                    <nav>
                        <Link to="/">Dashboard</Link>
                        <Link to="/ativos">Ativos</Link>
                        <Link to="/transacoes">Transações</Link>
                        <Link to="/guia-defi">Guia DeFi</Link>
                        <Link to="/settings">Settings</Link>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Portfolio />} />
                        <Route path="/ativos" element={<AtivosPage />} />
                        <Route path="/transacoes" element={<TransacoesPage />} />
                        <Route path="/guia-defi" element={<DeFiGuide />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
