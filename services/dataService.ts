
import { supabase } from './supabaseClient';
import { UserProfile, AnamnesisData } from '../types';

export const dataService = {
  async getProfile(id: string): Promise<UserProfile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    return data;
  },
  async getProfileByPhone(phone: string): Promise<UserProfile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('phone', phone).maybeSingle();
    return data;
  },
  async saveProfile(user: UserProfile) {
    return supabase.from('profiles').upsert(user);
  },
  async getAnamnesis(userId: string): Promise<AnamnesisData | null> {
    const { data } = await supabase.from('anamnesis').select('data').eq('user_id', userId).maybeSingle();
    return data?.data || null;
  },
  async saveAnamnesis(userId: string, data: AnamnesisData) {
    return supabase.from('anamnesis').upsert({ user_id: userId, data, updated_at: new Date() });
  },
  async saveChatMessage(userId: string, message: any) {
    // Sincroniza mensagens do WhatsApp com o histórico do App
    return supabase.from('chat_history').insert({
      user_id: userId,
      role: message.role,
      content: message.text,
      channel: message.channel || 'app'
    });
  }
};
