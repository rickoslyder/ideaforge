# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IdeaForge is a three-phase idea development tool that transforms rough concepts into implementation-ready plans through structured LLM collaboration. Key features include multi-model simultaneous inference, cherry-pick merging with coherence validation, and offline-first persistence.

**Status**: Architecture and specification complete, implementation pending. See `spec.md` and `plan.md` for detailed requirements.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Databases**: Supabase (PostgreSQL) + IndexedDB (Dexie.js) for offline-first
- **Auth**: Clerk
- **State**: React Query (server state) + Zustand (UI state)
- **LLM Providers**: OpenAI, Anthropic, Google Gemini, Ollama, custom LiteLLM-compatible

## Commands (Once Implemented)

```bash
# Development
npm install
npm run dev

# Testing
npm run test          # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)

# Build
npm run build
npm run start
```

## Architecture

### Three-Phase Workflow
1. **Request Phase**: Collaborative chat refines idea into structured request
2. **Spec Phase**: Configurable section generation with detail levels
3. **Plan Phase**: Step-by-step implementation plan with file listings

### Data Flow
```
Local writes → IndexedDB (Dexie.js) → Background sync → Supabase
                    ↓
              Optimistic UI updates
```

### Key Directory Structure (Planned)
```
/app
├── (auth)/             # Clerk auth routes
├── (dashboard)/        # Main app (projects, settings)
└── api/                # LLM proxy, extraction, sync endpoints

/components
├── ui/                 # shadcn/ui primitives
├── chat/               # Chat interface
├── comparison/         # Multi-model comparison
├── phases/             # Phase-specific (request, spec, plan)
└── sync/               # Sync status, conflict resolution

/lib
├── db/                 # Supabase client & queries
├── local-db/           # Dexie.js schema & hooks
├── llm/                # Provider abstraction layer
├── sync/               # Sync engine
└── parsers/            # Structured output parsing

/prompts                # System prompts for each phase
/stores                 # Zustand stores
/hooks                  # Custom React hooks
/types                  # TypeScript definitions
```

## Implementation Guidelines

### LLM Integration
- All LLM calls go through `/api/llm/chat` which handles key decryption and provider routing
- Stream responses using `ReadableStream` for real-time UI updates
- API keys stored encrypted in Supabase, decrypted only server-side

### Structured Output Parsing
- LLMs don't always follow format—implement retry/repair logic in `/lib/parsers/`
- Extract `\`\`\`request` blocks from chat responses
- Parse specs into sections for cherry-pick functionality

### Offline-First Sync
- All data operations write to IndexedDB first
- Sync queue tracks pending changes with retry logic
- Conflict resolution compares `updated_at` timestamps

### Multi-Model Comparison
- Parallel `fetch` calls with `AbortController` for cancellation
- Dynamic grid: 2 models = 50/50, 3 = 33/33/33, 4+ = 2×N grid
- Cherry-pick uses Gemini 2.5 Flash Lite as coherence judge

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ENCRYPTION_SECRET          # For API key encryption
CLERK_WEBHOOK_SECRET       # Optional: for user sync
NEXT_PUBLIC_POSTHOG_KEY    # Optional: analytics
```

## Implementation Plan Reference

The implementation is organized into 44 steps across 18 phases. See `plan.md` for the complete breakdown with dependencies and file listings per step.
