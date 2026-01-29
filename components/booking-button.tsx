"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { bookInterview } from "@/app/actions/availability";
import { useRouter } from "next/navigation";

interface BookingButtonProps {
    slotIso: string;
    candidateId: string;
}

export function BookingButton({ slotIso, candidateId }: BookingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const date = new Date(slotIso);

    const handleBooking = async () => {
        setIsLoading(true);
        try {
            const result = await bookInterview(candidateId, slotIso);

            if (result.success) {
                toast.success("Interview booked successfully!");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to book interview");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            className="w-full justify-between h-auto py-5 px-6 bg-muted/10 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group rounded-xl"
            onClick={handleBooking}
            disabled={isLoading}
        >
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-full bg-muted/20 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left space-y-0.5">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {format(date, "EEEE, MMMM d")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {format(date, "h:mm a")} - {format(new Date(date.getTime() + 45 * 60000), "h:mm a")}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        Select
                    </div>
                )}
            </div>
        </Button>
    );
}
