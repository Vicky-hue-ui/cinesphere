import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import { TMDB_IMAGE_BASE, searchMovies } from '../services/tmdb';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Tv,
  Film,
  Search,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';

interface DiaryEntry {
  _id: string;
  movieId: string;
  movieTitle: string;
  poster: string;
  releaseDate: string;
  watchDate: string;
  rating: number;
  reviewNotes: string;
  watchedWhere: string;
}

export const WatchDiary: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Search state for adding a movie
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // Form State
  const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(8);
  const [reviewNotes, setReviewNotes] = useState('');
  const [watchedWhere, setWatchedWhere] = useState('Home / Streaming');
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    if (user) {
      fetchDiary();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDiary = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/diary', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch diary entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchMovies(query);
      setSearchResults(res.data.results?.slice(0, 5) || []);
    } catch (err) {
      console.error('TMDB search error:', err);
    }
  };

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearchQuery(movie.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;

    setSubmitting(true);
    try {
      const newEntry = {
        movieId: String(selectedMovie.id),
        movieTitle: selectedMovie.title,
        poster: selectedMovie.poster_path || '',
        releaseDate: selectedMovie.release_date || '',
        watchDate,
        rating,
        reviewNotes,
        watchedWhere,
      };

      const res = await axiosInstance.post('/diary', newEntry, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setEntries((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save diary entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this diary log?')) return;
    try {
      await axiosInstance.delete(`/diary/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const resetForm = () => {
    setSelectedMovie(null);
    setSearchQuery('');
    setSearchResults([]);
    setRating(8);
    setReviewNotes('');
    setWatchedWhere('Home / Streaming');
    setWatchDate(new Date().toISOString().split('T')[0]);
  };

  const filteredEntries = filterRating === 'ALL'
    ? entries
    : entries.filter((e) => Math.round(e.rating) >= filterRating);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-900">
        <div>
          <span className="text-xs uppercase tracking-widest text-red-500 font-bold flex items-center gap-1.5">
            <BookOpen size={14} /> Personal Cinema Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Cinematic Watch Diary
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track film watch dates, private reflections, scores, and viewing venues.
          </p>
        </div>

        {user ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] transition hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Log a Movie
          </button>
        ) : (
          <Link
            to="/login"
            className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-600 text-white text-sm font-semibold transition"
          >
            Log In to View Diary
          </Link>
        )}
      </div>

      {/* Stats and Filter Bar */}
      {user && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-neutral-950/80 border border-neutral-900 p-4 rounded-2xl">
          <div className="flex items-center gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-neutral-500">Total Logged:</span>{' '}
              <span className="font-bold text-white ml-1">{entries.length} Films</span>
            </div>
            <div>
              <span className="text-neutral-500">Avg Rating:</span>{' '}
              <span className="font-bold text-red-400 ml-1">
                {entries.length > 0
                  ? (entries.reduce((a, b) => a + b.rating, 0) / entries.length).toFixed(1)
                  : '0.0'}{' '}
                ★
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter size={14} className="text-neutral-400" />
            <span className="text-neutral-400">Filter:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-red-600 text-xs"
            >
              <option value="ALL">All Entries</option>
              <option value={9}>9★ & above</option>
              <option value={8}>8★ & above</option>
              <option value={7}>7★ & above</option>
            </select>
          </div>
        </div>
      )}

      {/* Diary Timeline / Cards */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500 text-sm">
          Loading your cinematic records...
        </div>
      ) : !user ? (
        <div className="text-center py-24 bg-neutral-950/40 rounded-3xl border border-dashed border-neutral-900">
          <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Sign in to start your diary</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5">
            Log movies, write personal reviews, and track your cinema history over time.
          </p>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
          >
            Sign In Now
          </Link>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-24 bg-neutral-950/40 rounded-3xl border border-dashed border-neutral-900">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Diary Entries Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5">
            Click "Log a Movie" to record your first film journal entry.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
          >
            + Log Your First Film
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry._id}
              className="group bg-neutral-950/90 border border-neutral-900 hover:border-red-900/60 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-[0_4px_25px_rgba(220,38,38,0.15)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <Link to={`/movie/${entry.movieId}`} className="flex-shrink-0">
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                    {entry.poster ? (
                      <img
                        src={`${TMDB_IMAGE_BASE}${entry.poster}`}
                        alt={entry.movieTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <Film size={20} />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/movie/${entry.movieId}`}
                      className="font-bold text-white text-base hover:text-red-400 transition truncate"
                    >
                      {entry.movieTitle}
                    </Link>
                    {entry.releaseDate && (
                      <span className="text-neutral-500 text-xs">
                        ({entry.releaseDate.split('-')[0]})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-2">
                    <span className="flex items-center gap-1 text-red-400 font-semibold">
                      ★ {entry.rating} / 10
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-neutral-500" />
                      Watched on {new Date(entry.watchDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Tv size={12} className="text-neutral-500" /> {entry.watchedWhere}
                    </span>
                  </div>

                  {entry.reviewNotes && (
                    <p className="text-neutral-300 text-xs leading-relaxed italic border-l-2 border-red-800/80 pl-2.5">
                      "{entry.reviewNotes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition"
                  title="Delete Entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Log Movie */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-900">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen size={18} className="text-red-500" /> Log Film into Diary
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TMDB Movie Search */}
              <div>
                <label className="text-xs text-neutral-400 font-semibold mb-1 block">
                  Find Film on CineSphere (TMDB)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search movie title (e.g. Oppenheimer)..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                  <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                    {searchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMovie(m)}
                        className="p-2.5 hover:bg-red-950/40 cursor-pointer flex items-center gap-3 transition"
                      >
                        <div className="w-8 h-11 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                          {m.poster_path && (
                            <img
                              src={`${TMDB_IMAGE_BASE}${m.poster_path}`}
                              alt={m.title}
                              className="w-full h-full object-cover"
                            />
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

                {selectedMovie && (
                  <div className="mt-2 p-2 bg-neutral-900/60 rounded-xl border border-red-900/40 flex items-center gap-2 text-xs text-red-300">
                    <CheckCircle size={14} className="text-red-500" />
                    <span>Selected: <strong>{selectedMovie.title}</strong></span>
                  </div>
                )}
              </div>

              {/* Date & Venue */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold mb-1 block">
                    Watch Date
                  </label>
                  <input
                    type="date"
                    value={watchDate}
                    onChange={(e) => setWatchDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold mb-1 block">
                    Viewing Venue
                  </label>
                  <select
                    value={watchedWhere}
                    onChange={(e) => setWatchedWhere(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-600"
                  >
                    <option value="Home / Streaming">Home / Streaming</option>
                    <option value="Movie Theater / IMAX">Movie Theater / IMAX</option>
                    <option value="Drive-In">Drive-In</option>
                    <option value="Airplane / Travel">Airplane / Travel</option>
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-400 font-semibold">Your Rating</label>
                  <span className="text-xs font-bold text-red-400">★ {rating} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-neutral-400 font-semibold mb-1 block">
                  Journal / Review Thoughts
                </label>
                <textarea
                  rows={3}
                  placeholder="What resonated with you? Mention standout scenes or acting..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !selectedMovie}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-sm shadow-md transition"
              >
                {submitting ? 'Recording Entry...' : 'Save to Watch Diary'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchDiary;
