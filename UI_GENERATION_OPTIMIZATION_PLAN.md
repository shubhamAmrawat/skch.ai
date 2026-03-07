# UI Generation Response Time — Research & Optimization Plan

> **Purpose:** Research document to reduce perceived and actual response time for sketch-to-code UI generation and refinement. No implementation yet — this is a planning document.

---

## 1. Current Architecture Assessment

### 1.1 Flow Overview

```
User draws → Export canvas (scale: 2, PNG) → Base64 encode → POST /api/generate
→ aiController.buildMessages() → OpenAI/Anthropic API (non-streaming)
→ Full response → Post-process (extract code, clean) → Return JSON → Client renders
```

### 1.2 Identified Bottlenecks

| Bottleneck | Location | Impact |
|------------|----------|--------|
| **No streaming** | Server + Client | User waits for entire generation (often 15–45+ seconds) with no incremental feedback |
| **Large image payload** | Client → Server | Canvas exported at `scale: 2`, full base64 PNG; increases upload time and token count |
| **Image detail: "high"** | `prompts.js` | Every image uses `detail: "high"` → more vision tokens, slower processing |
| **Large system prompts** | `prompts.js` | SYSTEM_PROMPT ~15k+ chars; ITERATION_PROMPT also substantial → more tokens, slower prefill |
| **max_tokens: 16384** | `aiController.js` | Model may generate up to 16k tokens; no early stopping for shorter outputs |
| **Heavy models by default** | Header model options | gpt-4o, Claude Sonnet/Opus are slower; gpt-4o-mini exists but may be underused |
| **No prompt caching optimization** | Prompts structure | Static content not necessarily at prefix; variable content (image) in middle |
| **Synchronous post-processing** | aiController | `extractAssistantReply`, `cleanCodeResponse`, `replaceBrokenPlaceholderUrls` run after full response |

### 1.3 Current Models

- **GPT-4o** — High quality, slower
- **GPT-4o Mini** — Faster, good for drafts
- **Claude Sonnet 4.6** — High quality, slower
- **Claude Opus 4.6** — Highest quality, slowest

*Note: Claude Haiku 4.5 is not in the model list but is 4–5x faster than Sonnet for similar tasks.*

---

## 2. Industry Best Practices (2024–2025)

### 2.1 Streaming (Primary UX Lever)

**What:** Return tokens as they are generated instead of waiting for the full response.

**Why it matters:**
- **Perceived latency:** Users see output within ~1–3 seconds (time to first token) instead of 15–45 seconds
- **Engagement:** Similar to ChatGPT’s typing effect; feels responsive
- **Interruptibility:** Users can cancel mid-generation if needed

**Who does it:**
- **v0 (Vercel):** Uses streaming for UI generation
- **Cursor / Copilot:** Stream code token-by-token
- **ChatGPT:** Typing effect via streaming

**APIs:**
- **OpenAI:** `stream: true` on `chat.completions.create` → Server-Sent Events (SSE)
- **Anthropic:** `stream: true` on `messages.create` → SSE

### 2.2 v0-Specific Optimizations (Vercel)

From [Vercel’s v0 blog](https://vercel.com/blog/how-we-made-v0-an-effective-coding-agent):

1. **Fast streaming model** — `v0-1.0-md` for low-latency output
2. **Token efficiency** — Replace long strings (e.g. storage URLs) with short tokens before sending to LLM, then map back after streaming
3. **Dynamic system prompts** — Inject targeted knowledge via embeddings/keywords instead of huge static prompts → better prompt-cache hits
4. **Auto-fix during streaming** — Detect and correct coding errors in real time as the model streams

### 2.3 Prompt Caching (OpenAI)

- **Automatic** for prompts ≥1024 tokens
- **Up to ~80% latency reduction** and ~90% input cost reduction on cache hits
- **Structure:** Put static content (system prompt, instructions) at the **beginning**; variable content (image, user message) at the **end**
- **`prompt_cache_key`** — Use for routing when many requests share the same prefix
- **Images:** Must be identical for cache hit; `detail` affects tokenization

### 2.4 Image Optimization

- **Detail level:** `low` vs `high` — `low` uses fewer tokens and is faster; `high` for complex layouts
- **Compression:** Compress before base64 (e.g. WebP, JPEG quality 80–85)
- **Resolution:** For wireframes, 1024px or 1280px max dimension often sufficient
- **Format:** WebP can be 25–35% smaller than JPEG; AVIF even more

### 2.5 Model Selection

| Model | Speed | Quality | Best for |
|-------|-------|---------|----------|
| GPT-4o Mini | Fast | Good | Initial drafts, simple UIs |
| Claude Haiku 4.5 | Very fast | Good | Real-time iteration |
| GPT-4o | Medium | High | Complex layouts, refinement |
| Claude Sonnet/Opus | Slower | Highest | Final polish, complex designs |

### 2.6 Two-Phase Generation

1. **Phase 1:** Fast model (e.g. gpt-4o-mini) → quick draft in ~5–10 seconds
2. **Phase 2 (optional):** User refines, or auto-upgrade with heavier model for polish

---

## 3. Optimization Strategies (Prioritized)

### Tier 1 — Highest Impact, Moderate Effort

#### 3.1 Implement Streaming

**Effort:** Medium  
**Impact:** Very high (perceived latency)

**Changes:**
- **Server:** Use `stream: true` for OpenAI and Anthropic; return SSE instead of JSON
- **Client:** Consume `ReadableStream` / `fetch` with `response.body`, parse SSE chunks, accumulate code
- **Preview:** Render partial code in LivePreview as it streams (with debouncing to avoid flicker)
- **Fallback:** Keep non-streaming path for clients that don’t support streaming

**Considerations:**
- Code may be invalid until complete (e.g. unclosed tags) → need robust preview (ignore parse errors, show last valid state)
- `extractAssistantReply` and `cleanCodeResponse` must run on the final concatenated string

#### 3.2 Optimize Image Payload

**Effort:** Low–Medium  
**Impact:** High (upload + processing)

**Changes:**
- **Client:** Compress image before base64 (e.g. `browser-image-compression` or canvas `toBlob` with quality)
- **Client:** Consider `scale: 1` or `scale: 1.5` for wireframes; reserve `scale: 2` for high-fidelity
- **Server/prompts:** Add `detail: "low"` option for simple sketches; use `"high"` only when needed
- **Format:** Prefer WebP or JPEG for wireframes (PNG is larger)

**Target:** Reduce image payload by ~50–70%.

#### 3.3 Add Claude Haiku as “Fast” Option

**Effort:** Low  
**Impact:** Medium–High

**Changes:**
- Add `claude-3-5-haiku-20241022` or `claude-sonnet-4-20250514` (or latest Haiku) to model dropdown
- Label as “Fast” or “Draft” so users know it’s for speed
- Optionally: default to Haiku for initial generation, Sonnet/Opus for refinement

---

### Tier 2 — High Impact, Higher Effort

#### 3.4 Restructure Prompts for Caching

**Effort:** Medium  
**Impact:** High on repeat requests (e.g. refinement)

**Changes:**
- Put **system prompt** first (already done)
- Put **static instructions** before the image
- Put **image + variable user content** at the end
- Use consistent `prompt_cache_key` for requests that share the same system/iteration prompt
- Consider splitting SYSTEM_PROMPT: keep core rules, move long examples to a separate “reference” block if possible

#### 3.5 Reduce max_tokens Where Appropriate

**Effort:** Low  
**Impact:** Medium

**Changes:**
- Initial generation: keep 8192–16384 (full UIs can be large)
- Text iteration (refinement): often 2048–4096 is enough
- Add `max_tokens` per request type in the controller

#### 3.6 Progressive Preview During Streaming

**Effort:** Medium  
**Impact:** High (perceived quality)

**Changes:**
- As code streams in, update LivePreview every N characters or every N ms (debounced)
- Handle incomplete JSX (e.g. wrap in error boundary, show “generating…” for invalid chunks)
- Option: only update preview when a complete `</` or `/>` block is received to reduce invalid states

---

### Tier 3 — Nice to Have

#### 3.7 Two-Phase Generation (Draft → Polish)

**Effort:** High  
**Impact:** Medium–High

**Flow:**
1. User clicks Generate → fast model returns draft in ~5–10 s
2. Show draft immediately
3. Option A: Background job runs heavier model for polish, then replaces
4. Option B: User explicitly clicks “Enhance” to run heavier model

#### 3.8 Skeleton / Optimistic UI

**Effort:** Low  
**Impact:** Low–Medium (perceived)

**Changes:**
- Show skeleton layout (e.g. gray blocks) immediately when Generate is clicked
- Transition to real preview when first chunk arrives
- Improves perceived responsiveness even before streaming

#### 3.9 Request Deduplication & Debouncing

**Effort:** Low  
**Impact:** Low (edge cases)

- Debounce rapid “Generate” clicks
- Cancel previous request if user triggers a new one (e.g. with AbortController)

---

## 4. Implementation Roadmap

### Phase 1 — Quick Wins (1–2 weeks)

1. **Image optimization** — Compress, reduce scale for wireframes, add `detail: "low"` path
2. **Add Claude Haiku** — New model option, document as “Fast”
3. **Reduce max_tokens for iterations** — 4096 for text-only refinement
4. **Prompt structure** — Reorder for cache-friendly layout (static first, variable last)

### Phase 2 — Streaming (2–3 weeks) — *See STREAMING_IMPLEMENTATION_PLAN.md*

1. **Server:** Implement SSE streaming for `/api/generate`
2. **Client:** Consume stream, accumulate code, update state incrementally
3. **Preview:** Debounced progressive preview during stream
4. **Post-processing:** Run `extractAssistantReply` and `cleanCodeResponse` on final string
5. **Error handling:** Timeouts, partial failures, fallback to non-streaming

### Phase 3 — Polish (1–2 weeks) — *See STREAMING_IMPLEMENTATION_PLAN.md*

1. **Progressive preview robustness** — Handle incomplete code, error boundaries
2. **Skeleton UI** — Optional loading skeleton
3. **Metrics** — Log time-to-first-token, total time, token usage for tuning

> **Detailed implementation plan for Phase 2 & 3:** See [STREAMING_IMPLEMENTATION_PLAN.md](./STREAMING_IMPLEMENTATION_PLAN.md) for step-by-step tasks, API contract, and file-level changes.

---

## 5. Expected Outcomes

| Optimization | Expected Latency Improvement | Notes |
|--------------|------------------------------|-------|
| Streaming | **Perceived: 80–90%** (TTFT ~1–3s vs 15–45s) | Actual total time similar; UX much better |
| Image optimization | **10–25%** | Fewer tokens, faster upload |
| Haiku / Mini for drafts | **40–60%** | For initial generation |
| Prompt caching | **Up to 80%** on cache hits | Refinement, repeated prompts |
| max_tokens reduction | **5–15%** | For short refinements |

---

## 6. Technical References

- [OpenAI Streaming](https://platform.openai.com/docs/guides/streaming)
- [OpenAI Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)
- [Anthropic Streaming](https://docs.anthropic.com/en/docs/build-with-claude/streaming)
- [v0 API / How we made v0](https://vercel.com/blog/how-we-made-v0-an-effective-coding-agent)
- [Fetch + Streams API for faster GenAI UX](https://philna.sh/blog/2024/08/22/fetch-streams-api-for-faster-ux-generative-ai-apps/)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)

---

## 7. Summary

The largest gain will come from **streaming**: users see output within seconds instead of waiting for the full response. Image optimization and faster models (Haiku, Mini) will reduce actual latency. Prompt caching and `max_tokens` tuning will help on refinement and repeated requests.

Recommended order: **Streaming first**, then **image + model + prompt optimizations**, then **progressive preview polish**.
