import React, { useState, useRef, useEffect } from 'react'
import { itemService } from './services/items'
import { purchaseRequestService } from './services/purchaseRequests'
import { categoryService } from './services/categories'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Building2,
  Bell,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  User,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  LogOut
} from 'lucide-react'

// ============ MOCK DATA ============
const MOCK_ITEMS = [
  { id: 1, item_code: 'ITM001', item_name: 'Laptop Dell XPS 13', description: '13-inch business laptop', category: 'Electronics', unit: 'pc', status: 'Active' },
  { id: 2, item_code: 'ITM002', item_name: 'Wireless Mouse', description: 'Logitech wireless mouse', category: 'Electronics', unit: 'pc', status: 'Active' },
  { id: 3, item_code: 'ITM003', item_name: 'A4 Paper (500 sheets)', description: 'Premium quality paper', category: 'Office Supplies', unit: 'box', status: 'Active' },
  { id: 4, item_code: 'ITM004', item_name: 'Office Chair', description: 'Ergonomic office chair', category: 'Furniture', unit: 'pc', status: 'Active' },
  { id: 5, item_code: 'ITM005', item_name: 'Printer Ink HP 950', description: 'Black ink cartridge', category: 'Electronics', unit: 'pc', status: 'Active' },
]

const MOCK_SUPPLIERS = [
  { id: 1, supplier_code: 'SUP001', supplier_name: 'TechCorp Solutions', contact_person: 'John Smith', email: 'john@techcorp.com', phone: '+1234567890', address: '123 Tech Street, NY', status: 'Active' },
  { id: 2, supplier_code: 'SUP002', supplier_name: 'Office Supplies Inc', contact_person: 'Jane Doe', email: 'jane@officesupplies.com', phone: '+0987654321', address: '456 Office Ave, CA', status: 'Active' },
  { id: 3, supplier_code: 'SUP003', supplier_name: 'Furniture Max', contact_person: 'Bob Wilson', email: 'bob@furnituremax.com', phone: '+1122334455', address: '789 Furniture Blvd, TX', status: 'Active' },
]

const MOCK_PURCHASE_REQUESTS = [
  { id: 1, pr_number: 'PR-2024-001', requested_by: 'Engineer 1', purpose: 'New laptop for development', remarks: 'Urgent need', status: 'Approved', approved_by: 'Super Admin', approved_at: '2024-01-15', rejection_reason: null, created_at: '2024-01-10' },
  { id: 2, pr_number: 'PR-2024-002', requested_by: 'Engineer 2', purpose: 'Office supplies replenishment', remarks: 'Monthly restock', status: 'Pending', approved_by: null, approved_at: null, rejection_reason: null, created_at: '2024-01-16' },
  { id: 3, pr_number: 'PR-2024-003', requested_by: 'Engineer 1', purpose: 'New chairs for conference room', remarks: 'For 10 people', status: 'For Purchase', approved_by: 'Super Admin', approved_at: '2024-01-12', rejection_reason: null, created_at: '2024-01-08' },
  { id: 4, pr_number: 'PR-2024-004', requested_by: 'Engineer 3', purpose: 'Printer maintenance kit', remarks: 'Annual maintenance', status: 'Rejected', approved_by: 'Super Admin', approved_at: null, rejection_reason: 'Budget exceeded for this quarter', created_at: '2024-01-14' },
  { id: 5, pr_number: 'PR-2024-005', requested_by: 'Engineer 2', purpose: 'Wireless keyboards', remarks: 'For new hires', status: 'Completed', approved_by: 'Super Admin', approved_at: '2024-01-05', rejection_reason: null, created_at: '2024-01-01' },
]

const MOCK_PURCHASE_REQUEST_ITEMS = [
  { id: 1, purchase_request_id: 1, item_id: 1, quantity: 2, unit_price: 1200, total_price: 2400, remarks: 'High spec needed', status: 'Received', received_by: 'Engineer 1', received_at: '2024-01-20' },
  { id: 2, purchase_request_id: 2, item_id: 3, quantity: 10, unit_price: 15, total_price: 150, remarks: 'Standard quality', status: 'Pending', received_by: null, received_at: null },
  { id: 3, purchase_request_id: 3, item_id: 4, quantity: 10, unit_price: 350, total_price: 3500, remarks: 'Black color preferred', status: 'For Purchase', received_by: null, received_at: null },
  { id: 4, purchase_request_id: 4, item_id: 5, quantity: 5, unit_price: 45, total_price: 225, remarks: 'Original HP only', status: 'Pending', received_by: null, received_at: null },
  { id: 5, purchase_request_id: 5, item_id: 2, quantity: 5, unit_price: 25, total_price: 125, remarks: 'Wireless only', status: 'Received', received_by: 'Engineer 2', received_at: '2024-01-10' },
]

const MOCK_PURCHASE_ORDERS = [
  { id: 1, po_number: 'PO-2024-001', purchase_request_id: 1, supplier_id: 1, prepared_by: 'Admin', total_amount: 2400, po_date: '2024-01-16', expected_delivery_date: '2024-01-23', actual_delivery_date: '2024-01-20', status: 'Delivered' },
  { id: 2, po_number: 'PO-2024-002', purchase_request_id: 5, supplier_id: 1, prepared_by: 'Admin', total_amount: 125, po_date: '2024-01-06', expected_delivery_date: '2024-01-09', actual_delivery_date: '2024-01-10', status: 'Delivered' },
  { id: 3, po_number: 'PO-2024-003', purchase_request_id: 3, supplier_id: 3, prepared_by: 'Admin', total_amount: 3500, po_date: '2024-01-17', expected_delivery_date: '2024-02-01', actual_delivery_date: null, status: 'Ordered' },
]

const MOCK_NOTIFICATIONS = [
  { id: 1, recipient_id: 1, title: 'PR Approved', message: 'Your PR-2024-001 has been approved', type: 'PR Approved', related_id: 1, related_type: 'purchase_request', is_read: false, created_at: '2024-01-15' },
  { id: 2, recipient_id: 1, title: 'Item Received', message: 'Items from PO-2024-001 have been received', type: 'Item Received', related_id: 1, related_type: 'purchase_order', is_read: true, created_at: '2024-01-20' },
  { id: 3, recipient_id: 2, title: 'New PR Created', message: 'PR-2024-002 is pending approval', type: 'PR Created', related_id: 2, related_type: 'purchase_request', is_read: false, created_at: '2024-01-16' },
  { id: 4, recipient_id: 2, title: 'PR Rejected', message: 'PR-2024-004 has been rejected', type: 'PR Rejected', related_id: 4, related_type: 'purchase_request', is_read: false, created_at: '2024-01-14' },
]

// ============ UTILS ============
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusColor = (status) => {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-yellow-100 text-yellow-800',
    'Rejected': 'bg-red-100 text-red-800',
    'For Purchase': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Purchased': 'bg-indigo-100 text-indigo-800',
    'Received': 'bg-teal-100 text-teal-800',
    'Draft': 'bg-gray-100 text-gray-800',
    'Ordered': 'bg-orange-100 text-orange-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// ============ COMPONENTS ============
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const variants = {
    primary: 'bg-yellow-500 text-gray-900 hover:bg-yellow-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({ label, type = 'text', placeholder, value, onChange, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
    />
  </div>
)

const Select = ({ label, value, onChange, options, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

const Badge = ({ children, status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {children}
  </span>
)

const StatusBadge = ({ status }) => <Badge status={status}>{status}</Badge>

// ============ LAYOUT ============
const Layout = ({ currentRole, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user, logout } = useAuth()

  const roleNavItems = {
    engineer: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'items', label: 'Browse Items', icon: Package },
      { id: 'add-item', label: 'Add Item', icon: Plus },
      { id: 'purchase-requests', label: 'My Purchase Requests', icon: ShoppingCart },
      { id: 'history', label: 'Purchase History', icon: ClipboardList },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'items', label: 'Items', icon: Package },
      { id: 'suppliers', label: 'Suppliers', icon: Building2 },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText },
      { id: 'pending-prs', label: 'Pending PRs', icon: Clock },
    ],
    superadmin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'approve-prs', label: 'Approve PRs', icon: CheckCircle },
      { id: 'all-prs', label: 'All Purchase Requests', icon: ClipboardList },
      { id: 'all-pos', label: 'All Purchase Orders', icon: FileText },
      { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
    ],
  }

  const unreadNotifications = MOCK_NOTIFICATIONS.filter(n => !n.is_read).length

  const roleLabels = {
    engineer: 'Engineer',
    admin: 'Admin',
    super_admin: 'Super Admin'
  }

  const roleColors = {
    engineer: 'bg-yellow-100 text-yellow-800',
    admin: 'bg-green-100 text-green-800',
    super_admin: 'bg-purple-100 text-purple-800'
  }

  // Map roles from backend to frontend role keys
  const mapRole = (role) => {
    if (role === 'super_admin') return 'superadmin'
    return role
  }

  const frontendRole = mapRole(currentRole)
  const navItems = roleNavItems[frontendRole] || []
  const [activeNav, setActiveNav] = useState(navItems[0]?.id || 'dashboard')

  const displayRole = roleLabels[currentRole] || currentRole
  const displayRoleColor = roleColors[currentRole] || 'bg-gray-100 text-gray-800'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-yellow-600" />
              <span className="font-bold text-lg text-gray-900">ProcureSys</span>
            </div>
          ) : (
            <Package className="w-6 h-6 text-yellow-600" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-yellow-50 text-yellow-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {activeNav.replace(/-/g, ' ')}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${displayRoleColor}`}>
              {displayRole}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                    ) : (
                      MOCK_NOTIFICATIONS.map(notif => (
                        <div key={notif.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notif.is_read ? 'bg-yellow-50' : ''}`}>
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(notif.created_at)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              {sidebarOpen && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children({ activeNav, currentRole })}
        </main>
      </div>
    </div>
  )
}

// ============ ENGINEER VIEWS ============
const EngineerDashboard = () => {
  const myPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.requested_by === 'Engineer 1')
  const pendingCount = myPRs.filter(pr => pr.status === 'Pending').length
  const approvedCount = myPRs.filter(pr => pr.status === 'Approved').length
  const completedCount = myPRs.filter(pr => pr.status === 'Completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchase Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {myPRs.slice(0, 5).map(pr => (
                <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                  <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const BrowseItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreatePR, setShowCreatePR] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [prFormData, setPrFormData] = useState({ purpose: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await itemService.getAll()
      setItems(data)
    } catch (err) {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...new Set(items.map(item => item.category_name || item.category))]

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name || item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.item_code || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || (item.category_name || item.category) === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleItemSelection = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (itemId, quantity) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
    ))
  }

  const handleSubmitPR = async () => {
    if (!prFormData.purpose.trim()) {
      setSubmitError('Purpose is required')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      await purchaseRequestService.create({
        purpose: prFormData.purpose,
        remarks: prFormData.remarks,
        items: selectedItems.map(item => ({
          item_id: item.id,
          quantity: item.quantity
        }))
      })

      setSubmitSuccess(true)
      setPrFormData({ purpose: '', remarks: '' })
      setSelectedItems([])
      
      setTimeout(() => {
        setShowCreatePR(false)
        setSubmitSuccess(false)
      }, 2000)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create purchase request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        >
          <option value="all">All Categories</option>
          {categories.filter(c => c !== 'all').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Button onClick={() => setShowCreatePR(true)} disabled={selectedItems.length === 0}>
          <Plus className="w-4 h-4 mr-2" />
          Create PR ({selectedItems.length})
        </Button>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Select</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Qty</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isSelected = selectedItems.find(i => i.id === item.id)
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-yellow-50' : ''}`}
                      onClick={() => toggleItemSelection(item)}
                    >
                      <td className="py-3 px-4">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.item_code}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name || item.item_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.category_name || item.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.unit}</td>
                      <td className="py-3 px-4">
                        {isSelected && (
                          <input
                            type="number"
                            min="1"
                            value={isSelected.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create PR Modal */}
      {showCreatePR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Purchase Request</h2>
            </div>
            <div className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">Purchase request created successfully!</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                <input
                  type="text"
                  value={prFormData.purpose}
                  onChange={(e) => setPrFormData({ ...prFormData, purpose: e.target.value })}
                  placeholder="Enter the purpose of this purchase request"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  value={prFormData.remarks}
                  onChange={(e) => setPrFormData({ ...prFormData, remarks: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Items</label>
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{item.name || item.item_name}</p>
                        <p className="text-xs text-gray-500">{item.item_code}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowCreatePR(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPR}
                disabled={submitting || selectedItems.length === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const AddItem = () => {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [itemCode, setItemCode] = useState('')

  // Fetch categories and generate item code on mount
  useEffect(() => {
    fetchCategories()
    generateNextItemCode()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const generateNextItemCode = async () => {
    try {
      const items = await itemService.getAll()
      const maxId = items.reduce((max, item) => {
        const match = (item.item_code || '').match(/ITM(\d+)/)
        const num = match ? parseInt(match[1]) : 0
        return Math.max(max, num)
      }, 0)
      setItemCode(`ITM${String(maxId + 1).padStart(3, '0')}`)
    } catch (err) {
      setItemCode('ITM001')
    }
  }

  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category_id: '',
    unit: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const categoryDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = categories.filter(cat =>
    (cat.name || cat.category_name).toLowerCase().includes(categorySearch.toLowerCase())
  )

  const handleAddCategory = async () => {
    if (!categorySearch.trim()) return
    setAddingCategory(true)
    try {
      const result = await categoryService.create({
        name: categorySearch.trim(),
        description: ''
      })
      // Refresh categories to get the new one with real ID
      await fetchCategories()
      // Find and select the newly created category
      const newCats = await categoryService.getAll()
      const newCat = newCats.find(c => (c.name || c.category_name) === categorySearch.trim())
      if (newCat) {
        setFormData({ ...formData, category_id: newCat.id })
      }
      setCategorySearch('')
      setShowCategoryDropdown(false)
    } catch (err) {
      setError('Failed to add category: ' + (err.response?.data?.message || err.message))
    } finally {
      setAddingCategory(false)
    }
  }

  const handleSelectCategory = (cat) => {
    setFormData({ ...formData, category_id: cat.id })
    setCategorySearch('')
    setShowCategoryDropdown(false)
  }

  const selectedCategoryName = categories.find(c => c.id === parseInt(formData.category_id))?.name || 
                               categories.find(c => c.id === parseInt(formData.category_id))?.category_name || ''

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Call real API
      await itemService.create({
        item_code: itemCode,
        item_name: formData.item_name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        unit: formData.unit
      })
      
      setSuccess(true)
      setFormData({ item_name: '', description: '', category_id: '', unit: '' })
      
      // Refresh items to get updated list (and new item code)
      const updatedItems = await itemService.getAll()
      
      // Generate next item code from updated list
      const maxId = updatedItems.reduce((max, item) => {
        const match = (item.item_code || '').match(/ITM(\d+)/)
        const num = match ? parseInt(match[1]) : 0
        return Math.max(max, num)
      }, 0)
      setItemCode(`ITM${String(maxId + 1).padStart(3, '0')}`)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h2>
        <p className="text-sm text-gray-600 mb-6">Fill in the details below to add a new item to the catalog.</p>
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">Item added successfully!</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600 font-mono">
                {itemCode}
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., pc, kg, box"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-left flex items-center justify-between"
            >
              <span>{selectedCategoryName || 'Select category'}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search or add category..."
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 text-sm ${
                          formData.category_id === cat.id ? 'bg-yellow-50 text-yellow-700' : ''
                        }`}
                      >
                        {cat.name || cat.category_name}
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No categories found
                    </div>
                  )}
                  {categorySearch.trim() && !filteredCategories.find(c => (c.name || c.category_name).toLowerCase() === categorySearch.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={addingCategory}
                      className="w-full px-3 py-2 text-left hover:bg-yellow-50 text-sm text-yellow-600 border-t border-gray-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      {addingCategory ? 'Adding...' : `Add "${categorySearch}"`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setFormData({ item_name: '', description: '', category_id: '', unit: '' })}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const MyPurchaseRequests = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  
  const myPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.requested_by === 'Engineer 1')
  const filteredPRs = filterStatus === 'all' ? myPRs : myPRs.filter(pr => pr.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'Pending', 'Approved', 'For Purchase', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPRs.map(pr => (
                <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                  <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ============ ADMIN VIEWS ============
const AdminDashboard = () => {
  const pendingPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Approved').length
  const totalItems = MOCK_ITEMS.length
  const totalSuppliers = MOCK_SUPPLIERS.length
  const pendingPOs = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'Ordered').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending PRs</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingPRs}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suppliers</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalSuppliers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active POs</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingPOs}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approved PRs Awaiting PO</h2>
          <div className="space-y-3">
            {MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Approved').map(pr => (
              <div key={pr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{pr.pr_number}</p>
                  <p className="text-xs text-gray-500">{pr.purpose}</p>
                </div>
                <Button size="sm">Create PO</Button>
              </div>
            ))}
            {MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Approved').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No approved PRs pending</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchase Orders</h2>
          <div className="space-y-3">
            {MOCK_PURCHASE_ORDERS.slice(0, 5).map(po => (
              <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{po.po_number}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(po.total_amount)}</p>
                </div>
                <StatusBadge status={po.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const ItemsManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = MOCK_ITEMS.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.item_code}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{item.item_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.unit}</td>
                  <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Item Code" placeholder="e.g., ITM006" />
              <Input label="Item Name" placeholder="Enter item name" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: '', label: 'Select category' },
                    { value: 'Electronics', label: 'Electronics' },
                    { value: 'Office Supplies', label: 'Office Supplies' },
                    { value: 'Furniture', label: 'Furniture' },
                  ]}
                />
                <Input label="Unit" placeholder="e.g., pc, kg, box" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}>Add Item</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const SuppliersManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Supplier Code</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SUPPLIERS.map(supplier => (
                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{supplier.supplier_code}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{supplier.supplier_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{supplier.contact_person}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{supplier.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={supplier.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Supplier</h2>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Supplier Code" placeholder="e.g., SUP004" />
              <Input label="Supplier Name" placeholder="Enter supplier name" />
              <Input label="Contact Person" placeholder="Enter contact person" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" placeholder="email@example.com" />
                <Input label="Phone" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  placeholder="Enter address"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}>Add Supplier</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const PurchaseOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search POs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create PO
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Related PR</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PURCHASE_ORDERS.map(po => (
                <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{po.po_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{MOCK_PURCHASE_REQUESTS.find(pr => pr.id === po.purchase_request_id)?.pr_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{MOCK_SUPPLIERS.find(s => s.id === po.supplier_id)?.supplier_name}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(po.total_amount)}</td>
                  <td className="py-3 px-4"><StatusBadge status={po.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(po.expected_delivery_date)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ============ SUPER ADMIN VIEWS ============
const SuperAdminDashboard = () => {
  const pendingApprovals = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Pending').length
  const totalPRs = MOCK_PURCHASE_REQUESTS.length
  const approvedPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Approved').length
  const rejectedPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Rejected').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PRs</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{totalPRs}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{approvedPRs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{rejectedPRs}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Procurement Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Spend (YTD)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(6025)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Processing Time</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">4.2 days</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Suppliers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{MOCK_SUPPLIERS.length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

const ApprovePRs = () => {
  const [selectedPR, setSelectedPR] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const pendingPRs = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Pending')

  const handleApprove = (pr) => {
    setSelectedPR(null)
  }

  const handleReject = (pr) => {
    setSelectedPR(pr)
    setShowRejectModal(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Requests Pending Approval</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve/reject purchase requests from engineers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPRs.map(pr => {
                const items = MOCK_PURCHASE_REQUEST_ITEMS.filter(item => item.purchase_request_id === pr.id)
                const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)
                
                return (
                  <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.requested_by}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{items.length} items</p>
                        <p className="text-gray-500">{formatCurrency(totalAmount)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleApprove(pr)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(pr)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pendingPRs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No pending purchase requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Purchase Request</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedPR?.pr_number}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { setShowRejectModal(false); setRejectionReason('') }}>
                Reject PR
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const AllPurchaseRequests = () => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Purchase Requests</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="secondary" size="sm">
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Approved By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PURCHASE_REQUESTS.map(pr => (
                <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.requested_by}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                  <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.approved_by || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const ReportsAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {['Electronics', 'Office Supplies', 'Furniture'].map(cat => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cat}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {formatCurrency(Math.random() * 5000 + 1000)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-3">
            {MOCK_SUPPLIERS.map((supplier, idx) => (
              <div key={supplier.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">{supplier.supplier_name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(Math.random() * 10000)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PR Status Overview</h3>
          <div className="space-y-2">
            {['Pending', 'Approved', 'For Purchase', 'Completed', 'Rejected'].map(status => {
              const count = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === status).length
              const percentage = (count / MOCK_PURCHASE_REQUESTS.length) * 100
              return (
                <div key={status} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                    <span className="text-sm text-gray-600">{status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getStatusColor(status).split(' ')[0].replace('100', '500')}`} 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
        <div className="h-64 flex items-end gap-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
            const height = [40, 65, 45, 80, 55, 70][idx]
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-yellow-500 rounded-t-md transition-all hover:bg-yellow-600"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600">{month}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ============ MAIN APP ============
function App() {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  // Map backend role to frontend role
  const mapRole = (role) => {
    if (role === 'super_admin') return 'superadmin'
    return role
  }

  const currentRole = mapRole(user?.role)

  const renderContent = ({ activeNav }) => {
    // Engineer Views
    if (currentRole === 'engineer') {
      switch (activeNav) {
        case 'dashboard':
          return <EngineerDashboard />
        case 'items':
          return <BrowseItems />
        case 'add-item':
          return <AddItem />
        case 'purchase-requests':
          return <MyPurchaseRequests />
        case 'history':
          return <MyPurchaseRequests />
        default:
          return <EngineerDashboard />
      }
    }

    // Admin Views
    if (currentRole === 'admin') {
      switch (activeNav) {
        case 'dashboard':
          return <AdminDashboard />
        case 'items':
          return <ItemsManagement />
        case 'suppliers':
          return <SuppliersManagement />
        case 'purchase-orders':
          return <PurchaseOrders />
        case 'pending-prs':
          return <PurchaseOrders />
        default:
          return <AdminDashboard />
      }
    }

    // Super Admin Views
    if (currentRole === 'superadmin') {
      switch (activeNav) {
        case 'dashboard':
          return <SuperAdminDashboard />
        case 'approve-prs':
          return <ApprovePRs />
        case 'all-prs':
          return <AllPurchaseRequests />
        case 'all-pos':
          return <PurchaseOrders />
        case 'reports':
          return <ReportsAnalytics />
        default:
          return <SuperAdminDashboard />
      }
    }

    return <EngineerDashboard />
  }

  return (
    <Layout currentRole={user?.role}>
      {renderContent}
    </Layout>
  )
}

export default App
