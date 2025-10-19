Param([switch]$WhatIf = $True)

echo "PScriptRoot: $PScriptRoot"
$repoRoot = if ('' -eq $PScriptRoot) {
  "$PSScriptRoot/../.."
}
else {
  "."
}

echo "Repo Root: $repoRoot"

Import-Module "$repoRoot/../shared-resources/pipelines/scripts/common.psm1" -Force

$inputs = @{
  "WhatIf" = $WhatIf
}

Write-Hash "Inputs" $inputs

$sharedResourceGroupName = "shared"
$sharedRgString = 'zkpwxz'
$wovResourceGroupName = "wov"
$wovResourceGroupLocation = "westus3"

$sharedResourceNames = Get-ResourceNames $sharedResourceGroupName $sharedRgString

Write-Step "Create Resource Group: $wovResourceGroupName"
az group create -l $wovResourceGroupLocation -g $wovResourceGroupName --query name -o tsv

$envFilePath = $(Resolve-Path "$repoRoot/.env").Path
Write-Step "Get ENV Vars from: $envFilePath"
$clerkPublishableKey = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'CLERK_PUBLISHABLE_KEY'
$clerkSecretKey = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'CLERK_SECRET_KEY'
$cookieSecret = Get-EnvVarFromFile -envFilePath $envFilePath -variableName 'COOKIE_SECRET'

Write-Step "Fetch params from Azure"
$sharedResourceNames = Get-ResourceNames $sharedResourceGroupName $sharedRgString
$sharedResourceVars = Get-SharedResourceDeploymentVars $sharedResourceGroupName $sharedRgString

# Authenticate to Azure Container Registry
$registryName = $($sharedResourceVars.registryUrl).Split('.')[0]

Write-Step "Login to Azure Container Registry: $registryName"
az acr login --name $registryName

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to authenticate to Azure Container Registry '$registryName'. Exiting early to prevent deployment failures."
  exit 1
}

Write-Step "Verify Azure Container Registry authentication"
az acr repository list --name $registryName --query "[0]" -o tsv | Out-Null

if ($LASTEXITCODE -ne 0) {
  Write-Error "Authentication verification failed for Azure Container Registry '$registryName'. Exiting early to prevent deployment failures."
  exit 1
}

$dbAccountUrl = $(az cosmosdb show -g $sharedResourceGroupName --name $sharedResourceNames.cosmosDatabase --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g $sharedResourceGroupName --name $sharedResourceNames.cosmosDatabase --query "primaryMasterKey" -o tsv)

$serviceContainerName = "$wovResourceGroupName-service"
$serviceImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$serviceImageName = "$($sharedResourceVars.registryUrl)/${serviceContainerName}:${serviceImageTag}"

$clientContainerName = "$wovResourceGroupName-client"
$clientImageTag = $(Get-Date -Format "yyyyMMddhhmm")
$clientImageName = "$($sharedResourceVars.registryUrl)/${clientContainerName}:${clientImageTag}"
$secretCharRevealLength = 10

$data = [ordered]@{
  "clerkPublishableKey"        = $clerkPublishableKey
  "clerkSecretKey"             = "$($clerkSecretKey.Substring(0, $secretCharRevealLength))..."

  "cookieSecret"               = "$($cookieSecret.Substring(0, $secretCharRevealLength))..."

  "dbAccountUrl"               = $dbAccountUrl
  "dbKey"                      = "$($dbKey.Substring(0, $secretCharRevealLength))..."

  "serviceImageName"           = $serviceImageName
  "clientImageName"            = $clientImageName

  "containerAppsEnvResourceId" = $($sharedResourceVars.containerAppsEnvResourceId)
  "registryUrl"                = $($sharedResourceVars.registryUrl)
  "registryUsername"           = $($sharedResourceVars.registryUsername)
  "registryPassword"           = "$($($sharedResourceVars.registryPassword).Substring(0, $secretCharRevealLength))..."
}

Write-Hash "Data" $data

Write-Step "Provision Additional $sharedResourceGroupName Resources (What-If: $($WhatIf))"
$mainBicepFilePath = $(Resolve-Path "$repoRoot/bicep/main.bicep").Path

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $sharedResourceGroupName `
    -f $mainBicepFilePath `
    --what-if
}
else {
  az deployment group create `
    -g $sharedResourceGroupName `
    -f $mainBicepFilePath `
    --query "properties.provisioningState" `
    -o tsv
}


Write-Step "Provision $schultzTablesResourceGroupName Resources (What-If: $($WhatIf))"

Write-Step "Build $serviceImageName Image (What-If: $($WhatIf))"
docker build -t $serviceImageName ./service

if ($WhatIf -eq $False) {
  Write-Step "Push $serviceImageName Image (What-If: $($WhatIf))"
  docker push $serviceImageName
}
else {
  Write-Step "Skipping Push $serviceImageName Image (What-If: $($WhatIf))"
}

Write-Step "Get Top Image from $($sharedResourceVars.registryUrl) respository $serviceContainerName to Verify Push (What-If: $($WhatIf))"
az acr repository show-tags --name $($sharedResourceVars.registryUrl)  --repository $serviceContainerName --orderby time_desc --top 1 -o tsv

# TODO: Investigate why using 'az acr build' does not work
# az acr build -r $registryUrl -t $serviceImageName ./service

Write-Step "Deploy $serviceImageName Container App (What-If: $($WhatIf))"
$serviceBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/serviceContainerApp.bicep"

$apiUrl = "None: What-If Deployment"

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $wovResourceGroupName `
    -f $serviceBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$serviceImageName `
    containerName=$serviceContainerName `
    databaseAccountUrl=$dbAccountUrl `
    databaseKey=$dbKey `
    --what-if
}
else {
  $serviceFqdn = $(az deployment group create `
      -g $wovResourceGroupName `
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
}

Write-Step "Build and Push $clientImageName Image (What-If: $($WhatIf))"
az acr build -r $($sharedResourceVars.registryUrl) -t $clientImageName "$repoRoot/client-remix"

Write-Step "Get Top Image from $($sharedResourceVars.registryUrl) respository $clientContainerName to Verify Push (What-If: $($WhatIf))"
az acr repository show-tags --name $($sharedResourceVars.registryUrl)  --repository $clientContainerName --orderby time_desc --top 1 -o tsv

Write-Step "Deploy $clientImageName Container App (What-If: $($WhatIf))"
$clientBicepContainerDeploymentFilePath = "$repoRoot/bicep/modules/clientContainerApp.bicep"

$clientUrl = "None: What-If Deployment"

if ($WhatIf -eq $True) {
  az deployment group create `
    -g $wovResourceGroupName `
    -f $clientBicepContainerDeploymentFilePath `
    -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
    registryUrl=$($sharedResourceVars.registryUrl) `
    registryUsername=$($sharedResourceVars.registryUsername) `
    registryPassword=$($sharedResourceVars.registryPassword) `
    imageName=$clientImageName `
    containerName=$clientContainerName `
    apiUrl=$apiUrl `
    clerkPublishableKey=$clerkPublishableKey `
    clerkSecretKey=$clerkSecretKey `
    cookieSecret=$cookieSecret `
    --what-if
}
else {
  $clientFqdn = $(az deployment group create `
      -g $wovResourceGroupName `
      -f $clientBicepContainerDeploymentFilePath `
      -p managedEnvironmentResourceId=$($sharedResourceVars.containerAppsEnvResourceId) `
      registryUrl=$($sharedResourceVars.registryUrl) `
      registryUsername=$($sharedResourceVars.registryUsername) `
      registryPassword=$($sharedResourceVars.registryPassword) `
      imageName=$clientImageName `
      containerName=$clientContainerName `
      apiUrl=$apiUrl `
      clerkPublishableKey=$clerkPublishableKey `
      clerkSecretKey=$clerkSecretKey `
      cookieSecret=$cookieSecret `
      --query "properties.outputs.fqdn.value" `
      -o tsv)

  $clientUrl = "https://$clientFqdn"
  Write-Output $clientUrl
}

Write-Step "App URLs"
Write-Output "Service URL: $apiUrl"
Write-Output "Client URL: $clientUrl"
