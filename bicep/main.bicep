var uniqueRgString = take(uniqueString(resourceGroup().id), 6)

module database 'modules/cosmosDatabase.bicep' = {
  name: 'databaseModule'
  params: {
    uniqueRgString: uniqueRgString
  }
}
