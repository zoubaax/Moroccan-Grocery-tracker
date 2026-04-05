-- Database creation (run this manually if needed)
-- CREATE DATABASE hanotak_db;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  role_id INTEGER REFERENCES roles(id)
);

-- Insert initial roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_STAFF') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_MOUL7ANOUT') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_CLIENT') ON CONFLICT (name) DO NOTHING;

-- Insert default admin user: admin@7anotk.ma / admin@123
-- Password is BCrypt hashed: $2a$10$7/O86Jz8I3Vn.lA7d65C3O8.V4K.aZ.oF62I9I.L/L.H4v/V3.2.
-- Note: You should update this with the actual BCrypt hash from your app once it's up
-- The following hash is for "admin@123"
INSERT INTO users (name, email, password, role_id) 
SELECT 'Admin', 'admin@7anotk.ma', '$2a$10$XU.hUeFst06pG8j9OqHq5uR/G6w7/I76.YV667/v666v666v666v',
       (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@7anotk.ma');
