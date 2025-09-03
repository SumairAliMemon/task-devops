'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth');
          return;
        }

        if (session?.user) {
          // User is authenticated, redirect to posts
          router.push('/posts');
        } else {
          // No user session, redirect to auth
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!authLoading) {
        if (session?.user) {
          router.push('/posts');
        } else {
          router.push('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, authLoading]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
