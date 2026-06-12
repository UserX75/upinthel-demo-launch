import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Carousel from './Carousel';
import ClothingItemModal from './ClothingItemModal';
import BrandModal from './BrandModal';
import './FashionSection.css';

export default function FashionSection() {
  const { user } = useAuth();
  const [clothingItems, setClothingItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [followedBrands, setFollowedBrands] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    if (user) fetchFollowedBrands();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, brandsRes] = await Promise.all([
        api.get('/api/fashion'),
        api.get('/api/fashion/brands'),
      ]);
      setClothingItems(itemsRes.data);
      setBrands(brandsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedBrands = async () => {
    const res = await api.get('/api/follows/brands');
    setFollowedBrands(res.data);
  };

  const renderClothingCard = (item) => (
    <div className="fashion-card">
      <img src={item.image_url} alt={item.name} />
      <h4>{item.name}</h4>
      <p>M{item.price}</p>
    </div>
  );

  const renderBrandCard = (brand) => (
    <div className="brand-card">
      <img src={brand.logo_url} alt={brand.name} />
      <h4>{brand.name}</h4>
      {brand.is_verified && <span className="verified-badge">✓</span>}
    </div>
  );

  if (loading) return <div className="loading">Loading fashion...</div>;

  return (
    <div>
      <h3 className="section-title">New Arrivals</h3>
      <Carousel
        items={clothingItems}
        renderItem={renderClothingCard}
        itemsPerView={3}
        autoSlideInterval={4000}
        onItemClick={(item) => setSelectedItem(item)}
      />

      <h3 className="section-title">Featured Brands</h3>
      <Carousel
        items={brands}
        renderItem={renderBrandCard}
        itemsPerView={3}
        autoSlideInterval={6000}
        onItemClick={(brand) => setSelectedBrand(brand)}
      />

      {user && (
        <div className="followed-brands">
          <h3>Brands You Follow</h3>
          <div className="items-grid">
            {followedBrands.map(f => (
              <div key={f.brand_id} className="brand-card" onClick={() => setSelectedBrand(f.fashion_brands)}>
                <img src={f.fashion_brands?.logo_url} alt={f.fashion_brands?.name} />
                <h4>{f.fashion_brands?.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItem && <ClothingItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {selectedBrand && <BrandModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />}
    </div>
  );
}