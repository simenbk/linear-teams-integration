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

There are two ways to run the services locally:

#### Option 1: Docker Compose (Recommended)

The easiest way to run all services locally with infrastructure:

```bash
# Copy environment file and configure
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up --build

# Or with development extras (Adminer for DB management)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Services will be available at:
- **Bot**: http://localhost:7071
- **Webhooks**: http://localhost:7072
- **Processor**: http://localhost:7073
- **Adminer** (dev only): http://localhost:8080
- **Azurite** (Storage): localhost:10000-10002
- **PostgreSQL**: localhost:5432

To expose webhooks to the internet (for Linear webhook testing):
```bash
# Requires NGROK_AUTHTOKEN in .env
docker compose --profile tunnel up
# Check ngrok dashboard at http://localhost:4040
```

#### Option 2: Native (without Docker)

1. Copy `.env.example` to `.env` and fill in the values
2. Copy `apps/*/local.settings.json.example` to `apps/*/local.settings.json`
3. Start the Azure Functions locally:

```bash
# In separate terminals:
cd apps/bot && npm start
cd apps/webhooks && npm start
cd apps/processor && npm start
```

Note: You'll need to provide your own PostgreSQL and Azure Service Bus instances.

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

## Docker

### Building Individual Services

```bash
# Build a specific service
docker build --target bot -t linear-teams/bot .
docker build --target webhooks -t linear-teams/webhooks .
docker build --target processor -t linear-teams/processor .
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| `bot` | 7071 | Teams bot Azure Function |
| `webhooks` | 7072 | Linear webhook receiver |
| `processor` | 7073 | Queue processor |
| `azurite` | 10000-10002 | Azure Storage emulator |
| `postgres` | 5432 | PostgreSQL database |
| `adminer` | 8080 | Database admin UI (dev only) |
| `ngrok` | 4040 | Tunnel for webhooks (optional) |

### Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f bot webhooks processor

# Rebuild after code changes
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

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
