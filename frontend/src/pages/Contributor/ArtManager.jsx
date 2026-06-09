import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ArtManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', price: '', image_url: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await api.get('/api/contributor/art');
    setItems(res.data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contributor/art', form);
      toast.success('Artwork added');
      fetchItems();
      setForm({ title: '', description: '', price: '', image_url: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete?')) {
      await api.delete(`/api/contributor/art/${id}`);
      fetchItems();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Manage Art</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
        <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full p-2 border mb-2" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border mb-2" />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full p-2 border mb-2" />
        <input type="text" placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full p-2 border mb-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Artwork</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="border rounded p-4">
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded" />
            <h3 className="font-bold">{item.title}</h3>
            <p>M{item.price}</p>
            <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}