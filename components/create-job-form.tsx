'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, ArrowRight, ArrowLeft, Briefcase, ScrollText, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateJobDescription } from "@/app/actions/ai";
import { createJob } from "@/app/actions/jobs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    title: z.string().min(2, "Job title is required"),
    description: z.string().min(10, "Description needs to be detailed"),
    responsibilities: z.string().optional(),
    keywords: z.string().optional(),
    assignmentDetails: z.string().optional(),
    // Config
    includeName: z.boolean().default(true),
    includeEmail: z.boolean().default(true),
    includeResume: z.boolean().default(false),
    includePortfolio: z.boolean().default(false),
    includeNoticePeriod: z.boolean().default(false),
    includeCurrentOrg: z.boolean().default(false),
    includeYearsExperience: z.boolean().default(false),
});

export function CreateJobForm() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            responsibilities: "",
            keywords: "",
            assignmentDetails: "",
            includeName: true,
            includeEmail: true,
            includeResume: false,
            includePortfolio: false,
            includeNoticePeriod: false,
            includeCurrentOrg: false,
            includeYearsExperience: false,
        },
    });

    const handleGenerateAI = async () => {
        const title = form.getValues("title");
        if (!title) {
            toast.error("Please enter a Job Title first");
            return;
        }

        setIsGenerating(true);
        try {
            const desc = await generateJobDescription(title);
            if (desc) {
                const currentDesc = form.getValues("description");
                const spacer = currentDesc ? "\n\n" : "";
                form.setValue("responsibilities", desc);
                if (!currentDesc) {
                    form.setValue("description", `We are hiring a ${title} to join our team.`);
                }
                toast.success("Responsibilities generated!");
            }
        } catch {
            toast.error("Failed to generate content. Check API Key.");
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const res = await createJob(values);
            if (res.success) {
                toast.success("Job Posting Created!");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Job Creation Error:", error);
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        const valid = await form.trigger(["title", "description"]);
        if (valid) setStep(2);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Basic Info Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Job Details</CardTitle>
                                        <CardDescription>Provide basic information about the role.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Senior Product Designer"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Short Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Overview of the role..." className="h-20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Responsibilities Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Key Responsibilities</CardTitle>
                                        <CardDescription>Detailed list of responsibilities. Use AI to generate this.</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                                    Generate with AI
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="responsibilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea placeholder="List details..." className="h-40 text-sm" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                You can edit the AI generated content here.
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Assignment Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <ScrollText className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Assignment Details</CardTitle>
                                        <CardDescription>Set an optional assignment for candidates.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="assignmentDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* Label removed as it's in the card header */}
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter assignment instructions, deadlines, etc. This is sent if they pass the resume screening."
                                                    className="h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="button" onClick={nextStep} className="group gap-2">
                                Next Step
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>Application Form Fields</CardTitle>
                                        <CardDescription>Select the fields candidates must providing when applying.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 border rounded-lg p-4">
                                    {/* Toggles */}
                                    <FormField control={form.control} name="includeResume" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Resume Upload</FormLabel>
                                                <FormDescription>Require candidates to upload a CV</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="includePortfolio" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Portfolio Link</FormLabel>
                                                <FormDescription>Ask for a portfolio URL</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="includeNoticePeriod" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Notice Period</FormLabel>
                                                <FormDescription>How soon can they start?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="includeYearsExperience" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Years of Experience</FormLabel>
                                                <FormDescription>Total relevant experience</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="includeCurrentOrg" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-3 border shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Current Organization</FormLabel>
                                                <FormDescription>Ask for their current company</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Create Job Posting
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </Form >
    );
}
