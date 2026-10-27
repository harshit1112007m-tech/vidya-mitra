'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import SettingsBar from '@/components/SettingsBar';
import Markdown from '@/components/Markdown';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { useSettings } from '@/lib/settings-context';

const MAX_CHAR_CAP = 20000;

export default function SummarizePage() {
  const { settings, currentLangInfo } = useSettings();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [pdfLibReady, setPdfLibReady] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Setup pdf.js worker once loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfLibReady(true);
    }
  }, []);

  const handleScriptLoad = () => {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setPdfLibReady(true);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (!window.pdfjsLib) {
      setError('PDF reader engine is still initializing. Please try again in a moment.');
      return;
    }

    setExtractingPdf(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setPdfPageCount(pdf.numPages);
      let extracted = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageString = content.items.map((item) => item.str).join(' ');
        extracted += `--- Page ${pageNum} ---\n${pageString}\n\n`;

        if (extracted.length >= MAX_CHAR_CAP) {
          extracted = extracted.slice(0, MAX_CHAR_CAP);
          break;
        }
      }

      if (!extracted.trim()) {
        throw new Error('Could not extract readable text from this PDF. It may contain scanned images rather than text.');
      }

      setText(extracted);
    } catch (err) {
      console.error('[PDF] Extraction error:', err);
      setError(err.message || 'Failed to extract text from the PDF file.');
    } finally {
      setExtractingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSummarize = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste lecture notes or upload a PDF first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed.slice(0, MAX_CHAR_CAP),
          language: settings.language,
          subject: settings.subject,
          difficulty: settings.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      setSummary(data.summary);
    } catch (err) {
      console.error('[SummarizePage] Error:', err);
      setError(err.message || 'Something went wrong while generating the summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vidya_Mitra_Summary_${settings.subject}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sampleLectureNotes = `Database Management Systems (DBMS) - Transaction Management & ACID Properties

A transaction in a database system is a logical unit of work that contains one or more SQL statements. For reliable transaction processing, a DBMS must adhere to ACID properties:
1. Atomicity: An 'all-or-nothing' principle. If any part of the transaction fails, the entire transaction is rolled back. Example: transfer money from Account A to Account B.
2. Consistency: Ensures database integrity constraints (like foreign keys, check constraints) are preserved before and after execution.
3. Isolation: Multiple concurrent transactions execute without interfering with one another. Concurrency control techniques like Two-Phase Locking (2PL) and Timestamp Ordering are used to avoid dirty reads, non-repeatable reads, and phantom reads.
4. Durability: Once a transaction commits, its changes are permanently recorded in non-volatile storage (WAL - Write-Ahead Logging ensures recovery after crashes).`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Load PDF.js from cdnjs without extra npm packages */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <SettingsBar />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Notes & PDF Summarizer</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-semibold uppercase tracking-wider">
              {currentLangInfo.label}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Paste lecture notes, GTU university handouts, or upload PDF slides. Vidya Mitra produces 5-7 key bullets, important terms, and a crisp one-paragraph summary.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Input Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Source Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setText(sampleLectureNotes)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Load Sample DBMS Notes
                </button>
                {text && (
                  <button
                    type="button"
                    onClick={() => {
                      setText('');
                      setPdfPageCount(null);
                    }}
                    className="text-slate-400 hover:text-rose-500 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* PDF Upload Box */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={extractingPdf || loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="pdf-upload-input"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {extractingPdf ? 'Extracting text from PDF...' : 'Click to Upload PDF or drag & drop'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Client-side PDF text extraction • Max 20,000 characters
                </p>
              </div>
            </div>

            {pdfPageCount && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Extracted from {pdfPageCount} pages of PDF</span>
              </div>
            )}

            {/* Textarea */}
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHAR_CAP))}
                placeholder="Or paste your lecture notes, textbook chapters, or syllabus topic here..."
                rows={11}
                disabled={loading || extractingPdf}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                <span>Subject: {settings.subject}</span>
                <span>
                  {text.length.toLocaleString()} / {MAX_CHAR_CAP.toLocaleString()} characters
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleSummarize}
              disabled={loading || extractingPdf || !text.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Generating Summary...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Summarize in {currentLangInfo.label}</span>
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block"></span>
                Structured Summary Output
              </span>

              {summary && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download (.txt)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 mt-4">
              {loading && <Loader message={`સારાંશ તૈયાર થઈ રહ્યો છે (${currentLangInfo.label})...`} />}

              {!loading && summary && (
                <div className="p-2 overflow-y-auto max-h-[600px]">
                  <Markdown content={summary} />
                </div>
              )}

              {!loading && !summary && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No summary generated yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Paste notes or drag in a lecture PDF on the left and click "Summarize" to get exam-ready bullets in {currentLangInfo.label}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
