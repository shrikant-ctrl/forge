# Forge (Internal File Hub)

Forge is an enterprise-grade, scalable internal file hub (a "Mini Google Drive") built with a modern monorepo architecture. 

For full details on the requirements and rollout strategy, please see the [Software Requirements Specification (SRS)](./docs/SRS_Internal_File_Hub.md).

## Architecture

This project is a monorepo powered by **Turborepo** and **pnpm workspaces**.

- **Backend (`apps/api`)**: Python 3.14+ with FastAPI, SQLAlchemy (async), Alembic, and PostgreSQL.
- **Frontend (`apps/web`)**: TanStack React (Vite, Router, Query) and TailwindCSS.
- **Infrastructure**: Docker Compose (PostgreSQL, Redis, MinIO).

## Prerequisites

- [Node.js](https://nodejs.org/) & [pnpm](https://pnpm.io/)
- [Python 3.14+](https://www.python.org/) & [uv](https://github.com/astral-sh/uv) (for ultra-fast python packaging)
- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

### 1. Environment Setup

First, clone the repository and set up your environment variables by copying the example file:
```bash
cp .env.example .env
```

### 2. Install Dependencies

Install all JavaScript/TypeScript dependencies across the workspaces using `pnpm`:
```bash
pnpm install
```

### 3. Start the Infrastructure (Database, Redis, Storage)

Spin up the local Docker containers:
```bash
docker-compose up -d
```

### 4. Run Migrations

Before running the backend, ensure your database schema is up to date:
```bash
cd apps/api
uv run alembic upgrade head
cd ../..
```
*(Note: As we are currently in Phase 1, there are no initial migration scripts yet, but this will be required once data models are added.)*

### 5. Start the Development Servers

You can run both the Frontend (React) and the Backend (FastAPI) concurrently from the root directory using Turborepo:
```bash
pnpm run dev
```

- The **React App** will be available at: `http://localhost:3000`
- The **FastAPI Backend** will be available at: `http://localhost:8000` (Swagger UI at `/docs`)

---

## Workspace Scripts

From the root directory, you can run the following Turbo commands:

- `pnpm run dev` - Starts all development servers
- `pnpm run build` - Builds all production assets
- `pnpm run lint` - Lints the codebase
- `pnpm run typecheck` - Runs TypeScript typechecking in the frontend
