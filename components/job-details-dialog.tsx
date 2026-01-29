'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Job {
    id: string;
    title: string;
    description: string;
    responsibilities?: string | null;
    keywords?: string | null;
    assignmentDetails?: string | null;
    isOpen?: boolean;
}

export function JobDetailsDialog({ job }: { job: Job }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileText className="h-4 w-4" />
                    View Job Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="gap-1">
                    <DialogTitle className="text-xl">{job.title}</DialogTitle>
                    <DialogDescription>
                        Complete job posting details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Job Description */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>

                    {/* Responsibilities */}
                    {job.responsibilities && (
                        <div className="space-y-2 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Responsibilities</h4>
                            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {job.responsibilities}
                            </div>
                        </div>
                    )}

                    {/* Keywords/Skills */}
                    {job.keywords && (
                        <div className="space-y-2 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {job.keywords.split(',').map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {keyword.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignment Details */}
                    {job.assignmentDetails && (
                        <div className="space-y-2 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assignment Details</h4>
                            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {job.assignmentDetails}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
