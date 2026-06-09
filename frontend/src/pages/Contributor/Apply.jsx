import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'art', label: 'Artist (Visual Art)' },
  { value: 'fashion', label: 'Fashion Designer' },
  { value: 'music', label: 'Musician' },
  { value: 'architecture', label: 'Architect' },
  { value: 'events', label: 'Event Organiser' },
  { value: 'accommodation', label: 'Accommodation Provider' },
];

export default function ApplyContributor() {
  const [contributorTypes, setContributorTypes] = useState([]);
  const [primaryType, setPrimaryType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contributorTypes.length === 0 || !primaryType) {
      toast.error('Select at least one category and a primary type');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/contributor/apply', { contributor_types: contributorTypes, primary_type: primaryType });
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Become a Contributor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Select your categories (multiple)</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <label key={t.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={t.value}
                  checked={contributorTypes.includes(t.value)}
                  onChange={(e) => {
                    if (e.target.checked) setContributorTypes([...contributorTypes, t.value]);
                    else setContributorTypes(contributorTypes.filter(v => v !== t.value));
                  }}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label>Primary category</label>
          <select value={primaryType} onChange={e => setPrimaryType(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}