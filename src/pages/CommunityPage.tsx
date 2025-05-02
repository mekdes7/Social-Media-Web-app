import { useParams } from "react-router";
import { CommunityDisplay } from "../components/CommunityDisplay";

export const CommunityPage = () => {
  const {id}=useParams<{id:string}>()
  return (
    <div className="flex flex-row items-center justify-center p-6 gap-6">
      
      <CommunityDisplay communityId={Number(id)} />
    </div>
  );
}