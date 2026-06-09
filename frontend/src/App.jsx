import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Culture from './pages/Culture';
import Explore from './pages/Explore';
import Events from './pages/Events';
import News from './pages/News';
import Business from './pages/Business';
import Architecture from './pages/Architecture';
import ArchitectProfile from './pages/ArchitectProfile';
import About from './pages/About';
import Navbar from './components/Navbar';
import Search from './pages/Search';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import Internships from './pages/Internships';
import MusicPlayer from './components/MusicPlayer';
import ContributorDashboard from './pages/Contributor/Dashboard';
import ApplyContributor from './pages/Contributor/Apply';
import EarningsHistory from './pages/Contributor/EarningsHistory';
import RequestPayout from './pages/Contributor/RequestPayout';
import ArtManager from './pages/Contributor/ArtManager';
import ContributorApplications from './pages/Admin/ContributorApplications';
import { useAuth } from './context/AuthContext';
import TopBar from './components/TopBar';
import Upgrade from './pages/Upgrade';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole, showAuthModal, closeLoginModal } = useAuth();

  return (
    <BrowserRouter>
      <div className="app">
        <TopBar />
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/culture/*" element={<Culture />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/events" element={<Events />} />
            <Route path="/news" element={<News />} />
            <Route path="/business" element={<Business />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/architect/:id" element={<ArchitectProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contributor/*" element={<ContributorDashboard />}>
              <Route index element={<div>Select a section from the sidebar</div>} />
              <Route path="art" element={<ArtManager />} />
              <Route path="earnings" element={<EarningsHistory />} />
              <Route path="request-payout" element={<RequestPayout />} />
            </Route>
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/become-contributor" element={<ApplyContributor />} />
            <Route path="/admin/applications" element={<ContributorApplications />} />
          </Routes>
        </main>
        <AuthModal isOpen={showAuthModal} onClose={closeLoginModal} onLogin={() => window.location.reload()} />
        <footer>
          &copy; 2026 UP IN THE L INC. All rights reserved.
          {user && userRole === 'premium' && (
            <button onClick={() => navigate('/contributor')} className="contribute-footer-btn">
              Contribute
            </button>
          )}
        </footer>
      </div>
      <MusicPlayer />
      <CartDrawer />
    </BrowserRouter>
  );
}

export default App;