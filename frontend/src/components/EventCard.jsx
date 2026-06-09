import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faTicketAlt } from '@fortawesome/free-solid-svg-icons';

export default function EventCard({ event, isPast, onClick }) {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="event-card" onClick={onClick}>
      <img src={event.poster_url} alt={event.name} className="event-card-img" />
      <div className="event-card-content">
        <h3>{event.name}</h3>
        <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {event.venue}, {event.district}</p>
        <p><FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(event.event_date)}</p>
        <p className="price"><FontAwesomeIcon icon={faTicketAlt} /> M{event.price}</p>
        {!isPast && <span className="tickets-left">{event.tickets_available} tickets left</span>}
      </div>
    </div>
  );
}