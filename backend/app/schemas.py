from pydantic import BaseModel
from datetime import datetime
from .models import TipoTransacao

class AtivoBase(BaseModel):
    nome: str
    simbolo: str
    id_api_precos: str

class AtivoCreate(AtivoBase):
    pass

class Ativo(AtivoBase):
    id: int

    class Config:
        from_attributes = True

class TransacaoBase(BaseModel):
    ativo_id: int
    tipo_transacao: TipoTransacao
    quantidade: float
    preco_unitario: float
    data_transacao: datetime
    taxas_pagas: float

class TransacaoCreate(TransacaoBase):
    pass

class Transacao(TransacaoBase):
    id: int

    class Config:
        from_attributes = True

class SnapshotLogBase(BaseModel):
    timestamp: datetime
    status: str
    message: str

class SnapshotLogCreate(SnapshotLogBase):
    pass

class SnapshotLog(SnapshotLogBase):
    id: int

    class Config:
        from_attributes = True
