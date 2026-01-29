import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { bookInterview } from "@/app/actions/availability";
import { redirect } from "next/navigation";
import { BookingButton } from "@/components/booking-button";

export default async function MeetPage({ params }: { params: { candidateId: string } }) {
    const { candidateId } = await params; // Await params in newer Next.js

    const candidate = await db.candidate.findUnique({
        where: { id: candidateId },
        include: { job: true }
    }) as any;

    if (!candidate) {
        return notFound();
    }

    if (candidate.interviewStatus === "SCHEDULED") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl relative overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                    <div className="text-left p-5 pt-8 space-y-6">
                        <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold tracking-tight text-foreground leading-none m-0">Interview Scheduled!</h3>
                            <p className="text-base text-muted-foreground m-0">
                                Your interview for <span className="text-foreground font-semibold">{candidate.job.title}</span> has been confirmed.
                            </p>
                        </div>
                        <div className="bg-muted/30 border border-border/30 p-5 rounded-xl space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scheduled For</p>
                            <p className="text-lg font-bold text-foreground">{format(new Date(candidate.interviewDate!), "MMMM d, h:mm a")}</p>
                            <p className="text-xs text-muted-foreground font-medium">{format(new Date(candidate.interviewDate!), "EEEE, yyyy")}</p>
                        </div>
                        {candidate.meetingLink && (
                            <Button asChild className="w-full h-12 text-base font-bold transition-all active:scale-95 border-none">
                                <a href={candidate.meetingLink} target="_blank" rel="noopener noreferrer">
                                    Join Meeting
                                </a>
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (!candidate.proposedSlots) {
        return notFound();
    }

    const slots: string[] = JSON.parse(candidate.proposedSlots);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-card border-border/50 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="text-left p-6 pb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Schedule Your Interview</CardTitle>
                    <CardDescription className="pt-3 text-base text-muted-foreground leading-relaxed">
                        Congratulations! We'd like to invite you for an interview for the <span className="text-foreground font-semibold">{candidate.job.title}</span> position.
                        <br /><br />
                        Please select a time that works for you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid gap-4">
                        {slots.map((slotIso, idx) => (
                            <BookingButton
                                key={idx}
                                slotIso={slotIso}
                                candidateId={candidateId}
                            />
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-2 border-t border-border/30 bg-muted/5 justify-center">
                    <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                        Times are shown in your local timezone
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
