import sys
import os
from datetime import datetime

# Adiciona o diretório raiz do projeto ao path para encontrar os módulos da app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.crud import get_transacoes, get_ativos, create_snapshot_log
from app.main import get_current_prices_bulk
from app.models import PortfolioSnapshots, TipoTransacao
from app import schemas

def take_snapshot():
    """
    Calcula o valor total atual do portfólio e salva um snapshot no banco de dados,
    registrando o resultado em uma tabela de logs.
    """
    db = SessionLocal()
    log_message = "Iniciando o processo de snapshot."
    print(log_message)
    
    # Cria um log inicial
    log_entry = schemas.SnapshotLogCreate(
        timestamp=datetime.now(),
        status="RUNNING",
        message=log_message
    )
    
    try:
        transacoes = get_transacoes(db, limit=5000)
        ativos = get_ativos(db, limit=1000)
        
        all_api_ids = list(set([ativo.id_api_precos for ativo in ativos]))
        if not all_api_ids:
            message = "Nenhum ativo para precificar. Snapshot não gerado."
            print(message)
            log_entry.status = "SUCCESS"
            log_entry.message = message
            create_snapshot_log(db, log_entry)
            return

        current_prices_data = get_current_prices_bulk(all_api_ids)

        portfolio_quantities = {
            ativo.id: {
                "id_api_precos": ativo.id_api_precos,
                "quantidade": 0,
            } for ativo in ativos
        }

        for t in transacoes:
            if t.ativo_id in portfolio_quantities:
                if t.tipo_transacao == TipoTransacao.compra:
                    portfolio_quantities[t.ativo_id]["quantidade"] += t.quantidade
                elif t.tipo_transacao == TipoTransacao.venda:
                    portfolio_quantities[t.ativo_id]["quantidade"] -= t.quantidade
                elif t.tipo_transacao in [TipoTransacao.claim_lending, TipoTransacao.claim_staking]:
                    portfolio_quantities[t.ativo_id]["quantidade"] += t.quantidade
        
        total_value = 0
        for asset_data in portfolio_quantities.values():
            if asset_data["quantidade"] > 0:
                price_data = current_prices_data.get(asset_data["id_api_precos"], {"price": 0.0})
                total_value += asset_data["quantidade"] * price_data["price"]

        snapshot = PortfolioSnapshots(data=datetime.now(), valor_total=total_value)
        db.add(snapshot)
        db.commit()
        
        message = f"Snapshot salvo com sucesso! Valor total do portfólio: {total_value:.2f}"
        print(message)
        log_entry.status = "SUCCESS"
        log_entry.message = message
        create_snapshot_log(db, log_entry)

    except Exception as e:
        message = f"Ocorreu um erro ao gerar o snapshot: {e}"
        print(message)
        log_entry.status = "ERROR"
        log_entry.message = message
        create_snapshot_log(db, log_entry)
    finally:
        db.close()
        print("Conexão com o banco de dados fechada.")

if __name__ == "__main__":
    print("Iniciando o script de snapshot do portfólio...")
    take_snapshot()