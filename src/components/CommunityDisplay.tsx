import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { Link } from "react-router-dom";

interface CommunityPost {
  id: number;
  created_at: string;
  title: string;
  content: string;
  image_url?: string;
  author_id: string;
  avatar_url?: string;
  author_name?: string;
  description: string;
  community_name: string;
  like_count: number;
  dislike_count: number;
  comment_count: number;
}

interface Props {
  communityId: number;
}

export const fetchCommunityPosts = async (communityId: number): Promise<CommunityPost[]> => {
  const { data, error } = await supabase
    .rpc("get_community_with_counts", { comm_id: communityId })
    .select("*");

  if (error) {
    console.error("Error fetching community posts:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};

export const CommunityDisplay = ({ communityId }: Props) => {
  const { data: posts, error, isLoading } = useQuery<CommunityPost[], Error>({
    queryKey: ["communityPosts", communityId],
    queryFn: () => fetchCommunityPosts(communityId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading posts: {error.message}</p>
        <Link
          to="/"
          className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {posts && posts.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {posts[0].community_name} Community
            </h1>
            
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  image_url: post.image_url || "",
                  created_at: post.created_at,
                  like_count: post.like_count,
                  dislike_count: post.dislike_count,
                  comment_count: post.comment_count,
                  author_name: post.author_name,
                  avatar_url: post.avatar_url,
                  community: {
                    name: post.community_name,
                  },
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No posts in this community yet
          </h2>
          <p className="text-gray-600 mb-6">
            Be the first to share something with the community!
          </p>
          <Link
            to={`/create`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Create First Post
          </Link>
        </div>
      )}
    </div>
  );
};
