import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendRejectionEmail(email: string, name: string, jobTitle: string, reason: string) {
    if (!resend) {
        console.error("RESEND_API_KEY is missing. Cannot send rejection email.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Acme Hiring <onboarding@resend.dev>', // Update with verified domain later
            to: email,
            subject: `Update regarding your application for ${jobTitle}`,
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for your interest in the ${jobTitle} position.</p>
                <p>We have reviewed your application. Unfortunately, we have decided not to move forward at this time.</p>
                <p><strong>Feedback from our review team:</strong></p>
                <p><em>${reason}</em></p>
                <p>We will keep your resume on file for future openings.</p>
                <p>Best regards,<br/>The Hiring Team</p>
            `
        });
    } catch (error) {
        console.error("Failed to send rejection email:", error);
    }
}

export async function sendAssignmentEmail(
    email: string,
    name: string,
    jobTitle: string,
    assignmentDetails: string,
    candidateId: string
) {
    if (!resend) {
        console.error("RESEND_API_KEY is missing. Cannot send assignment email.");
        return;
    }

    const assignmentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/assignment/${candidateId}`;

    try {
        await resend.emails.send({
            from: 'Acme Hiring <onboarding@resend.dev>',
            to: email,
            subject: `Next Steps: Assignment for ${jobTitle}`,
            html: `
                <p>Dear ${name},</p>
                <p>Congratulations! We were impressed by your profile and would like to move you to the next stage.</p>
                <p><strong>Assignment Details:</strong></p>
                <p>${assignmentDetails.replace(/\n/g, '<br/>')}</p>
                <p>Please submit your assignment using the link below:</p>
                <p><a href="${assignmentLink}">${assignmentLink}</a></p>
                <p>Best regards,<br/>The Hiring Team</p>
            `
        });
    } catch (error) {
        console.error("Failed to send assignment email:", error);
    }
}

export async function sendApprovalEmail(
    email: string,
    name: string,
    jobTitle: string,
    meetingLink: string
) {
    if (!resend) {
        console.error("RESEND_API_KEY is missing. Cannot send approval email.");
        return;
    }

    try {
        await resend.emails.send({
            from: 'Acme Hiring <onboarding@resend.dev>',
            to: email,
            subject: `Good News! Next Steps for ${jobTitle}`,
            html: `
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that we have reviewed your assignment and would like to move forward with your application!</p>
                <p>The next step is a discussion with our team to get to know you better. We use Google Calendar for scheduling.</p>
                <p><strong>Please select a time slot that works for you using the link below:</strong></p>
                <p><a href="${meetingLink}">${meetingLink}</a></p>
                <p>We look forward to speaking with you.</p>
                <p>Best regards,<br/>The Hiring Team</p>
            `
        });
    } catch (error) {
        console.error("Failed to send approval email:", error);
    }
}
