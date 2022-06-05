# Service

## Start up

1. Start the SQL service
  - This service attempts to connect to the SQL database so it must be running

## Running as container

```
docker build -t valorant-women-service-2 .
docker run -it -p 3002:3002 valorant-women-service-2
```


#### 2.e Create Type ORM Connection file

- Create `ormconfig.json` in root of project
   - This holds the connection info loaded by Type ORM
- Enter database type as `mssql`
- Enter username and password matching those above

```json
{
   "type": "mssql",
   "host": "localhost",
   "username": "SA",
   "password": "<YourStrong@Passw0rd>",
   "database": "womenofvalorant"
}
```

### Restarting the Database

If you ever stop the container you can start it back up by simply starting it instead attempting to build and pull the images

```
docker start sql1
```

### Schema Changes

If you change the @Entities defined an "synchronize" is enabled, when the service starts it will attempt to alter the databases to match the new schema which can sometimes fail.  You can uncomment the "dropSchema" attribute to reset the db / tables and start fresh to get past these errors.

`plugings/orm.ts`

```typescript
{
   ...
   synchronize: true,
   // dropSchema: true,
   logging: ["error"],
   ...
}
```

# Listening Address

🚨 Important: The listening address MUST be 0.0.0.0 for deployment to docker containers in Azure

localhost or 127.0.0.1 will NOT be exposed.

> If the port value matches what is in this log entry: "did not start within the expected time limit. Elapsed time ", to what is in code, check the Listen IP address for the code. If the code is listening on localhost or 127.0.0.1, then it will not be accessible outside that specific container, hence, the app will fail to start. To get past this, make the app code listen on 0.0.0.0

See: https://stackoverflow.com/questions/52823025/azure-container-did-not-start-within-expected-time-webapp

# Note

Could not get the `ormconfig.json` to be recognized in Azure so it uses environment variables

# Links

## MS SQL

- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/sql-server-management-studio-ssms)
- [Using SQL Server Management Studio to remote connect to docker container](https://stackoverflow.com/questions/47984603/using-sql-server-management-studio-to-remote-connect-to-docker-container)
- https://docs.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/database-server-container
- https://hub.docker.com/_/microsoft-mssql-server
- https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver15&pivots=cs1-powershell

## TypeORM Notes

### Relations

- @OneToOne requires @JoinColumn to be set only on one side of the relation. The side you set @JoinColumn on, that side's table will contain a "relation id" and foreign keys to target entity table.
- @ManyToOne / @OneToMany relations do not require You can omit @JoinColumn in a . @OneToMany cannot exist without @ManyToOne. If you want to use @OneToMany, @ManyToOne is required. However, the inverse is not required: If you only care about the @ManyToOne relationship, you can define it without having @OneToMany on the related entity.
- @JoinTable() is required for @ManyToMany relations. You must put @JoinTable on one (owning) side of relation.
