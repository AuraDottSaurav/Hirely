"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PrimaryCTA({
    text = "Start Hiring",
    href = "/sign-up",
    className
}: {
    text?: string;
    href?: string;
    className?: string
}) {
    return (
        <Link href={href} className={className}>
            {/* 3D Yellow Button */}
            <motion.button
                whileHover={{ y: 2 }}
                whileTap={{ y: 4 }}
                className="group relative isolate"
            >
                {/* Shadow Layer (The 3D Depth) */}
                <div className="absolute inset-0 top-1 rounded-full bg-gradient-to-b from-[#CA8A04] to-[#b45309]" />

                {/* Main Surface */}
                <div className="relative transform transition-transform duration-100 active:translate-y-1">
                    <div className={cn(
                        "flex items-center justify-center gap-3 px-8 py-3 text-lg font-bold rounded-full",
                        "bg-gradient-to-b from-[#fef08a] to-[#facc15] text-black", // Lighter yellow gradient
                        "shadow-[inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]", // Strong gloss
                        "border border-[#fbbf24]" // Amber-400 border
                    )}>
                        <span className="flex items-center gap-2">
                            {text}
                            <div className="bg-black rounded-full p-1 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-[#facc15] stroke-[3px] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </span>
                    </div>
                </div>
            </motion.button>
        </Link>
    );
}

export function HeroCTA() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 relative z-20 items-center justify-center">
            <PrimaryCTA />

            <Link href="/sign-in">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-full text-lg font-medium text-white/80 hover:text-white transition-all border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md relative overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Log In
                    </span>
                    {/* Subtle Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                </motion.button>
            </Link>
        </div>
    );
}
