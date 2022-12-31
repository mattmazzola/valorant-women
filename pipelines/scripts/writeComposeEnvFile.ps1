$resourceGroupName = 'wov'
$dbResourceName = 'wov-db'
$dbId = 'valorantwomen'
$dbContainerId = 'ratings'

$dbAccountUrl = $(az cosmosdb show -g $resourceGroupName --name $dbResourceName --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g $resourceGroupName --name $dbResourceName --query "primaryMasterKey" -o tsv)

$envContent = "CLIENT_PORT=8080

API_HOST=0.0.0.0
API_PORT=3002

DAPR_HOST=localhost
DAPR_HTTP_PORT=3500

COSMOSDB_ACCOUNT=$dbAccountUrl
COSMOSDB_KEY=$dbKey
COSMOSDB_DATABASE_ID=$dbId
COSMOSDB_CONTAINER_ID=$dbContainerId
"

$rootEnvFileLocation = Resolve-Path "$PSScriptRoot/../../.env"

Set-Content -Path $rootEnvFileLocation $envContent

Write-Output "Successfully wrote $rootEnvFileLocation"