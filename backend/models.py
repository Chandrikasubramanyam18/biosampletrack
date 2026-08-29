from sqlalchemy import Column, Integer, String

from backend.database import Base


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(String, unique=True, index=True, nullable=False)
    sample_type = Column(String, nullable=False)
    organism = Column(String, nullable=False)
    tissue = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    experiment = Column(String, nullable=False)
    status = Column(String, nullable=False)