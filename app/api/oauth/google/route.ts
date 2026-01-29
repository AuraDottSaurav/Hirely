import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
    const { userId } = await auth();
    let clientId = process.env.GOOGLE_CLIENT_ID;

    // FORCE the correct Redirect URI based on the App URL
    // This prevents the user from accidentally using the Clerk URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    // Ensure no trailing slash
    const baseUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const redirectUri = `${baseUrl}/api/oauth/google/callback`;

    // Only fallback to DB if absolutely necessary (likely not needed for redirect_uri)
    if (userId) {
        const settings = await (db as any).userSettings.findUnique({ where: { userId } });
        if (settings?.googleClientId) clientId = settings.googleClientId;
        // We IGNORE the DB redirectUri to prevent the "Clerk" bug
    }

    if (!clientId) {
        return NextResponse.json({ error: "Google OAuth Config Missing. Please check Settings." }, { status: 400 });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: redirectUri,
        client_id: clientId,
        access_type: "offline",
        response_type: "code",
        prompt: "select_account consent",
        scope: [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" "),
    };

    const qs = new URLSearchParams(options).toString();
    const finalUrl = `${rootUrl}?${qs}`;

    const response = NextResponse.redirect(finalUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
}
