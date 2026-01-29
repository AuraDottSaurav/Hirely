"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function AnimatedBorderCard({ children, className, ...props }: AnimatedBorderCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl p-[2px] group",
                className
            )}
            {...props}
        >
            {/* Spinning Gradient Border */}
            <div className="absolute inset-[-50%] aspect-square bg-[conic-gradient(transparent_0deg,transparent_60deg,var(--primary)_100deg,transparent_140deg)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content Mask - Background of the card */}
            <div className="relative h-full w-full rounded-2xl bg-card/90 backdrop-blur-xl p-8">
                {children}
            </div>
        </div>
    );
}
