import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get current user from Supabase session
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Get current user's profile (including role)
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

// Get user's role (free / premium / admin)
export const getUserRole = async (userId) => {
  const profile = await getUserProfile(userId);
  return profile?.subscription_tier || 'free';
};

// Check if current user is premium
export const isPremium = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  const role = await getUserRole(user.id);
  return role === 'premium';
};

// Check if current user is admin
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  const profile = await getUserProfile(user.id);
  return profile?.is_admin === true;
};

// Sign up with email/password
export const signUp = async (email, password, fullName, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, username },
    },
  });
  if (error) throw error;
  return data.user;
};

// Sign in with email/password
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};

// Listen to auth state changes (for React context)
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};