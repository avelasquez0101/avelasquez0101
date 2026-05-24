-- Creación de bases de datos para cada microservicio
CREATE DATABASE auth_db;
CREATE DATABASE tournament_db;
CREATE DATABASE profile_db;
CREATE DATABASE shop_db;
CREATE DATABASE admin_db;

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE auth_db TO arcade_user;
GRANT ALL PRIVILEGES ON DATABASE tournament_db TO arcade_user;
GRANT ALL PRIVILEGES ON DATABASE profile_db TO arcade_user;
GRANT ALL PRIVILEGES ON DATABASE shop_db TO arcade_user;
GRANT ALL PRIVILEGES ON DATABASE admin_db TO arcade_user;
