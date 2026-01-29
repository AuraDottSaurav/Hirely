"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GodRays({ className }: { className?: string }) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
            {/* Blob 1: Insane Electric Blue  */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.9, 0.6],
                    x: [0, 40, 0],
                    y: [0, -40, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    filter: "blur(90px)",
                }}
                className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-blue-600 mix-blend-screen opacity-80"
            />

            {/* Blob 2: Deep Violet Pulse */}
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.8, 0.5],
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    filter: "blur(100px)",
                }}
                className="absolute -top-[5%] -left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-700 mix-blend-screen opacity-70"
            />

            {/* Blob 3: Center Ambient */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    filter: "blur(120px)",
                }}
                className="absolute top-[0%] left-[25%] w-[50%] h-[500px] bg-violet-600/40 rounded-full mix-blend-screen"
            />

            {/* Grain Texture Overlay */}
            <div
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
