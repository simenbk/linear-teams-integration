/**
 * Storage Account for Azure Functions runtime
 */

@description('Name of the storage account')
param name string

@description('Azure region for the storage account')
param location string

@description('Tags to apply to resources')
param tags object = {}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    accessTier: 'Hot'
  }
}

@description('Storage account name')
output name string = storageAccount.name

@description('Storage account connection string')
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'

@description('Storage account resource ID')
output id string = storageAccount.id
