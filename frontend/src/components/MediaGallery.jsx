import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlay } from '@fortawesome/free-solid-svg-icons';

const MediaGallery = ({ items, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const isVideo = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.match(/\.(mp4|webm|mov)$/i);
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/').split('&')[0];
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const renderMedia = (item) => {
    if (isVideo(item)) {
      const embedUrl = getEmbedUrl(item);
      return (
        <iframe
          src={embedUrl}
          title="Video"
          className="gallery-media"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return <img src={item} alt="Gallery" className="gallery-media" />;
  };

  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);

  return (
    <div className="media-gallery">
      <div className="gallery-main">
        {renderMedia(items[currentIndex])}
        <button className="gallery-nav prev" onClick={goPrev}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button className="gallery-nav next" onClick={goNext}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div className="gallery-thumbnails">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          >
            {isVideo(item) ? (
              <div className="video-thumb">
                <FontAwesomeIcon icon={faPlay} />
              </div>
            ) : (
              <img src={item} alt={`Thumb ${idx}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;