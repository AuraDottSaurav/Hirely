import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Job } from "@prisma/client";
import { cn } from "@/lib/utils";
import { NewJobButton } from "@/components/dashboard/new-job-button";
import { JobCard } from "@/components/dashboard/job-card";
import { JobsView } from "@/components/dashboard/jobs-view";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const jobs = await db.job.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight">No active jobs found</h2>
                    <p className="text-muted-foreground text-base">
                        It looks like you haven&apos;t posted any jobs yet. Create your first job posting to start finding great talent.
                    </p>
                </div>
                <div className="pt-4">
                    <NewJobButton />
                </div>
            </div>
        );
    }

    return (
        <JobsView jobs={jobs} />
    );
}
