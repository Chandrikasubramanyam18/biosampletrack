<p align="center">
  <img src="assets/biosampletrack-logo-glass.svg" width="640" alt="BioSampleTrack" />
</p>

<h1 align="center">BioSampleTrack</h1>

<p align="center">
  <a href="https://github.com/Chandrikasubramanyam18/biosampletrack/actions/workflows/ci.yml"><img src="https://github.com/Chandrikasubramanyam18/biosampletrack/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue?logo=python&logoColor=white" alt="Python 3.11 | 3.12">
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Database-SQLite%20%2F%20SQLAlchemy-003B57?logo=sqlite&logoColor=white" alt="SQLite / SQLAlchemy">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License">
</p>

> **BioSampleTrack** is a biological specimen tracking and Next-Generation Sequencing (NGS) workflow management system designed for genomics laboratories, biotechnology research teams, and core facilities.

---

## Table of Contents

- [Overview & Problem Statement](#overview--problem-statement)
- [NGS Workflow State Machine](#ngs-workflow-state-machine)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Database Schema & Data Model](#database-schema--data-model)
- [REST API Reference](#rest-api-reference)
- [Frontend User Interface](#frontend-user-interface)
- [Validation & Error Handling](#validation--error-handling)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Continuous Integration (CI/CD)](#continuous-integration-cicd)
- [Installation & Local Setup](#installation--local-setup)
- [Future Roadmap](#future-roadmap)

---

## Overview & Problem Statement

In genomics and molecular biology laboratories, tracking biological specimens across complex multi-step sequencing pipelines is critical for research reproducibility, data integrity, and quality assurance. Samples pass through distinct laboratory phases—from initial tissue receipt and nucleic acid extraction to quality control, library preparation, high-throughput sequencing, and downstream computational analysis.

**BioSampleTrack** provides a unified, structured Laboratory Information Management System (LIMS) layer that:
- Maintains complete provenance and metadata for every biological specimen.
- Tracks transition through each phase of the Next-Generation Sequencing (NGS) pipeline.
- Prevents data entry errors and duplicate identifiers via schema validation.
- Aggregates real-time workflow statistics and bottleneck visibility for laboratory scientists.

---

## NGS Workflow State Machine

Every sample in BioSampleTrack progresses through a defined 7-stage workflow lifecycle:

```
┌─────────────────┐
│ 1. Received     │ ➔ Specimen intake, nucleic acid extraction (DNA / RNA)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. QC           │ ➔ Quality Control (concentration, RIN / DIN, Qubit, Bioanalyzer)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Library Prep │ ➔ Fragmentation, adapter ligation, indexing, size selection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Sequencing   │ ➔ Flowcell loading & high-throughput sequencing (Illumina / ONT)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Analysis     │ ➔ Primary/secondary bioinformatics pipelines (FASTQ, BAM, VCF)
└────────┬────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│ 6. Completed    │ ➔ QC & pipeline pass  │ 7. Failed       │ ➔ QC or run failure
└─────────────────┘                       └─────────────────┘
```

---

## System Architecture

BioSampleTrack follows a clean, decoupled client-server architecture with strict separation of concerns:

```
                                  ┌────────────────────────┐
                                  │   Laboratory Analyst   │
                                  │   Genomics Researcher  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │      React 18 + Vite Frontend Client     │
                        │ ──────────────────────────────────────── │
                        │  • Dashboard & Workflow Visualizations   │
                        │  • Sample Registry & Live Search         │
                        │  • Stage Filter & Server-side Pagination │
                        │  • Add / Edit / Delete Modals & Toasts   │
                        └─────────────────────┬────────────────────┘
                                              │ HTTP / JSON REST API
                                              │ (CORS Enabled)
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │          FastAPI Backend Service         │
                        │ ──────────────────────────────────────── │
                        │  • RESTful API Routing                   │
                        │  • Pydantic v2 Request/Response Schemas  │
                        │  • Input Validation & Error Normalization│
                        │  • CORS Middleware                       │
                        └─────────────────────┬────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │           SQLAlchemy 2.0 ORM             │
                        │ ──────────────────────────────────────── │
                        │  • Object-Relational Model Mapping       │
                        │  • Declarative Base Schema               │
                        │  • Session & Transaction Management      │
                        └─────────────────────┬────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │             SQLite Database              │
                        │ ──────────────────────────────────────── │
                        │  • Persistent Local Storage              │
                        │  • Indexed Sample Registry Table         │
                        └──────────────────────────────────────────┘
```

---

## Key Features

- **Real-time Dashboard**: Live sample volume, stage-by-stage counts, and interactive distribution visualizations powered by Recharts.
- **Sample Registry**: Comprehensive tabular view displaying Sample ID, nucleic acid type, organism, tissue source, experimental condition, and study name.
- **Metadata Search**: Instant, debounced (400ms) full-text search across Sample ID, organism, tissue, and condition.
- **Workflow Filtering**: Dropdown filtering to isolate samples at any stage (e.g. all samples currently in `QC` or `Sequencing`).
- **Server-Side Pagination**: Efficient `skip` and `limit` controls for scalability with large sample batches.
- **Sample Intake Modal**: Multi-field registration form with client-side field validation and backend schema enforcement.
- **Workflow Transition Modal**: Instant status updating from `Received` through `Completed` or `Failed`.
- **Safe Deletion Flow**: Destructive actions protected by interactive confirmation modals.
- **Pipeline Analytics**: Stage breakdown bar charts, proportion tables, status percentage pie charts, and coverage radar charts.
- **Robust Error & Loading States**: Skeleton shimmers, empty state illustrations, and normalized error toasts.

---

## Technology Stack

### Backend
| Technology | Role | Description |
|---|---|---|
| **Python 3.11+** | Runtime | Core programming language |
| **FastAPI** | Web Framework | High-performance asynchronous REST API framework |
| **SQLAlchemy 2.0** | ORM | Object-relational mapping and database abstraction |
| **SQLite** | Database | Embedded relational database with thread-safe connection pooling |
| **Pydantic v2** | Validation | Data modeling, typing, and validation |
| **Uvicorn** | ASGI Server | Production-ready ASGI web server |
| **pytest** | Test Framework | Test suite with in-memory database fixtures |
| **httpx** | HTTP Client | Integration test client for FastAPI |

### Frontend
| Technology | Role | Description |
|---|---|---|
| **React 18** | UI Library | Component-driven user interface |
| **Vite 6** | Build Tool | Next-generation frontend bundler with HMR |
| **React Router v6** | Client Routing | Declarative routing across application pages |
| **Recharts 2.15** | Data Visualization | Composable charting library (Bar, Pie, Radar charts) |
| **Lucide React** | Iconography | Lightweight, accessible SVG icon set |
| **CSS3 Custom Properties** | Styling | Bespoke biotech/scientific design tokens (no heavy UI framework dependencies) |

### DevOps & CI/CD
| Technology | Role | Description |
|---|---|---|
| **GitHub Actions** | CI Pipeline | Multi-matrix Python (3.11, 3.12) test suite and Node 20 build verification |
| **Git** | Version Control | Semantic commit history |

---

## Database Schema & Data Model

### SQLAlchemy Model (`backend/models.py`)

```python
class Sample(Base):
    __tablename__ = "samples"

    id          = Column(Integer, primary_key=True, index=True)
    sample_id   = Column(String, unique=True, index=True, nullable=False)
    sample_type = Column(String, nullable=False)   # e.g., RNA, DNA, Total RNA
    organism    = Column(String, nullable=False)   # e.g., Homo sapiens, Mus musculus
    tissue      = Column(String, nullable=False)   # e.g., Blood, Liver, Brain cortex
    condition   = Column(String, nullable=False)   # e.g., Control, Tumor, Treated
    experiment  = Column(String, nullable=False)   # e.g., RNA-seq Batch 4, WGS
    status      = Column(String, nullable=False)   # Workflow state
```

### Pydantic Validation Schemas (`backend/schemas.py`)

- **`SampleStatus`** (Enum): `Received`, `QC`, `Library Prep`, `Sequencing`, `Analysis`, `Completed`, `Failed`.
- **`SampleCreate`**: Validates string lengths, non-empty whitespace stripping, and valid workflow enums.
- **`SampleResponse`**: Serialized response schema with `ConfigDict(from_attributes=True)`.
- **`SampleStatusUpdate`**: Validates status transition payloads.

---

## REST API Reference

| Method | Endpoint | Description | Query / Body Parameters | Status Codes |
|---|---|---|---|---|
| `GET` | `/` | API Health & welcome status | None | `200` |
| `GET` | `/samples/statistics` | Aggregate total and per-status metrics | None | `200` |
| `GET` | `/samples` | Retrieve samples with filtering & search | `status`, `search`, `skip` (default 0), `limit` (default 20, max 100) | `200`, `400` |
| `GET` | `/samples/{sample_id}` | Retrieve single sample details | Path: `sample_id` (e.g. `BS-001`) | `200`, `404` |
| `POST` | `/samples` | Register a new biological specimen | JSON: `SampleCreate` | `200`, `400` (duplicate), `422` (validation) |
| `PUT` | `/samples/{sample_id}` | Update sample workflow status | Path: `sample_id`, JSON: `{"status": "QC"}` | `200`, `404`, `422` |
| `DELETE` | `/samples/{sample_id}` | Delete a sample record | Path: `sample_id` | `200`, `404` |

### Interactive API Documentation
When running the backend, interactive Swagger UI and ReDoc documentation are automatically generated:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Frontend User Interface

The frontend is structured into 5 dedicated views tailored for laboratory operations:

1. **Dashboard (`/dashboard`)**:
   - High-level KPI card showing Total Samples.
   - Status metric cards for each of the 7 stages with custom color cues.
   - Real-time Recharts bar chart showing workflow distribution.
2. **Sample Registry (`/samples`)**:
   - Full sample data table with status pill badges.
   - Live debounced search bar and status filter dropdown.
   - Server-side pagination controls.
   - Quick action buttons: **View** (details modal), **Edit** (status transition modal), **Delete** (confirmation modal).
   - "Add Sample" floating action modal.
3. **Workflow Overview (`/workflow`)**:
   - Visual stage-by-stage pipeline diagram (`Received` ➔ `QC` ➔ `Library Prep` ➔ `Sequencing` ➔ `Analysis` ➔ `Completed`).
   - Failed samples callout container.
   - Stage breakdown bar chart and status percentage pie chart.
4. **Statistics (`/statistics`)**:
   - Tabular summary of all stages with count, percentage, and animated proportional progress bars.
   - Radar chart illustrating laboratory stage capacity distribution.
5. **Settings & Info (`/settings`)**:
   - Active API endpoint configuration (`VITE_API_URL`).
   - Full technology stack index with component roles.
   - Direct external links to FastAPI Swagger and ReDoc documentation.

---

## Validation & Error Handling

- **Duplicate Prevention**: Attempting to register an existing `sample_id` returns HTTP `400 Bad Request` with a clear explanation message.
- **Input Sanitization**: Pydantic `@field_validator` strips leading/trailing whitespace and prevents empty string submissions (`422 Unprocessable Entity`).
- **Pagination Boundary Checks**: Negative `skip` or `limit` outside $[1, 100]$ returns HTTP `400`.
- **Not Found Guards**: Lookups, updates, or deletions of non-existent sample IDs return HTTP `404 Not Found`.
- **Frontend Error Normalization**: The API service layer (`src/services/api.js`) automatically parses Pydantic validation error arrays and displays friendly toast alerts without crashing the UI.

---

## Testing & Quality Assurance

The backend includes a comprehensive automated test suite in `tests/test_samples.py` using `pytest` and `fastapi.testclient.TestClient`.

### Isolation Fixture
Tests run against an **in-memory SQLite database** (`sqlite://` with `StaticPool`), ensuring complete isolation—running tests never modifies or pollutes development database records.

```python
@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```

### Test Coverage (21 Tests)

The suite contains **21 passing tests** covering CRUD operations, status filtering, search, pagination, input validation, workflow state transitions, and statistics aggregation.

```bash
======================= 21 passed in 0.74s =========================
```

---

## Continuous Integration (CI/CD)

The repository uses **GitHub Actions** (`.github/workflows/ci.yml`) to enforce code quality on every push and pull request to `main`:

```
GitHub Push / Pull Request
            │
            ├── Job 1: Backend Tests
            │    ├── Python 3.11 ➔ pip install ➔ pytest (21 tests)
            │    └── Python 3.12 ➔ pip install ➔ pytest (21 tests)
            │
            └── Job 2: Frontend Build Check
                 └── Node.js 20 ➔ npm ci ➔ npm run build (Vite 0-error build)
```

---

## Installation & Local Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

### 1. Clone the Repository
```bash
git clone https://github.com/Chandrikasubramanyam18/biosampletrack.git
cd biosampletrack
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate

# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
pytest -v

# Start the FastAPI server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000`.

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Set up environment variables
cp .env.example .env

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://127.0.0.1:5173`** in your web browser.

---

## Future Roadmap

- [ ] **Bulk CSV/TSV Sample Sheet Ingestion**: Ingest standard Illumina SampleSheet format with automated validation.
- [ ] **FASTQ / BAM Manifest Export**: Generate sample manifest files compatible with Nextflow (`nf-core/rnaseq`, `nf-core/sarek`) and Snakemake pipelines.
- [ ] **Sequencing QC Metrics**: Track Q30 score percentage, duplication rates, mean insert sizes, and RIN/DIN values.
- [ ] **NGS Run & Flowcell Association**: Link multiple samples to specific sequencing run IDs, flowcell barcodes, and lane assignments.
- [ ] **Audit Trail / Provenance Log**: Record timestamped stage transition histories and operator notes.
- [ ] **Dockerization**: Multi-stage `Dockerfile` and `docker-compose.yml` for unified single-command deployment.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

