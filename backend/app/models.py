from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import enum

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TipoTransacao(str, enum.Enum):
    compra = "compra"
    venda = "venda"
    claim_lending = "claim_lending"
    claim_staking = "claim_staking"

class Ativos(Base):
    __tablename__ = "ativos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    simbolo = Column(String, unique=True, index=True)
    id_api_precos = Column(String, unique=True, index=True)

class Transacoes(Base):
    __tablename__ = "transacoes"

    id = Column(Integer, primary_key=True, index=True)
    ativo_id = Column(Integer, index=True)
    tipo_transacao = Column(Enum(TipoTransacao))
    quantidade = Column(Float)
    preco_unitario = Column(Float)
    data_transacao = Column(DateTime)
    taxas_pagas = Column(Float)

class PortfolioSnapshots(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(DateTime, index=True)
    valor_total = Column(Float)

class SnapshotLogs(Base):
    __tablename__ = "snapshot_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    status = Column(String)
    message = Column(String)

Base.metadata.create_all(bind=engine)
