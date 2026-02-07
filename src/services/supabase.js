import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Transaction operations
export const transactionService = {
  // Get all transactions for current user
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add a new transaction
  async add(transaction) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a transaction
  async update(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', transaction.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a transaction
  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Clear all transactions for current user
  async clearAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user?.id);
    
    if (error) throw error;
  }
};

// Auth helper functions
export const authService = {
  // Sign up with email and password
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return data;
  },

  // Update user profile (display name, etc.)
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    
    if (error) throw error;
    return data;
  },

  // Update email address (requires confirmation)
  async updateEmail(newEmail) {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail
    });
    
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default supabase;
