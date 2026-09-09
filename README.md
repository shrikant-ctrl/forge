# Forge — Enterprise Internal File Hub

[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](#backend)
[![ORM](https://img.shields.io/badge/ORM-Prisma%20for%20Python-2D3748.svg)](#database--schema-management)
[![Frontend](https://img.shields.io/badge/Frontend-TanStack%20React%20%7C%20Vite-61DAFB.svg)](#frontend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg)](#infrastructure)
[![Storage](https://img.shields.io/badge/Storage-MinIO%20S3-C72C48.svg)](#infrastructure)
[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo%20%2B%20pnpm-EF4444.svg)](#monorepo-overview)

**Forge** is a scalable, enterprise-grade internal file hub — a "Mini Google Drive" for teams. The backend is structured using a **NestJS-style modular architecture** (Controllers, Services, DTOs, Guards, Exception Filters) while powered by Python 3.14 + FastAPI. The frontend is a React 19 SPA built with TanStack Router and TanStack Query.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [First-Time Setup (New Developer)](#first-time-setup-new-developer)
   - [1. Clone & Navigate](#1-clone--navigate)
   - [2. Install Tooling](#2-install-tooling)
   - [3. Configure Environment](#3-configure-environment)
   - [4. Start Infrastructure (Docker)](#4-start-infrastructure-docker)
   - [5. Install Dependencies](#5-install-dependencies)
   - [6. Sync Database Schema](#6-sync-database-schema)
   - [7. Run the Full Stack](#7-run-the-full-stack)
5. [Working on the Backend (BE)](#working-on-the-backend-be)
6. [Working on the Frontend (FE)](#working-on-the-frontend-fe)
7. [API Reference](#api-reference)
8. [All Commands Cheatsheet](#all-commands-cheatsheet)
9. [Project Structure](#project-structure)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  React 19 SPA (apps/web)  :3000                          │
│  TanStack Router • TanStack Query • TailwindCSS v4       │
└─────────────────────────┬────────────────────────────────┘
                          │ REST / JSON
                          ▼
┌──────────────────────────────────────────────────────────┐
│  FastAPI (apps/api)  :8000                               │
│  NestJS-Style: Controllers → Services → DTOs             │
│  Guards (AuthGuard, RolesGuard) • Exception Filters      │
│  JWT Auth (PyJWT + bcrypt) • Prisma Client               │
└──────┬────────────────────────┬──────────────────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
┌────────────┐          ┌───────────┐          ┌─────────────┐
│ PostgreSQL  │          │   Redis   │          │    MinIO    │
│  :5432      │          │   :6379   │          │ :9000/:9001 │
│  Users      │          │  Cache /  │          │ S3 Storage  │
│  Files      │          │  Queues   │          │   Blobs     │
│  Folders    │          └───────────┘          └─────────────┘
│  Versions   │
│  ShareLinks │
└────────────┘
```

---

## Tech Stack

| Layer | Technology | Port |
| :--- | :--- | :--- |
| **Frontend** | React 19, TanStack Router, TanStack Query, TailwindCSS v4, Vite 8, Biome | `:3000` |
| **Backend** | FastAPI, Python 3.14+, Pydantic v2, Uvicorn | `:8000` |
| **ORM & Schema** | Prisma for Python (`prisma-client-py`) — auto schema sync | — |
| **Database** | PostgreSQL 16 | `:5432` |
| **Cache** | Redis 7 | `:6379` |
| **Object Storage** | MinIO (S3-compatible) | `:9000` (API) / `:9001` (Console) |
| **Monorepo** | Turborepo + pnpm workspaces | — |
| **Package Manager** | pnpm 10.x (via Corepack) | — |
| **Python Tooling** | uv (package manager + virtualenv) | — |

---

## Prerequisites

Install these tools before starting. **All are required.**

| Tool | Install Command | Verify |
| :--- | :--- | :--- |
| **Node.js** v22 | [nodejs.org](https://nodejs.org/) | `node -v` |
| **pnpm** v10 | `corepack enable && corepack prepare pnpm@10.32.1 --activate` | `pnpm -v` |
| **Python** 3.14+ | [python.org](https://www.python.org/) or `uv python install 3.14` | `python --version` |
| **uv** | `curl -LsSf https://astral.sh/uv/install.sh \| sh` | `uv --version` |
| **Docker** + Compose | [docker.com](https://www.docker.com/) | `docker compose version` |
| **Git** | [git-scm.com](https://git-scm.com/) | `git --version` |

> **Note on pnpm**: If `pnpm` isn't available after `corepack enable`, run:
> ```bash
> corepack enable --install-directory ~/.local/bin
> echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
> ```

---

## First-Time Setup (New Developer)

Run these steps **once** when you first clone the project. After that, just use `pnpm run dev` to start working.

### 1. Clone & Navigate

```bash
git clone https://github.com/your-org/forge.git
cd forge
```

---

### 2. Install Tooling

Make sure `pnpm` is available:

```bash
corepack enable
corepack prepare pnpm@10.32.1 --activate
pnpm -v  # should print 10.32.1
```

Make sure `uv` is available:

```bash
uv --version  # should print 0.x.x
# If not installed:
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc  # or restart your terminal
```

---

### 3. Configure Environment

Copy the environment template and **fill in your values** (defaults work for local dev out of the box):

```bash
cp .env.example .env
```

The `.env` file lives at the **monorepo root** and is shared by all services:

```ini
# PostgreSQL connection (standard URL — no +asyncpg prefix)
DATABASE_URL=postgresql://admin:password@localhost:5432/file_hub

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT — CHANGE THIS in any real environment
SECRET_KEY=supersecretkey_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MinIO / S3 Object Storage
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=password123
AWS_REGION=us-east-1
S3_ENDPOINT_URL=http://localhost:9000
S3_BUCKET_NAME=filehub-bucket
```

Symlink the root `.env` so Prisma CLI can find it when run from `apps/api/`:

```bash
ln -sf ../../.env apps/api/.env
```

---

### 4. Start Infrastructure (Docker)

Start PostgreSQL, Redis, and MinIO:

```bash
docker compose up -d
```

Verify all 3 containers are running:

```bash
docker compose ps
```

```
NAME              STATUS    PORTS
file_hub_db       running   0.0.0.0:5432->5432/tcp
file_hub_redis    running   0.0.0.0:6379->6379/tcp
file_hub_minio    running   0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
```

**Create the MinIO bucket** (one-time):
1. Open [http://localhost:9001](http://localhost:9001) — MinIO console
2. Login: `admin` / `password123`
3. Go to **Buckets → Create Bucket** → name it `filehub-bucket`

> **If you already run PostgreSQL, Redis, or MinIO natively** (not Docker), you can skip `docker compose up`. The app reads from `DATABASE_URL` in `.env` regardless.

---

### 5. Install Dependencies

Install all Node.js dependencies (frontend, root tooling, Turborepo):

```bash
pnpm install
```

Install all Python dependencies and create the virtualenv in `apps/api/.venv/`:

```bash
cd apps/api
uv sync
cd ../..
```

---

### 6. Sync Database Schema

Push the Prisma schema to PostgreSQL and generate the typed Python client:

```bash
pnpm db:push
```

You should see:
```
🚀  Your database is now in sync with your Prisma schema.
✔  Generated Prisma Client Python (v0.15.0)
```

> This creates all tables (`users`, `files`, `folders`, `file_versions`, `share_links`) automatically. **No SQL or migration files needed.**

---

### 7. Run the Full Stack

Start both the backend (`:8000`) and frontend (`:3000`) simultaneously from the root:

```bash
pnpm run dev
```

> **Automatic schema sync**: Every time you run `pnpm run dev`, the backend automatically runs `prisma db push` before booting. Your database is always in sync with the schema.

**Verify everything is running:**

| URL | What to expect |
| :--- | :--- |
| [http://localhost:3000](http://localhost:3000) | React frontend |
| [http://localhost:8000/health](http://localhost:8000/health) | `{"status":"ok","database":"connected"}` |
| [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI — all API endpoints |
| [http://localhost:9001](http://localhost:9001) | MinIO console |

---

## Working on the Backend (BE)

### Running the Backend Alone

```bash
# From repo root
pnpm --filter api dev

# Or directly from apps/api/
cd apps/api
uv run prisma db push && uv run fastapi dev app/main.py
```

The server runs at **`http://localhost:8000`** with hot reload enabled.

### Adding a New Module (NestJS-Style Pattern)

Every feature lives in `apps/api/app/modules/<feature>/`. Follow this structure:

```
apps/api/app/modules/
└── my_feature/
    ├── __init__.py
    ├── my_feature_controller.py   # APIRouter — maps HTTP routes to service methods
    ├── my_feature_service.py      # Business logic + Prisma queries
    └── dto/
        ├── __init__.py
        └── my_feature_dto.py      # Pydantic request/response models
```

**Step 1 — Add a Prisma model** in `apps/api/prisma/schema.prisma`:

```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  fileId    String   @map("file_id")
  file      File     @relation(fields: [fileId], references: [id])
  authorId  String   @map("author_id")
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comments")
}
```

**Step 2 — Push the schema** (no migration files needed):

```bash
pnpm db:push
# PostgreSQL now has a `comments` table + typed Python client is regenerated
```

**Step 3 — Create DTOs** (`dto/comment_dto.py`):

```python
from pydantic import BaseModel, Field

class CreateCommentDto(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    fileId: str

class CommentResponseDto(BaseModel):
    id: str
    content: str
    fileId: str
    authorId: str
```

**Step 4 — Create the Service** (`comments_service.py`):

```python
from typing import Annotated
from fastapi import Depends
from prisma import Prisma
from app.core.db import get_db
from app.modules.comments.dto.comment_dto import CreateCommentDto, CommentResponseDto

class CommentsService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create(self, dto: CreateCommentDto, user_id: str) -> CommentResponseDto:
        comment = await self.db.comment.create(data={
            "content": dto.content,
            "fileId": dto.fileId,
            "authorId": user_id,
        })
        return CommentResponseDto(id=comment.id, content=comment.content,
                                  fileId=comment.fileId, authorId=comment.authorId)

def get_comments_service(db: Annotated[Prisma, Depends(get_db)]) -> CommentsService:
    return CommentsService(db)
```

**Step 5 — Create the Controller** (`comments_controller.py`):

```python
from fastapi import APIRouter, Depends, status
from typing import Annotated
from app.common.guards.auth_guard import AuthGuard
from app.modules.comments.comments_service import CommentsService, get_comments_service
from app.modules.comments.dto.comment_dto import CreateCommentDto, CommentResponseDto

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("", response_model=CommentResponseDto, status_code=status.HTTP_201_CREATED)
async def create_comment(
    dto: CreateCommentDto,
    current_user: AuthGuard,
    service: Annotated[CommentsService, Depends(get_comments_service)],
):
    return await service.create(dto, user_id=current_user.id)
```

**Step 6 — Register the router** in `app/main.py`:

```python
from app.modules.comments.comments_controller import router as comments_router
app.include_router(comments_router, prefix="/api")
```

Done. Your new `POST /api/comments` endpoint is live.

### Using Guards

```python
from app.common.guards.auth_guard import AuthGuard          # JWT required
from app.common.guards.roles_guard import Roles
from prisma.enums import Role

# Require login
@router.get("/me")
async def get_me(current_user: AuthGuard): ...

# Require ADMIN role
@router.delete("/users/{id}")
async def delete_user(user: Annotated[User, Depends(Roles(Role.ADMIN))]): ...
```

### Writing Tests

Tests live in `apps/api/tests/`. The test client runs the full FastAPI app in-process.

```bash
# Run tests
pnpm --filter api test

# Or directly
cd apps/api && uv run pytest -v
```

### Code Quality

```bash
pnpm --filter api lint      # ruff check
pnpm --filter api format    # ruff format
```

---

## Working on the Frontend (FE)

### Running the Frontend Alone

```bash
# From repo root
pnpm --filter web dev

# Or directly
cd apps/web && pnpm dev
```

The app runs at **`http://localhost:3000`** with hot module replacement (HMR).

### Adding a New Page / Route

Routes are **file-based** using TanStack Router. Every file in `apps/web/src/routes/` becomes a route.

**Step 1 — Create the route file**:

```bash
# Example: creates /dashboard route
touch apps/web/src/routes/dashboard.tsx
```

```tsx
// apps/web/src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return <div>Dashboard</div>
}
```

**Step 2 — Regenerate the route tree** (run once after adding files):

```bash
pnpm --filter web generate-routes
# Or from root:
cd apps/web && pnpm generate-routes
```

> During `pnpm dev`, the route tree regenerates automatically on file save.

### Fetching Data from the Backend

Use TanStack Query. The API base URL is `http://localhost:8000`.

```tsx
// Example: fetching files list
import { useQuery } from '@tanstack/react-query'

function useFiles(folderId?: string) {
  return useQuery({
    queryKey: ['files', folderId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken')
      const url = folderId
        ? `/api/files?folderId=${folderId}`
        : '/api/files'
      const res = await fetch(`http://localhost:8000${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch files')
      return res.json()
    },
  })
}
```

### Code Quality

```bash
pnpm --filter web lint       # biome lint
pnpm --filter web format     # biome format
pnpm --filter web typecheck  # tsc --noEmit
pnpm --filter web check      # biome check (lint + format combined)
```

---

## API Reference

Interactive docs (Swagger UI): **[http://localhost:8000/docs](http://localhost:8000/docs)**

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT access token |
| `GET` | `/api/auth/me` | ✅ | Get authenticated user profile |

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@company.com","password":"securepass123","name":"Your Name"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@company.com","password":"securepass123"}'
# Returns: {"accessToken":"eyJ...","tokenType":"Bearer","expiresIn":1800}
```

### Folders — `/api/folders`

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/folders` | ✅ | Create folder (optionally nested under `parentId`) |
| `GET` | `/api/folders?parentId=<id>` | ✅ | List folders at root or inside a parent |
| `GET` | `/api/folders/{id}` | ✅ | Get folder details + breadcrumb path |
| `PATCH` | `/api/folders/{id}` | ✅ | Rename or move folder |
| `DELETE` | `/api/folders/{id}` | ✅ | Soft-delete folder |

### Files — `/api/files`

| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/files/init-upload` | ✅ | Get a presigned S3 PUT URL to upload directly |
| `POST` | `/api/files/complete-upload` | ✅ | Confirm upload completion, creates Version 1 |
| `GET` | `/api/files?folderId=<id>&search=<q>` | ✅ | List files with optional folder filter / search |
| `GET` | `/api/files/{id}` | ✅ | Get file metadata |
| `GET` | `/api/files/{id}/download-url` | ✅ | Get presigned S3 download URL |
| `PATCH` | `/api/files/{id}` | ✅ | Rename or move file |
| `DELETE` | `/api/files/{id}` | ✅ | Soft-delete file |

### Error Response Format (NestJS-style)

All errors return a consistent JSON envelope:

```json
{
  "statusCode": 404,
  "message": "Folder with ID 'abc' not found",
  "error": "Not Found",
  "details": null,
  "timestamp": "2026-09-09T11:22:58.330835+00:00",
  "path": "/api/folders/abc"
}
```

---

## All Commands Cheatsheet

### From the Repo Root (Recommended)

| Command | What it does |
| :--- | :--- |
| `pnpm run dev` | ✅ Start everything: schema sync + backend + frontend |
| `pnpm run build` | Build all packages for production |
| `pnpm run lint` | Lint all packages |
| `pnpm run format` | Format all packages |
| `pnpm run typecheck` | TypeScript check (frontend) |
| `pnpm run test` | Run all test suites |
| `pnpm run clean` | Clean build artifacts and caches |
| `pnpm db:push` | Sync `schema.prisma` → PostgreSQL, regenerate Python client |
| `pnpm db:studio` | Open Prisma Studio GUI at `http://localhost:5555` |
| `pnpm db:generate` | Regenerate Python client types only (no DB changes) |

### Backend Only

| Command | What it does |
| :--- | :--- |
| `pnpm --filter api dev` | Start FastAPI dev server (auto schema sync first) |
| `pnpm --filter api test` | Run pytest test suite |
| `pnpm --filter api lint` | `ruff check .` |
| `pnpm --filter api format` | `ruff format .` |
| `pnpm --filter api db:push` | Same as `pnpm db:push` |
| `pnpm --filter api db:studio` | Open Prisma Studio |

### Frontend Only

| Command | What it does |
| :--- | :--- |
| `pnpm --filter web dev` | Start Vite dev server on `:3000` |
| `pnpm --filter web build` | Production bundle |
| `pnpm --filter web lint` | `biome lint` |
| `pnpm --filter web format` | `biome format` |
| `pnpm --filter web check` | `biome check` (lint + format) |
| `pnpm --filter web typecheck` | `tsc --noEmit` |
| `pnpm --filter web generate-routes` | Regenerate TanStack route tree |

### Docker

| Command | What it does |
| :--- | :--- |
| `docker compose up -d` | Start PostgreSQL, Redis, MinIO in background |
| `docker compose ps` | Check container status |
| `docker compose stop` | Stop containers (preserve data) |
| `docker compose down` | Stop and remove containers (preserve volumes) |
| `docker compose down -v` | ⚠️ Stop, remove containers AND volumes (wipes data) |
| `docker compose logs -f db` | Tail PostgreSQL logs |

---

## Project Structure

```
forge/
├── .env.example                    # Copy to .env — fill in your values
├── .gitignore
├── docker-compose.yml              # PostgreSQL :5432, Redis :6379, MinIO :9000/:9001
├── package.json                    # Root scripts (dev, build, lint, test, db:*)
├── pnpm-workspace.yaml             # pnpm workspace config
├── turbo.json                      # Turborepo pipeline
│
├── apps/
│   ├── api/                        # ─── BACKEND ───────────────────────────
│   │   ├── .env -> ../../.env      # Symlink to root .env (Prisma CLI needs it)
│   │   ├── package.json            # BE scripts: dev, test, lint, db:push, db:studio
│   │   ├── pyproject.toml          # Python deps: fastapi, prisma, pyjwt, bcrypt, boto3
│   │   ├── uv.lock                 # Locked Python deps
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma       # ← SINGLE SOURCE OF TRUTH for all DB models
│   │   │
│   │   ├── app/
│   │   │   ├── main.py             # FastAPI bootstrap: mounts routers, CORS, exception filter
│   │   │   │
│   │   │   ├── core/               # Framework-level infrastructure
│   │   │   │   ├── config.py       # Env vars via Pydantic Settings
│   │   │   │   ├── db.py           # Prisma client singleton + get_db dependency
│   │   │   │   ├── security.py     # bcrypt hashing + JWT sign/verify
│   │   │   │   └── exceptions.py   # HttpException hierarchy (NestJS-style)
│   │   │   │
│   │   │   ├── common/             # Cross-cutting concerns
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth_guard.py     # Validates JWT → injects current User
│   │   │   │   │   └── roles_guard.py    # Roles(Role.ADMIN) RBAC guard
│   │   │   │   └── filters/
│   │   │   │       └── http_exception_filter.py  # Formats errors to NestJS envelope
│   │   │   │
│   │   │   └── modules/            # Feature modules (add yours here)
│   │   │       ├── auth/           # Register, Login, /me
│   │   │       │   ├── auth_controller.py
│   │   │       │   ├── auth_service.py
│   │   │       │   └── dto/auth_dto.py
│   │   │       ├── folders/        # Folder CRUD, tree, breadcrumbs
│   │   │       │   ├── folders_controller.py
│   │   │       │   ├── folders_service.py
│   │   │       │   └── dto/folders_dto.py
│   │   │       ├── files/          # Upload (presigned), download, CRUD, quota
│   │   │       │   ├── files_controller.py
│   │   │       │   ├── files_service.py
│   │   │       │   └── dto/files_dto.py
│   │   │       └── storage/        # S3/MinIO presigned URL generator
│   │   │           └── storage_service.py
│   │   │
│   │   └── tests/
│   │       └── test_api_flow.py    # Integration tests: auth → folders → files → errors
│   │
│   └── web/                        # ─── FRONTEND ──────────────────────────
│       ├── package.json            # FE scripts: dev, build, lint, typecheck
│       ├── vite.config.ts          # Vite + TanStack Start + TailwindCSS v4
│       ├── tsconfig.json           # Strict TS config
│       ├── biome.json              # Biome lint/format config
│       │
│       └── src/
│           ├── router.tsx          # TanStack Router instance
│           ├── styles.css          # Global styles + Tailwind tokens
│           ├── routes/             # File-based routes (add files here for new pages)
│           │   ├── __root.tsx      # Root layout: Header, Footer, QueryClientProvider
│           │   ├── index.tsx       # Home page
│           │   └── about.tsx
│           ├── components/         # Shared UI components
│           │   ├── Header.tsx
│           │   ├── Footer.tsx
│           │   └── ThemeToggle.tsx
│           └── hooks/              # Custom React hooks
│
└── docs/
    ├── SRS_Internal_File_Hub.md    # Full software requirements spec
    └── FE_screens.md               # UI screen specs & flows
```

---

## Troubleshooting

### `pnpm: command not found`
```bash
corepack enable --install-directory ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
# Add to ~/.bashrc or ~/.zshrc to persist
```

### `DATABASE_URL` environment variable not found (Prisma)
Ensure the symlink exists:
```bash
ls -la apps/api/.env      # should show -> ../../.env
# If missing:
ln -sf ../../.env apps/api/.env
```

### Port already in use (9001, 5432, etc.)
Check what's using the port and stop it, or edit `docker-compose.yml` to use a different host port:
```bash
# Check who's using port 9001
ss -tulpn | grep 9001

# Stop any previously running docker stack cleanly
docker compose down
```

### Database connection refused
PostgreSQL takes ~5 seconds to be ready after `docker compose up -d`. Wait a moment then retry:
```bash
docker compose logs db     # Check if PostgreSQL finished initializing
docker compose ps          # Confirm STATUS is "running" not "starting"
```

### `ModuleNotFoundError: No module named 'app'` in tests
The `pythonpath = ["."]` setting in `pyproject.toml` handles this. Run pytest via:
```bash
cd apps/api && uv run pytest   # ✅ correct
# not: python -m pytest        # ❌ may miss pythonpath config
```

### Schema changes not reflected after editing `schema.prisma`
Run:
```bash
pnpm db:push
# This syncs PostgreSQL and regenerates the Python client
```

### MinIO bucket does not exist error
Create the bucket manually:
```bash
docker exec -it file_hub_minio mc alias set local http://localhost:9000 admin password123
docker exec -it file_hub_minio mc mb local/filehub-bucket
```
Or use the MinIO Console at [http://localhost:9001](http://localhost:9001).

### Clean slate (wipe everything and start fresh)
```bash
docker compose down -v          # removes all data volumes
docker compose up -d
pnpm db:push                    # recreate schema
```
