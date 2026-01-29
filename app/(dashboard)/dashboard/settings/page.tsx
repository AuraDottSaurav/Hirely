import { SettingsForm } from "@/components/settings-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4 max-w-4xl mx-auto">
                <Link
                    href="/dashboard"
                    className="group text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="sr-only">Back</span>
                </Link>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
                    <p className="text-muted-foreground">
                        Manage external integrations and API keys.
                    </p>
                </div>
            </div>

            <SettingsForm />
        </div>
    );
}
