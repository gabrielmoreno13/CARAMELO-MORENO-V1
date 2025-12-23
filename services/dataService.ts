import { supabase } from './supabaseClient';
import { UserProfile, AnamnesisData, ChatMessage } from '../types';

export const dataService = {
  // --- PERFIL ---
  async saveProfile(user: UserProfile) {
    // O ID deve vir do Auth do Supabase
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
      }, { onConflict: 'id' });
    
    if (error) {
        console.error("Erro ao salvar perfil:", error);
        throw new Error("Não foi possível salvar os dados do perfil.");
    }
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
        console.log("Perfil não encontrado ou erro:", error.message);
        return null;
    }
    return data as UserProfile;
  },

  // --- ANAMNESE ---
  async saveAnamnesis(userId: string, data: AnamnesisData) {
    const { error } = await supabase
      .from('anamnesis')
      .upsert({
        user_id: userId,
        data: data, // Salvamos o objeto inteiro como JSONB
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (error) {
        console.error("Erro ao salvar anamnese:", error);
        throw error;
    }
  },

  async getAnamnesis(userId: string): Promise<AnamnesisData | null> {
    const { data, error } = await supabase
      .from('anamnesis')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle evita erro 406 se não existir

    if (error) {
        console.error("Erro ao buscar anamnese:", error);
        return null;
    }
    if (!data) return null;
    return data.data as AnamnesisData;
  },

  // --- CHAT ---
  async saveMessage(userId: string, message: ChatMessage) {
    // Convertemos a data para string ISO segura para o Postgres
    const timestamp = message.timestamp instanceof Date 
        ? message.timestamp.toISOString() 
        : new Date().toISOString();

    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        role: message.role,
        text: message.text,
        timestamp: timestamp
      });
    
    if (error) console.error("Erro ao salvar mensagem no histórico:", error);
  },

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
        console.error("Erro ao recuperar histórico:", error);
        return [];
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      role: item.role as 'user' | 'model',
      text: item.text,
      timestamp: new Date(item.timestamp)
    }));
  }
};