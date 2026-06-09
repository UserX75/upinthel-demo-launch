import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const EarthExplorer = ({ onExplore }) => {
  const globeEl = useRef();

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.8;
      globeEl.current.controls().enableZoom = true;
      globeEl.current.controls().enablePan = true;
    }
  }, []);

  // Marker with a flag emoji (you can replace with an image URL)
  const lesothoMarker = {
    lat: -29.31,
    lng: 27.48,
    label: 'Lesotho',
    html: '<div style="font-size: 28px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));">🇱🇸</div>',
    // Uncomment below to use an actual flag image:
    // html: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Flag_of_Lesotho.svg/40px-Flag_of_Lesotho.svg.png" width="32" height="24" />'
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '70vh', cursor: 'default' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere
        atmosphereColor="#3B82F6"
        atmosphereAltitude={0.25}
        pointsData={[lesothoMarker]}
        pointLat="lat"
        pointLng="lng"
        pointLabel="label"
        pointAltitude={0.05}
        pointRadius={0.5}
        pointColor="color"
        pointHtml="html"   // Render HTML (emoji or image) instead of default marker
      />
      <div className="earth-overlay" onClick={onExplore}>
        <FontAwesomeIcon icon={faGlobe} /> Explore LS
      </div>
    </div>
  );
};

export default EarthExplorer;