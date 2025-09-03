'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '../../lib/supabaseClient';

// Zod validation schema
const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  content: z.string()
    .min(1, 'Content is required')
    .min(50, 'Content must be at least 50 characters')
    .max(5000, 'Content must be less than 5000 characters')
    .trim(),
});

type PostFormData = z.infer<typeof postSchema>;

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
}

interface AddPostFormProps {
  authorId: string;
  onCancel: () => void;
}

export default function AddPostForm({ authorId, onCancel }: AddPostFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: ''
    }
  });

  // Watch content for character count
  const contentValue = watch('content');
  const contentLength = (contentValue as any)?.length || 0;

  // Get current user data
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
      }
    };
    getCurrentUser();
  }, []);

  const ensureProfileExists = async () => {
    if (!user) {
      console.error('No user available for profile creation');
      return;
    }
    
    try {
      console.log('Ensuring profile exists for user:', {
        id: user.id,
        email: user.email,
        authorId: authorId
      });

      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error checking existing profile:', checkError);
      }

      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        return;
      }

      console.log('Creating new profile...');
      // Use Supabase client directly for upsert
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
        }, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error('Profile upsert error:', error);
      } else {
        console.log('Profile created/updated successfully:', data);
      }
    } catch (error) {
      console.error('Profile upsert error:', error);
    }
  };

  // Form submission handler for React Hook Form
  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      // Ensure profile exists first
      await ensureProfileExists();

      // Double-check we have a user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No authenticated user session found');
        return;
      }

      console.log('Creating post with data:', {
        title: data.title,
        content: data.content,
        author_id: authorId,
        sessionUserId: session.user.id
      });

      // Try using Supabase client instead of GraphQL
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([
          {
            title: data.title,
            content: data.content,
            author_id: authorId
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        console.error(`Failed to create post: ${error.details || error.hint || 'Unknown error'}`);
        return;
      }

      console.log('Post created successfully:', newPost);
      reset();
      router.refresh();
      onCancel();
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Post Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter an engaging title for your post..."
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">
            ({contentLength}/5000 characters)
          </span>
        </label>
        <textarea
          id="content"
          {...register('content')}
          rows={8}
          className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
            errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          placeholder="Share your thoughts, experiences, or insights..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
        {contentLength >= 4500 && (
          <p className="mt-1 text-sm text-amber-600">
            You're approaching the character limit ({contentLength}/5000)
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating...</span>
            </span>
          ) : (
            'Create Post'
          )}
        </button>
      </div>
    </form>
  );
}
