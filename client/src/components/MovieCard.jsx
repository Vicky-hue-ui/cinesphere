import { Link } from 'react-router-dom';
import { TMDB_IMAGE_BASE } from '../services/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';

const MovieCard = ({ movie }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { user } = useAuth();

  const inList = isInWatchlist(movie.id);

  const handleWatchlist = (e) => {
    e.preventDefault();
    if (!user) return;
    if (inList) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        movieId: movie.id,
        movieTitle: movie.title,
        poster: movie.poster_path,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
      });
    }
  };

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group relative rounded-2xl overflow-hidden bg-neutral-950/80 border border-neutral-800/80 hover:border-red-600/60 shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
        {/* Top glowing ambient highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-red-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
          <img
            src={
              movie.poster_path
                ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
            }
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        <div className="relative z-20 p-3.5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-100 group-hover:text-red-400 transition-colors truncate">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-red-400 font-semibold flex items-center gap-1">
              ★ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
            <span className="text-neutral-400">
              {movie.release_date?.slice(0, 4) || 'Movie'}
            </span>
          </div>
        </div>

        {user && (
          <button
            onClick={handleWatchlist}
            className="absolute top-2.5 right-2.5 z-30 bg-black/80 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-full border border-neutral-700/60 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm"
          >
            {inList ? '✓ Saved' : '+ Watchlist'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;

