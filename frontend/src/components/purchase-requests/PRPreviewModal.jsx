import React from 'react';
import { X, CheckCircle } from 'lucide-react';

// Format helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPaymentTerms = (code, note) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const normalizedNote = String(note || '').trim();
  if (!normalizedCode && normalizedNote) return normalizedNote;
  if (!normalizedCode) return '-';
  if (normalizedCode === 'CUSTOM') return normalizedNote || 'Custom (missing details)';
  if (normalizedCode === 'NET_7') return 'NET 7';
  if (normalizedCode === 'NET_15') return 'NET 15';
  if (normalizedCode === 'NET_30') return 'NET 30';
  return normalizedCode;
};

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'For Approval': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-600',
      'For Procurement Review': 'bg-orange-100 text-orange-800',
      'For Super Admin Final Approval': 'bg-purple-100 text-purple-800',
      'PO Created': 'bg-indigo-100 text-indigo-800',
      'Paid': 'bg-green-100 text-green-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const PRPreviewModal = ({ pr, loading, onClose, onApprove, processingId, readOnly }) => {
  if (!pr) return null;

  // Calculate total from items if not provided
  const calculateTotal = () => {
    if (pr.total_amount || pr.amount) return pr.total_amount || pr.amount;
    if (!pr.items || pr.items.length === 0) return 0;
    return pr.items.reduce((sum, item) => {
      const itemTotal = item.total_price || (item.quantity * (item.unit_price || item.unit_cost || 0));
      return sum + itemTotal;
    }, 0);
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleApprove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onApprove) {
      onApprove(pr.id);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Purchase Request Preview</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Excel-style Form Layout */}
          <div className="border border-gray-300 rounded overflow-hidden">
            {/* Row 1: PR Number and Date */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                PR Number
              </div>
              <div className="col-span-4 px-3 py-2 border-r border-gray-300 text-sm font-mono text-gray-900">
                {pr.pr_number}
              </div>
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Date
              </div>
              <div className="col-span-4 px-3 py-2 text-sm text-gray-900">
                {formatDate(pr.created_at)}
              </div>
            </div>

            {/* Row 2: Payee Name and Payee Address */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Payee Name
              </div>
              <div className="col-span-4 px-3 py-2 border-r border-gray-300 text-sm text-gray-900">
                {pr.supplier_name || pr.payee_name || '-'}
              </div>
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Payee Address
              </div>
              <div className="col-span-4 px-3 py-2 text-sm text-gray-900">
                {pr.supplier_address || pr.payee_address || '-'}
              </div>
            </div>

            {/* Row 3: Project and Project Address */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Project
              </div>
              <div className="col-span-4 px-3 py-2 border-r border-gray-300 text-sm text-gray-900">
                {pr.project || '-'}
              </div>
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Project Address
              </div>
              <div className="col-span-4 px-3 py-2 text-sm text-gray-900">
                {pr.project_address || '-'}
              </div>
            </div>

            {/* Row 4: Order Number and Status */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Order Number
              </div>
              <div className="col-span-4 px-3 py-2 border-r border-gray-300 text-sm text-gray-900">
                {pr.order_number || '-'}
              </div>
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Status
              </div>
              <div className="col-span-4 px-3 py-2 text-sm text-gray-900">
                <StatusBadge status={pr.status} />
              </div>
            </div>

            {/* Row 5: Purpose */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Payment Terms
              </div>
              <div className="col-span-10 px-3 py-2 text-sm text-gray-900">
                {formatPaymentTerms(pr.payment_terms_code, pr.payment_terms_note)}
              </div>
            </div>

            {/* Row 6: Purpose */}
            <div className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                Purpose
              </div>
              <div className="col-span-10 px-3 py-2 text-sm text-gray-900">
                {pr.purpose || '-'}
              </div>
            </div>

            {/* Row 7: Remarks (if present) */}
            {pr.remarks && (
              <div className="grid grid-cols-12 border-b border-gray-300">
                <div className="col-span-2 px-3 py-2 border-r border-gray-300 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                  Remarks
                </div>
                <div className="col-span-10 px-3 py-2 text-sm text-gray-900">
                  {pr.remarks}
                </div>
              </div>
            )}
          </div>

          {/* Items Table - Excel Style */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Items</p>
            {loading ? (
              <div className="flex items-center justify-center py-8 border border-gray-300 rounded">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pr.items && pr.items.length > 0 ? (
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-16">QTY</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-20">UNIT</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border-r border-gray-300">DESCRIPTION</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase border-r border-gray-300 w-28">UNIT COST</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase w-28">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pr.items.map((item, index) => {
                      const unitCost = item.unit_price || item.unit_cost || 0;
                      const amount = item.total_price || (item.quantity * unitCost) || item.amount || 0;
                      return (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 px-3 text-sm text-gray-900 border-r border-gray-200">{item.quantity}</td>
                          <td className="py-2 px-3 text-sm text-gray-900 border-r border-gray-200">{item.unit || '-'}</td>
                          <td className="py-2 px-3 text-sm text-gray-900 border-r border-gray-200">{item.item_name || item.description || item.item_code || '-'}</td>
                          <td className="py-2 px-3 text-sm text-gray-900 text-right border-r border-gray-200">{formatCurrency(unitCost)}</td>
                          <td className="py-2 px-3 text-sm text-gray-900 text-right">{formatCurrency(amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-300">
                    <tr>
                      <td colSpan="4" className="py-2 px-3 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                        TOTAL
                      </td>
                      <td className="py-2 px-3 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(calculateTotal())}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border border-gray-300 rounded p-4 text-center text-sm text-gray-500">
                No items
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button 
            variant="secondary" 
            onClick={handleClose}
          >
            Close
          </Button>
          {onApprove && !readOnly && pr.status !== 'PO Created' && pr.status !== 'Completed' && (
            <Button 
              variant="success" 
              onClick={handleApprove}
              disabled={processingId === pr.id}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRPreviewModal;
