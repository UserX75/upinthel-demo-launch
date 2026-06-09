import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RequestPayout() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/contributor/stats').then(res => setBalance(res.data.available_balance)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1000) return toast.error('Minimum payout is M1000');
    if (val > balance) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      await api.post('/api/contributor/request-payout', { amount: val, payment_method: method });
      toast.success('Payout requested. We will process within 7 days.');
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Request Payout</h2>
      <p>Available balance: <strong>M{balance.toFixed(2)}</strong></p>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label>Amount (M)</label>
          <input type="number" min="1000" max={balance} value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div>
          <label>Payment Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            <option value="mpesa">M‑Pesa</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
        {method === 'mpesa' && (
          <input type="text" placeholder="M‑Pesa phone number" value={phone} onChange={e => setPhone(e.target.value)} required />
        )}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Requesting...' : 'Request Payout'}
        </button>
      </form>
    </div>
  );
}