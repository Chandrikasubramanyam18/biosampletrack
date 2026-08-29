from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import Base, engine, get_db
from backend.models import Sample
from backend.schemas import (
    SampleCreate,
    SampleResponse,
    SampleStatus,
    SampleStatusUpdate,
)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="BioSampleTrack",
    description="Biological Sample and NGS Workflow Tracking System",
    version="0.1.0",
)


# --------------------------------------------------
# CORS
# Allow the React + Vite dev server (port 5173) to
# communicate with this API during local development.
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to BioSampleTrack",
        "status": "running",
    }


# --------------------------------------------------
# CREATE SAMPLE
# --------------------------------------------------

@app.post(
    "/samples",
    response_model=SampleResponse,
)
def create_sample(
    sample: SampleCreate,
    db: Session = Depends(get_db),
):
    existing_sample = (
        db.query(Sample)
        .filter(Sample.sample_id == sample.sample_id)
        .first()
    )

    if existing_sample:
        raise HTTPException(
            status_code=400,
            detail=f"Sample ID '{sample.sample_id}' already exists.",
        )

    db_sample = Sample(
        sample_id=sample.sample_id,
        sample_type=sample.sample_type,
        organism=sample.organism,
        tissue=sample.tissue,
        condition=sample.condition,
        experiment=sample.experiment,
        status=sample.status.value,
    )

    db.add(db_sample)
    db.commit()
    db.refresh(db_sample)

    return db_sample


# --------------------------------------------------
# SAMPLE STATISTICS
# NOTE: This route MUST remain above /samples/{sample_id}
# so that "statistics" is not treated as a sample ID.
# --------------------------------------------------

@app.get("/samples/statistics")
def get_sample_statistics(
    db: Session = Depends(get_db),
):
    total = db.query(Sample).count()

    statistics = {}

    for status in SampleStatus:
        count = (
            db.query(Sample)
            .filter(Sample.status == status.value)
            .count()
        )

        statistics[status.value] = count

    return {
        "total": total,
        "by_status": statistics,
    }


# --------------------------------------------------
# GET SINGLE SAMPLE BY SAMPLE_ID
# NOTE: Must remain below /samples/statistics so
# "statistics" is never matched as a sample_id.
# --------------------------------------------------

@app.get(
    "/samples/{sample_id}",
    response_model=SampleResponse,
)
def get_sample(
    sample_id: str,
    db: Session = Depends(get_db),
):
    sample = (
        db.query(Sample)
        .filter(Sample.sample_id == sample_id)
        .first()
    )

    if not sample:
        raise HTTPException(
            status_code=404,
            detail=f"Sample '{sample_id}' not found.",
        )

    return sample


# --------------------------------------------------
# GET ALL / FILTER SAMPLES
# --------------------------------------------------

@app.get(
    "/samples",
    response_model=list[SampleResponse],
)
def get_samples(
    status: SampleStatus | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    if skip < 0:
        raise HTTPException(
            status_code=400,
            detail="skip cannot be negative.",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="limit must be between 1 and 100.",
        )

    query = db.query(Sample)

    # Filter by status
    if status is not None:
        query = query.filter(
            Sample.status == status.value
        )

    # Search sample metadata
    if search:
        search_term = f"%{search}%"

        query = query.filter(
            (Sample.sample_id.ilike(search_term))
            | (Sample.organism.ilike(search_term))
            | (Sample.tissue.ilike(search_term))
            | (Sample.condition.ilike(search_term))
        )

    return (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )


# --------------------------------------------------
# UPDATE SAMPLE STATUS
# --------------------------------------------------

@app.put(
    "/samples/{sample_id}",
    response_model=SampleResponse,
)
def update_sample_status(
    sample_id: str,
    update: SampleStatusUpdate,
    db: Session = Depends(get_db),
):
    sample = (
        db.query(Sample)
        .filter(Sample.sample_id == sample_id)
        .first()
    )

    if not sample:
        raise HTTPException(
            status_code=404,
            detail=f"Sample '{sample_id}' not found.",
        )

    sample.status = update.status.value

    db.commit()
    db.refresh(sample)

    return sample


# --------------------------------------------------
# DELETE SAMPLE
# --------------------------------------------------

@app.delete("/samples/{sample_id}")
def delete_sample(
    sample_id: str,
    db: Session = Depends(get_db),
):
    sample = (
        db.query(Sample)
        .filter(Sample.sample_id == sample_id)
        .first()
    )

    if not sample:
        raise HTTPException(
            status_code=404,
            detail=f"Sample '{sample_id}' not found.",
        )

    db.delete(sample)
    db.commit()

    return {
        "message": f"Sample '{sample_id}' deleted successfully.",
    }