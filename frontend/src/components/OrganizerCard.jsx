import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export default function OrganizerCard({ organizer }) {
  const { user } = useAuth();
  const [followed, setFollowed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to follow');
    const newVal = !followed;
    setFollowed(newVal);
    try {
      await api.post('/api/events/organizers/follow', { organizer_id: organizer.id });
      toast.success(newVal ? 'Following' : 'Unfollowed');
    } catch {
      setFollowed(!newVal);
    }
  };

  const handleCardClick = async () => {
    setLoading(true);
    setShowModal(true);
    try {
      const res = await api.get(`/api/events/organizers/${organizer.id}/events`);
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) <= new Date());

  return (
    <>
      <div className="organizer-card" onClick={handleCardClick}>
        <img src={organizer.logo_url || '/organizer-placeholder.png'} alt={organizer.name} />
        <h3>{organizer.name}</h3>
        <p>{organizer.description?.slice(0, 80)}</p>
        <button className="follow-btn" onClick={handleFollow}>{followed ? 'Following' : 'Follow'}</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
            <h2>{organizer.name}</h2>
            <p>{organizer.description}</p>
            <div className="organizer-events">
              <h3>Upcoming Events</h3>
              {upcomingEvents.length === 0 && <p>No upcoming events.</p>}
              {upcomingEvents.map(e => (
                <div key={e.id} className="organizer-event-item">
                  <FontAwesomeIcon icon={faCalendarAlt} /> {e.name} – {new Date(e.event_date).toLocaleDateString()}
                </div>
              ))}
              <h3>Past Events</h3>
              {pastEvents.length === 0 && <p>No past events.</p>}
              {pastEvents.map(e => (
                <div key={e.id} className="organizer-event-item past">
                  <FontAwesomeIcon icon={faCalendarAlt} /> {e.name} – {new Date(e.event_date).toLocaleDateString()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}