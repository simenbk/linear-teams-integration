/**
 * Service Bus Namespace with queues for async processing
 */

@description('Name of the Service Bus namespace')
param name string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object = {}

resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    minimumTlsVersion: '1.2'
  }
}

resource linearWebhooksQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'linear-webhooks'
  properties: {
    lockDuration: 'PT5M'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    requiresSession: false
    defaultMessageTimeToLive: 'P14D'
    deadLetteringOnMessageExpiration: true
    maxDeliveryCount: 10
  }
}

resource teamsSubmissionsQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'teams-submissions'
  properties: {
    lockDuration: 'PT5M'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    requiresSession: false
    defaultMessageTimeToLive: 'P14D'
    deadLetteringOnMessageExpiration: true
    maxDeliveryCount: 10
  }
}

var serviceBusEndpoint = '${serviceBusNamespace.id}/AuthorizationRules/RootManageSharedAccessKey'

@description('Service Bus namespace name')
output name string = serviceBusNamespace.name

@description('Service Bus connection string')
output connectionString string = listKeys(serviceBusEndpoint, serviceBusNamespace.apiVersion).primaryConnectionString

@description('Service Bus namespace resource ID')
output id string = serviceBusNamespace.id

@description('Linear webhooks queue name')
output linearWebhooksQueueName string = linearWebhooksQueue.name

@description('Teams submissions queue name')
output teamsSubmissionsQueueName string = teamsSubmissionsQueue.name
