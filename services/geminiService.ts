import { GoogleGenAI, Chat, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, GroundingSource, ChatMessage } from "../types";

// Função robusta para capturar a API Key em diferentes ambientes
const getApiKey = () => {
  let key = '';
  try {
    if (typeof process !== 'undefined' && process.env) {
      key = process.env.VITE_API_KEY || 
            process.env.REACT_APP_API_KEY || 
            process.env.NEXT_PUBLIC_API_KEY || 
            process.env.API_KEY || '';
    }
  } catch (e) {}
  if (!key) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        key = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || '';
      }
    } catch (e) {}
  }
  return key;
};

const API_KEY = getApiKey();

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private systemInstructionCache: string = '';
  
  // Utilizando Gemini 3 Flash para o Chat (Inteligente e Rápido)
  private readonly CHAT_MODEL = 'gemini-3-flash-preview'; 
  // Alterado para 2.5 Flash Latest para maior precisão em ASR (Reconhecimento de Fala)
  private readonly TRANSCRIPTION_MODEL = 'gemini-2.5-flash-latest';
  // Modelo específico para TTS
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  constructor() {
    if (!API_KEY) {
      console.warn("⚠️ AVISO: API_KEY do Gemini não encontrada.");
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY || 'dummy-key' });
  }

  public get hasApiKey(): boolean {
    return !!API_KEY;
  }

  private buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData): string {
    return `
      PERSONA:
      Você é o CARAMELO, uma Inteligência Artificial de suporte emocional baseada em TCC (Terapia Cognitivo-Comportamental).
      Sua personalidade é: Calorosa, Leal (como um cão caramelo), Empática, Não-julgadora e Otimista realista.
      
      DIRETRIZES DE INTERAÇÃO:
      1. **Validação:** Sempre comece validando o sentimento. "Entendo que isso doa...", "Faz sentido sentir-se assim...".
      2. **Foco no Usuário:** Use o nome ${user.name.split(' ')[0]} ocasionalmente para criar vínculo.
      3. **Perguntas Socráticas:** Em vez de dar conselhos diretos, faça perguntas que ajudem o usuário a chegar à conclusão.
      4. **Segurança:** Se identificar risco de suicídio ou autolesão, seja diretivo: "Estou preocupado com você. Por favor, precisamos de ajuda humana agora" e forneça CVV (188) ou SAMU (192).

      CONTEXTO DO USUÁRIO:
      - Idade: ${user.age}
      - Humor Recente: ${anamnesis.mood}
      - Queixa: "${anamnesis.mainComplaint}"
      - Objetivo: "${anamnesis.lifeGoals}"

      FORMATO DE RESPOSTA:
      - Use Markdown para estruturar (negrito para ênfase).
      - Mantenha parágrafos curtos.
      - Se usar Grounding (Google Search), cite a fonte naturalmente.
    `;
  }

  public initializeChat(user: UserProfile, anamnesis: AnamnesisData, previousHistory: ChatMessage[] = []) {
    if (!API_KEY) return;

    this.systemInstructionCache = this.buildSystemInstruction(user, anamnesis);

    // Mapeia histórico do app para o formato do Gemini SDK
    const history = previousHistory.map(msg => {
      const parts: any[] = [{ text: msg.text }];
      if (msg.image) {
        // Remove cabeçalho data:image se existir para o envio limpo
        const cleanBase64 = msg.image.includes('base64,') ? msg.image.split(',')[1] : msg.image;
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      return {
        role: msg.role,
        parts: parts
      };
    });

    try {
      this.chatSession = this.ai.chats.create({
        model: this.CHAT_MODEL,
        history: history,
        config: {
          systemInstruction: this.systemInstructionCache,
          temperature: 0.7, // Um pouco mais criativo para empatia
          topK: 40,
          thinkingConfig: { thinkingBudget: 0 }, 
          tools: [{ googleSearch: {} }], // Grounding ativado
          // CONFIGURAÇÃO DE SEGURANÇA: Permite discussões sobre saúde mental sem bloqueios excessivos
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ]
        },
      });
    } catch (e) {
      console.error("Erro ao inicializar chat:", e);
    }
  }

  public async sendMessage(text: string, imageBase64?: string): Promise<{ text: string, groundingSources?: GroundingSource[] }> {
    if (!API_KEY) return { text: "Erro: API Key não configurada." };
    
    // Auto-recuperação: Se a sessão for perdida (refresh), tenta recriar (sem histórico profundo, mas funcional)
    if (!this.chatSession) {
        console.warn("Sessão perdida. Reiniciando chat...");
        try {
             this.chatSession = this.ai.chats.create({
                model: this.CHAT_MODEL,
                config: { systemInstruction: this.systemInstructionCache || "Você é um assistente útil." }
             });
        } catch (e) {
            return { text: "Erro de conexão. Por favor, recarregue a página." };
        }
    }

    try {
      let result;
      if (imageBase64) {
        const cleanImage = imageBase64.includes('base64,') ? imageBase64.split(',')[1] : imageBase64;
        result = await this.chatSession.sendMessage({
          message: {
              parts: [
                  { text },
                  { inlineData: { mimeType: 'image/jpeg', data: cleanImage } }
              ]
          }
        });
      } else {
        result = await this.chatSession.sendMessage({ message: text });
      }

      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let groundingSources: GroundingSource[] = [];
      
      if (groundingChunks) {
        groundingSources = groundingChunks
          .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title || "Fonte Externa", uri: chunk.web.uri } : null)
          .filter((source: any) => source !== null) as GroundingSource[];
      }

      return {
        text: result.text || "Desculpe, tive um momento de silêncio. Pode repetir?",
        groundingSources
      };

    } catch (error: any) {
      console.error("Error sending message to Gemini:", error);
      
      if (error.message?.includes('429')) return { text: "Estou recebendo muitas mensagens agora. Respire fundo e tente em 1 minuto." };
      if (error.message?.includes('safety')) return { text: "Sinto muito, mas não consigo processar essa mensagem devido aos meus protocolos de segurança. Podemos tentar refrasear ou falar sobre outra coisa?" };
      
      return { text: "Tive um pequeno problema técnico de conexão. Tente enviar novamente." };
    }
  }

  public async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    if (!API_KEY) return "";
    try {
      const response = await this.ai.models.generateContent({
        model: this.TRANSCRIPTION_MODEL,
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType, data: audioBase64 } },
            { text: "Transcreva este áudio em Português do Brasil. Se não houver fala clara, retorne vazio." }
          ]
        },
        config: { temperature: 0 }
      });
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Transcription error:", error);
      return "";
    }
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer | null> {
    if (!API_KEY) return null;
    try {
      const safeText = text.length > 800 ? text.substring(0, 800) + "..." : text;

      const response = await this.ai.models.generateContent({
        model: this.TTS_MODEL,
        contents: { parts: [{ text: safeText }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' } // Voz mais suave e terapêutica
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    } catch (error) {
      console.error("TTS error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();