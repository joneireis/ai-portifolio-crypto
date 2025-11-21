// src/components/DcaGaugeChart.tsx
import React from 'react';
import { Chart } from 'react-google-charts';

interface DcaGaugeChartProps {
    isExpanded: boolean;
    onToggleExpand: () => void;
    precoMedioDCA: string;
}

export const DcaGaugeChart: React.FC<DcaGaugeChartProps> = ({ isExpanded, onToggleExpand, precoMedioDCA }) => {
    // O valor atual do Múltiplo de Mayer a ser exibido.
    const mayerMultiple = 1.15;

    // Dados para o gráfico de medidor.
    const data = [
        ['Label', 'Value'],
        ['Mayer', mayerMultiple],
    ];

    // Opções de configuração para o gráfico de medidor.
    // A biblioteca react-google-charts para Gauge só suporta 3 cores (green, yellow, red).
    // A zona "Laranja" (1.21-1.50) foi mesclada na zona "Amarela" para se adequar a essa limitação.
    const options = {
        height: 240,
        // Zona Verde: Compra Forte
        greenFrom: 0,
        greenTo: 0.8,
        // Zona Amarela: Compra Padrão / Cuidado (inclui a zona Laranja solicitada)
        yellowFrom: 0.8,
        yellowTo: 1.5,
        // Zona Vermelha: Compra Fraca / Pausa
        redFrom: 1.5,
        redTo: 2.5, // O valor máximo da escala.
        minorTicks: 5, // Número de marcações menores entre os números principais.
        majorTicks: ['0', '0.8', '1.5', '2.5'], // Rótulos principais na escala.
        max: 2.5, // Valor máximo da escala.
    };

    const explanationText = `
        O Múltiplo de Mayer é um indicador on-chain que compara o preço atual do Bitcoin com sua média móvel de 200 dias.
        Ele ajuda a identificar períodos de sobrecompra e sobrevenda, sendo uma ferramenta popular para estratégias de DCA (Dollar-Cost Averaging) tático.
        
        - **Zona Verde (0.00 a 0.80):** Indica que o preço está significativamente abaixo da média de 200 dias, sugerindo uma forte oportunidade de compra.
        - **Zona Amarela (0.81 a 1.50):** O preço está próximo ou ligeiramente acima da média de 200 dias. É uma boa zona para DCA padrão. A parte superior desta zona (1.21-1.50) sugere cautela, pois o preço começa a ficar mais esticado.
        - **Zona Vermelha (Acima de 1.51):** O preço está muito acima da média de 200 dias, indicando sobrecompra e um risco maior para novas compras, sendo um bom momento para pausar o DCA ou considerar vendas parciais.
    `;

    return (
        <div className="gauge-chart-container">
            <h4 className="gauge-chart-title" onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
                Sinal DCA Tático (Baseado no Múltiplo de Mayer)
            </h4>
            <Chart
                chartType="Gauge"
                width="400px"
                height="240px"
                data={data}
                options={options}
                className="centered-gauge-chart"
            />
            <p className="gauge-chart-subtitle">Preço Médio DCA do Usuário: {precoMedioDCA}</p>
            {isExpanded && (
                <div className="indicator-explanation">
                    <p>{explanationText}</p>
                </div>
            )}
        </div>
    );
};

export default DcaGaugeChart;
