# Crypto Portfolio

This is a full-stack web application for managing a cryptocurrency portfolio.

## Features

-   **Transaction Management (CRUD):** Add, edit, and delete buy, sell, and claim transactions.
    -   Formulário amigável com seleção de ativo por ComboBox.
    -   Preenchimento automático de data/hora e busca de preço atual.
-   **Asset Management (CRUD):** Add, edit, and delete cryptocurrency assets.
-   **Portfolio Dashboard:** View your total portfolio value, profit/loss, and a detailed breakdown of your assets.
    -   **Evolução do Portfólio:** Gráfico de linha com seleção de período (1a, 6m, 3m, 1m, 15d, 7d, 1d).
    -   **Evolução dos Ativos:** Gráficos de linha individuais para cada ativo, mostrando histórico de preço com seleção de período (90d, 30d, 7d, 1d). Eixo Y visível, sem rótulos de dados.
    -   **Alocação de Ativos:** Gráfico de pizza mostrando a distribuição do portfólio, agrupando fatias menores que 5% em "Outros". Percentuais exibidos sobre as fatias.
    -   **Custo vs. Valor Atual:** Gráfico de barras comparando custo e valor atual, ordenado por valor total decrescente, com valores em formato de milhar e negrito.
-   **Real-time Prices:** Fetches current cryptocurrency prices from the CoinGecko API with caching to prevent rate limiting.
-   **Sale Simulator:** Simulate the sale of an asset to see the potential profit or loss.
-   **DeFi Guide:** Comprehensive guide on how to register Lending, Staking, and Uniswap V3 Liquidity Pool (LP) positions.
-   **Dark Theme:** Modern dark theme applied throughout the application.

## Tech Stack

-   **Backend:** Python with FastAPI
-   **Frontend:** React with TypeScript
-   **Database:** SQLite (can be configured to use PostgreSQL)
-   **Charts:** Chart.js (with `react-chartjs-2`, `chartjs-adapter-date-fns`, `chartjs-plugin-datalabels`)
-   **Containerization:** Docker and Docker Compose

## Running the Application with Docker (Recommended)

The easiest way to get the application running is using Docker Compose.

1.  **Build and run the containers:**
    ```bash
    docker-compose up -d --build
    ```
    This command will build the Docker images for the backend and frontend, and then start the services in detached mode.

2.  **Access the application:**
    -   **Frontend:** Open your browser and navigate to `http://localhost:3000`
    -   **Backend API Documentation (Swagger UI):** `http://localhost:8000/docs`

## Initial Setup and Data Population

1.  **Create Assets:**
    -   Navigate to the **"Ativos"** page in the frontend (`http://localhost:3000/ativos`).
    -   Use the form to add your cryptocurrency assets (e.g., Bitcoin, Ethereum, USDC).
    -   **Important:** For each asset, provide the correct "ID API Preços" (CoinGecko ID) so the application can fetch real-time prices.

2.  **Register Transactions:**
    -   Navigate to the **"Transações"** page in the frontend (`http://localhost:3000/transacoes`).
    -   Select an asset from the dropdown, fill in the transaction details, and register your buys, sells, or claims.

3.  **DeFi Operations Guide:**
    -   For specific instructions on how to register Lending, Staking, or Uniswap V3 LP positions, visit the **"Guia DeFi"** page (`http://localhost:3000/guia-defi`).

## Daily Portfolio Snapshot

To populate the "Evolução do Portfólio" chart on the Dashboard, you need to run a script that takes a snapshot of your portfolio's total value. This script should be run periodically (e.g., once a day).

1.  **Execute the snapshot script:**
    ```bash
    docker-compose exec backend python scripts/take_snapshot.py
    ```
    You can set up a cron job or a similar scheduler on your host system to run this command automatically.

## Local Development (Without Docker)

If you prefer to run the backend and frontend locally without Docker:

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate # macOS/Linux
    # venv\Scripts\activate # Windows
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the backend server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    The frontend will be running at `http://localhost:3000`.

    **Note:** When running locally, ensure your backend is also running, as the frontend will proxy API requests to `http://localhost:8000`.

## Database Configuration

The application uses SQLite by default for simplicity. The `test.db` file is stored in the `backend/` directory and persists across container restarts.

To use PostgreSQL, you would need to:
1.  Install `psycopg2-binary` in your backend environment.
2.  Update the `DATABASE_URL` environment variable in `docker-compose.yml` (for Docker) or directly in `backend/app/database.py` (for local development) to your PostgreSQL connection string.
3.  Ensure your PostgreSQL server is accessible.