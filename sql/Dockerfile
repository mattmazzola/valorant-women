FROM mcr.microsoft.com/mssql/server

ARG PROJECT_DIR=/tmp/devdatabase
RUN mkdir -p $PROJECT_DIR
WORKDIR $PROJECT_DIR
COPY InitializeDatabase.sql ./
COPY wait-for-it.sh ./
COPY entrypoint.sh ./
COPY setup.sh ./

CMD ["/bin/bash", "entrypoint.sh"]

# CMD /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "<YourStrong@Passw0rd>"

