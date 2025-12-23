
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, ChatMessage, Language } from "../types";

class GeminiService {
  private readonly CHAT_MODEL = 'gemini-3-pro-preview'; 
  private readonly LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';
  private readonly FLASH_MODEL = 'gemini-3-flash-preview';

  public buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData, lang: Language = 'pt'): string {
    const langInstructions = {
      pt: "Você fala Português do Brasil. Seja acolhedor e use um tom de voz calmo.",
      en: "You speak English. You are a 'Vira-lata Caramelo', a friendly Brazilian dog. Be warm and supportive.",
      es: "Hablas Español. Eres un 'Vira-lata Caramelo', um perro brasileño leal. Sé cálido y amable."
    };

    return `Você é o CARAMELO, um assistente de saúde mental (Vira-lata Caramelo) especializado em TCC.
    Usuário: ${user.name}, ${user.age} anos. Contexto: ${anamnesis.mainComplaint}.
    
    DIRETRIZES:
    - Sua voz é feminina, suave e acolhedora (Voz: Kore).
    - No chat, use markdown para clareza.
    - Na voz, seja breve (máximo 2 frases).
    - Use Grounding (Google Search) se o usuário perguntar sobre fatos, notícias ou locais de ajuda.
    
    Linguagem: ${langInstructions[lang]}`;
  }

  public async createChatSession(user: UserProfile, anamnesis: AnamnesisData, history: ChatMessage[], lang: Language = 'pt') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    return ai.chats.create({
      model: this.CHAT_MODEL,
      config: {
        systemInstruction: this.buildSystemInstruction(user, anamnesis, lang),
        tools: [{ googleSearch: {} }],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ]
      },
      history: formattedHistory
    });
  }

  public async transcribeAudio(audioBase64: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: this.FLASH_MODEL,
        contents: [{
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
            { text: "Transcreva este áudio exatamente como foi dito, sem comentários adicionais." }
          ]
        }]
      });
      return response.text || "";
    } catch (e) {
      console.error("Transcription error:", e);
      return "";
    }
  }

  public connectLive(config: {
    systemInstruction: string,
    onMessage: (message: any) => void,
    onClose?: (e: any) => void,
    onerror?: (e: any) => void
  }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: this.LIVE_MODEL,
      config: {
        systemInstruction: config.systemInstruction,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => console.log("Live Connect"),
        onmessage: config.onMessage,
        onclose: config.onClose || (() => {}),
        onerror: config.onerror || (() => {})
      }
    });
  }

  public async generateSpeech(text: string, lang: Language = 'pt'): Promise<ArrayBuffer | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: this.TTS_MODEL,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes.buffer;
      }
    } catch (e) {
      console.error("TTS error:", e);
    }
    return null;
  }
}

export const geminiService = new GeminiService();
