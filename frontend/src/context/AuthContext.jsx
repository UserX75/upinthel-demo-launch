import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserRole, getUserProfile } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('free');
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const role = await getUserRole(session.user.id);
        setUserRole(role);
        const profile = await getUserProfile(session.user.id);
        setVerificationStatus(profile?.verification_status || 'unverified');
      }
      setLoading(false);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUserRole(role);
        const profile = await getUserProfile(session.user.id);
        setVerificationStatus(profile?.verification_status || 'unverified');
      } else {
        setUserRole('free');
        setVerificationStatus('unverified');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openLoginModal = () => setShowAuthModal(true);
  const closeLoginModal = () => setShowAuthModal(false);
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('free');
    setVerificationStatus('unverified');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, verificationStatus, loading, openLoginModal, closeLoginModal, logout, showAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};