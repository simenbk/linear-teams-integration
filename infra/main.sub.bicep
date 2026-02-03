/**
 * Subscription-scoped deployment for Linear-Teams Integration
 * Creates the resource group and deploys all resources into it
 */

targetScope = 'subscription'

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for resources')
param location string = 'norwayeast'

@description('Base name for resources')
param baseName string = 'linear-teams'

@description('Resource group name')
param resourceGroupName string = 'rg-linear-teams-integration'

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

// Create Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: {
    environment: environment
    project: 'linear-teams-integration'
  }
}

// Deploy all resources into the resource group
module main 'main.bicep' = {
  name: 'main-deployment'
  scope: rg
  params: {
    environment: environment
    location: location
    baseName: baseName
    microsoftAppId: microsoftAppId
    microsoftAppPassword: microsoftAppPassword
    linearApiKey: linearApiKey
    linearWebhookSecret: linearWebhookSecret
    postgresAdminLogin: postgresAdminLogin
    postgresAdminPassword: postgresAdminPassword
  }
}

// =============================================================================
// Outputs
// =============================================================================
output resourceGroupName string = rg.name
output resourcePrefix string = main.outputs.resourcePrefix
output location string = main.outputs.location

// Function App URLs
output botFunctionAppUrl string = main.outputs.botFunctionAppUrl
output webhooksFunctionAppUrl string = main.outputs.webhooksFunctionAppUrl
output processorFunctionAppUrl string = main.outputs.processorFunctionAppUrl

// Function App names (for deployment)
output botFunctionAppName string = main.outputs.botFunctionAppName
output webhooksFunctionAppName string = main.outputs.webhooksFunctionAppName
output processorFunctionAppName string = main.outputs.processorFunctionAppName

// Resource names
output storageAccountName string = main.outputs.storageAccountName
output serviceBusNamespace string = main.outputs.serviceBusNamespace
output postgresServerName string = main.outputs.postgresServerName
output appInsightsName string = main.outputs.appInsightsName

// Endpoints for configuration
output botMessagesEndpoint string = main.outputs.botMessagesEndpoint
output linearWebhookEndpoint string = main.outputs.linearWebhookEndpoint
