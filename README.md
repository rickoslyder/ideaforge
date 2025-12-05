# IdeaForge

A three-phase idea development tool that transforms rough concepts into implementation-ready plans through structured LLM collaboration.

## Features

- **Three-Phase Workflow**: Request → Specification → Implementation Plan
- **Multi-Model Support**: OpenAI (GPT-5.1, O3), Anthropic (Claude Opus 4.5, Sonnet 4.5), Google (Gemini 3 Pro), Ollama
- **Offline-First**: Local IndexedDB storage with background sync to Supabase
- **Version History**: Automatic and manual snapshots with restore capability
- **Export Options**: Single file (Markdown/JSON) or individual files (ZIP archive)
- **Encrypted API Keys**: Store your LLM provider keys securely

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| Local Storage | Dexie.js (IndexedDB) |
| State | Zustand + React Query |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase instance (self-hosted or cloud)
- Clerk account for authentication
- At least one LLM provider API key

### Installation

```bash
# Clone the repository
git clone https://github.com/rickoslyder/ideaforge.git
cd ideaforge

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_SECRET=your-32-byte-secret

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### Database Setup

Run the migration in your Supabase SQL editor:

```sql
-- Located at: supabase/migrations/001_initial_schema.sql
```

This creates the required tables:
- `user_preferences`
- `projects`
- `messages`
- `attachments`
- `api_keys`
- `project_snapshots`

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start
```

## Usage

### Three-Phase Workflow

1. **Request Phase**
   - Start with a rough idea
   - Chat with the AI to refine requirements
   - Extract structured request when ready

2. **Specification Phase**
   - Configure which sections to generate
   - Set detail level (brief/standard/detailed)
   - Generate technical specification

3. **Plan Phase**
   - Generate step-by-step implementation plan
   - Includes file listings per step
   - Track progress through tasks

### Adding API Keys

1. Go to Settings → API Keys
2. Add your provider credentials:
   - **OpenAI**: API key from platform.openai.com
   - **Anthropic**: API key from console.anthropic.com
   - **Google**: API key from aistudio.google.dev
   - **Ollama**: Local endpoint (default: http://localhost:11434)

### Exporting Projects

Export your work in multiple formats:

**Single File**
- Markdown (.md) - All content in one document
- JSON (.json) - Structured data format
- Clipboard - Copy to clipboard

**Individual Files (ZIP)**
- Markdown Files - Separate .md per phase
- JSON Files - Separate .json per phase

ZIP contents:
```
project_name/
├── README.md              # Project overview
├── metadata.json          # Project metadata
├── 01_request.md          # Request phase
├── 02_specification.md    # Specification phase
└── 03_implementation_plan.md  # Plan phase
```

### Version History

- **Automatic snapshots**: Created before major changes
- **Manual snapshots**: Create anytime via Version History
- **Restore**: Revert to any previous snapshot

## Project Structure

```
ideaforge/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application
│   │   └── projects/      # Project pages
│   └── api/               # API routes
│       ├── llm/           # LLM proxy endpoints
│       └── projects/      # Project API
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── chat/             # Chat interface
│   ├── phases/           # Phase-specific components
│   └── export/           # Export functionality
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   ├── db/               # Supabase queries
│   ├── local-db/         # IndexedDB (Dexie.js)
│   ├── llm/              # LLM provider abstraction
│   └── export/           # Export utilities
├── contexts/              # React contexts
├── types/                 # TypeScript definitions
└── supabase/             # Database migrations
```

## Supported Models

### OpenAI
- GPT-5.1, GPT-5, GPT-5 Mini
- GPT-4o, GPT-4o Mini
- O3, O3 Mini, O1, O1 Mini

### Anthropic
- Claude Opus 4.5
- Claude Sonnet 4.5, Sonnet 4
- Claude Haiku 3.5

### Google
- Gemini 3.0 Pro Preview
- Gemini 2.5 Pro, 2.5 Flash
- Gemini 2.0 Flash

### Ollama (Local)
- Llama 3.3 70B
- Qwen3 32B
- DeepSeek R1 70B, V3

## Development

```bash
# Run development server
npm run dev

# Lint code
npm run lint

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Clerk](https://clerk.com/) - Authentication
- [Supabase](https://supabase.com/) - Database
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
