import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    return NextResponse.json({
        deployment_env: process.env.NODE_ENV,
        has_clerk_secret_key: !!clerkSecretKey,
        clerk_secret_key_prefix: clerkSecretKey ? clerkSecretKey.substring(0, 7) : "MISSING",
        has_publishable_key: !!clerkPublishableKey,
        auth_status: userId ? "Authenticated" : "Not Authenticated",
        user_id: userId,
    });
}
