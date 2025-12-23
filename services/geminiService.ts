
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { UserProfile, AnamnesisData, ChatMessage, Language } from "../types";

class GeminiService {
  private readonly PRO_MODEL = 'gemini-3-pro-preview';
  private readonly FLASH_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-3-pro-image-preview';
  private readonly EDIT_MODEL = 'gemini-2.5-flash-image';
  private readonly VEO_MODEL = 'veo-3.1-fast-generate-preview';
  private readonly LITE_MODEL = 'gemini-2.5-flash-lite-latest';
  private readonly LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  public async getDeepResponse(prompt: string, user: UserProfile, history: any[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.PRO_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: `Analise profundamente o estado emocional de ${user.name}. Use TCC avançada.`
      }
    });
  }

  public async generateTherapeuticImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", ratio: string = "1:1") {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.IMAGE_MODEL,
      contents: { parts: [{ text: `High-quality therapeutic image, relaxing, 8k: ${prompt}` }] },
      config: { imageConfig: { imageSize: size, aspectRatio: ratio } }
    });
  }

  public async editImage(base64: string, prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.EDIT_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });
  }

  public async generateMeditationVideo(prompt: string, ratio: '16:9' | '9:16' = '16:9') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: this.VEO_MODEL,
      prompt: `Peaceful meditation background, slow motion, loopable: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: ratio }
    });
    return operation;
  }

  public async findLocalHelp(lat: number, lng: number) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Onde estão os hospitais e clínicas de psicologia mais próximos com atendimento de emergência?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      }
    });
  }

  public async searchHealthInfo(query: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: this.FLASH_MODEL,
      contents: query,
      config: { tools: [{ googleSearch: {} }] }
    });
  }

  // Métodos de áudio e Live mantidos conforme estrutura anterior, mas usando as novas constantes de modelo
  public buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData, lang: Language = 'pt'): string {
    return `Você é o CARAMELO, IA de saúde mental. Usuário: ${user.name}. Contexto: ${anamnesis.mainComplaint}. Use empatia e ciência.`;
  }

  public connectLive(config: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: this.LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      },
      callbacks: config
    });
  }
}

export const geminiService = new GeminiService();
