"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NewJobButton() {
    return (
        <Link href="/dashboard/create-job">
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
                            New Job
                            <div className="bg-black rounded-full p-1 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-[#facc15] stroke-[3px] group-hover:rotate-90 transition-transform duration-300" />
                            </div>
                        </span>
                    </div>
                </div>
            </motion.button>
        </Link>
    );
}
