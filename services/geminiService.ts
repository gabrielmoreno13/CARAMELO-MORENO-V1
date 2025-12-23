import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, GroundingSource, ChatMessage } from "../types";

// Tenta obter a chave de forma estática para garantir compatibilidade com Netlify
const GEMINI_API_KEY = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

// Inicialização segura
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

class GeminiService {
  private chatSession: any = null;
  private systemInstruction: string = '';
  
  private readonly CHAT_MODEL = 'gemini-3-flash-preview'; 
  private readonly TRANSCRIPTION_MODEL = 'gemini-3-flash-preview';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  private checkConfig() {
    if (!GEMINI_API_KEY) {
      console.error("❌ [Caramelo] Gemini API_KEY não encontrada. Verifique as variáveis de ambiente.");
    }
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
    this.checkConfig();
    this.systemInstruction = this.buildSystemInstruction(user, anamnesis);
    
    const history = previousHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      this.chatSession = ai.models.generateContent({
        model: this.CHAT_MODEL,
        config: {
          systemInstruction: this.systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });
      
      // O SDK mudou ligeiramente, para chats contínuos usamos chats.create
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
    if (!this.chatSession) throw new Error("Chat não inicializado ou API Key ausente.");

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
