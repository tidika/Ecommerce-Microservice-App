FROM mysql:latest

MAINTAINER me

ENV MYSQL_DATABASE=shop \
    MYSQL_ROOT_PASSWORD=shopdb


ADD schema.sql /docker-entrypoint-initdb.d

EXPOSE 3306