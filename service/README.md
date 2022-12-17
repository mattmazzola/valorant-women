# Service

## Running as container

```powershell
$dbAccountUrl = $(az cosmosdb show -g wov --name wov-db --query "documentEndpoint" -o tsv)
$dbKey = $(az cosmosdb keys list -g wov --name wov-db --query "primaryMasterKey" -o tsv)

docker build -t service .
docker run -it --rm `
    -p 3002:80 `
    --name 'wov-service' `
    -e NODE_ENV='development' `
    -e HOST='0.0.0.0' `
    -e PORT='80' `
    -e DAPR_HOST='localhost' `
    -e DAPR_HTTP_PORT='3500' `
    -e COSMOSDB_ACCOUNT=$dbAccountUrl `
    -e COSMOSDB_KEY=$dbKey `
    -e COSMOSDB_DATABASE_ID='womenofvalorant' `
    -e COSMOSDB_CONTAINER_ID='ratings' `
    wov-service
```

When using container host should be `0.0.0.0`, when using local host should be `localhost`

# Listening Address

🚨 Important: The listening address MUST be 0.0.0.0 for deployment to docker containers in Azure

localhost or 127.0.0.1 will NOT be exposed.

> If the port value matches what is in this log entry: "did not start within the expected time limit. Elapsed time ", to what is in code, check the Listen IP address for the code. If the code is listening on localhost or 127.0.0.1, then it will not be accessible outside that specific container, hence, the app will fail to start. To get past this, make the app code listen on 0.0.0.0

See: https://stackoverflow.com/questions/52823025/azure-container-did-not-start-within-expected-time-webapp
