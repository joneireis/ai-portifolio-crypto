import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SnapshotLog {
    id: number;
    timestamp: string;
    status: string;
    message: string;
}

const SettingsPage = () => {
    const [logs, setLogs] = useState<SnapshotLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get<SnapshotLog[]>('/api/settings/snapshot-logs');
                setLogs(response.data);
            } catch (err) {
                setError('Falha ao carregar os logs de snapshot.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Settings</h3>
            </div>
            <div className="charts-section">
                <div className="chart-card-full">
                    <h2>Logs de Snapshot do Portfólio</h2>
                    {loading && <p>Carregando logs...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {!loading && !error && (
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

