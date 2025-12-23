import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract base64 data from response
const extractImageFromResponse = (response: any): string => {
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64EncodeString = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${base64EncodeString}`;
      }
    }
  }
  throw new Error("No image data found in the response.");
};

// Helper to clean base64 string for API
const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  negativePrompt?: string
): Promise<string> => {
  try {
    const finalPrompt = negativePrompt 
      ? `${prompt}. (Exclude: ${negativePrompt})` 
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const editImage = async (
  imageBase64: string,
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            inlineData: { 
              data: cleanBase64(imageBase64), 
              mimeType: 'image/png' 
            } 
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

export const upscaleImage = async (
  imageBase64: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    // Using gemini-3-pro-image-preview for high quality output (upscaling simulation)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { 
            inlineData: { 
              data: cleanBase64(imageBase64), 
              mimeType: 'image/png' 
            } 
          },
          { text: "Enhance resolution, upscale to 2K, high fidelity, sharp details." },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: '2K', // Explicitly requesting higher resolution
        },
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw error;
  }
};
