export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ANAMNESIS = 'ANAMNESIS',
  CHAT = 'CHAT',
  TOOLS = 'TOOLS',
  OUR_APPROACH = 'OUR_APPROACH',
  FOR_BUSINESS = 'FOR_BUSINESS',
  PROFESSIONAL_HELP = 'PROFESSIONAL_HELP',
  ABOUT_US = 'ABOUT_US'
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  cpf: string;
  company: string;
  phone: string;
  age: number;
  avatarHue?: number; // Para personalização do Caramelo (0-360)
}

export interface MoodEntry {
  date: string; // ISO Date
  level: number; // 1-5 (1: Péssimo, 5: Ótimo)
  note?: string;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  text: string;
}

export interface CbtWinEntry {
  id: string;
  date: string;
  negativeThought: string;
  distortion: string;
  reframe: string;
}

export interface DailyIntention {
  date: string; // YYYY-MM-DD
  text: string;
}

export interface AnamnesisData {
  // Estado Atual
  sleepQuality: number;
  anxietyLevel: number;
  mood: string;
  mainComplaint: string;

  // Aspectos Biológicos/Rotina
  medication: string;
  physicalActivity: string;
  appetite: string;

  // Histórico e Contexto Social
  previousTherapy: boolean;
  familyHistory: string;
  supportNetwork: string;
  
  // Aspectos Psicanalíticos/Profundos
  childhoodBrief: string;
  lifeGoals: string;

  // NOVOS CAMPOS (WOEBOT FEATURES)
  moodHistory?: MoodEntry[];
  gratitudeLog?: GratitudeEntry[];
  cbtWins?: CbtWinEntry[];
  dailyIntentions?: DailyIntention[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  audioUrl?: string;
  groundingSources?: GroundingSource[];
  timestamp: Date;
}

export interface AppState {
  view: AppView;
  user: UserProfile | null;
  anamnesis: AnamnesisData | null;
}