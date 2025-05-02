import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
 

export const UpdatePost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setPost(postData);
      setTitle(postData.title);
      setContent(postData.content);

      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.id === postData.author_id) {
        setAuthorized(true);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async () => {
    if (!authorized) return alert("Not authorized");
  
    let imageUrl = post?.image_url || null;
  
    
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
      .from("posts-image")
      .upload(fileName, selectedFile);
      console.log("UploadData:", uploadData);
    
      if (uploadError) {
        console.error("UploadError:", uploadError.message);
        return alert("File upload failed");
      }
      
  
      const { data: publicUrlData } = supabase.storage
      .from("posts-image")
      .getPublicUrl(uploadData.path);
        console.log("PublicUrlData:", publicUrlData);    
  
      imageUrl = publicUrlData?.publicUrl;
    }
  
    const { error } = await supabase
      .from("posts")
      .update({ title, content, image_url: imageUrl })
      .eq("id", id);
  
    if (!error) {
      navigate(`/posts/${id}`);
      alert("Post updated successfully");

    } else {
      console.error(error);
      alert("Failed to update post");
    }
  };
  

  if (!post) return <div>Loading...</div>;
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4 text-black">Edit Post</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 mb-2 w-full text-black"
        placeholder="Title"
      />
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
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
      >
        Update
      </button>
    </div>
  );
};
