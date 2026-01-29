'use server';

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const settings = await (db as any).userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            return { success: true, settings: {} };
        }

        return {
            success: true,
            settings: {
                geminiApiKey: settings.geminiApiKey,
                googleClientId: settings.googleClientId,
                googleClientSecret: settings.googleClientSecret,
                googleRedirectUri: settings.googleRedirectUri,
                clerkPublishableKey: settings.clerkPublishableKey,
                clerkSecretKey: settings.clerkSecretKey,
            }
        };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateSettings(data: {
    geminiApiKey?: string;
    googleClientId?: string;
    googleClientSecret?: string;
    googleRedirectUri?: string;
    clerkPublishableKey?: string;
    clerkSecretKey?: string;
}) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await (db as any).userSettings.upsert({
            where: { userId },
            update: {
                geminiApiKey: data.geminiApiKey,
                googleClientId: data.googleClientId,
                googleClientSecret: data.googleClientSecret,
                googleRedirectUri: data.googleRedirectUri,
                clerkPublishableKey: data.clerkPublishableKey,
                clerkSecretKey: data.clerkSecretKey,
            },
            create: {
                userId,
                ...data,
            },
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
