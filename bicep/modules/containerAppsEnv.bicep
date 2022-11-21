param name string = '${resourceGroup().name}-containerappenv'
param location string = resourceGroup().location
param logAnalyticsCustomerId string

resource containerAppEnv 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: name
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
      }
    }
  }
}

output resourceId string = containerAppEnv.id
