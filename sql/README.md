# SQL

## Steps to start MSSQL database container

### 1. Use docker-compose

```
docker compose up -d --build
```

## Note: .sh files MUST be LF file endings

# Manual Database Creation

### 1. Open bash terminal in container
```
docker exec -it valorant-women-sql-1 "bash"
```

### 3. Set Username and Password
```
/opt/mssql-tools/bin/sqlcmd -S localhost -i InitializeDatabase.sql -U SA -P "$SA_PASSWORD"
```
