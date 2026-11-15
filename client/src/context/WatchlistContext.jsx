import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (user) fetchWatchlist();
    else setWatchlist([]);
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const { data } = await axiosInstance.get('/watchlist', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    }
  };

  const addToWatchlist = async (movie) => {
    try {
      const { data } = await axiosInstance.post('/watchlist', movie, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWatchlist((prev) => [...prev, data]);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await axiosInstance.delete(`/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const isInWatchlist = (movieId) =>
    watchlist.some((item) => item.movieId === movieId);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);

