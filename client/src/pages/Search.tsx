import { useState, useEffect } from 'react';
import { searchMovies, getTrending } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon, X, Sparkles, Flame, TrendingUp } from 'lucide-react';

const POPULAR_SEARCH_TAGS = [
  'Avatar',
  'Batman',
  'Spider-Man',
  'Avengers',
  'Interstellar',
  'Oppenheimer',
  'Dune',
  'John Wick',
];

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pre-load trending movies as interactive recommendations
  useEffect(() => {
    getTrending()
      .then((res) => {
        setTrendingSuggestions(res.data.results?.slice(0, 10) || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchMovies(searchTerm.trim());
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    executeSearch(tag);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background ambient red glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-red-600/15 via-red-950/5 to-transparent pointer-events-none blur-3xl" />

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2">
            <Sparkles size={14} /> Instant Movie Discovery
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Cinematic Universe</span>
          </h1>
          <p className="text-neutral-400 text-sm md:text-base">
            Explore millions of movies, trailers, ratings, and cast members across the globe.
          </p>
        </div>

        {/* Interactive 3D Red-Glow Search Bar */}
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 opacity-30 group-hover:opacity-75 blur-md transition duration-500 group-focus-within:opacity-100" />

            <div className="relative flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden px-4 py-2 shadow-2xl">
              <SearchIcon className="w-5 h-5 text-red-500 ml-2 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies by title, franchise, or character..."
                className="w-full bg-transparent text-white placeholder:text-neutral-600 text-sm md:text-base outline-none py-2"
                autoFocus
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full text-neutral-500 hover:text-white mr-2 transition"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all flex-shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-14">
          <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1 mr-1">
            <Flame size={13} className="text-red-500" /> Popular:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600/50 hover:bg-neutral-800 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Dynamic Search Results */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Searching the movie database...</p>
          </div>
        ) : searched ? (
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
              <h2 className="text-xl font-bold text-white">
                Results for <span className="text-red-400">"{query}"</span>
              </h2>
              <span className="text-xs text-neutral-500">
                {results.length} movie{results.length === 1 ? '' : 's'} found
              </span>
            </div>

            {results.length === 0 ? (
              <div className="py-24 text-center bg-neutral-950/60 rounded-3xl border border-neutral-900 max-w-lg mx-auto">
                <p className="text-lg font-bold text-neutral-300 mb-1">No movies matched your search</p>
                <p className="text-xs text-neutral-500 mb-6">Try checking your spelling or search for popular titles above.</p>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white transition"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Recommended / Trending Section when nothing has been searched yet */
          <div>
            <div className="flex items-center gap-2 mb-8 pb-3 border-b border-neutral-900">
              <TrendingUp className="text-red-500" size={20} />
              <h2 className="text-xl font-bold text-white tracking-wide">
                Trending Right Now
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {trendingSuggestions.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

