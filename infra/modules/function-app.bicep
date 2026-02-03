/**
 * Reusable Function App module (Consumption plan)
 */

@description('Name of the Function App')
param name string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object = {}

@description('Storage account connection string for Functions runtime')
param storageAccountConnectionString string

@description('Application Insights connection string')
param appInsightsConnectionString string

@description('Additional app settings')
param appSettings object = {}

@description('Name of the App Service Plan (optional, creates new if not provided)')
param appServicePlanId string = ''

// Create consumption plan if not provided
resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = if (empty(appServicePlanId)) {
  name: '${name}-plan'
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true // Linux
  }
}

var planId = empty(appServicePlanId) ? hostingPlan.id : appServicePlanId

// Base app settings required for all Function Apps
var baseAppSettings = {
  FUNCTIONS_EXTENSION_VERSION: '~4'
  FUNCTIONS_WORKER_RUNTIME: 'node'
  WEBSITE_NODE_DEFAULT_VERSION: '~20'
  AzureWebJobsStorage: storageAccountConnectionString
  WEBSITE_CONTENTAZUREFILECONNECTIONSTRING: storageAccountConnectionString
  WEBSITE_CONTENTSHARE: toLower(name)
  APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
  WEBSITE_RUN_FROM_PACKAGE: '1'
}

// Merge base settings with additional settings
var allAppSettings = union(baseAppSettings, appSettings)

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: planId
    reserved: true
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'Node|20'
      appSettings: [for setting in items(allAppSettings): {
        name: setting.key
        value: setting.value
      }]
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      cors: {
        allowedOrigins: [
          'https://portal.azure.com'
        ]
      }
    }
  }
}

@description('Function App name')
output name string = functionApp.name

@description('Function App default hostname')
output defaultHostname string = functionApp.properties.defaultHostName

@description('Function App URL')
output url string = 'https://${functionApp.properties.defaultHostName}'

@description('Function App resource ID')
output id string = functionApp.id

@description('App Service Plan ID')
output appServicePlanId string = planId
