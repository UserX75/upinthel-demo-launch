import { useState, useEffect } from 'react';

export default function DistrictCard({ district, onClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = district.image_urls || (district.image_url ? [district.image_url] : ['/placeholder-district.jpg']);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="district-card" onClick={() => onClick(district)}>
      <div className="district-image-slideshow">
        {images.map((url, idx) => (
          <img key={idx} src={url} alt={district.name} className={idx === currentImageIndex ? 'active' : ''} />
        ))}
      </div>
      <div className="district-card-content">
        <h3>{district.name}</h3>
        <p>{district.description?.slice(0, 80)}</p>
      </div>
    </div>
  );
}