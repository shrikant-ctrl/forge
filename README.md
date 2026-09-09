# Forge — Enterprise Internal File Hub

[![Architecture](https://img.shields.io/badge/Architecture-Monorepo%20(Turborepo%20%2B%20pnpm)-blue.svg)](#architecture)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](#backend)
[![Frontend](https://img.shields.io/badge/Frontend-TanStack%20React%20%7C%20Vite-61DAFB.svg)](#frontend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg)](#infrastructure)
[![Storage](https://img.shields.io/badge/Storage-MinIO%20(S3%20Compatible)-C72C48.svg)](#infrastructure)

**Forge** is an enterprise-grade, high-performance internal file hub (a "Mini Google Drive") engineered with a modern, scalable monorepo architecture. It delivers secure blob storage, hierarchical folder management, granular role-based access control (RBAC), and background processing.

For comprehensive product specifications and screen workflows, consult:
- [Software Requirements Specification (SRS)](./docs/SRS_Internal_File_Hub.md)
- [Frontend Screen Specifications](./docs/FE_screens.md)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack & Services](#tech-stack--services)
3. [Prerequisites](#prerequisites)
4. [End-to-End Setup & Installation](#end-to-end-setup--installation)
   - [Step 1: Clone Repository](#step-1-clone-repository)
   - [Step 2: Core Tooling Setup](#step-2-core-tooling-setup)
   - [Step 3: Environment Variables](#step-3-environment-variables)
   - [Step 4: Install Dependencies](#step-4-install-dependencies)
   - [Step 5: Spin Up Infrastructure (Docker)](#step-5-spin-up-infrastructure-docker)
   - [Step 6: Database Migrations (Alembic)](#step-6-database-migrations-alembic)
   - [Step 7: Launch Development Servers](#step-7-launch-development-servers)
5. [Endpoints & Verification](#endpoints--verification)
6. [Monorepo Scripts & Cheatsheet](#monorepo-scripts--cheatsheet)
7. [Repository Structure](#repository-structure)
8. [Troubleshooting & FAQ](#troubleshooting--faq)
9. [Engineering Guidelines](#engineering-guidelines)

---

## Architecture Overview

```
                        ┌───────────────────────────────┐
                        │      Client Browser (SPA)     │
                        │   React 19 + TanStack Router  │
                        └───────────────┬───────────────┘
                                        │ HTTP / JSON
                                        ▼
                        ┌───────────────────────────────┐
                        │     FastAPI Gateway (API)     │
                        │    Python 3.14+ (Async I/O)   │
                        └───┬───────────┬───────────┬───┘
                            │           │           │
     SQLAlchemy / asyncpg   │           │ Redis     │ Presigned URLs / Boto3
                            ▼           ▼           ▼
                   ┌────────────┐ ┌───────────┐ ┌─────────────┐
                   │ PostgreSQL │ │   Redis   │ │    MinIO    │
                   │  Metadata  │ │ Cache /   │ │ S3 Storage  │
                   │   & RBAC   │ │  Queues   │ │    Blobs    │
                   └────────────┘ └───────────┘ └─────────────┘
```

The system separates metadata concerns from binary storage:
- **Relational Integrity**: File hierarchies, permissions, audit logs, and user sessions are persisted in PostgreSQL.
- **Direct & Secure Blob Delivery**: Files are stored in S3/MinIO. Downloads and uploads leverage short-lived signed URLs to prevent API bottlenecking.
- **Micro-tasks & Caching**: Redis coordinates background tasks (thumbnail generation, metadata extraction) and distributed rate limiting.

---

## Tech Stack & Services

| Layer | Technology | Version / Stack | Port |
| :--- | :--- | :--- | :--- |
| **Monorepo Engine** | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) | Turbo 2.x, pnpm 10.x | N/A |
| **Frontend** | React 19, [TanStack Router](https://tanstack.com/router), [TanStack Query](https://tanstack.com/query), TailwindCSS v4 | Vite 8, Biome | `3000` |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), Pydantic v2, SQLAlchemy 2 (async), Alembic | Python 3.14+, uv | `8000` |
| **Database** | PostgreSQL | 16-alpine (Docker) | `5432` |
| **Cache / Queue** | Redis | 7-alpine (Docker) | `6379` |
| **Object Storage** | MinIO (S3-compatible) | Latest (Docker) | `9000` (API), `9001` (Console) |

---

## Prerequisites

Ensure the following tools are installed on your host system:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v10.x` (Recommended via Corepack or standalone install)
- **Python**: `3.14+`
- **[uv](https://github.com/astral-sh/uv)**: Astral's high-performance Python package and virtualenv manager
- **Docker & Docker Compose**: Docker Engine `24.x+` with Compose V2

---

## End-to-End Setup & Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/forge.git
cd forge
```

---

### Step 2: Core Tooling Setup

1. **Enable pnpm via Corepack** (Node.js bundled):
   ```bash
   corepack enable
   corepack prepare pnpm@10.32.1 --activate
   ```
   *If using a local path or non-root environment:*
   ```bash
   corepack enable --install-directory ~/.local/bin
   export PATH="$HOME/.local/bin:$PATH"
   ```

2. **Verify `uv` installation**:
   If you do not have `uv` installed:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
   *Optional:* Ensure Python 3.14 is available:
   ```bash
   uv python install 3.14
   ```

---

### Step 3: Environment Variables

Forge includes a pre-configured `.env.example`. Create your local environment file:

```bash
cp .env.example .env
```

Review and customize values in `.env` if needed:

```ini
# Backend Database & Cache
DATABASE_URL=postgresql+asyncpg://admin:password@localhost:5432/file_hub
REDIS_URL=redis://localhost:6379/0

# JWT & Authentication Security
SECRET_KEY=supersecretkey_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# S3 / MinIO Object Storage
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password123
AWS_REGION=us-east-1
S3_ENDPOINT_URL=http://localhost:9000
S3_BUCKET_NAME=filehub-bucket
```

---

### Step 4: Install Dependencies

Install all root, web, and workspace JavaScript/TypeScript dependencies:

```bash
pnpm install
```

Initialize the Python backend virtual environment and lockfile:

```bash
cd apps/api
uv sync
cd ../..
```

---

### Step 5: Spin Up Infrastructure (Docker)

Start the backing PostgreSQL database, Redis instance, and MinIO storage engine in detached mode:

```bash
docker compose up -d
```

Verify that all three containers are healthy and running:

```bash
docker compose ps
```

Expected output:
```text
NAME              IMAGE              COMMAND                  SERVICE   STATUS    PORTS
file_hub_db       postgres:16-alpine "docker-entrypoint.s…"   db        running   0.0.0.0:5432->5432/tcp
file_hub_minio    minio/minio:latest "/usr/bin/docker-ent…"   minio     running   0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
file_hub_redis    redis:7-alpine     "docker-entrypoint.s…"   redis     running   0.0.0.0:6379->6379/tcp
```

#### MinIO Bucket Setup
1. Navigate to the MinIO Web Console at [http://localhost:9001](http://localhost:9001).
2. Log in with:
   - **Username**: `admin`
   - **Password**: `password123`
3. Under **Administrator** > **Buckets**, click **Create Bucket** and name it: `filehub-bucket`.

---

### Step 6: Database Migrations (Alembic)

Run database migrations to ensure the relational schema matches the application models:

```bash
cd apps/api
uv run alembic upgrade head
cd ../..
```

> **Note**: To autogenerate a new migration after updating SQLAlchemy models:
> ```bash
> cd apps/api
> uv run alembic revision --autogenerate -m "create_file_and_folder_models"
> uv run alembic upgrade head
> cd ../..
> ```

---

### Step 7: Launch Development Servers

#### Option A: Run Full Stack Concurrently (Recommended)
From the root directory, launch Turborepo to run the FastAPI backend and TanStack frontend simultaneously:

```bash
pnpm run dev
```

Turborepo will stream hot-reloaded logs from both `apps/api` and `apps/web`.

#### Option B: Run Services Individually

- **FastAPI Backend only**:
  ```bash
  pnpm --filter api dev
  # or directly:
  cd apps/api && uv run fastapi dev app/main.py
  ```

- **React Web Frontend only**:
  ```bash
  pnpm --filter web dev
  # or directly:
  cd apps/web && pnpm dev
  ```

---

## Endpoints & Verification

Once the stack is running, verify each endpoint:

| Service | URL | Notes / Credentials |
| :--- | :--- | :--- |
| **Web Application** | [http://localhost:3000](http://localhost:3000) | Main React SPA Dashboard & Explorer |
| **FastAPI Backend** | [http://localhost:8000](http://localhost:8000) | Root API endpoint |
| **API Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Verifies API liveness (`{"status":"ok"}`) |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for testing API endpoints |
| **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc schema documentation |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | User: `admin` \| Pass: `password123` |
| **MinIO S3 API** | [http://localhost:9000](http://localhost:9000) | Direct S3 endpoint |
| **PostgreSQL Database** | `localhost:5432` | DB: `file_hub` \| User: `admin` \| Pass: `password` |
| **Redis Cache** | `localhost:6379` | Default DB `0` |

### Quick Smoke Test

```bash
curl http://localhost:8000/health
# Response: {"status":"ok"}
```

---

## Monorepo Scripts & Cheatsheet

### Root Turborepo Commands

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Runs both backend and frontend development servers concurrently with hot-reloading |
| `pnpm run build` | Builds production artifacts for all packages |
| `pnpm run lint` | Runs linters across packages (`ruff check .` on backend, `biome lint` on frontend) |
| `pnpm run format` | Auto-formats code across packages (`ruff format .` on backend, `biome format` on frontend) |
| `pnpm run typecheck` | Validates TypeScript types in the frontend (`tsc --noEmit`) |
| `pnpm run test` | Executes unit and integration test suites |
| `pnpm run clean` | Cleans build outputs, temporary directories, and Turbo caches |

### Workspace-Specific Commands

```bash
# Frontend specific (apps/web)
pnpm --filter web generate-routes  # Generates TanStack file-based routes
pnpm --filter web check            # Runs Biome formatting and lint verification
pnpm --filter web build            # Production Vite bundle

# Backend specific (apps/api)
cd apps/api
uv run ruff check . --fix          # Auto-fix Python linting issues
uv run ruff format .               # Format Python files
uv run pytest                      # Run backend tests
```

### Docker Infrastructure Management

```bash
# Stop all infrastructure containers
docker compose stop

# Restart infrastructure containers
docker compose restart

# Tear down infrastructure (preserves volume data)
docker compose down

# Tear down infrastructure AND remove data volumes (clean reset)
docker compose down -v
```

---

## Repository Structure

```text
forge/
├── .agents/                    # Architecture rules & agent customizations
│   └── rules/
│       └── architecture.md     # Engineering standards & constraints
├── apps/
│   ├── api/                    # FastAPI Backend Application
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   └── config.py   # Pydantic Settings & environment validation
│   │   │   └── main.py         # FastAPI application entrypoint & routing
│   │   ├── migrations/         # Alembic database migrations
│   │   │   └── env.py          # Async migration harness
│   │   ├── alembic.ini         # Alembic configuration
│   │   ├── package.json        # Workspace scripts for Turbo
│   │   ├── pyproject.toml      # Python dependencies (uv/pip)
│   │   └── uv.lock             # Deterministic Python dependency lock
│   │
│   └── web/                    # TanStack React Frontend Application
│       ├── src/
│       │   ├── components/     # UI design system & shared components
│       │   ├── hooks/          # Custom React & data fetching hooks
│       │   ├── routes/         # File-based TanStack routes
│       │   │   ├── __root.tsx  # Root layout & providers
│       │   │   └── index.tsx   # File Hub Explorer & Dashboard
│       │   ├── router.tsx      # TanStack Router instance
│       │   └── styles.css      # Design tokens & Tailwind styles
│       ├── biome.json          # Biome linting and formatting configuration
│       ├── package.json        # Web workspace scripts & dependencies
│       ├── tsconfig.json       # Strict TypeScript configuration
│       └── vite.config.ts      # Vite configuration
│
├── docs/                       # Project Documentation & Specifications
│   ├── FE_screens.md           # UI Screen workflows & interaction states
│   └── SRS_Internal_File_Hub.md# Software Requirements Specification
│
├── docker-compose.yml          # PostgreSQL, Redis, and MinIO definitions
├── package.json                # Monorepo root configuration
├── pnpm-lock.yaml              # Root dependency lockfile
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── turbo.json                  # Turborepo task pipeline configuration
├── .env.example                # Example environment variables
└── README.md                   # This file
```

---

## Troubleshooting & FAQ

### 1. `pnpm: command not found` or `cannot find binary path`
Ensure Corepack has placed `pnpm` in your system `PATH`:
```bash
corepack enable --install-directory ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
```
Or install `pnpm` globally via npm:
```bash
npm install -g pnpm@10.32.1
```

### 2. Port Collisions
Ensure ports `3000`, `8000`, `5432`, `6379`, `9000`, and `9001` are not in use by existing background services:
```bash
# Inspect port binding (Linux/macOS)
lsof -i :5432 -i :8000 -i :3000 -i :9000
```
If a port is already taken, update the respective mapping in `docker-compose.yml` or port parameter in `package.json`.

### 3. MinIO Bucket Missing / S3 Connection Refused
If the backend throws an `EndpointConnectionError` or `NoSuchBucket` error:
1. Confirm MinIO is running: `docker compose ps minio`
2. Ensure you have created the bucket `filehub-bucket` via the MinIO console at `http://localhost:9001` or via `mc`:
   ```bash
   docker exec -it file_hub_minio mc alias set local http://localhost:9000 admin password123
   docker exec -it file_hub_minio mc mb local/filehub-bucket
   ```

### 4. Database Connection Refused (`connection to server at "localhost", port 5432 failed`)
Verify PostgreSQL is healthy:
```bash
docker compose logs db
```
Wait 5–10 seconds after running `docker compose up -d` for PostgreSQL to finish its initialization routine before running migrations.

### 5. Resetting Database to Clean State
To wipe out all local data volumes and start fresh:
```bash
docker compose down -v
docker compose up -d
cd apps/api && uv run alembic upgrade head && cd ../..
```

---

## Engineering Guidelines

Adhere to the standards codified in [architecture.md](.agents/rules/architecture.md):

1. **Strict Type Safety**:
   - Backend: All schemas must use Pydantic models. Ensure complete type annotations for all functions.
   - Frontend: Strict TypeScript (`noEmit`, Zod runtime validation where relevant).
2. **Security & Data Access**:
   - Never expose raw disk file paths.
   - Upload and download requests must utilize secure, short-lived signed S3 URLs.
   - API endpoints require role-based access control (RBAC) validation.
3. **Database Integrity**:
   - Prefer database foreign key constraints and transactional boundaries for folder operations.
   - Use soft deletion for file recovery.
