"use client";
import { useState } from 'react';

export default function Navbar({ user, onLogout, onAddPost }: {
  user: { full_name?: string; email: string } | null;
  onLogout: () => void;
  onAddPost: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-b-2xl mb-8">
      <div className="text-2xl font-extrabold text-indigo-700 tracking-tight">Blogify</div>
      <div className="flex items-center gap-4">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          onClick={onAddPost}
        >
          + Add Post
        </button>
        {user && (
          <div className="relative flex items-center">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="font-medium text-gray-700">{user.full_name || user.email}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10 animate-fade-in">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  onClick={onLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </nav>
  );
}
