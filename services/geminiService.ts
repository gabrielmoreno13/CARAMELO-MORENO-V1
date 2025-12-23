import { GoogleGenAI, Chat, Modality } from "@google/genai";
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
      Você é o CARAMELO, uma Inteligência Artificial de suporte emocional, calorosa, empática e leal.
      Seu nome vem do "vira-lata caramelo", símbolo brasileiro de amizade e resiliência.
      
      IDIOMA: 
      Português do Brasil (PT-BR).

      DIRETRIZES DE ÁUDIO E PROSÓDIA (CRUCIAL):
      1. **Velocidade:** Fale devagar. Use um ritmo pausado e tranquilo.
      2. **Tom:** Use um tom suave, doce e acolhedor. Evite soar robótico ou professoral.
      3. **Respiração:** Use pontuação (...) para simular pausas de reflexão.
      4. **Extensão:** Seja conciso. Respostas curtas (2 a 3 frases) são ideais para chat por voz.
      5. **Empatia:** Valide os sentimentos do usuário ("Sinto muito que esteja passando por isso", "Faz sentido você se sentir assim") antes de sugerir soluções.

      CONTEXTO DO USUÁRIO:
      - Nome: ${user.name.split(' ')[0]}
      - Idade: ${user.age}
      - Humor Atual: ${anamnesis.mood}
      - Queixa Principal: "${anamnesis.mainComplaint}"
      - Objetivo: "${anamnesis.lifeGoals}"

      SEGURANÇA:
      Se detectar risco iminente de vida (suicídio/autolesão), mude para um tom firme mas acolhedor e indique o CVV (188) ou emergência (192).
      Nunca prescreva medicamentos.
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
          temperature: 0.6, 
          topK: 40,
          thinkingConfig: { thinkingBudget: 0 }, 
          tools: [{ googleSearch: {} }] // Grounding ativado para informações atuais
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
          .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title || "Fonte", uri: chunk.web.uri } : null)
          .filter((source: any) => source !== null) as GroundingSource[];
      }

      return {
        text: result.text || "Desculpe, tive um momento de silêncio. Pode repetir?",
        groundingSources
      };

    } catch (error: any) {
      console.error("Error sending message to Gemini:", error);
      
      // Tratamento amigável de erros comuns
      if (error.message?.includes('429')) return { text: "Estou recebendo muitas mensagens agora. Pode esperar um minutinho?" };
      if (error.message?.includes('safety')) return { text: "Não consigo processar essa mensagem devido aos meus filtros de segurança. Podemos falar sobre outra coisa?" };
      
      return { text: "Tive um pequeno problema técnico. Tente novamente." };
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
            { text: `
              ATENÇÃO: Você é um sistema ASR (Automatic Speech Recognition) profissional.
              CONTEXTO: O usuário está falando com um assistente de saúde mental.
              TAREFA: Transcreva o áudio em Português do Brasil.
              REGRAS:
              1. Transcrição LITERAL e EXATA.
              2. Se o áudio for silêncio ou ruído, retorne string vazia.
              3. Não adicione pontuação excessiva se não houver pausas.
              4. Não invente palavras para preencher lacunas.
            ` }
          ]
        },
        config: {
            temperature: 0, // Temperatura 0 para eliminar alucinações
            maxOutputTokens: 1000
        }
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
      // Limita o texto para evitar estourar cotas de TTS em mensagens muito longas
      const safeText = text.length > 500 ? text.substring(0, 500) + "..." : text;

      const response = await this.ai.models.generateContent({
        model: this.TTS_MODEL,
        contents: { parts: [{ text: safeText }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' } // Voz feminina, calma
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