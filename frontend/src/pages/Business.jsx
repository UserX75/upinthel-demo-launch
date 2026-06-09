import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faBriefcase, faFileAlt, faBook, faStar, faSearch, faMapMarkerAlt, faDollarSign, faHandshake, faFileInvoice, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import './Business.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Business() {
  const [activeTab, setActiveTab] = useState('directory');
  const [businesses, setBusinesses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [resources, setResources] = useState([]);
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'directory') fetchBusinesses();
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'tenders') fetchTenders();
    if (activeTab === 'resources') fetchResources();
    if (activeTab === 'spotlight') fetchSpotlights();
  }, [activeTab, categoryFilter, districtFilter]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (districtFilter) params.append('district', districtFilter);
      const res = await axios.get(`${API_BASE}/api/businesses?${params.toString()}`);
      setBusinesses(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/jobs`);
      setJobs(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tenders`);
      setTenders(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/resources`);
      setResources(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchSpotlights = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/spotlights`);
      setSpotlights(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="business-page">
      <div className="business-hero">
    <FontAwesomeIcon icon={faBuilding} className="floating-business-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
    <FontAwesomeIcon icon={faBriefcase} className="floating-business-icon" style={{ top: '25%', right: '8%', animationDelay: '1s' }} />
    <FontAwesomeIcon icon={faChartLine} className="floating-business-icon" style={{ bottom: '20%', left: '12%', animationDelay: '2s' }} />
    <FontAwesomeIcon icon={faHandshake} className="floating-business-icon" style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
    <FontAwesomeIcon icon={faFileInvoice} className="floating-business-icon" style={{ bottom: '10%', right: '25%', animationDelay: '1.5s' }} />
    <FontAwesomeIcon icon={faUsers} className="floating-business-icon" style={{ top: '40%', left: '20%', animationDelay: '2.5s' }} />

    <h1>Business Hub</h1>
    <p>Jobs, tenders, resources, and local business directory – everything for Lesotho's entrepreneurs.</p>

    <button className="hero-cta" onClick={() => alert('List your business – premium upgrade coming soon.')}>
        List Your Business
    </button>
</div>

      <div className="business-tabs">
        <button className={activeTab === 'directory' ? 'active' : ''} onClick={() => setActiveTab('directory')}>
          <FontAwesomeIcon icon={faBuilding} /> Directory
        </button>
        <button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>
          <FontAwesomeIcon icon={faBriefcase} /> Jobs
        </button>
        <button className={activeTab === 'tenders' ? 'active' : ''} onClick={() => setActiveTab('tenders')}>
          <FontAwesomeIcon icon={faFileAlt} /> Tenders
        </button>
        <button className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>
          <FontAwesomeIcon icon={faBook} /> Resources
        </button>
        <button className={activeTab === 'spotlight' ? 'active' : ''} onClick={() => setActiveTab('spotlight')}>
          <FontAwesomeIcon icon={faStar} /> Spotlight
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {activeTab === 'directory' && (
        <div>
          <div className="business-filters">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Retail">Retail</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </select>
            <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">All Districts</option>
              <option value="Maseru">Maseru</option>
              <option value="Leribe">Leribe</option>
              <option value="Berea">Berea</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={fetchBusinesses}><FontAwesomeIcon icon={faSearch} /> Filter</button>
          </div>
          <div className="business-grid">
            {businesses.map(b => (
              <div key={b.id} className={`business-card ${b.is_premium ? 'premium' : ''}`}>
                <img src={b.logo_url || 'https://via.placeholder.com/80'} alt={b.name} className="business-logo" />
                <div className="business-info">
                  <h3>{b.name} {b.is_premium && <span className="premium-badge">Premium</span>}</h3>
                  <p className="business-category"><strong>{b.category}</strong> · {b.district}</p>
                  <p className="business-description">{b.description?.slice(0, 100)}</p>
                  {b.contact_phone && <p><FontAwesomeIcon icon={faDollarSign} /> {b.contact_phone}</p>}
                  {b.website && <a href={b.website} target="_blank" rel="noopener noreferrer">Visit website</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.id} className="job-item">
              <h3>{job.title}</h3>
              <p><strong>{job.company}</strong> · {job.location || 'Lesotho'}</p>
              <p>{job.description}</p>
              {job.salary_range && <p><FontAwesomeIcon icon={faDollarSign} /> {job.salary_range}</p>}
              {job.application_deadline && <p>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tenders' && (
        <div className="tenders-list">
          {tenders.map(tender => (
            <div key={tender.id} className="tender-item">
              <h3>{tender.title}</h3>
              <p><strong>{tender.issuing_body}</strong> – Deadline: {new Date(tender.deadline).toLocaleDateString()}</p>
              <p>{tender.description}</p>
              {tender.document_url && <a href={tender.document_url} target="_blank" rel="noopener noreferrer">Download Documents</a>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="resources-grid">
          {resources.map(res => (
            <div key={res.id} className="resource-card">
              <h3>{res.title}</h3>
              <p>{res.description}</p>
              {res.file_url && <a href={res.file_url} target="_blank" rel="noopener noreferrer">Download →</a>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'spotlight' && (
        <div className="spotlights-list">
          {spotlights.map(spot => (
            <div key={spot.id} className="spotlight-item">
              <img src={spot.featured_image} alt={spot.title} className="spotlight-image" />
              <h3>{spot.title}</h3>
              <p>{spot.excerpt}</p>
              <button onClick={() => alert('Full article coming soon')}>Read more</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}