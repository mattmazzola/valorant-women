$resourceGroupName = "wov"
$resourceGroupLocation = "westus3"

Import-Module "$PSScriptRoot/common.psm1" -Force
# Import-Module "./pipelines/scripts/common.psm1" -Force

Write-Step "Create Resource Group"
az group create -l $resourceGroupLocation -g $resourceGroupName --query name -o tsv

Write-Step "Provision Resources"
az deployment group create -g $resourceGroupName -f ./bicep/main.bicep --query "properties.provisioningState" -o tsv

Write-Step "Query params from Azure"
$dbAccountUrl = $(az cosmosdb show -g wov --name wov-db --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g wov --name wov-db --query "primaryMasterKey" -o tsv)
$containerAppsEnvResourceId = $(az containerapp env show -g wov -n wov-containerappsenv --query "id" -o tsv)
$acrJson = $(az acr credential show -n mattmazzolaacr --query "{ username:username, password:passwords[0].value }" | ConvertFrom-Json)
$registryUrl = $(az acr show -g wov -n mattmazzolaacr --query "loginServer" -o tsv)
$registryUsername = $acrJson.username
$registryPassword = $acrJson.password

$data = [ordered]@{
    "dbAccountUrl"               = $dbAccountUrl
    "dbKey"                      = "$($dbKey.Substring(0, 5))..."
    "containerAppsEnvResourceId" = $containerAppsEnvResourceId
    "registryUrl"                = $registryUrl
    "registryUsername"           = $registryUsername
    "registryPassword"           = "$($registryPassword.Substring(0, 5))..."
}

Write-Hash "Data" $data

$serviceContainerName = "$resourceGroupName-service"
$serviceImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$serviceImageName = "${registryUrl}/${serviceContainerName}:${serviceImageTag}"


Write-Step "Build and Push $serviceImageName Image"
docker build -t $serviceImageName ./service
docker push $serviceImageName
# TODO: Investigate why using 'az acr build' does not work
# az acr build -r $registryUrl -t $serviceImageName ./service

Write-Step "Deploy $serviceImageName Container App"
$serviceBicepContainerDeploymentFilePath = "$PSScriptRoot/../../bicep/modules/serviceContainerApp.bicep"
# $serviceBicepContainerDeploymentFilePath = "./bicep/modules/serviceContainerApp.bicep"
$serviceFqdn = $(az deployment group create `
    -g $resourceGroupName `
    -f $serviceBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$containerAppsEnvResourceId `
      registryUrl=$registryUrl `
      registryUsername=$registryUsername `
      registryPassword=$registryPassword `
      imageName=$serviceImageName `
      containerName=$serviceContainerName `
      databaseAccountUrl=$dbAccountUrl `
      databaseKey=$dbKey `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$apiUrl = "https://$serviceFqdn"
Write-Output $apiUrl

$clientContainerName = "$resourceGroupName-client"
$clientImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$clientImageName = "${registryUrl}/${clientContainerName}:${clientImageTag}"

Write-Step "Build and Push $clientImageName Image"
az acr build -r $registryUrl -t $clientImageName ./client-remix

Write-Step "Deploy $clientImageName Container App"
$clientBicepContainerDeploymentFilePath = "$PSScriptRoot/../../bicep/modules/clientContainerApp.bicep"
$clientFqdn = $(az deployment group create `
    -g $resourceGroupName `
    -f $clientBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$containerAppsEnvResourceId `
      registryUrl=$registryUrl `
      registryUsername=$registryUsername `
      registryPassword=$registryPassword `
      imageName=$clientImageName `
      containerName=$clientContainerName `
      apiUrl=$apiUrl `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$clientUrl = "https://$clientFqdn"
Write-Output $clientUrl

Write-Output "Service URL: $apiUrl"
Write-Output "Client URL: $clientUrl"