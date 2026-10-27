'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings, LANGUAGES } from '@/lib/settings-context';
import SettingsBar from '@/components/SettingsBar';

export default function HomePage() {
  const { settings, setLanguage, currentLangInfo } = useSettings();

  const heroHeadings = {
    gu: {
      headline: 'ઇજનેરી અને IT ના કન્સેપ્ટ્સ શીખો તમારી માતૃભાષામાં',
      subtext: 'DBMS, ઓપરેટિંગ સિસ્ટમ્સ, ડેટા સ્ટ્રક્ચર્સ અને કોડિંગ સમજો રોજિંદા જીવનના ઉદાહરણો અને ગુજરાતી ભાષા સાથે.',
      cta: 'શીખવાનું શરૂ કરો (Start Learning)',
    },
    hi: {
      headline: 'इंजीनियरिंग और IT के जटिल कॉन्सेप्ट्स समझें अपनी मातृभाषा में',
      subtext: 'DBMS, ऑपरेटिंग सिस्टम, डेटा स्ट्रक्चर्स और प्रोग्रामिंग को समझें आसान उदाहरणों और हिन्दी भाषा के साथ।',
      cta: 'पढ़ाई शुरू करें (Start Learning)',
    },
    en: {
      headline: 'Master Engineering & IT Concepts in Your Native Language',
      subtext: 'Demystifying DBMS, Operating Systems, Computer Networks, and DSA with intuitive real-life analogies and crystal-clear explanations.',
      cta: 'Start Learning Now',
    },
  };

  const currentHero = heroHeadings[settings.language] || heroHeadings.en;

  const features = [
    {
      title: 'Ask a Doubt (શંકા સમાધાન)',
      desc: 'Instant answers with relatable Indian analogies (railways, cricket, chai shops). Preserves English IT terms for exam success.',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      badge: 'Interactive AI Chat',
    },
    {
      title: 'Notes & PDF Summarizer',
      desc: 'Upload PDF lecture slides or paste lecture notes. Get 5-7 high-yield bullets, key IT definitions, and a 1-paragraph summary.',
      href: '/summarize',
      icon: (
        <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: 'Client-side PDF',
    },
    {
      title: 'Smart MCQs & Quizzes',
      desc: 'Test your understanding with 5 or 10 question adaptive quizzes. Instant color-coded feedback and detailed explanations.',
      href: '/quiz',
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badge: 'Instant Grading',
    },
    {
      title: '3D Revision Flashcards',
      desc: '8 high-yield cards per topic for quick pre-exam and viva revisions. Flip between concept questions and regional answers.',
      href: '/flashcards',
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      badge: 'Viva Preparation',
    },
    {
      title: 'Progress Analytics',
      desc: 'Visual score trends over time and subject breakdown with Chart.js. Export your test history to CSV with one click.',
      href: '/progress',
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 'Chart.js Visualizer',
    },
    {
      title: 'Speech & Audio Support',
      desc: 'Listen to explanations read aloud with native regional pronunciation (gu-IN, hi-IN, en-IN) or dictate doubts using your microphone.',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      badge: 'Voice AI Ready',
    },
  ];

  return (
    <div className="flex flex-col">
      <SettingsBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Language selector chips */}
          <div className="inline-flex items-center gap-1.5 p-1 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 shadow-sm">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  settings.language === lang.code
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            {currentHero.headline}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {currentHero.subtext}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/chat"
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              {currentHero.cta}
            </Link>
            <Link
              href="/summarize"
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm sm:text-base shadow-sm transition-all"
            >
              Upload Notes / PDF
            </Link>
          </div>

          {/* Quick Demo Topics */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400">Popular Engineering Doubts:</span>
            <Link href="/chat" className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">
              ⚡ Mutex vs Semaphore (OS)
            </Link>
            <Link href="/chat" className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">
              🗄️ B-Tree Indexing (DBMS)
            </Link>
            <Link href="/chat" className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">
              🌐 TCP 3-Way Handshake (CN)
            </Link>
            <Link href="/chat" className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors">
              🔄 Recursion & Stack (DSA)
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for Engineering Students Across India
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Bridge the language gap without losing your competitive edge in interviews and university exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <Link
                key={i}
                href={feat.href}
                className="group relative p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Explore feature</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How Vidya Mitra Works
            </h2>
            <p className="mt-2 text-sm text-slate-500">Three easy steps to exam confidence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Choose Your Language & Subject</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Select Gujarati, Hindi, or English alongside DBMS, OS, DSA, Python, or Computer Networks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask Doubts or Summarize Notes</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Type, speak, or upload your PDF slides. Vidya Mitra breaks complex algorithms into relatable everyday analogies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Test Knowledge & Track Progress</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Reinforce understanding with interactive MCQs and 3D flashcards. See your score trends on visual charts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
