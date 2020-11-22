# Service

## Steps to start MSSQL database container

### 1. Run container

```powershell
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=<YourStrong@Passw0rd>" `
   -p 1433:1433 --name sql1 `
   -d mcr.microsoft.com/mssql/server:2019-GA-ubuntu-16.04
```

### 2. Create database

#### 2.a Interactive bash prompt within container

```powershell
docker exec -it sql1 "bash"
```

#### 2.b Start SQL Cmd tools to run T-SQL commands

```bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "<YourStrong@Passw0rd>"
```

#### 2.c Create database

```sql
CREATE DATABASE womenofvalorant
GO
```

#### 2.d Exit terminals

exit T-SQL
exit Bash

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

# Links

## MS SQL

- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/sql-server-management-studio-ssms)
- [Using SQL Server Management Studio to remote connect to docker container](https://stackoverflow.com/questions/47984603/using-sql-server-management-studio-to-remote-connect-to-docker-container)
- https://docs.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/database-server-container
- https://hub.docker.com/_/microsoft-mssql-server
- https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver15&pivots=cs1-powershell

## MySQL

```powershell
docker run -p 9000:3306 --name mysql4 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=db1 -e MYSQL_ROOT_HOST=% -d mysql/mysql-server:latest
```

## TypeORM Notes

### Relations

- @OneToOne requires @JoinColumn to be set only on one side of the relation. The side you set @JoinColumn on, that side's table will contain a "relation id" and foreign keys to target entity table.
- @ManyToOne / @OneToMany relations do not require You can omit @JoinColumn in a . @OneToMany cannot exist without @ManyToOne. If you want to use @OneToMany, @ManyToOne is required. However, the inverse is not required: If you only care about the @ManyToOne relationship, you can define it without having @OneToMany on the related entity.
- @JoinTable() is required for @ManyToMany relations. You must put @JoinTable on one (owning) side of relation.
