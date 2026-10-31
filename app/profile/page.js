'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSettings, LANGUAGES, SUBJECTS } from '@/lib/settings-context';
import { getStoredQuizHistory, getStoredChatHistory, clearStoredQuizHistory, clearStoredChatHistory } from '@/lib/storage';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { settings, setLanguage, setSubject } = useSettings();

  const [name, setName] = useState('');
  const [preferredLang, setPreferredLang] = useState('gu');
  const [preferredSub, setPreferredSub] = useState('DBMS');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [stats, setStats] = useState({ quizzes: 0, avgScore: 0, chats: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
      return;
    }

    if (profile) {
      setName(profile.full_name || '');
      setPreferredLang(profile.preferred_language || settings.language || 'gu');
      setPreferredSub(profile.preferred_subject || settings.subject || 'DBMS');
    }

    if (user) {
      const quizHistory = getStoredQuizHistory(user.id);
      const chatHistory = getStoredChatHistory(user.id);
      const totalQuizzes = quizHistory.length;
      const avg =
        totalQuizzes > 0
          ? Math.round(quizHistory.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalQuizzes)
          : 0;
      setStats({
        quizzes: totalQuizzes,
        avgScore: avg,
        chats: chatHistory.length,
      });
    }
  }, [user, profile, loading, router, settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const { error } = await updateProfile({
      full_name: name.trim(),
      preferred_language: preferredLang,
      preferred_subject: preferredSub,
    });

    if (error) {
      setMsg({ type: 'error', text: error.message || 'Failed to update profile.' });
    } else {
      setLanguage(preferredLang);
      setSubject(preferredSub);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleClearHistory = async (type) => {
    if (!user) return;
    if (type === 'quiz') {
      if (confirm('Are you sure you want to delete your personal quiz history?')) {
        await clearStoredQuizHistory(user.id);
        setStats((prev) => ({ ...prev, quizzes: 0, avgScore: 0 }));
        setMsg({ type: 'success', text: 'Personal quiz history cleared.' });
      }
    } else if (type === 'chat') {
      if (confirm('Are you sure you want to delete your personal doubt chat history?')) {
        await clearStoredChatHistory(user.id);
        setStats((prev) => ({ ...prev, chats: 0 }));
        setMsg({ type: 'success', text: 'Personal chat history cleared.' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/25 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile?.full_name || 'Student'}
            </h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Verified Account
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Student ID: <code className="font-mono">{user.id.substring(0, 13)}...</code>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out (લૉગ આઉટ)</span>
        </button>
      </div>

      {/* Personal Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Quizzes Taken</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.quizzes}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved Doubt Messages</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.chats}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile & Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Account Settings & Learning Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Customize your default study language and primary subject across all AI tools.
        </p>

        {msg && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name / તમારું નામ
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Learning Language
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label} ({l.englishLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Subject / Topic
              </label>
              <select
                value={preferredSub}
                onChange={(e) => setPreferredSub(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Preferences (સેવ કરો)'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Data Privacy & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Data Management & Privacy
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          All your doubt conversations and quiz scores belong strictly to your user account via Supabase Row-Level Security.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/progress"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            View Full Progress Analytics
          </Link>
          <button
            type="button"
            onClick={() => handleClearHistory('quiz')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
          >
            Reset Quiz History
          </button>
          <button
            type="button"
            onClick={() => handleClearHistory('chat')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
          >
            Reset Chat History
          </button>
        </div>
      </div>
    </div>
  );
}
