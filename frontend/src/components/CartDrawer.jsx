import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import CheckoutModal from './CheckoutModal';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutClick = () => setShowCheckout(true);
  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setIsOpen(false);
  };

  if (cartItems.length === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Cart Button – left side */}
      {getTotalItems() > 0 && (
        <Draggable>
          <button className="cart-floating-button" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="cart-badge">{getTotalItems()}</span>
          </button>
        </Draggable>
      )}

      {/* Cart Drawer – draggable */}
      {isOpen && (
        <Draggable handle=".cart-header">
          <div className="cart-drawer">
            <div className="cart-header">
              <h3>Your Cart</h3>
              <button className="cart-close" onClick={() => setIsOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="cart-items">
              {cartItems.length === 0 && <p>Your cart is empty.</p>}
              {cartItems.map(item => (
                <div key={`${item.type}-${item.id}`} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-type">{item.type}</div>
                    <div className="cart-item-price">M{item.price}</div>
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.type)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">Total: M{getTotalPrice()}</div>
              <button className="checkout-button" onClick={handleCheckoutClick}>Checkout</button>
            </div>
          </div>
        </Draggable>
      )}

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onSuccess={handleCheckoutSuccess} />
    </>
  );
};

export default CartDrawer;