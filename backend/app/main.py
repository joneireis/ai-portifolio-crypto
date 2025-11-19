from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Union, Optional
from pydantic import BaseModel
import requests
import time
import random # Importa random para o jitter no backoff

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lógica de Preços e Cache Otimizada ---

CACHE_DURATION_SECONDS = 120  # 2 minutos (para preços individuais)
CHART_CACHE_DURATION_SECONDS = 3600 # 1 hora (para dados de gráficos)

price_cache = {} # Cache global para preços e dados de gráficos

def get_current_prices_bulk(id_list: list[str]) -> dict[str, float]:
    """Busca preços em massa, utilizando o cache."""
    current_time = time.time()
    prices = {}
    ids_to_fetch = []

    # 1. Verifica o cache primeiro
    for asset_id in id_list:
        if asset_id in price_cache:
            cached_price, timestamp = price_cache[asset_id]
            if current_time - timestamp < CACHE_DURATION_SECONDS:
                prices[asset_id] = cached_price
            else:
                ids_to_fetch.append(asset_id)
        else:
            ids_to_fetch.append(asset_id)

    # 2. Se houver IDs que precisam ser buscados, faz a chamada em massa
    if ids_to_fetch:
        retries = 3
        for i in range(retries):
            try:
                ids_string = ",".join(ids_to_fetch)
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_string}&vs_currencies=usd"
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()

                # 3. Atualiza o cache e o dicionário de preços
                for asset_id in ids_to_fetch:
                    price = data.get(asset_id, {}).get("usd", 0.0)
                    prices[asset_id] = price
                    if price > 0: # Só armazena em cache preços válidos
                        price_cache[asset_id] = (price, current_time)
                break # Sai do loop de retries se a requisição for bem-sucedida
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429 and i < retries - 1:
                    wait_time = (2 ** i) * 2 + random.uniform(0, 1) # Dobra o tempo de espera inicial
                    print(f"Rate limit hit for bulk prices. Retrying in {wait_time:.2f} seconds...")
                    time.sleep(wait_time)
                else:
                    print(f"Could not fetch bulk prices: {e}")
                    for asset_id in ids_to_fetch:
                        prices.setdefault(asset_id, 0.0)
                    break # Sai do loop de retries se não for 429 ou se for a última tentativa
            except (requests.exceptions.RequestException, KeyError) as e:
                print(f"Could not fetch bulk prices: {e}")
                for asset_id in ids_to_fetch:
                    prices.setdefault(asset_id, 0.0)
                break # Sai do loop de retries para outros erros

    return prices

# --- Endpoints da API ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/ativos/", response_model=schemas.Ativo)
def create_ativo(ativo: schemas.AtivoCreate, db: Session = Depends(get_db)):
    return crud.create_ativo(db=db, ativo=ativo)

@app.get("/ativos/", response_model=List[schemas.Ativo])
def read_ativos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_ativos(db, skip=skip, limit=limit)

@app.get("/ativos/{ativo_id}", response_model=schemas.Ativo)
def read_ativo(ativo_id: int, db: Session = Depends(get_db)):
    db_ativo = crud.get_ativo(db, ativo_id=ativo_id)
    if db_ativo is None:
        raise HTTPException(status_code=404, detail="Ativo not found")
    return db_ativo

@app.delete("/ativos/{ativo_id}", response_model=schemas.Ativo)
def delete_ativo(ativo_id: int, db: Session = Depends(get_db)):
    # Adicionar verificação para não excluir ativos com transações associadas
    transacoes = db.query(models.Transacoes).filter(models.Transacoes.ativo_id == ativo_id).count()
    if transacoes > 0:
        raise HTTPException(status_code=400, detail="Não é possível excluir um ativo que possui transações associadas.")
    
    db_ativo = crud.delete_ativo(db, ativo_id=ativo_id)
    if db_ativo is None:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    return db_ativo

@app.put("/ativos/{ativo_id}", response_model=schemas.Ativo)
def update_ativo(ativo_id: int, ativo: schemas.AtivoCreate, db: Session = Depends(get_db)):
    db_ativo = crud.update_ativo(db, ativo_id=ativo_id, ativo=ativo)
    if db_ativo is None:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    return db_ativo


@app.get("/ativos/charts/{id_api_precos}")
def get_asset_chart_data(id_api_precos: str, days: Union[int, str] = 7, interval: Optional[str] = None):
    # IDs que não funcionam com market_chart
    INVALID_CHART_IDS = ["usd", "brl", "eur"] # Adicionar outros se necessário
    if id_api_precos in INVALID_CHART_IDS:
        raise HTTPException(status_code=400, detail=f"Gráfico não disponível para o ID '{id_api_precos}'.")

    cache_key = f"chart_{id_api_precos}_{days}_{interval}"
    if cache_key in price_cache:
        cached_data, timestamp = price_cache[cache_key]
        if time.time() - timestamp < CHART_CACHE_DURATION_SECONDS: # Usar cache mais longo
            return cached_data

    retries = 3
    for i in range(retries):
        try:
            url = f"https://api.coingecko.com/api/v3/coins/{id_api_precos}/market_chart?vs_currency=usd&days={days}"
            if interval:
                url += f"&interval={interval}"
                
            response = requests.get(url)
            response.raise_for_status() # Levanta HTTPException para 4xx/5xx
            data = response.json()
            
            price_cache[cache_key] = (data, time.time()) # Armazena no cache
            return data
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429 and i < retries - 1:
                wait_time = (2 ** i) * 2 + random.uniform(0, 1) # Dobra o tempo de espera inicial
                print(f"Rate limit hit for {id_api_precos}. Retrying in {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Could not fetch chart data for {id_api_precos} (days={days}, interval={interval}): {e}")
                raise HTTPException(status_code=500, detail="Failed to fetch chart data from external API")
        except Exception as e:
            print(f"Could not fetch chart data for {id_api_precos} (days={days}, interval={interval}): {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch chart data from external API")

@app.post("/transacoes/", response_model=schemas.Transacao)
def create_transacao(transacao: schemas.TransacaoCreate, db: Session = Depends(get_db)):
    return crud.create_transacao(db=db, transacao=transacao)

@app.get("/transacoes/", response_model=List[schemas.Transacao])
def read_transacoes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transacoes(db, skip=skip, limit=limit)

@app.delete("/transacoes/{transacao_id}", response_model=schemas.Transacao)
def delete_transacao(transacao_id: int, db: Session = Depends(get_db)):
    db_transacao = crud.delete_transacao(db, transacao_id=transacao_id)
    if db_transacao is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return db_transacao

@app.get("/portfolio/")
def get_portfolio(db: Session = Depends(get_db)):
    transacoes = crud.get_transacoes(db, limit=1000)
    ativos = crud.get_ativos(db, limit=100)

    # Otimização: Buscar todos os preços de uma vez
    all_api_ids = list(set([ativo.id_api_precos for ativo in ativos]))
    current_prices = get_current_prices_bulk(all_api_ids)

    portfolio = {}
    for ativo in ativos:
        portfolio[ativo.id] = {
            "id": ativo.id,
            "nome": ativo.nome,
            "simbolo": ativo.simbolo,
            "id_api_precos": ativo.id_api_precos,
            "quantidade": 0,
            "custo_total": 0,
            "preco_medio": 0,
            "preco_atual": current_prices.get(ativo.id_api_precos, 0.0),
            "valor_total": 0,
            "pl_nao_realizado": 0,
        }

    for t in transacoes:
        if t.ativo_id in portfolio:
            if t.tipo_transacao == models.TipoTransacao.compra:
                portfolio[t.ativo_id]["quantidade"] += t.quantidade
                portfolio[t.ativo_id]["custo_total"] += t.quantidade * t.preco_unitario
            elif t.tipo_transacao == models.TipoTransacao.venda:
                portfolio[t.ativo_id]["quantidade"] -= t.quantidade
            elif t.tipo_transacao in [models.TipoTransacao.claim_lending, models.TipoTransacao.claim_staking]:
                portfolio[t.ativo_id]["quantidade"] += t.quantidade

    total_value = 0
    total_pl = 0

    for asset_data in portfolio.values():
        custo_total = asset_data["custo_total"]
        quantidade = asset_data["quantidade"]
        
        if quantidade > 0:
            asset_data["preco_medio"] = custo_total / quantidade if custo_total > 0 else 0
            asset_data["valor_total"] = quantidade * asset_data["preco_atual"]
            if custo_total > 0:
                asset_data["pl_nao_realizado"] = (asset_data["valor_total"] - custo_total) / custo_total * 100
            else:
                asset_data["pl_nao_realizado"] = 0 # Ou infinito, mas 0 é mais seguro
            
            total_value += asset_data["valor_total"]
            total_pl += asset_data["valor_total"] - custo_total

    # Filtra os ativos com quantidade > 0 antes de retornar
    assets_with_balance = [asset for asset in portfolio.values() if asset["quantidade"] > 0]

    return {
        "assets": assets_with_balance,
        "total_value": total_value,
        "total_pl": total_pl,
    }

@app.post("/portfolio/simulate_sale")
def simulate_sale(simulation: schemas.SaleSimulation, db: Session = Depends(get_db)):
    # Calcula o estado atual do portfólio para o ativo específico
    transacoes = crud.get_transacoes(db, limit=1000)
    
    custo_total = 0
    quantidade_total = 0
    for t in transacoes:
        if t.ativo_id == simulation.ativo_id:
            if t.tipo_transacao == models.TipoTransacao.compra:
                quantidade_total += t.quantidade
                custo_total += t.quantidade * t.preco_unitario
            elif t.tipo_transacao == models.TipoTransacao.venda:
                quantidade_total -= t.quantidade
            elif t.tipo_transacao in [models.TipoTransacao.claim_lending, models.TipoTransacao.claim_staking]:
                quantidade_total += t.quantidade

    if quantidade_total <= 0:
        raise HTTPException(status_code=404, detail="Ativo não encontrado ou sem saldo no portfólio")

    preco_medio = custo_total / quantidade_total if quantidade_total > 0 else 0
    
    if simulation.quantidade > quantidade_total:
        raise HTTPException(status_code=400, detail="Quantidade de venda simulada excede a quantidade em portfólio")

    lucro_prejuizo_realizado = (simulation.preco_venda - preco_medio) * simulation.quantidade
    
    # O preço médio do ativo restante não muda com a venda
    novo_preco_medio = preco_medio

    return {
        "lucro_prejuizo_realizado": lucro_prejuizo_realizado,
        "novo_preco_medio": novo_preco_medio,
        "quantidade_restante": quantidade_total - simulation.quantidade,
    }

@app.get("/portfolio/snapshots")
def get_portfolio_snapshots(db: Session = Depends(get_db), days: int = 0):
    query = db.query(models.PortfolioSnapshots)
    if days > 0:
        from datetime import datetime, timedelta
        start_date = datetime.now() - timedelta(days=days)
        query = query.filter(models.PortfolioSnapshots.data >= start_date)
    return query.order_by(models.PortfolioSnapshots.data).all()
