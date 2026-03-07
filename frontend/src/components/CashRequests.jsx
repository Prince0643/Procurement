import React, { useState, useEffect } from 'react'
import { cashRequestService } from '../services/cashRequests'
import { supplierService } from '../services/suppliers'
import { ChevronUp, ChevronDown, Plus, X, Download, Edit, Trash2, Send, CheckCircle, Clock } from 'lucide-react'

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

const Input = ({ label, value, onChange, placeholder = '', required = false, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
      required={required}
    />
  </div>
)

const TextArea = ({ label, value, onChange, placeholder = '', required = false, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
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
      'Cash Request Created': 'bg-indigo-100 text-indigo-800',
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

const CashRequests = () => {
  const [cashRequests, setCashRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [purpose, setPurpose] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('pcs')
  const [project, setProject] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [dateNeeded, setDateNeeded] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierAddress, setSupplierAddress] = useState('')
  const [remarks, setRemarks] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [crType, setCrType] = useState('payment_request')

  useEffect(() => {
    fetchCashRequests()
  }, [])

  const fetchCashRequests = async () => {
    try {
      setLoading(true)
      const data = await cashRequestService.getAll()
      setCashRequests(data)
    } catch (err) {
      setError('Failed to fetch cash requests')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = async () => {
    setShowCreateModal(true)
    setLoadingForm(true)
    try {
      const [suppliersData, branchesData] = await Promise.all([
        supplierService.getAll(),
        fetch('https://jajr.xandree.com/get_branches_api.php').then(r => r.json())
      ])
      setSuppliers(suppliersData)
      // Handle branches API response format
      let branchList = []
      if (Array.isArray(branchesData)) {
        branchList = branchesData
      } else if (branchesData && Array.isArray(branchesData.data)) {
        branchList = branchesData.data
      } else if (branchesData && Array.isArray(branchesData.branches)) {
        branchList = branchesData.branches
      }
      setBranches(branchList)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoadingForm(false)
    }
  }

  const openEditModal = async (cr) => {
    setEditingId(cr.id)
    setPurpose(cr.purpose || '')
    setDescription(cr.description || '')
    setAmount(cr.amount || 0)
    setQuantity(cr.quantity || 1)
    setUnit(cr.unit || 'pcs')
    setProject(cr.project || '')
    setProjectAddress(cr.project_address || '')
    setDateNeeded(cr.date_needed ? cr.date_needed.split('T')[0] : '')
    setSelectedSupplier(cr.supplier_id ? cr.supplier_id.toString() : '')
    setSupplierName(cr.supplier_name || '')
    setSupplierAddress(cr.supplier_address || '')
    setRemarks(cr.remarks || '')
    setOrderNumber(cr.order_number || '')
    setCrType(cr.cr_type || 'payment_request')
    
    setShowEditModal(true)
    setLoadingForm(true)
    try {
      const [suppliersData, branchesData] = await Promise.all([
        supplierService.getAll(),
        fetch('https://jajr.xandree.com/get_branches_api.php').then(r => r.json())
      ])
      setSuppliers(suppliersData)
      // Handle branches API response format
      let branchList = []
      if (Array.isArray(branchesData)) {
        branchList = branchesData
      } else if (branchesData && Array.isArray(branchesData.data)) {
        branchList = branchesData.data
      } else if (branchesData && Array.isArray(branchesData.branches)) {
        branchList = branchesData.branches
      }
      setBranches(branchList)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoadingForm(false)
    }
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingId(null)
    resetForm()
  }

  const resetForm = () => {
    setPurpose('')
    setDescription('')
    setAmount(0)
    setQuantity(1)
    setUnit('pcs')
    setProject('')
    setProjectAddress('')
    setDateNeeded('')
    setSelectedSupplier('')
    setSupplierName('')
    setSupplierAddress('')
    setRemarks('')
    setOrderNumber('')
    setCrType('payment_request')
  }

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value
    setSelectedSupplier(supplierId)
    const supplier = suppliers.find(s => s.id === parseInt(supplierId))
    if (supplier) {
      setSupplierName(supplier.supplier_name)
      setSupplierAddress(supplier.address || '')
    } else {
      setSupplierName('')
      setSupplierAddress('')
    }
  }

  const handleProjectChange = (e) => {
    const branchId = e.target.value
    const branch = branches.find(b => b.id === parseInt(branchId) || b.branch_id === parseInt(branchId))
    if (branch) {
      setProject(branch.branch_name || branch.name || '')
      setProjectAddress(branch.address || branch.branch_address || '')
      setOrderNumber(branch.order_number || branch.code || '')
    } else {
      setProject('')
      setProjectAddress('')
      setOrderNumber('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!purpose) { alert('Please enter purpose'); return }
    if (!amount || amount <= 0) { alert('Please enter a valid amount'); return }

    console.log('Submitting Cash Request - dateNeeded value:', dateNeeded, 'type:', typeof dateNeeded)

    try {
      setSubmitting(true)
      const crData = {
        purpose,
        description,
        amount,
        quantity,
        unit,
        project,
        project_address: projectAddress,
        date_needed: dateNeeded || null,
        supplier_id: selectedSupplier || null,
        supplier_name: supplierName || null,
        supplier_address: supplierAddress || null,
        remarks: remarks || null,
        order_number: orderNumber || null,
        cr_type: crType
      }
      
      console.log('Full crData being sent:', crData)
      
      if (editingId) {
        await cashRequestService.update(editingId, crData)
        alert('Cash Request updated successfully!')
      } else {
        await cashRequestService.create(crData)
        alert('Cash Request created successfully!')
      }
      
      await fetchCashRequests()
      closeModal()
    } catch (err) {
      alert('Failed to save Cash Request: ' + (err.message || err.response?.data?.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitForApproval = async (id) => {
    try {
      await cashRequestService.submit(id)
      alert('Cash Request submitted for approval!')
      await fetchCashRequests()
    } catch (err) {
      alert('Failed to submit: ' + (err.message || err.response?.data?.message))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Cash Request?')) return
    try {
      await cashRequestService.delete(id)
      alert('Cash Request deleted successfully!')
      await fetchCashRequests()
    } catch (err) {
      alert('Failed to delete: ' + (err.message || err.response?.data?.message))
    }
  }

  const handleExport = async (id, crNumber) => {
    try {
      const blob = await cashRequestService.export(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Cash_Request_${crNumber}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export: ' + (err.message || 'Unknown error'))
    }
  }

  const handleApproveCR = async (id, status) => {
    try {
      await cashRequestService.adminApprove(id, status)
      alert(`Cash Request ${status === 'approved' ? 'approved' : 'put on hold'} successfully!`)
      await fetchCashRequests()
    } catch (err) {
      alert('Failed to process: ' + (err.message || err.response?.data?.message))
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
        <h2 className="text-lg font-semibold text-gray-900">Cash Requests</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {cashRequests.length} Cash Request{cashRequests.length !== 1 ? 's' : ''} total
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1" />
            Create Cash Request
          </Button>
        </div>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">CR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cashRequests.map(cr => (
                <React.Fragment key={cr.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === cr.id ? null : cr.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{cr.cr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{cr.purpose}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{cr.project}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(cr.amount)}</td>
                    <td className="py-3 px-4"><StatusBadge status={cr.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleExport(cr.id, cr.cr_number); }} title="Export to Excel">
                          <Download className="w-4 h-4" />
                        </Button>
                        {cr.status === 'Draft' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(cr); }} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSubmitForApproval(cr.id); }} title="Submit for Approval">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(cr.id); }} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {(cr.status === 'Pending' || cr.status === 'For Admin Approval') && (
                          <>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleApproveCR(cr.id, 'approved'); }} title="Approve">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleApproveCR(cr.id, 'hold'); }} title="Hold">
                              <Clock className="w-4 h-4 text-orange-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === cr.id ? null : cr.id); }}>
                          {expandedId === cr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === cr.id && (
                    <tr>
                      <td colSpan="6" className="bg-gray-50 p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Description</p>
                              <p className="text-sm text-gray-900">{cr.description || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Quantity</p>
                              <p className="text-sm text-gray-900">{cr.quantity} {cr.unit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Project Address</p>
                              <p className="text-sm text-gray-900">{cr.project_address || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Date Needed</p>
                              <p className="text-sm text-gray-900">{formatDate(cr.date_needed)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Supplier</p>
                              <p className="text-sm text-gray-900">{cr.supplier_name || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Created At</p>
                              <p className="text-sm text-gray-900">{formatDate(cr.created_at)}</p>
                            </div>
                          </div>
                          {cr.remarks && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Remarks</p>
                              <p className="text-sm text-gray-900">{cr.remarks}</p>
                            </div>
                          )}
                          {cr.approved_by && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Approved By</p>
                              <p className="text-sm text-gray-900">{cr.approver_name || cr.approved_by} on {formatDate(cr.approved_at)}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {cashRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No cash requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {cashRequests.map(cr => (
              <div
                key={cr.id}
                onClick={() => setExpandedId(expandedId === cr.id ? null : cr.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedId === cr.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{cr.cr_number}</p>
                    <p className="text-sm font-semibold text-gray-900">{cr.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === cr.id ? null : cr.id); }}>
                    {expandedId === cr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">{cr.project}</p>
                  <p className="text-sm font-medium text-gray-700">{formatCurrency(cr.amount)}</p>
                </div>
                <StatusBadge status={cr.status} />
                {expandedId === cr.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500">Description: {cr.description || '-'}</p>
                    <p className="text-xs text-gray-500">Quantity: {cr.quantity} {cr.unit}</p>
                    <p className="text-xs text-gray-500">Supplier: {cr.supplier_name || '-'}</p>
                    {cr.remarks && <p className="text-xs text-gray-500">Remarks: {cr.remarks}</p>}
                  </div>
                )}
              </div>
            ))}
            {cashRequests.length === 0 && (
              <p className="text-center text-gray-500 py-8">No cash requests found</p>
            )}
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Cash Request' : 'Create Cash Request'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
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
                <Select 
                  label="CR Type" 
                  value={crType} 
                  onChange={(e) => setCrType(e.target.value)} 
                  options={[
                    { value: 'payment_request', label: 'Payment Request' },
                    { value: 'payment_order', label: 'Payment Order' }
                  ]} 
                  required
                />
                
                <TextArea label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
                
                <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details about the cash request" />
                
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} required type="number" />
                  <Input label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} type="number" />
                  <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs, hours, etc." />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Select 
                    label="Project" 
                    value={branches.find(b => b.branch_name === project || b.name === project)?.id || branches.find(b => b.branch_name === project || b.name === project)?.branch_id || ''} 
                    onChange={handleProjectChange} 
                    options={branches.map(b => ({ 
                      value: b.id || b.branch_id, 
                      label: b.branch_name || b.name || 'Unknown' 
                    }))} 
                    placeholder="Select a project"
                  />
                  <Input label="Project Address" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} />
                  <Input label="Order Number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Auto-populated from project" />
                </div>
                
                <Input label="Date Needed" value={dateNeeded} onChange={(e) => setDateNeeded(e.target.value)} type="date" />
                
                <Select 
                  label="Supplier" 
                  value={selectedSupplier} 
                  onChange={handleSupplierChange} 
                  options={suppliers.map(s => ({ value: s.id, label: s.supplier_name }))} 
                  placeholder="Select a supplier (optional)"
                />
                
                <Input label="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Or enter supplier name manually" />
                <Input label="Supplier Address" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} />
                
                <TextArea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional remarks" rows={2} />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Update' : 'Create Cash Request')}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CashRequests
