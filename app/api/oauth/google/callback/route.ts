import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?params=error`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?params=no_code`);
    }

    // Get current user first to determine which credentials to use
    let userId: string | null = null;
    try {
        const session = await auth();
        userId = session.userId;
    } catch (err) {
        console.error("Clerk auth() failed:", err);
        return NextResponse.json({
            error: "Clerk Authentication Failed",
            message: (err as Error).message,
            code: (err as any).code
        }, { status: 500 });
    }

    if (!userId) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`);
    }

    // Determine credentials
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // CRITICAL FIX: Must match the redirect_uri used in the initial request EXACTLY
    const redirectUri = "https://hirely-psi.vercel.app/api/oauth/google/callback";

    const settings = await (db as any).userSettings.findUnique({ where: { userId } });
    if (settings?.googleClientId) clientId = settings.googleClientId;
    if (settings?.googleClientSecret) clientSecret = settings.googleClientSecret;
    // We IGNORE the DB redirectUri to ensure consistency

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: clientId as string,
            client_secret: clientSecret as string,
            redirect_uri: redirectUri as string,
            grant_type: "authorization_code",
        }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
        console.error("Token exchange failed", tokens);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?params=token_error`);
    }

    // Save tokens
    await (db as any).userSettings.upsert({
        where: { userId },
        update: {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token, // Only returned on first consent or if access_type=offline & prompt=consent
            googleTokenExpiry: BigInt(Date.now() + tokens.expires_in * 1000),
        },
        create: {
            userId,
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: BigInt(Date.now() + tokens.expires_in * 1000),
        },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?params=calendar_connected`);
}
