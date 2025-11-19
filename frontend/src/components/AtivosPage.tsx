import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AtivoForm from './AtivoForm';

interface Ativo {
    id: number;
    nome: string;
    simbolo: string;
    id_api_precos: string;
}

const AtivosPage = () => {
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [editingAtivo, setEditingAtivo] = useState<Ativo | null>(null);

    const fetchAtivos = useCallback(async () => {
        try {
            const response = await axios.get<Ativo[]>('/api/ativos/');
            setAtivos(response.data);
        } catch (error) {
            console.error('Error fetching ativos', error);
        }
    }, []);

    useEffect(() => {
        fetchAtivos();
    }, [fetchAtivos]);

    const handleEdit = (ativo: Ativo) => {
        setEditingAtivo(ativo);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página para o topo para ver o formulário
    };

    const handleDelete = async (ativoId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.')) {
            try {
                await axios.delete(`/api/ativos/${ativoId}`);
                fetchAtivos(); // Recarrega a lista de ativos
            } catch (error: any) {
                if (error.response) {
                    console.error('Error deleting ativo:', error.response.data);
                    alert('Erro ao excluir ativo: ' + error.response.data.detail);
                } else {
                    console.error('Error deleting ativo:', error.message);
                    alert('Erro ao excluir ativo: ' + error.message);
                }
            }
        }
    };

    return (
        <div>
            <h2>Gerenciar Ativos</h2>
            <p style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto 30px auto' }}>
                Cadastre aqui todos os ativos que você negocia, incluindo moedas (Bitcoin, Ethereum), stablecoins (USDC) e os "Ativos Virtuais" para representar suas posições em DeFi, conforme explicado no Guia DeFi.
            </p>
            
            <AtivoForm 
                onFormSubmit={fetchAtivos} 
                editingAtivo={editingAtivo}
                setEditingAtivo={setEditingAtivo}
            />

            <h3>Ativos Cadastrados</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Símbolo</th>
                        <th>ID API Preços</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {ativos.map(ativo => (
                        <tr key={ativo.id}>
                            <td>{ativo.id}</td>
                            <td>{ativo.nome}</td>
                            <td>{ativo.simbolo}</td>
                            <td>{ativo.id_api_precos}</td>
                            <td className="actions-cell">
                                <button onClick={() => handleEdit(ativo)} className="edit-button">
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(ativo.id)} className="delete-button">
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

export default AtivosPage;