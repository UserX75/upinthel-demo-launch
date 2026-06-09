import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faComment, faShareAlt, faCrown } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUser } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ArticleModal({ article, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.like_count);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [user, setUser] = useState(null);
  const [showFull, setShowFull] = useState(!article.is_premium); // premium paywall

  useEffect(() => {
    fetchComments();
    getCurrentUser().then(setUser);
  }, []);

  const fetchComments = async () => {
    const res = await axios.get(`${API_BASE}/api/news/comments?article_id=${article.id}`);
    setComments(res.data);
  };

  const handleLike = async () => {
    if (!user) return alert('Login to like articles');
    const res = await axios.post(`${API_BASE}/api/news/like`, { article_id: article.id, user_id: user.id });
    setLiked(res.data.liked);
    setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!user && !guestName.trim()) return alert('Please enter your name');
    const payload = {
      article_id: article.id,
      content: newComment,
      user_id: user?.id || null,
      guest_name: guestName || null,
    };
    await axios.post(`${API_BASE}/api/news/comments`, payload);
    setNewComment('');
    fetchComments();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content article-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <div className="article-full">
          <img src={article.featured_image} alt={article.title} className="article-cover" />
          <div className="article-header">
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span>{article.author} • {new Date(article.published_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="article-actions">
            <button onClick={handleLike} className={liked ? 'liked' : ''}><FontAwesomeIcon icon={faHeart} /> {likeCount}</button>
            <button onClick={handleShare}><FontAwesomeIcon icon={faShareAlt} /> Share</button>
          </div>
          <div className="article-body">
            {!showFull && article.is_premium ? (
              <div className="premium-wall">
                <FontAwesomeIcon icon={faCrown} />
                <h3>Premium Article</h3>
                <p>{article.excerpt}...</p>
                <button className="upgrade-btn" onClick={() => alert('Upgrade to premium to read full article')}>Subscribe to read full</button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
            )}
          </div>
          <div className="comment-section">
            <h3>Comments ({article.comment_count})</h3>
            <div className="comment-form">
              {!user && <input type="text" placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)} />}
              <textarea placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button onClick={handleComment}>Post Comment</button>
            </div>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className="comment">
                  <strong>{c.guest_name || c.user?.email?.split('@')[0] || 'Anonymous'}</strong>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}