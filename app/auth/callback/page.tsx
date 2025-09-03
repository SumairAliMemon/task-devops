'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { upsertProfile } from '../../../lib/profile';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session?.user) {
          const { id, email, user_metadata } = data.session.user;
          const full_name = user_metadata?.full_name || user_metadata?.name || '';
          
          if (id && email) {
            await upsertProfile({ 
              id: id, 
              email: email, 
              full_name 
            });
          }
          
          // Redirect to posts  for authenticated users
          router.push('/posts');
        } else {
          // No session, redirect to auth
          router.push('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
