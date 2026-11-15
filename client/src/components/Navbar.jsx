import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-950/60 shadow-[0_4px_20px_rgba(239,68,68,0.15)] px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-rose-400 tracking-wider flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
        🎬 CineSphere
      </Link>

      <div className="flex gap-5 sm:gap-6 items-center text-sm font-medium">
        <Link to="/" className="text-gray-300 hover:text-red-400 transition-colors">Home</Link>
        <Link to="/search" className="text-gray-300 hover:text-red-400 transition-colors">Search</Link>
        <Link to="/battle" className="text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1">
          <span>⚔️</span> Arena
        </Link>
        <Link to="/diary" className="text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1">
          <span>📖</span> Diary
        </Link>
        {user && (
          <Link to="/watchlist" className="text-gray-300 hover:text-red-400 transition-colors">Watchlist</Link>
        )}
        {user ? (
          <>
            <Link to="/profile" className="text-gray-300 hover:text-red-400 transition-colors">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/profile"
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

