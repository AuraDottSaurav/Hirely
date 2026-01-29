import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
    const { userId } = await auth();
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (userId) {
        const settings = await (db as any).userSettings.findUnique({ where: { userId } });
        if (settings?.googleClientId) clientId = settings.googleClientId;
        if (settings?.googleRedirectUri) redirectUri = settings.googleRedirectUri;
    }

    if (!clientId || !redirectUri) {
        return NextResponse.json({ error: "Google OAuth Config Missing. Please check Settings." }, { status: 400 });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: redirectUri,
        client_id: clientId,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" "),
    };

    const qs = new URLSearchParams(options).toString();
    return NextResponse.redirect(`${rootUrl}?${qs}`);
}
