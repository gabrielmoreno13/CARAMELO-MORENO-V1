export enum AppView {
  LANDING = 'LANDING',
  REGISTER = 'REGISTER',
  ANAMNESIS = 'ANAMNESIS',
  CHAT = 'CHAT',
  // Novas Páginas Institucionais
  OUR_APPROACH = 'OUR_APPROACH',
  FOR_BUSINESS = 'FOR_BUSINESS',
  PROFESSIONAL_HELP = 'PROFESSIONAL_HELP',
  ABOUT_US = 'ABOUT_US'
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  age: number;
}

export interface AnamnesisData {
  // Estado Atual
  sleepQuality: number; // 1-10
  anxietyLevel: number; // 1-10
  mood: string; // Descritivo
  mainComplaint: string;

  // Aspectos Biológicos/Rotina
  medication: string;
  physicalActivity: string; // Sedentário, Moderado, Ativo
  appetite: string; // Aumentado, Diminuído, Normal

  // Histórico e Contexto Social
  previousTherapy: boolean;
  familyHistory: string; // Histórico de doenças mentais na família
  supportNetwork: string; // Quem são as pessoas de apoio
  
  // Aspectos Psicanalíticos/Profundos
  childhoodBrief: string; // Breve relato marcante da infância
  lifeGoals: string; // Objetivos de vida ou o que espera do tratamento
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 image
  audioUrl?: string; // Blob URL for TTS audio
  groundingSources?: GroundingSource[];
  timestamp: Date;
}

export interface AppState {
  view: AppView;
  user: UserProfile | null;
  anamnesis: AnamnesisData | null;
}