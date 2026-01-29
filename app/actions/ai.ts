'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// Helper to get API Key
async function getGeminiApiKey() {
    const { userId } = await auth();
    if (userId) {
        const settings = await (db as any).userSettings.findUnique({ where: { userId } });
        if (settings?.geminiApiKey) {
            return settings.geminiApiKey;
        }
    }
    return process.env.GOOGLE_GEMINI_API_KEY || "";
}

export async function generateJobDescription(jobTitle: string) {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
        throw new Error("Gemini API Key not configured. Please add it in Settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Write a professional and concise list of job responsibilities for a "${jobTitle}". 
    Format it as a bulleted list (Markdown). 
    Keep it under 200 words. 
    Focus on key duties and required skills.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate content");
    }
}

async function uploadToGemini(buffer: Buffer, apiKey: string, mimeType: string = "application/pdf") {
    const fileManager = new GoogleAIFileManager(apiKey);
    const tempFilePath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType,
            displayName: "Candidate Resume",
        });
        console.log(`[AI] Uploaded resume to Gemini: ${uploadResponse.file.uri}`);
        return uploadResponse.file;
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

export async function screenCandidate(
    resumeText: string | null,
    jobDescription: string,
    keywords: string,
    pdfBuffer?: Buffer
): Promise<{ score: number; reason: string }> {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
        return { score: 0, reason: "AI Screening not configured (Missing API Key). Please check Settings." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemInstruction = `
        You are an expert HR recruiter. Compare the Candidate Resume against the Job Description and Keywords.
        
        Job Description:
        "${jobDescription}"
        
        Keywords:
        "${keywords}"
        
        Task:
        1. Evaluate the relevance of the resume to the job.
        2. Assign a score from 0 to 100. (70 is the passing threshold).
        3. Provide a brief, honest reason for the score. 
           - If REJECTED (<70), explain what is missing.
           - If PASSED (>=70), highlight strengths.

        Output ONLY strict JSON format:
        {
          "score": 0-100,
          "reason": "One sentence explanation"
        }
        `;

        let promptParts: any[] = [{ text: systemInstruction }];

        if (pdfBuffer) {
            console.log("[AI] Using Multimodal Vision (PDF Buffer provided)...");
            try {
                const uploadResult = await uploadToGemini(pdfBuffer, apiKey);
                promptParts.push({
                    fileData: {
                        mimeType: uploadResult.mimeType,
                        fileUri: uploadResult.uri
                    }
                });
            } catch (e) {
                console.error("[AI] File Upload Failed:", e);
                return { score: 0, reason: "AI File Upload Failed. Please try text-based PDF." };
            }
        } else if (resumeText) {
            promptParts.push({ text: `Candidate Resume Text:\n"${resumeText}"` });
        } else {
            return { score: 0, reason: "No resume content provided." };
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        try {
            const parsed = JSON.parse(text);
            return {
                score: typeof parsed.score === 'number' ? parsed.score : 0,
                reason: parsed.reason || "No reason provided"
            };
        } catch (e) {
            console.error("[AI] JSON Parse Error:", text);
            return { score: 0, reason: "AI returned invalid response format." };
        }
    } catch (error) {
        console.error("AI Screening Error:", error);
        return { score: 0, reason: `AI Screening failed: ${(error as Error).message || "Unknown Error"}` };
    }
}
