"use client";

import Link from "next/link";
import { Job } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface JobCardProps {
    job: Job;
    className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
    return (
        <Link
            href={`/dashboard/jobs/${job.id}`}
            className={cn(
                "group relative block overflow-hidden rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20",
                className
            )}
        >
            <div className="flex flex-col space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-primary transition-colors duration-300">
                            {job.title}
                        </h3>
                        {/* Optional: Add badge/tag if available in schema later */}
                    </div>
                    <div className="transform translate-x-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                        <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {job.description}
                </p>

                <div className="pt-2 mt-auto border-t border-border/40">
                    <p className="text-xs font-medium text-muted-foreground">
                        Posted on {job.createdAt.toLocaleDateString()}
                    </p>
                </div>
            </div>
        </Link>
    );
}
