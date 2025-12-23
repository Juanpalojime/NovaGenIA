import { GoogleGenAI } from "@google/genai";
import { TrainingParams } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTrainingConfig = async (projectName: string, triggerWord: string): Promise<Partial<TrainingParams>> => {
    if (!apiKey) {
        console.warn("No API Key available for Gemini");
        return { steps: 2000, loraRank: 128, learningRate: 40 };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-latest',
            contents: `As an expert AI engineer, suggest optimal LoRA training parameters for a Stable Diffusion model.
            Project Name: "${projectName}"
            Trigger Word: "${triggerWord}"
            
            Return ONLY a JSON object with these keys: "steps" (integer between 500-5000), "loraRank" (8, 16, 32, 64, 128, or 256), and "learningRate" (integer 1-100 representing 1e-X notation, e.g. 40 means 4e-4).
            Example: {"steps": 1500, "loraRank": 64, "learningRate": 30}`,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return { steps: 2000, loraRank: 128, learningRate: 40 };
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini optimization failed", e);
        return { steps: 2000, loraRank: 128, learningRate: 40 };
    }
};

export const streamTrainingLogs = async function* (params: TrainingParams) {
    if (!apiKey) {
        // Fallback mock generator if no key
        const steps = ["Initializing CUDA cores...", "Loading dataset...", "Compiling U-Net...", "Start Training Loop"];
        for (const step of steps) {
            yield step;
            await new Promise(r => setTimeout(r, 500));
        }
        return;
    }

    try {
        const prompt = `Simulate a real-time terminal log output for training a LoRA model named "${params.projectName}".
        Include technical details like "Allocation VRAM", "Caching latents", "Step x/y loss=z".
        Generate about 10 lines of technical logs. Make it look like a CLI output.`;

        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash-latest',
            contents: prompt,
        });

        for await (const chunk of stream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (e) {
        console.error("Stream failed", e);
        yield "Error connecting to AI Logger service...";
    }
};
