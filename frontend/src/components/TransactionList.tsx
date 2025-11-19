import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces para tipagem dos dados
interface Ativo {
  id: number;
  nome: string;
  simbolo: string;
}

interface Transacao {
  id: number;
  ativo_id: number;
  tipo_transacao: string;
  quantidade: number;
  preco_unitario: number;
  data_transacao: string;
}

const TransactionList = () => {
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [ativosMap, setAtivosMap] = useState<Map<number, Ativo>>(new Map());

    const fetchData = async () => {
        try {
            // Busca as duas fontes de dados em paralelo
            const [transacoesRes, ativosRes] = await Promise.all([
                axios.get<Transacao[]>('/api/transacoes/'),
                axios.get<Ativo[]>('/api/ativos/')
            ]);

            // Cria um mapa de ID do ativo para o objeto do ativo para consulta rápida
            const newAtivosMap = new Map(ativosRes.data.map(ativo => [ativo.id, ativo]));
            
            setTransacoes(transacoesRes.data);
            setAtivosMap(newAtivosMap);

        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // O array vazio garante que rode apenas uma vez

    const handleDelete = async (transacaoId: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await axios.delete(`/api/transacoes/${transacaoId}`);
                // Remove a transação da lista no estado local para atualizar a UI
                setTransacoes(transacoes.filter(t => t.id !== transacaoId));
            } catch (error) {
                console.error('Error deleting transaction', error);
                alert('Não foi possível excluir a transação.');
            }
        }
    };

    // Função para obter o nome do ativo a partir do mapa
    const getAtivoNome = (ativoId: number) => {
        return ativosMap.get(ativoId)?.nome || 'Desconhecido';
    };

    return (
        <div>
            <h2>Histórico de Transações</h2>
            <table>
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {transacoes.map(transacao => (
                        <tr key={transacao.id}>
                            <td>{getAtivoNome(transacao.ativo_id)}</td>
                            <td>{transacao.tipo_transacao}</td>
                            <td>{transacao.quantidade}</td>
                            <td>${transacao.preco_unitario.toFixed(2)}</td>
                            <td>{new Date(transacao.data_transacao).toLocaleString()}</td>
                            <td>
                                <button onClick={() => handleDelete(transacao.id)} className="delete-button">
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionList;
