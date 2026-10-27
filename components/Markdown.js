'use client';

import React, { useState } from 'react';

/**
 * components/Markdown.js
 * Zero-dependency, lightweight markdown renderer for Vidya Mitra.
 * Supports:
 * - Code blocks with syntax copy button (```lang ... ```)
 * - Inline code (`code`)
 * - Bold (**text**) and Italic (*text*)
 * - Headings (#, ##, ###)
 * - Unordered lists (- or *) and ordered lists (1.)
 * - Blockquotes (> quote)
 */

function InlineText({ text }) {
  if (!text) return null;

  // Split by inline code first
  const codeParts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {codeParts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 text-xs md:text-sm font-mono rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        // Now process bold and italic inside non-code parts
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <React.Fragment key={i}>
            {boldParts.map((bPart, j) => {
              if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
                return (
                  <strong key={j} className="font-semibold text-slate-900 dark:text-slate-100">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }

              // Process italic
              const italicParts = bPart.split(/(\*[^*]+\*)/g);
              return (
                <React.Fragment key={j}>
                  {italicParts.map((itPart, k) => {
                    if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
                      return <em key={k} className="italic">{itPart.slice(1, -1)}</em>;
                    }
                    return itPart;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <span className="text-slate-400 uppercase tracking-wider">{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-0.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs md:text-sm font-mono overflow-x-auto leading-relaxed text-indigo-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ content }) {
  if (!content) return null;

  // Split content by code fences: ```lang\ncode\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push({ type: 'text', content: textBefore });
    }
    elements.push({
      type: 'code',
      lang: match[1] || 'text',
      code: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push({ type: 'text', content: remainingText });
  }

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed break-words">
      {elements.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} lang={block.lang} code={block.code} />;
        }

        // Process markdown lines for headings, lists, blockquotes, paragraphs
        const lines = block.content.split('\n');
        const rendered = [];
        let listItems = [];
        let listType = null; // 'ul' | 'ol'

        const flushList = () => {
          if (listItems.length > 0) {
            if (listType === 'ol') {
              rendered.push(
                <ol key={`ol-${rendered.length}`} className="list-decimal pl-5 my-2 space-y-1">
                  {listItems.map((it, lIdx) => (
                    <li key={lIdx}><InlineText text={it} /></li>
                  ))}
                </ol>
              );
            } else {
              rendered.push(
                <ul key={`ul-${rendered.length}`} className="list-disc pl-5 my-2 space-y-1">
                  {listItems.map((it, lIdx) => (
                    <li key={lIdx}><InlineText text={it} /></li>
                  ))}
                </ul>
              );
            }
            listItems = [];
            listType = null;
          }
        };

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            flushList();
            return;
          }

          // Headings
          if (trimmed.startsWith('### ')) {
            flushList();
            rendered.push(
              <h3 key={lineIdx} className="text-base md:text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-4 mb-1">
                <InlineText text={trimmed.slice(4)} />
              </h3>
            );
          } else if (trimmed.startsWith('## ')) {
            flushList();
            rendered.push(
              <h2 key={lineIdx} className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                <InlineText text={trimmed.slice(3)} />
              </h2>
            );
          } else if (trimmed.startsWith('# ')) {
            flushList();
            rendered.push(
              <h1 key={lineIdx} className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2">
                <InlineText text={trimmed.slice(2)} />
              </h1>
            );
          } else if (trimmed.startsWith('> ')) {
            // Blockquote
            flushList();
            rendered.push(
              <blockquote key={lineIdx} className="border-l-4 border-indigo-500 pl-3.5 py-1 my-2 italic text-slate-600 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r">
                <InlineText text={trimmed.slice(2)} />
              </blockquote>
            );
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // Unordered list item
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(trimmed.slice(2));
          } else if (/^\d+\.\s/.test(trimmed)) {
            // Ordered list item
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(trimmed.replace(/^\d+\.\s/, ''));
          } else {
            // Normal paragraph
            flushList();
            rendered.push(
              <p key={lineIdx} className="my-1.5 text-slate-800 dark:text-slate-200">
                <InlineText text={line} />
              </p>
            );
          }
        });

        flushList();
        return <React.Fragment key={idx}>{rendered}</React.Fragment>;
      })}
    </div>
  );
}
