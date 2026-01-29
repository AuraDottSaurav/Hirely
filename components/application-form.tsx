'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitApplication } from "@/app/actions/application";
import { Job, FormConfig } from "@prisma/client";

// Helper to build schema dynamically? 
// For simplicity, we'll use a loose schema here or a large one where optional fields are optional.



interface ApplicationFormProps {
    job: Job & { formConfig: FormConfig | null };
}

export function ApplicationForm({ job }: ApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const config = job.formConfig;

    // Dynamic Schema Creation
    const formSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email(),
        portfolioUrl: z.string().optional(), // Always optional per request
        // Conditional validations
        noticePeriod: config?.includeNoticePeriod
            ? z.string().min(1, "Notice Period is required")
            : z.string().optional(),
        currentOrg: config?.includeCurrentOrg
            ? z.string().min(1, "Current Organization is required")
            : z.string().optional(),
        yearsOfExperience: config?.includeYearsExperience
            ? z.string().min(1, "Years of Experience is required")
            : z.string().optional(),
        resume: config?.includeResume
            ? z.instanceof(File, { message: "Resume is required" })
                .refine((file) => file.size > 0, "File is required")
                .refine((file) => file.type === "application/pdf", "Must be a PDF")
            : z.any().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            portfolioUrl: "",
            noticePeriod: "",
            currentOrg: "",
            yearsOfExperience: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("jobId", job.id);
            formData.append("name", values.name);
            formData.append("email", values.email);
            if (values.portfolioUrl) formData.append("portfolioUrl", values.portfolioUrl);
            if (values.noticePeriod) formData.append("noticePeriod", values.noticePeriod!);
            if (values.currentOrg) formData.append("currentOrg", values.currentOrg!);
            if (values.yearsOfExperience) formData.append("yearsOfExperience", values.yearsOfExperience!);
            if (values.resume instanceof File) formData.append("resume", values.resume);

            const result = await submitApplication(formData);
            if (result.success) {
                setIsSuccess(true);
                toast.success("Application Submitted!");
            } else {
                toast.error(result.error || "Failed to submit");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("Something went wrong. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none m-0">Application Received</h3>
                    <p className="text-base text-muted-foreground leading-relaxed m-0">
                        Thank you for applying to <span className="text-foreground font-semibold">{job.title}</span>.
                        We have received your application and will be in touch soon.
                    </p>
                </div>
                <p className="text-sm text-muted-foreground/60 pt-6 border-t border-border/30 m-0">
                    Our team is currently reviewing your profile.
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* AI Screening Disclaimer */}
                <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-orange-200">AI-Powered Screening</h4>
                            <p className="text-sm text-orange-200/70 mt-1 leading-relaxed">
                                This application uses automated screening to evaluate candidates. Please ensure your submission is:
                            </p>
                            <ul className="text-xs text-orange-200/60 mt-2 list-disc list-inside space-y-1.5">
                                <li>Updated with your latest skills</li>
                                <li>Tailored to job requirements</li>
                                <li>Accurate and truthful</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {config?.includeResume && (
                    <FormField
                        control={form.control}
                        name="resume"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Resume (PDF Only) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept=".pdf"
                                        onChange={(event) => {
                                            const file = event.target.files && event.target.files[0];
                                            if (file) onChange(file);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {config?.includeYearsExperience && (
                    <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Years of Experience <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 5" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {config?.includeCurrentOrg && (
                    <FormField
                        control={form.control}
                        name="currentOrg"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Organization <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Acme Corp" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {config?.includeNoticePeriod && (
                    <FormField
                        control={form.control}
                        name="noticePeriod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notice Period <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 1 Month" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {config?.includePortfolio && (
                    <FormField
                        control={form.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Portfolio URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                </Button>
            </form>
        </Form>
    );
}
