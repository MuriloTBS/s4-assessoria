-- S4 Assessoria — Oracle Database Schema
-- Migration 001: Create base tables

-- Users table
CREATE TABLE users (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email       VARCHAR2(255) NOT NULL UNIQUE,
    name        VARCHAR2(255) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    logo_url    VARCHAR2(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Clients table
CREATE TABLE clients (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     NUMBER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR2(255) NOT NULL,
    email       VARCHAR2(255),
    phone       VARCHAR2(50),
    company     VARCHAR2(255),
    notes       CLOB,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Projects table
CREATE TABLE projects (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     NUMBER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id   NUMBER NOT NULL REFERENCES clients(id),
    name        VARCHAR2(255) NOT NULL,
    description CLOB,
    status      VARCHAR2(50) DEFAULT 'Em andamento' NOT NULL
                CHECK (status IN ('Em andamento', 'Concluído', 'Pausado', 'Cancelado')),
    value       NUMBER(15,2),
    deadline    DATE,
    useful_links CLOB,
    notes       CLOB,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project steps (checklist)
CREATE TABLE project_steps (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id  NUMBER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR2(500) NOT NULL,
    completed   NUMBER(1) DEFAULT 0 NOT NULL CHECK (completed IN (0,1)),
    position    NUMBER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Parameters (per user)
CREATE TABLE parameters (
    id                  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             NUMBER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hourly_rate         NUMBER(10,2) DEFAULT 100,
    default_margin      NUMBER(5,2) DEFAULT 20,
    default_complexity  VARCHAR2(50) DEFAULT 'Médio'
                        CHECK (default_complexity IN ('Simples', 'Médio', 'Complexo', 'Muito Complexo')),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_clients_user_id    ON clients(user_id);
CREATE INDEX idx_projects_user_id   ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_deadline  ON projects(deadline);
CREATE INDEX idx_steps_project_id   ON project_steps(project_id);
