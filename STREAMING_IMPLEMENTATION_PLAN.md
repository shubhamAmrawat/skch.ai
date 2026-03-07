# Phase 2 & 3 Implementation Plan: Streaming + Polish

> **Scope:** Implement streaming for UI generation/refinement (Phase 2) and progressive preview polish (Phase 3). Image quality remains unchanged.

---

## Overview

| Phase | Focus | Key Deliverables |
|-------|-------|-------------------|
| **Phase 2** | Streaming | SSE endpoint, client stream consumer, incremental code state |
| **Phase 3** | Polish | Progressive preview, skeleton UI, error boundaries, metrics |

---

## Phase 2: Streaming Implementation

### 2.1 Architecture

```
┌─────────────┐     POST /api/generate?stream=true     ┌─────────────┐
│   Client    │ ──────────────────────────────────────►│   Server    │
│             │                                         │             │
│  fetch()    │◄────────── SSE stream ──────────────────│  OpenAI /   │
│  body       │   data: {"delta":"..."}                 │  Anthropic  │
│  getReader()│   data: {"delta":"..."}                 │  stream     │
│             │   data: {"done":true,"usage":{...}}     │             │
└─────────────┘                                         └─────────────┘
```

**Request:** Same body as today. Add `stream: true` in body (or `?stream=true` query) to opt in.

**Response (streaming):** Server-Sent Events (SSE) with JSON lines:
- `{"type":"delta","content":"..."}` — text chunk
- `{"type":"done","code":"...","assistantReply":"...","usage":{...}}` — final post-processed result

---

### 2.2 Server Changes

#### File: `Server/src/controllers/aiController.js`

**New function: `generateUIStream(req, res)`**

1. **Setup SSE response**
   - `res.setHeader('Content-Type', 'text/event-stream')`
   - `res.setHeader('Cache-Control', 'no-cache')`
   - `res.setHeader('Connection', 'keep-alive')`
   - `res.flushHeaders()` if available

2. **Reuse existing logic** for:
   - Validation
   - Message building (SYSTEM_PROMPT, buildInitialMessage, etc.)
   - Model detection (OpenAI vs Anthropic)

3. **OpenAI streaming**
   ```javascript
   const stream = await client.chat.completions.create({
     model,
     max_tokens: 16384,
     temperature: 0.3,
     top_p: 0.95,
     messages,
     stream: true,  // <-- enable streaming
   });

   let fullText = '';
   for await (const chunk of stream) {
     const delta = chunk.choices[0]?.delta?.content;
     if (delta) {
       fullText += delta;
       res.write(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`);
     }
   }
   ```

4. **Anthropic streaming**
   ```javascript
   const stream = client.messages.stream({
     model,
     max_tokens: 16384,
     system,
     messages: anthropicMessages,
   });

   let fullText = '';
   for await (const event of stream) {
     if (event.type === 'content_block_delta' && event.delta?.text) {
       fullText += event.delta.text;
       res.write(`data: ${JSON.stringify({ type: 'delta', content: event.delta.text })}\n\n`);
     }
   }
   ```

5. **Post-process on completion**
   - Run `extractAssistantReply(fullText)`
   - Run `cleanCodeResponse(codeWithoutReply)`
   - Run `replaceBrokenPlaceholderUrls(cleanedCode)`
   - Send final event: `{ type: 'done', code, assistantReply, usage }`
   - `res.end()`

6. **Error handling**
   - Wrap in try/catch
   - On error: `res.write(`data: ${JSON.stringify({ type: 'error', error: message })}`)`
   - Then `res.end()`

#### File: `Server/src/routes/aiRoutes.js`

- Add route: `router.post('/generate', (req, res) => { ... })`
- Check `req.body.stream === true` or `req.query.stream === 'true'`
- If streaming: call `generateUIStream(req, res)`
- Else: call existing `generateUI(req, res)` (non-streaming fallback)

**Alternative:** Single controller that branches internally based on `stream` flag.

---

### 2.3 Client Changes

#### File: `Client/src/services/api.ts`

**New function: `generateUIStreaming()`**

```typescript
export async function generateUIStreaming(
  request: GenerateRequest,
  callbacks: {
    onDelta: (chunk: string) => void;
    onDone: (result: { code: string; assistantReply?: string | null; usage?: object }) => void;
    onError: (error: string) => void;
  }
): Promise<void>
```

**Implementation:**
1. `fetch(API_BASE_URL + '/generate', { method: 'POST', body: JSON.stringify({ ...request, stream: true }) })`
2. Check `response.ok`; if not, read JSON body and call `onError`
3. Get `response.body.getReader()` + `TextDecoder`
4. Read chunks, buffer lines, parse SSE:
   - `data: {...}` → parse JSON
   - `type: 'delta'` → `callbacks.onDelta(content)`
   - `type: 'done'` → `callbacks.onDone({ code, assistantReply, usage })`
   - `type: 'error'` → `callbacks.onError(error)`
5. Handle `AbortController` for cancellation

**Keep existing `generateUI()`** for non-streaming fallback.

---

#### File: `Client/src/pages/SketchApp.tsx`

**`handleGenerate` changes:**
1. Replace `await generateUI(...)` with `generateUIStreaming(...)`
2. Initialize: `let accumulatedCode = ''`
3. `onDelta`: `accumulatedCode += chunk`; `setState(prev => ({ ...prev, generatedCode: accumulatedCode }))`
4. `onDone`: Apply final `code` (post-processed), set `isGenerating: false`, update `conversationHistory` if needed
5. `onError`: Set `error`, `isGenerating: false`
6. Switch to `activeTab: 'preview'` on first delta (optional) or on done

**`handleIterate` changes:**
1. Same pattern: use `generateUIStreaming` with `iterateUI`-style request (feedback, currentCode, history)
2. `onDelta`: Accumulate and update `generatedCode`
3. `onDone`: Add assistant message to `conversationHistory`, set `isGenerating: false`

**State consideration:** During streaming, `generatedCode` will update frequently. Code tab will show live typing. Preview will need Phase 3 handling.

---

#### File: `Client/src/services/api.ts` — `iterateUI` with streaming

Add `iterateUIStreaming()` that calls `generateUIStreaming` with the iterate payload, or pass a `stream: true` flag to a unified function.

---

### 2.4 Task Checklist — Phase 2

| # | Task | File(s) |
|---|------|---------|
| 1 | Add `generateUIStream` in aiController | `Server/src/controllers/aiController.js` |
| 2 | Route `/generate` to stream or non-stream based on flag | `Server/src/routes/aiRoutes.js` |
| 3 | Add `generateUIStreaming` in api.ts | `Client/src/services/api.ts` |
| 4 | Update `handleGenerate` to use streaming | `Client/src/pages/SketchApp.tsx` |
| 5 | Update `handleIterate` to use streaming | `Client/src/pages/SketchApp.tsx` |
| 6 | Add AbortController for cancel-on-new-request | `Client/src/pages/SketchApp.tsx` |
| 7 | Test OpenAI streaming | Manual |
| 8 | Test Anthropic streaming | Manual |
| 9 | Test non-streaming fallback | Manual |

---

## Phase 3: Polish

### 3.1 Progressive Preview During Streaming

**Problem:** While streaming, `generatedCode` is incomplete. `prepareCode()` + Babel will often fail (unclosed tags, invalid JSX).

**Strategy: Debounced “best effort” preview**

1. **Debounce preview updates** — Only pass new code to `LivePreview` every 800–1200 ms during streaming.
2. **Graceful failure** — If iframe throws (postMessage error), don’t clear previous preview; keep showing last valid render or skeleton.
3. **Streaming indicator** — Show a subtle “Streaming…” or pulsing indicator in the preview area while `isGenerating` and we have partial code.

#### File: `Client/src/components/LivePreview.tsx`

**New prop: `isStreaming?: boolean`**

- When `isStreaming` and code changes: debounce updates (e.g. 1000 ms).
- When `isStreaming` is false: update immediately (current behavior).
- If render fails (error from iframe): keep previous `srcdoc` or show “Rendering…” until next successful render.

**Implementation sketch:**
```typescript
// In LivePreview
const debouncedCode = useDebouncedValue(code, isStreaming ? 1000 : 0);
// Use debouncedCode for generateIframeContent
```

#### File: `Client/src/components/CodePreviewPanel.tsx`

- Pass `isStreaming={isGenerating}` to `PreviewView` / `LivePreview` when used in preview tab.

#### File: `Client/src/utils/useDebouncedValue.ts` (new)

```typescript
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
```

---

### 3.2 Skeleton UI

**When:** `isGenerating && !generatedCode` (initial generation, no partial code yet).

**Current:** `GeneratingState` shows spinner + tips.

**Enhancement:** Show a skeleton layout in the preview area that mimics a typical UI (sidebar + main content blocks). This gives immediate visual feedback before any code arrives.

#### File: `Client/src/components/CodePreviewPanel.tsx` or new `PreviewSkeleton.tsx`

**Skeleton layout:**
- Gray blocks for sidebar, header, 2–3 content cards
- Subtle pulse animation
- Shown only when `isGenerating && !generatedCode` (or code length &lt; 50)

**Integration:** In the left pane (preview/code area), when `isGenerating && !isIterating` and we have no/very little code, show `PreviewSkeleton` instead of or alongside `GeneratingState`.

---

### 3.3 Error Boundaries

**Purpose:** If `LivePreview` or `CodeView` throws during streaming (e.g. bad partial code), prevent full app crash.

#### File: `Client/src/components/PreviewErrorBoundary.tsx` (new)

```typescript
class PreviewErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <div>Preview temporarily unavailable. Code may be incomplete.</div>;
    }
    return this.props.children;
  }
}
```

Wrap `PreviewView` (which contains `LivePreview`) in this boundary.

---

### 3.4 Metrics (Optional but Recommended)

**Log on client (dev) or send to analytics:**
- `timeToFirstToken` — ms from request start to first delta
- `totalTime` — ms from request start to `done`
- `totalTokens` — from usage in `done` event

**Implementation:** In `SketchApp` or `api.ts`, record `performance.now()` at request start, and on first `onDelta` and `onDone`.

---

### 3.5 Task Checklist — Phase 3

| # | Task | File(s) |
|---|------|---------|
| 1 | Add `useDebouncedValue` hook | `Client/src/utils/useDebouncedValue.ts` |
| 2 | Add `isStreaming` prop to LivePreview, debounce when streaming | `Client/src/components/LivePreview.tsx` |
| 3 | Pass `isStreaming` from CodePreviewPanel | `Client/src/components/CodePreviewPanel.tsx` |
| 4 | Create PreviewSkeleton component | `Client/src/components/PreviewSkeleton.tsx` |
| 5 | Show skeleton when generating with no/minimal code | `Client/src/components/CodePreviewPanel.tsx` |
| 6 | Add PreviewErrorBoundary | `Client/src/components/PreviewErrorBoundary.tsx` |
| 7 | Wrap PreviewView in error boundary | `Client/src/components/CodePreviewPanel.tsx` |
| 8 | Add timeToFirstToken / totalTime logging (optional) | `Client/src/pages/SketchApp.tsx` or `api.ts` |

---

## Implementation Order

### Week 1 — Phase 2 Core
1. Server: `generateUIStream` + route branching
2. Client: `generateUIStreaming` in api.ts
3. Client: `handleGenerate` + `handleIterate` use streaming
4. Test end-to-end (OpenAI + Claude)
5. Add AbortController for request cancellation

### Week 2 — Phase 2 Robustness + Phase 3 Start
6. Non-streaming fallback testing
7. Phase 3: `useDebouncedValue` + LivePreview debouncing
8. Phase 3: PreviewSkeleton
9. Phase 3: PreviewErrorBoundary

### Week 3 — Phase 3 Polish
10. Tune debounce delay (800–1200 ms)
11. Metrics logging
12. Edge cases: empty stream, partial JSON, network errors

---

## API Contract Summary

### Request (unchanged)
```json
POST /api/generate
{
  "image": "data:image/png;base64,...",
  "currentCode": "...",  // optional, for iterative drawing
  "feedback": "...",     // optional, for text iteration
  "history": [...],      // optional
  "model": "gpt-4o",
  "stream": true         // NEW: opt-in for streaming
}
```

### Response (streaming)
```
Content-Type: text/event-stream

data: {"type":"delta","content":"import "}
data: {"type":"delta","content":"React"}
data: {"type":"delta","content":" from 'react';\n"}
...
data: {"type":"done","code":"...","assistantReply":"...","usage":{"promptTokens":...,"completionTokens":...,"totalTokens":...}}
```

### Response (non-streaming, unchanged)
```json
{
  "success": true,
  "code": "...",
  "assistantReply": "...",
  "usage": { "promptTokens": ..., "completionTokens": ..., "totalTokens": ... }
}
```

---

## Files to Create/Modify Summary

| Action | Path |
|--------|------|
| Modify | `Server/src/controllers/aiController.js` |
| Modify | `Server/src/routes/aiRoutes.js` |
| Modify | `Client/src/services/api.ts` |
| Modify | `Client/src/pages/SketchApp.tsx` |
| Modify | `Client/src/components/LivePreview.tsx` |
| Modify | `Client/src/components/CodePreviewPanel.tsx` |
| Create | `Client/src/utils/useDebouncedValue.ts` |
| Create | `Client/src/components/PreviewSkeleton.tsx` |
| Create | `Client/src/components/PreviewErrorBoundary.tsx` |

---

## Testing Checklist

- [ ] Initial generation (image → code) streams correctly
- [ ] Iterative drawing (image + currentCode) streams correctly
- [ ] Text iteration (feedback + currentCode) streams correctly
- [ ] Code tab shows live typing during stream
- [ ] Preview updates (debounced) during stream when possible
- [ ] Final code is post-processed (no markdown, ASSISTANT_REPLY stripped)
- [ ] Non-streaming (`stream: false`) still works
- [ ] OpenAI and Anthropic models both stream
- [ ] AbortController cancels request on new generate/iterate
- [ ] Error from API surfaces to user
- [ ] Skeleton shows when generating with no code
- [ ] Error boundary catches render failures
