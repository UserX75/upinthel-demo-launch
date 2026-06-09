import { useEffect, useState } from 'react';
import axios from 'axios';
import InternshipCard from '../components/InternshipCard';
import PostInternshipModal from '../components/PostInternshipModal';
import './Internships.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    fetchInternships();
  }, [districtFilter]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (districtFilter) params.append('district', districtFilter);
      const res = await axios.get(`${API_BASE}/api/internships?${params.toString()}`);
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="internships-page">
      <div className="internships-hero">
        <h1>Internships</h1>
        <p>Launch your career with hands‑on experience.</p>
        <button className="post-btn" onClick={() => setShowPostModal(true)}>+ Post an Internship</button>
      </div>
      <div className="filters">
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
          <option value="">All Districts</option>
          <option value="Maseru">Maseru</option>
          <option value="Mokhotlong">Mokhotlong</option>
          <option value="Leribe">Leribe</option>
          <option value="Butha-Buthe">Butha-Buthe</option>
          <option value="Berea">Berea</option>
          <option value="Mafeteng">Mafeteng</option>
          <option value="Mohale's Hoek">Mohale's Hoek</option>
          <option value="Qacha's Nek">Qacha's Nek</option>
          <option value="Quthing">Quthing</option>
          <option value="Thaba-Tseka">Thaba-Tseka</option>
        </select>
      </div>
      {loading ? (
        <div className="loading">Loading internships...</div>
      ) : (
        <div className="internships-grid">
          {internships.map(intern => (
            <InternshipCard key={intern.id} internship={intern} />
          ))}
        </div>
      )}
      {showPostModal && <PostInternshipModal onClose={() => setShowPostModal(false)} onPosted={fetchInternships} />}
    </div>
  );
}