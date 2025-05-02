import { useState } from "react";
import { Link } from "react-router-dom";

import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";


export const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { signOut, user } = useAuth();
 

  const displayName = user?.user_metadata.user_name || user?.email?.split;

  return (
    <nav
      className= 'absolute top-0 left-0 w-full p-4 z-10'
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between md:justify-between">
       
        <div className="md:hidden">
          {user && (
            <Link
              to="/profile"
              className="flex items-center space-x-2 hover:opacity-80"
            >
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{displayName}</span>
            </Link>
          )}
        </div>

     
        <div className="flex-1 text-center md:text-left">
          <Link to="/" className="font-mono text-xl font-bold text-white">
            Get Connected
          </Link>
        </div>

        
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-7"
          >
            <img className="invert" src={mobileMenuOpen ? assets.close : assets.open} />
          </button>
        </div>

        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/">Home</Link>
          <Link to="/create">Create Post</Link>
          <Link to="/communities">Communities</Link>
          <Link to="/community/create">Create Community</Link>
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 hover:opacity-80"
              >
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{displayName}</span>
              </button>

              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 p-4 `}
                >

                  <button
                    onClick={() => {
                     
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left py-1 hover:underline"
                  >
                   
                  </button>

                  <button
                    onClick={() => {
                      signOut();
                      setShowProfileMenu(false);
                    }}
                    className="block text-right w-full  py-1 text-red-500 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

     
      {mobileMenuOpen && (
        <div
          className='w-full p-4 flex flex-col items-center space-y-4 mt-2'
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/create" onClick={() => setMobileMenuOpen(false)}>
            Create Post
          </Link>
          <Link to="/communities" onClick={() => setMobileMenuOpen(false)}>
            Communities
          </Link>
          <Link
            to="/community/create"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create Community
          </Link>
        </div>
      )}
    </nav>
  );
};
