import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faClock, faMapMarkerAlt, faTicketAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import './Modals.css';

export default function AttractionModal({ item, onClose }) {
  const [persons, setPersons] = useState(1);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => {
      alert(`Booking confirmed for ${item.name} for ${persons} person(s). Total: M${item.price * persons}`);
      onClose();
    }, 500);
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
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {item.location}</p>
            <p><FontAwesomeIcon icon={faClock} /> {item.duration}</p>
            <p className="price"><FontAwesomeIcon icon={faTicketAlt} /> M{item.price} per person</p>
            <p>{item.description}</p>
            <div className="booking-section">
              <label><FontAwesomeIcon icon={faUsers} /> Number of persons</label>
              <input type="number" min="1" value={persons} onChange={e => setPersons(parseInt(e.target.value))} />
              <button className="check-availability" onClick={handleBook}>Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}