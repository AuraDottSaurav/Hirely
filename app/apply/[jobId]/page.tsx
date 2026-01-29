import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
    const job = await db.job.findUnique({
        where: { id: jobId },
        include: { formConfig: true },
    });

    if (!job) return notFound();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className={`relative overflow-hidden max-w-md w-full space-y-8 bg-card border border-border/50 p-5 pt-8 rounded-xl shadow-2xl`}>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                {!(job as any).isOpen ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Position Closed
                        </h2>
                        <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-5">
                            <p className="text-base text-orange-200/90 leading-relaxed">
                                We have found our newest team member, but we are always expanding - So keep your eye on job postings.
                                <br /><br />
                                Until then, we wish you a lot of success and prosperity in life. Thank you for your valuable time!
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-left">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Apply for {job.title}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                {job.description}
                            </p>
                        </div>
                        <ApplicationForm job={job} />
                    </>
                )}
            </div>
        </div>
    );
}
