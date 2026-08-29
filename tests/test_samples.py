import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app


# ------------------------------------------------------------------
# Test Database Setup
# Use an in-memory SQLite database isolated per test session
# ------------------------------------------------------------------

SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(autouse=True)
def setup_database():
    """Create fresh database tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Provide a TestClient with database dependency overridden for isolation."""
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_payload():
    """Default valid sample creation payload."""
    return {
        "sample_id": "BS-001",
        "sample_type": "RNA",
        "organism": "Homo sapiens",
        "tissue": "Blood",
        "condition": "Cancer",
        "experiment": "RNA-seq",
        "status": "Received",
    }


# ------------------------------------------------------------------
# 1. Root & Health Check Tests
# ------------------------------------------------------------------

def test_root_endpoint(client):
    """Verify root endpoint returns welcome message and status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to BioSampleTrack"
    assert data["status"] == "running"


# ------------------------------------------------------------------
# 2. Sample Creation Tests (POST /samples)
# ------------------------------------------------------------------

def test_create_sample_success(client, sample_payload):
    """Test creating a valid sample returns 200 with saved attributes."""
    response = client.post("/samples", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sample_id"] == "BS-001"
    assert data["sample_type"] == "RNA"
    assert data["organism"] == "Homo sapiens"
    assert data["tissue"] == "Blood"
    assert data["condition"] == "Cancer"
    assert data["experiment"] == "RNA-seq"
    assert data["status"] == "Received"
    assert "id" in data


def test_create_sample_duplicate_id(client, sample_payload):
    """Test duplicate sample_id returns 400 Bad Request."""
    res1 = client.post("/samples", json=sample_payload)
    assert res1.status_code == 200

    res2 = client.post("/samples", json=sample_payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_create_sample_missing_fields(client):
    """Test missing required fields returns 422 Unprocessable Entity."""
    response = client.post("/samples", json={"sample_id": "BS-999"})
    assert response.status_code == 422


def test_create_sample_empty_string_validation(client, sample_payload):
    """Test whitespace-only string fields trigger custom validation error (422)."""
    sample_payload["sample_type"] = "   "
    response = client.post("/samples", json=sample_payload)
    assert response.status_code == 422


def test_create_sample_invalid_status(client, sample_payload):
    """Test invalid status value returns 422."""
    sample_payload["status"] = "UnknownStatus"
    response = client.post("/samples", json=sample_payload)
    assert response.status_code == 422


def test_create_sample_short_id(client, sample_payload):
    """Test sample_id under min_length (3 chars) returns 422."""
    sample_payload["sample_id"] = "B"
    response = client.post("/samples", json=sample_payload)
    assert response.status_code == 422


# ------------------------------------------------------------------
# 3. Single Sample Retrieval Tests (GET /samples/{sample_id})
# ------------------------------------------------------------------

def test_get_single_sample_success(client, sample_payload):
    """Test retrieving an existing sample by its sample_id."""
    client.post("/samples", json=sample_payload)
    response = client.get("/samples/BS-001")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_id"] == "BS-001"
    assert data["tissue"] == "Blood"


def test_get_single_sample_not_found(client):
    """Test retrieving a non-existent sample_id returns 404."""
    response = client.get("/samples/NON-EXISTENT-ID")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


# ------------------------------------------------------------------
# 4. Listing, Search & Filter Tests (GET /samples)
# ------------------------------------------------------------------

def test_get_samples_empty(client):
    """Test getting samples when database is empty returns empty list."""
    response = client.get("/samples")
    assert response.status_code == 200
    assert response.json() == []


def test_get_samples_status_filter(client, sample_payload):
    """Test filtering samples by workflow status."""
    # Create one Received and one QC sample
    client.post("/samples", json=sample_payload)
    qc_sample = {**sample_payload, "sample_id": "BS-002", "status": "QC"}
    client.post("/samples", json=qc_sample)

    res_qc = client.get("/samples?status=QC")
    assert res_qc.status_code == 200
    qc_data = res_qc.json()
    assert len(qc_data) == 1
    assert qc_data[0]["sample_id"] == "BS-002"
    assert qc_data[0]["status"] == "QC"

    res_rec = client.get("/samples?status=Received")
    assert res_rec.status_code == 200
    rec_data = res_rec.json()
    assert len(rec_data) == 1
    assert rec_data[0]["sample_id"] == "BS-001"


def test_get_samples_search(client, sample_payload):
    """Test metadata search across organism, tissue, condition, and sample_id."""
    s1 = {**sample_payload, "sample_id": "BS-001", "organism": "Homo sapiens", "tissue": "Blood"}
    s2 = {**sample_payload, "sample_id": "BS-002", "organism": "Mus musculus", "tissue": "Liver"}
    s3 = {**sample_payload, "sample_id": "BS-003", "organism": "Arabidopsis thaliana", "tissue": "Leaf"}
    client.post("/samples", json=s1)
    client.post("/samples", json=s2)
    client.post("/samples", json=s3)

    # Search by organism
    res = client.get("/samples?search=musculus")
    assert res.status_code == 200
    results = res.json()
    assert len(results) == 1
    assert results[0]["sample_id"] == "BS-002"

    # Search by tissue (case-insensitive)
    res_tissue = client.get("/samples?search=leaf")
    assert res_tissue.status_code == 200
    assert len(res_tissue.json()) == 1
    assert res_tissue.json()[0]["sample_id"] == "BS-003"


def test_get_samples_pagination(client, sample_payload):
    """Test skip and limit pagination parameters."""
    for i in range(1, 6):
        payload = {**sample_payload, "sample_id": f"BS-00{i}"}
        client.post("/samples", json=payload)

    # First page: limit 2
    res1 = client.get("/samples?skip=0&limit=2")
    assert res1.status_code == 200
    assert len(res1.json()) == 2
    assert res1.json()[0]["sample_id"] == "BS-001"
    assert res1.json()[1]["sample_id"] == "BS-002"

    # Second page: skip 2, limit 2
    res2 = client.get("/samples?skip=2&limit=2")
    assert res2.status_code == 200
    assert len(res2.json()) == 2
    assert res2.json()[0]["sample_id"] == "BS-003"
    assert res2.json()[1]["sample_id"] == "BS-004"


def test_get_samples_invalid_pagination(client):
    """Test negative skip or limit out of range returns 400."""
    res_skip = client.get("/samples?skip=-1")
    assert res_skip.status_code == 400

    res_limit_zero = client.get("/samples?limit=0")
    assert res_limit_zero.status_code == 400

    res_limit_large = client.get("/samples?limit=101")
    assert res_limit_large.status_code == 400


# --------------------------------------------------
# 5. Update Sample Status Tests (PUT /samples/{sample_id})
# --------------------------------------------------

def test_update_sample_status_success(client, sample_payload):
    """Test updating a sample status from Received to Sequencing."""
    client.post("/samples", json=sample_payload)

    response = client.put("/samples/BS-001", json={"status": "Sequencing"})
    assert response.status_code == 200
    data = response.json()
    assert data["sample_id"] == "BS-001"
    assert data["status"] == "Sequencing"

    # Verify update persisted
    get_res = client.get("/samples/BS-001")
    assert get_res.json()["status"] == "Sequencing"


def test_update_sample_status_not_found(client):
    """Test updating non-existent sample returns 404."""
    response = client.put("/samples/NON-EXISTENT", json={"status": "QC"})
    assert response.status_code == 404


def test_update_sample_status_invalid_enum(client, sample_payload):
    """Test updating with invalid status returns 422."""
    client.post("/samples", json=sample_payload)
    response = client.put("/samples/BS-001", json={"status": "InvalidStage"})
    assert response.status_code == 422


# --------------------------------------------------
# 6. Delete Sample Tests (DELETE /samples/{sample_id})
# --------------------------------------------------

def test_delete_sample_success(client, sample_payload):
    """Test deleting an existing sample returns 200 and removes it."""
    client.post("/samples", json=sample_payload)

    del_res = client.delete("/samples/BS-001")
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]

    # Verify lookup now returns 404
    get_res = client.get("/samples/BS-001")
    assert get_res.status_code == 404


def test_delete_sample_not_found(client):
    """Test deleting non-existent sample returns 404."""
    response = client.delete("/samples/NON-EXISTENT")
    assert response.status_code == 404


# --------------------------------------------------
# 7. Statistics Endpoint Tests (GET /samples/statistics)
# --------------------------------------------------

def test_statistics_empty_database(client):
    """Test statistics on an empty database returns total 0 and all status counts 0."""
    response = client.get("/samples/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["by_status"] == {
        "Received": 0,
        "QC": 0,
        "Library Prep": 0,
        "Sequencing": 0,
        "Analysis": 0,
        "Completed": 0,
        "Failed": 0,
    }


def test_statistics_with_samples(client, sample_payload):
    """Test statistics accurately aggregates sample status counts."""
    # Create 2 Received, 1 Sequencing, 1 Completed
    client.post("/samples", json={**sample_payload, "sample_id": "BS-001", "status": "Received"})
    client.post("/samples", json={**sample_payload, "sample_id": "BS-002", "status": "Received"})
    client.post("/samples", json={**sample_payload, "sample_id": "BS-003", "status": "Sequencing"})
    client.post("/samples", json={**sample_payload, "sample_id": "BS-004", "status": "Completed"})

    response = client.get("/samples/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 4
    assert data["by_status"]["Received"] == 2
    assert data["by_status"]["Sequencing"] == 1
    assert data["by_status"]["Completed"] == 1
    assert data["by_status"]["QC"] == 0
    assert data["by_status"]["Library Prep"] == 0
    assert data["by_status"]["Analysis"] == 0
    assert data["by_status"]["Failed"] == 0

