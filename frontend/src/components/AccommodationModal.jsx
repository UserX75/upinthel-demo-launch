import { useState } from 'react';
import api from '../utils/api';
import MediaGallery from './MediaGallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faUsers, faBed, faMobileAlt, faUniversity, faMoneyBillWave, faInfoCircle, faImages, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faPaypal } from '@fortawesome/free-brands-svg-icons';
import toast from 'react-hot-toast';

export default function AccommodationModal({ item, onClose }) {
  const [activeTab, setActiveTab] = useState('gallery');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const gallery = item.gallery || [item.image];

  const roomTypes = item.room_types || [];
  const selectedRoom = roomTypes.find(rt => rt.name === selectedRoomType);
  const pricePerNight = selectedRoom ? selectedRoom.price : item.price_per_night;
  const nights = (checkIn && checkOut) ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * rooms * pricePerNight;

  const handleBook = async () => {
    if (!checkIn || !checkOut) return toast.error('Select dates');
    if (!selectedRoomType) return toast.error('Select a room type');
    if (!guestName || !guestEmail) return toast.error('Enter name and email');
    setLoading(true);
    try {
      const res = await api.post('/api/explore/accommodations/book', {
        accommodation_id: item.id,
        room_type: selectedRoomType,
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
        
        <div className="modal-tabs">
          <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}><FontAwesomeIcon icon={faImages} /> Gallery</button>
          <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}><FontAwesomeIcon icon={faInfoCircle} /> Description</button>
          <button className={activeTab === 'booking' ? 'active' : ''} onClick={() => setActiveTab('booking')}><FontAwesomeIcon icon={faTicketAlt} /> Booking</button>
        </div>

        <div className="modal-tab-content">
          {activeTab === 'gallery' && <div className="gallery-wrapper"><MediaGallery items={gallery} /></div>}

          {activeTab === 'description' && (
            <div className="description-content">
              <h2>{item.name}</h2>
              <p className="modal-location">{item.location}</p>
              <div className="modal-rating">★★★★☆ 4.5 (120 reviews)</div>
              <p className="modal-description">{item.description || 'No description available.'}</p>
              <div className="modal-amenities">
                <strong>Amenities:</strong>
                <ul>{(item.amenities || ['Wi-Fi', 'Parking', 'Restaurant']).map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
              {item.website && <a href={item.website} target="_blank" rel="noopener noreferrer" className="website-link">Visit website →</a>}
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="booking-content">
              <h3>Book this accommodation</h3>
              <div className="booking-form">
                <div className="form-row"><label><FontAwesomeIcon icon={faCalendar} /> Check-in</label><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} /></div>
                <div className="form-row"><label><FontAwesomeIcon icon={faCalendar} /> Check-out</label><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} /></div>
                <div className="form-row"><label><FontAwesomeIcon icon={faUsers} /> Guests</label><input type="number" min="1" value={guests} onChange={e => setGuests(parseInt(e.target.value))} /></div>
                <div className="form-row"><label><FontAwesomeIcon icon={faBed} /> Rooms</label><input type="number" min="1" value={rooms} onChange={e => setRooms(parseInt(e.target.value))} /></div>
                
                {roomTypes.length > 0 && (
                  <div className="form-row">
                    <label>Room Type</label>
                    <select value={selectedRoomType} onChange={e => setSelectedRoomType(e.target.value)} required>
                      <option value="">Select room type</option>
                      {roomTypes.map(rt => (
                        <option key={rt.name} value={rt.name}>
                          {rt.name} – M{rt.price}/night (available: {rt.available})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row"><label>Your name</label><input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} /></div>
                <div className="form-row"><label>Email</label><input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></div>
                <div className="form-row"><label>Phone (optional)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
              {total > 0 && <div className="price">Total: M{total.toFixed(2)}</div>}
              <div className="payment-methods">
                <label className={paymentMethod === 'mpesa' ? 'active' : ''}><input type="radio" name="payment" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} /> M-Pesa</label>
                <label className={paymentMethod === 'ecocash' ? 'active' : ''}><input type="radio" name="payment" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} /> EcoCash</label>
                <label className={paymentMethod === 'paypal' ? 'active' : ''}><input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label>
                <label className={paymentMethod === 'cash' ? 'active' : ''}><input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash on Arrival</label>
              </div>
              <button className="book-now" onClick={handleBook} disabled={loading}>{loading ? 'Processing...' : 'Book Now'}</button>
              {checkIn && checkOut && <button className="google-calendar" onClick={addToGoogleCalendar}><FontAwesomeIcon icon={faGoogle} /> Add to Google Calendar</button>}
              {booking && <div className="booking-success">Booking confirmed! Total: M{booking.total}. Payment via {booking.method}.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}