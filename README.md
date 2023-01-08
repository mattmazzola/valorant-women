# Running Locally

1. Start Docker Desktop
1. Start SQL Service

    ```
    docker compose up
    ```

## References

### Azure Cosmos DB State Store Configuration

https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-azure-cosmosdb/

### Dapr Docker Compose Sample

https://github.com/dapr/samples/tree/master/hello-docker-compose


https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-redis/#querying-json-objects-optional

https://docs.dapr.io/developing-applications/building-blocks/secrets/howto-secrets/

https://docs.dapr.io/operations/components/component-secrets/

https://redis.io/docs/stack/get-started/install/docker/

## Deployment

### Execute Deployment

```azcli
az login
az account set -n "375b0f6d-8ad5-412d-9e11-15d36d14dc63"
az account show --query "name"
az acr login --name mattmazzolaacr

./pipelines/scripts/deploy.ps1
```
