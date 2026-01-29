'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { Loader2, Key, Globe, Shield, Save } from "lucide-react";

const formSchema = z.object({
    geminiApiKey: z.string().optional(),
    googleClientId: z.string().optional(),
    googleClientSecret: z.string().optional(),
    googleRedirectUri: z.string().optional(),
    clerkPublishableKey: z.string().optional(),
    clerkSecretKey: z.string().optional(),
});

export function SettingsForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            geminiApiKey: "",
            googleClientId: "",
            googleClientSecret: "",
            googleRedirectUri: "",
            clerkPublishableKey: "",
            clerkSecretKey: "",
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const result = await getSettings();
                if (result.success && result.settings) {
                    form.reset({
                        geminiApiKey: result.settings.geminiApiKey || "",
                        googleClientId: result.settings.googleClientId || "",
                        googleClientSecret: result.settings.googleClientSecret || "",
                        googleRedirectUri: result.settings.googleRedirectUri || "",
                        clerkPublishableKey: result.settings.clerkPublishableKey || "",
                        clerkSecretKey: result.settings.clerkSecretKey || "",
                    });
                }
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSaving(true);
        try {
            const result = await updateSettings(values);
            if (result.success) {
                toast.success("Settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">

                {/* AI Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>AI Configuration</CardTitle>
                                <CardDescription>Manage your Gemini AI API keys for resume screening and job generation.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="geminiApiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gemini API Key</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="AIza..." type="password" {...field} className="pl-9" />
                                            <Key className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Used for generating job descriptions and screening candidates.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Google OAuth Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>Google Calendar Integration</CardTitle>
                                <CardDescription>Configure OAuth credentials for Google Calendar syncing.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="googleClientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="...apps.googleusercontent.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="googleClientSecret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Secret</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GOCSPX..." type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="googleRedirectUri"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Redirect URI</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://your-domain.com/api/oauth/google/callback" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Must match the Authorized Redirect URI in Google Cloud Console.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Clerk Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                <Key className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle>Authentication (Clerk)</CardTitle>
                                <CardDescription>Store your Clerk keys for reference. (Requires restart to apply changes if used in env)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="clerkPublishableKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Publishable Key</FormLabel>
                                    <FormControl>
                                        <Input placeholder="pk_test_..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="clerkSecretKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Secret Key</FormLabel>
                                    <FormControl>
                                        <Input placeholder="sk_test_..." type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Configuration
                    </Button>
                </div>
            </form>
        </Form>
    );
}
