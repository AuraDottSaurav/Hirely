'use server';
// Triggering TS re-check
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

// Dynamic schema based on what's required? 
// For server action, we accept all fields but validate logic inside.

import { saveFileLocally } from "@/lib/file-storage";

export async function submitApplication(formData: FormData) {
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const noticePeriod = formData.get("noticePeriod") as string;
    const currentOrg = formData.get("currentOrg") as string;
    const yearsOfExperience = formData.get("yearsOfExperience") as string;
    const portfolioUrl = formData.get("portfolioUrl") as string;
    const resumeFile = formData.get("resume") as File;

    if (!jobId || !name || !email) {
        return { error: "Missing required fields" };
    }

    // Verify Job Exists
    const job = await db.job.findUnique({
        where: { id: jobId },
        include: { formConfig: true },
    });

    if (!job) {
        return { error: "Job not found" };
    }

    // Mandatory Checks based on Config (except Portfolio)
    if (job.formConfig?.includeNoticePeriod && !noticePeriod) return { error: "Notice Period is required" };
    if (job.formConfig?.includeCurrentOrg && !currentOrg) return { error: "Current Organization is required" };
    if (job.formConfig?.includeYearsExperience && !yearsOfExperience) return { error: "Years of Experience is required" };

    let resumeUrl = "";
    let pdfBuffer: Buffer | undefined;

    // Resume Handling (Mandatory if enabled)
    let resumeText = "";
    if (job.formConfig?.includeResume) {
        if (!resumeFile || resumeFile.size === 0) {
            return { error: "Resume is required" };
        }
        if (resumeFile.type !== "application/pdf") {
            return { error: "Resume must be a PDF file" };
        }

        try {
            resumeUrl = await saveFileLocally(resumeFile);
        } catch (e) {
            console.error("File upload failed:", e);
            return { error: "Failed to save resume file" };
        }


        try {
            const arrayBuffer = await resumeFile.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);

            // Dynamic import to avoid build issues if any
            const { extractTextFromPdf } = await import("@/lib/pdf");
            try {
                resumeText = await extractTextFromPdf(pdfBuffer);
                console.log(`[DEBUG] Resume Parsing Result: Length=${resumeText ? resumeText.length : 0}`);
            } catch (e) {
                console.warn("PDF Text Extraction failed:", e);
                resumeText = "";
            }

            if (!resumeText || resumeText.trim().length < 50) {
                console.warn(`[WARNING] Resume text validation failed (too short/empty). Switching to Vision Mode.`);
                resumeText = "";
            }
        } catch (e) {
            console.error("PDF Parsing failed:", e);
            resumeText = "";
        }
    }

    // AI Screening
    const { screenCandidate } = await import("@/app/actions/ai");
    let screeningResult: { score: number | null; reason: string } = { score: null, reason: "Resume parsing failed. Manual review required." };

    if (resumeText || pdfBuffer) {
        // Construct a rich job description + responsibilities + keywords for the AI
        const fullJobContext = `
        Title: ${job.title}
        Description: ${job.description}
        Responsibilities: ${job.responsibilities || ''}
       `;

        if (resumeText && resumeText.length >= 50) {
            const aiResult = await screenCandidate(resumeText, fullJobContext, job.keywords || "");
            screeningResult = aiResult;
        } else if (pdfBuffer) {
            console.log("[Application] Fallback to AI Vision Screening...");
            const aiResult = await screenCandidate(null, fullJobContext, job.keywords || "", pdfBuffer);
            screeningResult = aiResult;
        }
    }

    // Determine Status
    // If score is null (parsing failed), default to APPLIED for manual review.
    // If score >= 70, passed -> ASSIGNMENT SENT.
    // If score < 70, failed -> REJECTED.

    let status = "APPLIED";
    if (screeningResult.score !== null) {
        status = screeningResult.score >= 70 ? "ASSIGNMENT SENT" : "REJECTED";
    }

    const candidate = await db.candidate.create({
        data: {
            jobId,
            name,
            email,
            resumeUrl: resumeUrl || null,
            portfolioUrl: portfolioUrl || null,
            noticePeriod: noticePeriod || null,
            currentOrg: currentOrg || null,
            yearsOfExperience: yearsOfExperience || null,

            screeningScore: screeningResult.score, // Can be null
            screeningReason: screeningResult.reason,
            status: status,
        } as any,
    });

    // Send Emails
    const { sendRejectionEmail, sendAssignmentEmail } = await import("@/lib/email");

    if (status === "ASSIGNMENT SENT") {
        // Send Assignment Email
        await sendAssignmentEmail(email, name, job.title, (job as any).assignmentDetails || "No specific assignment details provided. Please wait for further contact.", candidate.id);
    } else if (status === "REJECTED") {
        // Send Rejection Email
        await sendRejectionEmail(email, name, job.title, screeningResult.reason);
    }
    // If status is APPLIED, we send no email (or could send a confirmation, but staying minimal for now)

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
}

export async function approveCandidate(candidateId: string, meetingLink: string) {
    try {
        const candidate = await db.candidate.update({
            where: { id: candidateId },
            data: {
                status: "APPROVED",
                interviewStatus: "INVITE_SENT"
            } as any,
            include: { job: true }
        });

        await sendApprovalEmail(candidate.email, candidate.name, (candidate as any).job.title, meetingLink);

        revalidatePath("/dashboard");
        revalidatePath("/candidates");
        return { success: true };
    } catch (error) {
        console.error("Error approving candidate:", error);
        return { error: "Failed to approve candidate" };
    }
}

export async function rejectCandidate(candidateId: string) {
    try {
        const candidate = await db.candidate.update({
            where: { id: candidateId },
            data: {
                status: "REJECTED"
            },
            include: { job: true }
        });

        // Use a generic reason for now, or pass it as an argument if UI supports it
        const rejectionReason = "After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.";

        await sendRejectionEmail(candidate.email, candidate.name, candidate.job.title, rejectionReason);

        revalidatePath("/dashboard");
        revalidatePath("/candidates");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting candidate:", error);
        return { error: "Failed to reject candidate" };
    }
}
