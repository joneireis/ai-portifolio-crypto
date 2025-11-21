import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface SnapshotLog {
    id: number;
    timestamp: string;
    status: string;
    message: string;
}

const SettingsPage = () => {
    const [logs, setLogs] = useState<SnapshotLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
    const [logsError, setLogsError] = useState<string | null>(null);
    
    const [interval, setInterval] = useState<number>(0);
    const [newInterval, setNewInterval] = useState<string>('');
    const [loadingInterval, setLoadingInterval] = useState<boolean>(true);
    const [intervalError, setIntervalError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const response = await axios.get<SnapshotLog[]>('/api/settings/snapshot-logs?limit=10');
            setLogs(response.data);
        } catch (err) {
            setLogsError('Falha ao carregar os logs de snapshot.');
            console.error(err);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    const fetchInterval = useCallback(async () => {
        setLoadingInterval(true);
        try {
            const response = await axios.get<{ interval_minutes: number }>('/api/settings/scheduler');
            setInterval(response.data.interval_minutes);
            setNewInterval(response.data.interval_minutes.toString());
        } catch (err) {
            setIntervalError('Falha ao carregar o intervalo do agendador.');
            console.error(err);
        } finally {
            setLoadingInterval(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        fetchInterval();
    }, [fetchLogs, fetchInterval]);

    const handleUpdateInterval = async (e: React.FormEvent) => {
        e.preventDefault();
        const minutes = parseInt(newInterval, 10);
        if (isNaN(minutes) || minutes <= 0) {
            alert('Por favor, insira um número de minutos válido e maior que zero.');
            return;
        }
        try {
            await axios.post('/api/settings/scheduler', { interval_minutes: minutes });
            setInterval(minutes);
            alert('Intervalo do agendador atualizado com sucesso!');
        } catch (error) {
            alert('Falha ao atualizar o intervalo do agendador.');
            console.error(error);
        }
    };

    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Settings</h3>
            </div>
            <div className="charts-section">
                <div className="chart-card-full">
                    <h2>Ajustes do Agendador Snapshot</h2>
                    {loadingInterval && <p>Carregando configurações...</p>}
                    {intervalError && <p className="error-message">{intervalError}</p>}
                    {!loadingInterval && !intervalError && (
                        <form onSubmit={handleUpdateInterval} className="form-container" style={{margin: '0', maxWidth: '500px'}}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="interval">Intervalo de Atualização (minutos)</label>
                                    <input 
                                        id="interval"
                                        type="number"
                                        value={newInterval}
                                        onChange={e => setNewInterval(e.target.value)}
                                        placeholder="Ex: 60"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit">Salvar Intervalo</button>
                        </form>
                    )}
                </div>

                <div className="chart-card-full">
                    <h2>Últimos 10 Logs de Snapshot</h2>
                    <button onClick={fetchLogs} disabled={loadingLogs} style={{marginBottom: '1rem'}}>
                        {loadingLogs ? 'Atualizando...' : 'Atualizar Logs'}
                    </button>
                    {loadingLogs && <p>Carregando logs...</p>}
                    {logsError && <p className="error-message">{logsError}</p>}
                    {!loadingLogs && !logsError && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Status</th>
                                    <th>Mensagem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map(log => (
                                        <tr key={log.id}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>
                                                <span className={`status status-${log.status.toLowerCase()}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>{log.message}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3}>Nenhum log encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

