import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import OrganizerCard from '../components/OrganizerCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './Events.css';

export default function Events() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sections, setSections] = useState({
    upcoming: true,
    past: true,
    organizers: true,
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchEventsAndOrganizers();
  }, []);

  useEffect(() => {
    if (nextEvent) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = new Date(nextEvent.event_date) - now;
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [nextEvent]);

  const fetchEventsAndOrganizers = async () => {
    setLoading(true);
    try {
      const [upcomingRes, pastRes, organizersRes] = await Promise.all([
        api.get('/api/events?upcoming=true&limit=20'),
        api.get('/api/events?upcoming=false&limit=20'),
        api.get('/api/events/organizers')
      ]);
      setUpcomingEvents(upcomingRes.data);
      setPastEvents(pastRes.data);
      setOrganizers(organizersRes.data);
      if (upcomingRes.data.length) setNextEvent(upcomingRes.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="events-page">
      {/* Hero section unchanged */}
      <div className="events-hero">
        <div className="floating-icons">
          <div className="float-icon">🎟️</div>
          <div className="float-icon">🎤</div>
          <div className="float-icon">🥁</div>
          <div className="float-icon">🎸</div>
        </div>
        <h1>Events</h1>
        <p>Discover what's happening in Lesotho – music, sports, food, and more.</p>
        {nextEvent && (
          <div className="countdown-container">
            <div className="countdown-block"><span className="countdown-number">{timeLeft.days}</span><span className="countdown-label">Days</span></div>
            <div className="countdown-block"><span className="countdown-number">{timeLeft.hours}</span><span className="countdown-label">Hours</span></div>
            <div className="countdown-block"><span className="countdown-number">{timeLeft.minutes}</span><span className="countdown-label">Minutes</span></div>
            <div className="countdown-block"><span className="countdown-number">{timeLeft.seconds}</span><span className="countdown-label">Seconds</span></div>
          </div>
        )}
        <div className="event-ticker">
          <div className="ticker-content">
            {upcomingEvents.map(e => <span key={e.id} className="ticker-item">{e.name} • </span>)}
            {upcomingEvents.map(e => <span key={`dup-${e.id}`} className="ticker-item">{e.name} • </span>)}
          </div>
        </div>
        <button className="hero-cta" onClick={() => document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' })}>
          Explore Events 🎟️
        </button>
      </div>

      {/* Upcoming Events Section */}
      <section id="upcoming" className="events-section">
        <div className="section-header" onClick={() => toggleSection('upcoming')}>
          <h2>Upcoming Events</h2>
          <FontAwesomeIcon icon={sections.upcoming ? faChevronUp : faChevronDown} />
        </div>
        {sections.upcoming && (
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
            ))}
          </div>
        )}
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section className="events-section">
          <div className="section-header" onClick={() => toggleSection('past')}>
            <h2>Past Events</h2>
            <FontAwesomeIcon icon={sections.past ? faChevronUp : faChevronDown} />
          </div>
          {sections.past && (
            <div className="events-grid past">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isPast onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Event Organizers Section */}
      <section className="events-section">
        <div className="section-header" onClick={() => toggleSection('organizers')}>
          <h2>Event Organizers</h2>
          <FontAwesomeIcon icon={sections.organizers ? faChevronUp : faChevronDown} />
        </div>
        {sections.organizers && (
          <div className="organizers-grid">
            {organizers.map(org => (
              <OrganizerCard key={org.id} organizer={org} />
            ))}
          </div>
        )}
      </section>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}