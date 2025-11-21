import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Ativo {
    id: number;
    nome: string;
    simbolo: string;
    id_api_precos: string;
}

interface AtivoFormProps {
    onFormSubmit: () => void; // Callback para atualizar a lista de ativos
    editingAtivo: Ativo | null;
    setEditingAtivo: (ativo: Ativo | null) => void;
}

const AtivoForm: React.FC<AtivoFormProps> = ({ onFormSubmit, editingAtivo, setEditingAtivo }) => {
    const [nome, setNome] = useState('');
    const [simbolo, setSimbolo] = useState('');
    const [id_api_precos, setIdApiPrecos] = useState('');
    const isEditing = editingAtivo !== null;

    useEffect(() => {
        if (isEditing) {
            setNome(editingAtivo.nome);
            setSimbolo(editingAtivo.simbolo);
            setIdApiPrecos(editingAtivo.id_api_precos);
        }
    }, [editingAtivo, isEditing]);

    const clearForm = () => {
        setNome('');
        setSimbolo('');
        setIdApiPrecos('');
        setEditingAtivo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ativoData = { nome, simbolo, id_api_precos };
        
        try {
            if (isEditing) {
                // Modo de Edição
                await axios.put(`/api/ativos/${editingAtivo.id}`, ativoData);
                alert('Ativo atualizado com sucesso!');
            } else {
                // Modo de Criação
                await axios.post('/api/ativos/', ativoData);
                alert('Ativo cadastrado com sucesso!');
            }
            clearForm();
            onFormSubmit(); // Atualiza a lista no componente pai
        } catch (error: any) {
            const action = isEditing ? 'atualizar' : 'criar';
            if (error.response) {
                console.error(`Error ${action} ativo:`, error.response.data);
                alert(`Erro ao ${action} ativo: ` + JSON.stringify(error.response.data));
            } else {
                console.error(`Error ${action} ativo:`, error.message);
                alert(`Erro ao ${action} ativo: ` + error.message);
            }
        }
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Ativo' : 'Cadastrar Novo Ativo'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nome">Nome do Ativo</label>
                        <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Bitcoin" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="simbolo">Símbolo</label>
                        <input id="simbolo" type="text" value={simbolo} onChange={e => setSimbolo(e.target.value)} placeholder="Ex: BTC" required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group full-width">
                        <label htmlFor="id_api_precos">ID da API de Preços (CoinGecko)</label>
                        <input id="id_api_precos" type="text" value={id_api_precos} onChange={e => setIdApiPrecos(e.target.value)} placeholder="Ex: bitcoin" required />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit">{isEditing ? 'Atualizar Ativo' : 'Cadastrar Ativo'}</button>
                    {isEditing && (
                        <button type="button" onClick={clearForm} className="cancel-button">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AtivoForm;