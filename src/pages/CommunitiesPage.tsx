import { CommunityList } from "../components/CommunityList"

export const CommunitiesPage = () => {
    return (
        <>
            <div className="bg-gray-200 text-black">
            <p className="text-center mb-8">Join a community and start sharing!</p>
            
            <CommunityList />
            </div>
        </>
    )
}