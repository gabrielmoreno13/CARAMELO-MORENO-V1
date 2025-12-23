

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

export type Language = 'pt' | 'en' | 'es';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  cpf: string;
  company: string;
  phone: string;
  age: number;
  avatarHue?: number;
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
  videoUrl?: string;
  audioUrl?: string;
  groundingSources?: GroundingSource[];
  timestamp: Date;
  isDeepAnalysis?: boolean;
}

// Added MoodEntry interface for health tracking tools
export interface MoodEntry {
  date: string;
  level: number;
}

// Added GratitudeEntry interface for health tracking tools
export interface GratitudeEntry {
  id: string;
  date: string;
  text: string;
}

// Added CbtWinEntry interface for health tracking tools
export interface CbtWinEntry {
  id: string;
  date: string;
  negativeThought: string;
  distortion: string;
  reframe: string;
}

export interface AnamnesisData {
  sleepQuality: number;
  anxietyLevel: number;
  mood: string;
  mainComplaint: string;
  medication: string;
  physicalActivity: string;
  appetite: string;
  previousTherapy: boolean;
  familyHistory: string;
  supportNetwork: string;
  childhoodBrief: string;
  lifeGoals: string;
  // Use specific entry types instead of any[] to resolve compilation errors
  moodHistory?: MoodEntry[];
  gratitudeLog?: GratitudeEntry[];
  cbtWins?: CbtWinEntry[];
}

export interface AppState {
  view: AppView;
  user: UserProfile | null;
  anamnesis: AnamnesisData | null;
  language: Language;
}
