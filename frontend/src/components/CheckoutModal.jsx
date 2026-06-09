import { useState } from 'react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMobileAlt, faUniversity, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';

export default function CheckoutModal({ isOpen, onClose, onSuccess }) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({ guest_name: '', guest_email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_email) return alert('Name and email required');
    setLoading(true);
    try {
      const payload = { ...formData, items: cartItems, total_amount: getTotalPrice(), payment_method: paymentMethod };
      await api.post('/api/orders', payload);
      alert('Order placed! (Payment simulated)');
      clearCart();
      onSuccess();
      onClose();
    } catch (err) { alert('Checkout failed'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <h2>Complete Your Order</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="guest_name" placeholder="Full name" value={formData.guest_name} onChange={handleChange} required />
          <input type="email" name="guest_email" placeholder="Email" value={formData.guest_email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone (optional)" value={formData.phone} onChange={handleChange} />
          <div className="payment-methods">
            <label className={paymentMethod === 'mpesa' ? 'active' : ''}>
              <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
              <FontAwesomeIcon icon={faMobileAlt} /> M-Pesa
            </label>
            <label className={paymentMethod === 'ecocash' ? 'active' : ''}>
              <input type="radio" name="payment" value="ecocash" checked={paymentMethod === 'ecocash'} onChange={() => setPaymentMethod('ecocash')} />
              <FontAwesomeIcon icon={faMobileAlt} /> EcoCash
            </label>
            <label className={paymentMethod === 'paypal' ? 'active' : ''}>
              <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
              <FontAwesomeIcon icon={faPaypal} /> PayPal
            </label>
            <label className={paymentMethod === 'cash' ? 'active' : ''}>
              <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
              <FontAwesomeIcon icon={faMoneyBillWave} /> Cash on Arrival
            </label>
          </div>
          <div className="order-total">Total: M{getTotalPrice().toFixed(2)}</div>
          <button type="submit" disabled={loading} className="checkout-btn">Place Order</button>
        </form>
      </div>
    </div>
  );
}