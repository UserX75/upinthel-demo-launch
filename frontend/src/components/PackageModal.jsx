import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faTag, faList, faUsers } from '@fortawesome/free-solid-svg-icons';
import './Modals.css';

export default function PackageModal({ item, onClose }) {
  const [persons, setPersons] = useState(1);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => {
      alert(`Package booked: ${item.title} for ${persons} person(s). Total: M${item.price * persons}`);
      onClose();
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <div className="modal-grid">
          <div className="modal-gallery">
            <img src={item.image_url} alt={item.title} className="modal-main-img" />
          </div>
          <div className="modal-details">
            <h2>{item.title}</h2>
            <p><FontAwesomeIcon icon={faCalendar} /> {item.duration_days} days</p>
            <p><FontAwesomeIcon icon={faTag} /> M{item.price} per person</p>
            <p>{item.description}</p>
            <p><strong>Highlights:</strong></p>
            <ul>
              {item.highlights?.map((h, i) => <li key={i}><FontAwesomeIcon icon={faList} /> {h}</li>)}
            </ul>
            <div className="booking-section">
              <label><FontAwesomeIcon icon={faUsers} /> Number of persons</label>
              <input type="number" min="1" value={persons} onChange={e => setPersons(parseInt(e.target.value))} />
              <button className="check-availability" onClick={handleBook}>Book Package</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}