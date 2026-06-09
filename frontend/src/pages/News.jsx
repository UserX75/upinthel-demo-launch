import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faNewspaper, faEnvelope, faTags, faPen, faMicrophone, faCamera, 
  faChartLine, faBullhorn 
} from '@fortawesome/free-solid-svg-icons';
import NewsCard from '../components/NewsCard';
import ArticleModal from '../components/ArticleModal';
import './News.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [category, search]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      const res = await axios.get(`${API_BASE}/api/news?${params.toString()}`);
      let data = res.data;
      if (search.trim()) {
        data = data.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      setArticles(data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const latestTitles = articles.slice(0, 8).map(a => a.title);

  const handleTickerClick = (title) => {
    const article = articles.find(a => a.title === title);
    if (article) setSelectedArticle(article);
  };

  const handleTopicClick = (topic) => {
    setCategory(topic === 'All' ? '' : topic);
  };

  const handleSubmitTip = () => {
    alert('Submit a news tip – coming soon. You will be able to share stories directly.');
  };

  return (
    <div className="news-page">
      {/* Hero Section with Wow Factor */}
      <div className="news-hero">
        <FontAwesomeIcon icon={faNewspaper} className="floating-news-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
        <FontAwesomeIcon icon={faPen} className="floating-news-icon" style={{ top: '25%', right: '8%', animationDelay: '1s' }} />
        <FontAwesomeIcon icon={faMicrophone} className="floating-news-icon" style={{ bottom: '20%', left: '12%', animationDelay: '2s' }} />
        <FontAwesomeIcon icon={faCamera} className="floating-news-icon" style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
        <FontAwesomeIcon icon={faChartLine} className="floating-news-icon" style={{ bottom: '10%', right: '25%', animationDelay: '1.5s' }} />
        <FontAwesomeIcon icon={faBullhorn} className="floating-news-icon" style={{ top: '40%', left: '20%', animationDelay: '2.5s' }} />

        <h1>Stories That Matter</h1>
        <p>Original reporting and community voices – no politics, just news.</p>

        {latestTitles.length > 0 && (
          <div className="news-ticker">
            <div className="ticker-label">📰 Latest</div>
            <div className="ticker-content">
              {latestTitles.map((title, idx) => (
                <span key={idx} className="ticker-item" onClick={() => handleTickerClick(title)}>
                  {title}
                </span>
              ))}
              {latestTitles.map((title, idx) => (
                <span key={`dup-${idx}`} className="ticker-item" onClick={() => handleTickerClick(title)}>
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="hero-cta" onClick={handleSubmitTip}>
          📝 Submit a News Tip
        </button>
      </div>

      {/* Main layout */}
      <div className="news-layout">
        <div className="news-main">
          <div className="news-filters">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Topics</option>
              <option value="Business">Business</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Other">Other</option>
            </select>
            <div className="search-news">
              <FontAwesomeIcon icon={faSearch} />
              <input type="text" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading news...</div>
          ) : (
            <div className="news-grid">
              {articles.map(article => (
                <NewsCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
              ))}
            </div>
          )}
        </div>

        <aside className="news-sidebar">
          <div className="sidebar-widget">
            <h3><FontAwesomeIcon icon={faTags} /> Topics</h3>
            <ul className="topics-list">
              <li onClick={() => handleTopicClick('All')} className={category === '' ? 'active' : ''}>All</li>
              <li onClick={() => handleTopicClick('Business')} className={category === 'Business' ? 'active' : ''}>Business</li>
              <li onClick={() => handleTopicClick('Sports')} className={category === 'Sports' ? 'active' : ''}>Sports</li>
              <li onClick={() => handleTopicClick('Entertainment')} className={category === 'Entertainment' ? 'active' : ''}>Entertainment</li>
              <li onClick={() => handleTopicClick('Technology')} className={category === 'Technology' ? 'active' : ''}>Technology</li>
              <li onClick={() => handleTopicClick('Lifestyle')} className={category === 'Lifestyle' ? 'active' : ''}>Lifestyle</li>
              <li onClick={() => handleTopicClick('Other')} className={category === 'Other' ? 'active' : ''}>Other</li>
            </ul>
          </div>

          <div className="sidebar-widget">
            <h3><FontAwesomeIcon icon={faNewspaper} /> Latest Headlines</h3>
            <ul className="headlines-list">
              {articles.slice(0, 5).map(article => (
                <li key={article.id} onClick={() => setSelectedArticle(article)}>{article.title}</li>
              ))}
            </ul>
          </div>

          <div className="sidebar-widget">
            <h3><FontAwesomeIcon icon={faEnvelope} /> Subscribe to Newsletter</h3>
            <p>Get the latest stories in your inbox.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Newsletter signup coming soon.'); }}>
              <input type="email" placeholder="Your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          <div className="sidebar-widget ad-placeholder">
            <p>Advertisement</p>
            <div>300x250</div>
          </div>
        </aside>
      </div>

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
}