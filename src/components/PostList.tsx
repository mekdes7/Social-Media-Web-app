import { useQuery } from "@tanstack/react-query"
import { supabase } from "../supabase-client"
import { PostItem } from "./PostItem"
import { data } from "react-router"

export interface Post {
id: number
title: string
content: string
created_at: string
image_url: string
avatar_url?: string 
author_name?: string; 
author_email?: string
like_count: number
dislike_count: number
comment_count: number
community?: {
    name: string;
  };
}
const fetchPosts = async ():Promise<Post[]> => {
    const {data,error}= await supabase.rpc("get_posts_with_counts")
   
 if(error) {
    throw new Error(error.message)
 }
    if(!data) {
        throw new Error('No data found')
    }
    return data
}
console.log(data)
export const PostList = () => {
    const {data, error, isLoading}=useQuery<Post[],Error>({queryKey:['posts'],queryFn:fetchPosts})
       if(isLoading) {
        return <div className="text-center">Loading...</div>
         }
    if(error) {
        return <div className="text-center">Error: {error.message}</div>
    }
    console.log(data) 
    return <div className="flex flex-col justify-center items-center gap-4 p-4">
{data?.map((post,key) => (
      <PostItem post={post} key={key} />
    ))}
    </div>
}