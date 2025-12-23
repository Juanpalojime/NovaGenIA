import { GoogleGenAI } from "@google/genai";
import { AspectRatio, GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  /**
   * Generates an image using the Gemini 2.5 Flash Image model.
   * 
   * @param prompt The user's text prompt.
   * @param style The selected art style.
   * @param aspectRatio The desired aspect ratio.
   * @returns A promise resolving to the generated image data.
   */
  async generateImage(
    prompt: string, 
    style: string, 
    aspectRatio: AspectRatio
  ): Promise<GeneratedImage> {
    
    // Construct a richer prompt based on style
    let finalPrompt = prompt;
    if (style && style !== "None") {
      finalPrompt = `${prompt}, in the style of ${style}, high quality, detailed`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: finalPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            // imageSize: "1K" // Optional, default is 1K
          }
        },
      });

      // Extract image from response
      // The response structure for image generation often returns the image in the parts.
      // We look for the inlineData.
      if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              return {
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
              };
            }
          }
        }
      }

      throw new Error("No image data found in response");

    } catch (error: any) {
      console.error("Gemini Image Generation Error:", error);
      
      // Improve error message for the UI
      let message = "Failed to generate image.";
      if (error.message) {
        if (error.message.includes("429")) message = "Service is busy (Rate Limit). Please try again later.";
        else if (error.message.includes("400")) message = "The request was invalid. Try a simpler prompt.";
        else if (error.message.includes("SAFETY")) message = "Generation blocked by safety settings.";
        else message = error.message;
      }
      throw new Error(message);
    }
  }
}

export const geminiService = new GeminiService();
