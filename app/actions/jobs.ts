'use server';
// Triggering TS re-check
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const jobSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    responsibilities: z.string().optional(),
    keywords: z.string().optional(),
    assignmentDetails: z.string().optional(),

    // Form Config
    includeName: z.boolean().default(true),
    includeEmail: z.boolean().default(true),
    includeResume: z.boolean().default(false),
    includePortfolio: z.boolean().default(false),
    includeNoticePeriod: z.boolean().default(false),
    includeCurrentOrg: z.boolean().default(false),
    includeYearsExperience: z.boolean().default(false),
});

export type JobFormData = z.infer<typeof jobSchema>;

export async function createJob(data: JobFormData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const validated = jobSchema.parse(data);

    const job = await db.job.create({
        data: {
            userId,
            title: validated.title,
            description: validated.description, // User might merge these or separate
            responsibilities: validated.responsibilities,
            keywords: validated.keywords,
            assignmentDetails: validated.assignmentDetails,
            isOpen: true,
            formConfig: {
                create: {
                    includeName: validated.includeName,
                    includeEmail: validated.includeEmail,
                    includeResume: validated.includeResume,
                    includePortfolio: validated.includePortfolio,
                    includeNoticePeriod: validated.includeNoticePeriod,
                    includeCurrentOrg: validated.includeCurrentOrg,
                    includeYearsExperience: validated.includeYearsExperience,
                },
            },
        } as any,
    });

    revalidatePath("/dashboard");
    return { success: true, jobId: job.id };
}
