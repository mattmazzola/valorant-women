$resourceGroupName = 'wov'
$dbName = 'wov-db'

$dbAccountUrl = $(az cosmosdb show -g $resourceGroupName --name $dbName --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g $resourceGroupName --name $dbName --query "primaryMasterKey" -o tsv)

$envContent = "COSMOSDB_ACCOUNT=$dbAccountUrl
COSMOSDB_KEY=$dbKey
"

$serviceEnvFileLocation = Resolve-Path "$PSScriptRoot/../../service/.env.local"

Set-Content -Path $serviceEnvFileLocation $envContent

Write-Output "Successfully wrote $serviceEnvFileLocation"