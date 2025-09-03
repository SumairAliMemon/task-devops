
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

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h2>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {post.content}
      </p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          By {post.profiles?.full_name || 'Unknown Author'}
        </span>
        <span>{post.created_at}</span>
      </div>
    </div>
  );
}
