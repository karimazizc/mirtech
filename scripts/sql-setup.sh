brew services start postgresql

psql postgresql

CREATE DATABASE mirtech;
CREATE USER mirtech_admin WITH PASSWORD 'mirtech1345';
GRANT ALL PRIVILEGES ON DATABASE mirtech TO mirtech_admin;