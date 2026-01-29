"use client";

import { motion } from "framer-motion";
import { Briefcase, FileText, Calendar, User, Mail, Database } from "lucide-react";

export function AutomationVisual() {
    const center = { x: 400, y: 300 };
    const radius = 160;

    // Calculate node positions
    const getPos = (angleDeg: number) => {
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: center.x + radius * Math.cos(angleRad),
            y: center.y + radius * Math.sin(angleRad),
        };
    };

    const nodes = [
        { id: 1, ...getPos(0), icon: Database, label: "Data" },     // Top
        { id: 2, ...getPos(72), icon: Calendar, label: "Schedule" }, // Top Right
        { id: 3, ...getPos(144), icon: Mail, label: "Email" },      // Bottom Right
        { id: 4, ...getPos(216), icon: User, label: "Profile" },    // Bottom Left
        { id: 5, ...getPos(288), icon: FileText, label: "Resume" }, // Top Left
    ];

    return (
        // Removed mt-16, set to mt-0 or just removed. 
        <div className="relative w-full max-w-[800px] aspect-[4/3] mx-auto mt-0 opacity-100 z-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" fill="none" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="signal-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow-icon">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <circle cx={center.x} cy={center.y} r="0" stroke="url(#signal-gradient)" strokeWidth="1" fill="none" opacity="0.3">
                    <animate attributeName="r" from="0" to={radius + 40} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
                </circle>

                {nodes.map((node) => (
                    <g key={node.id}>
                        <path
                            d={`M${center.x},${center.y} L${node.x},${node.y}`}
                            stroke="white"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                        />
                        <motion.path
                            d={`M${center.x},${center.y} L${node.x},${node.y}`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: [0, 0.5, 0],
                                opacity: [0, 1, 0],
                                pathOffset: [0, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 2,
                            }}
                        />
                    </g>
                ))}
            </svg>

            {/* Center Core */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border-t-2 border-indigo-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border-b-2 border-blue-400"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="w-12 h-12 bg-background/90 rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] backdrop-blur-xl">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>

            {nodes.map((node) => {
                // Determine anchor point based on node position
                let transform = "translate(-50%, -50%)"; // default

                // Node 1 (Top): Anchor Bottom Center -> Box is above line
                if (node.id === 1) transform = "translate(-50%, -100%)";
                // Node 2 (Top Right): Anchor Left Center -> Box is right of line
                else if (node.id === 2) transform = "translate(0%, -50%)";
                // Node 3 (Bottom Right): Anchor Top Center -> Box is below line
                else if (node.id === 3) transform = "translate(-50%, 0%)";
                // Node 4 (Bottom Left): Anchor Top Center -> Box is below line
                else if (node.id === 4) transform = "translate(-50%, 0%)";
                // Node 5 (Top Left): Anchor Right Center -> Box is left of line
                else if (node.id === 5) transform = "translate(-100%, -50%)";

                return (
                    <motion.div
                        key={node.id}
                        className="absolute flex items-center justify-center bg-card/80 backdrop-blur-xl border border-white/10 shadow-lg z-20"
                        style={{
                            left: `${(node.x / 800) * 100}%`,
                            top: `${(node.y / 600) * 100}%`,
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            transform: transform,
                        }}
                    >
                        <node.icon className="w-5 h-5 text-gray-300" />

                        <motion.div
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-background"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
