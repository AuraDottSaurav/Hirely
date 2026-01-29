import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");
    const type = searchParams.get("type"); // 'resume' | 'assignment'

    if (!candidateId || !type) {
        return new NextResponse("Missing parameters", { status: 400 });
    }

    try {
        const candidate = await db.candidate.findUnique({
            where: { id: candidateId },
            select: { resumeUrl: true, assignmentSubmission: true }
        });

        if (!candidate) {
            return new NextResponse("Candidate not found", { status: 404 });
        }

        let content = "";
        if (type === "resume") content = candidate.resumeUrl || "";
        else if (type === "assignment") content = candidate.assignmentSubmission || "";

        if (!content) {
            return new NextResponse("Document not found", { status: 404 });
        }

        // If it's a Base64 Data URI
        if (content.startsWith("data:")) {
            // content format: "data:[mime];base64,[data]"
            const matches = content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                return new NextResponse("Invalid file format", { status: 500 });
            }

            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": mimeType,
                    "Content-Disposition": `inline; filename="${type}-${candidateId}.${mimeType.split('/')[1]}"`,
                    "Cache-Control": "public, max-age=3600"
                }
            });
        }

        // If it's a regular URL (e.g. Google Drive, external link), redirect
        return NextResponse.redirect(content);

    } catch (error) {
        console.error("Error serving document:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
