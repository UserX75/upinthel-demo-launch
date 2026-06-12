import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MediaGallery from './MediaGallery';
import { faTimes, faClock, faMapMarkerAlt, faTicketAlt, faUsers, faImages, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './Modals.css';

export default function AttractionModal({ item, onClose }) {
  const [activeTab, setActiveTab] = useState('gallery');   // ✅ Added this line
  const [persons, setPersons] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const gallery = item.gallery || [item.image];

  const handleBook = async () => {
    if (!guestName || !guestEmail) return toast.error('Enter name and email');
    setLoading(true);
    try {
      await api.post('/api/explore/attractions/book', {
        attraction_id: item.id,
        persons,
        payment_method: paymentMethod,
        guest_name: guestName,
        guest_email: guestEmail,
        phone,
      });
      toast.success('Booking confirmed!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        
        <div className="modal-tabs">
          <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>
            <FontAwesomeIcon icon={faImages} /> Gallery
          </button>
          <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>
            <FontAwesomeIcon icon={faInfoCircle} /> Description
          </button>
          <button className={activeTab === 'booking' ? 'active' : ''} onClick={() => setActiveTab('booking')}>
            <FontAwesomeIcon icon={faTicketAlt} /> Book
          </button>
        </div>

        <div className="modal-tab-content">
          {activeTab === 'gallery' && (
            <div className="gallery-wrapper">
              <MediaGallery items={gallery} />
            </div>
          )}

          {activeTab === 'description' && (
            <div className="description-content">
              <h2>{item.name}</h2>
              <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {item.location}</p>
              <p><FontAwesomeIcon icon={faClock} /> {item.duration}</p>
              <p className="modal-description">{item.description || 'No description available.'}</p>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="booking-content">
              <h3>Book this attraction</h3>
              <div className="booking-form">
                <div className="form-row">
                  <label>Number of persons</label>
                  <input type="number" min="1" value={persons} onChange={e => setPersons(parseInt(e.target.value))} />
                </div>
                <div className="form-row"><label>Your name</label><input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} /></div>
                <div className="form-row"><label>Email</label><input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></div>
                <div className="form-row"><label>Phone (optional)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
              <div className="price">Total: M{item.price * persons}</div>
              <div className="payment-methods">
                <label className={paymentMethod === 'mpesa' ? 'active' : ''}><input type="radio" name="pay" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} /> M-Pesa</label>
                <label className={paymentMethod === 'ecocash' ? 'active' : ''}><input type="radio" name="pay" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} /> EcoCash</label>
                <label className={paymentMethod === 'paypal' ? 'active' : ''}><input type="radio" name="pay" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label>
                <label className={paymentMethod === 'cash' ? 'active' : ''}><input type="radio" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash</label>
              </div>
              <button className="book-now" onClick={handleBook} disabled={loading}>{loading ? 'Booking...' : 'Book Now'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}