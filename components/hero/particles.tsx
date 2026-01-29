"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const updateSize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
}

export function Particles() {
    const { width, height } = useWindowSize();
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        if (width === 0) return;
        const particleCount = Math.min(50, Math.floor(width / 20)); // Responsive count
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 20 + 10,
        }));
        setParticles(newParticles);
    }, [width, height]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-white/20 rounded-full"
                    style={{ width: p.size, height: p.size }}
                    initial={{ x: p.x, y: p.y, opacity: 0 }}
                    animate={{
                        y: [p.y, p.y - 100], // Float up
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
}
