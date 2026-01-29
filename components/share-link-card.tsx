'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function ShareLinkCard({ jobId }: { jobId: string }) {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const path = `/apply/${jobId}`;
    const fullUrl = mounted ? `${window.location.origin}${path}` : path;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
            <div className="space-y-1">
                <h3 className="font-semibold">Share Job Link</h3>
                <p className="text-sm text-muted-foreground">Share this link to start collecting applications.</p>
            </div>
            <div className="p-3 bg-muted rounded-md text-xs font-mono break-all border truncate">
                {fullUrl}
            </div>
            <Button className="w-full" variant="secondary" onClick={handleCopy}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
            </Button>
        </div>
    );
}
