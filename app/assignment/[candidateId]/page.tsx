import { db } from "@/lib/db";
// Triggering TS re-check
import { notFound } from "next/navigation";
import { AssignmentForm } from "@/components/assignment-form";
import { CheckCircle2 } from "lucide-react";

export default async function AssignmentPage({ params }: { params: Promise<{ candidateId: string }> }) {
    const { candidateId } = await params;

    const candidate = await db.candidate.findUnique({
        where: { id: candidateId },
        include: { job: true },
    });

    if (!candidate || !candidate.job) return notFound();

    // Prevent re-submission? Optional.
    if ((candidate as any).assignmentSubmission) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="relative overflow-hidden text-left p-5 pt-8 bg-card rounded-2xl shadow-2xl border border-border/50 max-w-md w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                    <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none m-0">Assignment Received</h1>
                        <p className="text-muted-foreground leading-relaxed text-base m-0">
                            You have already submitted your assignment for <span className="text-foreground font-semibold">{candidate.job.title}</span>.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground/60 pt-6 border-t border-border/30 m-0">
                        Our team is currently reviewing your submission.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="max-w-2xl w-full space-y-8 bg-card p-5 rounded-2xl shadow-2xl border border-border/50">
                <div className="text-left space-y-2">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        Assignment Submission
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        For {candidate.job.title}
                    </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl space-y-3">
                    <h3 className="font-bold text-blue-400 text-base flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" />
                        Assignment Instructions
                    </h3>
                    <p className="text-blue-100/80 text-sm whitespace-pre-wrap leading-relaxed">
                        {(candidate.job as any).assignmentDetails || "Please follow the instructions sent to your email."}
                    </p>
                </div>

                <AssignmentForm candidate={candidate} />
            </div>
        </div>
    );
}
