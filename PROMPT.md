# Prompt para Criação de Aplicação de Portfólio de Criptomoedas

## Persona

Você é um Engenheiro de Software Full-Stack Sênior, especialista em desenvolvimento de aplicações web de Finanças (FinTech), visualização de dados e integração com APIs de criptomoedas.

## Objetivo

Criar o código completo para uma aplicação web de gerenciamento de portfólio de criptomoedas. A aplicação deve ser robusta, escalável e focada em fornecer insights claros para o usuário.

---

### 1. Stack de Tecnologia

*   **Backend:** Python com **FastAPI** (para alta performance e facilidade de criação de APIs).
*   **Frontend:** **React** com TypeScript (para uma UI moderna e tipada).
*   **Banco de Dados:** **SQLite** (para simplicidade) com possibilidade de configuração para **PostgreSQL**.
*   **Gráficos:** **Chart.js** no frontend.
*   **Containerização:** **Docker** e **Docker Compose**.

### 2. Modelos de Dados (Esquema do Banco de Dados)

A aplicação precisará das seguintes tabelas:

1.  **`Ativos`**: (id, nome, simbolo, id_api_precos_ex: 'bitcoin')
2.  **`Transacoes`**: (id, ativo_id, tipo_transacao, quantidade, preco_unitario, data_transacao, taxas_pagas)
    *   `tipo_transacao`: Deve ser um ENUM ('compra', 'venda', 'claim_lending', 'claim_staking').
3.  **`PortfolioSnapshots`**: (id, data, valor_total)

### 3. Funcionalidades Essenciais (Módulos da Aplicação)

#### Módulo 1: Gerenciamento de Transações (CRUD)

*   **Registrar Entradas (Compras):** Formulário para adicionar uma `compra` (Ativo, Quantidade, Preço Pago, Data).
*   **Registrar Saídas (Vendas):** Formulário para adicionar uma `venda` (Ativo, Quantidade, Preço Vendido, Data).
*   **Registrar "Claims":** Formulário para `claim_lending` ou `claim_staking` (Ativo, Quantidade, Data).
*   **Listagem de Transações:** Uma tabela para visualizar todo o histórico de transações, com filtros.

#### Módulo 2: Dashboard e Visão Geral do Portfólio

Esta é a página principal. Ela deve exibir:

1.  **Valor Total do Portfólio:** Soma do valor atual de todos os ativos.
2.  **P/L Total (Não Realizado):** (Valor Total Atual) - (Custo Total Investido).
3.  **Custo Médio (Average Cost Basis):** Para cada ativo, calcule o preço médio de compra.
4.  **Tabela de Ativos:** Lista de todos os ativos no portfólio (Ativo, Quantidade, Preço Médio, Preço Atual, Valor Total, P/L Não Realizado %).

#### Módulo 3: Atualização de Preços Online

*   O sistema deve buscar os preços atuais dos ativos automaticamente, utilizando a API da **CoinGecko**.

#### Módulo 4: Configurações (Settings)

*   **Logs de Snapshot:** Uma seção para visualizar os últimos 10 registros de execução do processo de snapshot do portfólio, incluindo timestamp, status e mensagem.
*   **Ajustes do Agendador:** Permite visualizar e configurar o intervalo de tempo (em minutos) para a execução automática do snapshot do portfólio.

### 4. Gráficos e Acompanhamento

#### Gráfico 1: Evolução Diária do Portfólio

*   **Tipo:** Gráfico de Linha.
*   **Eixo X:** Tempo (Dia).
*   **Eixo Y:** Valor Total do Portfólio.
*   **Implementação:** Requer um "snapshot" diário. Um agendador no backend roda automaticamente para registrar o valor total do portfólio na tabela `PortfolioSnapshots`.

#### Gráfico 2: Alocação de Ativos

*   **Tipo:** Gráfico de Pizza (Donut Chart).
*   **Visualização:** Mostra qual porcentagem do valor total do portfólio está em cada ativo.

#### Gráfico 3: Comparação Custo vs. Valor

*   **Tipo:** Gráfico de Barras Agrupadas (para cada ativo).
*   **Visualização:** Para cada ativo, mostrar duas barras lado a lado:
    1.  Barra 1: Custo Total Investido (Quantidade * Preço Médio).
    2.  Barra 2: Valor Atual (Quantidade * Preço Atual).

### 5. Entregáveis

1.  A estrutura de arquivos completa para o backend (FastAPI) e frontend (React).
2.  O código-fonte completo para todos os arquivos.
3.  Um arquivo `requirements.txt` (para Python) e `package.json` (para React).
4.  Um `Dockerfile` para o backend e um para o frontend.
5.  Um arquivo `docker-compose.yml` para orquestrar os serviços.
6.  Instruções claras em um `README.md` sobre como configurar o banco de dados, instalar as dependências e rodar a aplicação localmente e com Docker.

---

### Histórico de Implementação e Melhorias (Além do Prompt Inicial)

Esta seção documenta as funcionalidades e aprimoramentos adicionados ao projeto durante o desenvolvimento, com base nas interações e feedback do usuário.

1.  **Correções de Build e Inicialização:**
    *   Criação do `frontend/public/index.html` para resolver erro de build do React.
    *   Correção de erros de linting e tipagem no frontend (`Portfolio.tsx`, `PortfolioChart.tsx`).
    *   Simplificação do `backend/Dockerfile` (estágio único) para resolver erro de `uvicorn not found`.
    *   Adição de `healthcheck` no `docker-compose.yml` e instalação de `curl` no `backend/Dockerfile` para garantir a ordem de inicialização dos serviços.
    *   Correção de `AttributeError` no backend (`main.py`) devido à remoção acidental do schema `SaleSimulation`.

2.  **Melhorias de Configuração e Robustez:**
    *   Atualização do `schemas.py` para usar `from_attributes = True` (Pydantic v2).
    *   Configuração de CORS no `main.py` para permitir comunicação frontend-backend.
    *   Ajuste do `frontend/nginx.conf` para roteamento correto de `/api` para o backend.
    *   Remoção de volume desnecessário no serviço `frontend` do `docker-compose.yml`.
    *   Implementação de cache no backend (`main.py`) para chamadas à API da CoinGecko, mitigando problemas de "rate limiting".
    *   Otimização da busca de preços no endpoint `/portfolio/` para usar chamadas em massa à CoinGecko.
    *   **Agendador de Snapshot:** Implementação de um agendador (`apscheduler`) no backend para automatizar a execução do snapshot do portfólio em intervalos configuráveis.

3.  **Melhorias de Usabilidade e Funcionalidades do Frontend:**
    *   **Tema Dark:** Implementação de um tema escuro para toda a aplicação.
    *   **Gerenciamento de Ativos (CRUD):**
        *   Nova página "Ativos" (`/ativos`) com formulário para cadastrar, editar e excluir ativos.
        *   Funcionalidades de exclusão e edição de ativos no backend (`crud.py`, `main.py`) e frontend (`AtivoForm.tsx`, `AtivosPage.tsx`).
        *   Verificação de integridade no backend para impedir exclusão de ativos com transações.
        *   Melhoria do layout do formulário de ativos para melhor UI/UX.
    *   **Formulário de Transações (`TransactionForm.tsx`):**
        *   Substituição do campo "ID do Ativo" por um ComboBox com seleção por nome/símbolo.
        *   Preenchimento automático da data/hora atual.
        *   Botão "Buscar Preço" para preencher o preço unitário atual do ativo selecionado (funcionalidade corrigida).
        *   Preenchimento automático de "Preço Unitário = 0" para transações de `claim_lending` e `claim_staking`.
        *   Layout mais compacto (múltiplos campos por linha) e melhoria do layout geral do formulário para melhor UI/UX.
    *   **Histórico de Transações (`TransactionList.tsx`):**
        *   Exibição do nome do ativo em vez do ID.
        *   Funcionalidade de exclusão de transações.
    *   **Guia DeFi (`DeFiGuide.tsx`):**
        *   Nova página (`/guia-defi`) com instruções detalhadas sobre como registrar operações de Lending, Staking e Pools de Liquidez (Uniswap V3).
        *   Esquema de cores ajustado para o tema dark.
    *   **Dashboard (`Portfolio.tsx`):**
        *   **Gráfico "Evolução do Portfólio":** Adição de botões de período (1a, 6m, 3m, 1m, 15d, 7d, 1d).
        *   **Gráficos "Evolução dos Ativos":** Gráficos de linha individuais para cada ativo com seleção de período (90d, 30d, 7d, 1d). Eixo Y visível, sem rótulos de dados sobre a linha.
        *   **Gráfico "Alocação de Ativos":** Agrupamento de fatias menores que 5% em "Outros", com percentuais sobre as fatias.
        *   **Gráfico "Custo vs. Valor Atual":** Valores em formato de milhar e negrito, ordenado por valor total decrescente.
    *   **Página de Configurações (`SettingsPage.tsx`):**
        *   Nova página (`/settings`) para gerenciar configurações da aplicação.
        *   Seção "Ajustes do Agendador Snapshot" para visualizar e configurar o intervalo de execução do snapshot.
        *   Seção "Logs de Snapshot do Portfólio" exibindo os últimos 10 registros de execução do snapshot.
    *   **Remoção do Simulador de Vendas:** A página e a funcionalidade de "Simulador de Vendas" foram removidas da aplicação.

---

