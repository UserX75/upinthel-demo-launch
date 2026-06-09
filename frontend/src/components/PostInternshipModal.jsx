import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function PostInternshipModal({ onClose, onPosted }) {
  const [form, setForm] = useState({
    title: '',
    company_name: '',
    location: '',
    district: '',
    duration: '',
    stipend: '',
    application_deadline: '',
    description: '',
    requirements: '',
    contact_email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company_name || !form.location || !form.duration || !form.application_deadline) {
      alert('Please fill required fields (title, company, location, duration, deadline).');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/internships`, form);
      alert('Internship posted! It will appear after admin approval (or immediately).');
      onPosted();
      onClose();
    } catch (err) {
      alert('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <h2>Post an Internship</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Title *" value={form.title} onChange={handleChange} required />
          <input type="text" name="company_name" placeholder="Company name *" value={form.company_name} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location (city/town) *" value={form.location} onChange={handleChange} required />
          <select name="district" value={form.district} onChange={handleChange}>
            <option value="">Select district</option>
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
          <input type="text" name="duration" placeholder="Duration (e.g., 3 months) *" value={form.duration} onChange={handleChange} required />
          <input type="number" name="stipend" placeholder="Stipend (M) – optional" value={form.stipend} onChange={handleChange} />
          <input type="date" name="application_deadline" value={form.application_deadline} onChange={handleChange} required />
          <textarea name="description" placeholder="Description of role" rows="4" value={form.description} onChange={handleChange} />
          <textarea name="requirements" placeholder="Requirements (skills, qualifications)" rows="3" value={form.requirements} onChange={handleChange} />
          <input type="email" name="contact_email" placeholder="Contact email for applicants" value={form.contact_email} onChange={handleChange} />
          <button type="submit" disabled={submitting}><FontAwesomeIcon icon={faPlus} /> {submitting ? 'Posting...' : 'Post Internship'}</button>
        </form>
      </div>
    </div>
  );
}