import { createClient } from '@supabase/supabase-js';

// Vite requires VITE_ prefix for client-side environment variables
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

// Recurring transaction operations
export const recurringService = {
  // Get all recurring transactions for current user
  async getAll() {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('next_due_date', { ascending: true });
    
    if (error) {
      // Table might not exist yet — return empty array gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('⚠️ recurring_transactions table not found. Using local storage.');
        return [];
      }
      throw error;
    }
    return (data || []).map(row => ({
      id: row.id,
      description: row.description,
      amount: row.amount,
      type: row.type,
      category: row.category,
      frequency: row.frequency,
      startDate: row.start_date,
      nextDueDate: row.next_due_date,
      lastPaidDate: row.last_paid_date,
      isActive: row.is_active,
      isAutoDetected: row.is_auto_detected,
      confidence: row.confidence,
      createdAt: row.created_at,
    }));
  },

  // Add a new recurring transaction
  async add(recurring) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const row = {
      id: recurring.id,
      user_id: user?.id,
      description: recurring.description,
      amount: recurring.amount,
      type: recurring.type,
      category: recurring.category,
      frequency: recurring.frequency,
      start_date: recurring.startDate,
      next_due_date: recurring.nextDueDate,
      last_paid_date: recurring.lastPaidDate || null,
      is_active: recurring.isActive ?? true,
      is_auto_detected: recurring.isAutoDetected ?? false,
      confidence: recurring.confidence || null,
    };

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([row])
      .select()
      .single();
    
    if (error) throw error;
    return recurring; // Return the original format
  },

  // Update a recurring transaction
  async update(recurring) {
    const row = {
      description: recurring.description,
      amount: recurring.amount,
      type: recurring.type,
      category: recurring.category,
      frequency: recurring.frequency,
      start_date: recurring.startDate,
      next_due_date: recurring.nextDueDate,
      last_paid_date: recurring.lastPaidDate,
      is_active: recurring.isActive,
    };

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(row)
      .eq('id', recurring.id)
      .select()
      .single();
    
    if (error) throw error;
    return recurring;
  },

  // Delete a recurring transaction
  async delete(id) {
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Mark as paid (update lastPaidDate and advance nextDueDate)
  async markPaid(recurring, nextDueDate) {
    const today = new Date().toISOString().split('T')[0];
    const row = {
      last_paid_date: today,
      next_due_date: nextDueDate,
    };

    const { error } = await supabase
      .from('recurring_transactions')
      .update(row)
      .eq('id', recurring.id);
    
    if (error) throw error;
    return { ...recurring, lastPaidDate: today, nextDueDate };
  },
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
