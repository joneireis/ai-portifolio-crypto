from sqlalchemy.orm import Session
from . import models, schemas

def get_ativo(db: Session, ativo_id: int):
    return db.query(models.Ativos).filter(models.Ativos.id == ativo_id).first()

def get_ativos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ativos).offset(skip).limit(limit).all()

def create_ativo(db: Session, ativo: schemas.AtivoCreate):
    db_ativo = models.Ativos(**ativo.dict())
    db.add(db_ativo)
    db.commit()
    db.refresh(db_ativo)
    return db_ativo

def delete_ativo(db: Session, ativo_id: int):
    db_ativo = db.query(models.Ativos).filter(models.Ativos.id == ativo_id).first()
    if db_ativo:
        db.delete(db_ativo)
        db.commit()
        return db_ativo
    return None

def update_ativo(db: Session, ativo_id: int, ativo: schemas.AtivoCreate):
    db_ativo = db.query(models.Ativos).filter(models.Ativos.id == ativo_id).first()
    if db_ativo:
        update_data = ativo.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_ativo, key, value)
        db.commit()
        db.refresh(db_ativo)
        return db_ativo
    return None

def get_transacoes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transacoes).offset(skip).limit(limit).all()

def create_transacao(db: Session, transacao: schemas.TransacaoCreate):
    db_transacao = models.Transacoes(**transacao.dict())
    db.add(db_transacao)
    db.commit()
    db.refresh(db_transacao)
    return db_transacao

def delete_transacao(db: Session, transacao_id: int):
    db_transacao = db.query(models.Transacoes).filter(models.Transacoes.id == transacao_id).first()
    if db_transacao:
        db.delete(db_transacao)
        db.commit()
        return db_transacao
    return None

def create_snapshot_log(db: Session, log: schemas.SnapshotLogCreate):
    db_log = models.SnapshotLogs(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_snapshot_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SnapshotLogs).order_by(models.SnapshotLogs.timestamp.desc()).offset(skip).limit(limit).all()
