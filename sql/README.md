# SQL

## Steps to start MSSQL database container

### 1. Use docker-compose

```
docker compose up
```

### 2. Open bash terminal in container
```
docker exec -it valorant-women-sql-1 "bash"
```

### 3. Set Username and Password
```
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "<YourStrong@Passw0rd>"
```

### 4. Create database
```
CREATE DATABASE womenofvalorant
GO
```

### 5. Exit
```
exit
exit
```
