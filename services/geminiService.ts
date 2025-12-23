
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, GroundingSource, ChatMessage } from "../types";

class GeminiService {
  private chatSession: any = null;
  private systemInstruction: string = '';
  
  private readonly CHAT_MODEL = 'gemini-3-flash-preview'; 
  private readonly TRANSCRIPTION_MODEL = 'gemini-3-flash-preview';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  private getApiKey(): string {
    // Busca a chave de forma dinâmica para evitar injeção estática agressiva do bundler
    const key = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
    if (!key) {
      console.warn("⚠️ [Caramelo] API_KEY não encontrada no ambiente.");
    }
    return key;
  }

  private buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData): string {
    return `Você é o CARAMELO, uma IA de suporte emocional baseada em TCC.
    Usuário: ${user.name}, ${user.age} anos.
    Contexto: ${anamnesis.mainComplaint}.
    Objetivo: ${anamnesis.lifeGoals}.
    
    Diretrizes:
    1. Valide sentimentos.
    2. Seja empático e leal.
    3. Use o nome do usuário.
    4. Se houver risco de vida, direcione para o CVV (188).
    5. Cite fontes de busca se usar ferramentas de pesquisa.`;
  }

  public async initializeChat(user: UserProfile, anamnesis: AnamnesisData, previousHistory: ChatMessage[] = []) {
    this.systemInstruction = this.buildSystemInstruction(user, anamnesis);
    
    const history = previousHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      // Instanciação on-demand conforme diretrizes de segurança e modelos Gemini 3/2.5
      const ai = new GoogleGenAI({ apiKey: this.getApiKey() });
      
      this.chatSession = ai.chats.create({
        model: this.CHAT_MODEL,
        config: {
          systemInstruction: this.systemInstruction,
          tools: [{ googleSearch: {} }],
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
          ]
        },
        history: history
      });
    } catch (e) {
      console.error("Erro ao inicializar chat Gemini:", e);
    }
  }

  public async sendMessage(text: string, imageBase64?: string): Promise<{ text: string, groundingSources?: GroundingSource[] }> {
    if (!this.chatSession) {
      // Tenta re-inicializar se a sessão estiver nula
      throw new Error("Sessão de chat não disponível. Verifique a configuração da API.");
    }

    let message: any = text;
    if (imageBase64) {
      message = {
        parts: [
          { text },
          { inlineData: { mimeType: 'image/png', data: imageBase64 } }
        ]
      };
    }

    const response = await this.chatSession.sendMessage({ message });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let groundingSources: GroundingSource[] = [];
    
    if (groundingChunks) {
      groundingSources = groundingChunks
        .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title, uri: chunk.web.uri } : null)
        .filter((s: any) => s !== null);
    }

    return {
      text: response.text || "...",
      groundingSources
    };
  }

  public async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: this.getApiKey() });
    const response = await ai.models.generateContent({
      model: this.TRANSCRIPTION_MODEL,
      contents: [{
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: "Transcreva este áudio exatamente como falado." }
        ]
      }]
    });
    return response.text || "";
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer | null> {
    const ai = new GoogleGenAI({ apiKey: this.getApiKey() });
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
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  }
}

export const geminiService = new GeminiService();
