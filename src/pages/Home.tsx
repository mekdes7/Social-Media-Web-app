import { useEffect, useState } from "react";
import { PostList } from "../components/PostList";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";
import { UserCircle2, LogOut, Github, Mail } from "lucide-react";

export const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-blue-600 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to ConnectHub </h1>
          <p className="mb-6 text-gray-600">Join and share your thoughts with the community</p>

          <button
            onClick={() => handleLogin("google")}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
          >
            <Mail size={18} /> Sign in with Google
          </button>

          <button
            onClick={() => handleLogin("github")}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg transition"
          >
            <Github size={18} /> Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-3xl mx-auto">
       
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserCircle2 size={40} className="text-blue-500" />
            <div>
              <p className="font-semibold text-gray-800">
                {user.user_metadata?.user_name || user.email?.split("@")[0]}
              </p>
              <p className="text-sm text-gray-500">You're logged in</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 bg-white text-blue-500 font-semibold rounded-lg shadow hover:bg-blue-100 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

      
        <div className="bg-white rounded-xl p-4 mb-6 shadow text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">📰 Recent Posts</h2>
          <p className="text-sm text-gray-500">Explore what others are sharing today</p>
        </div>

       
        <div className="space-y-6">
          <PostList />
        </div>
      </div>
    </div>
  );
};
