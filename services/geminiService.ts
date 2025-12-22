import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { UserProfile, AnamnesisData, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  
  // MUDANÇA: Usando o modelo FLASH para máxima velocidade de resposta (requisito do usuário)
  private readonly CHAT_MODEL = 'gemini-3-flash-preview'; 
  private readonly TRANSCRIPTION_MODEL = 'gemini-3-flash-preview';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public initializeChat(user: UserProfile, anamnesis: AnamnesisData) {
    const systemInstruction = `
      PERSONA:
      Você é o CARAMELO, uma Inteligência Artificial de suporte emocional.
      Sua prioridade é a rapidez, a empatia e o profissionalismo.
      Você NÃO é médico, NÃO é psicólogo.
      
      ESTILO DE RESPOSTA (CRUCIAL):
      1. SEJA BREVE. Respostas longas cansam no celular. Use no máximo 2 ou 3 frases curtas por turno, a menos que esteja explicando algo complexo.
      2. TOM PROFISSIONAL: Use linguagem culta, correta, sem gírias, sem emojis infantis, mas com calor humano.
      3. EMPATIA PRÁTICA: Valide o sentimento do usuário e sugira um pequeno passo prático ou faça uma pergunta reflexiva.
      
      CONTEXTO DO PACIENTE:
      - Nome: ${user.name} (${user.age} anos).
      - Queixa: "${anamnesis.mainComplaint}"
      - Humor: ${anamnesis.mood} | Ansiedade: ${anamnesis.anxietyLevel}/10.
      - Medicação: "${anamnesis.medication}".
      - Histórico: "${anamnesis.childhoodBrief}".

      SEGURANÇA (GATILHOS DE EMERGÊNCIA):
      Se houver menção a suicídio, morte ou autolesão, sua resposta DEVE SER EXATAMENTE:
      "Identifico uma situação de risco. Como IA, não posso garantir sua segurança. Por favor, ligue para o CVV (188) ou vá a um hospital imediatamente."

      ABORDAGEM:
      Aja como o Woebot ou Wysa: faça perguntas curtas para guiar o usuário a entender seus próprios sentimentos. Não dê "palestras".
    `;

    this.chatSession = this.ai.chats.create({
      model: this.CHAT_MODEL,
      config: {
        systemInstruction: systemInstruction.trim(),
        temperature: 0.5, 
        // Desativando thinkingBudget para garantir resposta imediata
        thinkingConfig: { thinkingBudget: 0 }, 
        tools: [{ googleSearch: {} }]
      },
    });
  }

  public async sendMessage(text: string, imageBase64?: string): Promise<{ text: string, groundingSources?: GroundingSource[] }> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      let result;
      
      // Enviamos o texto diretamente, já que o contexto é tratado pela instrução do sistema e a saudação é local.
      if (imageBase64) {
        result = await this.chatSession.sendMessage({
          message: [
            { text },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        });
      } else {
        result = await this.chatSession.sendMessage({ message: text });
      }

      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let groundingSources: GroundingSource[] = [];
      
      if (groundingChunks) {
        groundingSources = groundingChunks
          .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title, uri: chunk.web.uri } : null)
          .filter((source: any) => source !== null) as GroundingSource[];
      }

      return {
        text: result.text || "Desculpe, não entendi. Pode reformular?",
        groundingSources
      };

    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return { text: "Estou com dificuldade de conexão no momento. Tente novamente em instantes." };
    }
  }

  public async transcribeAudio(audioBase64: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.TRANSCRIPTION_MODEL,
        contents: {
          parts: [
            { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
            { text: "Transcreva o áudio." }
          ]
        }
      });
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Transcription error:", error);
      return "";
    }
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.TTS_MODEL,
        contents: { parts: [{ text }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
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