import React, { useState, useEffect } from 'react'
import { paymentOrderService } from '../services/paymentOrders'
import { serviceRequestService } from '../services/serviceRequests'
import { supplierService } from '../services/suppliers'
import { ChevronUp, ChevronDown, Plus, X, Download, Eye } from 'lucide-react'
import POPreviewModal from './payment-orders/POPreviewModal'

// Local Card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

// Local Button component
const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', className = '', disabled = false, title }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={classes}
    >
      {children}
    </button>
  )
}

const Input = ({ label, value, onChange, placeholder = '', required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
      required={required}
    />
  </div>
)

const Select = ({ label, value, onChange, options, required = false, placeholder = 'Select...' }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'For Admin Approval': 'bg-blue-100 text-blue-800',
      'For Super Admin Final Approval': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'PO Created': 'bg-indigo-100 text-indigo-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'Rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

const PaymentOrders = () => {
  const [paymentOrders, setPaymentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [serviceRequests, setServiceRequests] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [selectedSR, setSelectedSR] = useState('')
  const [srSearchQuery, setSrSearchQuery] = useState('')
  const [srSearchResults, setSrSearchResults] = useState([])
  const [showSrResults, setShowSrResults] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [payeeName, setPayeeName] = useState('')
  const [payeeAddress, setPayeeAddress] = useState('')
  const [purpose, setPurpose] = useState('')
  const [previewPo, setPreviewPo] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [project, setProject] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    fetchPaymentOrders()
  }, [])

  const fetchPaymentOrders = async () => {
    try {
      setLoading(true)
      const data = await paymentOrderService.getAll()
      setPaymentOrders(data)
    } catch (err) {
      setError('Failed to fetch payment orders')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = async () => {
    setShowCreateModal(true)
    setLoadingForm(true)
    try {
      const [suppliersData, srsData] = await Promise.all([
        supplierService.getAll(),
        serviceRequestService.getAll()
      ])
      // Show approved Service Requests with sr_type = 'payment_order' (payment order type)
      setServiceRequests(srsData.filter(sr => sr.status === 'Approved' && sr.sr_type === 'payment_order'))
      setSuppliers(suppliersData)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoadingForm(false)
    }
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedSR('')
    setSrSearchQuery('')
    setSrSearchResults([])
    setShowSrResults(false)
    setSelectedSupplier('')
    setPayeeName('')
    setPayeeAddress('')
    setPurpose('')
    setProject('')
    setProjectAddress('')
    setOrderNumber('')
    setAmount(0)
  }

  const loadSRData = async (srId) => {
    try {
      const sr = await serviceRequestService.getById(srId)
      setPurpose(sr.purpose || '')
      setProject(sr.project || '')
      setProjectAddress(sr.project_address || '')
      setOrderNumber(sr.order_number || '')
      setAmount(sr.amount || 0)
      // Set payee name from supplier if available
      if (sr.supplier_name) {
        setPayeeName(sr.supplier_name)
        setPayeeAddress(sr.supplier_address || '')
      }
      // Find and set supplier if exists
      if (sr.supplier_id) {
        setSelectedSupplier(sr.supplier_id.toString())
      }
    } catch (err) {
      console.error('Failed to load SR data', err)
    }
  }

  const handleExport = async (id, poNumber) => {
    try {
      const blob = await paymentOrderService.export(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Payment_Order_${poNumber}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSR) { alert('Please select a Service Request'); return }
    if (!payeeName) { alert('Please enter payee name'); return }

    try {
      setSubmitting(true)
      const poData = {
        service_request_id: selectedSR,
        payee_name: payeeName,
        payee_address: payeeAddress || null,
        purpose: purpose || null,
        project: project || null,
        project_address: projectAddress || null,
        order_number: orderNumber || null,
        amount: amount
      }
      await paymentOrderService.create(poData)
      await fetchPaymentOrders()
      closeCreateModal()
      alert('Payment Order created successfully!')
    } catch (err) {
      alert('Failed to create Payment Order: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payment Orders</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {paymentOrders.length} Payment Order{paymentOrders.length !== 1 ? 's' : ''} total
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1" />
            Create Payment Order
          </Button>
        </div>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Payee Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentOrders.map(po => (
                <React.Fragment key={po.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === po.id ? null : po.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{po.po_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{po.payee_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{po.project}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(po.amount)}</td>
                    <td className="py-3 px-4"><StatusBadge status={po.status} /></td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setPreviewPo(po);
                          setShowPreview(true);
                        }}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleExport(po.id, po.po_number); 
                        }}
                        title="Export to Excel"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === po.id ? null : po.id); }}>
                        {expandedId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedId === po.id && (
                    <tr>
                      <td colSpan="6" className="bg-gray-50 p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Payee Address</p>
                              <p className="text-sm text-gray-900">{po.payee_address || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Purpose</p>
                              <p className="text-sm text-gray-900">{po.purpose}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Project Address</p>
                              <p className="text-sm text-gray-900">{po.project_address || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Order Number</p>
                              <p className="text-sm text-gray-900">{po.order_number || '-'}</p>
                            </div>
                          </div>
                          {po.remarks && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Remarks</p>
                              <p className="text-sm text-gray-900">{po.remarks}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paymentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No payment orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {paymentOrders.map(po => (
              <div
                key={po.id}
                onClick={() => setExpandedId(expandedId === po.id ? null : po.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedId === po.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{po.po_number}</p>
                    <p className="text-sm font-semibold text-gray-900">{po.payee_name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === po.id ? null : po.id); }}>
                    {expandedId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">{po.project}</p>
                  <p className="text-sm font-medium text-gray-700">{formatCurrency(po.amount)}</p>
                </div>
                <StatusBadge status={po.status} />
                {expandedId === po.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500">Purpose: {po.purpose}</p>
                    {po.payee_address && <p className="text-xs text-gray-500">Address: {po.payee_address}</p>}
                    {po.remarks && <p className="text-xs text-gray-500">Remarks: {po.remarks}</p>}
                  </div>
                )}
              </div>
            ))}
            {paymentOrders.length === 0 && (
              <p className="text-center text-gray-500 py-8">No payment orders found</p>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <POPreviewModal
          po={previewPo}
          loading={false}
          onClose={() => {
            setShowPreview(false);
            setPreviewPo(null);
          }}
        />
      )}

      {/* Create Payment Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Payment Order</h3>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {loadingForm ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {/* SR Search Input */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Request (Approved for Payment Order) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={srSearchQuery}
                    onChange={(e) => {
                      const query = e.target.value
                      setSrSearchQuery(query)
                      if (query.trim() === '') {
                        setSrSearchResults([])
                        setShowSrResults(false)
                      } else {
                        const filtered = serviceRequests.filter(sr =>
                          sr.sr_number?.toLowerCase().includes(query.toLowerCase()) ||
                          sr.project?.toLowerCase().includes(query.toLowerCase()) ||
                          sr.purpose?.toLowerCase().includes(query.toLowerCase())
                        )
                        setSrSearchResults(filtered)
                        setShowSrResults(true)
                      }
                    }}
                    onFocus={() => {
                      if (srSearchQuery.trim() !== '') {
                        setShowSrResults(true)
                      }
                    }}
                    placeholder="Search by SR number, project, or purpose..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required={!selectedSR}
                  />
                  {showSrResults && srSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                      {srSearchResults.map(sr => (
                        <div
                          key={sr.id}
                          onClick={() => {
                            console.log('Selected SR data:', sr)
                            setSelectedSR(sr.id)
                            setSrSearchQuery(`${sr.sr_number} - ${sr.purpose || sr.project} (${formatCurrency(sr.amount)})`)
                            setShowSrResults(false)
                            loadSRData(sr.id)
                          }}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <div className="text-sm font-medium">{sr.sr_number} - {sr.purpose || sr.project}</div>
                          <div className="text-xs text-gray-500">{sr.supplier_name || 'No supplier'} • {formatCurrency(sr.amount)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showSrResults && srSearchQuery.trim() !== '' && srSearchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm text-gray-500">
                      No matching service requests found
                    </div>
                  )}
                  <input type="hidden" value={selectedSR} required />
                </div>

                <Select label="Payee (Supplier)" value={selectedSupplier} onChange={(e) => { const supplierId = e.target.value; setSelectedSupplier(supplierId); const supplier = suppliers.find(s => s.id === parseInt(supplierId)); if (supplier) { setPayeeName(supplier.supplier_name); setPayeeAddress(supplier.address || ''); } }} options={suppliers.map(s => ({ value: s.id, label: s.supplier_name }))} required />

                <Input label="Payee Address" value={payeeAddress} onChange={(e) => setPayeeAddress(e.target.value)} />

                <Input label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Project" value={project} onChange={(e) => setProject(e.target.value)} />
                  <Input label="Project Address" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} />
                </div>

                <Input label="Order Number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Optional" />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={closeCreateModal}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Payment Order'}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentOrders
