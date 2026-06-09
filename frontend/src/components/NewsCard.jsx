import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faEye, faHeart, faComment } from '@fortawesome/free-solid-svg-icons';

export default function NewsCard({ article, onClick }) {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="news-card" onClick={onClick}>
      <img src={article.featured_image} alt={article.title} className="news-card-img" />
      <div className="news-card-content">
        <span className="news-category">{article.category}</span>
        <h3>{article.title}</h3>
        <p className="news-excerpt">{article.excerpt || article.content.slice(0, 100)}...</p>
        <div className="news-meta">
          <span><FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(article.published_at)}</span>
          <span><FontAwesomeIcon icon={faEye} /> {article.view_count}</span>
          <span><FontAwesomeIcon icon={faHeart} /> {article.like_count}</span>
          <span><FontAwesomeIcon icon={faComment} /> {article.comment_count}</span>
        </div>
        {article.is_premium && <span className="premium-badge">Premium</span>}
      </div>
    </div>
  );
}