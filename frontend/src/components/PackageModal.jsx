import { useState } from 'react';
import api from '../utils/api';
import MediaGallery from './MediaGallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faTag, faList, faInfoCircle, faImages, faTicketAlt, faMobileAlt, faUniversity, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import toast from 'react-hot-toast';

export default function PackageModal({ item, onClose }) {
  const [activeTab, setActiveTab] = useState('gallery');
  const [persons, setPersons] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const gallery = item.gallery || [item.image_url];

  const handleBook = async () => {
    if (!guestName || !guestEmail) return toast.error('Enter name and email');
    setLoading(true);
    try {
      await api.post('/api/explore/packages/book', {
        package_id: item.id,
        persons,
        payment_method: paymentMethod,
        guest_name: guestName,
        guest_email: guestEmail,
        phone,
      });
      toast.success('Package booked!');
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
              <h2>{item.title}</h2>
              <p><FontAwesomeIcon icon={faCalendar} /> {item.duration_days} days</p>
              <p><FontAwesomeIcon icon={faTag} /> M{item.price}</p>
              <p className="modal-description">{item.description}</p>
              <p><strong>Highlights:</strong></p>
              <ul>
                {(item.highlights || []).map((h, i) => <li key={i}><FontAwesomeIcon icon={faList} /> {h}</li>)}
              </ul>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="booking-content">
              <h3>Book this package</h3>
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