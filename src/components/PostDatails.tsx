
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { FaRegComment } from "react-icons/fa";
import { useState } from "react";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface Props {
  postId: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Post not found");
  }
  return data as Post;
};

const getMediaType = (url: string): "image" | "video" | "document" | null => {
  if (!url) return null;
  const ext = url.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'document';
  return null;
};

export const PostDetails = ({ postId }: Props) => {
  const [showComments, setShowComments] = useState(false);
  
  const { 
    data: post, 
    error, 
    isLoading 
  } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });

  if (isLoading) return <div className="text-center py-4">Loading post...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;
  if (!post) return <div className="text-center py-4">Post not found</div>;

  const mediaType = post.image_url ? getMediaType(post.image_url) : null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow overflow-hidden mb-6">
    
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2 text-blue-600">{post.title}</h2>
        <p className="mb-4 whitespace-pre-line text-black">{post.content}</p>

       
{mediaType === "image" && post.image_url && (
  <img 
    src={post.image_url} 
    alt={post.title} 
    className="mt-4 rounded-lg w-full max-h-96 object-contain"
  />
)}


{mediaType === "video" && post.image_url && (
  <video 
    controls 
    className="w-full mt-4 rounded-lg max-h-96"
  >
    <source src={post.image_url} type={`video/${post.image_url.split('.').pop()}`} />
    Your browser does not support the video tag.
  </video>
)}


{mediaType === "document" && post.image_url && (
  <a
    href={post.image_url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
  >
    <span className="mr-2">📄</span>
    View Document
  </a>
)}

        <p className="text-xs text-gray-500 mt-4">
          Posted on: {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>

     
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex justify-between items-center">
          <LikeButton postId={postId} />
          
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showComments 
                ? "text-blue-500 bg-blue-50" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaRegComment className="w-5 h-5" />
            <span>Comment</span>
          </button>
        </div>
      </div>

    
      {showComments && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <CommentSection postId={postId} />
        </div>
      )}
    </div>
  );
};