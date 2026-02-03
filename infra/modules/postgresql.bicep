/**
 * PostgreSQL Flexible Server for application data
 */

@description('Name of the PostgreSQL server')
param name string

@description('Azure region')
param location string

@description('Tags to apply to resources')
param tags object = {}

@description('Administrator username')
param administratorLogin string

@description('Administrator password')
@secure()
param administratorLoginPassword string

@description('Database name')
param databaseName string = 'linear_teams'

@description('SKU name (e.g., Standard_B1ms)')
param skuName string = 'Standard_B1ms'

@description('SKU tier')
@allowed(['Burstable', 'GeneralPurpose', 'MemoryOptimized'])
param skuTier string = 'Burstable'

@description('Storage size in GB')
param storageSizeGB int = 32

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    version: '16'
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    storage: {
      storageSizeGB: storageSizeGB
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Allow Azure services to access the server
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

@description('PostgreSQL server name')
output serverName string = postgresServer.name

@description('PostgreSQL server FQDN')
output fqdn string = postgresServer.properties.fullyQualifiedDomainName

@description('Database name')
output databaseName string = database.name

@description('PostgreSQL connection string')
output connectionString string = 'postgresql://${administratorLogin}:${administratorLoginPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${database.name}?sslmode=require'

@description('PostgreSQL server resource ID')
output id string = postgresServer.id
