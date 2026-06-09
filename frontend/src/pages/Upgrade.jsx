import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMobileAlt, faUniversity, faMoneyBillWave, faCrown, faCheckCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import './Upgrade.css';

export default function Upgrade() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleProceed = () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (paymentMethod !== 'cash' && !phone && paymentMethod !== 'paypal') {
      toast.error('Please enter your phone number');
      return;
    }
    if (paymentMethod === 'paypal' && !email) {
      toast.error('Please enter your PayPal email');
      return;
    }
    setLoading(true);
    // Simulate payment processing (2 seconds delay)
    setTimeout(async () => {
      try {
        await api.post('/api/user/upgrade', { user_id: user.id, plan_type: plan });
        toast.success('Upgrade successful! Welcome to Premium.');
        setShowPaymentModal(false);
        // Reload to update user role in the app
        window.location.reload();
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Upgrade failed');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="upgrade-page">
      <div className="upgrade-hero">
        <div className="floating-icons">
          <FontAwesomeIcon icon={faCrown} className="float-icon" />
          <FontAwesomeIcon icon={faCheckCircle} className="float-icon delay-1" />
          <FontAwesomeIcon icon={faCrown} className="float-icon delay-2" />
          <FontAwesomeIcon icon={faCheckCircle} className="float-icon delay-3" />
        </div>
        <h1>Unlock Premium Access</h1>
        <p>Get rid of ads, post your content, and reach more customers.</p>
      </div>

      <div className="pricing-cards">
        <div className={`pricing-card ${plan === 'monthly' ? 'active' : ''}`} onClick={() => setPlan('monthly')}>
          <h3>Monthly</h3>
          <div className="price">M22 <span>/month</span></div>
          <ul>
            <li>✅ No ads</li>
            <li>✅ Post your art/music/fashion</li>
            <li>✅ Priority support</li>
            <li>✅ Early access</li>
          </ul>
          {plan === 'monthly' && <div className="selected-badge">Selected</div>}
        </div>
        <div className={`pricing-card ${plan === 'yearly' ? 'active' : ''}`} onClick={() => setPlan('yearly')}>
          <h3>Yearly</h3>
          <div className="price">M187 <span>/year</span></div>
          <ul>
            <li>✅ No ads</li>
            <li>✅ Post your art/music/fashion</li>
            <li>✅ Priority support</li>
            <li>✅ Early access</li>
            <li>✅ Save M77</li>
          </ul>
          {plan === 'yearly' && <div className="selected-badge">Selected</div>}
        </div>
      </div>

      <button className="upgrade-cta" onClick={handleProceed}>
        Upgrade to {plan === 'monthly' ? 'Monthly' : 'Yearly'} <FontAwesomeIcon icon={faArrowRight} />
      </button>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Complete Payment</h3>
            <p>Plan: {plan === 'monthly' ? 'Monthly (M22)' : 'Yearly (M187'}</p>
            <div className="payment-methods">
              <label className={paymentMethod === 'mpesa' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                <FontAwesomeIcon icon={faMobileAlt} /> M-Pesa
              </label>
              <label className={paymentMethod === 'ecocash' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} />
                <FontAwesomeIcon icon={faMobileAlt} /> EcoCash
              </label>
              <label className={paymentMethod === 'paypal' ? 'active' : ''}>
                <input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                <FontAwesomeIcon icon={faPaypal} /> PayPal
              </label>
            </div>
            {(paymentMethod === 'mpesa' || paymentMethod === 'ecocash') && (
              <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
            )}
            {paymentMethod === 'paypal' && (
              <input type="email" placeholder="PayPal email" value={email} onChange={e => setEmail(e.target.value)} />
            )}
            <button onClick={handlePayment} disabled={loading} className="pay-btn">
              {loading ? 'Processing...' : `Pay M${plan === 'monthly' ? '22' : '187'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}