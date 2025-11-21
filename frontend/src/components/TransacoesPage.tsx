import React from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

const TransacoesPage = () => {
    return (
        <div className="portfolio-dashboard">
            <div className="dashboard-header">
                <h3>Transações</h3>
            </div>
            <div className="charts-section">
                <div className="chart-card-full">
                    <TransactionForm />
                </div>
                <div className="chart-card-full">
                    <TransactionList />
                </div>
            </div>
        </div>
    );
};

export default TransacoesPage;
