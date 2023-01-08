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
az acr login
./pipelines/scripts/deploy.ps1
```
