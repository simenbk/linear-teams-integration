/**
 * Main infrastructure template for Linear-Teams Integration
 *
 * Resources:
 * - Storage Account (Functions runtime)
 * - Service Bus Namespace with queues
 * - PostgreSQL Flexible Server
 * - Application Insights
 * - Azure Function Apps (bot, webhooks, processor)
 */

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for resources')
param baseName string = 'linear-teams'

@description('Microsoft App ID for the bot (from existing Bot Framework registration)')
@secure()
param microsoftAppId string

@description('Microsoft App Password for the bot')
@secure()
param microsoftAppPassword string

@description('Linear API key (can be added later via Azure Portal or CLI)')
@secure()
param linearApiKey string = ''

@description('Linear webhook signing secret (can be added later via Azure Portal or CLI)')
@secure()
param linearWebhookSecret string = ''

@description('PostgreSQL administrator username')
param postgresAdminLogin string = 'pgadmin'

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

// Variables
var resourcePrefix = '${baseName}-${environment}'
var tags = {
  environment: environment
  project: 'linear-teams-integration'
}
// Storage account names must be lowercase, 3-24 chars, alphanumeric only
var storageAccountName = replace('${take(baseName, 10)}${environment}sa', '-', '')

// =============================================================================
// Storage Account
// =============================================================================
module storage 'modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    name: storageAccountName
    location: location
    tags: tags
  }
}

// =============================================================================
// Service Bus
// =============================================================================
module serviceBus 'modules/service-bus.bicep' = {
  name: 'servicebus-deployment'
  params: {
    name: '${resourcePrefix}-bus'
    location: location
    tags: tags
  }
}

// =============================================================================
// PostgreSQL
// =============================================================================
module postgresql 'modules/postgresql.bicep' = {
  name: 'postgresql-deployment'
  params: {
    name: '${resourcePrefix}-pg'
    location: location
    tags: tags
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    databaseName: 'linear_teams'
    skuName: 'Standard_B1ms'
    skuTier: 'Burstable'
    storageSizeGB: 32
  }
}

// =============================================================================
// Application Insights
// =============================================================================
module appInsights 'modules/app-insights.bicep' = {
  name: 'appinsights-deployment'
  params: {
    name: '${resourcePrefix}-ai'
    location: location
    tags: tags
  }
}

// =============================================================================
// Function App - Bot
// =============================================================================
module botFunctionApp 'modules/function-app.bicep' = {
  name: 'func-bot-deployment'
  params: {
    name: '${resourcePrefix}-func-bot'
    location: location
    tags: tags
    storageAccountConnectionString: storage.outputs.connectionString
    appInsightsConnectionString: appInsights.outputs.connectionString
    appSettings: {
      MicrosoftAppId: microsoftAppId
      MicrosoftAppPassword: microsoftAppPassword
      DATABASE_URL: postgresql.outputs.connectionString
      SERVICE_BUS_CONNECTION_STRING: serviceBus.outputs.connectionString
      TEAMS_SUBMISSIONS_QUEUE: serviceBus.outputs.teamsSubmissionsQueueName
    }
  }
}

// =============================================================================
// Function App - Webhooks
// =============================================================================
module webhooksFunctionApp 'modules/function-app.bicep' = {
  name: 'func-webhooks-deployment'
  params: {
    name: '${resourcePrefix}-func-webhooks'
    location: location
    tags: tags
    storageAccountConnectionString: storage.outputs.connectionString
    appInsightsConnectionString: appInsights.outputs.connectionString
    appSettings: {
      LINEAR_WEBHOOK_SECRET: linearWebhookSecret
      DATABASE_URL: postgresql.outputs.connectionString
      SERVICE_BUS_CONNECTION_STRING: serviceBus.outputs.connectionString
      LINEAR_WEBHOOKS_QUEUE: serviceBus.outputs.linearWebhooksQueueName
    }
  }
}

// =============================================================================
// Function App - Processor
// =============================================================================
module processorFunctionApp 'modules/function-app.bicep' = {
  name: 'func-processor-deployment'
  params: {
    name: '${resourcePrefix}-func-processor'
    location: location
    tags: tags
    storageAccountConnectionString: storage.outputs.connectionString
    appInsightsConnectionString: appInsights.outputs.connectionString
    appSettings: {
      LINEAR_API_KEY: linearApiKey
      MicrosoftAppId: microsoftAppId
      MicrosoftAppPassword: microsoftAppPassword
      DATABASE_URL: postgresql.outputs.connectionString
      SERVICE_BUS_CONNECTION_STRING: serviceBus.outputs.connectionString
      LINEAR_WEBHOOKS_QUEUE: serviceBus.outputs.linearWebhooksQueueName
      TEAMS_SUBMISSIONS_QUEUE: serviceBus.outputs.teamsSubmissionsQueueName
    }
  }
}

// =============================================================================
// Outputs
// =============================================================================
output resourcePrefix string = resourcePrefix
output location string = location

// Function App URLs
output botFunctionAppUrl string = botFunctionApp.outputs.url
output webhooksFunctionAppUrl string = webhooksFunctionApp.outputs.url
output processorFunctionAppUrl string = processorFunctionApp.outputs.url

// Function App names (for deployment)
output botFunctionAppName string = botFunctionApp.outputs.name
output webhooksFunctionAppName string = webhooksFunctionApp.outputs.name
output processorFunctionAppName string = processorFunctionApp.outputs.name

// Resource names
output storageAccountName string = storage.outputs.name
output serviceBusNamespace string = serviceBus.outputs.name
output postgresServerName string = postgresql.outputs.serverName
output appInsightsName string = appInsights.outputs.name

// Endpoints for configuration
output botMessagesEndpoint string = '${botFunctionApp.outputs.url}/api/messages'
output linearWebhookEndpoint string = '${webhooksFunctionApp.outputs.url}/api/linear/webhook'
