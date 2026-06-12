import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faMusic, faPalette, faUtensils, faNewspaper, 
  faVideo, faCode, faCloud, faHandshake, faEnvelope, 
  faMapMarkerAlt, faPhoneAlt 
} from '@fortawesome/free-solid-svg-icons';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About UP IN THE L INC.</h1>
        <p>connecting culture, commerce, and community in the L.</p>
      </div>

      <div className="about-content">
        {/* Mission & Story */}
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            UP IN THE L INC. was founded to create a unified digital ecosystem for Lesotho – where music, art,
            fashion, news, and tourism meet. We empower local creators, entrepreneurs, and travellers by
            providing a trusted platform to discover, connect, and transact.
          </p>
          <p>
            As a shareholder in <strong>Sekhametsi Investment Consortium</strong>, We are deeply rooted
            in Lesotho’s economic development and committed to building sustainable digital infrastructure
            for the nation.
          </p>
        </div>

        {/* What We Do (Activities) */}
        <div className="about-section">
          <h2>What We Do</h2>
          <div className="activities-grid">
            <div className="activity-card"><FontAwesomeIcon icon={faChartLine} /> Holding companies</div>
            <div className="activity-card"><FontAwesomeIcon icon={faMusic} /> Sound recording & music publishing</div>
            <div className="activity-card"><FontAwesomeIcon icon={faVideo} /> Motion picture & TV distribution</div>
            <div className="activity-card"><FontAwesomeIcon icon={faCode} /> Computer programming</div>
            <div className="activity-card"><FontAwesomeIcon icon={faCloud} /> Data processing & hosting</div>
            <div className="activity-card"><FontAwesomeIcon icon={faNewspaper} /> News agency activities</div>
            <div className="activity-card"><FontAwesomeIcon icon={faPalette} /> Creative, arts & entertainment</div>
            <div className="activity-card"><FontAwesomeIcon icon={faUtensils} /> Retail sale of sporting equipment</div>
          </div>
        </div>

        {/* Why UP IN THE L */}
        <div className="about-section">
          <h2>Why “UP IN THE L”?</h2>
          <p>
            The name reflects elevation – both geographic (Lesotho is the “Kingdom in the Sky”) and aspirational.
            We are lifting Lesotho’s creative and commercial potential to new heights.
          </p>
        </div>

        {/* Meet the Team (placeholder – you can add real names later) */}
        <div className="about-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="avatar">👤</div>
              <h3>Xaba Mbatjazwa</h3>
              <p>Founder & CEO - Driving vision, strategy, and partnerships.</p>
            </div>
            <div className="team-card">
              <div className="avatar">👥</div>
              <h3>Teboho John Masiu</h3>
              <p>Creative & Tech - Building the platform.</p>
            </div>
          </div>
          <p className="team-note">Full team profiles coming soon.</p>
        </div>

        {/* Contact & Connect */}
        <div className="about-section contact-section">
          <h2>Connect With Us</h2>
          <div className="contact-details">
            <p><FontAwesomeIcon icon={faEnvelope} /> info@upinthel.co.ls</p>
            <p><FontAwesomeIcon icon={faPhoneAlt} /> +266 58124633/51606722</p>
            <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Botha Bothe, Lesotho</p>
          </div>
          <div className="social-links">
            <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  );
}