'use client';

import React, { useState, useEffect } from 'react';
import SettingsBar from '@/components/SettingsBar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { useSettings } from '@/lib/settings-context';

export default function FlashcardsPage() {
  const { settings, currentLangInfo } = useSettings();
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleTopics = {
    DBMS: ['ACID Properties', 'Transaction Isolation Levels', 'Primary vs Candidate Key', 'SQL Joins & Indexes'],
    'Operating Systems': ['Mutex vs Semaphore', 'Process Scheduling Algorithms', 'Page Faults & Thrashing', 'Deadlock Detection'],
    'Computer Networks': ['TCP vs UDP', 'HTTP vs HTTPS & SSL', 'OSI Layers & Protocols', 'CIDR & Subnet Mask'],
    DSA: ['Time & Space Complexities', 'Stack & Queue Applications', 'Array vs Linked List', 'Breadth First Search (BFS)'],
    Python: ['Python List vs Tuple', 'Mutable vs Immutable Types', 'Lambda Functions & Map/Filter', 'Args & Kwargs'],
    'Web Development': ['LocalStorage vs Cookies', 'Virtual DOM in React', 'CSS Position Properties', 'HTTP Status Codes (200, 404, 500)'],
    Other: ['Agile vs Scrum Principles', 'Git Merge vs Rebase', 'Design Patterns (Singleton, Factory)', 'REST vs GraphQL'],
  };

  // Keyboard navigation for card flipping and next/prev
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!cards || cards.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, currentIndex]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic for the flashcards.');
      return;
    }

    setLoading(true);
    setError(null);
    setCards(null);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trimmed,
          language: settings.language,
          subject: settings.subject,
          difficulty: settings.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate flashcards.');
      }

      if (!Array.isArray(data.cards) || data.cards.length === 0) {
        throw new Error('AI returned an empty flashcard set. Please try again.');
      }

      setCards(data.cards);
    } catch (err) {
      console.error('[FlashcardsPage] Error:', err);
      setError(err.message || 'Something went wrong while generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleShuffle = () => {
    if (!cards) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cards ? cards[currentIndex] : null;
  const currentTopics = sampleTopics[settings.subject] || sampleTopics.DBMS;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <SettingsBar />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>3D Revision Flashcards</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-semibold uppercase tracking-wider">
              8 Cards Set
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Rapid viva & mid-term exam preparation. Tap to flip between concept prompts and clear regional explanations.
          </p>
        </div>

        {/* Input / Topic Selector */}
        {!cards && !loading && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <label htmlFor="card-topic" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Enter Topic for Revision Cards
              </label>
              <input
                id="card-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Transaction Isolation, Mutex vs Semaphore, B-Tree..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Topic Chips */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Suggested Topics ({settings.subject}):
              </span>
              <div className="flex flex-wrap gap-2">
                {currentTopics.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Generate 8 Flashcards in {currentLangInfo.label}
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12">
            <Loader message={`૮ રિવિઝન ફ્લેશકાર્ડ્સ બની રહ્યા છે (${topic})...`} />
          </div>
        )}

        {/* Active Flashcard Viewer */}
        {cards && !loading && currentCard && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Topic: {topic}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Card {currentIndex + 1} of {cards.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Shuffle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCards(null)}
                  className="text-slate-400 hover:text-rose-500 font-medium"
                >
                  New Topic
                </button>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to card ${idx + 1}`}
                />
              ))}
            </div>

            {/* 3D Flip Card Container */}
            <div
              className="perspective-1000 w-full min-h-[340px] sm:min-h-[380px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={`relative w-full h-full min-h-[340px] sm:min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-xl border border-slate-200 dark:border-slate-800 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-8 flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      FRONT • CONCEPT / QUESTION
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                      #{currentIndex + 1}
                    </span>
                  </div>

                  <div className="py-6 text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {currentCard.front}
                    </h2>
                    <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4 text-indigo-500 animate-bounce-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Click card or press Space to see explanation
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>{settings.subject}</span>
                    <span>Tap to flip 🔄</span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-8 flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                      BACK • EXPLANATION ({currentLangInfo.label})
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-400/30">
                      #{currentIndex + 1}
                    </span>
                  </div>

                  <div className="py-4 text-center sm:text-left">
                    <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-indigo-50">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-indigo-200 pt-3 border-t border-indigo-500/40">
                    <span>Technical terms retained in English</span>
                    <span>Tap to flip back 🔄</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-sm transition-colors flex items-center gap-1.5"
              >
                <span>{isFlipped ? 'Show Front' : 'Flip to Answer'}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
