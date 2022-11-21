
module logAnalytics 'modules/logAnalytics.bicep' = {
  name: 'logAnalytics'
}

module containerAppsEnv 'modules/containerAppsEnv.bicep' = {
  name: 'containerAppsEnv'
  params: {
    logAnalyticsCustomerId: logAnalytics.outputs.logAnalyticsCustomerId
  }
}

module containerApp 'modules/containerApp.bicep' = {
  name: 'containerApp'
  params: {
    managedEnvironmentResourceId: containerAppsEnv.outputs.resourceId
  }
}

