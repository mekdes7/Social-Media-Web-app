import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";

interface CommunityInput {
    name: string;
    description: string;
}
const createCommunity = async (community: CommunityInput) => {
    const {error,data}=await supabase.from("communities").insert((community));
    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export const CreateCommunity = () => {
   const [name, setName] = useState<string>("");
   const [description, setDescription] = useState<string>("");
   const navigate =useNavigate();
   const queryClient = useQueryClient();
        const { mutate, isPending, isError, isSuccess } = useMutation({
            mutationFn: (createCommunity),
            onSuccess: () => {
                setTimeout(() => {
                    queryClient.invalidateQueries({queryKey:["communities"]});
                    setName("");
                    setDescription("");
                    isSuccess && alert("Community created successfully!");
                  navigate("/communities");
                }, 2000);
              }           
           
              
          });
        
          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            mutate({ name,description });       
           
          };
   
    return (
        <div className="flex flex-col justify-center items-center gap-4 p-4">
          
            <div className="w-full max-w-xl bg-white shadow-blue-950 shadow-sm rounded-lg p-8 pb-12 mb-4 hover:shadow-lg transition-shadow duration-300">
              
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Community Name"id="name"
                     className="border border-gray-300 rounded-lg p-2 text-black"
                     required 
                     onChange={(e) => setName(e.target.value)}
                     value={name}
                     />
                     
                    <textarea placeholder="Description" id="description"
                    className="border border-gray-300 rounded-lg p-2 text-black" required
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    ></textarea>
                    <button type="submit" className="bg-blue-500 text-white rounded-lg p-2">Create Community</button>
               {isError && <p className="text-red-500">Error creating community</p>}
                    {isPending && <p className="text-blue-500">Creating community...</p>}
                    {isSuccess && <p className="text-green-500">Community created successfully!</p>}
                </form>
                
            </div>
            <p className="text-center mb-8">Once created, you can start posting and sharing!</p>        
        </div>
    )
}