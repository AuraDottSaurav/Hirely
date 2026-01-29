'use server';
// Triggering TS re-check
import { db } from "@/lib/db";
import { saveFileLocally } from "@/lib/file-storage";
import { revalidatePath } from "next/cache";

export async function submitAssignment(formData: FormData) {
    const candidateId = formData.get("candidateId") as string;
    const assignmentLink = formData.get("assignmentLink") as string;
    const assignmentFile = formData.get("assignmentFile") as File;

    if (!candidateId) {
        return { error: "Candidate ID is missing" };
    }

    let submissionValue = "";

    if (assignmentLink) {
        submissionValue = assignmentLink;
    } else if (assignmentFile && assignmentFile.size > 0) {
        try {
            const url = await saveFileLocally(assignmentFile);
            submissionValue = url;
        } catch (e) {
            console.error(e);
            return { error: "Failed to upload assignment file" };
        }
    } else {
        return { error: "Please provide either a link or a file" };
    }

    try {
        await db.candidate.update({
            where: { id: candidateId },
            data: {
                assignmentSubmission: submissionValue,
                status: "ASSIGNMENT RECEIVED"
            } as any
        });

        revalidatePath(`/assignment/${candidateId}`);
        return { success: true };
    } catch (error) {
        console.error("Assignment Submission Error:", error);
        return { error: "Failed to submit assignment" };
    }
}
