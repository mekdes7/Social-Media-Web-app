import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { FaThumbsUp } from "react-icons/fa"; 

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

const vote = async (voteValue: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);
  if (error) throw new Error(error.message);
  return data as Vote[];
};

export const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [voteCounts, setVoteCounts] = useState({ likes: 0, dislikes: 0 });

  const { data: votes, isLoading, error } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 3000, 
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("You must be logged in to vote");
      return vote(voteValue, postId, user.id);
    },
    onMutate: (voteValue: number) => {
        setUserVote((prev) => (prev === voteValue ? 0 : (voteValue as 1 | -1)));

      setVoteCounts((prev) => {
        let likes = prev.likes;
        let dislikes = prev.dislikes;

        if (userVote === 1) likes--; // undo previous like
        if (userVote === -1) dislikes--; // undo previous dislike

        if (voteValue === 1) likes++;
        if (voteValue === -1) dislikes++;

        return { likes, dislikes };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  useEffect(() => {
    if (votes && user) {
      const likes = votes.filter((v) => v.vote === 1).length;
      const dislikes = votes.filter((v) => v.vote === -1).length;
      const userVoteRecord = votes.find((v) => v.user_id === user.id)?.vote || 0;
      setVoteCounts({ likes, dislikes });
      setUserVote(userVoteRecord as 1 | -1 | 0);

    }
  }, [votes, user]);

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center">Error: {error.message}</div>;

 

  return (
    <div className="flex items-center gap-1">
      {/* Like button */}
      <button
        onClick={() => mutate(1)}
        className={`flex items-center gap-1 px-4 py-2 rounded-md hover:bg-gray-100 ${
          userVote === 1 ? "text-blue-500" : "text-gray-600"
        }`}
      >
        <FaThumbsUp className="w-5 h-5" />
        <span>{voteCounts.likes}</span>
      </button>

      {/* Dislike button */}
      <button
        onClick={() => mutate(-1)}
        className={`flex items-center gap-1 px-4 py-2 rounded-md hover:bg-gray-100 ${
          userVote === -1 ? "text-red-500" : "text-gray-600"
        }`}
      >
        <FaThumbsUp className="w-5 h-5 transform rotate-180" />
        <span>{voteCounts.dislikes}</span>
      </button>
    </div>
  );
};