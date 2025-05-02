import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Post } from "./PostList";
import { FaRegComment, FaThumbsUp, FaEllipsisV } from "react-icons/fa";

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getMediaType = (url: string): "image" | "video" | "document" | null => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
    if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(ext)) return "document";
    return null;
  };

  const mediaType = post.image_url ? getMediaType(post.image_url) : null;
  const displayName = post.author_name || post.author_email || "Anonymous";


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col bg-white shadow-blue-950 shadow-sm rounded-lg p-8 pb-12 mb-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {post.avatar_url ? (
              <img src={post.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tl from-blue to-sky"></div>
            )}
            <span className="font-semibold text-gray-700">{displayName}</span>
          </div>

         
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 hover:text-gray-800">
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                <Link
                  to={`/posts/update/${post.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ✏️ Update
                </Link>
                <Link to={`/posts/delete/${post.id}`}
                  
                  className="block px-4 py-2 text-sm  hover:bg-gray-100 text-red-600 "
                >
                  🗑️ Delete
                </Link>
              </div>
            )}
          </div>
        </div>

        <Link to={`/posts/${post.id}`} className="flex flex-col">
          <div className="text-xl font-bold text-gray-800 mb-2">{post.title}</div>
          <p className="text-gray-700 mb-2">{post.content}</p>

          {mediaType === "image" && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto object-cover rounded-lg"
            />
          )}

          {mediaType === "video" && (
            <video
              controls
              src={post.image_url}
              className="w-full h-auto rounded-lg mt-2"
            />
          )}
        </Link>

        {mediaType === "document" && (
          <a
            href={post.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2"
          >
            📄 View Attached Document
          </a>
        )}

        <div className="mt-4">
          <Link
            to={`/posts/${post.id}`}
            className="flex justify-between text-sm text-gray-700"
          >
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1">
              <FaThumbsUp className="w-5 h-5" />
              {post.like_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <FaThumbsUp className="w-5 h-5 transform rotate-180" />
              {post.dislike_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <FaRegComment className="w-5 h-5" />
              {post.comment_count ?? 0}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
