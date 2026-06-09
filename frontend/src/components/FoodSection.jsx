import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUtensils, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function FoodSection() {
  const { addToCart } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/explore/restaurants`)
      .then(res => setRestaurants(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openMenu = (restaurant) => {
    // Assume restaurant.menu is array of {name, price, description}
    setMenuItems(restaurant.menu || []);
    setSelectedRestaurant(restaurant);
  };

  const addToCartHandler = (item) => {
    addToCart({
      id: item.id,
      type: 'food',
      name: item.name,
      price: item.price,
      image: selectedRestaurant.image,
      restaurant: selectedRestaurant.name,
    });
    toast.success(`Added ${item.name} to cart`);
  };

  if (loading) return <div className="loading">Loading restaurants...</div>;

  return (
    <div>
      <div className="items-grid">
        {restaurants.map(rest => (
          <div key={rest.id} className="restaurant-card">
            <img src={rest.image} alt={rest.name} className="restaurant-img" />
            <h3>{rest.name}</h3>
            <p className="cuisine">{rest.cuisine}</p>
            <div className="card-actions">
              <button onClick={() => openMenu(rest)}><FontAwesomeIcon icon={faUtensils} /> Order</button>
              {rest.location_url && <a href={rest.location_url} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faMapMarkerAlt} /> Location</a>}
            </div>
          </div>
        ))}
      </div>

      {selectedRestaurant && (
        <div className="modal-overlay" onClick={() => setSelectedRestaurant(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRestaurant(null)}>✖</button>
            <h2>{selectedRestaurant.name} – Menu</h2>
            <div className="menu-list">
              {menuItems.map(item => (
                <div key={item.id} className="menu-item">
                  <div>
                    <strong>{item.name}</strong> – M{item.price}
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button onClick={() => addToCartHandler(item)}><FontAwesomeIcon icon={faShoppingCart} /> Add</button>
                </div>
              ))}
              {menuItems.length === 0 && <p>No menu items yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}