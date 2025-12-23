import { GoogleGenAI } from "@google/genai";
import { GenerationParams } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateImage = async (params: GenerationParams): Promise<string> => {
  try {
    const selectedModel = params.model || 'gemini-2.5-flash-image';
    
    // Construct a rich prompt that includes negative constraints if provided
    let finalPrompt = params.prompt;
    if (params.negativePrompt) {
      finalPrompt += `\n\nAvoid the following: ${params.negativePrompt}`;
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: params.aspectRatio || "1:1"
        }
      }
    });

    // Iterate through parts to find the image data
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
    
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
