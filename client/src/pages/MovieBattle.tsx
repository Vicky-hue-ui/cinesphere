import React, { useState } from 'react';
import { TMDB_IMAGE_BASE, searchMovies, getMovieDetails } from '../services/tmdb';
import { Swords, Search, Trophy, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MovieBattle: React.FC = () => {
  // Movie 1 State
  const [query1, setQuery1] = useState('');
  const [results1, setResults1] = useState<any[]>([]);
  const [movie1, setMovie1] = useState<any>(null);

  // Movie 2 State
  const [query2, setQuery2] = useState('');
  const [results2, setResults2] = useState<any[]>([]);
  const [movie2, setMovie2] = useState<any>(null);

  const handleSearch1 = async (q: string) => {
    setQuery1(q);
    if (!q.trim()) {
      setResults1([]);
      return;
    }
    try {
      const res = await searchMovies(q);
      setResults1(res.data.results?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch2 = async (q: string) => {
    setQuery2(q);
    if (!q.trim()) {
      setResults2([]);
      return;
    }
    try {
      const res = await searchMovies(q);
      setResults2(res.data.results?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectMovie1 = async (m: any) => {
    setResults1([]);
    setQuery1(m.title);
    try {
      const res = await getMovieDetails(m.id);
      setMovie1(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectMovie2 = async (m: any) => {
    setResults2([]);
    setQuery2(m.title);
    try {
      const res = await getMovieDetails(m.id);
      setMovie2(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to determine winner styling
  const getWinnerBadge = (val1: number, val2: number, higherIsBetter = true) => {
    if (!val1 && !val2) return null;
    if (val1 === val2) return 'tie';
    if (higherIsBetter) return val1 > val2 ? 'm1' : 'm2';
    return val1 < val2 ? 'm1' : 'm2';
  };

  const ratingWinner = movie1 && movie2 ? getWinnerBadge(movie1.vote_average, movie2.vote_average) : null;
  const runtimeWinner = movie1 && movie2 ? getWinnerBadge(movie1.runtime, movie2.runtime) : null;
  const revenueWinner = movie1 && movie2 ? getWinnerBadge(movie1.revenue, movie2.revenue) : null;
  const voteCountWinner = movie1 && movie2 ? getWinnerBadge(movie1.vote_count, movie2.vote_count) : null;

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Swords size={14} className="text-red-500" /> CineSphere Arena
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Head-to-Head Movie Battle
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Compare box office returns, critic ratings, running time, and accolades side-by-side.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Fighter 1 Search */}
        <div className="relative bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <label className="text-xs font-bold uppercase tracking-wider text-red-500 block mb-2">
            Contender 1
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search movie 1 (e.g., Oppenheimer)..."
              value={query1}
              onChange={(e) => handleSearch1(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          {results1.length > 0 && (
            <div className="absolute left-5 right-5 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl z-30">
              {results1.map((m) => (
                <div
                  key={m.id}
                  onClick={() => selectMovie1(m)}
                  className="p-2.5 hover:bg-red-950/40 cursor-pointer flex items-center gap-3 transition"
                >
                  <div className="w-8 h-11 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                    {m.poster_path && (
                      <img src={`${TMDB_IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-neutral-400">{m.release_date?.split('-')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fighter 2 Search */}
        <div className="relative bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <label className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-2">
            Contender 2
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search movie 2 (e.g., Barbie)..."
              value={query2}
              onChange={(e) => handleSearch2(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-rose-600 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          {results2.length > 0 && (
            <div className="absolute left-5 right-5 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl z-30">
              {results2.map((m) => (
                <div
                  key={m.id}
                  onClick={() => selectMovie2(m)}
                  className="p-2.5 hover:bg-red-950/40 cursor-pointer flex items-center gap-3 transition"
                >
                  <div className="w-8 h-11 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                    {m.poster_path && (
                      <img src={`${TMDB_IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-neutral-400">{m.release_date?.split('-')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Arena */}
      {(!movie1 || !movie2) ? (
        <div className="text-center py-20 border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/40">
          <Swords className="w-16 h-16 text-neutral-600 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Select Two Films to Clash</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
            Pick both contenders above to generate the Amazon product-comparison matrix with winner badges.
          </p>
        </div>
      ) : (
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Posters Banner */}
          <div className="grid grid-cols-2 divide-x divide-neutral-900 border-b border-neutral-900 p-6 sm:p-8 bg-gradient-to-b from-neutral-900/40 to-transparent">
            {/* Contender 1 Header */}
            <div className="text-center px-4">
              <div className="w-32 sm:w-44 aspect-[2/3] mx-auto rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(239,68,68,0.3)] border-2 border-red-600/70 mb-4 bg-neutral-900">
                {movie1.poster_path ? (
                  <img src={`${TMDB_IMAGE_BASE}${movie1.poster_path}`} alt={movie1.title} className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-12 h-12 text-neutral-600 m-auto mt-14" />
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">{movie1.title}</h2>
              <p className="text-xs text-neutral-400 mt-1 italic">"{movie1.tagline || 'In theaters worldwide'}"</p>
              <Link to={`/movie/${movie1.id}`} className="mt-3 inline-block text-xs text-red-400 font-bold hover:underline">
                View Full Dossier →
              </Link>
            </div>

            {/* Contender 2 Header */}
            <div className="text-center px-4">
              <div className="w-32 sm:w-44 aspect-[2/3] mx-auto rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(244,63,94,0.3)] border-2 border-rose-600/70 mb-4 bg-neutral-900">
                {movie2.poster_path ? (
                  <img src={`${TMDB_IMAGE_BASE}${movie2.poster_path}`} alt={movie2.title} className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-12 h-12 text-neutral-600 m-auto mt-14" />
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">{movie2.title}</h2>
              <p className="text-xs text-neutral-400 mt-1 italic">"{movie2.tagline || 'In theaters worldwide'}"</p>
              <Link to={`/movie/${movie2.id}`} className="mt-3 inline-block text-xs text-rose-400 font-bold hover:underline">
                View Full Dossier →
              </Link>
            </div>
          </div>

          {/* Comparison Specs Table */}
          <div className="divide-y divide-neutral-900 text-xs sm:text-sm">
            {/* Metric: Rating */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={ratingWinner === 'm1' ? 'text-red-400 text-base font-black' : 'text-neutral-300'}>
                  ★ {movie1.vote_average ? movie1.vote_average.toFixed(1) : 'N/A'} / 10
                </span>
                {ratingWinner === 'm1' && <Trophy size={16} className="text-amber-400" />}
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                TMDB Rating
              </div>
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={ratingWinner === 'm2' ? 'text-rose-400 text-base font-black' : 'text-neutral-300'}>
                  ★ {movie2.vote_average ? movie2.vote_average.toFixed(1) : 'N/A'} / 10
                </span>
                {ratingWinner === 'm2' && <Trophy size={16} className="text-amber-400" />}
              </div>
            </div>

            {/* Metric: Box Office Revenue */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={revenueWinner === 'm1' ? 'text-emerald-400 font-bold' : 'text-neutral-300'}>
                  {movie1.revenue ? `$${(movie1.revenue / 1e6).toFixed(1)}M` : 'Undisclosed'}
                </span>
                {revenueWinner === 'm1' && <Trophy size={16} className="text-amber-400" />}
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                Worldwide Box Office
              </div>
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={revenueWinner === 'm2' ? 'text-emerald-400 font-bold' : 'text-neutral-300'}>
                  {movie2.revenue ? `$${(movie2.revenue / 1e6).toFixed(1)}M` : 'Undisclosed'}
                </span>
                {revenueWinner === 'm2' && <Trophy size={16} className="text-amber-400" />}
              </div>
            </div>

            {/* Metric: Total Votes */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={voteCountWinner === 'm1' ? 'text-red-400' : 'text-neutral-300'}>
                  {movie1.vote_count?.toLocaleString()} votes
                </span>
                {voteCountWinner === 'm1' && <Trophy size={16} className="text-amber-400" />}
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                Fan Community Votes
              </div>
              <div className="text-center font-bold flex items-center justify-center gap-1.5">
                <span className={voteCountWinner === 'm2' ? 'text-rose-400' : 'text-neutral-300'}>
                  {movie2.vote_count?.toLocaleString()} votes
                </span>
                {voteCountWinner === 'm2' && <Trophy size={16} className="text-amber-400" />}
              </div>
            </div>

            {/* Metric: Runtime */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center font-bold text-neutral-300 flex items-center justify-center gap-1.5">
                <span className={runtimeWinner === 'm1' ? 'text-red-400' : 'text-neutral-300'}>
                  {movie1.runtime ? `${Math.floor(movie1.runtime / 60)}h ${movie1.runtime % 60}m` : 'N/A'}
                </span>
                {runtimeWinner === 'm1' && <Trophy size={16} className="text-amber-400" />}
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                Running Time
              </div>
              <div className="text-center font-bold text-neutral-300 flex items-center justify-center gap-1.5">
                <span className={runtimeWinner === 'm2' ? 'text-rose-400' : 'text-neutral-300'}>
                  {movie2.runtime ? `${Math.floor(movie2.runtime / 60)}h ${movie2.runtime % 60}m` : 'N/A'}
                </span>
                {runtimeWinner === 'm2' && <Trophy size={16} className="text-amber-400" />}
              </div>
            </div>

            {/* Metric: Release Date */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center text-neutral-300">
                {movie1.release_date || 'N/A'}
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                Theatrical Premiere
              </div>
              <div className="text-center text-neutral-300">
                {movie2.release_date || 'N/A'}
              </div>
            </div>

            {/* Metric: Genres */}
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-neutral-900/30 transition">
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {movie1.genres?.map((g: any) => (
                    <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                Genres & Categories
              </div>
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {movie2.genres?.map((g: any) => (
                    <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieBattle;
