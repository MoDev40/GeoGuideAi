import { GoogleGenAI } from "@google/genai";
import { AppMode, Location } from "../types";
import { SYSTEM_INSTRUCTIONS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(
    userMessage: string,
    mode: AppMode,
    isHistorical: boolean,
    location: Location | null
  ) {
    let systemInstruction = "";
    let tools: any[] = [];

    if (mode === 'route') {
      systemInstruction = SYSTEM_INSTRUCTIONS.ROUTE;
      tools = [{ googleMaps: {} }];
      userMessage = `Plan a route to: ${userMessage}. Please ensure the route is optimized for current real-time traffic conditions.`;
    } else if (mode === 'discovery') {
      systemInstruction = isHistorical 
        ? SYSTEM_INSTRUCTIONS.DISCOVERY_HISTORICAL 
        : SYSTEM_INSTRUCTIONS.DISCOVERY_REALTIME;
      tools = [{ googleSearch: {} }];
    } else {
      systemInstruction = SYSTEM_INSTRUCTIONS.EXPLORE;
      tools = [{ googleMaps: {} }];
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction,
        tools,
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.latitude,
              longitude: location.longitude
            } : undefined
          }
        }
      },
    });

    return {
      text: response.text || "I couldn't find any information for that.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  }

  async processVoiceCommand(base64Audio: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "audio/webm",
            data: base64Audio
          }
        },
        {
          text: "Analyze this voice command. If the user wants to go somewhere, return 'ROUTE: [destination]'. If they want to search for something, return 'SEARCH: [query]'. If they want to change modes (explore, route, discovery), return 'MODE: [mode]'. Otherwise, just transcribe the text. Return ONLY the command string."
        }
      ],
      config: {
        systemInstruction: "You are a voice command processor for a map app. Extract the user's intent and return a structured command. Possible commands: ROUTE: [dest], SEARCH: [query], MODE: [explore|route|discovery]. If no clear command, return the transcription."
      }
    });

    return response.text?.trim() || "";
  }
}
