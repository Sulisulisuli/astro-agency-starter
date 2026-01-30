PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE SiteConfig (
    key TEXT PRIMARY KEY,
    value TEXT
);
INSERT INTO "SiteConfig" VALUES('site_info','{"name":"Agency Starter","description":"A production-ready starter kit for agencies.","open_graph_image":""}');
INSERT INTO "SiteConfig" VALUES('scripts','{"head": "", "footer": ""}');
INSERT INTO "SiteConfig" VALUES('notification_emails','{"email": "delivered@resend.dev"}');
CREATE TABLE Leads (
    id INTEGER PRIMARY KEY,
    type TEXT,
    payload TEXT,
    createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
);

CREATE TABLE SystemLogs (
    id INTEGER PRIMARY KEY,
    message TEXT,
    level TEXT,
    timestamp INTEGER DEFAULT (strftime('%s','now') * 1000),
    metadata TEXT
);
CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt INTEGER DEFAULT (unixepoch())
);

CREATE TABLE Sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE VerificationCodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER DEFAULT (unixepoch())
);
