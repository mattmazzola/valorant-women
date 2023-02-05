$sharedResourceGroupName = "shared"
$sharedRgString = 'klgoyi'
$resourceGroupName = "wov"
$resourceGroupLocation = "westus3"

echo "PScriptRoot: $PScriptRoot"
$repoRoot = If ('' -eq $PScriptRoot) {
  "$PSScriptRoot/../.."
}
else {
  "."
}

echo "Repo Root: $repoRoot"

Import-Module "C:/repos/shared-resources/pipelines/scripts/common.psm1" -Force

Write-Step "Create Resource Group: $resourceGroupName"
az group create -l $resourceGroupLocation -g $resourceGroupName --query name -o tsv

Write-Step "Provision Shared Resources"
$mainBicepFilePath = $(Resolve-Path "$repoRoot/bicep/main.bicep").Path
az deployment group create -g $sharedResourceGroupName -f $mainBicepFilePath --query "properties.provisioningState" -o tsv

$envFilePath = $(Resolve-Path "$repoRoot/.env").Path
Write-Step "Get ENV Vars from $envFilePath"
$auth0ReturnToUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_RETURN_TO_URL'
$auth0CallbackUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CALLBACK_URL'
$auth0ClientId = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_ID'
$auth0ClientSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_SECRET'
$auth0Domain = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_DOMAIN'
$auth0LogoutUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_LOGOUT_URL'
$auth0ManagementClientId = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_MANAGEMENT_APP_CLIENT_ID'
$auth0ManagementClientSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_MANAGEMENT_APP_CLIENT_SECRET'
$cookieSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'COOKIE_SECRET'

Write-Step "Fetch params from Azure"
$sharedResourceNames = Get-ResourceNames $sharedResourceGroupName $sharedRgString
$sharedResourceVars = Get-SharedResourceDeploymentVars $sharedResourceGroupName $sharedRgString

$dbAccountUrl = $(az cosmosdb show -g $sharedResourceGroupName --name $sharedResourceNames.cosmosDatabase --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g $sharedResourceGroupName --name $sharedResourceNames.cosmosDatabase --query "primaryMasterKey" -o tsv)

$serviceContainerName = "$resourceGroupName-service"
$serviceImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$serviceImageName = "$($sharedResourceVars.registryUrl)/${serviceContainerName}:${serviceImageTag}"

$clientContainerName = "$resourceGroupName-client"
$clientImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$clientImageName = "$($sharedResourceVars.registryUrl)/${clientContainerName}:${clientImageTag}"

$data = [ordered]@{
  "auth0ReturnToUrl"            = $auth0ReturnToUrl
  "auth0CallbackUrl"            = $auth0CallbackUrl
  "auth0ClientId"               = $auth0ClientId
  "auth0ClientSecret"           = "$($auth0ClientSecret.Substring(0, 5))..."
  "auth0Domain"                 = $auth0Domain
  "auth0LogoutUrl"              = $auth0LogoutUrl
  "auth0ManagementClientId"     = $auth0ManagementClientId
  "auth0ManagementClientSecret" = "$($auth0ManagementClientSecret.Substring(0, 5))..."

  "cookieSecret"                = "$($cookieSecret.Substring(0, 5))..."

  "dbAccountUrl"                = $dbAccountUrl
  "dbKey"                       = "$($dbKey.Substring(0, 5))..."

  "serviceImageName"            = $serviceImageName
  "clientImageName"             = $clientImageName

  "containerAppsEnvResourceId"  = $($sharedResourceVars.containerAppsEnvResourceId)
  "registryUrl"                 = $($sharedResourceVars.registryUrl)
  "registryUsername"            = $($sharedResourceVars.registryUsername)
  "registryPassword"            = "$($($sharedResourceVars.registryPassword).Substring(0, 5))..."
}

Write-Hash "Data" $data

Write-Step "Build and Push $serviceImageName Image"
docker build -t $serviceImageName ./service
docker push $serviceImageName
# TODO: Investigate why using 'az acr build' does not work
# az acr build -r $registryUrl -t $serviceImageName ./service

Write-Step "Deploy $serviceImageName Container App"
$serviceBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/serviceContainerApp.bicep"
$serviceFqdn = $(az deployment group create `
    -g $resourceGroupName `
    -f $serviceBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$serviceImageName `
    containerName=$serviceContainerName `
    databaseAccountUrl=$dbAccountUrl `
    databaseKey=$dbKey `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$apiUrl = "https://$serviceFqdn"
Write-Output $apiUrl

Write-Step "Build and Push $clientImageName Image"
az acr build -r $($sharedResourceVars.registryUrl) -t $clientImageName "$repoRoot/client-remix"

Write-Step "Deploy $clientImageName Container App"
$clientBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/clientContainerApp.bicep"
$clientFqdn = $(az deployment group create `
    -g $resourceGroupName `
    -f $clientBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$clientImageName `
    containerName=$clientContainerName `
    apiUrl=$apiUrl `
    auth0ReturnToUrl=$auth0ReturnToUrl `
    auth0CallbackUrl=$auth0CallbackUrl `
    auth0ClientId=$auth0ClientId `
    auth0ClientSecret=$auth0ClientSecret `
    auth0Domain=$auth0Domain `
    auth0LogoutUrl=$auth0LogoutUrl `
    auth0managementClientId=$auth0managementClientId `
    auth0managementClientSecret=$auth0managementClientSecret `
    cookieSecret=$cookieSecret `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$clientUrl = "https://$clientFqdn"
Write-Output $clientUrl

Write-Step "App URLs"
Write-Output "Service URL: $apiUrl"
Write-Output "Client URL: $clientUrl"