
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, ChatMessage, Language } from "../types";

class GeminiService {
  // Modelos atualizados conforme diretrizes
  private readonly CHAT_MODEL = 'gemini-3-pro-preview'; 
  private readonly LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';
  private readonly FLASH_MODEL = 'gemini-3-flash-preview';

  public buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData, lang: Language = 'pt'): string {
    const langInstructions = {
      pt: "Você fala Português do Brasil de forma natural e acolhedora. Use um tom de voz calmo e empático.",
      en: "You speak English. Note: You are a 'Vira-lata Caramelo', a famous Brazilian mixed-breed dog known for loyalty. Be warm, friendly, and use a soothing voice.",
      es: "Hablas Español. Eres un 'Vira-lata Caramelo', un perro brasileño leal y resiliente. Sé cálido, amable y usa una voz tranquilizadora."
    };

    return `Você é o CARAMELO, um assistente de saúde mental (Vira-lata Caramelo) especializado em Terapia Cognitivo-Comportamental (TCC).
    
    USUÁRIO: ${user.name}, ${user.age} anos. 
    QUEIXA PRINCIPAL: ${anamnesis.mainComplaint}.
    HUMOR ATUAL: ${anamnesis.mood}.

    PERSONALIDADE:
    - Você é extremamente leal, ouvinte atento e nunca julga.
    - Seu tom é calmo, feminino (Voz Kore), pausado e acolhedor.
    - Você não substitui médicos, mas oferece acolhimento e técnicas de TCC (respiração, reestruturação cognitiva).

    REGRAS DE CONVERSAÇÃO (MODO VOZ):
    - Seja BREVE. Responda com no máximo 2 ou 3 frases curtas.
    - Deixe o usuário falar. Se ele parar por um momento, espere pacientemente.
    - Após o usuário falar, faça uma pequena pausa mental antes de responder para parecer uma conversa real.
    - Se o usuário estiver em crise, use técnicas de aterramento (5-4-3-2-1) imediatamente.
    
    IDIOMA: ${langInstructions[lang]}`;
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
        tools: [{ googleSearch: {} }], // Grounding para informações atualizadas
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ]
      },
      history: formattedHistory
    });
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
        onopen: () => console.log("Caramelo Live Connected"),
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
