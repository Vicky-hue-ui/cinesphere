import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import WatchDiary from './pages/WatchDiary';
import MovieBattle from './pages/MovieBattle';
import CineChat from './components/CineChat';
import { SignInCard } from './components/ui/sign-in-card-2';
import { AuthComponent } from './components/ui/sign-up';

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-black text-white relative">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/diary" element={<WatchDiary />} />
                <Route path="/battle" element={<MovieBattle />} />
                <Route path="/profile" element={<Profile />} />
                {/* Dedicated login & signup routes */}
                <Route path="/login" element={<SignInCard />} />
                <Route path="/signup" element={<AuthComponent />} />
                <Route path="/forgot-password" element={<SignInCard />} />
              </Routes>
            </main>
            {/* Global AI Floating CineChat Assistant */}
            <CineChat />
            <Footer />
          </div>
        </Router>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
