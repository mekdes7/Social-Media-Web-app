import { CreateCommunity } from "../components/CreateCommunity"


export const CreateCommunityPage= () => {
    return (
       <>
       <div className="bg-gray-200 text-black">
              <h1 className="text-3xl font-bold text-center mb-4">Create a Community</h1>
              <p className="text-center mb-8">Share your thoughts with the world!</p>
            
       <CreateCommunity />
         </div>
       </>
    )
}