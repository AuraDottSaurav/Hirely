import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    // Replicate the logic from the OAuth route to see what it generates
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const baseUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const computed_redirect_uri = `${baseUrl}/api/oauth/google/callback`;

    return NextResponse.json({
        deployment_env: process.env.NODE_ENV,
        has_clerk_secret_key: !!clerkSecretKey,
        clerk_secret_key_prefix: clerkSecretKey ? clerkSecretKey.substring(0, 7) : "MISSING",
        has_publishable_key: !!clerkPublishableKey,
        auth_status: userId ? "Authenticated" : "Not Authenticated",
        user_id: userId,
        env_google_redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        env_app_url: process.env.NEXT_PUBLIC_APP_URL,
        computed_redirect_uri_used_by_code: computed_redirect_uri,
    });
}
