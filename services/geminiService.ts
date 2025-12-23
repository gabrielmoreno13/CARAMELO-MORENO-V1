
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
    
    const systemInstruction = `Você é o CARAMELO, um vira-lata caramelo leal e um assistente de auto-cuidado. 
    Usuário: ${user.name}. 
    REGRAS CRÍTICAS:
    1. Seja breve e direto. Máximo de 3 frases por resposta.
    2. NUNCA mencione termos como "TCC", "Terapia", "Psicologia" ou "Psicólogo".
    3. Use uma linguagem simples, acolhedora e amigável, como um amigo fiel.
    4. Se o usuário estiver em crise grave, sugira o CVV 188 de forma sutil.
    5. Foco em auto-cuidado e bem-estar prático.`;

    // Fix: Updated configuration to comply with @google/genai guidelines for thinkingBudget and maxOutputTokens
    const config: any = {
      systemInstruction,
    };

    if (mode === 'thinking') {
      // The effective token limit for the response is `maxOutputTokens` minus the `thinkingBudget`.
      // We set a total limit of 17000 to leave 1000 tokens for the final response after 16000 thinking tokens.
      config.thinkingConfig = { thinkingBudget: 16000 };
      config.maxOutputTokens = 17000;
    } else {
      // For standard chat, we disable thinking to minimize latency and provide a standard output limit.
      config.thinkingConfig = { thinkingBudget: 0 };
      config.maxOutputTokens = 500;
    }

    if (mode === 'search') {
      config.tools = [{ googleSearch: {} }];
    }

    const contents: any[] = history.slice(-6).map(m => ({
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
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
        },
        systemInstruction: "Você é o Caramelo, um assistente de auto-cuidado em áudio. Seja breve, caloroso e use linguagem simples. Nunca cite terapia ou termos clínicos."
      }
    });
  }
}

export const geminiService = new GeminiService();
