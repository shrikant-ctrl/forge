# Forge — Enterprise Internal File Hub

[![Architecture](https://img.shields.io/badge/Architecture-Monorepo%20(Turborepo%20%2B%20pnpm)-blue.svg)](#architecture)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](#backend)
[![ORM](https://img.shields.io/badge/ORM-Prisma%20for%20Python-2D3748.svg)](#database--schema-management)
[![Frontend](https://img.shields.io/badge/Frontend-TanStack%20React%20%7C%20Vite-61DAFB.svg)](#frontend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg)](#infrastructure)
[![Storage](https://img.shields.io/badge/Storage-MinIO%20(S3%20Compatible)-C72C48.svg)](#infrastructure)

**Forge** is an enterprise-grade, high-performance internal file hub (a "Mini Google Drive") engineered with a modern, scalable monorepo architecture. It delivers secure blob storage, hierarchical folder management, granular role-based access control (RBAC), and zero-hassle schema synchronization powered by **Prisma for Python**.

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
   - [Step 6: Database Schema Synchronization (Prisma)](#step-6-database-schema-synchronization-prisma)
   - [Step 7: Launch Development Servers](#step-7-launch-development-servers)
5. [Endpoints & Verification](#endpoints--verification)
6. [Monorepo Scripts & Cheatsheet](#monorepo-scripts--cheatsheet)
7. [Database & Schema Management (Prisma)](#database--schema-management)
8. [Repository Structure](#repository-structure)
9. [Troubleshooting & FAQ](#troubleshooting--faq)
10. [Engineering Guidelines](#engineering-guidelines)

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
           Prisma Client    │           │ Redis     │ Presigned URLs / Boto3
                            ▼           ▼           ▼
                   ┌────────────┐ ┌───────────┐ ┌─────────────┐
                   │ PostgreSQL │ │   Redis   │ │    MinIO    │
                   │  Metadata  │ │ Cache /   │ │ S3 Storage  │
                   │   & RBAC   │ │  Queues   │ │    Blobs    │
                   └────────────┘ └───────────┘ └─────────────┘
```

The system separates metadata concerns from binary storage:
- **Relational Integrity via Prisma**: Schema models, folder hierarchies, permissions, audit logs, and user sessions are declared in `apps/api/prisma/schema.prisma` and queried via the auto-generated, type-safe async Prisma Python client.
- **Direct & Secure Blob Delivery**: Files are stored in S3/MinIO. Downloads and uploads leverage short-lived signed URLs to eliminate API proxy bottlenecking.
- **Background Tasks & Caching**: Redis coordinates asynchronous operations (thumbnail generation, metadata extraction) and distributed rate limiting.

---

## Tech Stack & Services

| Layer | Technology | Version / Stack | Port |
| :--- | :--- | :--- | :--- |
| **Monorepo Engine** | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) | Turbo 2.x, pnpm 10.x | N/A |
| **Frontend** | React 19, [TanStack Router](https://tanstack.com/router), [TanStack Query](https://tanstack.com/query), TailwindCSS v4 | Vite 8, Biome | `3000` |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), Pydantic v2, Uvicorn | Python 3.14+, uv | `8000` |
| **ORM & Schema** | [Prisma for Python](https://prisma-client-py.readthedocs.io/) (`prisma-client-py`) | 0.15.x | N/A |
| **Database** | PostgreSQL | 16-alpine | `5432` |
| **Cache / Queue** | Redis | 7-alpine | `6379` |
| **Object Storage** | MinIO (S3-compatible) | Latest | `9000` (API), `9001` (Console) |

---

## Prerequisites

Ensure the following tools are installed on your host system:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v10.x` (Recommended via Corepack or standalone install)
- **Python**: `3.14+`
- **[uv](https://github.com/astral-sh/uv)**: Astral's high-performance Python package and virtualenv manager
- **Docker & Docker Compose**: Engine `24.x+` with Compose V2 (or native PostgreSQL/Redis/MinIO services)

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

Review values in `.env`:

```ini
# Backend Database & Cache (Standard PostgreSQL URL for Prisma)
DATABASE_URL=postgresql://admin:password@localhost:5432/file_hub
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

Initialize the Python backend virtual environment and install all packages:

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

Verify that containers are running:

```bash
docker compose ps
```

> **Note**: If your machine already runs PostgreSQL, Redis, or MinIO natively on standard ports (`5432`, `6379`, `9000`, `9001`), Docker is not required; the app will connect directly to the active host services.

#### MinIO Bucket Setup
1. Open the MinIO Web Console at [http://localhost:9001](http://localhost:9001).
2. Log in with:
   - **Username**: `admin`
   - **Password**: `password123`
3. Under **Administrator** > **Buckets**, click **Create Bucket** and name it: `filehub-bucket`.

---

### Step 6: Database Schema Synchronization (Prisma)

Forge uses **Prisma for Python** for zero-hassle database synchronization. You do **not** need to manually generate or run migration scripts.

From the repository root, run:

```bash
pnpm db:push
```

This command:
1. Compares `apps/api/prisma/schema.prisma` with your PostgreSQL database.
2. **Automatically creates new tables, alters existing columns, and drops removed fields**.
3. Generates the strictly typed async Python client into `apps/api/.venv`.

---

### Step 7: Launch Development Servers

#### Option A: Run Full Stack Concurrently (Recommended)
From the root directory, launch Turborepo to run the FastAPI backend and TanStack frontend simultaneously:

```bash
pnpm run dev
```

> **Zero-Touch Schema Sync**: The `pnpm run dev` task automatically runs `prisma db push` on boot. Every time you start the app, your database schema is guaranteed to match your Prisma definitions!

#### Option B: Run Services Individually

- **FastAPI Backend only**:
  ```bash
  pnpm --filter api dev
  # or directly:
  cd apps/api && uv run prisma db push && uv run fastapi dev app/main.py
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
| **API Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Verifies API & DB connection (`{"status":"ok","database":"connected"}`) |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for interactive testing |
| **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc schema documentation |
| **Prisma Studio (GUI)** | [http://localhost:5555](http://localhost:5555) | Visual database browser (`pnpm db:studio`) |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | User: `admin` \| Pass: `password123` |
| **MinIO S3 API** | [http://localhost:9000](http://localhost:9000) | Direct S3 endpoint |
| **PostgreSQL Database** | `localhost:5432` | DB: `file_hub` \| User: `admin` \| Pass: `password` |
| **Redis Cache** | `localhost:6379` | Default DB `0` |

### Quick Smoke Test

```bash
curl http://localhost:8000/health
# Response: {"status":"ok","database":"connected"}
```

---

## Monorepo Scripts & Cheatsheet

### Root Monorepo Commands

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Runs `prisma db push` and starts backend and frontend development servers concurrently |
| `pnpm run build` | Builds production artifacts for all packages |
| `pnpm run lint` | Runs linters across packages (`ruff check .` on backend, `biome lint` on frontend) |
| `pnpm run format` | Auto-formats code across packages (`ruff format .` on backend, `biome format` on frontend) |
| `pnpm run typecheck` | Validates TypeScript types in the frontend (`tsc --noEmit`) |
| `pnpm run test` | Executes unit and integration test suites |
| `pnpm run clean` | Cleans build outputs, temporary directories, and Turbo caches |

### Database Commands (Prisma)

| Command | Action |
| :--- | :--- |
| `pnpm db:push` | Syncs `schema.prisma` directly with PostgreSQL and regenerates the Python client |
| `pnpm db:studio` | Launches Prisma Studio GUI on `http://localhost:5555` to browse and edit records |
| `pnpm db:generate` | Manually regenerates the Python client types from `schema.prisma` |

---

## Database & Schema Management (Prisma)

### Modifying Schema (TypeORM-Style Workflow)
All database models live in **`apps/api/prisma/schema.prisma`**.

When you need to add, alter, or remove fields:
1. Edit `apps/api/prisma/schema.prisma`:
   ```prisma
   model File {
     id          String   @id @default(uuid())
     name        String
     sizeBytes   BigInt   @map("size_bytes")
     mimeType    String   @map("mime_type")
     storageKey  String   @unique @map("storage_key")
     // Add new fields directly here:
     isFavorite  Boolean  @default(false) @map("is_favorite")
     ...
   }
   ```
2. Run `pnpm db:push` (or simply run `pnpm dev`).
3. PostgreSQL is updated immediately and Python client types are re-generated. **No migration files, no Alembic hassle.**

### Using the Prisma Client in FastAPI
Use the `db` client singleton in `app/core/db.py`:

```python
from fastapi import APIRouter, Depends
from prisma import Prisma
from app.core.db import get_db

router = APIRouter()

@router.get("/files")
async def list_files(db: Prisma = Depends(get_db)):
    files = await db.file.find_many(
        where={"isDeleted": False},
        include={"owner": True, "versions": True}
    )
    return files
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
│   │   │   │   ├── config.py   # Pydantic Settings & environment validation
│   │   │   │   └── db.py       # Prisma client singleton & FastAPI get_db dependency
│   │   │   └── main.py         # FastAPI application entrypoint with Prisma lifespan
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Declarative database models (User, Folder, File, etc.)
│   │   ├── package.json        # Workspace scripts (db:push, db:studio, dev)
│   │   ├── pyproject.toml      # Python dependencies (FastAPI, Prisma, Uvicorn)
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
├── package.json                # Monorepo root configuration & db:* scripts
├── pnpm-lock.yaml              # Root dependency lockfile
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── turbo.json                  # Turborepo task pipeline configuration
├── .env.example                # Example environment variables
└── README.md                   # This file
```

---

## Troubleshooting & FAQ

### 1. `DATABASE_URL` Format
Prisma expects standard PostgreSQL connection URIs:
```text
postgresql://admin:password@localhost:5432/file_hub
```
Do **not** include Python driver prefixes like `postgresql+asyncpg://` or `postgresql+psycopg2://`.

### 2. `Environment variable not found: DATABASE_URL`
Ensure `.env` exists in the root directory. `apps/api/.env` is symlinked to the root `.env` to ensure both Prisma CLI and Python scripts read identical configurations.
```bash
cp .env.example .env
ln -sf ../../.env apps/api/.env
```

### 3. `pnpm: command not found`
Ensure Corepack has linked `pnpm` to your system `PATH`:
```bash
corepack enable --install-directory ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
```

### 4. Port Collisions
Ensure ports `3000`, `8000`, `5432`, `6379`, `9000`, and `9001` are available. If PostgreSQL, Redis, or MinIO are already running natively on your machine, Docker Compose is not required.

### 5. Inspecting Database Records Visually
Run Prisma Studio from the root of the repository:
```bash
pnpm db:studio
```
Open [http://localhost:5555](http://localhost:5555) in your browser to view, search, and edit records visually.

---

## Engineering Guidelines

Adhere to the standards codified in [architecture.md](.agents/rules/architecture.md):

1. **Strict Type Safety**:
   - Backend: All queries leverage auto-generated, type-safe Prisma client types. Validate request and response payloads with Pydantic.
   - Frontend: Strict TypeScript (`tsc --noEmit`, Zod runtime validation).
2. **Security & Data Access**:
   - Never expose raw disk file paths.
   - File uploads and downloads must utilize secure, short-lived signed S3/MinIO URLs.
   - API endpoints enforce Role-Based Access Control (RBAC) via the `Role` enum in `schema.prisma`.
3. **Database Integrity**:
   - Relational cascading rules (`onDelete: Cascade`) are defined at the database layer in `schema.prisma`.
   - Soft-deletion (`isDeleted`, `deletedAt`) is supported for trash and recovery features.
