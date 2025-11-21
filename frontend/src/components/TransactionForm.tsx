import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface para definir a estrutura de um ativo
interface Ativo {
  id: number;
  nome: string;
  simbolo: string;
  id_api_precos: string;
}

// Função para obter a data e hora atuais no formato para o input datetime-local
const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const TransactionForm = () => {
    // Estados do formulário
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [ativo_id, setAtivoId] = useState('');
    const [tipo_transacao, setTipoTransacao] = useState('compra');
    const [quantidade, setQuantidade] = useState('');
    const [preco_unitario, setPrecoUnitario] = useState('');
    const [data_transacao, setDataTransacao] = useState(getCurrentDateTime());
    const [taxas_pagas, setTaxasPagas] = useState('');
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);

    // Efeito para buscar os ativos cadastrados
    useEffect(() => {
        const fetchAtivos = async () => {
            try {
                const response = await axios.get<Ativo[]>('/api/ativos/');
                setAtivos(response.data);
                if (response.data.length > 0) {
                    setAtivoId(response.data[0].id.toString());
                }
            } catch (error) {
                console.error('Error fetching ativos', error);
            }
        };
        fetchAtivos();
    }, []);

    // Efeito para ajustar o preço unitário para claims
    useEffect(() => {
        if (tipo_transacao === 'claim_lending' || tipo_transacao === 'claim_staking') {
            setPrecoUnitario('0');
        }
    }, [tipo_transacao]);

    const handleFetchPrice = async () => {
        if (!ativo_id) {
            alert('Por favor, selecione um ativo primeiro.');
            return;
        }
        
        const selectedAtivo = ativos.find(a => a.id === parseInt(ativo_id));
        if (!selectedAtivo) {
            alert('Ativo selecionado não encontrado.');
            return;
        }

        setIsFetchingPrice(true);
        try {
            // Usa o id_api_precos para buscar o preço
            const response = await axios.get(`/api/ativos/price/${selectedAtivo.id_api_precos}`);
            setPrecoUnitario(response.data.price.toString());
        } catch (error) {
            console.error('Error fetching price', error);
            alert('Não foi possível buscar o preço do ativo.');
        } finally {
            setIsFetchingPrice(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ativo_id) {
            alert('Por favor, selecione um ativo.');
            return;
        }
        const newTransaction = {
            ativo_id: parseInt(ativo_id),
            tipo_transacao,
            quantidade: parseFloat(quantidade),
            preco_unitario: parseFloat(preco_unitario),
            data_transacao: data_transacao,
            taxas_pagas: parseFloat(taxas_pagas) || 0
        };
        try {
            await axios.post('/api/transacoes/', newTransaction);
            alert('Transação registrada com sucesso!');
            setQuantidade('');
            setPrecoUnitario(tipo_transacao === 'claim_lending' || tipo_transacao === 'claim_staking' ? '0' : '');
            setTaxasPagas('');
        } catch (error: any) {
            if (error.response) {
                console.error('Error creating transaction:', error.response.data);
                alert('Erro ao criar transação: ' + JSON.stringify(error.response.data));
            } else {
                console.error('Error creating transaction:', error.message);
                alert('Erro ao criar transação: ' + error.message);
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Registrar Nova Transação</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="ativo">Ativo</label>
                        <select id="ativo" value={ativo_id} onChange={e => setAtivoId(e.target.value)} required>
                            <option value="" disabled>{ativos.length > 0 ? 'Selecione um Ativo' : 'Nenhum ativo cadastrado'}</option>
                            {ativos.map(ativo => (
                                <option key={ativo.id} value={ativo.id}>{ativo.nome} ({ativo.simbolo})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="tipo_transacao">Tipo de Transação</label>
                        <select id="tipo_transacao" value={tipo_transacao} onChange={e => setTipoTransacao(e.target.value)}>
                            <option value="compra">Compra</option>
                            <option value="venda">Venda</option>
                            <option value="claim_lending">Claim Lending</option>
                            <option value="claim_staking">Claim Staking</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="quantidade">Quantidade</label>
                        <input id="quantidade" type="number" step="any" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="Ex: 1.5" required />
                    </div>
                    <div className="form-group price-group">
                        <label htmlFor="preco_unitario">Preço Unitário</label>
                        <input 
                            id="preco_unitario" 
                            type="number" 
                            step="any" 
                            value={preco_unitario} 
                            onChange={e => setPrecoUnitario(e.target.value)} 
                            placeholder="Ex: 50000.00" 
                            required 
                            disabled={tipo_transacao === 'claim_lending' || tipo_transacao === 'claim_staking'}
                        />
                        <button 
                            type="button" 
                            onClick={handleFetchPrice} 
                            disabled={isFetchingPrice || tipo_transacao === 'claim_lending' || tipo_transacao === 'claim_staking'} 
                            className="fetch-price-button"
                        >
                            {isFetchingPrice ? 'Buscando...' : 'Buscar Preço'}
                        </button>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="data_transacao">Data da Transação</label>
                        <input id="data_transacao" type="datetime-local" value={data_transacao} onChange={e => setDataTransacao(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="taxas_pagas">Taxas Pagas (Opcional)</label>
                        <input id="taxas_pagas" type="number" step="any" value={taxas_pagas} onChange={e => setTaxasPagas(e.target.value)} placeholder="Ex: 5.50" />
                    </div>
                </div>
                
                <button type="submit">Registrar Transação</button>
            </form>
        </div>
    );
};

export default TransactionForm;
