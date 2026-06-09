import { useState } from 'react';
import InternshipDetailModal from './InternshipDetailModal';

export default function InternshipCard({ internship }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="internship-card" onClick={() => setShowModal(true)}>
        <div className="internship-card-header">
          <h3>{internship.title}</h3>
          <span className="company">{internship.company_name}</span>
        </div>
        <div className="internship-card-body">
          <p><strong>Location:</strong> {internship.location}</p>
          <p><strong>Duration:</strong> {internship.duration}</p>
          {internship.stipend && <p><strong>Stipend:</strong> M{internship.stipend}</p>}
          <p><strong>Deadline:</strong> {new Date(internship.application_deadline).toLocaleDateString()}</p>
        </div>
      </div>
      {showModal && <InternshipDetailModal internship={internship} onClose={() => setShowModal(false)} />}
    </>
  );
}