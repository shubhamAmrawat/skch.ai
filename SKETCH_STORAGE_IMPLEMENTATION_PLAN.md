# Sketch Storage & My Sketches Implementation Plan

## Executive Summary

This document outlines the strategy to persist generated sketches in the database and make the **My Sketches** section fully functional. Currently, sketches are generated and exported but not stored; the My Sketches page is a placeholder.

---

## Current State Analysis

### Backend
| Component | Status |
|-----------|--------|
| **Database** | MongoDB via Mongoose |
| **Models** | `User` only – no Sketch model |
| **Generate API** | `POST /api/generate` – public, no auth |
| **Auth** | JWT (access + refresh), `authenticate` middleware available |
| **User ID** | `req.userId` available on protected routes |

### Frontend
| Component | Status |
|-----------|--------|
| **Sketch flow** | tldraw canvas → PNG → GPT-4o → React/TSX code |
| **Code storage** | In-memory state only (lost on refresh) |
| **Export** | Downloads `.tsx` file locally |
| **My Sketches** | Placeholder "Coming Soon" page |
| **API calls** | `generateUI()` uses plain `fetch` – no auth |

### Data Flow (Current)
```
User draws → Generate → /api/generate (no auth) → code in state → Export (download)
                                                              → Lost on refresh
```

---

## Implementation Strategy

### Design Decisions

1. **Explicit Save** – User clicks "Save" to persist; no auto-save. Clear UX, user controls when to save.
2. **Store code + metadata** – Save generated code, title, timestamps. No tldraw snapshot for MVP (can add later for canvas editing).
3. **Thumbnail** – Optional for MVP. Use placeholder icon; can add preview capture later.
4. **Auth required for save** – Sketches are user-specific; save/list/update/delete require authentication.
5. **Generate stays public** – Allow unauthenticated users to try the tool; they must log in to save.

---

## Phase 1: Backend – Sketch Model & API

### 1.1 Sketch Model (`Server/src/models/Sketch.js`)

```javascript
{
  userId: ObjectId (ref: User, required, indexed),
  title: String (default: "Untitled Sketch", max 100 chars),
  code: String (required),
  thumbnail: String (optional, for future use),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:** `{ userId: 1, createdAt: -1 }` for efficient listing.

### 1.2 Sketch Routes (`Server/src/routes/sketchRoutes.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| POST | `/api/sketches` | Required | Create new sketch |
| GET | `/api/sketches` | Required | List user's sketches (paginated) |
| GET | `/api/sketches/:id` | Required | Get single sketch |
| PUT | `/api/sketches/:id` | Required | Update sketch (title, code) |
| DELETE | `/api/sketches/:id` | Required | Delete sketch |

### 1.3 Sketch Controller (`Server/src/controllers/sketchController.js`)

- **create** – Validate `{ title?, code }`, associate with `req.userId`
- **list** – Query by `userId`, sort by `createdAt` desc, support `?page=1&limit=20`
- **getOne** – Fetch by id, ensure `userId` matches (owner check)
- **update** – Update title/code, owner check
- **delete** – Soft or hard delete, owner check

### 1.4 Register Routes in `server.js`

```javascript
import sketchRoutes from './routes/sketchRoutes.js';
app.use('/api/sketches', sketchRoutes);
```

---

## Phase 2: Frontend – Authenticated API & Save Flow

### 2.1 Sketch API Service (`Client/src/services/sketchApi.ts`)

- Use `authFetch`-style requests to `/api/sketches` with `Authorization: Bearer <token>`
- **Note:** `authFetch` in `auth.ts` uses `VITE_AUTH_API_BASE_URL` (e.g. `/api/auth`). Sketch endpoints are at `/api/sketches`. Need to use the main API base (`VITE_API_BASE_URL`) with auth headers.
- **Solution:** Add `authApiFetch(endpoint, options)` in `api.ts` that uses `VITE_API_BASE_URL` + auth token from `tokenStorage`.

Functions:
- `createSketch({ title, code })` → POST
- `getSketches(page?, limit?)` → GET
- `getSketch(id)` → GET
- `updateSketch(id, { title?, code? })` → PUT
- `deleteSketch(id)` → DELETE

### 2.2 Save Button in CodePreviewPanel

- Add "Save" button next to Export (only when `generatedCode` exists).
- On click:
  - If not logged in → show toast/modal: "Log in to save sketches" + link to login.
  - If logged in → optional title prompt (default "Untitled Sketch") → call `createSketch` → success toast.

### 2.3 SketchApp Integration

- Pass `onSave` callback from SketchApp to CodePreviewPanel.
- SketchApp uses `useAuth` to check auth; passes `isAuthenticated` to CodePreviewPanel for conditional Save display.

---

## Phase 3: My Sketches Page – Real UI

### 3.1 Replace Placeholder

- Remove "Coming Soon" content.
- Fetch sketches on mount: `getSketches()`.
- Display as **grid of cards** (responsive: 1 col mobile, 2–3 cols desktop).

### 3.2 Sketch Card

- **Placeholder icon** (e.g. FileCode or Layout icon) – no thumbnail for MVP.
- **Title** (truncate if long).
- **Date** (e.g. "2 days ago" or formatted date).
- **Actions:**
  - **Open** → Navigate to `/app?sketchId=<id>` (or `/app/:id`).
  - **Export** → Download code as `.tsx`.
  - **Delete** → Confirm → `deleteSketch(id)` → refresh list.

### 3.3 Empty State

- When no sketches: friendly message + "Start Sketching" CTA → `/app`.

---

## Phase 4: Load Sketch in SketchApp

### 4.1 Route Support

- Option A: Query param – `/app?sketchId=xxx`
- Option B: Route – `/app/sketch/:sketchId`

**Recommendation:** Query param `/app?sketchId=xxx` – simpler, no route changes.

### 4.2 Load Flow

1. On SketchApp mount, read `sketchId` from `useSearchParams()`.
2. If `sketchId` present → `getSketch(sketchId)` → set `generatedCode` in state.
3. Show "Loaded: [title]" indicator.
4. When user clicks Save:
   - If loaded from sketch → `updateSketch(id, { code })` (update existing).
   - If new → `createSketch({ title, code })` (create new).

### 4.3 State Management

- Add `currentSketchId: string | null` to SketchApp state.
- On load: set `currentSketchId` from response.
- On save: if `currentSketchId` → update; else → create and optionally set `currentSketchId` for subsequent saves.

---

## Phase 5: Polish & Edge Cases

### 5.1 Error Handling

- Network errors, 401 (redirect to login), 404 (sketch not found).
- Toast notifications for success/error.

### 5.2 Loading States

- Skeleton or spinner on My Sketches while fetching.
- Disable Save button while saving.

### 5.3 Pagination (Optional for MVP)

- Initial: load first 20 sketches.
- "Load more" or infinite scroll later.

---

## File Checklist

### Backend (New/Modified)
- [ ] `Server/src/models/Sketch.js` (new)
- [ ] `Server/src/controllers/sketchController.js` (new)
- [ ] `Server/src/routes/sketchRoutes.js` (new)
- [ ] `Server/src/server.js` (add sketch routes)

### Frontend (New/Modified)
- [ ] `Client/src/services/sketchApi.ts` (new) – or extend `api.ts` with auth fetch + sketch methods
- [ ] `Client/src/services/api.ts` (add `authApiFetch` helper)
- [ ] `Client/src/components/CodePreviewPanel.tsx` (add Save button)
- [ ] `Client/src/pages/SketchApp.tsx` (load from sketchId, save logic)
- [ ] `Client/src/pages/MySketchesPage.tsx` (replace with real UI)
- [ ] `Client/src/App.tsx` (no change if using query param)

---

## API Contract Summary

### POST /api/sketches
**Request:** `{ title?: string, code: string }`  
**Response:** `{ success: true, data: { sketch: { id, title, code, createdAt, ... } } }`

### GET /api/sketches?page=1&limit=20
**Response:** `{ success: true, data: { sketches: [...], total, page, limit } }`

### GET /api/sketches/:id
**Response:** `{ success: true, data: { sketch: { id, title, code, createdAt, ... } } }`

### PUT /api/sketches/:id
**Request:** `{ title?: string, code?: string }`  
**Response:** `{ success: true, data: { sketch: {...} } }`

### DELETE /api/sketches/:id
**Response:** `{ success: true, message: "Sketch deleted" }`

---

## Implementation Order

1. **Backend first** – Model, controller, routes, wire into server.
2. **Frontend API** – `authApiFetch` + sketch service.
3. **Save flow** – Save button, auth check, create sketch.
4. **My Sketches page** – List, cards, open/export/delete.
5. **Load in SketchApp** – Query param, load sketch, update on save.

---

## Future Enhancements (Out of Scope for MVP)

- Thumbnail generation (render preview → capture as image).
- tldraw snapshot storage for canvas editing.
- Version history.
- Share/collaboration.
- Pagination / infinite scroll.
