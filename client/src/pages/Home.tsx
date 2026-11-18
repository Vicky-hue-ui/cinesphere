import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  getGenres,
  getMoviesByGenre,
  getHindiMoviesByGenre,
  TMDB_IMAGE_BASE,
} from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import GlassyCarousel, { type GlassyCarouselItem } from '../components/ui/glassy-coverflow-carousel';
import tmdbAPI from '../services/tmdb';

// Fallback high-res cinematic posters
const FALLBACK_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80',
];

// Red & Black Carousel Theme
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

// ── Infinite scroll helper ────────────────────────────────────────────────────
const fetchPage = async (
  activeLanguageTab: 'all' | 'hindi',
  selectedGenre: number | null,
  page: number
): Promise<any[]> => {
  if (selectedGenre) {
    const fn = activeLanguageTab === 'hindi' ? getHindiMoviesByGenre : getMoviesByGenre;
    const res = await (fn as any)(selectedGenre, page);
    return res.data.results || [];
  }
  if (activeLanguageTab === 'hindi') {
    const res = await tmdbAPI.get('/discover/movie', {
      params: { with_original_language: 'hi', sort_by: 'popularity.desc', region: 'IN', page },
    });
    return res.data.results || [];
  }
  const res = await tmdbAPI.get('/trending/movie/week', { params: { page } });
  return res.data.results || [];
};

const Home = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [activeLanguageTab, setActiveLanguageTab] = useState<'all' | 'hindi'>('all');

  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sentinel div ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Initial load: genres + first page ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const [genreRes, firstPage] = await Promise.all([
          getGenres(),
          fetchPage(activeLanguageTab, selectedGenre, 1),
        ]);
        setGenres(genreRes.data.genres || []);
        setMovies(firstPage);
        setPage(2);
        setHasMore(firstPage.length >= 20);
      } catch (err: any) {
        setError(
          err.response?.data?.status_message ||
            'Unable to fetch movies. Please check your TMDB API key.'
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [activeLanguageTab, selectedGenre]);

  // ── Load next page ────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const results = await fetchPage(activeLanguageTab, selectedGenre, page);
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => {
          // De-duplicate by id
          const ids = new Set(prev.map((m) => m.id));
          const fresh = results.filter((m) => !ids.has(m.id));
          return [...prev, ...fresh];
        });
        setPage((p) => p + 1);
        if (results.length < 20) setHasMore(false);
      }
    } catch {
      // Silently stop pagination on error
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [activeLanguageTab, selectedGenre, page, loadingMore, hasMore]);

  // ── IntersectionObserver: watch sentinel div ──────────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '300px' } // start fetching 300 px before sentinel is visible
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  // ── Reset on tab / genre change ───────────────────────────────────────────
  const switchTab = (tab: 'all' | 'hindi') => {
    setActiveLanguageTab(tab);
    setSelectedGenre(null);
    setMovies([]);
    setPage(1);
    setHasMore(true);
  };

  const switchGenre = (genreId: number | null) => {
    setSelectedGenre(genreId);
    setMovies([]);
    setPage(1);
    setHasMore(true);
  };

  // ── Carousel items (top 8 of current list) ───────────────────────────────
  const carouselItems: GlassyCarouselItem[] = useMemo(() => {
    return movies.slice(0, 8).map((m: any, idx: number) => ({
      id: String(m.id || idx),
      title: m.title || 'Untitled',
      subtitle: `${m.release_date?.slice(0, 4) || '2024'} · Rating: ${
        m.vote_average ? m.vote_average.toFixed(1) : '7.5'
      } ★`,
      image: m.poster_path
        ? `${TMDB_IMAGE_BASE}${m.poster_path}`
        : FALLBACK_POSTERS[idx % FALLBACK_POSTERS.length],
      accent: idx % 2 === 0 ? '#ef4444' : '#dc2626',
      description: m.overview || 'Explore details and save to your personal watchlist.',
      href: `/movie/${m.id}`,
      linkLabel: 'View Movie Details',
      trailerUrl: 'https://www.youtube.com/watch?v=wb49-oV0F78',
    }));
  }, [movies]);

  const selectedGenreName = useMemo(() => {
    if (activeLanguageTab === 'hindi' && !selectedGenre) return '🎬 Bollywood Trending';
    if (!selectedGenre) return 'Trending This Week';
    const found = genres.find((g) => g.id === selectedGenre);
    return found ? `${found.name} Movies` : 'Selected Genre';
  }, [selectedGenre, genres, activeLanguageTab]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 3D Glassy Coverflow Carousel */}
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
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        {/* Language Tab Switcher */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {(['all', 'hindi'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                activeLanguageTab === tab
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-500/50 hover:text-white'
              }`}
            >
              {tab === 'all' ? '🌍 Global' : '🇮🇳 Bollywood / Hindi'}
            </button>
          ))}
        </div>

        {/* Header & Genre Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
          <div>
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Curated Selection
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <span className="text-red-500">🔥</span> {selectedGenreName}
            </h1>
          </div>
          <button
            onClick={() => switchGenre(null)}
            className={`self-start px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              !selectedGenre
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-red-500/50 hover:text-white'
            }`}
          >
            {activeLanguageTab === 'hindi' ? 'All Bollywood' : 'All Trending'}
          </button>
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {genres.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => switchGenre(g.id)}
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
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Loading cinematic collection...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-600/40 text-red-200 p-6 rounded-2xl text-center max-w-lg mx-auto shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <p className="font-bold text-base mb-1">Failed to load movies</p>
            <p className="text-xs text-neutral-300">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 bg-neutral-950/50 rounded-2xl border border-neutral-900">
            <p className="text-lg font-medium">No movies found for this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {movies.map((movie) => (
                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-4 mt-8" aria-hidden="true" />

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center gap-3 py-8">
                <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-neutral-400 text-sm">Loading more films...</span>
              </div>
            )}

            {/* End of content */}
            {!hasMore && movies.length > 0 && (
              <p className="text-center text-neutral-600 text-xs py-8">
                ✦ You've reached the end of the collection ✦
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
