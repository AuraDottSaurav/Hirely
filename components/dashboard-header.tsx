"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Briefcase, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
    const pathname = usePathname();
    const isActiveSettings = pathname.startsWith("/dashboard/settings");
    const isActiveJobs = !isActiveSettings && (pathname === "/dashboard" || pathname.startsWith("/dashboard/jobs"));

    return (
        <header className="flex h-14 items-center border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
            <div className="flex items-center gap-6 h-full w-full">
                {/* Branding - Vertically Centered */}
                <div className="flex items-center gap-2 group/brand cursor-default">
                    <div className="flex bg-primary text-primary-foreground p-1 rounded-md group-hover/brand:scale-110 transition-transform duration-200">
                        <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-lg hidden md:block">Hirely</span>
                </div>

                {/* Chrome-style Tabs */}
                {/* Positioned absolutely to sit on the bottom border */}
                <div className="absolute bottom-0 left-[110px] md:left-[140px] flex items-end z-10 gap-1">
                    {/* Active Jobs Tab */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "group relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out",
                            // Tab Shape
                            "rounded-t-xl",
                            isActiveJobs
                                ? "bg-card border-t border-l border-r border-border/50 text-foreground shadow-[0_-1px_2px_rgba(0,0,0,0.05)] z-20"
                                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground z-0"
                        )}
                    >
                        {/* Curve effect for active tab - Left Side */}
                        {isActiveJobs && (
                            <div className="absolute bottom-0 -left-2 w-2 h-2 bg-transparent shadow-[2px_2px_0_0_hsl(var(--card))]" style={{ borderBottomRightRadius: "0.5rem" }} />
                        )}

                        <div className="flex items-center justify-center h-4 w-4">
                            <div className={cn(
                                "h-2 w-2 rounded-full shadow-inner transition-all duration-300",
                                isActiveJobs ? "bg-blue-500 animate-pulse shadow-blue-500/50" : "bg-blue-500 opacity-70 group-hover:scale-125"
                            )} />
                        </div>

                        <span className="truncate">Active Jobs</span>

                        {/* Curve effect for active tab - Right Side */}
                        {isActiveJobs && (
                            <div className="absolute bottom-0 -right-2 w-2 h-2 bg-transparent shadow-[-2px_2px_0_0_hsl(var(--card))]" style={{ borderBottomLeftRadius: "0.5rem" }} />
                        )}
                    </Link>

                    {/* Settings Tab */}
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "group relative flex items-center gap-2 px-6 py-3 min-w-[120px] text-sm font-medium transition-all duration-200 ease-in-out",
                            // Tab Shape
                            "rounded-t-xl",
                            isActiveSettings
                                ? "bg-card border-t border-l border-r border-border/50 text-foreground shadow-[0_-1px_2px_rgba(0,0,0,0.05)] z-20"
                                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground z-0"
                        )}
                    >
                        {/* Curve effect for active tab - Left Side */}
                        {isActiveSettings && (
                            <div className="absolute bottom-0 -left-2 w-2 h-2 bg-transparent shadow-[2px_2px_0_0_hsl(var(--card))]" style={{ borderBottomRightRadius: "0.5rem" }} />
                        )}

                        <Settings className={cn("h-4 w-4 transition-transform duration-300 group-hover:rotate-90", isActiveSettings ? "text-foreground" : "text-muted-foreground")} />

                        <span className="truncate flex-1 text-center">Settings</span>

                        {/* Curve effect for active tab - Right Side */}
                        {isActiveSettings && (
                            <div className="absolute bottom-0 -right-2 w-2 h-2 bg-transparent shadow-[-2px_2px_0_0_hsl(var(--card))]" style={{ borderBottomLeftRadius: "0.5rem" }} />
                        )}
                    </Link>
                </div>


                {/* Right Side: User Profile - Vertically Centered */}
                <div className="ml-auto flex items-center">
                    <div className="flex items-center gap-2 rounded-full p-1 bg-gradient-to-r from-cyan-400 to-blue-600 shadow-md">
                        <div className="bg-transparent text-white rounded-full">
                            <UserButton showName appearance={{
                                elements: {
                                    userButtonBox: "flex flex-row-reverse gap-2",
                                    userButtonOuterIdentifier: "text-white font-semibold text-sm mr-2",
                                    avatarBox: "h-8 w-8 ring-2 ring-white/20"
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
