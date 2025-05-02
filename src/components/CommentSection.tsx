import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";
import { useNavigate } from "react-router-dom";

interface Props {
  postId: number;
}

interface Comment {
  content: string;
  parent_comment_id: number | null;
}

export interface CommentType {
  id: number;
  content: string;
  post_id: number;
  parent_comment_id: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  author: string;
  children?: CommentType[];
}

const createComment = async (
  newComment: Comment,
  postId: number,
  userId?: string,
  author?: string
): Promise<CommentType[]> => {
  if (!userId || !author) {
    throw new Error("You must be logged in to comment");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      content: newComment.content,
      post_id: postId,
      parent_comment_id: newComment.parent_comment_id,
      user_id: userId,
      author: author,
    })
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message);
  }

  return data as CommentType[];
};

const fetchComments = async (postId: number): Promise<CommentType[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  return data as CommentType[];
};

export const CommentSection = ({ postId }: Props) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<CommentType[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  useEffect(() => {
    const channel = supabase
      .channel(`comments:postId=${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const { mutate, isPending, isError, error: mutationError } = useMutation({
    mutationFn: (newComment: Comment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata?.user_name ||  user?.email?.split('@')[0] || "Anonymous"
      ),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData(['comments', postId]);
      
      queryClient.setQueryData(['comments', postId], (old: CommentType[] | undefined) => {
        const optimisticComment = {
          id: Math.random(),
          content: newComment.content,
          post_id: postId,
          parent_comment_id: newComment.parent_comment_id,
          user_id: user?.id || '',
          author: user?.user_metadata?.user_name ||user?.email?.split('@')[0]|| 'Anonymous',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return old ? [...old, optimisticComment] : [optimisticComment];
      });
      
      return { previousComments };
    },
    onError: (_err, _newComment, context) => {
      queryClient.setQueryData(['comments', postId], context?.previousComments);
     
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setNewComment("");
    }
  });
   
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    mutate({ content: newComment, parent_comment_id: null });
  };

  const buildCommentTree = (
    flatComments: CommentType[]
  ): CommentType[] => {
    const commentMap = new Map<number, CommentType>();
    const roots: CommentType[] = [];

    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    flatComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.children?.push(commentMap.get(comment.id)!);
        }
      } else {
        roots.push(commentMap.get(comment.id)!);
      }
    });

    return roots;
  };
  
  if (isLoading) return <div className="text-center">Loading comments...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  const commentTree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="space-y-4">
      {isError && (
        <div className="p-2 text-red-500 bg-red-50 rounded">
          Error: {mutationError instanceof Error ? mutationError.message : "Failed to post comment"}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            onChange={(e) => setNewComment(e.target.value)}
            value={newComment}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
            placeholder="Write your comment..."
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isPending}
              className={`px-4 py-2 rounded-lg text-gray-500 font-medium ${
                !newComment.trim() || isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 text-center text-gray-600 bg-gray-100 rounded-lg">
          Please <span   onClick={() => navigate("/")} className="text-blue-600">sign in </span>to post a comment.
        </div>
      )}

      <div className="space-y-6">
        {commentTree.length > 0 ? (
          commentTree.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};