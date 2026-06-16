# IVA Cortex — Project Conventions

## Stack
- **Server**: Node.js 22+ (Express 5)
- **Database**: PostgreSQL 16
- **PDF**: Puppeteer (Chrome headless)
- **LLM**: OpenAI-compatible API (OpenAI, Groq, Together, etc.)

## Project structure
```
├── db/                # Schema, migrations, connection
├── src/
│   ├── server.js      # Express app entry point
│   ├── orchestrator.js # Full pipeline orchestrator
│   ├── admin/         # Admin web UI (static HTML/JS)
│   ├── intake/        # NLP extraction agent
│   ├── llm/           # LLM client + prompts
│   ├── middleware/     # Auth, validation
│   ├── pdf/           # HTML template + Puppeteer generator
│   └── quoting/       # Engine (pure math), builder, augmenter, repository
├── scripts/           # Dev tools
├── tests/             # Unit tests (node:test)
└── pdf_output/        # Generated PDFs
```

## Key rules
- **Never let AI do math**: All pricing in `quoting/engine.js` (pure functions, zero DB, zero LLM)
- **LLM only for text**: Extraction in `intake/extractor.js`, prose in `quoting/augmenter.js`
- **Validate LLM output**: Before writing to DB, validate against Zod schema
- **Env vars**: All config via `.env` (see `.env.example`)
- **Tests**: `node --test tests/**/*.test.js`

## Commands
| Command | Purpose |
|---|---|
| `npm start` | Start API server |
| `npm run dev` | Start with file watcher |
| `npm test` | Run all tests |
| `npm run demo` | CLI pipeline demo |
| `npm run db:migrate` | Apply schema to DB |
| `npm run db:seed` | Insert sample data |
| `npm run db:reset` | Drop + recreate + seed |

## API keys
Generate with: `node -e "console.log(require('./src/middleware/auth').generateApiKey())"`
Set `API_KEYS=key1,key2` in `.env` for production. Leave empty for dev (no auth).
