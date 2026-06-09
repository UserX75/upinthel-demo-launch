import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Architecture.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Architecture() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchitects();
  }, []);

  const fetchArchitects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/architects`);
      setArchitects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="architecture-page">
      <div className="architecture-hero">
        <h1>Architecture</h1>
        <p>Explore portfolios, purchase plans, and connect with Lesotho's top architects.</p>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="architects-grid">
          {architects.map(arch => (
            <Link to={`/architect/${arch.id}`} key={arch.id} className="architect-card-link">
              <div className="architect-card">
                <img src={arch.logo_url || '/architect-placeholder.png'} alt={arch.company_name} />
                <h3>{arch.company_name}</h3>
                <p>{arch.location}</p>
                <span className="view-portfolio">View Portfolio →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}