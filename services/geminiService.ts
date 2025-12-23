
import { GoogleGenAI } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

class GeminiService {
  private readonly MODEL_PRO = 'gemini-3-pro-preview';
  private readonly MODEL_FLASH_GROUNDING = 'gemini-2.5-flash';
  private readonly MODEL_VEO = 'veo-3.1-fast-generate-preview';

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async getDeepResponse(prompt: string, user: UserProfile, history: ChatMessage[]) {
    const ai = this.getAI();
    const contents: any[] = history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    return ai.models.generateContent({
      model: this.MODEL_PRO,
      contents,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: `Você é o CARAMELO v3. Assistente Sênior de Saúde Mental.
        Usuário: ${user.name}, ${user.age} anos. 
        Contexto: Use TCC e empatia profunda. Nunca dê diagnósticos médicos.`
      }
    });
  }

  public async searchAndMap(query: string, lat?: number, lng?: number) {
    const ai = this.getAI();
    const tools: any[] = [{ googleSearch: {} }];
    if (lat && lng) tools.push({ googleMaps: {} });

    return ai.models.generateContent({
      model: this.MODEL_FLASH_GROUNDING,
      contents: query,
      config: {
        tools,
        toolConfig: lat ? { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } : undefined
      }
    });
  }

  public async analyzeMultimodal(text: string, base64Data: string, mimeType: string) {
    const ai = this.getAI();
    return ai.models.generateContent({
      model: this.MODEL_PRO,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text }
        ]
      }
    });
  }

  public async generateTherapeuticVideo(prompt: string) {
    const ai = this.getAI();
    let operation = await ai.models.generateVideos({
      model: this.MODEL_VEO,
      prompt: `Therapeutic meditation visual: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return operation.response?.generatedVideos?.[0]?.video?.uri;
  }
}

export const geminiService = new GeminiService();
