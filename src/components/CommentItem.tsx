import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { CommentType } from "./CommentSection";

interface Props {
  comment: CommentType;
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
): Promise<CommentType[]> => {
  if (!userId || !author) {
    throw new Error("You must be logged in to reply");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      content: replyContent,
      post_id: postId,
      parent_comment_id: parentCommentId,
      user_id: userId,
      author: author,
    })
    .select();

  if (error) throw new Error(error.message);
  return data as CommentType[];
};

const deleteComment = async (commentId: number): Promise<void> => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isCurrentUser = user?.id === comment.user_id;

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.selectionStart = editTextareaRef.current.value.length;
    }
  }, [isEditing]);

  const replyMutation = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata?.user_name || "Anonymous"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setNewReply("");
      setShowReply(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateComment(comment.id, editedContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    replyMutation.mutate(newReply);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedContent.trim() || editedContent === comment.content) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="mb-4 ml-4 border-l-2 border-gray-200 pl-4">
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start">
          <div className="text-sm text-blue-500 font-semibold">
            {comment.author}
          </div>
          {isCurrentUser && !isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Edit comment"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700"
                title="Delete comment"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mt-1">
            <textarea
              ref={editTextareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editedContent.trim() || updateMutation.isPending}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-gray-800">{comment.content}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(comment.created_at).toLocaleString()}
              {comment.updated_at && new Date(comment.updated_at) > new Date(comment.created_at) && (
                <span className="ml-1">(edited)</span>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="mt-2">
          <button
            onClick={() => setShowReply((prev) => !prev)}
            className="text-xs text-blue-500 hover:underline mr-2"
          >
            {showReply ? "Cancel" : "Reply"}
          </button>

          {showReply && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
              <input
                onChange={(e) => setNewReply(e.target.value)}
                value={newReply}
                className="flex-1 p-2 border border-gray-300 text-black rounded text-sm"
                placeholder="Write a reply..."
              />
              <button
                disabled={!newReply.trim() || replyMutation.isPending}
                type="submit"
                className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
              >
                {replyMutation.isPending ? "..." : "Reply"}
              </button>
            </form>
          )}
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-xs text-blue-500 hover:underline"
          >
            {isCollapsed
              ? `Show replies (${comment.children.length})`
              : "Hide replies"}
          </button>
          {!isCollapsed && (
            <div className="mt-2 space-y-3">
              {comment.children.map((child) => (
                <CommentItem key={child.id} comment={child} postId={postId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const updateComment = async (
  commentId: number,
  newContent: string
): Promise<CommentType[]> => {
  const { data, error } = await supabase
    .from("comments")
    .update({ 
      content: newContent,
      updated_at: new Date().toISOString()
    })
    .eq("id", commentId)
    .select();

  if (error) throw new Error(error.message);
  return data as CommentType[];
};