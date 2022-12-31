# TODO: Requires putting api keys and secrets into KeyVault

$envContent = "API_URL=http://localhost:3002
PORT=3000

PASSWORDLESS_DEV_API_KEY=Matt:public:babb1e19c5cf443ba4d5e825d10e9eca
PASSWORDLESS_DEV_API_SECRET=
PASSWORDLESS_DEV_BACKEND_URL=
"

$clientEnvFileLocation = Resolve-Path "$PSScriptRoot/../../client-remix/.env"

Set-Content -Path $clientEnvFileLocation $envContent

Write-Output "Successfully wrote $clientEnvFileLocation"