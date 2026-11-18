import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Search, Swords, BookOpen, Heart, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-red-400 font-semibold'
      : 'text-gray-300 hover:text-red-400';

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/search', label: 'Search', icon: <Search size={16} /> },
    { to: '/battle', label: 'Arena', icon: <Swords size={16} /> },
    { to: '/diary', label: 'Diary', icon: <BookOpen size={16} /> },
    ...(user ? [{ to: '/watchlist', label: 'Watchlist', icon: <Heart size={16} /> }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-950/60 shadow-[0_4px_20px_rgba(239,68,68,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-rose-400 tracking-wider flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]"
        >
          🎬 CineSphere
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-5 items-center text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 transition-colors ${isActive(link.to)}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 transition-colors ${isActive('/profile')}`}
              >
                <User size={16} /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-sm"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold px-4 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-sm"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-t border-neutral-900 px-4 py-4 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-red-950/50 text-red-400 border border-red-900/40'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}

          <div className="mt-2 pt-2 border-t border-neutral-900">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/profile'
                      ? 'bg-red-950/50 text-red-400 border border-red-900/40'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <User size={16} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40 transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm shadow-md transition"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
