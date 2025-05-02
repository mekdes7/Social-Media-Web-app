import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Link } from "react-router-dom";
export interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
}
export const fetchCommunities = async () => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const CommunityList = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  if (isLoading) return <div>Loading communities...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Communities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((community) => (
          <Link
            key={community.id}
            to={`/community/${community.id}`}
            className="block text-black bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold mb-2">{community.name}</h2>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <p className="text-sm text-gray-400">
              Created: {new Date(community.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};