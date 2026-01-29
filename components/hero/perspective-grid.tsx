"use client";

import { motion } from "framer-motion";

export function PerspectiveGrid() {
    return (
        <div className="absolute inset-x-0 bottom-0 h-[40%] overflow-hidden pointer-events-none z-0">
            <div
                className="absolute inset-x-0 top-0 h-full w-full"
                style={{
                    perspective: "500px",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Moving Grid Floor */}
                <motion.div
                    className="absolute inset-x-[-50%] top-0 h-[200%] w-[200%]"
                    style={{
                        transform: "rotateX(75deg) translateZ(-100px)",
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        transformOrigin: "center top",
                    }}
                    animate={{
                        backgroundPositionY: ["0px", "60px"],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Fade Mask (Radial) to seamlessly blend edges */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,hsl(var(--background))_80%)]" />
            </div>
        </div>
    );
}
