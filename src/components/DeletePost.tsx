import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useNavigate, useParams } from "react-router";

export const DeletePost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // ✅ New state

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("author_id")
          .eq("id", id)
          .single();

        if (postError) throw postError;

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Not authenticated");

        setAuthorized(user.id === post?.author_id);
      } catch (err) {
        console.error("Authorization error:", err);
        setError(err instanceof Error ? err.message : "Authorization failed");
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [id]);

  const handleDelete = async () => {
    if (!authorized || !id) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("image_url")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      if (post?.image_url) {
        const imagePath = post.image_url.includes("posts-image/")
          ? post.image_url.split("posts-image/")[1]
          : post.image_url;

        const { error: storageError } = await supabase.storage
          .from("posts-image")
          .remove([imagePath]);

        if (storageError) console.warn("Image delete failed:", storageError.message);
      }

      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("post_id", id);
      if (commentsError) console.warn("Comment delete failed:", commentsError.message);

      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;

      setSuccess(true); // ✅ Show success message

      // Navigate after 2 seconds
      setTimeout(() => {
        navigate("/", {
          state: { message: "Post deleted successfully" },
          replace: true,
        });
      }, 2000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Something went wrong while deleting the post.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!id) return <div>Post ID not provided</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!authorized) return <div>You are not authorized to delete this post.</div>;

  return (
    <div className="align-middle flex flex-col items-center justify-center p-6 text-white rounded-lg shadow-md">
      {success ? (
        <div className="bg-green-600 text-white px-4 py-2 rounded mb-4">
          Post deleted successfully. Redirecting...
        </div>
      ) : (
        <>
          <p className="mb-4">
            Are you sure you want to delete this post and its associated image?
          </p>
          {error && <div className="text-red-500 my-2">{error}</div>}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Post"}
          </button>
        </>
      )}
    </div>
  );
};
