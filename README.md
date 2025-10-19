# Running Locally

1. Start Docker Desktop
1. Start SQL Service

    ```
    docker compose up
    ```

## References

### Azure Cosmos DB State Store Configuration

<https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-azure-cosmosdb/>

### Dapr Docker Compose Sample

<https://github.com/dapr/samples/tree/master/hello-docker-compose>

<https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-redis/#querying-json-objects-optional>

<https://docs.dapr.io/developing-applications/building-blocks/secrets/howto-secrets/>

<https://docs.dapr.io/operations/components/component-secrets/>

<https://redis.io/docs/stack/get-started/install/docker/>

## Deployment

### Setup Context

```pwsh
az login
az account set -n "063c6fc2-7c81-47a7-8304-878a3bb4529b"
az account show --query "name"
az acr login --name sharedzkpwxzacr
```

### Verify Deployment

```pwsh
./pipelines/scripts/deploy.ps1
```

### Deploy

```pwsh
./pipelines/scripts/deploy.ps1 -WhatIf:$False
```

### Troubleshoot Error

```txt
upstream connect error or disconnect/reset before headers. retried and the latest reset reason: connection failure, transport failure reason: delayed connect error: 111
```
