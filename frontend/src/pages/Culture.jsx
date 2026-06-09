import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintbrush, faMicrophone, faUtensils, faShirt, faMusic, faPalette, faDrum, faHamburger } from '@fortawesome/free-solid-svg-icons';
import ArtSection from '../components/ArtSection';
import FashionSection from '../components/FashionSection';
import MusicSection from '../components/MusicSection';
import FoodSection from '../components/FoodSection';
import PodcastsSection from '../components/PodcastsSection';
import './Culture.css';

export default function Culture() {
  const [activeTab, setActiveTab] = useState('art');

  const tabIcons = {
    art: '🎨',
    fashion: '👗',
    music: '🎵',
    food: '🍽️',
    podcasts: '🎙️',
  };

  // Scattered icons for hero background
  const scatteredIcons = [
    { icon: faPaintbrush, top: '10%', left: '5%', size: '2rem', animationDelay: '0s' },
    { icon: faMicrophone, top: '20%', left: '85%', size: '2.2rem', animationDelay: '1s' },
    { icon: faUtensils, top: '40%', left: '10%', size: '1.8rem', animationDelay: '0.5s' },
    { icon: faShirt, top: '60%', left: '90%', size: '2rem', animationDelay: '1.5s' },
    { icon: faMusic, top: '75%', left: '15%', size: '2.5rem', animationDelay: '0.2s' },
    { icon: faPalette, top: '85%', left: '70%', size: '2rem', animationDelay: '0.8s' },
    { icon: faDrum, top: '15%', left: '30%', size: '1.9rem', animationDelay: '1.2s' },
    { icon: faHamburger, top: '50%', left: '75%', size: '2.2rem', animationDelay: '0.3s' },
  ];

  return (
    <div className="culture-page">
      <div className="culture-hero">
        {/* Scattered icons */}
        <div className="scattered-icons">
          {scatteredIcons.map((item, idx) => (
            <FontAwesomeIcon
              key={idx}
              icon={item.icon}
              className="floating-icon"
              style={{
                position: 'absolute',
                top: item.top,
                left: item.left,
                fontSize: item.size,
                color: 'rgba(255,255,255,0.2)',
                animationDelay: item.animationDelay,
              }}
            />
          ))}
        </div>
        <h1>Culture</h1>
        <p>Explore Ls Creativity – art, fashion, music, and cuisine.</p>
      </div>
      <div className="pill-tabs">
        {Object.keys(tabIcons).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tabIcons[tab]} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="culture-content">
        {activeTab === 'art' && <ArtSection />}
        {activeTab === 'fashion' && <FashionSection />}
        {activeTab === 'music' && <MusicSection />}
        {activeTab === 'food' && <FoodSection />}
        {activeTab === 'podcasts' && <PodcastsSection />}
      </div>
    </div>
  );
}