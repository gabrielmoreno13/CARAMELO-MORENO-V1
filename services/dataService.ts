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
        age: user.age,
        avatar_hue: user.avatarHue || 0, // Mapeia camelCase para snake_case
        updated_at: new Date().toISOString()
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

    // Mapeia snake_case do banco de volta para camelCase do Frontend
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        company: data.company,
        phone: data.phone,
        age: data.age,
        avatarHue: data.avatar_hue
    } as UserProfile;
  },

  // --- ANAMNESE E HISTÓRICO COMPLETO ---
  async saveAnamnesis(userId: string, data: AnamnesisData) {
    // O campo 'data' no banco é do tipo JSONB.
    // Ele armazena toda a estrutura complexa (arrays de humor, gratidão, etc) automaticamente.
    const { error } = await supabase
      .from('anamnesis')
      .upsert({
        user_id: userId,
        data: data, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (error) {
        console.error("Erro ao salvar dados de saúde:", error);
        throw error;
    }
  },

  async getAnamnesis(userId: string): Promise<AnamnesisData | null> {
    const { data, error } = await supabase
      .from('anamnesis')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
        console.error("Erro ao buscar dados de saúde:", error);
        return null;
    }
    if (!data) return null;
    
    // Retorna o objeto JSON puro
    return data.data as AnamnesisData;
  },

  // --- CHAT ---
  async saveMessage(userId: string, message: ChatMessage) {
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
      .order('timestamp', { ascending: true })
      .limit(50); // Limita para não carregar histórico infinito de uma vez

    if (error) {
        console.error("Erro ao recuperar histórico:", error);
        return [];
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id.toString(),
      role: item.role as 'user' | 'model',
      text: item.text,
      timestamp: new Date(item.timestamp)
    }));
  }
};