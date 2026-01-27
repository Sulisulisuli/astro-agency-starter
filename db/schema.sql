-- Astro Agency Starter - D1 Schema
-- Run with: npx wrangler d1 execute [DB-NAME] --remote --file db/schema.sql

-- Site Configuration (key-value store)
CREATE TABLE IF NOT EXISTS SiteConfig (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Leads from contact forms
CREATE TABLE IF NOT EXISTS Leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    payload TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
);

-- System logs (optional)
CREATE TABLE IF NOT EXISTS SystemLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
);

-- Default seed data
INSERT OR REPLACE INTO SiteConfig (key, value) VALUES 
    ('site_info', '{"name":"Agency Starter","description":"A production-ready starter kit for agencies."}'),
    ('owner_email', '{"email": "delivered@resend.dev"}'),
    ('theme', '{"primary":"#3b82f6","secondary":"#1e3a8a"}');

-- Auth Code
CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS Sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS VerificationCodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER DEFAULT (unixepoch())
);
