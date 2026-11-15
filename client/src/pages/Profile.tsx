import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { SignInCard } from '../components/ui/sign-in-card-2';
import { Link } from 'react-router-dom';
import {
  LogOut,
  Film,
  Sparkles,
  Play,
  Heart,
  Settings,
  Tv,
  CheckCircle2,
  Trash2,
  Eye,
  Crown,
  Volume2
} from 'lucide-react';
import { TMDB_IMAGE_BASE } from '../services/tmdb';

const NETFLIX_AVATARS = [
  { id: 'classic-red', bg: 'bg-red-600', icon: '🍿', name: 'Movie Master' },
  { id: 'cyber-neon', bg: 'bg-blue-600', icon: '🤖', name: 'Sci-Fi Buff' },
  { id: 'dark-knight', bg: 'bg-neutral-800', icon: '🦇', name: 'Night Owl' },
  { id: 'skull-crimson', bg: 'bg-rose-700', icon: '💀', name: 'Horror Fan' },
  { id: 'golden-vip', bg: 'bg-amber-600', icon: '👑', name: 'VIP Cinephile' },
];

export const Profile = () => {
  const { user, logout } = useAuth();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  // Avatar customization state (persisted locally)
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('netflix_avatar_id') || 'classic-red';
  });
  const [maturityRating, setMaturityRating] = useState('ALL');
  const [playbackQuality, setPlaybackQuality] = useState('4K Ultra HD');
  const [autoPlayTrailers, setAutoPlayTrailers] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' | 'settings' | 'profiles'

  if (!user) {
    return <SignInCard />;
  }

  const currentAvatarObj =
    NETFLIX_AVATARS.find((a) => a.id === selectedAvatar) || NETFLIX_AVATARS[0];

  const handleSelectAvatar = (id: string) => {
    setSelectedAvatar(id);
    localStorage.setItem('netflix_avatar_id', id);
  };

  return (
    <div className="min-h-screen bg-black text-white relative pb-20 selection:bg-red-600 selection:text-white">
      {/* Netflix Cinematic Hero Banner / Backdrop */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-red-950/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        
        {/* Dynamic decorative backdrop mosaic */}
        {watchlist.length > 0 && watchlist[0].poster ? (
          <img
            src={`${TMDB_IMAGE_BASE}${watchlist[0].poster}`}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-neutral-950 to-black" />
        )}

        {/* Ambient Red Glow */}
        <div className="absolute -top-24 left-1/3 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Main Profile Shell */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 -mt-28 md:-mt-36">
        
        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Netflix-style Avatar with Glow */}
            <div className="relative group cursor-pointer">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ${currentAvatarObj.bg} flex items-center justify-center text-4xl sm:text-5xl border-4 border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.4)] transition-transform duration-300 group-hover:scale-105`}
                >
                  {currentAvatarObj.icon}
                </div>
              )}
              <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-black" title="Active Member" />
            </div>

            {/* User Credentials & Badges */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="bg-red-600/30 border border-red-500/50 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Crown size={12} /> CinePass Premium
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                {user.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-red-500" /> {watchlist.length} In My List
                </span>
                <span>•</span>
                <span className="text-neutral-400 flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-400" /> Ultra HD Plan
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/watchlist"
              className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-600/60 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
            >
              <Film size={15} className="text-red-500" /> Full Watchlist
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Netflix Navigation Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-neutral-900 pb-3">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`text-sm font-bold flex items-center gap-2 transition pb-2 relative ${
              activeTab === 'watchlist'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film size={16} className={activeTab === 'watchlist' ? 'text-red-500' : ''} />
            My List ({watchlist.length})
            {activeTab === 'watchlist' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`text-sm font-bold flex items-center gap-2 transition pb-2 relative ${
              activeTab === 'profiles'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'profiles' ? 'text-red-500' : ''} />
            Switch Avatar
            {activeTab === 'profiles' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`text-sm font-bold flex items-center gap-2 transition pb-2 relative ${
              activeTab === 'settings'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Settings size={16} className={activeTab === 'settings' ? 'text-red-500' : ''} />
            Playback & Experience
            {activeTab === 'settings' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </button>
        </div>

        {/* TAB 1: MY LIST / WATCHLIST (Netflix Carousel & Grid) */}
        {activeTab === 'watchlist' && (
          <div className="py-6">
            {watchlist.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/50">
                <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Your List is Empty</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5">
                  Explore trending movies and add them to your cinematic vault for quick streaming.
                </p>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition inline-flex items-center gap-2"
                >
                  <Play size={14} fill="currentColor" /> Browse Trending Movies
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.map((item: any) => (
                  <div
                    key={item.movieId || item._id}
                    className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 hover:border-red-600/80 transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_25px_rgba(220,38,38,0.3)] flex flex-col"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                      {item.poster ? (
                        <img
                          src={`${TMDB_IMAGE_BASE}${item.poster}`}
                          alt={item.movieTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <Film size={24} />
                        </div>
                      )}

                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <Link
                          to={`/movie/${item.movieId}`}
                          className="w-full py-1.5 mb-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition"
                        >
                          <Play size={12} fill="currentColor" /> Details
                        </Link>
                        <button
                          onClick={() => removeFromWatchlist(item.movieId)}
                          className="w-full py-1.5 rounded-lg bg-neutral-900/90 hover:bg-red-950 text-neutral-300 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-1 border border-neutral-800 transition"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-red-400 transition">
                        {item.movieTitle}
                      </h4>
                      {item.rating && (
                        <span className="text-[10px] text-red-400 font-semibold mt-1">
                          ★ {Number(item.rating).toFixed(1)} / 10
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AVATAR CUSTOMIZER (Netflix Style Icon Picker) */}
        {activeTab === 'profiles' && (
          <div className="py-6">
            <h3 className="text-lg font-bold text-white mb-2">Choose Your CineSphere Persona</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Pick an iconic avatar for your account profile and discussions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {NETFLIX_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <div
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.id)}
                    className={`cursor-pointer rounded-2xl p-4 bg-neutral-950 border transition-all duration-300 flex flex-col items-center text-center group ${
                      isSelected
                        ? 'border-red-600 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105'
                        : 'border-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl ${av.bg} flex items-center justify-center text-4xl mb-3 shadow-md group-hover:scale-105 transition`}
                    >
                      {av.icon}
                    </div>
                    <span className="text-xs font-bold text-white mb-1">{av.name}</span>
                    {isSelected && (
                      <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PLAYBACK & STREAMING SETTINGS */}
        {activeTab === 'settings' && (
          <div className="py-6 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Streaming Preferences</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Configure your cinema experience, trailer autoplay, and visual settings.
            </p>

            <div className="space-y-4">
              {/* Autoplay setting */}
              <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 size={16} className="text-red-500" /> Autoplay Cinematic Previews
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Stream official scores and trailers when opening movie pages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlayTrailers}
                  onChange={(e) => setAutoPlayTrailers(e.target.checked)}
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                />
              </div>

              {/* Quality setting */}
              <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Tv size={16} className="text-red-500" /> Video & Trailer Quality
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Highest possible resolution for trailers and previews
                  </p>
                </div>
                <select
                  value={playbackQuality}
                  onChange={(e) => setPlaybackQuality(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-red-600"
                >
                  <option value="Auto">Auto (Recommended)</option>
                  <option value="1080p Full HD">1080p Full HD</option>
                  <option value="4K Ultra HD">4K Ultra HD</option>
                </select>
              </div>

              {/* Maturity rating */}
              <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Eye size={16} className="text-red-500" /> Maturity & Content Filter
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Display all movie ratings including R and TV-MA
                  </p>
                </div>
                <select
                  value={maturityRating}
                  onChange={(e) => setMaturityRating(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-red-600"
                >
                  <option value="ALL">Show All Ratings (Unrestricted)</option>
                  <option value="PG-13">PG-13 and below</option>
                  <option value="PG">PG and Family</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;