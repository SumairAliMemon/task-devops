'use client';

import { Auth } from '@supabase/auth-ui-react';
import type { ViewType } from '@supabase/auth-ui-shared';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { upsertProfile } from '../../lib/profile';
import { supabase } from '../../lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [authView, setAuthView] = useState<ViewType>('sign_in');

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        const full_name = user_metadata?.full_name || user_metadata?.name || '';
        if (id && email) {
          await upsertProfile({ id: id + '', email: email + '', full_name });
        }
        router.push('/posts'); // Redirect to main posts page
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0f1c]">
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-2xl">
                <img src="/file.svg" alt="Blog Logo" className="w-8 h-8 text-blue-500" />
              </div>
              <span className="font-semibold text-2xl text-white tracking-tight">devlog</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome back</h1>
            <p className="text-gray-400">Continue your writing journey</p>
          </div>

          {/* Auth Methods */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            {/* Auth Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button 
                onClick={() => setAuthView('magic_link')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  authView === 'magic_link' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                ✨ Magic Link
              </button>
              <button 
                onClick={() => setAuthView('sign_in')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  authView === 'sign_in'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                📧 Email & Password
              </button>
            </div>

            {/* Auth Form */}
            <Auth
              supabaseClient={supabase}
              view={authView}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',                    // Blue-600
                      brandAccent: '#1d4ed8',             // Blue-700
                      inputBorder: '#1e293b',             // Slate-800
                      inputBorderHover: '#3b82f6',        // Blue-500
                      inputBorderFocus: '#3b82f6',        // Blue-500
                      inputText: '#f8fafc',               // Slate-50
                      inputPlaceholder: '#94a3b8',        // Slate-400
                      inputBackground: '#0f172a',         // Slate-900
                      messageText: '#60a5fa',             // Blue-400
                      messageTextDanger: '#f87171',       // Red-400
                      anchorTextColor: '#60a5fa',         // Blue-400
                      anchorTextHoverColor: '#93c5fd'     // Blue-300
                    }
                  }
                },
                style: {
                  button: {
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.75rem 1.25rem',
                    background: '#2563eb',
                    borderRadius: '0.75rem'
                  },
                  anchor: {
                    color: '#60a5fa',
                    fontWeight: '500'
                  },
                  container: {
                    gap: '1rem'
                  },
                  divider: {
                    background: '#1e293b',
                    margin: '1rem 0'
                  },
                  label: {
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Your Email',
                    password_label: 'Your Password',
                    email_input_placeholder: 'name@example.com',
                    password_input_placeholder: 'Enter your password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                    link_text: 'Sign in with Magic Link',
                    social_provider_text: 'Continue with {{provider}}'
                  },
                  magic_link: {
                    email_input_placeholder: 'name@example.com',
                    button_label: 'Send Magic Link',
                    loading_button_label: 'Sending magic link...',
                    confirmation_text: 'Check your email for the magic link'
                  }
                }
              }}
              providers={[]}
              showLinks={false}
              theme="custom"
              socialLayout="horizontal"
            />

            {/* Custom Google Button Overlay */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`
                    }
                  });
                }}
                className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all duration-200 hover:shadow-md border border-slate-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Hero Section */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center relative bg-[#070b13] border-l border-slate-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12">
          <div className="max-w-md text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
              <img 
                src="/window.svg" 
                alt="Code Editor" 
                className="w-32 h-32 relative z-10"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Developer Blog Platform
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Share your technical insights, coding journey, and development experiences with the global developer community.
              </p>
            </div>
          </div>
        </div>
        {/* Code blocks decoration */}
        <div className="absolute bottom-12 left-12 w-24 h-24 bg-blue-500/5 rounded-xl border border-blue-500/10 backdrop-blur-sm"></div>
        <div className="absolute top-12 right-12 w-32 h-32 bg-blue-500/5 rounded-xl border border-blue-500/10 backdrop-blur-sm"></div>
      </div>
    </div>
  );
}
