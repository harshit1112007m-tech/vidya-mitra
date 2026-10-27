'use client';

import React, { useState, useEffect } from 'react';
import Markdown from './Markdown';
import { useSettings } from '@/lib/settings-context';

export default function ChatBubble({ message, onCopy }) {
  const { isUser, text, timestamp, subject } = message;
  const { currentLangInfo } = useSettings();
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthAvailable, setSynthAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthAvailable(true);
    }
  }, []);

  // Clean text of markdown characters before feeding to speech synthesis
  const getCleanSpeechText = (raw) => {
    return raw
      .replace(/```[\s\S]*?```/g, ' [Code Snippet Skipped] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleListen = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any previous active speech
    window.speechSynthesis.cancel();

    const cleanText = getCleanSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Language code: gu-IN, hi-IN, or en-IN
    utterance.lang = currentLangInfo?.speechCode || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for crisp clarity

    // Try finding matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.includes(currentLangInfo?.code));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // Clean up speech synthesis if component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 shadow-md">
          <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{text}</div>
          <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-indigo-400/40 text-[10px] text-indigo-100">
            {subject && <span>{subject}</span>}
            {formattedTime && <span>• {formattedTime}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-4 group">
      <div className="max-w-[92%] md:max-w-[85%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-4 sm:p-5 shadow-sm">
        {/* Header with Vidya Mitra branding & badge */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              વિ
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Vidya Mitra</span>
            {subject && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {subject}
              </span>
            )}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-slate-400">{formattedTime}</span>
          )}
        </div>

        {/* Content with custom Markdown */}
        <Markdown content={text} />

        {/* Action Buttons: Copy & Listen */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Answer</span>
              </>
            )}
          </button>

          {/* Listen Button (Speech Synthesis) */}
          {synthAvailable && (
            <button
              type="button"
              onClick={handleListen}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                isPlaying
                  ? 'bg-indigo-600 text-white shadow-sm animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>Listen ({currentLangInfo?.label})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
