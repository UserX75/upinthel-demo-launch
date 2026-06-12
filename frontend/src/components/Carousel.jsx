import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './FashionSection.css';

const Carousel = ({ items, renderItem, itemsPerView = 3, autoSlideInterval = null, onItemClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const intervalRef = useRef();
  const totalSlides = Math.ceil(items.length / (isMobile ? 1 : itemsPerView));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (autoSlideInterval && items.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, autoSlideInterval);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoSlideInterval, totalSlides, items.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const startIdx = currentIndex * (isMobile ? 1 : itemsPerView);
  const visibleItems = items.slice(startIdx, startIdx + (isMobile ? 1 : itemsPerView));

  return (
    <div className="carousel-container">
      {items.length > (isMobile ? 1 : itemsPerView) && (
        <button className="carousel-arrow left" onClick={goPrev}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <div className="carousel-track">
        {visibleItems.map((item, idx) => (
          <div key={item.id} className="carousel-slide" onClick={() => onItemClick(item)}>
            {renderItem(item)}
          </div>
        ))}
      </div>
      {items.length > (isMobile ? 1 : itemsPerView) && (
        <button className="carousel-arrow right" onClick={goNext}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
    </div>
  );
};

export default Carousel;