# WR Donor Companion — Project Context

**What it is:** A password-gated mockup of the "AI Decision Companion," a donor-initiated conversational guide for World Relief. Built as the tangible demo artifact for the WR / Gates Foundation proposal.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · `@anthropic-ai/sdk`
**Path:** `~/Documents/Claude/wr-donor-companion/`
**Deploy:** Local only (Vercel-ready). Do not push to GitHub or deploy publicly until Joel reviews.

## Architecture
- `app/page.tsx` — routes between password gate and chat UI (sessionStorage unlock)
- `app/api/unlock/route.ts` — validates password server-side against `DEMO_PASSWORD`
- `app/api/chat/route.ts` — streams Claude Sonnet 4.6 responses with WR system prompt
- `components/PasswordGate.tsx` — entry screen
- `components/ChatUI.tsx` — chat interface with streaming, suggested questions, lock button
- `lib/wr-knowledge.ts` — full WR knowledge base + system prompt (single source of truth)

## Environment
`.env.local` contains:
- `ANTHROPIC_API_KEY` — Joel's key, never in source
- `DEMO_PASSWORD` — "World Relief 80"

## Brand
WR navy `#003865`, WR blue `#0068a8`, sand `#f5efe6`, cream `#faf7f2`. Playfair Display for display, Inter for body. Clean, faith-grounded, photography-forward.

## Extending the knowledge base
Edit `lib/wr-knowledge.ts` — `WR_SYSTEM_PROMPT` is the single system prompt. Suggested questions live in `SUGGESTED_QUESTIONS` in the same file.

## Run
```
npm install
npm run dev
```
Open http://localhost:3000, enter "World Relief 80".

## Known limitations (by design, basic mockup)
- Password is client-triggered via server check, but not a real auth layer. Don't use for anything with real user data.
- No persistence; each session starts fresh.
- No analytics or fundraiser-specific link personalization yet (that's the Gates pilot scope).
- System prompt encodes facts as of April 2026 scrape of worldrelief.org. Needs refresh before real donor use.
