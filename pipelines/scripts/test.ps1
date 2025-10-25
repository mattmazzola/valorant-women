Param([switch]$WhatIf = $True)

$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath

# Find repo root by searching upward for README.md
$currentDir = $scriptDir
$repoRoot = $null
while ($currentDir -and -not $repoRoot) {
    if (Test-Path (Join-Path $currentDir "README.md")) {
        $repoRoot = $currentDir
    } else {
        $currentDir = Split-Path $currentDir
    }
}
if (-not $repoRoot) {
    throw "Could not find repo root (no README.md found in parent directories)."
}

echo "Script Path: $scriptPath"
echo "Script Dir: $scriptDir"
echo "Repo Root: $repoRoot"

$sharedModulePath = Resolve-Path "$repoRoot/../shared-resources/pipelines/scripts/common.psm1"

echo "Shared Module Path: $sharedModulePath"

Import-Module $sharedModulePath -Force

echo "Imports successful"
