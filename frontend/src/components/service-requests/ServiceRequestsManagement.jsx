import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Send
} from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequests';
import { supplierService } from '../../services/suppliers';
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
    'PO Created': 'bg-purple-100 text-purple-800',
    'Paid': 'bg-green-100 text-green-800'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const SRTypeBadge = ({ type }) => {
  const styles = {
    'payment_request': 'bg-purple-100 text-purple-800',
    'payment_order': 'bg-green-100 text-green-800'
  };
  const labels = {
    'payment_request': 'Payment Request',
    'payment_order': 'Payment Order'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
      {labels[type] || type}
    </span>
  );
};

const ServiceTypeBadge = ({ type }) => {
  const styles = {
    'Rent': 'bg-blue-100 text-blue-800',
    'Job Order': 'bg-orange-100 text-orange-800',
    'Contractor': 'bg-purple-100 text-purple-800',
    'Service': 'bg-teal-100 text-teal-800',
    'Others': 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
};

const ServiceRequestsManagement = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSR, setSelectedSR] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [expandedSRId, setExpandedSRId] = useState(null);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    purpose: '',
    description: '',
    service_type: 'Service',
    sr_type: 'payment_request',
    quantity: '',
    unit: '',
    project: '',
    project_address: '',
    supplier_id: '',
    amount: '',
    date_needed: '',
    remarks: '',
    order_number: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServiceRequests();
    fetchSuppliers();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const data = await serviceRequestService.getAll();
      setServiceRequests(data);
    } catch (err) {
      setError('Failed to fetch service requests');
      console.error('Failed to fetch service requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.purpose.trim()) {
      alert('Purpose is required');
      return;
    }
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      alert('Valid amount is required');
      return;
    }

    setSubmitting(true);
    try {
      await serviceRequestService.create({
        ...formData,
        amount: parseFloat(formData.amount),
        quantity: formData.sr_type === 'payment_request' && formData.quantity ? parseFloat(formData.quantity) : null
      });
      setShowCreateModal(false);
      setFormData({
        purpose: '',
        description: '',
        service_type: 'Service',
        sr_type: 'payment_request',
        quantity: '',
        unit: '',
        project: '',
        project_address: '',
        supplier_id: '',
        amount: '',
        date_needed: '',
        remarks: '',
        order_number: ''
      });
      fetchServiceRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create service request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (sr) => {
    if (!confirm('Are you sure you want to submit this service request?')) return;
    
    try {
      await serviceRequestService.submit(sr.id);
      fetchServiceRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit service request');
    }
  };

  const handleApprove = async (sr, status) => {
    const rejectionReason = status === 'rejected' 
      ? prompt('Enter rejection reason:') 
      : null;
    
    if (status === 'rejected' && !rejectionReason) return;

    try {
      await serviceRequestService.approve(sr.id, status, rejectionReason);
      fetchServiceRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve service request');
    }
  };

  const handleDelete = async (sr) => {
    if (!confirm('Are you sure you want to delete this service request?')) return;
    
    try {
      await serviceRequestService.delete(sr.id);
      fetchServiceRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service request');
    }
  };

  const toggleExpand = (srId) => {
    setExpandedSRId(expandedSRId === srId ? null : srId);
  };

  const filteredSRs = serviceRequests.filter(sr =>
    sr.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sr.sr_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sr.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-500 mt-1">Manage rent, job orders, and contractor services</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Service Request
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search service requests..."
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

      {/* Service Requests List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredSRs.map((sr) => (
            <div key={sr.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-900">{sr.sr_number}</p>
                    <StatusBadge status={sr.status} />
                    <SRTypeBadge type={sr.sr_type || 'payment_request'} />
                    <ServiceTypeBadge type={sr.service_type} />
                  </div>
                  <p className="text-sm text-gray-900 mt-1 truncate">{sr.purpose}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Amount: ₱{parseFloat(sr.amount).toLocaleString()}</span>
                    {sr.quantity && <span>Qty: {sr.quantity} {sr.unit}</span>}
                    {sr.supplier_name && <span>Supplier: {sr.supplier_name}</span>}
                    {sr.date_needed && (
                      <span>Needed: {new Date(sr.date_needed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Engineer actions */}
                  {user?.role === 'engineer' && sr.status === 'Draft' && sr.requested_by === user?.id && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleSubmit(sr)}>
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sr)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  {/* Admin approval actions */}
                  {canApprove && (sr.status === 'Pending' || sr.status === 'For Approval') && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApprove(sr, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApprove(sr, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(sr.id)}>
                    {expandedSRId === sr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedSRId === sr.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Project:</span>
                      <span className="ml-2 text-gray-900">{sr.project || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Project Address:</span>
                      <span className="ml-2 text-gray-900">{sr.project_address || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Description:</span>
                      <span className="ml-2 text-gray-900">{sr.description || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Remarks:</span>
                      <span className="ml-2 text-gray-900">{sr.remarks || '-'}</span>
                    </div>
                    {sr.rejection_reason && (
                      <div className="col-span-2">
                        <span className="text-red-500">Rejection Reason:</span>
                        <span className="ml-2 text-red-700">{sr.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredSRs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No service requests found
            </div>
          )}
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Service Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter purpose of this service request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="Rent">Rent</option>
                  <option value="Job Order">Job Order</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Service">Service</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SR Type *</label>
                <select
                  value={formData.sr_type}
                  onChange={(e) => setFormData({ ...formData, sr_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="payment_request">Payment Request (Amount + Quantity)</option>
                  <option value="payment_order">Payment Order (Amount Only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.sr_type === 'payment_request' 
                    ? 'Requires quantity and unit (e.g., 10 hours, 5 days)' 
                    : 'Amount only - no quantity tracking'}
                </p>
              </div>

              {/* Quantity/Unit fields - only for Payment Request */}
              {formData.sr_type === 'payment_request' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., 10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., hours, days, pcs"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Detailed description of the service needed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0.00"
                  />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                <input
                  type="text"
                  value={formData.project_address}
                  onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Supplier</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="">Select supplier (optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name || supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

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

export default ServiceRequestsManagement;
