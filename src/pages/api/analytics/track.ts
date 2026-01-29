import type { APIRoute } from "astro";
import { getDB } from "../../../utils/db";

export const POST: APIRoute = async ({ request, clientAddress }) => {
    const db = getDB({ request });
    if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body = await request.json();
        const {
            type = "pageview",
            path = "/",
            referrer = "",
            utm_source,
            utm_medium,
            utm_campaign,
            metadata
        } = body;

        const userAgent = request.headers.get("user-agent") || "unknown";

        // Privacy-friendly session hash: 
        // Hash(IP + UserAgent + Date) 
        // This allows unique visitor counting per day without storing PII.
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const rawString = `${clientAddress}-${userAgent}-${today}`;

        // specific hashing for Edge runtime compatibility
        const msgBuffer = new TextEncoder().encode(rawString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const session_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Determine basic device/OS info from User Agent (simple checks)
        let device_type = "desktop";
        if (/mobile/i.test(userAgent)) device_type = "mobile";
        if (/tablet/i.test(userAgent)) device_type = "tablet";

        let os = "unknown";
        if (/windows/i.test(userAgent)) os = "Windows";
        else if (/mac os/i.test(userAgent)) os = "Mac OS";
        else if (/android/i.test(userAgent)) os = "Android";
        else if (/ios|iphone|ipad/i.test(userAgent)) os = "iOS";
        else if (/linux/i.test(userAgent)) os = "Linux";

        let browser = "unknown";
        if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
        else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
        else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "Safari";
        else if (/edg/i.test(userAgent)) browser = "Edge";

        const country = request.headers.get("cf-ipcountry") || "unknown";

        await db.prepare(`
      INSERT INTO AnalyticsEvents (
        id, type, path, referrer, browser, os, device_type, country, session_hash, 
        utm_source, utm_medium, utm_campaign, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            crypto.randomUUID(),
            type,
            path,
            referrer,
            browser,
            os,
            device_type,
            country,
            session_hash,
            utm_source || null,
            utm_medium || null,
            utm_campaign || null,
            metadata ? JSON.stringify(metadata) : null
        ).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
