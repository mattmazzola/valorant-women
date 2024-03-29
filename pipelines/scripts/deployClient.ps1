$resourceGroupName = "wov"

Import-Module "C:/repos/shared-resources/pipelines/scripts/common.psm1" -Force

$envFilePath = $(Resolve-Path "$PSScriptRoot/../../.env").Path
Write-Step "Get ENV Vars from $envFilePath"

$auth0ReturnToUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_RETURN_TO_URL'
$auth0CallbackUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CALLBACK_URL'
$auth0ClientId = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_ID'
$auth0ClientSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_CLIENT_SECRET'
$auth0Domain = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_DOMAIN'
$auth0LogoutUrl = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'AUTH0_LOGOUT_URL'
$cookieSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'COOKIE_SECRET'

Write-Step "Fetch params from Azure"
$containerAppsEnvName = 'wov-containerappsenv'
$containerAppsEnvResourceId = $(az containerapp env show -g $resourceGroupName -n $containerAppsEnvName --query "id" -o tsv)
$acrName = 'mattmazzolaacr'
$acrJson = $(az acr credential show -n $acrName --query "{ username:username, password:passwords[0].value }" | ConvertFrom-Json)
$registryUrl = $(az acr show -g wov -n $acrName --query "loginServer" -o tsv)
$registryUsername = $acrJson.username
$registryPassword = $acrJson.password

$serviceContainerAppName = 'wov-containerapp-service'
$serviceContainerAppInfo = $(az containerapp show -g $resourceGroupName -n $serviceContainerAppName --query "{ fqdn: properties.configuration.ingress.fqdn, image: properties.template.containers[0].image }" | ConvertFrom-Json)
$apiUrl = "https://$($serviceContainerAppInfo.fqdn)"
$serviceImageName = $serviceContainerAppInfo.image

$clientContainerName = "$resourceGroupName-client"
$clientImageTag = $(az acr repository show-tags -n $acrName --repository $clientContainerName --top 1 --orderby time_desc -o tsv)
$clientImageName = "${registryUrl}/${clientContainerName}:${clientImageTag}"

$data = [ordered]@{
  "auth0ReturnToUrl"           = $auth0ReturnToUrl
  "auth0CallbackUrl"           = $auth0CallbackUrl
  "auth0ClientId"              = $auth0ClientId
  "auth0ClientSecret"          = "$($auth0ClientSecret.Substring(0, 5))..."
  "auth0Domain"                = $auth0Domain
  "auth0LogoutUrl"             = $auth0LogoutUrl
  "cookieSecret"               = "$($cookieSecret.Substring(0, 5))..."

  "apiUrl"                     = $apiUrl
  "serviceImageName"           = $serviceImageName
  "clientImageName"            = $clientImageName

  "containerAppsEnvResourceId" = $containerAppsEnvResourceId
  "registryUrl"                = $registryUrl
  "registryUsername"           = $registryUsername
  "registryPassword"           = "$($registryPassword.Substring(0, 5))..."
}

Write-Hash "Data" $data

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
    auth0ReturnToUrl=$auth0ReturnToUrl `
    auth0CallbackUrl=$auth0CallbackUrl `
    auth0ClientId=$auth0ClientId `
    auth0ClientSecret=$auth0ClientSecret `
    auth0Domain=$auth0Domain `
    auth0Logout=$auth0LogoutUrl `
    cookieSecret=$cookieSecret `
    --query "properties.outputs.fqdn.value" `
    -o tsv)

$clientUrl = "https://$clientFqdn"
Write-Output $clientUrl

Write-Output "Service URL: $apiUrl"
Write-Output "Client URL: $clientUrl"