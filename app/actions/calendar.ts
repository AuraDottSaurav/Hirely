'use server';

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAccessToken(userId: string) {
    const fs = require('fs');
    const logFile = 'auth-debug.log';
    fs.appendFileSync(logFile, `[getAccessToken] Fetching token for ${userId}\n`);
    // Cast to any to avoid stale IDE type error
    const settings = await (db as any).userSettings.findUnique({ where: { userId } });

    if (!settings) {
        fs.appendFileSync(logFile, `[getAccessToken] No settings found for ${userId}\n`);
        return null;
    }
    if (!settings.googleRefreshToken) {
        fs.appendFileSync(logFile, `[getAccessToken] No refresh token found for ${userId}\n`);
        return null;
    }

    if (settings.googleTokenExpiry && Number(settings.googleTokenExpiry) > Date.now()) {
        fs.appendFileSync(logFile, `[getAccessToken] Using cached access token\n`);
        return settings.googleAccessToken;
    }

    // Refresh Token
    fs.appendFileSync(logFile, "Refreshing Google Access Token...\n");

    const clientId = settings.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

    fs.appendFileSync(logFile, `[getAccessToken] Using Client ID: ${clientId ? clientId.substring(0, 5) + '...' : 'NONE'}\n`);

    if (!clientId || !clientSecret) {
        fs.appendFileSync(logFile, "Missing Google OAuth Credentials for refresh\n");
        return null;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: settings.googleRefreshToken,
            grant_type: "refresh_token",
        }),
    });

    const tokens = await response.json();
    if (!response.ok) {
        fs.appendFileSync(logFile, `Failed to refresh token: ${JSON.stringify(tokens)}\n`);
        return null;
    }

    fs.appendFileSync(logFile, "[getAccessToken] Token refreshed successfully\n");

    await (db as any).userSettings.update({
        where: { userId },
        data: {
            googleAccessToken: tokens.access_token,
            googleTokenExpiry: BigInt(Date.now() + tokens.expires_in * 1000),
        },
    });

    return tokens.access_token;
}

export async function checkCandidateBooking(candidateId: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const token = await getAccessToken(userId);
    if (!token) return { error: "Calendar not connected" };

    const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) return { error: "Candidate not found" };

    // Search for events with candidate email
    // TimeMin = now or slightly past? Let's check future events or recent past.
    // Actually, check from "Create At" time to Future
    const timeMin = new Date().toISOString();

    // Better: Check all future events or events 1 month back?
    // Let's check from Today onwards mainly.
    // Or we can query by "q" = email

    const query = new URLSearchParams({
        q: candidate.email,
        timeMin: new Date(Date.now() - 86400000).toISOString(), // Look back 1 day
        maxResults: "5",
        singleEvents: "true",
        orderBy: "startTime",
    });

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google Calendar API Error:", data);
            return { error: `Google API Error: ${data.error?.message || response.statusText}` };
        }

        if (!data.items || data.items.length === 0) {
            return { message: "No booking found yet. Please ensure the candidate uses the email on their application." };
        }

        const event = data.items[0]; // Take first match
        const start = event.start.dateTime || event.start.date;

        // Update Candidate
        await db.candidate.update({
            where: { id: candidateId },
            data: {
                interviewStatus: "SCHEDULED",
                interviewDate: new Date(start),
            } as any
        });

        revalidatePath("/dashboard");
        return { success: true, date: start };

    } catch (e) {
        console.error("GCal API Error", e);
        return { error: "Failed to connect to Google Calendar" };
    }
}

export async function isCalendarConnected() {
    const { userId } = await auth();
    if (!userId) return false;

    if (!userId) return false;

    // Cast to any to avoid stale IDE type error
    const settings = await (db as any).userSettings.findUnique({ where: { userId } });
    return !!settings?.googleRefreshToken;
}
