/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Bug, 
  TrendingUp, 
  CloudSun, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  Leaf,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import CropRecommendation from './components/CropRecommendation';
import DiseaseDetection from './components/DiseaseDetection';
import MarketInsights from './components/MarketInsights';
import WeatherHub from './components/WeatherHub';
import Chatbot from './components/Chatbot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { auth, db, signIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { cn } from './utils/cn';

type Tab = 'dashboard' | 'recommendation' | 'disease' | 'market' | 'weather';

import { LanguageProvider, useLanguage, Language } from './contexts/LanguageContext';

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user document exists in Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: 'farmer',
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-2xl border border-zinc-100 max-w-md w-full text-center space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 mx-auto">
            <Leaf className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900">{t('common.appName')}</h1>
            <p className="text-zinc-500">{t('common.intelligentFarming')}</p>
          </div>
          <button
            onClick={() => signIn()}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/10"
          >
            <LogIn className="w-5 h-5" />
            {t('common.signInWithGoogle')}
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'recommendation', label: t('common.cropAdvisor'), icon: <Sprout className="w-5 h-5" /> },
    { id: 'disease', label: t('common.diseases'), icon: <Bug className="w-5 h-5" /> },
    { id: 'market', label: t('common.market'), icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'weather', label: t('common.weather'), icon: <CloudSun className="w-5 h-5" /> },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 bg-white border-r border-zinc-100 z-40 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="h-full flex flex-col p-4">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-10">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 shrink-0">
                <Leaf className="w-6 h-6" />
              </div>
              {isSidebarOpen && (
                <span className="font-bold text-xl tracking-tight text-emerald-900">AgroSmart</span>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                    activeTab === item.id 
                      ? "bg-emerald-50 text-emerald-700 font-semibold" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <div className={cn(
                    "shrink-0 transition-colors",
                    activeTab === item.id ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"
                  )}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && <span>{item.label}</span>}
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full"
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-100 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all">
                <Settings className="w-5 h-5" />
                {isSidebarOpen && <span>{t('common.settings')}</span>}
              </button>
              <button 
                onClick={() => logOut()}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {isSidebarOpen && <span>{t('common.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}>
          {/* Top Header */}
          <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-30 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-zinc-900 capitalize">
                {activeTab === 'dashboard' ? t('common.dashboard') : 
                 activeTab === 'recommendation' ? t('common.cropAdvisor') :
                 activeTab === 'disease' ? t('common.diseases') :
                 activeTab === 'market' ? t('common.market') :
                 activeTab === 'weather' ? t('common.weather') : activeTab}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                {(['en', 'hi', 'pa', 'mr', 'te', 'ta', 'bn', 'gu'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                      language === lang ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200">
                <Search className="w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder={t('common.search')}
                  className="bg-transparent border-none focus:ring-0 text-sm w-48"
                />
              </div>
              <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-px bg-zinc-200 mx-1" />
              <button className="flex items-center gap-2 p-1 hover:bg-zinc-100 rounded-full transition-colors">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-semibold text-zinc-700">{user.displayName}</span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'recommendation' && <CropRecommendation />}
                {activeTab === 'disease' && <DiseaseDetection />}
                {activeTab === 'market' && <MarketInsights />}
                {activeTab === 'weather' && <WeatherHub />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* AI Chatbot */}
        <Chatbot />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
