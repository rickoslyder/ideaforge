# IdeaForge

## Project Description
A three-phase idea development tool that guides users from rough concept to implementation-ready plan through structured LLM-powered collaboration. The workflow follows: Request (collaborative ideation) → Spec (technical specification generation) → Plan (step-by-step implementation breakdown). 

Supports multi-model comparison via simultaneous inference, allowing users to evaluate outputs from different LLMs side-by-side and cherry-pick sections with AI-powered coherence validation. Built as a portable foundation for future expansion into APIs, MCP servers, and cross-platform apps.

## Target Audience
- Developers and technical founders who want to rapidly prototype ideas into actionable specs
- Solo builders who lack a "thought partner" for idea refinement
- Power users who want to compare model outputs before committing to a direction
- (Future) AI agents requiring structured planning tools via MCP

## Desired Features

### Core Workflow
- [ ] Request Phase: Collaborative chat interface
    - [ ] Streaming LLM responses
    - [ ] Structured output parsing (request markdown block extraction)
    - [ ] Conversation history with context management
    - [ ] "Mark as complete" action to advance to Spec phase
- [ ] Spec Phase: Technical specification generation
    - [ ] Configurable section inclusion (checkbox UI)
    - [ ] Per-section detail level (brief/standard/comprehensive)
    - [ ] Section reordering (drag-drop)
    - [ ] Section-level guidance (optional prompt per section)
    - [ ] Code examples toggle
    - [ ] Attach project context (files, URLs, text)
    - [ ] Regenerate with adjusted parameters
- [ ] Plan Phase: Implementation plan generation
    - [ ] Step-by-step task breakdown
    - [ ] File-level change descriptions
    - [ ] Dependency ordering
    - [ ] Regenerate capability
- [ ] Phase Navigation
    - [ ] Jump back to earlier phases
    - [ ] Regenerate downstream phases (creates new snapshot)
    - [ ] Clear phase progression indicator

### LLM Integration
- [ ] Multi-provider support
    - [ ] OpenAI
    - [ ] Anthropic
    - [ ] Google Gemini
    - [ ] Ollama (local)
    - [ ] Custom endpoints (LiteLLM compatible)
- [ ] Model selection
    - [ ] Project-level default model
    - [ ] Per-phase model override
- [ ] Simultaneous inference
    - [ ] Run user-defined N models in parallel
    - [ ] Dynamic comparison UI (columns → grid based on viewport/count)
    - [ ] Select preferred output to use
    - [ ] Cherry-pick sections from multiple outputs
    - [ ] LLM coherence judge validates merged output
        - [ ] Default: Gemini 2.5 Flash Lite (user-selectable)
        - [ ] Two modes: auto-smooth vs highlight-issues
- [ ] API key management (BYOK)
    - [ ] Secure encrypted storage (pgcrypto or client-side encryption)
    - [ ] Per-provider configuration
    - [ ] Custom endpoint URLs
- [ ] Token usage tracking per request
- [ ] Cost estimation before multi-model runs
    - [ ] Fetch pricing from LiteLLM's model_prices_and_context_window.json
    - [ ] Estimate based on input token count × model pricing
    - [ ] Show estimated vs actual cost after completion

### Project Management
- [ ] Project persistence (Supabase + local-first hybrid)
    - [ ] Offline support with sync
    - [ ] Conflict resolution surfaced to user
- [ ] Project listing and navigation
- [ ] Phase state management
- [ ] Version history
    - [ ] Simple snapshots with restore capability
    - [ ] Visual diff between versions (if low-maintenance implementation available)

### Context Attachments
- [ ] File upload support (100MB max)
    - [ ] PDF, DOCX, TXT, MD, code files
    - [ ] Images (with vision model support)
- [ ] URL paste
    - [ ] Fetch and extract content when possible (e.g., Jina Reader or similar)
    - [ ] Fallback to storing URL as reference
- [ ] Text field for inline context
- [ ] Attachment management per project

### Export & Portability
- [ ] Markdown export (full project or per-phase)
- [ ] JSON export (structured data for programmatic use)
- [ ] Clipboard copy (formatted for pasting into Claude/Cursor/ChatGPT)

### Authentication & Security
- [ ] Clerk authentication
- [ ] API key encryption at rest
- [ ] Single-user deployment (multi-tenant ready architecture)

### Deployment
- [ ] Vercel deployment support
- [ ] Self-hosted Docker Compose deployment
    - [ ] Environment variable configuration
    - [ ] Supabase connection (self-hosted compatible)

### Future Extensibility
- [ ] Architecture supports extraction to standalone API
- [ ] MCP server implementation (post-MVP, complexity-dependent)
- [ ] Cross-platform considerations (PWA-ready)

## Design Requests
- [ ] Clean, minimal interface focused on content
    - [ ] Distraction-free chat/editing experience
    - [ ] Typography-focused design (readable long-form content)
- [ ] Dark mode support (respect system preference)
- [ ] Responsive design (mobile-friendly)
- [ ] Phase progression indicator (visual stepper)
- [ ] Dynamic multi-model comparison layout
    - [ ] Side-by-side columns (2-3 models)
    - [ ] Grid layout (4+ models)
    - [ ] Viewport-aware transitions
- [ ] Drag-drop interactions for section reordering
- [ ] Cherry-pick UI for selecting sections across outputs
- [ ] Conflict resolution UI for sync issues
- [ ] Cost estimation display before expensive operations

## Other Notes
- Long conversation context management—may need summarization or sliding window for extended Request phase chats
- Structured output parsing can be unreliable—implement retry/repair logic with schema validation
- Streaming + structured output: parse incrementally where possible, fallback to complete response
- URL content extraction: consider Jina Reader API (free tier available) or r.jina.ai for reliable extraction
- File chunking strategy for large attachments approaching 100MB
- Architecture should keep MCP extraction feasible without major refactoring
- Consider rate limiting awareness for simultaneous multi-model calls
- LiteLLM pricing data can be cached locally with periodic refresh (daily or on-demand)
- Gemini 2.5 Flash Lite specifically for coherence judge (not 2.0)