import { useEffect, useState, useMemo } from 'react';
import {
  getTrending,
  getTrendingHindi,
  getGenres,
  getMoviesByGenre,
  getHindiMoviesByGenre,
  TMDB_IMAGE_BASE,
} from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import GlassyCarousel, { type GlassyCarouselItem } from '../components/ui/glassy-coverflow-carousel';

// Fallback high-res Unsplash cinematic posters if TMDB image isn't available
const FALLBACK_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80',
];

// Red and Black Theme definition matching Moviefy Dark Aesthetic
const redBlackCarouselTheme: React.CSSProperties = {
  '--color-background': '#000000',
  '--color-foreground': '#ffffff',
  '--color-card': '#0a0a0c',
  '--color-card-foreground': '#fca5a5',
  '--color-muted-foreground': '#9ca3af',
  '--color-border': 'rgba(220, 38, 38, 0.35)',
  '--color-primary': '#ef4444',
  '--color-primary-foreground': '#ffffff',
  '--carousel-background': 'radial-gradient(ellipse at 50% 20%, #1f0303 0%, #000000 70%)',
  '--carousel-shadow-color': '#dc2626',
} as React.CSSProperties;

const Home = () => {
  const [trending, setTrending] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreMovies, setGenreMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hindi / Bollywood content
  const [activeLanguageTab, setActiveLanguageTab] = useState<'all' | 'hindi'>('all');
  const [hindiMovies, setHindiMovies] = useState<any[]>([]);
  const [hindiLoading, setHindiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [trendingRes, genreRes] = await Promise.all([
          getTrending(),
          getGenres(),
        ]);
        setTrending(trendingRes.data.results || []);
        setGenres(genreRes.data.genres || []);
      } catch (err: any) {
        console.error('Failed to load TMDB movies:', err);
        setError(
          err.response?.data?.status_message ||
            'Unable to fetch movies from TMDB. Please check your network and API key.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Hindi movies when user switches to Hindi tab
  useEffect(() => {
    if (activeLanguageTab !== 'hindi' || hindiMovies.length > 0) return;
    const fetchHindi = async () => {
      try {
        setHindiLoading(true);
        const res = await getTrendingHindi();
        setHindiMovies(res.data.results || []);
      } catch (err) {
        console.error('Failed to load Hindi movies:', err);
      } finally {
        setHindiLoading(false);
      }
    };
    fetchHindi();
  }, [activeLanguageTab]);

  useEffect(() => {
    if (!selectedGenre) {
      setGenreMovies([]);
      return;
    }
    const fetchByGenre = async () => {
      try {
        setGenreLoading(true);
        const res =
          activeLanguageTab === 'hindi'
            ? await getHindiMoviesByGenre(selectedGenre)
            : await getMoviesByGenre(selectedGenre);
        setGenreMovies(res.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setGenreLoading(false);
      }
    };
    fetchByGenre();
  }, [selectedGenre, activeLanguageTab]);

  const displayMovies = selectedGenre
    ? genreMovies
    : activeLanguageTab === 'hindi'
    ? hindiMovies
    : trending;

  // Selected genre label
  const selectedGenreName = useMemo(() => {
    if (activeLanguageTab === 'hindi' && !selectedGenre) return '🎬 Bollywood Trending';
    if (!selectedGenre) return 'Trending This Week';
    const found = genres.find((g) => g.id === selectedGenre);
    return found ? `${found.name} Movies` : 'Selected Genre';
  }, [selectedGenre, genres, activeLanguageTab]);

  // Convert current filtered movies into Glassy 3D Carousel items
  const carouselItems: GlassyCarouselItem[] = useMemo(() => {
    const source = (displayMovies && displayMovies.length > 0) ? displayMovies.slice(0, 8) : [];
    return source.map((m: any, idx: number) => ({
      id: String(m.id || idx),
      title: m.title || 'Untitled',
      subtitle: `${m.release_date?.slice(0, 4) || '2024'} · Rating: ${m.vote_average ? m.vote_average.toFixed(1) : '7.5'} ★`,
      image: m.poster_path
        ? `${TMDB_IMAGE_BASE}${m.poster_path}`
        : FALLBACK_POSTERS[idx % FALLBACK_POSTERS.length],
      accent: idx % 2 === 0 ? '#ef4444' : '#dc2626',
      description: m.overview || 'Explore details and save to your personal watchlist.',
      href: `/movie/${m.id}`,
      linkLabel: 'View Movie Details',
      trailerUrl: 'https://www.youtube.com/watch?v=wb49-oV0F78',
    }));
  }, [displayMovies]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 3D Glassy Coverflow Carousel Section */}
      <section className="relative overflow-hidden border-b border-red-950/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-red-600/15 via-transparent to-transparent pointer-events-none blur-3xl" />
        
        {carouselItems.length > 0 ? (
          <GlassyCarousel
            items={carouselItems}
            layout="poster"
            initialIndex={Math.min(2, Math.floor(carouselItems.length / 2))}
            autoPlay={true}
            interval={5000}
            label="Featured 3D Showcase"
            style={redBlackCarouselTheme}
            brand={{
              text: `${selectedGenreName.toUpperCase()} — 3D SPOTLIGHT`,
              href: '/',
            }}
          />
        ) : (
          <div className="py-24 text-center text-neutral-500">
            {loading ? 'Initializing 3D Carousel...' : 'No movies found.'}
          </div>
        )}
      </section>

      {/* Main Browse Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Language Tab Switcher */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => { setActiveLanguageTab('all'); setSelectedGenre(null); }}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
              activeLanguageTab === 'all'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-500/50 hover:text-white'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => { setActiveLanguageTab('hindi'); setSelectedGenre(null); }}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
              activeLanguageTab === 'hindi'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-500/50 hover:text-white'
            }`}
          >
            🇮🇳 Bollywood / Hindi
          </button>
        </div>

        {/* Header & Genre Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-neutral-800">
          <div>
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Curated Selection
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <span className="text-red-500">🔥</span> {selectedGenreName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Filter by:</span>
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                !selectedGenre
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-500/50 hover:text-white'
              }`}
            >
              {activeLanguageTab === 'hindi' ? 'All Bollywood' : 'All Trending'}
            </button>
          </div>
        </div>

        {/* Horizontal Genre Buttons */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          {genres.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500 scale-105'
                    : 'bg-neutral-900/90 text-neutral-300 border border-neutral-800 hover:border-red-600/40 hover:bg-neutral-800/80 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Movies Grid */}
        {loading || genreLoading || hindiLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Loading cinematic collection...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-600/40 text-red-200 p-6 rounded-2xl text-center max-w-lg mx-auto shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <p className="font-bold text-base mb-1">Failed to load movies</p>
            <p className="text-xs text-neutral-300">{error}</p>
          </div>
        ) : displayMovies.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 bg-neutral-950/50 rounded-2xl border border-neutral-900">
            <p className="text-lg font-medium">No movies found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {displayMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
