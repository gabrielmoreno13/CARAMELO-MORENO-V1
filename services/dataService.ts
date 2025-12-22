import { supabase } from './supabaseClient';
import { UserProfile, AnamnesisData, ChatMessage } from '../types';

export const dataService = {
  // --- PERFIL ---
  async saveProfile(user: UserProfile) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        company: user.company,
        phone: user.phone,
        age: user.age
      });
    
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  },

  // --- ANAMNESE ---
  async saveAnamnesis(userId: string, data: AnamnesisData) {
    const { error } = await supabase
      .from('anamnesis')
      .upsert({
        user_id: userId,
        data: data // Assumindo que o campo 'data' é um JSONB
      });
    
    if (error) throw error;
  },

  async getAnamnesis(userId: string): Promise<AnamnesisData | null> {
    const { data, error } = await supabase
      .from('anamnesis')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.data as AnamnesisData;
  },

  // --- CHAT ---
  async saveMessage(userId: string, message: ChatMessage) {
    // Salvamos apenas texto e role por enquanto para simplificar o DB
    // Imagens grandes devem ir para o Storage, aqui assumimos texto
    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        role: message.role,
        text: message.text,
        timestamp: message.timestamp.toISOString()
      });
    
    if (error) console.error("Erro ao salvar mensagem", error);
  },

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      role: item.role,
      text: item.text,
      timestamp: new Date(item.timestamp)
    }));
  }
};