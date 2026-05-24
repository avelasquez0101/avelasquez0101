-- Inicialización de bases de datos para Arcade Platform
-- Se ejecuta automáticamente al iniciar PostgreSQL por primera vez

-- Crear databases para cada microservicio
CREATE DATABASE auth_db;
CREATE DATABASE tournament_db;
CREATE DATABASE shop_db;
CREATE DATABASE profile_db;
CREATE DATABASE admin_db;

-- Conceder privilegios
GRANT ALL PRIVILEGES ON DATABASE auth_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE tournament_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE shop_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE profile_db TO "user";
GRANT ALL PRIVILEGES ON DATABASE admin_db TO "user";

\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c tournament_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c shop_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c profile_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c admin_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Databases created successfully!' AS status;
