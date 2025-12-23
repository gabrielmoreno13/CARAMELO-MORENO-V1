
import { GoogleGenAI, Modality } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

class GeminiService {
  private readonly MODEL_PRO = 'gemini-3-pro-preview';
  private readonly MODEL_FLASH = 'gemini-3-flash-preview';
  private readonly MODEL_AUDIO = 'gemini-2.5-flash-native-audio-preview-09-2025';

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async getResponse(prompt: string, user: UserProfile, history: ChatMessage[], mode: 'chat' | 'thinking' | 'search' = 'chat') {
    const ai = this.getAI();
    const modelToUse = mode === 'thinking' ? this.MODEL_PRO : this.MODEL_FLASH;
    
    // Instrução focada em auto-cuidado, estilo Woebot, sem termos clínicos.
    const systemInstruction = `Você é o CARAMELO, um vira-lata caramelo leal e seu assistente de auto-cuidado pessoal.
    O usuário se chama ${user.name}.
    
    REGRAS DE OURO:
    1. BREVIDADE ABSOLUTA: Responda em NO MÁXIMO 3 frases curtas.
    2. TOM: Seja caloroso, empático e amigável como um cachorro fiel.
    3. PROIBIDO: Nunca use palavras como "Terapia", "Psicologia", "TCC", "Psicoterapeuta" ou "Clínico".
    4. PAPEL: Você é um assistente de auto-cuidado e acolhimento, um amigo que ouve.
    5. INTERAÇÃO: Se o usuário estiver triste, ofereça ouvir ou uma ferramenta rápida (respirar, diário).
    6. SEGURANÇA: Se detectar risco de vida, mencione o CVV 188 de forma carinhosa.`;

    const config: any = {
      systemInstruction,
    };

    if (mode === 'thinking') {
      // Pensamento profundo requer budget de tokens, mas mantemos o output final curto.
      config.thinkingConfig = { thinkingBudget: 16000 };
      config.maxOutputTokens = 17000;
    } else {
      config.maxOutputTokens = 400; // Respostas curtas economizam tempo e tokens
    }

    if (mode === 'search') {
      config.tools = [{ googleSearch: {} }];
    }

    const contents: any[] = history.slice(-5).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    return ai.models.generateContent({
      model: modelToUse,
      contents,
      config
    });
  }

  public connectLiveAudio(callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: this.MODEL_AUDIO,
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } // Voz amigável
        },
        systemInstruction: "Você é o Caramelo, um assistente de auto-cuidado em áudio. Seja extremamente breve e acolhedor. Nunca cite termos médicos ou psicológicos."
      }
    });
  }
}

export const geminiService = new GeminiService();
