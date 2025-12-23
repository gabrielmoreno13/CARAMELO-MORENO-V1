
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { UserProfile, AnamnesisData, ChatMessage, Language } from "../types";

class GeminiService {
  private readonly MODEL_PRO = 'gemini-3-pro-preview';
  private readonly MODEL_FLASH = 'gemini-3-flash-preview';
  private readonly MODEL_LITE = 'gemini-2.5-flash-lite-latest';
  private readonly MODEL_IMAGE = 'gemini-3-pro-image-preview';
  private readonly MODEL_VEO = 'veo-3.1-fast-generate-preview';
  private readonly MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private readonly MODEL_TTS = 'gemini-2.5-flash-preview-tts';

  // --- CHAT COM PENSAMENTO PROFUNDO (THINKING) ---
  public async getDeepResponse(prompt: string, user: UserProfile, history: any[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.MODEL_PRO,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: `Você é o CARAMELO, assistente de saúde mental de ${user.name}. Analise com profundidade psicológica.`
      }
    });
  }

  // --- BUSCA E MAPAS (GROUNDING) ---
  public async searchHelp(query: string, lat?: number, lng?: number) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const tools: any[] = [{ googleSearch: {} }];
    if (lat && lng) tools.push({ googleMaps: {} });

    return ai.models.generateContent({
      model: this.MODEL_FLASH,
      contents: query,
      config: { 
        tools,
        toolConfig: lat ? { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } : undefined
      },
    });
  }

  // --- GERAÇÃO DE IMAGENS PRO ---
  public async generateArt(prompt: string, size: "1K"|"2K"|"4K", ratio: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.MODEL_IMAGE,
      contents: { parts: [{ text: `Therapeutic art: ${prompt}` }] },
      config: { imageConfig: { imageSize: size, aspectRatio: ratio } }
    });
  }

  // --- GERAÇÃO DE VÍDEO VEO ---
  public async generateMeditationVideo(prompt: string, imageBase64?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const payload: any = {
      model: this.MODEL_VEO,
      prompt: `Peaceful ambient meditation video: ${prompt}`,
      config: { resolution: '1080p', aspectRatio: '16:9' }
    };
    if (imageBase64) payload.image = { imageBytes: imageBase64, mimeType: 'image/png' };
    
    let operation = await ai.models.generateVideos(payload);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return operation.response?.generatedVideos?.[0]?.video?.uri;
  }

  // --- LIVE API (NATIVE AUDIO) ---
  public async connectLive(callbacks: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: this.MODEL_LIVE,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
      },
      callbacks
    });
  }

  // --- TRANSCRIÇÃO ---
  public async transcribe(base64Audio: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: this.MODEL_FLASH,
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/mp3' } },
          { text: "Transcreva este desabafo exatamente como dito." }
        ]
      }
    });
    return response.text;
  }
}

export const geminiService = new GeminiService();
