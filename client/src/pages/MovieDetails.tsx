import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
  getMovieVideos,
  TMDB_IMAGE_BASE,
} from '../services/tmdb';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import SoundtrackPlayer from '../components/SoundtrackPlayer';
import {
  Play,
  Star,
  Clock,
  Calendar,
  Heart,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerList, setTrailerList] = useState<any[]>([]);
  const [soundtrackKey, setSoundtrackKey] = useState<string | null>(null);
  const [soundtrackTitle, setSoundtrackTitle] = useState<string>('Main Theme / Soundtrack');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 8, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // AI Feature: Spoiler-Safe Plot & Review Synthesizer State
  const [spoilerMode, setSpoilerMode] = useState(false);
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [movieRes, creditsRes, similarRes, videosRes, reviewsRes] =
          await Promise.all([
            getMovieDetails(id),
            getMovieCredits(id),
            getSimilarMovies(id),
            getMovieVideos(id).catch(() => ({ data: { results: [] } })),
            axiosInstance.get(`/reviews/${id}`).catch(() => ({ data: [] })),
          ]);

        setMovie(movieRes.data);
        setCredits(creditsRes.data.cast?.slice(0, 10) || []);
        setSimilar(similarRes.data.results?.slice(0, 6) || []);
        setReviews(reviewsRes.data || []);

        // Trigger AI Review Synthesizer & Plot Architecture
        try {
          const aiRes = await axiosInstance.post('/ai/synthesize', {
            movieId: movieRes.data.id,
            movieTitle: movieRes.data.title,
            overview: movieRes.data.overview,
            userReviews: reviewsRes.data || [],
          });
          setAiSynthesis(aiRes.data);
        } catch (aiErr) {
          console.warn('AI Synthesis not available:', aiErr);
        }

        // Rank and select the exact best official trailer
        const videos: any[] = videosRes.data.results || [];

        // Detect if movie is primarily Hindi/Bollywood based on TMDB metadata
        const isHindiMovie =
          movieRes.data.original_language === 'hi' ||
          movieRes.data.spoken_languages?.some((l: any) => l.iso_639_1 === 'hi');

        const youtubeVideos = videos.filter((v) => v.site === 'YouTube' && v.key);

        const scoreTrailer = (v: any) => {
          let score = 0;
          const name = (v.name || '').toLowerCase();
          const type = (v.type || '').toLowerCase();

          // Official status bonus
          if (v.official === true) score += 60;

          // Type matching — trailers rank highest
          if (type === 'trailer') score += 100;
          else if (type === 'teaser') score += 40;
          else if (type === 'clip') score += 10;
          else if (type === 'featurette') score -= 30;

          // High-intent name phrases (English & Hindi variants)
          if (name.includes('official trailer')) score += 90;
          if (name.includes('main trailer')) score += 80;
          if (name.includes('final trailer')) score += 70;
          if (name.includes('theatrical trailer')) score += 60;
          if (name.includes('official teaser trailer')) score += 55;
          if (name.includes('trailer 1') || name.includes('trailer #1')) score += 50;
          if (name.includes('trailer 2') || name.includes('trailer #2')) score += 35;
          if (name.includes('trailer')) score += 25;
          // Hindi-specific phrases
          if (name.includes('official video') && isHindiMovie) score += 20;
          if (name.includes('teaser')) score += 15;

          // Penalize non-trailer clutter
          if (name.includes('behind the scenes') || name.includes('b-roll') || name.includes('making of')) score -= 90;
          if (name.includes('featurette') || name.includes('interview')) score -= 80;
          if (name.includes('deleted scene') || name.includes('bloopers') || name.includes('gag reel')) score -= 90;
          if (name.includes('soundtrack') || name.includes('lyrical') || name.includes('lyric video')) score -= 60;
          if (name.includes('audio') && !name.includes('trailer')) score -= 50;

          return score;
        };

        const sortedTrailers = [...youtubeVideos].sort((a, b) => scoreTrailer(b) - scoreTrailer(a));
        const bestTrailer = sortedTrailers.length > 0 ? sortedTrailers[0] : null;

        setTrailerKey(bestTrailer ? bestTrailer.key : null);
        setTrailerList(sortedTrailers.filter((v) => scoreTrailer(v) > 20));

        // Find soundtrack or music/clip
        const musicVideo = videos.find(
          (v) =>
            v.site === 'YouTube' &&
            (v.name?.toLowerCase().includes('soundtrack') ||
              v.name?.toLowerCase().includes('score') ||
              v.name?.toLowerCase().includes('theme') ||
              v.name?.toLowerCase().includes('music') ||
              v.type === 'Music Video')
        );
        if (musicVideo) {
          setSoundtrackKey(musicVideo.key);
          setSoundtrackTitle(musicVideo.name);
        } else if (bestTrailer) {
          // Fallback to best trailer
          setSoundtrackKey(bestTrailer.key);
          setSoundtrackTitle(`${movieRes.data.title} - Official Audio`);
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const { data } = await axiosInstance.post(
        '/reviews',
        {
          movieId: movie.id,
          movieTitle: movie.title,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 8, comment: '' });
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 text-sm font-medium tracking-wide">
          Loading movie showcase...
        </p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Movie Not Found</h2>
        <p className="text-neutral-400 mb-6">The requested movie could not be located.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Cinematic Ambient Backdrop */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-red-400 mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Discover
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Poster with 3D Glossy Card Effect */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group rounded-3xl overflow-hidden border border-red-950/70 shadow-[0_15px_50px_rgba(220,38,38,0.3)] bg-neutral-950 max-w-xs w-full transition-transform duration-500 hover:scale-[1.02]">
              <div className="aspect-[2/3] w-full overflow-hidden">
                <img
                  src={
                    movie.poster_path
                      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
                      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Quick Play Trailer Button Over Poster */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] backdrop-blur-md transition-all hover:scale-110 group/btn"
                  title="Play Official Trailer"
                >
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Movie Metadata & Interactive Controls */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {/* Badges / Genres */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {movie.genres?.map((g: any) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-red-950/60 border border-red-800/40 text-red-300"
                >
                  {g.name}
                </span>
              ))}
              {movie.status && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {movie.status}
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-tight">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-neutral-400 italic text-sm md:text-base mb-6">
                "{movie.tagline}"
              </p>
            )}

            {/* Quick Stats: Rating, Runtime, Release */}
            <div className="flex flex-wrap items-center gap-6 py-4 px-6 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-md mb-8 max-w-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    Rating
                  </div>
                  <div className="text-sm font-bold text-white">
                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}{' '}
                    <span className="text-xs font-normal text-neutral-400">
                      ({movie.vote_count} votes)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    Duration
                  </div>
                  <div className="text-sm font-bold text-white">
                    {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    Release
                  </div>
                  <div className="text-sm font-bold text-white">
                    {movie.release_date || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis / Description with AI Spoiler-Safe Plot Architecture */}
            <div className="mb-8 bg-neutral-950/70 border border-neutral-900 p-5 rounded-2xl max-w-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} /> Plot Architect & Synopsis
                </h3>

                {/* Spoiler Mode Toggle Button */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">
                    {spoilerMode ? '⚠️ Spoiler Mode' : '🛡️ Non-Spoiler'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpoilerMode(!spoilerMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      spoilerMode ? 'bg-red-600' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        spoilerMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Conditional Rendering based on Spoiler Mode */}
              {!spoilerMode ? (
                <div>
                  <p className="text-neutral-300 leading-relaxed text-sm">
                    {movie.overview || 'No description available for this title.'}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-2 italic flex items-center gap-1">
                    <span>🛡️ Safe reading mode: Showing premise and setup only. Toggle switch above to reveal full ending & narrative beats.</span>
                  </p>
                </div>
              ) : (
                <div className="border-l-2 border-red-600 pl-3.5 py-1 bg-red-950/20 rounded-r-xl">
                  <p className="text-red-200 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    ⚠️ Full Narrative Arc & Climax Revealed:
                  </p>
                  <p className="text-neutral-200 leading-relaxed text-xs whitespace-pre-wrap">
                    {aiSynthesis?.spoilerArc || `${movie.overview}\n\nAct II & III: Key twists culminate in a dramatic climax where underlying secrets are exposed, permanently resolving the narrative conflict.`}
                  </p>
                </div>
              )}
            </div>

            {/* AI Review Synthesizer (Pros, Cons, Verdict) */}
            {aiSynthesis && (
              <div className="mb-8 bg-neutral-950/90 border border-neutral-900 p-5 rounded-2xl max-w-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-900">
                  <Sparkles size={16} className="text-red-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    AI Review Synthesizer
                  </h4>
                  <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-mono">
                    Instant Consensus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 text-xs">
                  {/* Pros */}
                  <div className="bg-neutral-900/50 p-3 rounded-xl border border-emerald-950/40">
                    <span className="text-emerald-400 font-bold block mb-1.5 flex items-center gap-1">
                      ✓ The Highlights (Pros)
                    </span>
                    <ul className="space-y-1 text-neutral-300 list-disc list-inside">
                      {aiSynthesis.pros?.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-neutral-900/50 p-3 rounded-xl border border-rose-950/40">
                    <span className="text-rose-400 font-bold block mb-1.5 flex items-center gap-1">
                      ✕ The Critiques (Cons)
                    </span>
                    <ul className="space-y-1 text-neutral-300 list-disc list-inside">
                      {aiSynthesis.cons?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Verdict */}
                <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl text-xs text-neutral-200">
                  <strong className="text-red-400 block mb-0.5">Synthesizer Verdict:</strong>
                  {aiSynthesis.verdict}
                </div>
              </div>
            )}

            {/* Action Buttons: Play Trailer & Watchlist */}
            <div className="flex flex-wrap items-center gap-4">
              {trailerKey ? (
                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.7)] transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> Watch Trailer
                </button>
              ) : (
                // No TMDB trailer found — open YouTube search directly
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    (movie.title || '') + ' official trailer ' + (movie.release_date?.split('-')[0] || '')
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-neutral-900 border border-neutral-700 hover:border-red-600 text-neutral-300 hover:text-white transition-all hover:scale-105"
                >
                  <Play size={18} /> Search Trailer on YouTube
                </a>
              )}

              {user ? (
                <button
                  onClick={() =>
                    inWatchlist
                      ? removeFromWatchlist(movie.id)
                      : addToWatchlist({
                          movieId: movie.id,
                          movieTitle: movie.title,
                          poster: movie.poster_path,
                          releaseDate: movie.release_date,
                          rating: movie.vote_average,
                        })
                  }
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all border ${
                    inWatchlist
                      ? 'bg-red-950/80 border-red-700 text-red-300 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                      : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:border-red-600 hover:text-white'
                  }`}
                >
                  <Heart
                    size={17}
                    fill={inWatchlist ? 'currentColor' : 'none'}
                    className={inWatchlist ? 'text-red-500' : ''}
                  />
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              ) : (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-neutral-900 border border-neutral-700 hover:border-red-600 text-neutral-200 hover:text-white transition"
                >
                  <Heart size={17} /> Login to Save
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Trailer Section (Always visible on page if available) */}
        {trailerKey && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
                  Cinematic Preview
                </span>
                <h2 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                  <Play size={20} className="text-red-500" /> Official Trailer
                </h2>
              </div>

              {/* Selector if multiple trailers/teasers exist */}
              {trailerList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-xs sm:max-w-md py-1">
                  {trailerList.slice(0, 4).map((t, idx) => (
                    <button
                      key={t.key}
                      onClick={() => setTrailerKey(t.key)}
                      className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition border ${
                        trailerKey === t.key
                          ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] font-semibold'
                          : 'bg-neutral-900/90 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {t.name?.length > 25 ? `${t.name.slice(0, 25)}...` : t.name || `Trailer ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-red-900/50 shadow-[0_10px_40px_rgba(220,38,38,0.25)] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0&modestbranding=1`}
                title={`${movie.title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Cast Section */}
        {credits.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-red-500">🎭</span> Top Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-900">
              {credits.map((actor: any) => (
                <div
                  key={actor.id}
                  className="flex-shrink-0 w-28 text-center group bg-neutral-950/70 p-3 rounded-2xl border border-neutral-900 hover:border-red-600/50 transition-all duration-300"
                >
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border border-neutral-800 group-hover:border-red-500 shadow-md transition-colors">
                    <img
                      src={
                        actor.profile_path
                          ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-200 truncate group-hover:text-red-400 transition-colors">
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews & Community Ratings */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
                Community
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                <Star size={20} className="text-red-500" /> User Reviews & Ratings
              </h2>
            </div>
          </div>

          {user ? (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-neutral-950/90 border border-neutral-800/90 rounded-2xl p-6 mb-8 max-w-2xl shadow-xl backdrop-blur-md"
            >
              <h3 className="text-sm font-bold text-white mb-4">
                Leave your review for {movie.title}
              </h3>
              {reviewError && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                  {reviewError}
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <label className="text-xs text-neutral-400 font-medium">Your Rating (1-10):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                    }
                    className="accent-red-600 w-32 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                    ★ {reviewForm.rating} / 10
                  </span>
                </div>
              </div>

              <textarea
                placeholder="What did you think of the plot, direction, or performances?"
                value={reviewForm.comment}
                required
                rows={3}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 text-white placeholder:text-neutral-600 p-3.5 rounded-xl text-sm outline-none transition mb-4"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-900 text-center mb-8 max-w-md">
              <p className="text-sm text-neutral-400 mb-3">
                Join the conversation. Sign in to write a review.
              </p>
              <Link
                to="/profile"
                className="inline-block px-5 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition"
              >
                Sign In to Review
              </Link>
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4 max-w-3xl">
            {reviews.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No user reviews yet. Be the first to share your thoughts!
              </p>
            ) : (
              reviews.map((r: any) => (
                <div
                  key={r._id}
                  className="bg-neutral-950/80 border border-neutral-900 p-4.5 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-200">
                      {r.user?.name || 'Verified Movie Buff'}
                    </span>
                    <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                      ★ {r.rating} / 10
                    </span>
                  </div>
                  <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Similar Movies Grid */}
        {similar.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-red-500">🔥</span> More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((m: any) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Soundtrack & Score Player */}
      {movie && (
        <SoundtrackPlayer
          movieTitle={movie.title}
          posterPath={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined}
          videoKey={soundtrackKey}
          trackTitle={soundtrackTitle}
        />
      )}

      {/* Fullscreen Video Modal */}
      {showTrailerModal && trailerKey && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-red-600/50 shadow-[0_0_50px_rgba(239,68,68,0.4)] bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center border border-neutral-700 transition"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${movie.title} Trailer Modal`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
