"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleJobStatus(jobId: string, isOpen: boolean) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const job = await db.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return { success: false, error: "Job not found" };
        }

        if (job.userId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.job.update({
            where: { id: jobId },
            data: { isOpen } as any,
        });

        revalidatePath(`/dashboard/jobs/${jobId}`);
        revalidatePath("/dashboard");
        revalidatePath(`/jobs/${jobId}`);

        return { success: true };
    } catch (error) {
        console.error("Error toggling job status:", error);
        return { success: false, error: "Failed to update job status" };
    }
}
