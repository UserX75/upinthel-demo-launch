import { useEffect, useState, useRef } from 'react';

const AdsCarousel = ({ ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const itemsPerView = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(ads.length / itemsPerView);
  const intervalRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (ads.length <= itemsPerView) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [ads.length, itemsPerView, totalSlides]);

  const startIndex = currentIndex * itemsPerView;
  const visibleAds = ads.slice(startIndex, startIndex + itemsPerView);

  return (
    <div className="ads-carousel">
      <div className="ads-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {Array.from({ length: totalSlides }).map((_, slideIdx) => (
          <div key={slideIdx} className="ads-slide">
            {ads.slice(slideIdx * itemsPerView, slideIdx * itemsPerView + itemsPerView).map((ad) => (
              <div 
                key={ad.id} 
                className="ad-card" 
                onClick={() => window.open(ad.link, '_blank')}
              >
                <img src={ad.image_url || 'https://via.placeholder.com/300x200?text=Ad'} alt={ad.title} />
                <h4>{ad.title}</h4>
                <p>{ad.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdsCarousel;