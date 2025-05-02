import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import {supabase }from "../supabase-client";

interface AuthContextType {
    user:User | null;
    signInWithGithub: () =>Promise<void>;
    signOut: () =>Promise<void>;
}
const AuthContext=createContext<AuthContextType|undefined>(undefined)

export const AuthProvider=({children}:{children:React.ReactNode})=>{
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
});
},[user])
const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: "github" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

return <AuthContext.Provider value={{user,signInWithGithub,signOut}}>{children}</AuthContext.Provider>
}

export const useAuth=():AuthContextType=>{
    const context=useContext(AuthContext)
    if(context===undefined){
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}