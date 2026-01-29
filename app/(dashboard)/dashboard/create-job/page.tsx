import { CreateJobForm } from "@/components/create-job-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateJobPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
                <Link
                    href="/dashboard"
                    className="group text-muted-foreground hover:text-foreground transition-colors mt-2.5"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="sr-only">Back</span>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Create Job Posting</h1>
                    <p className="text-muted-foreground">
                        Follow the steps to configure your job application and hiring workflow.
                    </p>
                </div>
            </div>
            <CreateJobForm />
        </div>
    );
}
