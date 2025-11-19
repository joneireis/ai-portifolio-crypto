import sys
import os
from datetime import datetime

# Adiciona o diretório raiz do projeto ao path para encontrar os módulos da app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.crud import get_transacoes, get_ativos
from app.main import get_current_prices_bulk
from app.models import PortfolioSnapshots, TipoTransacao

def take_snapshot():
    """
    Calcula o valor total atual do portfólio e salva um snapshot no banco de dados.
    """
    db = SessionLocal()
    print("Conectado ao banco de dados...")
    try:
        transacoes = get_transacoes(db, limit=5000)
        ativos = get_ativos(db, limit=1000)
        print(f"Encontrados {len(ativos)} ativos e {len(transacoes)} transações.")

        # Otimização: Buscar todos os preços de uma vez
        all_api_ids = list(set([ativo.id_api_precos for ativo in ativos]))
        if not all_api_ids:
            print("Nenhum ativo para precificar. Saindo.")
            return
        
        print(f"Buscando preços para: {all_api_ids}...")
        current_prices = get_current_prices_bulk(all_api_ids)
        print("Preços recebidos.")

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
                preco_atual = current_prices.get(asset_data["id_api_precos"], 0.0)
                total_value += asset_data["quantidade"] * preco_atual

        print(f"Valor total do portfólio calculado: {total_value}")

        snapshot = PortfolioSnapshots(data=datetime.now(), valor_total=total_value)
        db.add(snapshot)
        db.commit()
        print("Snapshot salvo no banco de dados com sucesso!")
    
    except Exception as e:
        print(f"Ocorreu um erro ao gerar o snapshot: {e}")
    finally:
        db.close()
        print("Conexão com o banco de dados fechada.")

if __name__ == "__main__":
    print("Iniciando o script de snapshot do portfólio...")
    take_snapshot()