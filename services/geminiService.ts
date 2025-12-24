
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

class GeminiService {
  private readonly MODEL_PRO = 'gemini-3-pro-preview';
  private readonly MODEL_FLASH = 'gemini-3-flash-preview';
  private readonly MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';

  public static getSystemInstruction(userName: string, isAudio: boolean = false) {
    const base = `Você é o CARAMELO, um vira-lata brasileiro leal e assistente de auto-cuidado para ${userName}.`;
    const audioContext = isAudio ? `
      MODO VOZ ATIVADO:
      1. Sua voz é de uma mulher leve, tranquila e serena.
      2. Fale com pausas naturais, de forma calma, como uma terapeuta experiente.
      3. Seja breve, pois conversas por áudio longas cansam o usuário.
      4. Se o usuário estiver ansioso, guie-o em uma respiração lenta antes de continuar.` : "";

    return `${base}
${audioContext}

DIRETRIZES:
- Máximo de 3 frases.
- Tom empático e acolhedor (🐶🧡).
- Nunca use jargão médico.
- Termine com uma pergunta doce.`;
  }

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async getResponseStream(prompt: string, user: UserProfile, history: ChatMessage[], mode: 'chat' | 'thinking' | 'search' = 'chat') {
    const ai = this.getAI();
    const modelToUse = mode === 'thinking' ? this.MODEL_PRO : this.MODEL_FLASH;
    
    const config: any = {
      systemInstruction: GeminiService.getSystemInstruction(user.name),
      temperature: 0.6,
      maxOutputTokens: 250,
    };

    if (mode === 'thinking') {
      config.thinkingConfig = { thinkingBudget: 8000 };
      config.maxOutputTokens = 1000;
    } else if (mode === 'search') {
      config.tools = [{ googleSearch: {} }];
    }

    const contents: any[] = history.slice(-4).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    return ai.models.generateContentStream({
      model: modelToUse,
      contents,
      config
    });
  }

  public async connectLiveAudio(userName: string, callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: this.MODEL_LIVE,
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
        },
        systemInstruction: GeminiService.getSystemInstruction(userName, true)
      }
    });
  }
}

export const geminiService = new GeminiService();
