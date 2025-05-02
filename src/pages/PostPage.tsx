import { useParams } from "react-router-dom"
import { PostDetails } from "../components/PostDatails"


export const PostPage = () => {
    const {id}=useParams<{id:string}>()
  return (
    <div className="bg-blue-500 min-h-screen py-6 px-4">
    <PostDetails postId={Number(id)}/>
    
   


    </div>
  )
}
