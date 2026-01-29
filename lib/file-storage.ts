import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function saveFileLocally(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}
