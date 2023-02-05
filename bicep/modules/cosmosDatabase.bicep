resource cosmosDatabaseAccount 'Microsoft.DocumentDB/databaseAccounts@2022-08-15' existing = {
  name: 'shared-klgoyi-cosmos'
}

param databaseName string = 'valorantwomen'

resource cosmosSqlDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2022-08-15' = {
  parent: cosmosDatabaseAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

param containerName string = 'ratings'

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-08-15' = {
  parent: cosmosSqlDatabase
  name: containerName
  properties: {
    resource: {
      id: containerName
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
      uniqueKeyPolicy: {
        uniqueKeys: [
          {
            paths: [
              '/userId'
              '/isWomen'
            ]
          }
        ]
      }
      conflictResolutionPolicy: {
        mode: 'LastWriterWins'
        conflictResolutionPath: '/_ts'
      }
    }
  }
}


output accountName string = cosmosDatabaseAccount.name
output databaseName string = cosmosSqlDatabase.name
output containerName string = cosmosContainer.name
