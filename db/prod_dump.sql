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
INSERT INTO "Leads" VALUES(1,'contact_form','{"email":"Test@test.com","message":"measadadsandaskd"}','2026-01-24T17:34:59.967Z');
INSERT INTO "Leads" VALUES(2,'contact_form','{"email":"office@niuans.studio","message":"kkkkkk"}','2026-01-24T22:46:31.345Z');
INSERT INTO "Leads" VALUES(3,'contact_form','{"email":"office@niuans.studio","message":"dfasdfafd"}','2026-01-24T22:48:02.268Z');
INSERT INTO "Leads" VALUES(4,'contact_form','{"email":"office@niuans.studio","message":"asdadsa"}','2026-01-24T22:50:14.681Z');
INSERT INTO "Leads" VALUES(5,'contact_form','{"email":"office@niuans.studio","message":"dafdasdfasd"}','2026-01-24T22:51:58.418Z');
INSERT INTO "Leads" VALUES(6,'contact_form','{"email":"office@niuans.studio","message":"kjkjkj"}','2026-01-24T22:54:47.375Z');
INSERT INTO "Leads" VALUES(7,'contact_form','{"email":"office@niuans.studio","message":"jkjkkj"}','2026-01-24T22:57:23.109Z');
INSERT INTO "Leads" VALUES(8,'contact_form','{"email":"office@niuans.studio","message":"tet1"}','2026-01-24T23:00:27.147Z');
INSERT INTO "Leads" VALUES(9,'contact_form','{"email":"Test@test.com","message":"asdsda"}','2026-01-25T01:32:15.349Z');
INSERT INTO "Leads" VALUES(10,'contact_form','{"email":"Test@test.com","message":"dsdsadsa"}','2026-01-25T01:52:06.357Z');
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
INSERT INTO "Users" VALUES('1','sulimierski.jakub@gmail.com','admin',1769542378);
CREATE TABLE Sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
INSERT INTO "Sessions" VALUES('432q013cwl7qnk2lawrdi8aohztjsfd2','1',1772134705);
INSERT INTO "Sessions" VALUES('gr9nxgajkt4dv323lzpfwjoe7nqigi2u','1',1772135807);
INSERT INTO "Sessions" VALUES('tyqdjze0rst9xf9448zfupb7okf0yh5q','1',1772136035);
CREATE TABLE VerificationCodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER DEFAULT (unixepoch())
);
INSERT INTO "VerificationCodes" VALUES(4,'sulimierski.jakub@gmail.com','963653',1769558054,1769557754);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('VerificationCodes',4);
