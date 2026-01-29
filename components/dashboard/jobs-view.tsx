"use client";

import { Job } from "@prisma/client";
import { useState } from "react";
import { JobCard } from "./job-card";
import { NewJobButton } from "./new-job-button";
import { cn } from "@/lib/utils";

interface JobsViewProps {
    jobs: Job[];
}

export function JobsView({ jobs }: JobsViewProps) {
    const [activeTab, setActiveTab] = useState<"OPEN" | "CLOSED">("OPEN");

    const filteredJobs = jobs.filter((job) =>
        activeTab === "OPEN" ? job.isOpen : !job.isOpen
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {/* Active Jobs Tab */}
                    <button
                        onClick={() => setActiveTab("OPEN")}
                        className={cn(
                            "text-2xl font-bold tracking-tight transition-colors",
                            activeTab === "OPEN" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        Active Jobs
                    </button>

                    {/* Vertical Divider */}
                    <div className="h-8 mx-4 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                    {/* Closed Jobs Tab */}
                    <button
                        onClick={() => setActiveTab("CLOSED")}
                        className={cn(
                            "text-2xl font-bold tracking-tight transition-colors",
                            activeTab === "CLOSED" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        Closed Jobs
                    </button>
                </div>

                <NewJobButton />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <p>No {activeTab.toLowerCase()} jobs found.</p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))
                )}
            </div>
        </div>
    );
}
