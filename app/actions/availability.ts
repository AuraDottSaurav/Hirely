'use server';

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getAccessToken } from "./calendar";
import { sendApprovalEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

// Fetch events to show availability (busy times)
export async function getCalendarEvents(startTime: string, endTime: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const token = await getAccessToken(userId);
    if (!token) return { error: "Calendar not connected" };

    const query = new URLSearchParams({
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: "true",
        orderBy: "startTime",
    });

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Failed to fetch events");

        return { success: true, events: data.items || [] };
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return { error: "Failed to fetch calendar events" };
    }
}

// Save proposed slots and notify candidate
export async function proposeInterviewSlots(candidateId: string, slots: Date[]) {
    console.log(`[ProposeSlots] Starting for candidate ${candidateId} with ${slots.length} slots`);
    try {
        const { userId } = await auth();
        if (!userId) {
            console.error("[ProposeSlots] Unauthorized: No userId found");
            return { error: "Unauthorized" };
        }

        // 1. Update Candidate
        console.log("[ProposeSlots] Updating candidate in DB...");
        const slotStrings = slots.map(s => s.toISOString());

        const candidate = await db.candidate.update({
            where: { id: candidateId },
            data: {
                status: "APPROVED",
                interviewStatus: "INVITE_SENT",
                proposedSlots: JSON.stringify(slotStrings),
            } as any,
            include: { job: true }
        });

        console.log(`[ProposeSlots] Candidate updated: ${candidate.id}`);

        // 2. Send Email
        const bookingPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meet/${candidate.id}`;
        const jobTitle = (candidate as any).job?.title || "Role";

        console.log(`[ProposeSlots] Sending email to ${candidate.email} for job ${jobTitle}`);

        await sendApprovalEmail(
            candidate.email,
            candidate.name,
            jobTitle,
            bookingPageUrl
        );

        console.log("[ProposeSlots] Email sent successfully");

        revalidatePath("/dashboard");
        revalidatePath("/candidates");
        return { success: true };
    } catch (error: any) {
        console.error("[ProposeSlots] Error proposing slots:", error);
        return { error: error.message || "Failed to send proposal" };
    }
}

// Finalize booking (Called by Candidate)
export async function bookInterview(candidateId: string, slotIso: string) {
    console.log(`[BookInterview] Starting for candidate ${candidateId} at ${slotIso}`);
    try {
        const candidate = await db.candidate.findUnique({
            where: { id: candidateId },
            include: { job: true }
        });

        if (!candidate) {
            console.error("[BookInterview] Candidate not found");
            return { error: "Candidate not found" };
        }

        const job = await db.job.findUnique({ where: { id: candidate.jobId } }); // candidate.jobId is correct? schema says jobId string.

        if (!job) {
            console.error("[BookInterview] Job not found");
            return { error: "Job not found" };
        }

        const recruiterUserId = job.userId;
        console.log(`[BookInterview] Fetching token for recruiter: ${recruiterUserId}`);
        const token = await getAccessToken(recruiterUserId);

        if (!token) {
            console.error("[BookInterview] Recruiter calendar disconnected");
            return { error: "Recruiter calendar disconnected" };
        }

        const start = new Date(slotIso);
        const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 min default duration

        const event = {
            summary: `Interview: ${candidate.name} (for ${job.title})`,
            description: `Interview for ${job.title}.\n\nCandidate: ${candidate.name}\nEmail: ${candidate.email}\n\nView details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
            attendees: [
                { email: candidate.email },
            ],
            conferenceData: {
                createRequest: { requestId: Math.random().toString(36).substring(7) }
            }
        };

        console.log("[BookInterview] Creating GCal event...");
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[BookInterview] GCal Create Error:", JSON.stringify(data));
            throw new Error(`Failed to create calendar event: ${data.error?.message || "Unknown error"}`);
        }

        const meetLink = data.hangoutLink || data.htmlLink;
        console.log(`[BookInterview] Event created. Link: ${meetLink}`);

        // Update Candidate Status
        await db.candidate.update({
            where: { id: candidateId },
            data: {
                interviewStatus: "SCHEDULED",
                interviewDate: start,
                meetingLink: meetLink,
                proposedSlots: null, // Clear proposed slots after booking
            } as any
        });

        console.log("[BookInterview] Candidate updated. Success.");

        return { success: true, meetLink };

    } catch (error: any) {
        console.error("[BookInterview] Error booking interview:", error);
        return { error: error.message || "Failed to book interview" };
    }
}
