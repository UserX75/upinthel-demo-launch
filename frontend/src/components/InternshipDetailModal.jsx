import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function InternshipDetailModal({ internship, onClose }) {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!applicantName || !applicantEmail) return alert('Please enter your name and email');
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/internships/apply`, {
        internship_id: internship.id,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        cover_letter: coverLetter,
      });
      alert('Application submitted! Good luck.');
      onClose();
    } catch (err) {
      alert('Application failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <h2>{internship.title}</h2>
        <p><strong>Company:</strong> {internship.company_name}</p>
        <p><strong>Location:</strong> {internship.location}</p>
        <p><strong>Duration:</strong> {internship.duration}</p>
        {internship.stipend && <p><strong>Stipend:</strong> M{internship.stipend}</p>}
        <p><strong>Deadline:</strong> {new Date(internship.application_deadline).toLocaleDateString()}</p>
        <h3>Description</h3>
        <p>{internship.description}</p>
        <h3>Requirements</h3>
        <p>{internship.requirements}</p>
        <hr />
        <h3>Apply Now</h3>
        <input type="text" placeholder="Your full name" value={applicantName} onChange={e => setApplicantName(e.target.value)} />
        <input type="email" placeholder="Your email address" value={applicantEmail} onChange={e => setApplicantEmail(e.target.value)} />
        <textarea placeholder="Cover letter / Why you're a good fit" rows="4" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
        <button onClick={handleApply} disabled={submitting}>
          <FontAwesomeIcon icon={faPaperPlane} /> {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}