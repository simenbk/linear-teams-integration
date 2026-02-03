# Linear ↔ Teams Integration

A two-way integration between Microsoft Teams and Linear for multi-tenant environments. Submit bugs and feature requests from Teams to Linear, and receive Linear notifications back in Teams.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Teams Bot     │     │    Webhooks     │     │   Processor     │
│  (Azure Func)   │     │  (Azure Func)   │     │  (Azure Func)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │    ┌──────────────────┼──────────────────┐    │
         └────►   Azure Service Bus (Queues)        ◄────┘
              └──────────────────┬──────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │         Cosmos DB / Postgres         │
              │    (Tenant configs, sync mappings)   │
              └─────────────────────────────────────┘
```

### Apps

- **`apps/bot`** - Teams bot handling commands and Adaptive Card submissions
- **`apps/webhooks`** - Linear webhook receiver with signature verification
- **`apps/processor`** - Queue-triggered processor for syncing between Teams and Linear

### Packages

- **`packages/shared`** - Shared types, constants, and utilities
- **`packages/linear-client`** - Typed wrapper around @linear/sdk
- **`packages/teams-client`** - Proactive messaging and Adaptive Cards
- **`packages/db`** - Database repositories (tenant configs, sync mappings)
- **`packages/queue`** - Azure Service Bus publish/consume helpers

### Infrastructure

- **`infra/`** - Azure Bicep templates for deployment

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Azure Functions Core Tools v4
- Azure subscription (for deployment)
- Linear API key
- Microsoft Teams app registration

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

### Local Development

1. Copy `.env.example` to `.env` and fill in the values
2. Copy `apps/*/local.settings.json.example` to `apps/*/local.settings.json`
3. Start the Azure Functions locally:

```bash
# In separate terminals:
cd apps/bot && npm start
cd apps/webhooks && npm start
cd apps/processor && npm start
```

### Project Structure

```
├── apps/
│   ├── bot/                 # Teams bot Azure Function
│   ├── webhooks/            # Linear webhook receiver
│   └── processor/           # Queue processor
├── packages/
│   ├── shared/              # Shared types and utilities
│   ├── linear-client/       # Linear API wrapper
│   ├── teams-client/        # Teams messaging helpers
│   ├── db/                  # Database repositories
│   └── queue/               # Service Bus helpers
├── infra/                   # Azure Bicep templates
├── turbo.json               # Turborepo configuration
├── tsconfig.json            # TypeScript project references
└── package.json             # Workspace root
```

## Configuration

### Multi-Tenant Setup

Each tenant (Azure AD tenant) can have:
- One Linear organization connection
- Multiple channel configurations (Teams channel ↔ Linear team mappings)
- Per-channel sync settings (which events to sync)

### Environment Variables

See `.env.example` for required environment variables.

## Development

### Scripts

- `npm run build` - Build all packages
- `npm run dev` - Watch mode for all packages
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Fix linting issues
- `npm run typecheck` - Type check all packages
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

### Adding a New Package

1. Create the package directory under `packages/`
2. Add `package.json` with workspace dependencies
3. Add `tsconfig.json` extending the base config
4. Add reference to root `tsconfig.json`
5. Export from `src/index.ts`

## Deployment

### Azure Resources

Deploy infrastructure using Bicep:

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json
```

### CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every PR:
- Type checking
- Linting
- Format checking
- Build

## License

MIT
