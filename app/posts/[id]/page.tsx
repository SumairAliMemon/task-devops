'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GET_POST } from '../../../graphql/queries';
import { apolloClient } from '../../../lib/apollo';

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
  profiles?: Author;
}

function formatDate(dateString: string) {
  try {
    return (new (globalThis as any).Date(dateString) as Date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as Intl.DateTimeFormatOptions);
  } catch {
    return 'Invalid date';
  }
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [postId, setPostId] = useState<string>('');
  const [data, setData] = useState<{
    postsCollection: {
      edges: { node: Post }[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!postId) return;
    
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apolloClient.query({
          query: GET_POST,
          variables: { id: postId },
          fetchPolicy: 'cache-first'
        });
        
        setData(result.data as any);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const post = (data?.postsCollection?.edges as any)?.[0]?.node;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading post: {error.message}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Post not found</p>
          <button
            onClick={() => router.push('/posts')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/posts')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Posts
          </button>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-600 text-sm space-x-4">
              <span>
                By: {post.profiles?.full_name || 'Unknown Author'}
              </span>
              <span>•</span>
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
            </div>
          </header>
          
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
