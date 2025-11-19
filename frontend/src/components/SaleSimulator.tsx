import React, { useState } from 'react';
import axios from 'axios';

interface Asset {
    id: number;
    nome: string;
    simbolo: string;
}

interface SaleSimulatorProps {
    assets: Asset[];
}

const SaleSimulator: React.FC<SaleSimulatorProps> = ({ assets }) => {
    const [ativo_id, setAtivoId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [preco_venda, setPrecoVenda] = useState('');
    const [simulationResult, setSimulationResult] = useState<any>(null);

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/portfolio/simulate_sale', {
                ativo_id: parseInt(ativo_id),
                quantidade: parseFloat(quantidade),
                preco_venda: parseFloat(preco_venda)
            });
            setSimulationResult(response.data);
        } catch (error) {
            console.error('Error simulating sale', error);
        }
    };

    return (
        <div>
            <h2>Simulador de Vendas</h2>
            <form onSubmit={handleSimulate}>
                <select value={ativo_id} onChange={e => setAtivoId(e.target.value)} required>
                    <option value="" disabled>Selecione um ativo</option>
                    {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                            {asset.nome} ({asset.simbolo})
                        </option>
                    ))}
                </select>
                <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="Quantidade" required />
                <input type="number" value={preco_venda} onChange={e => setPrecoVenda(e.target.value)} placeholder="Preço de Venda" required />
                <button type="submit">Simular</button>
            </form>
            {simulationResult && (
                <div>
                    <h3>Resultados da Simulação</h3>
                    <p>Lucro/Prejuízo Realizado: ${simulationResult.lucro_prejuizo_realizado.toFixed(2)}</p>
                    <p>Novo Preço Médio: ${simulationResult.novo_preco_medio.toFixed(2)}</p>
                    <p>Impacto no Portfólio: ${simulationResult.impacto_portfolio.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

export default SaleSimulator;