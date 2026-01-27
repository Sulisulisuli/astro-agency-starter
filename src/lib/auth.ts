
import type { D1Database } from '@cloudflare/workers-types';
import { generateRandomString, alphabet } from 'oslo/crypto';

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days
const OTP_DURATION = 1000 * 60 * 5; // 5 minutes

export interface User {
    id: string;
    email: string;
    role: string;
}

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
}

// Generate a random session ID
export function generateSessionId(): string {
    return generateRandomString(32, alphabet('a-z', '0-9'));
}

// Create a session for a user
export async function createSession(db: D1Database, userId: string): Promise<Session> {
    const sessionId = generateSessionId();
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + SESSION_DURATION)
    };

    await db.prepare(
        'INSERT INTO Sessions (id, userId, expiresAt) VALUES (?, ?, ?)'
    ).bind(session.id, session.userId, Math.floor(session.expiresAt.getTime() / 1000)).run();

    return session;
}

// Validate a session token
export async function validateSession(db: D1Database, sessionId: string): Promise<{ session: Session | null; user: User | null }> {
    const result = await db.prepare(`
    SELECT Sessions.id as sessionId, Sessions.userId, Sessions.expiresAt, Users.id as userId, Users.email, Users.role
    FROM Sessions
    INNER JOIN Users ON Sessions.userId = Users.id
    WHERE Sessions.id = ?
  `).bind(sessionId).first();

    if (!result) {
        return { session: null, user: null };
    }

    const session: Session = {
        id: result.sessionId as string,
        userId: result.userId as string,
        expiresAt: new Date((result.expiresAt as number) * 1000)
    };

    const user: User = {
        id: result.userId as string,
        email: result.email as string,
        role: result.role as string
    };

    if (Date.now() >= session.expiresAt.getTime()) {
        await db.prepare('DELETE FROM Sessions WHERE id = ?').bind(sessionId).run();
        return { session: null, user: null };
    }

    // Extend session if close to expiry (optional optimization, skipping for now for simplicity)

    return { session, user };
}

// Invalidate a session
export async function invalidateSession(db: D1Database, sessionId: string): Promise<void> {
    await db.prepare('DELETE FROM Sessions WHERE id = ?').bind(sessionId).run();
}

// OTP Logic

export function generateOTPCode(): string {
    return generateRandomString(6, alphabet('0-9'));
}

export async function createVerificationCode(db: D1Database, email: string): Promise<string> {
    // Delete any existing codes for this email
    await db.prepare('DELETE FROM VerificationCodes WHERE email = ?').bind(email).run();

    const code = generateOTPCode();
    const expiresAt = Math.floor((Date.now() + OTP_DURATION) / 1000);

    await db.prepare(
        'INSERT INTO VerificationCodes (email, code, expiresAt) VALUES (?, ?, ?)'
    ).bind(email, code, expiresAt).run();

    return code;
}

export async function verifyOTP(db: D1Database, email: string, code: string): Promise<boolean> {
    const result = await db.prepare(
        'SELECT * FROM VerificationCodes WHERE email = ? AND code = ?'
    ).bind(email, code).first();

    if (!result) {
        return false;
    }

    const expiresAt = result.expiresAt as number;
    if (Date.now() / 1000 > expiresAt) {
        // Expired
        await db.prepare('DELETE FROM VerificationCodes WHERE email = ?').bind(email).run();
        return false;
    }

    // Valid, delete code so it can't be reused
    await db.prepare('DELETE FROM VerificationCodes WHERE email = ?').bind(email).run();

    return true;
}

// User Management helpers
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
    const result = await db.prepare('SELECT * FROM Users WHERE email = ?').bind(email).first();
    if (!result) return null;

    return {
        id: result.id as string,
        email: result.email as string,
        role: result.role as string
    };
}

export async function createUser(db: D1Database, email: string): Promise<User> {
    const id = generateRandomString(15, alphabet('a-z', '0-9')); // Simple ID generation
    await db.prepare('INSERT INTO Users (id, email) VALUES (?, ?)').bind(id, email).run();
    return { id, email, role: 'admin' };
}
