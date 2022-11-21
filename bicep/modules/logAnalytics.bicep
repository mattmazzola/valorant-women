param name string = '${resourceGroup().name}-loganalytics'
param location string = resourceGroup().location

resource logAnalyticsResource 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: name
  location: location
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: -1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

output logAnalyticsCustomerId string = logAnalyticsResource.properties.customerId
