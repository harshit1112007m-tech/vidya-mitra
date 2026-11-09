'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const rawRedirect = searchParams.get('redirect') || searchParams.get('next') || '/';
    const targetPath =
      !rawRedirect || rawRedirect === '/login' || rawRedirect.startsWith('/auth/callback')
        ? '/'
        : rawRedirect;

    // If user is already set in auth context
    if (user) {
      router.replace(targetPath);
      return;
    }

    // Check for OAuth error parameters in query
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
      const timer = setTimeout(() => router.replace('/login'), 2500);
      return () => clearTimeout(timer);
    }

    // Check if code exists in query params (PKCE flow)
    const code = searchParams.get('code');
    if (code && isSupabaseConfigured) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            console.warn('[auth-callback] exchangeCodeForSession:', error.message);
            // Check if session was already established automatically
            supabase.auth.getSession().then(({ data: sessData }) => {
              if (sessData?.session?.user) {
                router.replace(targetPath);
              } else {
                setErrorMsg(error.message);
                setTimeout(() => router.replace('/login'), 2500);
              }
            });
          } else {
            router.replace(targetPath);
          }
        })
        .catch((err) => {
          console.warn('[auth-callback] Exception during exchange:', err);
          router.replace(targetPath);
        });
    } else {
      // For implicit flow (tokens in hash) or auto-detection
      const timeout = setTimeout(() => {
        router.replace(targetPath);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [user, router, searchParams]);

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            <p className="font-semibold text-sm">Authentication Error</p>
            <p className="mt-1">{errorMsg}</p>
            <p className="mt-2 text-[11px] text-slate-500">Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Signing you in with Google...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-gujarati">
                ગૂગલ દ્વારા લૉગ ઇન થઈ રહ્યું છે...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <CallbackContent />
    </React.Suspense>
  );
}

