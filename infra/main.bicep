/**
 * Main infrastructure template for Linear-Teams Integration
 *
 * Resources:
 * - Azure Function Apps (bot, webhooks, processor)
 * - Azure Service Bus namespace with queues
 * - Azure Cosmos DB (or PostgreSQL)
 * - Application Insights
 * - Key Vault for secrets
 */

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for resources')
param baseName string = 'linear-teams'

// Variables
var resourcePrefix = '${baseName}-${environment}'
var tags = {
  environment: environment
  project: 'linear-teams-integration'
}

// TODO: Add resource definitions
// - Service Bus namespace and queues
// - Function App hosting plans
// - Function Apps
// - Cosmos DB account
// - Application Insights
// - Key Vault

output resourcePrefix string = resourcePrefix
output location string = location
