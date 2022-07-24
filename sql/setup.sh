./wait-for-it.sh sql:1433 --timeout=0 --strict -- sleep 5s && echo "$SA_PASSWORD" && \
/opt/mssql-tools/bin/sqlcmd -S localhost -i InitializeDatabase.sql -U SA -P "<YourStrong@Passw0rd>"
# /opt/mssql-tools/bin/sqlcmd -S localhost -i InitializeDatabase.sql -U SA -P "$SA_PASSWORD"