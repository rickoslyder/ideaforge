<specification_planning>

## 1. Core System Architecture and Key Workflows

**Architecture Pattern**: Next.js App Router with hybrid rendering (RSC for data-heavy pages, client components for interactive features). Local-first data layer using IndexedDB with Supabase sync.

**Key Workflows**:
1. **Project Creation Flow**: User creates project → enters Request phase → iterates with LLM → marks complete → advances to Spec → configures sections → generates → advances to Plan → generates implementation steps
2. **Multi-Model Comparison Flow**: User selects N models → parallel API calls → streaming responses → side-by-side display → user selects/cherry-picks → optional coherence validation → final output saved
3. **Sync Flow**: Local writes to IndexedDB → background sync to Supabase → conflict detection → user resolution UI
4. **Attachment Flow**: File upload → chunking if large → storage in Supabase Storage → content extraction (PDF/DOCX) → embedding in context

**Challenges**:
- Streaming multiple LLM responses simultaneously while maintaining UI responsiveness
- Structured output parsing mid-stream vs waiting for completion
- Context window management for long conversations
- Offline-first with reliable conflict resolution

## 2. Project Structure and Organization

```
/
├── app/
│   ├── (auth)/                    # Auth routes (Clerk)
│   ├── (dashboard)/               # Main app routes
│   │   ├── projects/
│   │   │   ├── page.tsx           # Project list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Project view (redirects to current phase)
│   │   │   │   ├── request/       # Request phase
│   │   │   │   ├── spec/          # Spec phase
│   │   │   │   └── plan/          # Plan phase
│   │   └── settings/              # User settings, API keys
│   ├── api/
│   │   ├── llm/                   # LLM proxy endpoints
│   │   ├── extract/               # URL/file content extraction
│   │   ├── webhooks/              # Clerk webhooks
│   │   └── sync/                  # Supabase sync endpoints
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── chat/                      # Chat interface components
│   ├── editor/                    # Markdown editor components
│   ├── comparison/                # Multi-model comparison UI
│   ├── attachments/               # File upload, URL paste
│   └── phases/                    # Phase-specific components
├── lib/
│   ├── db/                        # Supabase client, queries
│   ├── local-db/                  # IndexedDB (Dexie.js)
│   ├── sync/                      # Sync engine
│   ├── llm/                       # LLM provider abstractions
│   ├── parsers/                   # Structured output parsing
│   ├── pricing/                   # Cost estimation
│   └── utils/
├── hooks/                         # Custom React hooks
├── types/                         # TypeScript types
└── prompts/                       # System prompts for each phase
```

## 3. Detailed Feature Specifications

**Request Phase**:
- Chat interface with streaming responses
- Regex-based extraction of ```request blocks from responses
- Ability to edit extracted request manually
- Context includes all previous messages + any attachments

**Spec Phase**:
- Section configuration UI (checkboxes, detail level dropdowns, drag-drop reorder)
- Per-section guidance text fields
- System prompt dynamically constructed from configuration
- Output parsed into structured sections for downstream use

**Plan Phase**:
- Takes request + spec as input
- Generates implementation steps with file lists
- Checkbox UI for tracking progress (future: integration with code agents)

**Simultaneous Inference**:
- UI to select multiple models (chips/multiselect)
- Parallel fetch calls with AbortController for cancellation
- Dynamic grid layout based on count (2: 50/50, 3: 33/33/33, 4+: 2xN grid)
- Each column shows streaming response
- "Use this" button per column, or cherry-pick mode

**Cherry-Pick & Coherence**:
- Section-level selection (highlight sections, click to toggle inclusion)
- Merge preview panel
- "Validate" button triggers coherence judge call
- Two modes: auto-smooth (returns fixed version) vs highlight-issues (returns list of problems)

## 4. Database Schema Design

**Core Tables**:
- `users` (Clerk-managed, we store additional preferences)
- `projects` (id, user_id, name, current_phase, created_at, updated_at)
- `project_snapshots` (id, project_id, snapshot_data JSONB, created_at)
- `messages` (id, project_id, phase, role, content, model, tokens_used, cost, created_at)
- `attachments` (id, project_id, type, name, storage_path, extracted_content, created_at)
- `api_keys` (id, user_id, provider, encrypted_key, endpoint_url, created_at)
- `spec_configs` (id, project_id, sections JSONB, created_at)

**Sync Considerations**:
- All tables have `local_id`, `remote_id`, `sync_status`, `last_synced_at`
- Conflict detection via `updated_at` comparison
- Soft deletes with `deleted_at` for sync consistency

## 5. Server Actions and Integrations

**LLM Proxy** (`/api/llm/chat`):
- Accepts provider, model, messages, stream flag
- Decrypts API key from DB
- Routes to appropriate provider SDK
- Streams response via ReadableStream
- Logs token usage and cost

**Content Extraction** (`/api/extract`):
- URL extraction: Jina Reader API (r.jina.ai/{url}) or fallback to fetch + cheerio
- File extraction: pdf-parse for PDFs, mammoth for DOCX, raw text for others
- Returns extracted text + metadata

**Pricing Data**:
- Fetch LiteLLM's model_prices_and_context_window.json on app start
- Cache in memory with 24h TTL
- Expose via `/api/pricing` for client-side estimation

## 6. Design System and Component Architecture

**Visual Style**:
- Minimal, typography-focused (Inter for UI, JetBrains Mono for code)
- Dark mode default, system preference detection
- Muted color palette with accent for actions
- Generous whitespace, readable line lengths

**Core Components**:
- `ChatInterface`: Messages list, input area, streaming indicator
- `ComparisonGrid`: Dynamic columns/grid, resize handles
- `SectionConfigurator`: Drag-drop list with per-item controls
- `PhaseIndicator`: Horizontal stepper showing Request → Spec → Plan
- `AttachmentManager`: Upload dropzone, URL input, list of attachments
- `SnapshotTimeline`: Vertical timeline of snapshots with restore buttons

## 7. Authentication and Authorization

- Clerk handles all auth (sign-up, sign-in, session management)
- Middleware protects all `/projects/*` and `/settings/*` routes
- User ID from Clerk session used for all DB queries
- API keys encrypted with user-specific key derived from Clerk user ID + app secret

## 8. Data Flow and State Management

**Local-First Pattern**:
1. All writes go to IndexedDB (Dexie.js) first
2. Optimistic UI updates immediately
3. Background sync worker pushes to Supabase
4. Periodic pull for changes from other devices
5. Conflicts surface in UI for resolution

**State Management**:
- React Query for server state (with IndexedDB as cache)
- Zustand for UI state (selected models, comparison mode, etc.)
- URL state for phase navigation

## 9. Payment Implementation
N/A - excluded from scope

## 10. Analytics Implementation

**PostHog** (optional, can be disabled):
- Project created/completed events
- Phase transitions
- Model usage (provider, model, tokens)
- Feature usage (multi-model, cherry-pick, attachments)
- No PII, user ID hashed

## 11. Testing Strategy

**Unit Tests** (Vitest):
- Structured output parsers
- Cost estimation calculations
- Sync conflict resolution logic

**Integration Tests** (Vitest + MSW):
- LLM proxy with mocked provider responses
- Content extraction pipelines
- Sync engine with mock Supabase

**E2E Tests** (Playwright):
- Full project creation flow
- Multi-model comparison and selection
- Offline mode and sync recovery

</specification_planning>

---

```markdown
# IdeaForge Technical Specification

## 1. System Overview

### Core Purpose and Value Proposition
IdeaForge is a three-phase idea development tool that transforms rough concepts into implementation-ready plans through structured LLM-powered collaboration. It uniquely supports multi-model simultaneous inference, enabling users to compare outputs across providers and cherry-pick the best sections with AI-powered coherence validation.

### Key Workflows

**Primary Workflow: Idea → Plan**
1. User creates a new project with initial idea
2. **Request Phase**: Collaborative chat refines the idea into a structured project request
3. **Spec Phase**: Configurable technical specification generation with section customization
4. **Plan Phase**: Step-by-step implementation plan with file-level task breakdown

**Multi-Model Comparison Workflow**
1. User selects N models for parallel inference
2. System executes simultaneous streaming requests
3. Dynamic UI displays outputs side-by-side (columns) or in grid (4+ models)
4. User either selects a single output or enters cherry-pick mode
5. Cherry-picked sections are merged and validated by coherence judge
6. Final output saved to project

**Offline-First Sync Workflow**
1. All data persists to IndexedDB immediately
2. Background sync pushes changes to Supabase when online
3. Pull syncs detect remote changes
4. Conflicts surface in UI with diff view for user resolution

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Zustand   │  │ React Query │  │      Dexie.js           │  │
│  │  (UI State) │  │(Server Sync)│  │  (IndexedDB Local DB)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Sync Engine (Background)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │   Supabase      │     │   LLM Providers │
          │  (PostgreSQL +  │     │  (OpenAI, etc.) │
          │    Storage)     │     │                 │
          └─────────────────┘     └─────────────────┘
```

## 2. Project Structure

```
ideaforge/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Authenticated layout with nav
│   │   ├── page.tsx                      # Dashboard home (redirect to projects)
│   │   ├── projects/
│   │   │   ├── page.tsx                  # Project list
│   │   │   ├── new/page.tsx              # New project creation
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx              # Project overview (redirects to phase)
│   │   │       ├── request/page.tsx      # Request phase chat
│   │   │       ├── spec/
│   │   │       │   ├── page.tsx          # Spec phase main view
│   │   │       │   └── configure/page.tsx # Section configuration
│   │   │       ├── plan/page.tsx         # Plan phase view
│   │   │       ├── snapshots/page.tsx    # Version history
│   │   │       └── layout.tsx            # Project-level layout with phase nav
│   │   └── settings/
│   │       ├── page.tsx                  # General settings
│   │       ├── api-keys/page.tsx         # API key management
│   │       └── models/page.tsx           # Model configuration
│   ├── api/
│   │   ├── llm/
│   │   │   ├── chat/route.ts             # Main LLM chat endpoint
│   │   │   ├── models/route.ts           # Available models list
│   │   │   └── pricing/route.ts          # Pricing data endpoint
│   │   ├── extract/
│   │   │   ├── url/route.ts              # URL content extraction
│   │   │   └── file/route.ts             # File content extraction
│   │   ├── sync/
│   │   │   ├── push/route.ts             # Push local changes
│   │   │   ├── pull/route.ts             # Pull remote changes
│   │   │   └── resolve/route.ts          # Conflict resolution
│   │   └── webhooks/
│   │       └── clerk/route.ts            # Clerk webhook handler
│   ├── globals.css
│   └── layout.tsx                        # Root layout
├── components/
│   ├── ui/                               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── tooltip.tsx
│   ├── chat/
│   │   ├── chat-interface.tsx            # Main chat container
│   │   ├── message-list.tsx              # Message display
│   │   ├── message-bubble.tsx            # Individual message
│   │   ├── chat-input.tsx                # Input with send button
│   │   ├── streaming-indicator.tsx       # Typing/streaming UI
│   │   └── request-preview.tsx           # Extracted request block preview
│   ├── comparison/
│   │   ├── comparison-container.tsx      # Main comparison layout
│   │   ├── model-selector.tsx            # Multi-model selection UI
│   │   ├── comparison-column.tsx         # Single model output column
│   │   ├── comparison-grid.tsx           # Grid layout for 4+ models
│   │   ├── cherry-pick-panel.tsx         # Section selection UI
│   │   ├── merge-preview.tsx             # Merged output preview
│   │   └── coherence-result.tsx          # Validation result display
│   ├── editor/
│   │   ├── markdown-editor.tsx           # Editable markdown with preview
│   │   ├── markdown-preview.tsx          # Read-only rendered markdown
│   │   └── code-block.tsx                # Syntax-highlighted code
│   ├── attachments/
│   │   ├── attachment-manager.tsx        # Full attachment UI
│   │   ├── file-dropzone.tsx             # Drag-drop file upload
│   │   ├── url-input.tsx                 # URL paste with extraction
│   │   ├── text-context-input.tsx        # Plain text context field
│   │   └── attachment-list.tsx           # List of attached items
│   ├── phases/
│   │   ├── phase-indicator.tsx           # Horizontal stepper
│   │   ├── phase-navigation.tsx          # Phase nav buttons
│   │   ├── request-phase.tsx             # Request phase container
│   │   ├── spec-phase.tsx                # Spec phase container
│   │   ├── spec-configurator.tsx         # Section configuration UI
│   │   ├── section-item.tsx              # Draggable section config
│   │   └── plan-phase.tsx                # Plan phase container
│   ├── projects/
│   │   ├── project-card.tsx              # Project list item
│   │   ├── project-list.tsx              # Project grid/list
│   │   └── new-project-form.tsx          # Project creation form
│   ├── snapshots/
│   │   ├── snapshot-timeline.tsx         # Vertical timeline
│   │   ├── snapshot-card.tsx             # Individual snapshot
│   │   └── snapshot-diff.tsx             # Diff viewer (if implemented)
│   ├── settings/
│   │   ├── api-key-form.tsx              # Add/edit API key
│   │   ├── api-key-list.tsx              # List of configured keys
│   │   ├── model-defaults.tsx            # Default model selection
│   │   └── provider-config.tsx           # Provider-specific settings
│   ├── sync/
│   │   ├── sync-status.tsx               # Sync indicator in nav
│   │   ├── conflict-dialog.tsx           # Conflict resolution modal
│   │   └── offline-banner.tsx            # Offline mode indicator
│   └── layout/
│       ├── nav-header.tsx                # Top navigation
│       ├── sidebar.tsx                   # Side navigation
│       ├── mobile-nav.tsx                # Mobile navigation
│       └── theme-toggle.tsx              # Dark/light mode switch
├── lib/
│   ├── db/
│   │   ├── client.ts                     # Supabase client singleton
│   │   ├── queries/
│   │   │   ├── projects.ts               # Project CRUD
│   │   │   ├── messages.ts               # Message queries
│   │   │   ├── attachments.ts            # Attachment queries
│   │   │   ├── api-keys.ts               # API key queries
│   │   │   └── snapshots.ts              # Snapshot queries
│   │   └── types.ts                      # Database types
│   ├── local-db/
│   │   ├── client.ts                     # Dexie.js instance
│   │   ├── schema.ts                     # IndexedDB schema
│   │   ├── hooks.ts                      # React hooks for local DB
│   │   └── migrations.ts                 # Schema migrations
│   ├── sync/
│   │   ├── engine.ts                     # Core sync logic
│   │   ├── conflict-resolver.ts          # Conflict detection/resolution
│   │   ├── queue.ts                      # Sync queue management
│   │   └── hooks.ts                      # useSyncStatus, etc.
│   ├── llm/
│   │   ├── providers/
│   │   │   ├── openai.ts                 # OpenAI provider
│   │   │   ├── anthropic.ts              # Anthropic provider
│   │   │   ├── google.ts                 # Google Gemini provider
│   │   │   ├── ollama.ts                 # Ollama provider
│   │   │   └── custom.ts                 # Custom LiteLLM-compatible
│   │   ├── client.ts                     # Unified LLM client
│   │   ├── streaming.ts                  # Stream handling utilities
│   │   └── types.ts                      # Provider types
│   ├── parsers/
│   │   ├── request-block.ts              # Extract ```request blocks
│   │   ├── spec-sections.ts              # Parse spec into sections
│   │   ├── plan-steps.ts                 # Parse plan into steps
│   │   └── retry-repair.ts               # Retry/repair logic for parsing
│   ├── pricing/
│   │   ├── fetch.ts                      # Fetch LiteLLM pricing data
│   │   ├── estimate.ts                   # Cost estimation logic
│   │   ├── cache.ts                      # Pricing data cache
│   │   └── types.ts                      # Pricing types
│   ├── extraction/
│   │   ├── url.ts                        # URL content extraction
│   │   ├── pdf.ts                        # PDF text extraction
│   │   ├── docx.ts                       # DOCX text extraction
│   │   └── chunker.ts                    # Large file chunking
│   ├── crypto/
│   │   └── api-keys.ts                   # Encryption/decryption
│   └── utils/
│       ├── cn.ts                         # Class name utility
│       ├── tokens.ts                     # Token counting
│       └── formatters.ts                 # Date, cost formatters
├── hooks/
│   ├── use-chat.ts                       # Chat state management
│   ├── use-comparison.ts                 # Multi-model comparison state
│   ├── use-project.ts                    # Current project state
│   ├── use-phase.ts                      # Phase management
│   ├── use-attachments.ts                # Attachment management
│   ├── use-models.ts                     # Available models
│   ├── use-cost-estimate.ts              # Cost estimation
│   └── use-offline.ts                    # Offline detection
├── stores/
│   ├── ui-store.ts                       # UI state (Zustand)
│   ├── comparison-store.ts               # Comparison mode state
│   └── sync-store.ts                     # Sync status state
├── types/
│   ├── project.ts                        # Project types
│   ├── message.ts                        # Message types
│   ├── attachment.ts                     # Attachment types
│   ├── llm.ts                            # LLM types
│   ├── spec.ts                           # Spec configuration types
│   └── sync.ts                           # Sync types
├── prompts/
│   ├── request-phase.ts                  # Request phase system prompt
│   ├── spec-phase.ts                     # Spec phase system prompt builder
│   ├── plan-phase.ts                     # Plan phase system prompt
│   └── coherence-judge.ts                # Coherence validation prompt
├── middleware.ts                          # Clerk auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── docker-compose.yml                     # Self-hosted deployment
├── Dockerfile
└── .env.example
```

## 3. Feature Specification

### 3.1 Project Management

**User Story**: As a user, I want to create, view, and manage my idea projects so I can track multiple ideas through the development pipeline.

**Implementation Steps**:
1. Project list page queries IndexedDB (with React Query) for all user projects
2. New project form captures name and initial idea text
3. Project creation writes to IndexedDB, triggers background sync
4. Project card shows name, current phase, last updated, progress indicator
5. Clicking project navigates to current phase (stored in project record)
6. Delete project soft-deletes (sets deleted_at), syncs deletion

**Error Handling**:
- Failed sync: Queue retry with exponential backoff, show warning icon
- IndexedDB unavailable: Fall back to in-memory with warning
- Name validation: Required, max 100 chars

### 3.2 Request Phase (Collaborative Chat)

**User Story**: As a user, I want to have a conversation with an LLM to refine my initial idea into a structured project request.

**Implementation Steps**:
1. Chat interface loads existing messages from local DB
2. User types message, clicks send (or Cmd+Enter)
3. System constructs prompt: system prompt + conversation history + user message
4. Streaming request to `/api/llm/chat` with selected model
5. Response streams into UI, appending to message list
6. On completion, parse response for ```request block
7. If found, display extracted request in sidebar preview
8. User can edit extracted request manually
9. "Mark Complete" button advances project to Spec phase, saves final request

**System Prompt** (stored in `/prompts/request-phase.ts`):
```typescript
export const REQUEST_PHASE_PROMPT = `You are helping the user develop their project idea into a detailed request.

After each exchange, return the current state of the request in this format:
\`\`\`request
# Project Name
## Project Description
[Description]
## Target Audience
[Target users]
## Desired Features
### [Feature Category]
- [ ] [Requirement]
    - [ ] [Sub-requirement]
## Design Requests
- [ ] [Design requirement]
    - [ ] [Design detail]
## Other Notes
- [Additional considerations]
\`\`\`

Guidelines:
1. Ask clarifying questions about areas needing detail
2. Suggest features or considerations the user might have missed
3. Help organize requirements logically
4. Flag potential technical challenges or important decisions
5. Keep iterating until the user indicates completion`;
```

**Error Handling**:
- Stream interruption: Show "Connection lost" with retry button
- Rate limiting: Display provider-specific error, suggest waiting
- Context too long: Implement sliding window, summarize older messages

### 3.3 Spec Phase (Technical Specification)

**User Story**: As a user, I want to generate a detailed technical specification with configurable sections and detail levels.

**Implementation Steps**:
1. Load spec configuration from DB (or initialize defaults)
2. Display section configurator with:
   - Checkbox for inclusion/exclusion
   - Detail level dropdown (brief/standard/comprehensive)
   - Drag handle for reordering
   - Text field for section-specific guidance
   - Code examples toggle
3. "Attach Context" section for files, URLs, text
4. "Generate" button constructs dynamic prompt and calls LLM
5. Display generated spec with section navigation
6. Allow regeneration with modified settings
7. "Mark Complete" advances to Plan phase

**Default Sections**:
```typescript
export const DEFAULT_SPEC_SECTIONS: SpecSection[] = [
  { id: 'system-overview', name: 'System Overview', included: true, detailLevel: 'standard', guidance: '' },
  { id: 'project-structure', name: 'Project Structure', included: true, detailLevel: 'comprehensive', guidance: '' },
  { id: 'feature-spec', name: 'Feature Specification', included: true, detailLevel: 'comprehensive', guidance: '' },
  { id: 'database-schema', name: 'Database Schema', included: true, detailLevel: 'comprehensive', guidance: '' },
  { id: 'server-actions', name: 'Server Actions', included: true, detailLevel: 'standard', guidance: '' },
  { id: 'design-system', name: 'Design System', included: true, detailLevel: 'standard', guidance: '' },
  { id: 'component-arch', name: 'Component Architecture', included: true, detailLevel: 'standard', guidance: '' },
  { id: 'auth', name: 'Authentication & Authorization', included: true, detailLevel: 'standard', guidance: '' },
  { id: 'data-flow', name: 'Data Flow', included: true, detailLevel: 'brief', guidance: '' },
  { id: 'payments', name: 'Payment Integration', included: false, detailLevel: 'standard', guidance: '' },
  { id: 'analytics', name: 'Analytics', included: false, detailLevel: 'brief', guidance: '' },
  { id: 'testing', name: 'Testing Strategy', included: true, detailLevel: 'standard', guidance: '' },
];
```

**Error Handling**:
- Large attachment: Chunk and summarize before including
- Generation timeout: Partial save, allow resume
- Invalid output structure: Retry with stricter formatting instructions

### 3.4 Plan Phase (Implementation Plan)

**User Story**: As a user, I want to receive a step-by-step implementation plan with file-level task breakdowns.

**Implementation Steps**:
1. Load request and spec from previous phases
2. Display read-only preview of inputs
3. "Generate Plan" button constructs prompt with full context
4. Streaming response displays plan with checkbox steps
5. Parse into structured steps with file lists
6. Allow regeneration with adjusted parameters

**Error Handling**:
- Missing spec: Prompt user to complete Spec phase first
- Overly long plan: Split into phases/milestones

### 3.5 Multi-Model Simultaneous Inference

**User Story**: As a user, I want to compare outputs from multiple LLMs side-by-side so I can choose the best response or combine sections.

**Implementation Steps**:
1. Model selector UI shows configured providers/models as chips
2. User selects 2-N models, clicks "Compare"
3. System estimates cost per model, shows total estimate
4. User confirms, parallel requests dispatched via `Promise.all`
5. Each column renders streaming response independently
6. Columns sized dynamically:
   - 2 models: 50/50 split
   - 3 models: 33/33/33 split
   - 4+ models: 2×N grid with scroll
7. Completion triggers per-column "Use This" button
8. Or user clicks "Cherry Pick" to enter selection mode

**Cherry-Pick Flow**:
1. Enable section highlighting across all columns
2. User clicks sections to toggle inclusion (visual highlight)
3. "Merge Preview" panel shows combined output
4. "Validate" button calls coherence judge
5. Judge returns either:
   - Auto-smooth mode: Revised coherent output
   - Highlight mode: List of issues with suggestions
6. User accepts or manually edits
7. Final output saved

**Coherence Judge Prompt**:
```typescript
export const COHERENCE_JUDGE_PROMPT = (mode: 'auto-smooth' | 'highlight') => `
You are evaluating a document assembled from multiple AI-generated sources.
Your task is to ${mode === 'auto-smooth' 
  ? 'rewrite the document to ensure logical coherence, consistent terminology, and smooth transitions between sections'
  : 'identify any inconsistencies, contradictions, or awkward transitions and list them with specific suggestions'}.

Original outputs used:
<output_1>
{output_1}
</output_1>

<output_2>
{output_2}
</output_2>

Assembled document:
<assembled>
{assembled}
</assembled>

${mode === 'auto-smooth' 
  ? 'Return the improved document with coherent flow.'
  : 'Return a JSON array of issues: [{"location": "section/paragraph", "issue": "description", "suggestion": "fix"}]'}
`;
```

**Error Handling**:
- One provider fails: Continue with others, show error in that column
- Rate limiting: Stagger requests slightly (50ms delay between)
- Merge results in incoherent output: Require validation before save

### 3.6 Version Snapshots

**User Story**: As a user, I want to save and restore previous versions of my project so I can experiment without losing work.

**Implementation Steps**:
1. Auto-snapshot on phase completion
2. Manual snapshot button in project header
3. Snapshots page shows timeline with metadata:
   - Timestamp, phase at snapshot, trigger (auto/manual)
4. "Preview" shows read-only view of snapshot
5. "Restore" copies snapshot data to current project state
6. Optional: Visual diff between snapshots (if low-maintenance)

**Visual Diff** (simplified implementation):
- Use `diff` library to compare markdown text
- Render additions in green, deletions in red
- Only for text content, not structural changes

### 3.7 Attachments and Context

**User Story**: As a user, I want to attach files, paste URLs, and add text context to provide additional information for spec generation.

**Implementation Steps**:
1. AttachmentManager component with three input modes:
   - File dropzone (drag-drop or click to browse)
   - URL input with "Extract" button
   - Text area for inline context
2. File upload:
   - Validate type (PDF, DOCX, TXT, MD, code files, images)
   - Validate size (≤100MB)
   - Upload to Supabase Storage
   - Trigger extraction pipeline
3. URL extraction:
   - Call `/api/extract/url` with URL
   - Uses Jina Reader API: `https://r.jina.ai/{encoded_url}`
   - Fallback: Direct fetch + cheerio parsing
   - Store extracted text and original URL
4. Attachments displayed as cards with preview
5. Include in LLM context based on phase needs

**File Extraction Pipeline**:
```typescript
async function extractFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  switch (file.type) {
    case 'application/pdf':
      const pdfData = await pdfParse(Buffer.from(buffer));
      return pdfData.text;
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return result.value;
    
    case 'text/plain':
    case 'text/markdown':
      return new TextDecoder().decode(buffer);
    
    default:
      // Attempt text decode for code files
      return new TextDecoder().decode(buffer);
  }
}
```

### 3.8 Cost Estimation

**User Story**: As a user, I want to see estimated costs before running expensive multi-model comparisons.

**Implementation Steps**:
1. Fetch LiteLLM pricing data on app load:
   ```typescript
   const PRICING_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';
   ```
2. Cache in memory with 24h TTL
3. Before generation, estimate tokens:
   - Count tokens in system prompt + messages + attachments
   - Use tiktoken for OpenAI, approximate for others
4. Calculate: `input_tokens × input_cost + estimated_output_tokens × output_cost`
5. Display per-model and total estimates
6. After completion, show actual cost with comparison

**Cost Display Component**:
```typescript
interface CostEstimate {
  model: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: number;
  actualCost?: number;
}
```

### 3.9 API Key Management

**User Story**: As a user, I want to securely store my API keys for multiple LLM providers.

**Implementation Steps**:
1. Settings page with provider list
2. Add key form: provider dropdown, key input (password field), optional endpoint URL
3. Before storage, encrypt key:
   ```typescript
   async function encryptApiKey(key: string, userId: string): Promise<string> {
     const encoder = new TextEncoder();
     const data = encoder.encode(key);
     const keyMaterial = await crypto.subtle.importKey(
       'raw',
       encoder.encode(process.env.ENCRYPTION_SECRET + userId),
       'PBKDF2',
       false,
       ['deriveKey']
     );
     const derivedKey = await crypto.subtle.deriveKey(
       { name: 'PBKDF2', salt: encoder.encode(userId), iterations: 100000, hash: 'SHA-256' },
       keyMaterial,
       { name: 'AES-GCM', length: 256 },
       false,
       ['encrypt']
     );
     const iv = crypto.getRandomValues(new Uint8Array(12));
     const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, data);
     return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(encrypted)));
   }
   ```
4. Store encrypted key in Supabase
5. Decrypt only on server-side when making LLM calls
6. Display masked key (last 4 chars only) in UI

### 3.10 Offline Support and Sync

**User Story**: As a user, I want to work offline and have my changes sync when I'm back online.

**Implementation Steps**:
1. All data operations write to IndexedDB first
2. Sync queue tracks pending changes
3. Online detection via `navigator.onLine` + periodic ping
4. When online, process sync queue:
   ```typescript
   async function processSyncQueue() {
     const pending = await db.syncQueue.toArray();
     for (const item of pending) {
       try {
         await pushToSupabase(item);
         await db.syncQueue.delete(item.id);
       } catch (error) {
         if (!isRetryable(error)) {
           await markAsFailed(item);
         }
       }
     }
   }
   ```
5. Pull changes periodically (every 30s when online)
6. Conflict detection: Compare `updated_at` timestamps
7. Conflict resolution UI:
   - Show both versions side-by-side
   - User selects "Keep Local", "Keep Remote", or manual merge

## 4. Database Schema

### 4.1 Tables

#### users
Managed by Clerk, we store additional preferences:
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  default_model TEXT DEFAULT 'gemini/gemini-2.5-flash-preview-05-20',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_clerk_id ON user_preferences(clerk_user_id);
```

#### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  initial_idea TEXT,
  current_phase TEXT DEFAULT 'request' CHECK (current_phase IN ('request', 'spec', 'plan')),
  request_content TEXT,          -- Final request from phase 1
  spec_content TEXT,             -- Final spec from phase 2
  spec_config JSONB,             -- Section configuration
  plan_content TEXT,             -- Final plan from phase 3
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  local_id TEXT,                 -- For sync
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_user ON projects(clerk_user_id);
CREATE INDEX idx_projects_sync ON projects(sync_status) WHERE deleted_at IS NULL;
```

#### messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('request', 'spec', 'plan')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,                    -- Model used for assistant messages
  provider TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE INDEX idx_messages_project_phase ON messages(project_id, phase);
CREATE INDEX idx_messages_created ON messages(created_at);
```

#### attachments
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('file', 'url', 'text')),
  name TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT,             -- Supabase Storage path
  source_url TEXT,               -- For URL type
  extracted_content TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

CREATE INDEX idx_attachments_project ON attachments(project_id);
```

#### api_keys
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'ollama', 'custom')),
  name TEXT,                     -- User-friendly name
  encrypted_key TEXT NOT NULL,
  endpoint_url TEXT,             -- For custom/Ollama
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_api_keys_user_provider ON api_keys(clerk_user_id, provider, name);
CREATE INDEX idx_api_keys_user ON api_keys(clerk_user_id);
```

#### project_snapshots
```sql
CREATE TABLE project_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL CHECK (trigger IN ('auto', 'manual')),
  phase_at_snapshot TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,  -- Full project state
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_project ON project_snapshots(project_id);
CREATE INDEX idx_snapshots_created ON project_snapshots(created_at DESC);
```

#### sync_queue (local only - IndexedDB)
```typescript
interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  localId: string;
  data: Record<string, any>;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}
```

### 4.2 IndexedDB Schema (Dexie.js)
```typescript
import Dexie, { Table } from 'dexie';

export interface LocalProject {
  localId: string;
  remoteId?: string;
  clerkUserId: string;
  name: string;
  initialIdea?: string;
  currentPhase: 'request' | 'spec' | 'plan';
  requestContent?: string;
  specContent?: string;
  specConfig?: SpecConfig;
  planContent?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
}

export interface LocalMessage {
  localId: string;
  remoteId?: string;
  projectLocalId: string;
  phase: 'request' | 'spec' | 'plan';
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  createdAt: Date;
  syncStatus: 'synced' | 'pending';
}

export class IdeaForgeDB extends Dexie {
  projects!: Table<LocalProject>;
  messages!: Table<LocalMessage>;
  attachments!: Table<LocalAttachment>;
  syncQueue!: Table<SyncQueueItem>;
  pricingCache!: Table<{ id: string; data: any; fetchedAt: Date }>;

  constructor() {
    super('ideaforge');
    this.version(1).stores({
      projects: 'localId, remoteId, clerkUserId, syncStatus, updatedAt',
      messages: 'localId, remoteId, projectLocalId, [projectLocalId+phase], createdAt',
      attachments: 'localId, remoteId, projectLocalId, syncStatus',
      syncQueue: 'id, table, operation, createdAt',
      pricingCache: 'id'
    });
  }
}

export const db = new IdeaForgeDB();
```

## 5. Server Actions

### 5.1 Database Actions

#### createProject
```typescript
// lib/db/queries/projects.ts
import { db as localDb } from '@/lib/local-db/client';
import { supabase } from '@/lib/db/client';
import { nanoid } from 'nanoid';

export async function createProject(
  userId: string,
  data: { name: string; initialIdea?: string }
): Promise<LocalProject> {
  const localId = nanoid();
  const now = new Date();

  const project: LocalProject = {
    localId,
    clerkUserId: userId,
    name: data.name,
    initialIdea: data.initialIdea,
    currentPhase: 'request',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };

  // Write to local DB first
  await localDb.projects.add(project);

  // Queue for sync
  await localDb.syncQueue.add({
    id: nanoid(),
    table: 'projects',
    operation: 'insert',
    localId,
    data: project,
    attempts: 0,
    createdAt: now,
  });

  return project;
}
```

#### getProjectMessages
```typescript
export async function getProjectMessages(
  projectLocalId: string,
  phase: 'request' | 'spec' | 'plan'
): Promise<LocalMessage[]> {
  return localDb.messages
    .where('[projectLocalId+phase]')
    .equals([projectLocalId, phase])
    .sortBy('createdAt');
}
```

#### saveMessage
```typescript
export async function saveMessage(
  projectLocalId: string,
  message: Omit<LocalMessage, 'localId' | 'syncStatus'>
): Promise<LocalMessage> {
  const localId = nanoid();
  const fullMessage: LocalMessage = {
    ...message,
    localId,
    projectLocalId,
    syncStatus: 'pending',
  };

  await localDb.messages.add(fullMessage);
  
  await localDb.syncQueue.add({
    id: nanoid(),
    table: 'messages',
    operation: 'insert',
    localId,
    data: fullMessage,
    attempts: 0,
    createdAt: new Date(),
  });

  return fullMessage;
}
```

#### updateProjectPhase
```typescript
export async function updateProjectPhase(
  localId: string,
  phase: 'request' | 'spec' | 'plan',
  content?: string
): Promise<void> {
  const updates: Partial<LocalProject> = {
    currentPhase: phase,
    updatedAt: new Date(),
    syncStatus: 'pending',
  };

  if (phase === 'spec' && content) {
    updates.requestContent = content;
  } else if (phase === 'plan' && content) {
    updates.specContent = content;
  }

  await localDb.projects.update(localId, updates);

  // Auto-snapshot on phase transition
  await createSnapshot(localId, 'auto');

  await queueSync('projects', 'update', localId, updates);
}
```

### 5.2 LLM Actions

#### /api/llm/chat/route.ts
```typescript
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs';
import { decryptApiKey } from '@/lib/crypto/api-keys';
import { getApiKey } from '@/lib/db/queries/api-keys';
import { createLLMClient } from '@/lib/llm/client';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { provider, model, messages, stream = true } = body;

  // Get and decrypt API key
  const apiKeyRecord = await getApiKey(userId, provider);
  if (!apiKeyRecord) {
    return new Response('API key not configured', { status: 400 });
  }

  const decryptedKey = await decryptApiKey(apiKeyRecord.encrypted_key, userId);

  // Create provider-specific client
  const client = createLLMClient(provider, {
    apiKey: decryptedKey,
    baseUrl: apiKeyRecord.endpoint_url,
  });

  if (stream) {
    const streamResponse = await client.streamChat(model, messages);
    
    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    const response = await client.chat(model, messages);
    return Response.json(response);
  }
}
```

#### LLM Client Abstraction
```typescript
// lib/llm/client.ts
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { OllamaProvider } from './providers/ollama';
import { CustomProvider } from './providers/custom';

export interface LLMClient {
  chat(model: string, messages: Message[]): Promise<ChatResponse>;
  streamChat(model: string, messages: Message[]): Promise<ReadableStream>;
  countTokens(text: string, model: string): Promise<number>;
}

export function createLLMClient(
  provider: string,
  config: { apiKey: string; baseUrl?: string }
): LLMClient {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(config.apiKey);
    case 'anthropic':
      return new AnthropicProvider(config.apiKey);
    case 'google':
      return new GoogleProvider(config.apiKey);
    case 'ollama':
      return new OllamaProvider(config.baseUrl || 'http://localhost:11434');
    case 'custom':
      return new CustomProvider(config.apiKey, config.baseUrl!);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### 5.3 Content Extraction

#### /api/extract/url/route.ts
```typescript
import { NextRequest } from 'next/server';

const JINA_READER_URL = 'https://r.jina.ai/';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  try {
    // Try Jina Reader first
    const jinaResponse = await fetch(`${JINA_READER_URL}${encodeURIComponent(url)}`, {
      headers: { 'Accept': 'text/plain' },
    });

    if (jinaResponse.ok) {
      const content = await jinaResponse.text();
      return Response.json({ 
        success: true, 
        content,
        source: 'jina' 
      });
    }

    // Fallback to direct fetch + cheerio
    const directResponse = await fetch(url);
    const html = await directResponse.text();
    const content = extractTextFromHtml(html);

    return Response.json({ 
      success: true, 
      content,
      source: 'direct' 
    });

  } catch (error) {
    // Store URL as reference without content
    return Response.json({ 
      success: false, 
      error: 'Extraction failed',
      urlStored: true 
    });
  }
}

function extractTextFromHtml(html: string): string {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  
  // Remove scripts, styles, nav, footer
  $('script, style, nav, footer, header, aside').remove();
  
  // Get main content
  const main = $('main, article, .content, #content').first();
  const text = main.length ? main.text() : $('body').text();
  
  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}
```

### 5.4 Pricing Data

#### /api/llm/pricing/route.ts
```typescript
import { NextRequest } from 'next/server';

const LITELLM_PRICING_URL = 
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

let pricingCache: { data: any; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const now = Date.now();

  if (pricingCache && now - pricingCache.fetchedAt < CACHE_TTL) {
    return Response.json(pricingCache.data);
  }

  try {
    const response = await fetch(LITELLM_PRICING_URL);
    const data = await response.json();

    pricingCache = { data, fetchedAt: now };

    return Response.json(data);
  } catch (error) {
    // Return cached data even if stale
    if (pricingCache) {
      return Response.json(pricingCache.data);
    }
    return Response.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
```

## 6. Design System

### 6.1 Visual Style

**Color Palette**:
```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;
  --background-secondary: 0 0% 98%;
  --background-tertiary: 0 0% 96%;

  /* Foregrounds */
  --foreground: 0 0% 9%;
  --foreground-muted: 0 0% 45%;

  /* Borders */
  --border: 0 0% 90%;
  --border-strong: 0 0% 80%;

  /* Accents */
  --accent: 221 83% 53%;        /* #3B82F6 - Blue */
  --accent-foreground: 0 0% 100%;
  --accent-muted: 221 83% 96%;

  /* Semantic */
  --success: 142 71% 45%;       /* #22C55E */
  --warning: 38 92% 50%;        /* #F59E0B */
  --error: 0 84% 60%;           /* #EF4444 */

  /* Phase Colors */
  --phase-request: 262 83% 58%; /* #8B5CF6 - Purple */
  --phase-spec: 199 89% 48%;    /* #0EA5E9 - Sky */
  --phase-plan: 142 71% 45%;    /* #22C55E - Green */
}

.dark {
  --background: 0 0% 7%;
  --background-secondary: 0 0% 10%;
  --background-tertiary: 0 0% 13%;
  --foreground: 0 0% 95%;
  --foreground-muted: 0 0% 55%;
  --border: 0 0% 18%;
  --border-strong: 0 0% 25%;
  --accent-muted: 221 83% 15%;
}
```

**Typography**:
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

**Spacing**:
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### 6.2 Core Components

**Layout Structure**:
```tsx
// Dashboard layout with sidebar
<div className="flex h-screen">
  <Sidebar className="w-64 border-r" />
  <div className="flex-1 flex flex-col">
    <NavHeader className="h-14 border-b" />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>

// Project layout with phase navigation
<div className="flex flex-col h-full">
  <PhaseIndicator currentPhase={phase} />
  <div className="flex-1 overflow-hidden">
    {children}
  </div>
</div>
```

**Phase Indicator**:
```tsx
interface PhaseIndicatorProps {
  currentPhase: 'request' | 'spec' | 'plan';
  completedPhases: string[];
}

export function PhaseIndicator({ currentPhase, completedPhases }: PhaseIndicatorProps) {
  const phases = [
    { id: 'request', label: 'Request', icon: MessageSquare },
    { id: 'spec', label: 'Specification', icon: FileText },
    { id: 'plan', label: 'Plan', icon: ListChecks },
  ];

  return (
    <div className="flex items-center justify-center gap-2 py-4 border-b">
      {phases.map((phase, index) => (
        <React.Fragment key={phase.id}>
          {index > 0 && (
            <div className={cn(
              "w-12 h-0.5",
              completedPhases.includes(phases[index - 1].id) 
                ? "bg-accent" 
                : "bg-border"
            )} />
          )}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
            currentPhase === phase.id && "bg-accent text-accent-foreground",
            completedPhases.includes(phase.id) && currentPhase !== phase.id && "text-accent",
            !completedPhases.includes(phase.id) && currentPhase !== phase.id && "text-foreground-muted"
          )}>
            <phase.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{phase.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
```

**Comparison Grid**:
```tsx
interface ComparisonGridProps {
  columns: ComparisonColumn[];
  mode: 'compare' | 'cherry-pick';
}

export function ComparisonGrid({ columns, mode }: ComparisonGridProps) {
  const columnCount = columns.length;

  const gridClass = cn(
    "grid gap-4 h-full",
    columnCount === 2 && "grid-cols-2",
    columnCount === 3 && "grid-cols-3",
    columnCount >= 4 && "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  return (
    <div className={gridClass}>
      {columns.map((column) => (
        <ComparisonColumn
          key={column.model}
          {...column}
          selectable={mode === 'cherry-pick'}
        />
      ))}
    </div>
  );
}
```

## 7. Component Architecture

### 7.1 Server Components

**ProjectListPage**:
```tsx
// app/(dashboard)/projects/page.tsx
import { auth } from '@clerk/nextjs';
import { getProjects } from '@/lib/db/queries/projects';
import { ProjectList } from '@/components/projects/project-list';

export default async function ProjectsPage() {
  const { userId } = auth();
  
  // Server-side data fetch
  const projects = await getProjects(userId!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>
      
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectList initialProjects={projects} />
      </Suspense>
    </div>
  );
}
```

**Props Interface**:
```typescript
interface ProjectListProps {
  initialProjects: LocalProject[];
}

interface ProjectCardProps {
  project: LocalProject;
  onDelete: (id: string) => void;
}
```

### 7.2 Client Components

**ChatInterface**:
```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useProject } from '@/hooks/use-project';

interface ChatInterfaceProps {
  projectId: string;
  phase: 'request' | 'spec' | 'plan';
  systemPrompt: string;
}

export function ChatInterface({ projectId, phase, systemPrompt }: ChatInterfaceProps) {
  const { messages, isLoading, sendMessage, extractedRequest } = useChat({
    projectId,
    phase,
    systemPrompt,
  });
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.localId} message={message} />
          ))}
          {isLoading && <StreamingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Request preview sidebar */}
      {extractedRequest && (
        <div className="w-96 border-l p-4 overflow-y-auto">
          <h3 className="font-medium mb-4">Extracted Request</h3>
          <RequestPreview content={extractedRequest} />
        </div>
      )}
    </div>
  );
}
```

**useChat Hook**:
```typescript
// hooks/use-chat.ts
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectMessages, saveMessage } from '@/lib/db/queries/messages';
import { parseRequestBlock } from '@/lib/parsers/request-block';

interface UseChatOptions {
  projectId: string;
  phase: 'request' | 'spec' | 'plan';
  systemPrompt: string;
}

export function useChat({ projectId, phase, systemPrompt }: UseChatOptions) {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', projectId, phase],
    queryFn: () => getProjectMessages(projectId, phase),
  });

  const extractedRequest = messages
    .filter((m) => m.role === 'assistant')
    .map((m) => parseRequestBlock(m.content))
    .filter(Boolean)
    .pop();

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);

    // Save user message
    const userMessage = await saveMessage(projectId, {
      projectLocalId: projectId,
      phase,
      role: 'user',
      content,
      createdAt: new Date(),
    });

    queryClient.setQueryData(['messages', projectId, phase], (old: any) => [
      ...old,
      userMessage,
    ]);

    // Prepare messages for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ];

    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'anthropic', // TODO: from settings
          model: 'claude-sonnet-4-20250514',
          messages: apiMessages,
          stream: true,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Save assistant message
      const assistantMessage = await saveMessage(projectId, {
        projectLocalId: projectId,
        phase,
        role: 'assistant',
        content: fullContent,
        model: 'claude-sonnet-4-20250514',
        provider: 'anthropic',
        createdAt: new Date(),
      });

      queryClient.setQueryData(['messages', projectId, phase], (old: any) => [
        ...old,
        assistantMessage,
      ]);

    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }, [projectId, phase, systemPrompt, messages, queryClient]);

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    extractedRequest,
  };
}
```

## 8. Authentication & Authorization

### Clerk Configuration

**middleware.ts**:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Webhook Handler** (`/api/webhooks/clerk/route.ts`):
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/client';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  if (evt.type === 'user.created') {
    await supabase.from('user_preferences').insert({
      clerk_user_id: evt.data.id,
    });
  }

  if (evt.type === 'user.deleted') {
    // Clean up user data
    await supabase.from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('clerk_user_id', evt.data.id);
  }

  return new Response('OK', { status: 200 });
}
```

### Protected Routes

All routes under `(dashboard)` are protected via the middleware. The layout fetches user data:

```tsx
// app/(dashboard)/layout.tsx
import { auth, currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## 9. Data Flow

### Server/Client Data Passing

**Pattern: Server Component → Client Component**:
```tsx
// Server component fetches initial data
async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProject(params.projectId);
  
  return (
    <ProjectProvider initialProject={project}>
      <ClientProjectView />
    </ProjectProvider>
  );
}

// Client component uses context + local updates
function ClientProjectView() {
  const { project, updateProject } = useProject();
  // ...
}
```

### State Management Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      UI Components                        │
├──────────────────────────────────────────────────────────┤
│  Zustand (UI State)        │  React Query (Server State) │
│  - Selected models         │  - Projects list            │
│  - Comparison mode         │  - Messages                 │
│  - Editor state            │  - Attachments              │
│  - Modal visibility        │  - API keys                 │
├──────────────────────────────────────────────────────────┤
│                    Dexie.js (IndexedDB)                   │
│                    Local-first persistence                │
├──────────────────────────────────────────────────────────┤
│                    Sync Engine (Background)               │
│                    Bidirectional with Supabase            │
└──────────────────────────────────────────────────────────┘
```

**Zustand Store Example**:
```typescript
// stores/comparison-store.ts
import { create } from 'zustand';

interface ComparisonState {
  selectedModels: string[];
  mode: 'single' | 'compare' | 'cherry-pick';
  cherryPickedSections: Record<string, string[]>; // modelId -> sectionIds
  setSelectedModels: (models: string[]) => void;
  setMode: (mode: 'single' | 'compare' | 'cherry-pick') => void;
  toggleSection: (modelId: string, sectionId: string) => void;
  reset: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedModels: [],
  mode: 'single',
  cherryPickedSections: {},
  setSelectedModels: (models) => set({ selectedModels: models }),
  setMode: (mode) => set({ mode }),
  toggleSection: (modelId, sectionId) =>
    set((state) => {
      const current = state.cherryPickedSections[modelId] || [];
      const updated = current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId];
      return {
        cherryPickedSections: {
          ...state.cherryPickedSections,
          [modelId]: updated,
        },
      };
    }),
  reset: () => set({ selectedModels: [], mode: 'single', cherryPickedSections: {} }),
}));
```

## 10. Stripe Integration

N/A - Payment integration excluded from scope.

## 11. PostHog Analytics

### Analytics Strategy

Track key user actions to understand feature usage without collecting PII:

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // Manual control
      persistence: 'localStorage',
    });
  }
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties);
}
```

### Event Tracking

```typescript
// Key events to track
const EVENTS = {
  // Project lifecycle
  PROJECT_CREATED: 'project_created',
  PROJECT_DELETED: 'project_deleted',
  PHASE_COMPLETED: 'phase_completed',
  
  // LLM usage
  LLM_REQUEST: 'llm_request',
  MULTI_MODEL_COMPARISON: 'multi_model_comparison',
  CHERRY_PICK_USED: 'cherry_pick_used',
  COHERENCE_CHECK: 'coherence_check',
  
  // Features
  ATTACHMENT_ADDED: 'attachment_added',
  SNAPSHOT_CREATED: 'snapshot_created',
  SNAPSHOT_RESTORED: 'snapshot_restored',
  EXPORT_TRIGGERED: 'export_triggered',
};

// Example usage
trackEvent(EVENTS.MULTI_MODEL_COMPARISON, {
  model_count: 3,
  providers: ['openai', 'anthropic', 'google'],
  estimated_cost: 0.05,
});
```

### Custom Properties

```typescript
// Set user properties (anonymized)
posthog.identify(hashedUserId, {
  has_api_keys: true,
  configured_providers: ['openai', 'anthropic'],
  project_count: 5,
  theme: 'dark',
});
```

## 12. Testing

### Unit Tests (Vitest)

**Request Block Parser**:
```typescript
// lib/parsers/__tests__/request-block.test.ts
import { describe, it, expect } from 'vitest';
import { parseRequestBlock } from '../request-block';

describe('parseRequestBlock', () => {
  it('extracts request block from markdown', () => {
    const content = `
Some text before

\`\`\`request
# Project Name
## Description
A test project
\`\`\`

Some text after
`;
    const result = parseRequestBlock(content);
    expect(result).toContain('# Project Name');
    expect(result).toContain('A test project');
  });

  it('returns null when no request block found', () => {
    const content = 'Just some regular text';
    expect(parseRequestBlock(content)).toBeNull();
  });

  it('extracts the last request block when multiple exist', () => {
    const content = `
\`\`\`request
# Old Version
\`\`\`

\`\`\`request
# New Version
\`\`\`
`;
    const result = parseRequestBlock(content);
    expect(result).toContain('# New Version');
    expect(result).not.toContain('# Old Version');
  });
});
```

**Cost Estimation**:
```typescript
// lib/pricing/__tests__/estimate.test.ts
import { describe, it, expect, vi } from 'vitest';
import { estimateCost } from '../estimate';

describe('estimateCost', () => {
  const mockPricing = {
    'gpt-4o': {
      input_cost_per_token: 0.000005,
      output_cost_per_token: 0.000015,
    },
  };

  it('calculates cost correctly', () => {
    const result = estimateCost({
      model: 'gpt-4o',
      inputTokens: 1000,
      estimatedOutputTokens: 500,
      pricing: mockPricing,
    });

    expect(result).toBeCloseTo(0.0125);
  });

  it('returns null for unknown model', () => {
    const result = estimateCost({
      model: 'unknown-model',
      inputTokens: 1000,
      estimatedOutputTokens: 500,
      pricing: mockPricing,
    });

    expect(result).toBeNull();
  });
});
```

### Integration Tests (Vitest + MSW)

**LLM Proxy**:
```typescript
// app/api/llm/__tests__/chat.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{ message: { content: 'Test response' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20 },
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('POST /api/llm/chat', () => {
  it('proxies request to OpenAI', async () => {
    // Mock auth and API key retrieval
    // ...

    const response = await fetch('/api/llm/chat', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false,
      }),
    });

    const data = await response.json();
    expect(data.content).toBe('Test response');
  });
});
```

### E2E Tests (Playwright)

**Full Project Flow**:
```typescript
// e2e/project-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Clerk auth
    await page.goto('/projects');
  });

  test('creates project and completes request phase', async ({ page }) => {
    // Create new project
    await page.click('text=New Project');
    await page.fill('[name="name"]', 'Test Project');
    await page.fill('[name="initialIdea"]', 'A test idea');
    await page.click('text=Create');

    // Should be on request phase
    await expect(page).toHaveURL(/\/projects\/.*\/request/);

    // Send a message
    await page.fill('textarea', 'Help me refine this idea');
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator('.message-bubble').last()).toContainText(
      '```request',
      { timeout: 30000 }
    );

    // Mark complete
    await page.click('text=Mark Complete');

    // Should advance to spec phase
    await expect(page).toHaveURL(/\/projects\/.*\/spec/);
  });

  test('multi-model comparison', async ({ page }) => {
    await page.goto('/projects/test-id/spec');

    // Open model selector
    await page.click('text=Compare Models');

    // Select multiple models
    await page.click('[data-model="gpt-4o"]');
    await page.click('[data-model="claude-sonnet-4-20250514"]');

    // Start comparison
    await page.click('text=Generate');

    // Should show side-by-side columns
    await expect(page.locator('.comparison-column')).toHaveCount(2);

    // Select one output
    await page.click('.comparison-column:first-child button:text("Use This")');

    // Should save and exit comparison mode
    await expect(page.locator('.comparison-column')).toHaveCount(0);
  });
});
```

**Offline Sync**:
```typescript
// e2e/offline-sync.spec.ts
import { test, expect } from '@playwright/test';

test('works offline and syncs when back online', async ({ page, context }) => {
  await page.goto('/projects');

  // Create project while online
  await page.click('text=New Project');
  await page.fill('[name="name"]', 'Offline Test');
  await page.click('text=Create');

  // Go offline
  await context.setOffline(true);
  await expect(page.locator('.offline-banner')).toBeVisible();

  // Make changes offline
  await page.fill('textarea', 'Offline message');
  await page.click('button[type="submit"]');

  // Should show pending sync indicator
  await expect(page.locator('.sync-status-pending')).toBeVisible();

  // Go back online
  await context.setOffline(false);

  // Should sync and show synced status
  await expect(page.locator('.sync-status-synced')).toBeVisible({ timeout: 10000 });
});
```
```

