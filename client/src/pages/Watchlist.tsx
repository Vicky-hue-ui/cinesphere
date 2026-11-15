import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../services/tmdb';
import { Film, Trash2, ArrowRight } from 'lucide-react';

const Watchlist = () => {
  const { user } = useAuth();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <Film size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Vault Locked</h2>
        <p className="text-neutral-400 text-sm max-w-sm mb-6">
          Please log in to inspect your preserved cinematic titles and watchlist.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition"
        >
          Login to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
          <div>
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Personal Collection
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
              🎬 My Watchlist
            </h1>
          </div>
          <span className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
            {watchlist.length} Saved {watchlist.length === 1 ? 'Title' : 'Titles'}
          </span>
        </div>

        {watchlist.length === 0 ? (
          <div className="py-24 text-center bg-neutral-950/70 border border-neutral-900 rounded-3xl max-w-lg mx-auto p-8 shadow-xl">
            <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-200 mb-1">Your Watchlist is Empty</h3>
            <p className="text-xs text-neutral-500 mb-6">
              Browse movies from the home catalog or search page and tap "+ Watchlist" to save them.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition"
            >
              Browse Movies <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {watchlist.map((item: any) => (
              <div
                key={item._id}
                className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 hover:border-red-600/60 shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <Link to={`/movie/${item.movieId}`}>
                  <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={
                        item.poster
                          ? `${TMDB_IMAGE_BASE}${item.poster}`
                          : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={item.movieTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-bold text-sm text-gray-100 group-hover:text-red-400 transition-colors truncate">
                      {item.movieTitle}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-red-400 font-semibold">
                        ★ {item.rating ? Number(item.rating).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-neutral-500">
                        {item.releaseDate?.slice(0, 4) || 'Movie'}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => removeFromWatchlist(item.movieId)}
                  className="absolute top-2.5 right-2.5 z-30 bg-black/80 hover:bg-red-600 text-white p-2 rounded-full border border-neutral-700/60 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm"
                  title="Remove from watchlist"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
