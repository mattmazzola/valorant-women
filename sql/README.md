# SQL

## Steps to start MSSQL database container

### 1. Use docker-compose

```
cd ..
docker compose up
docker exec -it valorant-women-sql-1 "bash"
mssql@4f6d6d1b0b55:/$ /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "<YourStrong@Passw0rd>"
1> CREATE DATABASE womenofvalorant
2> GO
3> exit
mssql@4f6d6d1b0b55:/$ exit
```

## More details to manually run

### 1. Run container

```powershell
docker run `
   -e "ACCEPT_EULA=Y" `
   -e "SA_PASSWORD=<YourStrong@Passw0rd>" `
   -p 1433:1433 `
   --name sql1 `
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

- exit T-SQL
   `exit`
- exit Bash
   `exit`