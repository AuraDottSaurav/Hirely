"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toggleJobStatus } from "@/app/actions/job";
import { toast } from "sonner";

interface CloseJobButtonProps {
    jobId: string;
    isOpen: boolean;
}

export function CloseJobButton({ jobId, isOpen }: CloseJobButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const result = await toggleJobStatus(jobId, !isOpen);
            if (result.success) {
                toast.success(isOpen ? "Job closed successfully" : "Job re-opened successfully");
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to update job status");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                onClick={handleToggleStatus}
                className="gap-2 border-green-500/20 hover:bg-green-500/10 text-green-400 hover:text-green-300 transition-all font-medium"
                disabled={isLoading}
            >
                <CheckCircle className="w-4 h-4" />
                {isLoading ? "Opening..." : "Re-open Job"}
            </Button>
        );
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2 font-semibold shadow-lg shadow-destructive/10">
                    <Ban className="w-4 h-4" />
                    Close Job
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border/50 max-w-md">
                <AlertDialogHeader className="text-left">
                    <AlertDialogTitle className="text-2xl font-bold tracking-tight">Close this job position?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground leading-relaxed pt-2">
                        This will disable the public application form immediately. Candidates will no longer be able to submit new applications.
                        <br /><br />
                        <span className="text-foreground/80 font-medium italic block bg-muted/60 p-5 rounded-xl border border-border/50">
                            "We have found our newest team member, but we are always expanding..."
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex sm:justify-end gap-3">
                    <AlertDialogCancel className="bg-muted/50 border-none hover:bg-muted text-foreground transition-all">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggleStatus();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold px-6"
                        disabled={isLoading}
                    >
                        {isLoading ? "Closing..." : "Yes, Close Position"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
