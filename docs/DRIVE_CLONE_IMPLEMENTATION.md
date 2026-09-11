# Google Drive Clone — Frontend Implementation Doc (DaisyUI only)

This doc supersedes `docs/FE_screens.md` for build purposes. `FE_screens.md` describes an aspirational, feature-complete Drive clone; this doc scopes the frontend to what the *current* backend (`apps/api`) actually supports, using **only DaisyUI** components on top of the existing stack (React 19, TanStack Router/Query/Form, Zod, Tailwind v4). No other UI, upload, or state library is introduced.

## 0. Backend reality check

Backend = FastAPI + Prisma/Postgres + MinIO (`apps/api`). Endpoints that exist:

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Folders | `POST/GET /api/folders`, `GET/PATCH/DELETE /api/folders/{id}` |
| Files | `POST /api/files/init-upload`, `POST /api/files/complete-upload`, `GET /api/files`, `GET/PATCH/DELETE /api/files/{id}`, `GET /api/files/{id}/download-url` |

Notable quirks that shape the pages below:

- **`GET /api/files` with no `folderId` returns every file the user owns, across all folders**, already sorted `updatedAt desc` (`apps/api/app/modules/files/files_service.py:132-150`). This is what makes **Recent** and **global Search** free — no backend change needed.
- **`GET /api/folders` with no `parentId` returns root-only folders** (`parentId: null`), unlike the files endpoint. There is **no way to ask the files API for "root files only"** — omitting `folderId` returns everything, it doesn't mean `folderId: null`.
  - **Workaround (frontend-only, no backend change):** for a given folder view (including root), fetch the full file list once via `GET /api/files` and filter client-side by `file.folderId === currentFolderId` (`null` for root). Fine at the scale of an internal tool; revisit with a real `folderId=root` sentinel if a user ever has thousands of files.
- **`usedStorage` is incremented on upload but never decremented on delete.** The storage meter will drift upward over time regardless of what the frontend does — call this out as a known limitation, don't try to "fix" it client-side.
- **`ShareLink`/`ShareAccess` are defined in Prisma but have zero controller/service code** — completely unusable today.
- Delete is a soft-delete server-side (`isDeleted`/`deletedAt`), but **there is no endpoint to list or restore deleted items** — from the UI's perspective, delete is permanent.

## 1. Feature scope table

| Feature | Status | Reason |
|---|---|---|
| Email/password sign up, log in, "me" | **Included** | `auth` module fully implemented |
| Folder create/list/rename/move | **Included** | `folders` module fully implemented |
| File upload (presigned S3/MinIO) | **Included** | `init-upload` / `complete-upload` flow implemented |
| File download | **Included** | presigned `download-url` |
| Rename / move file or folder | **Included** | `PATCH` on both resources |
| Delete (permanent from UI) | **Included, no undo** | soft-delete exists but no list-trash/restore endpoint |
| Filename search (global) | **Included** | `GET /api/files?search=` matches across all folders |
| Recent | **Included** | free client-side sort of `GET /api/files` |
| File preview | **Included, native only** | no thumbnail/viewer API — use `<img>/<iframe>/<video>/<audio>` against `download-url` |
| Storage quota display | **Included, known drift** | quota fields exist; `usedStorage` isn't decremented on delete |
| Sharing / collaborators / public link | **Excluded** | `ShareLink` model has zero backend implementation |
| Comments | **Excluded** | no model, no endpoint |
| Starring / favorites | **Excluded** | no field, no endpoint |
| Trash browsing + restore | **Excluded** | soft-delete has no list/restore endpoint |
| File version history | **Excluded** | only v1 is ever created; no re-upload-as-new-version or list-versions endpoint |
| Activity / audit log | **Excluded** | no model, no endpoint |
| Notifications | **Excluded** | no model, no endpoint; Redis is provisioned but unused |
| Admin dashboard | **Excluded** | `Role.ADMIN` exists but no admin routes are implemented anywhere |
| Chunked/resumable upload | **Excluded** | single-shot presigned PUT only |

## 2. App shell (authenticated routes)

Replaces the current `Header`/`Footer` used across all routes in `apps/web/src/routes/__root.tsx`.

- **Top navbar** — DaisyUI `navbar`: `navbar-start` logo/title, `navbar-center` global search `input` (feeds `/search?q=`), `navbar-end` profile `dropdown` (`avatar`/`placeholder`) → Sign out.
- **Left sidebar** — static column on desktop, DaisyUI `drawer` on mobile:
  - "New" `dropdown` button: Upload file(s), Upload folder (`<input webkitdirectory>`, each file still goes through the normal per-file init-upload/complete-upload calls — no bulk endpoint exists), New folder.
  - Nav `menu`: My Drive, Recent.
  - Storage meter: `progress` bar + "X GB of Y GB used" from `GET /api/auth/me`'s `storageQuota`/`usedStorage`, with a tooltip noting the figure may be stale until a file is truly gone (see drift note above).
- **Theme** — reuse the existing `data-theme` + localStorage script in `__root.tsx`/`ThemeToggle.tsx` almost unchanged; just point it at two DaisyUI theme names instead of the current hand-rolled CSS variables. DaisyUI already reads `data-theme` off `<html>`, so this is a near-zero-diff swap.
- Unauthenticated routes (`/login`) render a bare shell — no sidebar/navbar.

## 3. Pages

1. **Login / Register** — `/login`. One DaisyUI `card`, `tabs` (Login / Register), `input`+`label` fields, `alert` on error, `loading` spinner on submit button. Calls `POST /api/auth/login` / `POST /api/auth/register`, stores the JWT, redirects to `/drive`.
2. **My Drive** — `/drive`, `/drive/$folderId`. `breadcrumbs` built from the folder's breadcrumb trail (`GET /api/folders/{id}`); toolbar (`join` button group for grid/list toggle, `select` for sort-by); full-screen dropzone overlay on drag-over; folder cards + file `card` grid or `table` list view; kebab/right-click `dropdown` menu per item limited to **Open, Rename, Move, Download, Delete** (no Share/Star/Copy/Color — nothing backs them).
3. **Recent** — `/recent`. Same file-row/card component as My Drive, fed by `GET /api/files` (no `folderId`) already sorted `updatedAt desc`; group under date `divider`s (Today / Yesterday / Earlier).
4. **Search results** — `/search?q=`. Same list component, fed by `GET /api/files?search=`; `hero`-style empty state when nothing matches.
5. **File preview modal** — DaisyUI `modal`, switched on mime type against the file's `download-url`: `<img>` for images, `<iframe>` for PDF, `<video>`/`<audio>` with native controls for media, `<pre>` for text/code. Anything else: "No preview available" + Download button.
6. **Rename / New folder / Move dialogs** — DaisyUI `modal` forms. Move uses a folder-tree `menu` inside the modal, built recursively from `GET /api/folders?parentId=`.
7. **Delete confirmation** — DaisyUI `modal` + `alert alert-warning`: "This can't be undone" — accurate, since there's no trash to recover from.
8. **Upload progress** — fixed bottom-right DaisyUI `toast` stack, one `progress` bar per in-flight upload (tracked via `fetch`/`XHR` upload progress against the presigned PUT URL), `badge` for success/error per row.
9. **Settings** — `/settings`. Single page: profile (name, email, role) from `GET /api/auth/me`, storage breakdown via DaisyUI `stat`, theme toggle. No notifications tab, no manage-apps tab — nothing backs either.

## 4. Explicitly excluded screens (from `FE_screens.md`)

| Screen | Why cut |
|---|---|
| Shared with me | no sharing backend at all |
| Starred | no starred field/endpoint |
| Trash / Bin (list + restore + empty trash) | no list-trash or restore endpoint |
| Sharing & Permissions modal | `ShareLink` is schema-only |
| Comments sidebar | no model/endpoint |
| Activity tab (in file details panel) | no audit log model/endpoint |
| Admin dashboard | no admin routes despite `Role.ADMIN` existing |
| Version history | only v1 is ever recorded, no list/restore endpoint |
| Notifications settings | no model/endpoint |

## 5. Cleanup of existing scaffold

- Delete: `src/routes/demo/*`, `src/hooks/demo.form-context.ts`, `src/hooks/demo.form.ts`, `src/components/demo.FormComponents.tsx` — unrelated form-demo scaffolding, unused once Drive forms replace them.
- `src/routes/about.tsx` and `src/routes/index.tsx`: remove in favor of `/drive` as the authenticated root; `/` redirects to `/drive` (or `/login` if unauthenticated).
- `src/components/Header.tsx`, `Footer.tsx`: replaced by the DaisyUI navbar/sidebar shell in section 2.
- Add DaisyUI: `pnpm add -D daisyui` in `apps/web`, then `@plugin "daisyui";` in `src/styles.css` (Tailwind v4 CSS-first config — no `tailwind.config.js` needed).
