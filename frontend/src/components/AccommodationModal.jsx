import { useState } from 'react';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faUsers, faBed, faMobileAlt, faUniversity, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faPaypal } from '@fortawesome/free-brands-svg-icons';
import toast from 'react-hot-toast';

export default function AccommodationModal({ item, onClose }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  const total = calculateNights() * rooms * item.price_per_night;

  const handleBook = async () => {
    if (!checkIn || !checkOut) return toast.error('Select check-in and check-out dates');
    if (guests < 1) return toast.error('Invalid number of guests');
    if (rooms < 1) return toast.error('Invalid number of rooms');
    if (!guestName.trim()) return toast.error('Please enter your name');
    if (!guestEmail.trim()) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await api.post('/api/explore/accommodations/book', {
        accommodation_id: item.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        rooms,
        payment_method: paymentMethod,
        guest_name: guestName,
        guest_email: guestEmail,
        phone,
      });
      setBooking({ total: res.data.total, method: paymentMethod });
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const addToGoogleCalendar = () => {
    if (!checkIn || !checkOut) return toast.error('Select dates first');
    const start = new Date(checkIn).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(checkOut).toISOString().replace(/-|:|\.\d+/g, '');
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Stay+at+${encodeURIComponent(item.name)}&dates=${start}/${end}&details=${encodeURIComponent(item.description || '')}&location=${encodeURIComponent(item.location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <div className="modal-grid">
          <div className="modal-gallery">
            <img src={item.image} alt={item.name} className="modal-main-img" />
          </div>
          <div className="modal-details">
            <h2>{item.name}</h2>
            <p className="modal-location">{item.location}</p>
            <div className="booking-form">
              <div className="form-row">
                <label><FontAwesomeIcon icon={faCalendar} /> Check-in</label>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
              </div>
              <div className="form-row">
                <label><FontAwesomeIcon icon={faCalendar} /> Check-out</label>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
              </div>
              <div className="form-row">
                <label><FontAwesomeIcon icon={faUsers} /> Guests</label>
                <input type="number" min="1" value={guests} onChange={e => setGuests(parseInt(e.target.value))} />
              </div>
              <div className="form-row">
                <label><FontAwesomeIcon icon={faBed} /> Rooms</label>
                <input type="number" min="1" value={rooms} onChange={e => setRooms(parseInt(e.target.value))} />
              </div>
              <div className="form-row">
                <label>Your name</label>
                <input type="text" placeholder="Full name" value={guestName} onChange={e => setGuestName(e.target.value)} required />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input type="email" placeholder="Email address" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required />
              </div>
              <div className="form-row">
                <label>Phone (optional)</label>
                <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            {total > 0 && <div className="price">Total: M{total.toFixed(2)}</div>}
            <div className="payment-methods">
              <label className={paymentMethod === 'mpesa' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                <FontAwesomeIcon icon={faMobileAlt} /> M-Pesa
              </label>
              <label className={paymentMethod === 'ecocash' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} />
                <FontAwesomeIcon icon={faMobileAlt} /> EcoCash
              </label>
              <label className={paymentMethod === 'paypal' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                <FontAwesomeIcon icon={faPaypal} /> PayPal
              </label>
              <label className={paymentMethod === 'cash' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                <FontAwesomeIcon icon={faMoneyBillWave} /> Cash on Arrival
              </label>
            </div>
            <button className="book-now" onClick={handleBook} disabled={loading}>
              {loading ? 'Processing...' : 'Book Now'}
            </button>
            {checkIn && checkOut && (
              <button className="google-calendar" onClick={addToGoogleCalendar}>
                <FontAwesomeIcon icon={faGoogle} /> Add to Google Calendar
              </button>
            )}
            {booking && (
              <div className="booking-success">
                Booking confirmed! Total: M{booking.total}. Payment via {booking.method}.
              </div>
            )}
            {item.website && (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="website-link">
                Visit website →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}