import React, { useState, useEffect } from 'react';
import { itemService } from '../services/items';
import { useAuth } from '../contexts/AuthContext';

// Example: How to connect to backend API
const ItemsExample = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading items...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Items from Database</h2>
      <p className="text-sm text-gray-600 mb-4">
        Logged in as: {user?.first_name} {user?.last_name} ({user?.role})
      </p>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="border p-3 rounded bg-white shadow">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Category: {item.category_name} | Unit: {item.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsExample;
