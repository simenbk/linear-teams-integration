# Multi-stage Dockerfile for Linear-Teams Integration
# Usage: docker build --target <app-name> -t linear-teams/<app-name> .

# =============================================================================
# Stage 1: Build all packages
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/linear-client/package.json ./packages/linear-client/
COPY packages/teams-client/package.json ./packages/teams-client/
COPY packages/db/package.json ./packages/db/
COPY packages/queue/package.json ./packages/queue/
COPY apps/bot/package.json ./apps/bot/
COPY apps/webhooks/package.json ./apps/webhooks/
COPY apps/processor/package.json ./apps/processor/

# Install dependencies
RUN npm ci

# Copy TypeScript configs
COPY tsconfig.base.json tsconfig.json ./

# Copy and build packages
COPY packages/ ./packages/
RUN npm run build --workspace=@linear-teams/shared
RUN npm run build --workspace=@linear-teams/linear-client
RUN npm run build --workspace=@linear-teams/teams-client
RUN npm run build --workspace=@linear-teams/db
RUN npm run build --workspace=@linear-teams/queue

# Copy and build apps
COPY apps/ ./apps/
RUN npm run build --workspace=@linear-teams/bot
RUN npm run build --workspace=@linear-teams/webhooks
RUN npm run build --workspace=@linear-teams/processor

# =============================================================================
# Stage 2: Teams Bot Function App
# =============================================================================
FROM mcr.microsoft.com/azure-functions/node:4-node20 AS bot

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    FUNCTIONS_WORKER_RUNTIME=node

WORKDIR /home/site/wwwroot

# Copy package.json and host.json
COPY apps/bot/host.json ./
COPY --from=builder /app/apps/bot/package.json ./

# Copy built app
COPY --from=builder /app/apps/bot/dist ./dist

# Copy all node_modules (includes all transitive dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace packages built artifacts into node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@linear-teams/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@linear-teams/shared/
COPY --from=builder /app/packages/teams-client/dist ./node_modules/@linear-teams/teams-client/dist
COPY --from=builder /app/packages/teams-client/package.json ./node_modules/@linear-teams/teams-client/
COPY --from=builder /app/packages/db/dist ./node_modules/@linear-teams/db/dist
COPY --from=builder /app/packages/db/package.json ./node_modules/@linear-teams/db/
COPY --from=builder /app/packages/queue/dist ./node_modules/@linear-teams/queue/dist
COPY --from=builder /app/packages/queue/package.json ./node_modules/@linear-teams/queue/

EXPOSE 80

# =============================================================================
# Stage 3: Linear Webhooks Function App
# =============================================================================
FROM mcr.microsoft.com/azure-functions/node:4-node20 AS webhooks

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    FUNCTIONS_WORKER_RUNTIME=node

WORKDIR /home/site/wwwroot

# Copy package.json and host.json
COPY apps/webhooks/host.json ./
COPY --from=builder /app/apps/webhooks/package.json ./

# Copy built app
COPY --from=builder /app/apps/webhooks/dist ./dist

# Copy all node_modules (includes all transitive dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace packages built artifacts into node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@linear-teams/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@linear-teams/shared/
COPY --from=builder /app/packages/linear-client/dist ./node_modules/@linear-teams/linear-client/dist
COPY --from=builder /app/packages/linear-client/package.json ./node_modules/@linear-teams/linear-client/
COPY --from=builder /app/packages/db/dist ./node_modules/@linear-teams/db/dist
COPY --from=builder /app/packages/db/package.json ./node_modules/@linear-teams/db/
COPY --from=builder /app/packages/queue/dist ./node_modules/@linear-teams/queue/dist
COPY --from=builder /app/packages/queue/package.json ./node_modules/@linear-teams/queue/

EXPOSE 80

# =============================================================================
# Stage 4: Queue Processor Function App
# =============================================================================
FROM mcr.microsoft.com/azure-functions/node:4-node20 AS processor

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    FUNCTIONS_WORKER_RUNTIME=node

WORKDIR /home/site/wwwroot

# Copy package.json and host.json
COPY apps/processor/host.json ./
COPY --from=builder /app/apps/processor/package.json ./

# Copy built app
COPY --from=builder /app/apps/processor/dist ./dist

# Copy all node_modules (includes all transitive dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace packages built artifacts into node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@linear-teams/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@linear-teams/shared/
COPY --from=builder /app/packages/linear-client/dist ./node_modules/@linear-teams/linear-client/dist
COPY --from=builder /app/packages/linear-client/package.json ./node_modules/@linear-teams/linear-client/
COPY --from=builder /app/packages/teams-client/dist ./node_modules/@linear-teams/teams-client/dist
COPY --from=builder /app/packages/teams-client/package.json ./node_modules/@linear-teams/teams-client/
COPY --from=builder /app/packages/db/dist ./node_modules/@linear-teams/db/dist
COPY --from=builder /app/packages/db/package.json ./node_modules/@linear-teams/db/
COPY --from=builder /app/packages/queue/dist ./node_modules/@linear-teams/queue/dist
COPY --from=builder /app/packages/queue/package.json ./node_modules/@linear-teams/queue/

EXPOSE 80
