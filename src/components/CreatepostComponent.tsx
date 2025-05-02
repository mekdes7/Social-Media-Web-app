import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Community, fetchCommunities } from "./CommunityList";

interface Post {
  title: string;
  content: string;
  avatar_url?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  author_id?: string | null;
  community_id?: number | null;
}

const createPost = async (post: Post, imageFile?: File) => {
  let imageUrl = null;

 
  if (imageFile) {
    const filePath = `posts/${post.title}/${Date.now()}/${imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("posts-image")
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicURLData } = await supabase.storage
      .from("posts-image")
      .getPublicUrl(filePath);

    imageUrl = publicURLData.publicUrl;
  }

  const { title, content, avatar_url, author_name, community_id } = post;

  const { data, error } = await supabase.from("posts").insert([
    {
      title,
      content,
      avatar_url: avatar_url ?? null,
      author_name: author_name ?? null,
      author_email: post.author_email ?? null,
      author_id: post.author_id,
      community_id: community_id ?? null,
      image_url: imageUrl ?? null,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const CreatepostComponent = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const { user } = useAuth();

  const { data: communities, isLoading, isError } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: { post: Post; imageFile?: File }) =>
      createPost(data.post, data.imageFile),
    onSuccess: () => {
      setTitle("");
      setContent("");
      setSelectedFile(null);
      setCommunityId(null);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!communityId) {
      alert("Please select a community.");
      return;
    }

    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url,
        author_name: user?.user_metadata.full_name || "Anonymous",
        author_email: user?.email || "No email",
        author_id: user?.id,
        community_id: communityId,
      },
      imageFile: selectedFile || undefined,
    });
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (isLoading) return <p>Loading communities...</p>;

  return (
    <div className="bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4 ">
          <label
            htmlFor="title"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Title:
          </label>
          <input
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            id="title"
            value={title}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Content:
          </label>
          <textarea
            onChange={(event) => setContent(event.target.value)}
            id="content"
            value={content}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Write your post content here"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Upload File (optional):
          </label>
          <input
            onChange={handleImageUpload}
            type="file"
            id="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="community"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Select Community:
          </label>
          <select
            onChange={handleCommunityChange}
            id="community"
            value={communityId ?? ""}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">--Choose a Community--</option>
            {communities?.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isPending ? "Creating..." : "Create Post"}
          </button>
        </div>

        {isError && <p className="text-red-500 text-center">Error creating post</p>}
        {isSuccess && (
          <p className="text-green-500 text-center">Post created successfully!</p>
        )}
      </form>
    </div>
  );
};

