import { useState } from 'react';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faCalendarAlt, faEnvelope, faPhoneAlt, faTicketAlt, faImages } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function EventDetailModal({ event, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [interested, setInterested] = useState(event.interested_count || 0);
  const [userInterested, setUserInterested] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const gallery = event.gallery || [event.poster_url];

  const handleInterested = async () => {
    if (!user) return toast.error('Login to show interest');
    const newVal = !userInterested;
    setUserInterested(newVal);
    setInterested(prev => newVal ? prev + 1 : prev - 1);
    try {
      await api.post('/api/events/interested', { event_id: event.id, user_id: user.id });
    } catch {
      setUserInterested(!newVal);
      setInterested(prev => newVal ? prev - 1 : prev + 1);
      toast.error('Failed');
    }
  };

  const handleBook = async () => {
    if (!guestName || !guestEmail) return toast.error('Enter name and email');
    setLoading(true);
    try {
      await api.post('/api/events/book', {
        event_id: event.id,
        quantity,
        payment_method: paymentMethod,
        guest_name: guestName,
        guest_email: guestEmail,
        phone
      });
      toast.success('Booking confirmed! Check your email.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = event.accepted_payment_methods || ['mpesa', 'ecocash', 'paypal', 'cash'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <div className="modal-tabs">
          <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Details</button>
          <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}><FontAwesomeIcon icon={faImages} /> Gallery</button>
          {!event.is_past && <button className={activeTab === 'book' ? 'active' : ''} onClick={() => setActiveTab('book')}>Book Tickets</button>}
        </div>
        <div className="modal-tab-content">
          {activeTab === 'details' && (
            <>
              <img src={event.poster_url} alt={event.name} className="modal-img" />
              <h2>{event.name}</h2>
              <p>{event.description}</p>
              <p><strong>Organizer:</strong> {event.organizer || 'UP IN THE L'}</p>
              <p><strong>Venue:</strong> {event.venue}, {event.district}</p>
              <p><strong>Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
              <p><strong>Price:</strong> M{event.price}</p>
              <div className="event-actions">
                <button onClick={handleInterested} className={`interested-btn ${userInterested ? 'active' : ''}`}>
                  <FontAwesomeIcon icon={faHeart} /> Interested ({interested})
                </button>
              </div>
            </>
          )}
          {activeTab === 'gallery' && (
            <div className="gallery-container">
              <img src={gallery[galleryIndex]} alt="Event" className="gallery-main" />
              <div className="gallery-thumbs">
                {gallery.map((img, idx) => (
                  <img key={idx} src={img} className={idx === galleryIndex ? 'active' : ''} onClick={() => setGalleryIndex(idx)} />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'book' && (
            <div className="booking-form">
              <h3>Book Tickets</h3>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
              <input type="text" placeholder="Your name" value={guestName} onChange={e => setGuestName(e.target.value)} />
              <input type="email" placeholder="Your email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
              <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <div className="payment-methods">
                {paymentOptions.includes('mpesa') && <label><input type="radio" name="pay" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} /> M-Pesa</label>}
                {paymentOptions.includes('ecocash') && <label><input type="radio" name="pay" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} /> EcoCash</label>}
                {paymentOptions.includes('paypal') && <label><input type="radio" name="pay" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label>}
                {paymentOptions.includes('cash') && <label><input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash on Arrival</label>}
              </div>
              <div className="total">Total: M{event.price * quantity}</div>
              <button onClick={handleBook} disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}