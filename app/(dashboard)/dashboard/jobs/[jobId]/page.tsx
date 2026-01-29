import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CandidatesTable } from "@/components/candidates-table";
import { Badge } from "@/components/ui/badge";
import { ShareLinkCard } from "@/components/share-link-card";
import { JobDetailsDialog } from "@/components/job-details-dialog";

import { CloseJobButton } from "@/components/close-job-button";


export default async function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const job = await db.job.findUnique({
        where: { id: jobId },
        include: { candidates: { orderBy: { createdAt: "desc" } } },
    });

    if (!job || job.userId !== userId) {
        return notFound();
    }

    // Use an absolute URL helper or just relative for now if we know host?
    // Since server side, we rely on headers or configured base URL.
    // We'll just display the relative path for the user to copy with window.location.origin

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="group text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                            <Badge variant={(job as any).isOpen ? "default" : "secondary"} className={(job as any).isOpen ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0 shadow-none px-3 py-1" : ""}>
                                {(job as any).isOpen ? "Active" : "Closed"}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-muted-foreground ml-6">
                        Created on {job.createdAt.toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <JobDetailsDialog job={job as any} />
                    {(job as any).isOpen && (
                        <Button variant="outline" asChild>
                            <a href={`/apply/${jobId}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                View Live Page
                            </a>
                        </Button>
                    )}
                    <CloseJobButton jobId={job.id} isOpen={(job as any).isOpen} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-6">
                    <div className="border rounded-xl p-5 bg-card shadow-sm">
                        <CandidatesTable candidates={job.candidates} />
                    </div>
                </div>

                <div className="space-y-6">
                    <ShareLinkCard jobId={job.id} />
                </div>
            </div>
        </div>
    );
}
