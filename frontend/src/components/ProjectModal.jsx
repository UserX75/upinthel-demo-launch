import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ProjectModal({ project, onClose }) {
  const [buying, setBuying] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const handlePurchase = async () => {
    if (!guestName || !guestEmail) return alert('Please enter name and email');
    try {
      await axios.post(`${API_BASE}/api/orders`, {
        guest_name: guestName,
        guest_email: guestEmail,
        items: [{ type: 'architecture_plan', id: project.id, name: project.title, price: project.price, quantity: 1 }],
        total_amount: project.price,
      });
      alert('Purchase successful! Download link will be sent to your email.');
      onClose();
    } catch (err) {
      alert('Purchase failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <img src={project.cover_image} alt={project.title} className="modal-img" />
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <p><strong>Project Type:</strong> {project.project_type}</p>
        <p><strong>Year:</strong> {project.completion_year}</p>
        <p><strong>Location:</strong> {project.location}</p>
        <p className="price">M{project.price}</p>
        {!buying ? (
          <button className="buy-btn" onClick={() => setBuying(true)}><FontAwesomeIcon icon={faShoppingCart} /> Purchase Plans</button>
        ) : (
          <div className="purchase-form">
            <input type="text" placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <input type="email" placeholder="Your email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
            <button onClick={handlePurchase}>Confirm Purchase</button>
          </div>
        )}
      </div>
    </div>
  );
}