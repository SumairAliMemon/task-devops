
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { GET_POSTS } from '../../graphql/queries';
import { apolloClient } from '../../lib/apollo';
import { supabase } from '../../lib/supabaseClient';
import AddPostForm from '../components/AddPostForm';

// Utility function to safely get first character
const getFirstChar = (str: string | undefined | null): string => {
  if (!str) return 'U';
  const firstChar = (str as any).charAt ? (str as any).charAt(0) : (str as any)[0];
  return firstChar ? firstChar.toUpperCase() : 'U';
};

// Utility function to safely get string length
const getStringLength = (str: string | undefined | null): number => {
  if (!str) return 0;
  return (str as any).length || 0;
};

// Utility function to safely split string
const safeSplit = (str: string | undefined | null, delimiter: string): string[] => {
  if (!str) return [];
  return (str as any).split ? (str as any).split(delimiter) : [];
};

// Utility function to safely format date
const formatDate = (dateString: string): string => {
  try {
    const date = new (globalThis as any).Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

// Utility function to create 200-character excerpt
const createExcerpt = (content: string, maxLength: number = 200): string => {
  if (!content) return '';
  const safeContent = content as any;
  const length = getStringLength(safeContent);
  
  if (length <= maxLength) return safeContent;
  
  // Find the last space before maxLength to avoid cutting words
  let excerpt = safeContent.substring ? safeContent.substring(0, maxLength) : safeContent.slice(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    excerpt = excerpt.substring(0, lastSpace);
  }
  
  return excerpt + '...';
};

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

interface Author {
  id: string;
  full_name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: {
    id: string;
    full_name?: string;
    email: string;
  } | null;
}

const POSTS_PER_PAGE = 5;

function PostsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddPost, setShowAddPost] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Pagination
  const pageStr = searchParams.get('page') || '1';
  const page = +pageStr || 1;

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user as User);
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/auth');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push('/auth');
      } else {
        setUser(session.user as User);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const [data, setData] = useState<{
    postsCollection: { 
      edges: { node: Post }[]
    }
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apolloClient.query({
        query: GET_POSTS,
        variables: {
          first: POSTS_PER_PAGE,
          offset: (page - 1) * POSTS_PER_PAGE
        },
        fetchPolicy: 'cache-first'
      });
      
      setData(result.data as any);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPosts();
  };

  // Fetch posts when user or page changes
  useEffect(() => {
    fetchPosts();
  }, [user, page]);

  const allPosts = (data?.postsCollection?.edges as any)?.map((edge: { node: Post }) => edge.node) || [];
  
  // Filter posts based on view
  const posts = viewFilter === 'mine' 
    ? allPosts.filter((post: Post) => post.author_id === user?.id)
    : allPosts;

  const hasNextPage = allPosts.length === POSTS_PER_PAGE;
  const hasPreviousPage = page > 1;

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href);
    if (newPage === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', `${newPage}`);
    }
    router.push(url.pathname + url.search);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddPost = () => {
    setShowAddPost(true);
  };

  const handleCloseAddPost = () => {
    setShowAddPost(false);
    refetch(); // Refresh posts after adding
  };

  const handleViewFilter = (filter: 'all' | 'mine') => {
    setViewFilter(filter);
    // Reset to page 1 when changing filter
    router.push('/posts');
  };

  if (authLoading || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-spin"></div>
            <div className={`absolute inset-1 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Getting ready...</h2>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Setting up your developer space</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="w-64 h-12 bg-gray-200 rounded-2xl mx-auto mb-6 animate-pulse"></div>
            <div className="w-96 h-6 bg-gray-200 rounded-xl mx-auto animate-pulse"></div>
          </div>
          
          <div className="flex justify-center mb-12">
            <div className="w-64 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white/50 rounded-2xl p-8 border border-gray-200/50 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white/50 rounded-2xl p-8 border border-gray-200/50 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white/50 rounded-2xl p-8 border border-gray-200/50 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-md w-full text-center">
          <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/90 border-red-800/50' 
              : 'bg-white/90 border-red-200/50'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-red-900/30 to-pink-900/30' 
                : 'bg-gradient-to-br from-red-100 to-pink-100'
            }`}>
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>Something went wrong</h2>
            <p className={`mb-8 leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We're having trouble loading your posts. Don't worry, your data is safe!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => refetch()}
                className={`flex items-center justify-center space-x-2 px-6 py-3 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
              <button 
                onClick={handleLogout}
                className={`px-6 py-3 border rounded-xl hover:scale-105 transition-all duration-200 font-medium ${
                  isDarkMode 
                    ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Logout
              </button>
            </div>
            <p className={`text-xs mt-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Error: {error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Modern Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <Link href="/" className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                devlog
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`hidden sm:flex items-center space-x-2 backdrop-blur-sm rounded-full px-3 py-1 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
              }`}>
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {getFirstChar(user.user_metadata?.full_name || user.user_metadata?.name || user.email)}
                  </span>
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? safeSplit(user.email, '@').at(0) : '')}
                </span>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={handleAddPost}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                <span className="hidden sm:inline">New Post</span>
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Add Post Modal - Dark Mode */}
      {showAddPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className={`backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/95 border-gray-700/50' 
              : 'bg-white/95 border-gray-200/50'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode ? 'from-gray-100 to-gray-300' : 'from-gray-900 to-gray-600'
                }`}>Create New Post</h2>
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Share your thoughts with the community</p>
              </div>
              <button
                onClick={handleCloseAddPost}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddPostForm
              authorId={user.id}
              onCancel={handleCloseAddPost}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Developer Stories
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {viewFilter === 'all' 
              ? 'Discover insights, tutorials, and experiences from developers around the world' 
              : 'Your personal collection of thoughts and technical insights'
            }
          </p>
        </div>

        {/* Modern Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white/60 backdrop-blur-lg p-1.5 rounded-2xl shadow-lg border border-gray-200/50">
            <button
              onClick={() => handleViewFilter('all')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span>🌐</span>
              <span>All Posts</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                viewFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {allPosts.length}
              </span>
            </button>
            <button
              onClick={() => handleViewFilter('mine')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewFilter === 'mine'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span>👤</span>
              <span>My Posts</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                viewFilter === 'mine' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {allPosts.filter((post: Post) => post.author_id === user?.id).length}
              </span>
            </button>
          </div>
        </div>

        {/* Posts Content */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' 
                : 'bg-gradient-to-br from-blue-100 to-purple-100'
            }`}>
              <span className="text-6xl">📝</span>
            </div>
            <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {viewFilter === 'mine' ? 'Your story starts here' : 'Be the first to share'}
            </h2>
            <p className={`mb-12 text-lg max-w-md mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {viewFilter === 'mine' 
                ? 'Share your development journey, insights, and experiences with the community.'
                : 'Start the conversation! Share your first development story with fellow developers.'
              }
            </p>
            <button
              onClick={handleAddPost}
              className={`inline-flex items-center space-x-3 px-8 py-4 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium text-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
            >
              <span className="text-2xl">✨</span>
              <span>Write your first post</span>
            </button>
          </div>
        ) : (
          <>
            {/* Posts Grid - Modern Layout */}
            <div className="grid gap-8 mb-12">
              {posts.map((post: Post, index: number) => (
                <Link 
                  key={post.id} 
                  href={`/posts/${post.id}`} 
                  className="group block hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-lg border hover:shadow-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800/80 border-gray-700/50 hover:border-purple-400/50' 
                      : 'bg-white/80 border-gray-200/50 hover:border-blue-200/50'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getFirstChar(post.profiles?.full_name)}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {post.profiles?.full_name || 'Unknown Author'}
                          </p>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                      {post.author_id === user?.id && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-green-800/30 to-blue-800/30 text-green-300' 
                            : 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700'
                        }`}>
                          Your Post
                        </span>
                      )}
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </h2>
                    
                    <p className={`leading-relaxed mb-6 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {createExcerpt(post.content, 200)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-2 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span>📖</span>
                        <span>{getStringLength(post.content) ? `${~~((getStringLength(post.content) || 0) / 200) + 1} min read` : '1 min read'}</span>
                      </div>
                      <div className={`flex items-center space-x-2 group-hover:text-purple-400 transition-colors duration-200 ${
                        isDarkMode ? 'text-purple-400' : 'text-blue-600 group-hover:text-blue-700'
                      }`}>
                        <span className="text-sm font-medium">Read more</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Modern Pagination */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPreviousPage}
                  className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <span className="px-4 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-md">
                    {page}
                  </span>
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                  className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function PostsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-spin"></div>
          <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading posts...</h2>
        <p className="text-gray-600">Getting your content ready</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function PostsPage() {
  return (
    <Suspense fallback={<PostsLoading />}>
      <PostsContent />
    </Suspense>
  );
}
