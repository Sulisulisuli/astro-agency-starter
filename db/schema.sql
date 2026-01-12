-- Schema
CREATE TABLE IF NOT EXISTS SiteConfig (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS Leads (
    id INTEGER PRIMARY KEY,
    type TEXT,
    payload TEXT,
    createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
);

CREATE TABLE IF NOT EXISTS SystemLogs (
    id INTEGER PRIMARY KEY,
    message TEXT,
    level TEXT,
    timestamp INTEGER DEFAULT (strftime('%s','now') * 1000),
    metadata TEXT
);

-- Seed Data (Nebula Agency Defaults)
INSERT OR IGNORE INTO SiteConfig (key, value) VALUES 
('site_name', '{"type":"string","value":"Nebula Agency"}'),
('site_description', '{"type":"string","value":"We build future-proof digital experiences."}'),
('contact_email', '{"type":"string","value":"hello@nebula.agency"}'),
('social_links', '{"type":"json","value":{"twitter":"https://twitter.com","github":"https://github.com"}}');
