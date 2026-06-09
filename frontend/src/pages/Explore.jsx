import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EarthExplorer from '../components/EarthExplorer';
import DistrictCard from '../components/DistrictCard';
import AccommodationModal from '../components/AccommodationModal';
import AttractionModal from '../components/AttractionModal';
import PackageModal from '../components/PackageModal';
import './Explore.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Explore = () => {
  const [mode, setMode] = useState('earth');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState('accommodation');
  const [loading, setLoading] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Fetch districts when mode changes to 'districts'
  useEffect(() => {
    if (mode === 'districts' && districts.length === 0) {
      setLoading(true);
      axios.get('/api/explore/districts')
        .then(res => setDistricts(res.data))
        .catch(err => console.error('Error fetching districts:', err))
        .finally(() => setLoading(false));
    }
  }, [mode, districts.length]);

  // Fetch listings when a district is selected
  useEffect(() => {
    if (selectedDistrict) {
      setLoading(true);
      Promise.all([
        axios.get(`/api/explore/${selectedDistrict.name}/accommodations`),
        axios.get(`/api/explore/${selectedDistrict.name}/attractions`),
        axios.get(`/api/explore/${selectedDistrict.name}/packages`)
      ])
        .then(([accRes, attRes, pkgRes]) => {
          setAccommodations(accRes.data);
          setAttractions(attRes.data);
          setPackages(pkgRes.data);
        })
        .catch(err => console.error('Error fetching listings:', err))
        .finally(() => setLoading(false));
    }
  }, [selectedDistrict]);

  const handleExplore = () => setMode('districts');
  const handleBackToEarth = () => { setMode('earth'); setSelectedDistrict(null); };
  const handleBackToDistricts = () => { setMode('districts'); setSelectedDistrict(null); };
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setMode('listings');
    setActiveTab('accommodation');
  };

  // Earth view
  if (mode === 'earth') {
    return <EarthExplorer onExplore={handleExplore} />;
  }

  // District grid view
  if (mode === 'districts') {
    if (loading) return <div className="loading">Loading districts...</div>;
    return (
      <div className="explore-districts">
        <button className="back-button" onClick={handleBackToEarth}>← Back to Earth</button>
        <h2>Choose a District</h2>
        <div className="districts-grid">
          {districts.map(district => (
            <DistrictCard key={district.id} district={district} onClick={handleSelectDistrict} />
          ))}
        </div>
      </div>
    );
  }

  // Listings view (after district selected)
  if (mode === 'listings' && selectedDistrict) {
    if (loading) return <div className="loading">Loading places in {selectedDistrict.name}...</div>;
    return (
      <>
        <div className="explore-listings">
          <button className="back-button" onClick={handleBackToDistricts}>← Back to districts</button>
          <h2>{selectedDistrict.name}</h2>
          <div className="listings-tabs">
            <button className={activeTab === 'accommodation' ? 'active' : ''} onClick={() => setActiveTab('accommodation')}>
              Accommodation
            </button>
            <button className={activeTab === 'attractions' ? 'active' : ''} onClick={() => setActiveTab('attractions')}>
              Attractions
            </button>
            <button className={activeTab === 'packages' ? 'active' : ''} onClick={() => setActiveTab('packages')}>
              Tour Packages
            </button>
          </div>
          <div className="listings-content">
            {activeTab === 'accommodation' && (
              <div className="items-grid">
                {accommodations.map(item => (
                  <div
                    key={item.id}
                    className="explore-card"
                    onClick={() => { setModalItem(item); setModalType('accommodation'); }}
                  >
                    <img src={item.image} alt={item.name} className="explore-card-img" />
                    <div className="explore-card-content">
                      <h3>{item.name}</h3>
                      <p className="location">{item.location}</p>
                      <p className="price">M{item.price_per_night}/night</p>
                    </div>
                  </div>
                ))}
                {accommodations.length === 0 && <p>No accommodations found in this district yet.</p>}
              </div>
            )}
            {activeTab === 'attractions' && (
              <div className="items-grid">
                {attractions.map(item => (
                  <div
                    key={item.id}
                    className="explore-card"
                    onClick={() => { setModalItem(item); setModalType('attraction'); }}
                  >
                    <img src={item.image} alt={item.name} className="explore-card-img" />
                    <div className="explore-card-content">
                      <h3>{item.name}</h3>
                      <p className="duration">{item.duration}</p>
                      <p className="price">M{item.price}/person</p>
                    </div>
                  </div>
                ))}
                {attractions.length === 0 && <p>No attractions found in this district yet.</p>}
              </div>
            )}
            {activeTab === 'packages' && (
              <div className="items-grid">
                {packages.map(item => (
                  <div
                    key={item.id}
                    className="explore-card"
                    onClick={() => { setModalItem(item); setModalType('package'); }}
                  >
                    <img src={item.image_url} alt={item.title} className="explore-card-img" />
                    <div className="explore-card-content">
                      <h3>{item.title}</h3>
                      <p className="duration">{item.duration_days} days</p>
                      <p className="price">M{item.price}</p>
                    </div>
                  </div>
                ))}
                {packages.length === 0 && <p>No tour packages found in this district yet.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Modals – rendered inside the same return */}
        {modalItem && modalType === 'accommodation' && (
          <AccommodationModal item={modalItem} onClose={() => { setModalItem(null); setModalType(null); }} />
        )}
        {modalItem && modalType === 'attraction' && (
          <AttractionModal item={modalItem} onClose={() => { setModalItem(null); setModalType(null); }} />
        )}
        {modalItem && modalType === 'package' && (
          <PackageModal item={modalItem} onClose={() => { setModalItem(null); setModalType(null); }} />
        )}
      </>
    );
  }

  return null;
};

export default Explore;