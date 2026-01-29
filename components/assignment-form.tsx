'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignment } from "@/app/actions/assignment";
import { Loader2, Upload, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AssignmentForm({ candidate }: { candidate: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [link, setLink] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [tab, setTab] = useState("link"); // link or file

    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tab === "link" && !link) {
            toast.error("Please enter a link");
            return;
        }
        if (tab === "file" && !file) {
            toast.error("Please upload a file");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("candidateId", candidate.id);

        if (tab === "link") {
            formData.append("assignmentLink", link);
        } else {
            formData.append("assignmentFile", file!);
        }

        try {
            const res = await submitAssignment(formData);
            if (res.success) {
                setIsSuccess(true);
                toast.success("Assignment Submitted!");
            } else {
                toast.error(res.error || "Failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-left py-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-green-400">Submitted Successfully</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Good luck! Your assignment has been recorded. We'll be in touch soon.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                    <Label className="text-muted-foreground font-medium">Full Name</Label>
                    <Input value={candidate.name} disabled className="bg-muted/30 border-border/50 text-foreground/70" />
                </div>
                <div className="space-y-2.5">
                    <Label className="text-muted-foreground font-medium">Email</Label>
                    <Input value={candidate.email} disabled className="bg-muted/30 border-border/50 text-foreground/70" />
                </div>
            </div>

            <div className="pt-2">
                <Label className="text-lg font-bold text-foreground mb-4 block">Submit your work</Label>
                <Tabs defaultValue="link" value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 border border-border/50 rounded-xl h-14">
                        <TabsTrigger value="link" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-base">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link
                        </TabsTrigger>
                        <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-base">
                            <Upload className="w-4 h-4 mr-2" />
                            File Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="mt-6 space-y-3">
                        <div className="space-y-2">
                            <Input
                                placeholder="https://github.com/username/project"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="h-12 bg-background border-border/60 hover:border-primary/50 focus:border-primary transition-colors text-base"
                            />
                            <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5 ml-1">
                                <div className="w-1 h-1 rounded-full bg-primary/60" />
                                Make sure the link is publicly accessible for review.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="file" className="mt-6 space-y-3">
                        <div className="group border-2 border-dashed border-border/40 hover:border-primary/40 rounded-2xl p-5 text-center hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden">
                            <Input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept=".pdf,.zip,.docx,.png,.jpg"
                            />
                            <div className="flex flex-col items-center gap-4 relative z-0">
                                <div className="p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                {file ? (
                                    <div className="space-y-1">
                                        <p className="text-primary font-semibold break-all text-base">{file.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-foreground/90 font-medium text-base">Click to upload or drag & drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, ZIP, DOCX (Max 25MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Assignment"
                )}
            </Button>
        </form>
    );
}
