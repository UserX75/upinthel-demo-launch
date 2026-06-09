import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPalette, faCompass, faCalendar, faNewspaper, faBuilding, faInfoCircle, faCity, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Home', icon: faHome },
    { path: '/culture', label: 'Culture', icon: faPalette },
    { path: '/explore', label: 'Explore', icon: faCompass },
    { path: '/events', label: 'Events', icon: faCalendar },
    { path: '/news', label: 'News', icon: faNewspaper },
    { path: '/architecture', label: 'Architecture', icon: faCity },
    { path: '/about', label: 'About', icon: faInfoCircle },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo"><img src="/assets/logo.jpg" alt="UP IN THE L" /></div>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {menuItems.map(item => (
            <li key={item.path}>
              <Link to={item.path} onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={item.icon} /> {item.label}
              </Link>
            </li>
          ))}
          {/* Business Dropdown */}
          <li className="dropdown" onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}>
            <span className="dropdown-trigger">
              <FontAwesomeIcon icon={faBuilding} /> Business <FontAwesomeIcon icon={faChevronDown} size="xs" />
            </span>
            {businessDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/business" onClick={() => { setIsMenuOpen(false); setBusinessDropdownOpen(false); }}>Directory</Link></li>
                <li><Link to="/internships" onClick={() => { setIsMenuOpen(false); setBusinessDropdownOpen(false); }}>Internships</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}