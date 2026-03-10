import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  return (
    <button 
      className={`rounded-lg font-medium transition-colors flex items-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input 
    className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${className}`}
    {...props}
  />
);

const OrderNumbers = () => {
  const [orderNumbers, setOrderNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    order_number: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchOrderNumbers();
  }, []);

  const fetchOrderNumbers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData = [
        { id: 1, order_number: 'ORD-2024-001', description: 'Office Supplies', status: 'active', created_at: '2024-03-01' },
        { id: 2, order_number: 'ORD-2024-002', description: 'IT Equipment', status: 'active', created_at: '2024-03-05' },
        { id: 3, order_number: 'ORD-2024-003', description: 'Furniture', status: 'inactive', created_at: '2024-03-10' }
      ];
      setOrderNumbers(mockData);
    } catch (error) {
      console.error('Failed to fetch order numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({ order_number: '', description: '', status: 'active' });
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({ ...order });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order number?')) {
      try {
        // Replace with actual API call
        setOrderNumbers(orderNumbers.filter(o => o.id !== id));
      } catch (error) {
        console.error('Failed to delete order number:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        // Update existing
        setOrderNumbers(orderNumbers.map(o => 
          o.id === editingOrder.id ? { ...o, ...formData } : o
        ));
      } else {
        // Create new
        const newOrder = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString().split('T')[0]
        };
        setOrderNumbers([...orderNumbers, newOrder]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save order number:', error);
    }
  };

  const filteredOrders = orderNumbers.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Numbers</h1>
          <p className="text-gray-500">Manage order numbering system</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-5 h-5" />
          Add Order Number
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search order numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 text-gray-600">{order.description}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-gray-600">{order.created_at}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(order)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No order numbers found</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingOrder ? 'Edit Order Number' : 'Add Order Number'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                  <Input
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    placeholder="e.g., ORD-2024-001"
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description of this order number"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderNumbers;
