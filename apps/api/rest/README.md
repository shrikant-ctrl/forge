# REST API Test Files

HTTP request files for testing all Forge API endpoints.

## Setup

### Option A — VS Code REST Client (Recommended)
1. Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension
2. Open any `.http` file
3. Click **"Send Request"** above any request block

### Option B — JetBrains HTTP Client
Works out of the box in IntelliJ IDEA / WebStorm / PyCharm.

### Option C — curl
Every file uses standard HTTP format compatible with most tools.

---

## Workflow

Run requests in this order for a complete end-to-end test:

```
1. health.http          → Check server is up
2. auth.http            → Register → Login → copy the accessToken
3. folders.http         → Create → List → Get → Update → Delete
4. files.http           → Init Upload → PUT to S3 → Complete → List → Download → Delete
5. errors.http          → Verify error payloads are correct
```

## Environment Variables

The files use `{{}}` variables. Set these in your client's environment:

| Variable | Where to get it |
| :--- | :--- |
| `BASE_URL` | `http://localhost:8000` |
| `TOKEN` | Returned by `POST /api/auth/login` → `accessToken` |
| `FOLDER_ID` | Returned by `POST /api/folders` → `id` |
| `FILE_ID` | Returned by `POST /api/files/init-upload` → `fileId` |
| `UPLOAD_URL` | Returned by `POST /api/files/init-upload` → `uploadUrl` |

---

## Files

| File | Endpoints |
| :--- | :--- |
| [`health.http`](./health.http) | `GET /`, `GET /health` |
| [`auth.http`](./auth.http) | `POST /register`, `POST /login`, `GET /me` |
| [`folders.http`](./folders.http) | Full folder CRUD |
| [`files.http`](./files.http) | Upload flow + file CRUD |
| [`errors.http`](./errors.http) | Error scenario validation |
