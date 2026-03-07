import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  ChevronUp,
  Trash2,
  Send,
  Edit2
} from 'lucide-react';
import { cashRequestService } from '../../services/cashRequests';
import { useAuth } from '../../contexts/AuthContext';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'For Approval': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-500',
    'DV Created': 'bg-purple-100 text-purple-800',
    'Paid': 'bg-green-100 text-green-800'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const CashRequestsManagement = () => {
  const [cashRequests, setCashRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCR, setSelectedCR] = useState(null);
  const [expandedCRId, setExpandedCRId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    receiver: '',
    address: '',
    purpose: '',
    project: '',
    project_address: '',
    date_needed: '',
    remarks: '',
    order_number: '',
    items: [{ quantity: '', unit: '', description: '', unit_cost: '' }]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCashRequests();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await fetch('https://jajr.xandree.com/get_branches_api.php', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      let branchList = [];
      if (Array.isArray(data)) branchList = data;
      else if (data && Array.isArray(data.data)) branchList = data.data;
      else if (data && Array.isArray(data.branches)) branchList = data.branches;
      
      setBranches(branchList);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleProjectChange = (projectName) => {
    const selectedBranch = branches.find(b => b?.branch_name === projectName);
    setFormData(prev => ({
      ...prev,
      project: projectName,
      project_address: selectedBranch?.branch_address || '',
      order_number: selectedBranch?.order_number || ''
    }));
  };

  const fetchCashRequests = async () => {
    try {
      setLoading(true);
      const data = await cashRequestService.getAll();
      setCashRequests(data);
    } catch (err) {
      setError('Failed to fetch cash requests');
      console.error('Failed to fetch cash requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.receiver.trim()) {
      alert('Receiver is required');
      return;
    }

    // Validate items
    const validItems = formData.items.filter(item => 
      item.description.trim() && 
      parseFloat(item.quantity) > 0 && 
      parseFloat(item.unit_cost) >= 0
    );
    
    if (validItems.length === 0) {
      alert('At least one valid item is required');
      return;
    }

    setSubmitting(true);
    try {
      await cashRequestService.create({
        ...formData,
        items: validItems
      });
      setShowCreateModal(false);
      setFormData({
        receiver: '',
        address: '',
        purpose: '',
        project: '',
        project_address: '',
        date_needed: '',
        remarks: '',
        order_number: '',
        items: [{ quantity: '', unit: '', description: '', unit_cost: '' }]
      });
      fetchCashRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create cash request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (cr) => {
    if (!confirm('Are you sure you want to submit this cash request?')) return;
    
    try {
      await cashRequestService.submit(cr.id);
      fetchCashRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit cash request');
    }
  };

  const handleApprove = async (cr, status) => {
    const rejectionReason = status === 'rejected' 
      ? prompt('Enter rejection reason:') 
      : null;
    
    if (status === 'rejected' && !rejectionReason) return;

    try {
      await cashRequestService.approve(cr.id, status, rejectionReason);
      fetchCashRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve cash request');
    }
  };

  const handleDelete = async (cr) => {
    if (!confirm('Are you sure you want to delete this cash request?')) return;
    
    try {
      await cashRequestService.delete(cr.id);
      fetchCashRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete cash request');
    }
  };

  const toggleExpand = (crId) => {
    setExpandedCRId(expandedCRId === crId ? null : crId);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { quantity: '', unit: '', description: '', unit_cost: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemAmount = (qty, unitCost) => {
    const q = parseFloat(qty) || 0;
    const uc = parseFloat(unitCost) || 0;
    return (q * uc).toFixed(2);
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
    }, 0).toFixed(2);
  };

  const filteredCRs = cashRequests.filter(cr =>
    cr.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cr.cr_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cr.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = ['engineer', 'admin', 'super_admin'].includes(user?.role);
  const canApprove = ['admin', 'super_admin'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Requests</h1>
          <p className="text-gray-500 mt-1">Manage cash disbursement requests with line items</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Cash Request
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cash requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Cash Requests List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredCRs.map((cr) => (
            <div key={cr.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-900">{cr.cr_number}</p>
                    <StatusBadge status={cr.status} />
                  </div>
                  <p className="text-sm text-gray-900 mt-1 truncate">{cr.purpose || cr.receiver}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Receiver: {cr.receiver}</span>
                    <span>Amount: ₱{parseFloat(cr.amount).toLocaleString()}</span>
                    {cr.project && <span>Project: {cr.project}</span>}
                    {cr.date_needed && (
                      <span>Needed: {new Date(cr.date_needed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Engineer actions */}
                  {user?.role === 'engineer' && cr.status === 'Draft' && cr.requested_by === user?.id && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleSubmit(cr)}>
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cr)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  {/* Admin approval actions */}
                  {canApprove && (cr.status === 'Pending' || cr.status === 'For Approval') && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApprove(cr, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApprove(cr, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(cr.id)}>
                    {expandedCRId === cr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedCRId === cr.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Project:</span>
                      <span className="ml-2 text-gray-900">{cr.project || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Project Address:</span>
                      <span className="ml-2 text-gray-900">{cr.project_address || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Receiver Address:</span>
                      <span className="ml-2 text-gray-900">{cr.address || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Order Number:</span>
                      <span className="ml-2 text-gray-900">{cr.order_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Remarks:</span>
                      <span className="ml-2 text-gray-900">{cr.remarks || '-'}</span>
                    </div>
                    {cr.rejection_reason && (
                      <div className="col-span-2">
                        <span className="text-red-500">Rejection Reason:</span>
                        <span className="ml-2 text-red-700">{cr.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredCRs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No cash requests found
            </div>
          )}
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Cash Request</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Receiver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver *</label>
                <input
                  type="text"
                  value={formData.receiver}
                  onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter receiver name"
                />
              </div>

              {/* Receiver Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter receiver address"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter purpose of this cash request"
                />
              </div>

              {/* Project and Date Needed */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    value={formData.project}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    disabled={loadingBranches || branches.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">
                      {loadingBranches ? 'Loading...' : branches.length === 0 ? 'No projects available' : 'Select project'}
                    </option>
                    {branches.map((branch, index) => (
                      <option key={branch?.id ?? index} value={branch?.branch_name || ''}>{branch?.branch_name || ''}</option>
                    ))}
                  </select>
                  {branches.length === 0 && !loadingBranches && (
                    <p className="text-xs text-red-500 mt-1">Failed to load projects. Please refresh the page.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Needed</label>
                  <input
                    type="date"
                    value={formData.date_needed}
                    onChange={(e) => setFormData({ ...formData, date_needed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Project Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                <input
                  type="text"
                  value={formData.project_address}
                  onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
                  placeholder="Enter project address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  placeholder="Order number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items *</label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                          placeholder="Unit Cost"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={calculateItemAmount(item.quantity, item.unit_cost)}
                          readOnly
                          placeholder="Amount"
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-50"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" onClick={addItem} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="bg-gray-100 px-4 py-2 rounded">
                  <span className="font-medium">Total: </span>
                  <span className="font-bold">₱{parseFloat(calculateTotal()).toLocaleString()}</span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CashRequestsManagement;
