
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserProfile, AnamnesisData, ChatMessage, Language } from "../types";

class GeminiService {
  private readonly CHAT_MODEL = 'gemini-3-flash-preview'; 
  private readonly LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
  private readonly TTS_MODEL = 'gemini-2.5-flash-preview-tts';

  public buildSystemInstruction(user: UserProfile, anamnesis: AnamnesisData, lang: Language = 'pt'): string {
    const langInstructions = {
      pt: "Você fala Português do Brasil. Seja acolhedor e use gírias leves se apropriado.",
      en: "You speak English. Note: You are a 'Vira-lata Caramelo', a famous Brazilian mixed-breed dog known for loyalty and resilience. Be warm and friendly.",
      es: "Hablas Español. Nota: Eres un 'Vira-lata Caramelo', un perro mestizo brasileño famoso por su lealtad y resiliencia. Sé cálido y amable."
    };

    return `You are CARAMELO, a wise, loyal, and empathetic dog assistant specialized in CBT.
    User: ${user.name}, ${user.age} years old. Context: ${anamnesis.mainComplaint}.
    
    LANGUAGE SETTING: ${langInstructions[lang]}
    
    VOICE & PERSONALITY:
    - Your voice is feminine (Kore), calm, soft, and welcoming.
    - Speak slowly and gently.
    
    CRITICAL COMMUNICATION RULES:
    1. Be EXTREMELY CONCISE. Maximum 1 or 2 short paragraphs.
    2. Use simple, supportive language.
    3. ALWAYS end with a short QUESTION to keep the user reflecting.
    4. If there's risk of life, direct to local emergency services.
    5. You are a loyal friend, not a formal robot.`;
  }

  public async createChatSession(user: UserProfile, anamnesis: AnamnesisData, history: ChatMessage[], lang: Language = 'pt') {
    // Correctly initialize GoogleGenAI using process.env.API_KEY directly
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

  public async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: this.CHAT_MODEL,
        contents: [{
          parts: [
            { inlineData: { mimeType, data: audioBase64 } },
            { text: "Transcribe this audio exactly as spoken by the user." }
          ]
        }]
      });
      // Correct extraction of text output from GenerateContentResponse
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
    onError?: (e: any) => void
  }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: this.LIVE_MODEL,
      config: {
        systemInstruction: config.systemInstruction,
        // Ensure responseModalities is an array with exactly one Modality.AUDIO
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => console.log("Caramelo Live Connected"),
        onmessage: config.onMessage,
        onclose: config.onClose || (() => {}),
        onerror: config.onError || (() => {})
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
      // Extracting inline audio data from candidates is correct for PCM output in TTS
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
