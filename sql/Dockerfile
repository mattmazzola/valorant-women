FROM mcr.microsoft.com/mssql/server:2019-GA-ubuntu-16.04

# Wait Technique is based on PluralSight Course: Add SQL Server Databse to Docker
# https://app.pluralsight.com/course-player?clipId=587be806-d70a-49c9-9453-57c8b333c354\
# https://docs.docker.com/compose/startup-order/

ARG PROJECT_DIR=/tmp/devdatabase
RUN mkdir -p $PROJECT_DIR
WORKDIR $PROJECT_DIR
COPY InitializeDatabase.sql ./
COPY wait-for-it.sh ./
COPY entrypoint.sh ./
COPY setup.sh ./

CMD ["/bin/bash", "entrypoint.sh"]
