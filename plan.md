<brainstorming>

## Analysis of Implementation Requirements

### Critical Path Dependencies
1. **Foundation Layer**: Project setup → Database schema → Auth → Base UI
2. **Core Features**: Project CRUD → Chat interface → LLM integration → Phase navigation
3. **Advanced Features**: Multi-model comparison → Cherry-pick → Sync engine
4. **Polish**: Cost estimation → Export → Testing → Deployment

### Complexity Assessment

**High Complexity** (requires careful sequencing):
- Sync engine with conflict resolution
- Multi-model simultaneous streaming
- Cherry-pick merge with coherence validation
- IndexedDB + Supabase hybrid persistence

**Medium Complexity**:
- LLM provider abstraction layer
- Structured output parsing with retry logic
- File/URL content extraction
- Drag-drop section reordering

**Lower Complexity** (but many files):
- UI components (shadcn/ui based)
- CRUD operations
- Export functionality
- Settings pages

### Risk Areas
1. **Streaming multiple responses**: Need careful state management to avoid race conditions
2. **Offline-first sync**: Conflict detection timing is tricky
3. **Structured output parsing**: LLMs don't always follow format—need robust fallbacks
4. **Large file handling**: 100MB uploads need chunking and progress indication

### Implementation Strategy
1. Start with a working skeleton (auth + basic CRUD + simple chat)
2. Add LLM integration with single model first
3. Expand to multi-model comparison
4. Layer in offline support and sync
5. Add advanced features (cherry-pick, snapshots, cost estimation)
6. Polish with testing and deployment config

### File Count Management
Each step targets ≤20 files. Complex features split across multiple steps:
- UI components: Group by feature area
- Database: Schema first, then queries, then hooks
- LLM: Provider abstraction first, then streaming, then comparison

</brainstorming>

---

```md
# Implementation Plan

## Phase 1: Project Foundation

- [ ] Step 1: Initialize Next.js project with base configuration
  - **Task**: Create new Next.js 14 project with App Router, TypeScript, Tailwind CSS, and essential dependencies. Configure path aliases, environment variables structure, and base TypeScript settings.
  - **Files**:
    - `package.json`: Project dependencies (next, react, typescript, tailwindcss, postcss, autoprefixer, clsx, tailwind-merge, lucide-react)
    - `tsconfig.json`: TypeScript configuration with path aliases (@/*)
    - `tailwind.config.ts`: Tailwind configuration with custom colors and fonts
    - `postcss.config.js`: PostCSS configuration
    - `next.config.js`: Next.js configuration (images, env exposure)
    - `.env.example`: Environment variables template
    - `.env.local`: Local environment variables (gitignored)
    - `.gitignore`: Git ignore patterns
    - `app/globals.css`: Global styles with CSS custom properties for design system
    - `app/layout.tsx`: Root layout with font loading (Inter, JetBrains Mono)
    - `app/page.tsx`: Landing page placeholder
    - `lib/utils/cn.ts`: Class name merge utility
  - **Step Dependencies**: None
  - **User Instructions**: Run `npm install` after files are created. Ensure Node.js 18+ is installed.

- [ ] Step 2: Install and configure shadcn/ui components
  - **Task**: Initialize shadcn/ui and install core UI components that will be used throughout the application. Configure component styling to match the design system.
  - **Files**:
    - `components.json`: shadcn/ui configuration
    - `components/ui/button.tsx`: Button component
    - `components/ui/card.tsx`: Card component
    - `components/ui/input.tsx`: Input component
    - `components/ui/label.tsx`: Label component
    - `components/ui/textarea.tsx`: Textarea component
    - `components/ui/select.tsx`: Select component
    - `components/ui/dialog.tsx`: Dialog/modal component
    - `components/ui/dropdown-menu.tsx`: Dropdown menu component
    - `components/ui/tabs.tsx`: Tabs component
    - `components/ui/switch.tsx`: Switch/toggle component
    - `components/ui/skeleton.tsx`: Loading skeleton component
    - `components/ui/toast.tsx`: Toast notification component
    - `components/ui/tooltip.tsx`: Tooltip component
    - `components/ui/separator.tsx`: Separator component
    - `components/ui/sheet.tsx`: Slide-out sheet component
  - **Step Dependencies**: Step 1
  - **User Instructions**: Run `npx shadcn-ui@latest init` and follow prompts, selecting "New York" style and slate base color. Then run `npx shadcn-ui@latest add button card input label textarea select dialog dropdown-menu tabs switch skeleton toast tooltip separator sheet`.

- [ ] Step 3: Set up Clerk authentication
  - **Task**: Install Clerk SDK, configure authentication middleware, create sign-in/sign-up pages, and set up protected route handling.
  - **Files**:
    - `package.json`: Add @clerk/nextjs dependency
    - `middleware.ts`: Clerk middleware with public/protected route configuration
    - `app/(auth)/layout.tsx`: Auth pages layout (centered, minimal)
    - `app/(auth)/sign-in/[[...sign-in]]/page.tsx`: Sign-in page with Clerk component
    - `app/(auth)/sign-up/[[...sign-up]]/page.tsx`: Sign-up page with Clerk component
    - `app/layout.tsx`: Update to wrap with ClerkProvider
    - `.env.example`: Add Clerk environment variables
  - **Step Dependencies**: Step 1
  - **User Instructions**: Create a Clerk application at clerk.com. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`. Set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`.

- [ ] Step 4: Create Supabase database schema
  - **Task**: Define and create all database tables in Supabase with proper relationships, indexes, and RLS policies.
  - **Files**:
    - `supabase/migrations/001_initial_schema.sql`: Complete database schema (user_preferences, projects, messages, attachments, api_keys, project_snapshots tables)
    - `lib/db/types.ts`: TypeScript types generated from schema
  - **Step Dependencies**: Step 1
  - **User Instructions**: 
    1. Create a Supabase project (or use self-hosted instance)
    2. Run the migration SQL in Supabase SQL editor
    3. Copy `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
    4. Enable Row Level Security on all tables
    5. Create storage bucket named `attachments` with 100MB file size limit

- [ ] Step 5: Set up Supabase client and base queries
  - **Task**: Create Supabase client singleton, implement base database query functions for all tables, and add proper TypeScript typing.
  - **Files**:
    - `package.json`: Add @supabase/supabase-js dependency
    - `lib/db/client.ts`: Supabase client singleton with server/client variants
    - `lib/db/queries/projects.ts`: Project CRUD operations
    - `lib/db/queries/messages.ts`: Message queries
    - `lib/db/queries/attachments.ts`: Attachment queries
    - `lib/db/queries/api-keys.ts`: API key queries (with encryption placeholders)
    - `lib/db/queries/snapshots.ts`: Snapshot queries
    - `lib/db/queries/user-preferences.ts`: User preferences queries
  - **Step Dependencies**: Step 4
  - **User Instructions**: None

- [ ] Step 6: Set up IndexedDB with Dexie.js for local-first storage
  - **Task**: Configure Dexie.js for IndexedDB, define local schema mirroring Supabase structure, create hooks for local data access.
  - **Files**:
    - `package.json`: Add dexie and dexie-react-hooks dependencies
    - `lib/local-db/client.ts`: Dexie database class definition
    - `lib/local-db/schema.ts`: IndexedDB schema with all tables
    - `lib/local-db/hooks.ts`: React hooks for local DB operations (useLocalProjects, useLocalMessages, etc.)
    - `lib/local-db/migrations.ts`: Schema migration handling
    - `types/sync.ts`: Sync-related TypeScript types
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

## Phase 2: Dashboard Layout and Navigation

- [ ] Step 7: Create dashboard layout with navigation
  - **Task**: Build the authenticated dashboard layout including sidebar navigation, header with user menu, theme toggle, and mobile-responsive design.
  - **Files**:
    - `app/(dashboard)/layout.tsx`: Dashboard layout wrapper with auth check
    - `components/layout/sidebar.tsx`: Side navigation with project links
    - `components/layout/nav-header.tsx`: Top header with user menu
    - `components/layout/mobile-nav.tsx`: Mobile navigation drawer
    - `components/layout/theme-toggle.tsx`: Dark/light mode toggle
    - `components/layout/user-menu.tsx`: User dropdown with sign out
    - `hooks/use-theme.ts`: Theme management hook
    - `app/(dashboard)/page.tsx`: Dashboard home (redirects to projects)
  - **Step Dependencies**: Steps 2, 3
  - **User Instructions**: None

- [ ] Step 8: Create project list and creation pages
  - **Task**: Implement the projects listing page with project cards, search/filter, and the new project creation form.
  - **Files**:
    - `app/(dashboard)/projects/page.tsx`: Projects list page (server component)
    - `app/(dashboard)/projects/new/page.tsx`: New project creation page
    - `components/projects/project-list.tsx`: Project grid/list component
    - `components/projects/project-card.tsx`: Individual project card
    - `components/projects/new-project-form.tsx`: Project creation form
    - `components/projects/project-search.tsx`: Search and filter controls
    - `hooks/use-projects.ts`: Projects data hook with React Query
    - `types/project.ts`: Project TypeScript types
  - **Step Dependencies**: Steps 6, 7
  - **User Instructions**: None

- [ ] Step 9: Create project detail layout with phase navigation
  - **Task**: Build the project-level layout with phase indicator (Request → Spec → Plan), phase navigation buttons, and project header with actions.
  - **Files**:
    - `app/(dashboard)/projects/[projectId]/layout.tsx`: Project layout with phase nav
    - `app/(dashboard)/projects/[projectId]/page.tsx`: Project overview (redirects to current phase)
    - `components/phases/phase-indicator.tsx`: Horizontal stepper showing phases
    - `components/phases/phase-navigation.tsx`: Next/previous phase buttons
    - `components/projects/project-header.tsx`: Project title, actions dropdown
    - `hooks/use-project.ts`: Single project data hook
    - `hooks/use-phase.ts`: Phase management hook
    - `types/phase.ts`: Phase-related types
  - **Step Dependencies**: Step 8
  - **User Instructions**: None

## Phase 3: LLM Integration Foundation

- [ ] Step 10: Create LLM provider abstraction layer
  - **Task**: Build the unified LLM client interface and implement provider-specific adapters for OpenAI, Anthropic, Google, Ollama, and custom endpoints.
  - **Files**:
    - `lib/llm/types.ts`: LLM types (Message, ChatResponse, Provider configs)
    - `lib/llm/client.ts`: Unified LLM client factory
    - `lib/llm/providers/openai.ts`: OpenAI provider implementation
    - `lib/llm/providers/anthropic.ts`: Anthropic provider implementation
    - `lib/llm/providers/google.ts`: Google Gemini provider implementation
    - `lib/llm/providers/ollama.ts`: Ollama provider implementation
    - `lib/llm/providers/custom.ts`: Custom LiteLLM-compatible provider
    - `lib/llm/streaming.ts`: Stream handling utilities
  - **Step Dependencies**: Step 1
  - **User Instructions**: None

- [ ] Step 11: Create LLM API routes
  - **Task**: Implement the API routes for LLM chat (streaming and non-streaming), available models listing, and pricing data endpoint.
  - **Files**:
    - `app/api/llm/chat/route.ts`: Main chat endpoint with streaming support
    - `app/api/llm/models/route.ts`: List available models per provider
    - `app/api/llm/pricing/route.ts`: Fetch and cache LiteLLM pricing data
    - `lib/crypto/api-keys.ts`: API key encryption/decryption utilities
  - **Step Dependencies**: Steps 5, 10
  - **User Instructions**: Add `ENCRYPTION_SECRET` to `.env.local` (generate with `openssl rand -base64 32`)

- [ ] Step 12: Create API key management UI
  - **Task**: Build the settings page for managing API keys with secure input, provider selection, and custom endpoint configuration.
  - **Files**:
    - `app/(dashboard)/settings/page.tsx`: Settings overview page
    - `app/(dashboard)/settings/api-keys/page.tsx`: API keys management page
    - `app/(dashboard)/settings/layout.tsx`: Settings layout with sub-navigation
    - `components/settings/api-key-form.tsx`: Add/edit API key form
    - `components/settings/api-key-list.tsx`: List of configured API keys
    - `components/settings/provider-config.tsx`: Provider-specific settings
    - `hooks/use-api-keys.ts`: API keys management hook
  - **Step Dependencies**: Steps 7, 11
  - **User Instructions**: None

## Phase 4: Request Phase (Chat Interface)

- [ ] Step 13: Build core chat components
  - **Task**: Create the foundational chat UI components including message list, message bubbles, chat input, and streaming indicator.
  - **Files**:
    - `components/chat/chat-interface.tsx`: Main chat container component
    - `components/chat/message-list.tsx`: Scrollable message list
    - `components/chat/message-bubble.tsx`: Individual message with role styling
    - `components/chat/chat-input.tsx`: Textarea with send button, Cmd+Enter support
    - `components/chat/streaming-indicator.tsx`: Typing/streaming animation
    - `components/chat/empty-chat.tsx`: Empty state with prompts
    - `types/message.ts`: Message TypeScript types
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] Step 14: Implement chat hook with streaming
  - **Task**: Create the useChat hook that manages conversation state, handles streaming responses, saves messages to local DB, and parses structured output.
  - **Files**:
    - `hooks/use-chat.ts`: Main chat state management hook
    - `lib/parsers/request-block.ts`: Extract ```request blocks from responses
    - `lib/parsers/retry-repair.ts`: Retry logic for failed parsing
    - `lib/utils/tokens.ts`: Token counting utilities
  - **Step Dependencies**: Steps 6, 11, 13
  - **User Instructions**: None

- [ ] Step 15: Create Request phase page
  - **Task**: Build the complete Request phase page with chat interface, extracted request preview sidebar, and "Mark Complete" action.
  - **Files**:
    - `app/(dashboard)/projects/[projectId]/request/page.tsx`: Request phase page
    - `components/phases/request-phase.tsx`: Request phase container
    - `components/chat/request-preview.tsx`: Extracted request block preview
    - `prompts/request-phase.ts`: System prompt for request phase
  - **Step Dependencies**: Steps 9, 14
  - **User Instructions**: None

## Phase 5: Spec Phase

- [ ] Step 16: Build spec section configuration UI
  - **Task**: Create the drag-drop section configurator with checkboxes, detail level dropdowns, guidance text fields, and code examples toggle.
  - **Files**:
    - `package.json`: Add @dnd-kit/core and @dnd-kit/sortable for drag-drop
    - `components/phases/spec-configurator.tsx`: Section configuration container
    - `components/phases/section-item.tsx`: Draggable section with controls
    - `components/phases/section-list.tsx`: Sortable section list
    - `types/spec.ts`: Spec configuration types
    - `lib/constants/default-sections.ts`: Default spec sections configuration
  - **Step Dependencies**: Step 2
  - **User Instructions**: Run `npm install @dnd-kit/core @dnd-kit/sortable`

- [ ] Step 17: Create Spec phase page and generation
  - **Task**: Build the Spec phase page with configuration UI, attachment panel, spec generation with dynamic prompt construction, and output display.
  - **Files**:
    - `app/(dashboard)/projects/[projectId]/spec/page.tsx`: Spec phase main page
    - `app/(dashboard)/projects/[projectId]/spec/configure/page.tsx`: Configuration page
    - `components/phases/spec-phase.tsx`: Spec phase container
    - `components/editor/markdown-preview.tsx`: Read-only markdown renderer
    - `prompts/spec-phase.ts`: Dynamic system prompt builder for spec generation
    - `hooks/use-spec-config.ts`: Spec configuration management hook
  - **Step Dependencies**: Steps 9, 14, 16
  - **User Instructions**: None

## Phase 6: Plan Phase

- [ ] Step 18: Create Plan phase page and generation
  - **Task**: Build the Plan phase page that takes request + spec as input and generates step-by-step implementation plan with file listings.
  - **Files**:
    - `app/(dashboard)/projects/[projectId]/plan/page.tsx`: Plan phase page
    - `components/phases/plan-phase.tsx`: Plan phase container
    - `components/phases/plan-step-list.tsx`: Implementation steps list
    - `components/phases/plan-step-item.tsx`: Individual step with files
    - `lib/parsers/plan-steps.ts`: Parse plan into structured steps
    - `prompts/plan-phase.ts`: System prompt for plan generation
    - `types/plan.ts`: Plan-related types
  - **Step Dependencies**: Steps 9, 14, 17
  - **User Instructions**: None

## Phase 7: Attachments and Context

- [ ] Step 19: Build file upload and URL extraction
  - **Task**: Create attachment management components including drag-drop file upload, URL paste with extraction, and inline text context.
  - **Files**:
    - `package.json`: Add react-dropzone dependency
    - `components/attachments/attachment-manager.tsx`: Full attachment UI container
    - `components/attachments/file-dropzone.tsx`: Drag-drop file upload zone
    - `components/attachments/url-input.tsx`: URL paste with extract button
    - `components/attachments/text-context-input.tsx`: Plain text context field
    - `components/attachments/attachment-list.tsx`: List of attached items
    - `components/attachments/attachment-card.tsx`: Individual attachment card
    - `hooks/use-attachments.ts`: Attachment management hook
  - **Step Dependencies**: Step 2
  - **User Instructions**: Run `npm install react-dropzone`

- [ ] Step 20: Create content extraction API routes
  - **Task**: Implement API routes for URL content extraction (via Jina Reader with fallback) and file content extraction (PDF, DOCX, text files).
  - **Files**:
    - `package.json`: Add pdf-parse, mammoth, cheerio dependencies
    - `app/api/extract/url/route.ts`: URL content extraction endpoint
    - `app/api/extract/file/route.ts`: File content extraction endpoint
    - `lib/extraction/url.ts`: URL extraction utilities
    - `lib/extraction/pdf.ts`: PDF text extraction
    - `lib/extraction/docx.ts`: DOCX text extraction
    - `lib/extraction/chunker.ts`: Large content chunking utility
  - **Step Dependencies**: Step 1
  - **User Instructions**: Run `npm install pdf-parse mammoth cheerio`

## Phase 8: Multi-Model Comparison

- [ ] Step 21: Create model selector and comparison state
  - **Task**: Build the model multi-selector UI and create Zustand store for managing comparison state (selected models, mode, cherry-picked sections).
  - **Files**:
    - `package.json`: Add zustand dependency
    - `components/comparison/model-selector.tsx`: Multi-model selection chips UI
    - `stores/comparison-store.ts`: Zustand store for comparison state
    - `stores/ui-store.ts`: General UI state store
    - `hooks/use-comparison.ts`: Comparison mode hook
    - `hooks/use-models.ts`: Available models hook
  - **Step Dependencies**: Step 11
  - **User Instructions**: Run `npm install zustand`

- [ ] Step 22: Build comparison grid and streaming columns
  - **Task**: Create the dynamic comparison layout that displays multiple streaming LLM responses side-by-side with viewport-aware column/grid switching.
  - **Files**:
    - `components/comparison/comparison-container.tsx`: Main comparison layout
    - `components/comparison/comparison-column.tsx`: Single model output column
    - `components/comparison/comparison-grid.tsx`: Grid layout for 4+ models
    - `components/comparison/column-header.tsx`: Model name, status, select button
    - `components/comparison/streaming-column.tsx`: Streaming content display
    - `hooks/use-parallel-chat.ts`: Parallel LLM requests hook
  - **Step Dependencies**: Steps 14, 21
  - **User Instructions**: None

- [ ] Step 23: Implement cherry-pick and merge functionality
  - **Task**: Build the cherry-pick UI for selecting sections across outputs and the merge preview panel that shows combined content.
  - **Files**:
    - `components/comparison/cherry-pick-panel.tsx`: Section selection UI
    - `components/comparison/selectable-section.tsx`: Clickable section with highlight
    - `components/comparison/merge-preview.tsx`: Merged output preview panel
    - `components/comparison/section-marker.tsx`: Visual marker for selected sections
    - `lib/parsers/spec-sections.ts`: Parse spec into selectable sections
    - `lib/utils/merge-sections.ts`: Merge selected sections utility
  - **Step Dependencies**: Step 22
  - **User Instructions**: None

- [ ] Step 24: Add coherence judge validation
  - **Task**: Implement the coherence judge that validates merged outputs with two modes: auto-smooth (LLM fixes issues) and highlight-issues (returns problem list).
  - **Files**:
    - `components/comparison/coherence-result.tsx`: Validation result display
    - `components/comparison/coherence-dialog.tsx`: Modal for validation process
    - `components/comparison/issue-list.tsx`: List of detected issues
    - `prompts/coherence-judge.ts`: System prompts for both modes
    - `hooks/use-coherence-check.ts`: Coherence validation hook
    - `lib/llm/coherence.ts`: Coherence judge API calls
  - **Step Dependencies**: Steps 11, 23
  - **User Instructions**: None

## Phase 9: Cost Estimation

- [ ] Step 25: Implement cost estimation system
  - **Task**: Create the cost estimation UI and logic that fetches LiteLLM pricing data, calculates estimated costs before generation, and displays actual costs after.
  - **Files**:
    - `lib/pricing/fetch.ts`: Fetch and cache LiteLLM pricing JSON
    - `lib/pricing/estimate.ts`: Cost calculation logic
    - `lib/pricing/cache.ts`: Pricing data cache management
    - `lib/pricing/types.ts`: Pricing-related types
    - `components/comparison/cost-estimate.tsx`: Cost estimate display card
    - `components/comparison/cost-confirmation.tsx`: Pre-generation cost confirmation
    - `hooks/use-cost-estimate.ts`: Cost estimation hook
  - **Step Dependencies**: Step 11
  - **User Instructions**: None

## Phase 10: Version Snapshots

- [ ] Step 26: Build snapshot system
  - **Task**: Implement automatic and manual snapshot creation, snapshot timeline UI, and restore functionality.
  - **Files**:
    - `app/(dashboard)/projects/[projectId]/snapshots/page.tsx`: Snapshots page
    - `components/snapshots/snapshot-timeline.tsx`: Vertical timeline
    - `components/snapshots/snapshot-card.tsx`: Individual snapshot card
    - `components/snapshots/restore-dialog.tsx`: Restore confirmation dialog
    - `components/snapshots/snapshot-preview.tsx`: Read-only snapshot preview
    - `hooks/use-snapshots.ts`: Snapshot management hook
    - `lib/db/queries/snapshots.ts`: Update with create/restore logic
  - **Step Dependencies**: Steps 5, 9
  - **User Instructions**: None

- [ ] Step 27: Add visual diff between snapshots (optional)
  - **Task**: Implement a simple visual diff view between two snapshots using text diff library.
  - **Files**:
    - `package.json`: Add diff dependency
    - `components/snapshots/snapshot-diff.tsx`: Diff viewer component
    - `components/snapshots/diff-line.tsx`: Individual diff line (add/remove styling)
    - `lib/utils/diff.ts`: Diff generation utility
  - **Step Dependencies**: Step 26
  - **User Instructions**: Run `npm install diff @types/diff`

## Phase 11: Sync Engine

- [ ] Step 28: Build sync queue and push logic
  - **Task**: Create the sync queue in IndexedDB that tracks pending changes and implements the push-to-Supabase logic with retry handling.
  - **Files**:
    - `lib/sync/queue.ts`: Sync queue management
    - `lib/sync/push.ts`: Push changes to Supabase
    - `app/api/sync/push/route.ts`: Push API endpoint
    - `lib/sync/retry.ts`: Exponential backoff retry logic
    - `stores/sync-store.ts`: Sync status Zustand store
  - **Step Dependencies**: Steps 5, 6
  - **User Instructions**: None

- [ ] Step 29: Implement pull sync and conflict detection
  - **Task**: Build the pull sync logic that fetches remote changes and detects conflicts based on timestamp comparison.
  - **Files**:
    - `lib/sync/pull.ts`: Pull changes from Supabase
    - `lib/sync/conflict-resolver.ts`: Conflict detection logic
    - `app/api/sync/pull/route.ts`: Pull API endpoint
    - `lib/sync/merge.ts`: Non-conflicting merge logic
  - **Step Dependencies**: Step 28
  - **User Instructions**: None

- [ ] Step 30: Create sync UI components
  - **Task**: Build the sync status indicator, offline banner, and conflict resolution dialog.
  - **Files**:
    - `components/sync/sync-status.tsx`: Sync indicator in nav (synced/pending/error)
    - `components/sync/offline-banner.tsx`: Offline mode notification banner
    - `components/sync/conflict-dialog.tsx`: Conflict resolution modal
    - `components/sync/conflict-diff.tsx`: Side-by-side conflict view
    - `hooks/use-sync.ts`: Sync status and actions hook
    - `hooks/use-offline.ts`: Offline detection hook
  - **Step Dependencies**: Steps 29, 7
  - **User Instructions**: None

- [ ] Step 31: Integrate sync engine with app lifecycle
  - **Task**: Wire up the sync engine to run on app load, periodic intervals, and network status changes. Add sync triggers to all data mutations.
  - **Files**:
    - `lib/sync/engine.ts`: Main sync orchestration
    - `components/providers/sync-provider.tsx`: Sync context provider
    - `app/(dashboard)/layout.tsx`: Update to include SyncProvider
    - `lib/local-db/hooks.ts`: Update hooks to queue sync on mutations
    - `lib/sync/hooks.ts`: Sync lifecycle hooks
  - **Step Dependencies**: Step 30
  - **User Instructions**: None

## Phase 12: Export Functionality

- [ ] Step 32: Implement export options
  - **Task**: Create export functionality for Markdown, JSON, and clipboard copy formats with per-phase or full-project options.
  - **Files**:
    - `components/export/export-menu.tsx`: Export dropdown menu
    - `components/export/export-dialog.tsx`: Export options dialog
    - `lib/export/markdown.ts`: Markdown export generator
    - `lib/export/json.ts`: JSON export generator
    - `lib/export/clipboard.ts`: Clipboard formatting utility
    - `hooks/use-export.ts`: Export actions hook
  - **Step Dependencies**: Step 9
  - **User Instructions**: None

## Phase 13: Model Configuration

- [ ] Step 33: Create model defaults settings
  - **Task**: Build the settings page for configuring default models at project and phase level, including model preferences per provider.
  - **Files**:
    - `app/(dashboard)/settings/models/page.tsx`: Model configuration page
    - `components/settings/model-defaults.tsx`: Default model selection UI
    - `components/settings/phase-model-config.tsx`: Per-phase model overrides
    - `components/settings/model-list.tsx`: Available models by provider
    - `hooks/use-model-config.ts`: Model configuration hook
  - **Step Dependencies**: Steps 12, 21
  - **User Instructions**: None

## Phase 14: Clerk Webhook and User Setup

- [ ] Step 34: Set up Clerk webhook handler
  - **Task**: Implement Clerk webhook to handle user creation/deletion events and sync user preferences to Supabase.
  - **Files**:
    - `package.json`: Add svix dependency for webhook verification
    - `app/api/webhooks/clerk/route.ts`: Clerk webhook handler
    - `lib/db/queries/user-preferences.ts`: Update with webhook handlers
  - **Step Dependencies**: Steps 3, 5
  - **User Instructions**: 
    1. Run `npm install svix`
    2. In Clerk dashboard, go to Webhooks
    3. Create webhook endpoint pointing to `https://your-domain/api/webhooks/clerk`
    4. Select `user.created` and `user.deleted` events
    5. Copy signing secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

## Phase 15: Analytics (Optional)

- [ ] Step 35: Add PostHog analytics
  - **Task**: Integrate PostHog for anonymous usage analytics with key event tracking.
  - **Files**:
    - `package.json`: Add posthog-js dependency
    - `lib/analytics.ts`: PostHog initialization and event tracking
    - `components/providers/analytics-provider.tsx`: Analytics context provider
    - `app/(dashboard)/layout.tsx`: Update to include AnalyticsProvider
    - `lib/analytics/events.ts`: Event constants and tracking functions
  - **Step Dependencies**: Step 7
  - **User Instructions**: 
    1. Run `npm install posthog-js`
    2. Create PostHog project at posthog.com (or self-host)
    3. Add `NEXT_PUBLIC_POSTHOG_KEY` and optionally `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local`
    4. Analytics is optional—leave env vars empty to disable

## Phase 16: Testing

- [ ] Step 36: Set up Vitest and write unit tests
  - **Task**: Configure Vitest for unit testing and write tests for parsers, cost estimation, and sync logic.
  - **Files**:
    - `package.json`: Add vitest, @testing-library/react dependencies
    - `vitest.config.ts`: Vitest configuration
    - `lib/parsers/__tests__/request-block.test.ts`: Request block parser tests
    - `lib/parsers/__tests__/spec-sections.test.ts`: Spec sections parser tests
    - `lib/parsers/__tests__/plan-steps.test.ts`: Plan steps parser tests
    - `lib/pricing/__tests__/estimate.test.ts`: Cost estimation tests
    - `lib/sync/__tests__/conflict-resolver.test.ts`: Conflict resolution tests
    - `lib/crypto/__tests__/api-keys.test.ts`: Encryption tests
  - **Step Dependencies**: Steps 11, 14, 28
  - **User Instructions**: Run `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

- [ ] Step 37: Set up MSW and write integration tests
  - **Task**: Configure Mock Service Worker for API mocking and write integration tests for LLM proxy and content extraction.
  - **Files**:
    - `package.json`: Add msw dependency
    - `lib/test/mocks/handlers.ts`: MSW request handlers
    - `lib/test/mocks/server.ts`: MSW server setup
    - `lib/test/setup.ts`: Test setup file
    - `app/api/llm/__tests__/chat.test.ts`: LLM chat endpoint tests
    - `app/api/extract/__tests__/url.test.ts`: URL extraction tests
    - `app/api/extract/__tests__/file.test.ts`: File extraction tests
  - **Step Dependencies**: Step 36
  - **User Instructions**: Run `npm install -D msw`

- [ ] Step 38: Set up Playwright and write E2E tests
  - **Task**: Configure Playwright for end-to-end testing and write tests for core user flows.
  - **Files**:
    - `package.json`: Add @playwright/test dependency
    - `playwright.config.ts`: Playwright configuration
    - `e2e/auth.setup.ts`: Authentication setup for tests
    - `e2e/project-flow.spec.ts`: Full project creation flow test
    - `e2e/comparison.spec.ts`: Multi-model comparison test
    - `e2e/offline-sync.spec.ts`: Offline mode and sync test
    - `e2e/fixtures/test-user.ts`: Test user fixtures
  - **Step Dependencies**: Step 37
  - **User Instructions**: Run `npm install -D @playwright/test && npx playwright install`

## Phase 17: Deployment Configuration

- [ ] Step 39: Create Docker configuration for self-hosting
  - **Task**: Set up Dockerfile and docker-compose.yml for self-hosted deployment with environment configuration.
  - **Files**:
    - `Dockerfile`: Multi-stage Next.js production build
    - `docker-compose.yml`: Full stack with app service
    - `docker-compose.override.yml`: Development overrides
    - `.dockerignore`: Docker ignore patterns
    - `scripts/docker-entrypoint.sh`: Container startup script
  - **Step Dependencies**: Step 1
  - **User Instructions**: 
    1. Copy `.env.example` to `.env` and fill in production values
    2. Run `docker-compose up -d` to start
    3. Access at `http://localhost:3000`

- [ ] Step 40: Configure Vercel deployment
  - **Task**: Set up Vercel configuration for cloud deployment with proper environment variables and build settings.
  - **Files**:
    - `vercel.json`: Vercel configuration (regions, functions)
    - `.env.production.example`: Production environment template
    - `README.md`: Deployment documentation
  - **Step Dependencies**: Step 1
  - **User Instructions**:
    1. Push to GitHub repository
    2. Import project in Vercel dashboard
    3. Add all environment variables from `.env.production.example`
    4. Deploy

## Phase 18: Final Polish

- [ ] Step 41: Add loading states and error boundaries
  - **Task**: Implement comprehensive loading skeletons, error boundaries, and empty states throughout the application.
  - **Files**:
    - `components/ui/loading-skeleton.tsx`: Reusable loading skeleton variants
    - `components/error-boundary.tsx`: React error boundary component
    - `app/error.tsx`: Root error page
    - `app/(dashboard)/projects/loading.tsx`: Projects list loading state
    - `app/(dashboard)/projects/[projectId]/loading.tsx`: Project loading state
    - `components/empty-states/no-projects.tsx`: No projects empty state
    - `components/empty-states/no-messages.tsx`: No messages empty state
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] Step 42: Implement keyboard shortcuts and accessibility
  - **Task**: Add keyboard shortcuts for common actions and ensure accessibility compliance (ARIA labels, focus management).
  - **Files**:
    - `hooks/use-keyboard-shortcuts.ts`: Keyboard shortcut handler
    - `components/keyboard-shortcuts-dialog.tsx`: Shortcuts help modal
    - `lib/utils/accessibility.ts`: Accessibility utilities
    - Update various components with ARIA labels and keyboard handlers
  - **Step Dependencies**: Steps 7, 13, 17
  - **User Instructions**: None

- [ ] Step 43: Add toast notifications and feedback
  - **Task**: Implement toast notification system for success, error, and info messages throughout the app.
  - **Files**:
    - `components/providers/toast-provider.tsx`: Toast context provider
    - `hooks/use-toast.ts`: Toast hook (update from shadcn)
    - `lib/utils/notifications.ts`: Notification helper functions
    - Update various components to show appropriate toasts
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] Step 44: Performance optimization
  - **Task**: Add React Query configuration for caching, implement virtual scrolling for long lists, and optimize bundle size.
  - **Files**:
    - `package.json`: Add @tanstack/react-virtual dependency
    - `components/providers/query-provider.tsx`: React Query provider with config
    - `components/chat/virtualized-message-list.tsx`: Virtual scrolling for messages
    - `lib/utils/lazy-import.ts`: Dynamic import utilities
    - `next.config.js`: Update with bundle analysis, optimization settings
  - **Step Dependencies**: Steps 13, 8
  - **User Instructions**: Run `npm install @tanstack/react-query @tanstack/react-virtual`
```

---

## Implementation Summary

### Approach
This plan follows a foundation-first strategy, establishing the core infrastructure before layering in features. The sequence ensures each step has its dependencies satisfied:

1. **Steps 1-6**: Project foundation, auth, and dual database setup (Supabase + IndexedDB)
2. **Steps 7-9**: Dashboard layout and project navigation structure
3. **Steps 10-12**: LLM provider abstraction and API key management
4. **Steps 13-18**: Core three-phase workflow (Request → Spec → Plan)
5. **Steps 19-24**: Advanced features (attachments, multi-model comparison, cherry-pick)
6. **Steps 25-27**: Cost estimation and version snapshots
7. **Steps 28-31**: Offline-first sync engine
8. **Steps 32-35**: Export, model config, webhooks, analytics
9. **Steps 36-40**: Testing and deployment
10. **Steps 41-44**: Polish and optimization

### Key Considerations

**Critical paths to watch:**
- LLM streaming must work reliably before building comparison features
- Local-first sync should be tested thoroughly before relying on it
- API key encryption is security-critical—test edge cases

**Testing strategy:**
- Unit tests for pure logic (parsers, estimation, conflict resolution)
- Integration tests for API routes with mocked providers
- E2E tests for critical user journeys

**Deployment flexibility:**
- Docker for self-hosted on your Hetzner/Proxmox setup
- Vercel for quick cloud deployment
- Both share the same codebase and env var structure

### Total Steps: 44
### Estimated Files: ~200
### Recommended Execution: Sequential, with testing after each phase