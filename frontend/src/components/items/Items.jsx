import React, { useState, useEffect } from 'react'
import { itemService } from '../../services/items'
import { supplierService } from '../../services/suppliers'
import { categoryService } from '../../services/categories'
import { purchaseRequestService } from '../../services/purchaseRequests'
import { useAuth } from '../../contexts/AuthContext'
import { Search, Package, ShoppingCart, Plus, X, Trash2 } from 'lucide-react'

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, variant = 'primary', size = 'md', type = 'button', onClick, disabled = false, className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, multiline = false, rows = 4 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y"
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        required={required}
      />
    )}
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
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

const formatScheduleAmount = (amount) => {
  if (amount == null || amount === '') return '-'
  return formatCurrency(Number(amount) || 0)
}

const Items = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  
  // Categories from database
  const [dbCategories, setDbCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  
  // Cart state
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [itemQuantities, setItemQuantities] = useState({})
  
  // PR Modal state
  const [showPRModal, setShowPRModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDraftPR, setPreviewDraftPR] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  
  // PR Form state
  const [purpose, setPurpose] = useState('')
  const [project, setProject] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [dateNeeded, setDateNeeded] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [paymentBasis, setPaymentBasis] = useState('debt')
  const [paymentTermsNote, setPaymentTermsNote] = useState('')
  const [paymentSchedules, setPaymentSchedules] = useState([{ payment_date: '', amount: '', note: '' }])
  const [remarks, setRemarks] = useState('')
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newItemForm, setNewItemForm] = useState({
    item_code: '',
    item_name: '',
    description: '',
    category_id: '',
    unit: 'pcs'
  })
  const [addingItem, setAddingItem] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchBranches()
    fetchCategories()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true)
      const response = await fetch('https://jajr.xandree.com/get_branches_api.php', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      let branchList = []
      if (Array.isArray(data)) {
        branchList = data
      } else if (data && Array.isArray(data.data)) {
        branchList = data.data
      } else if (data && Array.isArray(data.branches)) {
        branchList = data.branches
      }

      setBranches(branchList)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
      setBranches([])
    } finally {
      setLoadingBranches(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await categoryService.getAll()
      setDbCategories(data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleProjectChange = (projectName) => {
    const selectedBranch = branches.find(b => b?.branch_name === projectName)

    setProject(projectName)
    setProjectAddress(selectedBranch?.address || selectedBranch?.branch_address || '')
    setOrderNumber(selectedBranch?.order_number || '')
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await itemService.getAll()
      setItems(data)
      // Initialize quantities to 1
      const qtys = {}
      data.forEach(item => qtys[item.id] = 1)
      setItemQuantities(qtys)
    } catch (err) {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const openPreview = () => {
    // Build preview object from form data
    const draftPR = {
      pr_number: 'PREVIEW',
      purpose,
      project,
      project_address: projectAddress,
      date_needed: dateNeeded,
      order_number: orderNumber,
      supplier_id: selectedSupplier,
      supplier_name: suppliers.find(s => s.id === selectedSupplier)?.supplier_name || '-',
      supplier_address: projectAddress,
      payment_basis: paymentBasis,
      payment_terms_note: paymentBasis === 'debt' ? paymentTermsNote.trim() : null,
      payment_schedules: sanitizePaymentSchedules(paymentSchedules),
      remarks,
      status: 'Draft',
      created_at: new Date().toISOString(),
      items: cart.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_code: item.item_code,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      })),
      total_amount: calculateCartTotal()
    }
    setPreviewDraftPR(draftPR)
    setShowPreviewModal(true)
  }

  const closePreview = () => {
    setShowPreviewModal(false)
    setPreviewDraftPR(null)
  }

  const handleSaveDraft = async () => {
    if (!purpose) { alert('Purpose is required'); return }
    if (cart.length === 0) { alert('At least one item is required'); return }

    try {
      const normalizedSchedules = sanitizePaymentSchedules(paymentSchedules)
      setSubmitting(true)
      const prData = {
        purpose,
        project: project || null,
        project_address: projectAddress || null,
        date_needed: dateNeeded || null,
        order_number: orderNumber || null,
        supplier_id: selectedSupplier || null,
        payment_basis: paymentBasis,
        payment_terms_note: paymentBasis === 'debt' ? paymentTermsNote.trim() : null,
        payment_schedules: normalizedSchedules,
        remarks: remarks || null,
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }
      await purchaseRequestService.saveDraft(prData)
      setCart([])
      closePRModal()
      alert('Draft saved successfully!')
    } catch (err) {
      alert('Failed to save draft: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }
  const openPRModal = async () => {
    setShowPRModal(true)
    try {
      const suppliersData = await supplierService.getAll()
      setSuppliers(suppliersData)

      if (branches.length === 0 && !loadingBranches) {
        await fetchBranches()
      }
    } catch (err) {
      console.error('Failed to load suppliers', err)
    }
  }

  const closePRModal = () => {
    setShowPRModal(false)
    resetPRForm()
  }

  const handleAddItemSubmit = async (e) => {
    e.preventDefault()
    if (!newItemForm.item_code || !newItemForm.item_name) {
      alert('Item Code and Item Name are required')
      return
    }

    try {
      setAddingItem(true)
      const dataToSubmit = {
        ...newItemForm,
        unit_price: newItemForm.unit_price ? parseFloat(newItemForm.unit_price) : null,
        reorder_level: newItemForm.reorder_level ? parseInt(newItemForm.reorder_level) : null
      }
      await itemService.create(dataToSubmit)
      alert('Item created successfully!')
      setShowAddItemModal(false)
      setNewItemForm({
        item_code: '',
        item_name: '',
        description: '',
        category_id: '',
        unit: 'pcs'
      })
      fetchItems() // Refresh the list
    } catch (err) {
      console.error('Failed to create item:', err)
      alert('Failed to create item: ' + (err.response?.data?.message || err.message))
    } finally {
      setAddingItem(false)
    }
  }
  const resetPRForm = () => {
    setPurpose('')
    setProject('')
    setProjectAddress('')
    setDateNeeded('')
    setOrderNumber('')
    setSelectedSupplier('')
    setPaymentBasis('debt')
    setPaymentTermsNote('')
    setPaymentSchedules([{ payment_date: '', amount: '', note: '' }])
    setRemarks('')
  }

  const addPaymentSchedule = () => {
    setPaymentSchedules((prev) => [...prev, { payment_date: '', amount: '', note: '' }])
  }

  const removePaymentSchedule = (index) => {
    setPaymentSchedules((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePaymentSchedule = (index, field, value) => {
    setPaymentSchedules((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const sanitizePaymentSchedules = (rows) => {
    const cleaned = (rows || [])
      .map((row) => ({
        payment_date: String(row?.payment_date || '').trim(),
        amount: row?.amount === '' || row?.amount == null ? null : Number(row.amount),
        note: String(row?.note || '').trim() || null
      }))
      .filter((row) => row.payment_date || row.amount != null || row.note)

    const seen = new Set()
    for (const row of cleaned) {
      if (!row.payment_date) {
        throw new Error('Each payment schedule row must have a payment date')
      }
      if (seen.has(row.payment_date)) {
        throw new Error(`Duplicate payment schedule date: ${row.payment_date}`)
      }
      seen.add(row.payment_date)
      if (row.amount != null && (Number.isNaN(row.amount) || row.amount < 0)) {
        throw new Error('Payment schedule amount must be a non-negative number')
      }
    }

    return cleaned
  }

  const addToCart = (item) => {
    const rawQuantity = itemQuantities[item.id]
    // Default to 1 if empty, undefined, or less than 1
    const quantity = (rawQuantity === '' || rawQuantity === undefined || rawQuantity < 1) ? 1 : rawQuantity
    const existingIndex = cart.findIndex(c => c.item_id === item.id)
    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([...cart, {
        item_id: item.id,
        item_name: item.item_name,
        item_code: item.item_code,
        unit: item.unit || 'pcs',
        quantity: quantity,
        unit_price: item.last_unit_price || 0
      }])
    }
    setShowCart(true)
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.item_id !== itemId))
  }

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity < 1) return
    setCart(cart.map(c => c.item_id === itemId ? { ...c, quantity } : c))
  }

  const updateItemQuantity = (itemId, value) => {
    // Allow empty string temporarily for UX (user can clear field to type new value)
    if (value === '' || value === undefined) {
      setItemQuantities({ ...itemQuantities, [itemId]: '' })
    } else {
      const quantity = parseInt(value)
      setItemQuantities({ ...itemQuantities, [itemId]: quantity })
    }
  }

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const handleSubmitPR = async (e) => {
    e.preventDefault()
    if (!purpose) { alert('Purpose is required'); return }
    if (cart.length === 0) { alert('At least one item is required'); return }

    try {
      const normalizedSchedules = sanitizePaymentSchedules(paymentSchedules)
      if (paymentBasis === 'debt' && normalizedSchedules.length === 0) {
        alert('At least one payment schedule is required for debt/with account PR')
        return
      }
      setSubmitting(true)
      const prData = {
        purpose,
        project: project || null,
        project_address: projectAddress || null,
        date_needed: dateNeeded || null,
        order_number: orderNumber || null,
        supplier_id: selectedSupplier || null,
        payment_basis: paymentBasis,
        payment_terms_note: paymentBasis === 'debt' ? paymentTermsNote.trim() : null,
        payment_schedules: normalizedSchedules,
        remarks: remarks || null,
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }
      await purchaseRequestService.create(prData)
      setCart([])
      closePRModal()
      alert('Purchase Request created successfully!')
    } catch (err) {
      alert('Failed to create PR: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  // Get unique categories from items + add 'all' option
  const filterCategories = ['all', ...new Set(items.map(item => item.category).filter(Boolean))]
  
  // Category options from database for the add item modal
  const categoryOptions = dbCategories.map(cat => ({ value: cat.id, label: cat.category_name }))

  const unitOptions = [
    'pcs', 'box', 'set', 'unit', 'meter', 'roll', 'kg', 'liter', 'gallon', 'sheet', 'pack', 'bundle'
  ]

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      {/* Header with Cart */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">Items Catalog</h2>
          <p className="text-sm text-gray-500">Select items and quantities for your purchase request</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role !== 'engineer' && (
            <Button onClick={() => setShowAddItemModal(true)} className="px-3 py-2">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Cart ({cart.length})</span>
            <span className="font-medium sm:hidden">({cart.length})</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cart Panel */}
      {showCart && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Selected Items</h3>
            <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items selected yet</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.item_id} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.item_name}</p>
                      <p className="text-xs text-gray-500">{item.item_code} • {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateCartQuantity(item.item_id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                        >-</button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.item_id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                        >+</button>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.item_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                <span className="font-semibold">Total: {formatCurrency(calculateCartTotal())}</span>
                {user?.role !== 'super_admin' && (
                  <Button onClick={openPRModal}>
                    Create Purchase Request
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        >
          {filterCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Items List View */}
      <Card>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No items found</p>
            {searchQuery && <p className="text-sm">Try adjusting your search</p>}
          </div>
        ) : (
          <>
            {/* Mobile grid */}
            <div className="grid grid-cols-2 gap-3 p-3 sm:hidden">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.item_id === item.id)
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 leading-snug break-words">
                          {item.item_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 break-words">
                          {item.item_code} • {item.unit || 'pcs'}
                        </p>
                        {item.last_unit_price && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            {formatCurrency(item.last_unit_price)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {inCart ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-green-700">In cart: {inCart.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove from cart"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={itemQuantities[item.id] ?? 1}
                            onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                            className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop/tablet list */}
            <div className="hidden sm:block divide-y divide-gray-200">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.item_id === item.id)
                return (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        {item.category && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{item.item_code} • Unit: {item.unit || 'pcs'}</p>
                      {item.last_unit_price && (
                        <p className="text-sm text-green-600 font-medium">
                          Last Price: {formatCurrency(item.last_unit_price)}
                        </p>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <div className="flex items-center gap-3">
                      {inCart ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <span className="text-sm font-medium">In cart: {inCart.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="1"
                            value={itemQuantities[item.id] ?? 1}
                            onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      {/* Create PR Modal */}
      {showPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Purchase Request</h3>
              <button onClick={closePRModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPR} className="p-6">
              {/* Selected Items Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Selected Items ({cart.length})</h4>
                <div className="space-y-3 max-h-60 overflow-auto">
                  {cart.map((item, index) => (
                    <div key={item.item_id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">{item.item_name}</span>
                        <span className="text-xs text-gray-500">{item.unit}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.item_id, parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Unit Cost</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price === 0 || item.unit_price === undefined ? '' : item.unit_price}
                            onChange={(e) => {
                              const value = e.target.value
                              const newPrice = value === '' ? '' : parseFloat(value)
                              setCart(cart.map(c => c.item_id === item.item_id ? { ...c, unit_price: newPrice } : c))
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Total</label>
                          <div className="text-sm font-medium py-1">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 text-right font-semibold">
                  Total: {formatCurrency(calculateCartTotal())}
                </div>
              </div>

              <Input label="Purpose *" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={project}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                    disabled={loadingBranches}
                  >
                    <option value="">{loadingBranches ? 'Loading projects...' : 'Select project...'}</option>
                    {branches
                      .filter(b => b?.branch_name)
                      .map(b => (
                        <option key={b.id || b.branch_id || b.branch_name} value={b.branch_name}>
                          {b.branch_name}
                        </option>
                      ))}
                  </select>
                </div>
                <Input label="Project Address" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Date Needed" type="date" value={dateNeeded} onChange={(e) => setDateNeeded(e.target.value)} />
                <Input label="Order Number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Optional" />
              </div>

              <Select 
                label="Supplier (Optional)" 
                value={selectedSupplier} 
                onChange={(e) => setSelectedSupplier(e.target.value)} 
                options={suppliers.map(s => ({ value: s.id, label: s.supplier_name }))} 
              />

              <Select 
                label="Payment Basis *" 
                value={paymentBasis} 
                onChange={(e) => setPaymentBasis(e.target.value)} 
                options={[
                  { value: 'debt', label: 'Debt (with supplier account)' },
                  { value: 'non_debt', label: 'Cash/Non-debt (immediate payment)' }
                ]} 
                required 
              />

              <Input
                label={paymentBasis === 'debt' ? 'Payment Terms and Conditions *' : 'Payment Terms and Conditions'}
                value={paymentTermsNote}
                onChange={(e) => setPaymentTermsNote(e.target.value)}
                placeholder="Ex: Net 30 after invoice receipt"
                multiline
                rows={4}
                required={false}
              />

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Dates {paymentBasis === 'debt' && <span className="text-red-500">*</span>}
                  </label>
                  <Button type="button" variant="secondary" size="sm" onClick={addPaymentSchedule}>
                    <Plus className="w-4 h-4 mr-1" /> Add Date
                  </Button>
                </div>
                {paymentSchedules.map((schedule, index) => (
                  <div key={`items-schedule-${index}`} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-4">
                      <input
                        type="date"
                        value={schedule.payment_date}
                        onChange={(e) => updatePaymentSchedule(index, 'payment_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Amount (optional)"
                        value={schedule.amount}
                        onChange={(e) => updatePaymentSchedule(index, 'amount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Note (optional)"
                        value={schedule.note}
                        onChange={(e) => updatePaymentSchedule(index, 'note', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {paymentSchedules.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removePaymentSchedule(index)}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={closePRModal} disabled={submitting}>Cancel</Button>
                <Button type="button" variant="outline" onClick={openPreview} disabled={submitting || cart.length === 0}>Preview</Button>
                <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={submitting}>Save Draft</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Purchase Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddItemSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Item Code *"
                  value={newItemForm.item_code}
                  onChange={(e) => setNewItemForm({ ...newItemForm, item_code: e.target.value })}
                  placeholder="e.g., ITM001"
                  required
                />
                <Input
                  label="Item Name *"
                  value={newItemForm.item_name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, item_name: e.target.value })}
                  placeholder="e.g., Cement"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={newItemForm.category_id || ''}
                  onChange={(e) => setNewItemForm({ ...newItemForm, category_id: e.target.value })}
                  options={categoryOptions}
                  placeholder="Select category..."
                />
                <Select
                  label="Unit"
                  value={newItemForm.unit}
                  onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                  options={unitOptions.map(u => ({ value: u, label: u }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => setShowAddItemModal(false)} disabled={addingItem}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addingItem}>
                  {addingItem ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Items
