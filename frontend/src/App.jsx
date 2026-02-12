import React, { useState, useRef, useEffect } from 'react'
import { itemService } from './services/items'
import { purchaseRequestService } from './services/purchaseRequests'
import { purchaseOrderService } from './services/purchaseOrders'
import { categoryService } from './services/categories'
import { supplierService } from './services/suppliers'
import { reportService } from './services/reports'
import { notificationService } from './services/notifications'
import { employeeService } from './services/employees'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import { authService } from './services/auth'
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
  ChevronUp,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  LogOut,
  Users,
  FileDown,
  ExternalLink,
  Settings,
  Menu,
  X
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
    'For Procurement Review': 'bg-blue-100 text-blue-800',
    'For Super Admin Final Approval': 'bg-indigo-100 text-indigo-800',
    'For Purchase': 'bg-purple-100 text-purple-800',
    'PO Created': 'bg-orange-100 text-orange-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
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

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill out all fields')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setSubmitting(true)
      const res = await authService.changePassword(currentPassword, newPassword, confirmPassword)
      setSuccess(res?.message || 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setError(apiErrors[0]?.msg || 'Failed to update password')
      } else {
        setError(err.response?.data?.message || 'Failed to update password')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Change your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
              {success}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

const PRDetailsModal = ({ prId, onClose }) => {
  const [pr, setPR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPR = async () => {
      try {
        setLoading(true)
        const data = await purchaseRequestService.getById(prId)
        setPR(data)
      } catch (err) {
        setError('Failed to fetch purchase request details')
      } finally {
        setLoading(false)
      }
    }

    if (prId) fetchPR()
  }, [prId])

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Purchase Request Details</h2>
            <p className="text-sm text-gray-500 mt-1">{pr?.pr_number || ''}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 text-red-600">{error}</div>
          )}

          {!loading && !error && pr && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="text-sm"><span className="font-medium text-gray-700">Requested By:</span> {pr.requester_first_name} {pr.requester_last_name}</div>
                  <div className="text-sm"><span className="font-medium text-gray-700">Created:</span> {formatDate(pr.created_at)}</div>
                  <div className="text-sm flex items-center gap-2"><span className="font-medium text-gray-700">Status:</span> <StatusBadge status={pr.status} /></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="text-sm"><span className="font-medium text-gray-700">Purpose:</span> {pr.purpose || '-'}</div>
                  <div className="text-sm"><span className="font-medium text-gray-700">Remarks:</span> {pr.remarks || '-'}</div>
                </div>
              </div>

              <Card>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Requested Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item Code</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pr.items || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.item_code || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.item_name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.unit || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(item.total_price || 0)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                      {(pr.items || []).length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

const PODetailsModal = ({ poId, onClose }) => {
  const [po, setPO] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true)
        const data = await purchaseOrderService.getById(poId)
        setPO(data)
      } catch (err) {
        setError('Failed to fetch purchase order details')
      } finally {
        setLoading(false)
      }
    }

    if (poId) fetchPO()
  }, [poId])

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Purchase Order Details</h2>
            <p className="text-sm text-gray-500 mt-1">{po?.po_number || ''}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 text-red-600">{error}</div>
          )}

          {!loading && !error && po && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="text-sm"><span className="font-medium text-gray-700">Related PR:</span> {po.pr_number || '-'}</div>
                  <div className="text-sm"><span className="font-medium text-gray-700">Supplier:</span> {po.supplier_name || '-'}</div>
                  <div className="text-sm flex items-center gap-2"><span className="font-medium text-gray-700">Status:</span> <StatusBadge status={po.status} /></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="text-sm"><span className="font-medium text-gray-700">PO Date:</span> {formatDate(po.po_date || po.created_at)}</div>
                  <div className="text-sm"><span className="font-medium text-gray-700">Expected Delivery:</span> {formatDate(po.expected_delivery_date)}</div>
                  <div className="text-sm"><span className="font-medium text-gray-700">Total Amount:</span> {formatCurrency(po.total_amount || 0)}</div>
                </div>
              </div>

              <Card>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(po.items || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-700">{item.item_name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.unit || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(item.total_price || 0)}</td>
                        </tr>
                      ))}
                      {(po.items || []).length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-500">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

// ============ LAYOUT ============
const Layout = ({ currentRole, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const { user, logout } = useAuth()

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
        setMobileMenuOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const data = await notificationService.getAll()
      console.log('Notifications data:', data)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }

  const roleNavItems = {
    engineer: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'items', label: 'Browse Items', icon: Package },
      { id: 'purchase-requests', label: 'My Purchase Requests', icon: ShoppingCart },
      { id: 'history', label: 'Purchase History', icon: ClipboardList },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    procurement: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'approve-prs', label: 'Approve PRs', icon: CheckCircle },
      { id: 'items', label: 'Items', icon: Package },
      { id: 'add-item', label: 'Add Item', icon: Plus },
      { id: 'all-prs', label: 'All Purchase Requests', icon: ClipboardList },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'items', label: 'Items', icon: Package },
      { id: 'suppliers', label: 'Suppliers', icon: Building2 },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText },
      { id: 'pending-prs', label: 'Pending PRs', icon: Clock },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    superadmin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'employees', label: 'Employees', icon: Users },
      { id: 'approve-prs', label: 'Approve PRs', icon: CheckCircle },
      { id: 'approve-pos', label: 'Approve POs', icon: FileText },
      { id: 'items', label: 'Items', icon: Package },
      { id: 'add-item', label: 'Add Item', icon: Plus },
      { id: 'all-prs', label: 'All Purchase Requests', icon: ClipboardList },
      { id: 'all-pos', label: 'All Purchase Orders', icon: FileText },
      { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  }

  const roleLabels = {
    engineer: 'Engineer',
    procurement: 'Procurement',
    admin: 'Admin',
    super_admin: 'Super Admin'
  }

  const roleColors = {
    engineer: 'bg-yellow-100 text-yellow-800',
    procurement: 'bg-blue-100 text-blue-800',
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

  const handleNavClick = (itemId) => {
    setActiveNav(itemId)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop: static, Mobile: fixed slide-out */}
      <aside 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`
        } bg-white border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {(sidebarOpen || isMobile) ? (
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
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-yellow-50 text-yellow-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            )
          })}

          {/* Attendance Link for All Users */}
          <a
            href="https://jajr.xandree.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="font-medium text-sm">Attendance</span>}
          </a>
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Toggle Sidebar - Desktop only */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Close button - Mobile only */}
        {isMobile && (
          <button
            onClick={closeMobileMenu}
            className="p-4 border-t border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Close Menu</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-btn md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 capitalize truncate">
              {activeNav.replace(/-/g, ' ')}
            </h1>
            <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${displayRoleColor}`}>
              {displayRole}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                        disabled={loadingNotifications}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            !notif.is_read ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                          }`}
                        >
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
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              {sidebarOpen && !isMobile && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children({ activeNav, currentRole })}
        </main>
      </div>
    </div>
  )
}

// ============ ENGINEER VIEWS ============
const EngineerDashboard = () => {
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchPRs()
  }, [])

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getAll()
      // Filter PRs for current user (engineer)
      const myPRs = data.filter(pr => pr.requested_by === user?.id)
      setPRs(myPRs)
    } catch (err) {
      console.error('Failed to fetch PRs', err)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = prs.filter(pr => pr.status === 'Pending').length
  const inReviewCount = prs.filter(pr => ['For Procurement Review', 'For Super Admin Final Approval'].includes(pr.status)).length
  const forPurchaseCount = prs.filter(pr => pr.status === 'For Purchase').length
  const completedCount = prs.filter(pr => pr.status === 'Completed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
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
              <p className="text-sm font-medium text-gray-600">In Review</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{inReviewCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">For Purchase</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{forPurchaseCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
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
              {prs.slice(0, 5).map(pr => (
                <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                  <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No purchase requests found
                  </td>
                </tr>
              )}
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
  const [prFormData, setPrFormData] = useState({ purpose: '', remarks: '', date_needed: '', project: '', project_address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchBranches()
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
      console.log('Branches API response:', data)
      
      // Handle the API response format
      let branchNames = []
      if (Array.isArray(data)) {
        // API returns array directly: [{id, branch_name}, ...]
        branchNames = data.map(branch => branch.branch_name)
      } else if (data && Array.isArray(data.data)) {
        // API returns { data: [...] }
        branchNames = data.data.map(branch => branch.branch_name)
      } else if (data && Array.isArray(data.branches)) {
        // API returns { branches: [...] }
        branchNames = data.branches.map(branch => branch.branch_name)
      }
      
      console.log('Extracted branch names:', branchNames)
      setBranches(branchNames)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
      setBranches([])
    } finally {
      setLoadingBranches(false)
    }
  }

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

    if (!prFormData.date_needed) {
      setSubmitError('Date needed is required')
      return
    }

    if (!prFormData.project) {
      setSubmitError('Project is required')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      await purchaseRequestService.create({
        purpose: prFormData.purpose,
        remarks: prFormData.remarks,
        date_needed: prFormData.date_needed,
        project: prFormData.project,
        project_address: prFormData.project_address,
        items: selectedItems.map(item => ({
          item_id: item.id,
          quantity: item.quantity
        }))
      })

      setSubmitSuccess(true)
      setPrFormData({ purpose: '', remarks: '', date_needed: '', project: '', project_address: '' })
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
        <Button onClick={() => setShowCreatePR(true)} disabled={selectedItems.length === 0} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create PR ({selectedItems.length})</span>
          <span className="sm:hidden">PR ({selectedItems.length})</span>
        </Button>
      </div>

      {/* Items List - Desktop Table / Mobile Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <Card>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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

          {/* Mobile Grid View */}
          <div className="md:hidden p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map(item => {
                const isSelected = selectedItems.find(i => i.id === item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item)}
                    className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-yellow-500 bg-yellow-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>

                    {/* Item Code */}
                    <p className="text-xs text-gray-500 font-mono mb-1">{item.item_code}</p>

                    {/* Item Name */}
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 pr-6">
                      {item.name || item.item_name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {item.description}
                    </p>

                    {/* Category & Unit */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {item.category_name || item.category}
                      </span>
                      <span>{item.unit}</span>
                    </div>

                    {/* Quantity Input (when selected) */}
                    {isSelected && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-600">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={isSelected.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {filteredItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">No items found</p>
            )}
          </div>
        </Card>
      )}

      {/* Create PR Modal */}
      {showCreatePR && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Needed *</label>
                  <input
                    type="date"
                    value={prFormData.date_needed}
                    onChange={(e) => setPrFormData({ ...prFormData, date_needed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    value={prFormData.project}
                    onChange={(e) => setPrFormData({ ...prFormData, project: e.target.value })}
                    disabled={loadingBranches || branches.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">
                      {loadingBranches ? 'Loading...' : branches.length === 0 ? 'No projects available' : 'Select project'}
                    </option>
                    {branches.map((branch, index) => (
                      <option key={index} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {branches.length === 0 && !loadingBranches && (
                    <p className="text-xs text-red-500 mt-1">Failed to load projects. Please refresh the page.</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                <input
                  type="text"
                  value={prFormData.project_address}
                  onChange={(e) => setPrFormData({ ...prFormData, project_address: e.target.value })}
                  placeholder="Enter project address"
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

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
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

  const [formData, setFormData] = useState({
    item_code: '',
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
        item_code: formData.item_code,
        item_name: formData.item_name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        unit: formData.unit
      })
      
      setSuccess(true)
      setFormData({ item_code: '', item_name: '', description: '', category_id: '', unit: '' })
      
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
              <input
                type="text"
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                placeholder="e.g., ITM008"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono"
              />
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
              onClick={() => setFormData({ item_code: '', item_name: '', description: '', category_id: '', unit: '' })}
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
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [expandedPRId, setExpandedPRId] = useState(null)

  const toggleExpand = (prId) => {
    setExpandedPRId(expandedPRId === prId ? null : prId)
  }

  useEffect(() => {
    fetchPRs()
  }, [])

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getAll()
      // Filter PRs for current user (engineer)
      const myPRs = data.filter(pr => pr.requested_by === user?.id)
      setPRs(myPRs)
    } catch (err) {
      setError('Failed to fetch purchase requests')
    } finally {
      setLoading(false)
    }
  }

  const allStatuses = ['all', 'Pending', 'For Procurement Review', 'For Super Admin Final Approval', 'For Purchase', 'PO Created', 'Completed', 'Rejected', 'Cancelled']
  const filteredPRs = filterStatus === 'all' ? prs : prs.filter(pr => pr.status === filterStatus)

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">My Purchase Requests</h2>
        <div className="flex flex-wrap gap-2">
          {allStatuses.map(status => (
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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                <React.Fragment key={pr.id}>
                  <tr 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(pr.id)}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                    <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleExpand(pr.id); }}>
                        {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedPRId === pr.id && (
                    <tr>
                      <td colSpan="5" className="bg-gray-50 p-4">
                        <PRExpandedDetails pr={pr} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No purchase requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {filteredPRs.map(pr => (
              <div
                key={pr.id}
                onClick={() => toggleExpand(pr.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPRId === pr.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{pr.pr_number}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{pr.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleExpand(pr.id); }}>
                    {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={pr.status} />
                  <span className="text-xs text-gray-500">{formatDate(pr.created_at)}</span>
                </div>

                {/* Expanded Details */}
                {expandedPRId === pr.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <PRExpandedDetails pr={pr} />
                  </div>
                )}
              </div>
            ))}
            {filteredPRs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No purchase requests found</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

const PRExpandedDetails = ({ pr }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Check if user can export (Super Admin, Procurement, Admin, Engineer)
  const canExport = ['super_admin', 'procurement', 'admin', 'engineer'].includes(user?.role)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await purchaseRequestService.getById(pr.id)
        setItems(data.items || [])
      } catch (err) {
        console.error('Failed to fetch PR details', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [pr.id])

  const handleExportExcel = async () => {
    try {
      const blob = await purchaseRequestService.exportToExcel(pr.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `PR-${pr.pr_number}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export PR to Excel', err)
      alert('Failed to export to Excel')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-700">Requested By:</span> {pr.requester_first_name} {pr.requester_last_name}</div>
          <div><span className="font-medium text-gray-700">Created:</span> {formatDate(pr.created_at)}</div>
          <div><span className="font-medium text-gray-700">Purpose:</span> {pr.purpose || '-'}</div>
          <div><span className="font-medium text-gray-700">Remarks:</span> {pr.remarks || '-'}</div>
          <div><span className="font-medium text-gray-700">Date Needed:</span> {pr.date_needed ? formatDate(pr.date_needed) : '-'}</div>
          <div><span className="font-medium text-gray-700">Project:</span> {pr.project || '-'}</div>
          <div><span className="font-medium text-gray-700">Project Address:</span> {pr.project_address || '-'}</div>
          <div><span className="font-medium text-gray-700">Total Amount:</span> {pr.total_amount ? formatCurrency(pr.total_amount) : '-'}</div>
          <div><span className="font-medium text-gray-700">Status:</span> <StatusBadge status={pr.status} /></div>
        </div>
        {canExport && (
          <Button size="sm" variant="secondary" onClick={handleExportExcel}>
            <FileDown className="w-4 h-4 mr-1" />
            Export Excel
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Item</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Qty</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                {pr.status !== 'Pending' && (
                  <>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Unit Cost</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="py-2 px-3">{item.item_name || item.item_code}</td>
                  <td className="py-2 px-3">{item.quantity}</td>
                  <td className="py-2 px-3">{item.unit}</td>
                  {pr.status !== 'Pending' && (
                    <>
                      <td className="py-2 px-3 text-right">{item.unit_price ? formatCurrency(item.unit_price) : '-'}</td>
                      <td className="py-2 px-3 text-right font-medium">{item.total_price ? formatCurrency(item.total_price) : '-'}</td>
                    </>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={pr.status === 'Pending' ? 3 : 5} className="py-4 text-center text-gray-500">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ ADMIN VIEWS ============
const PendingPRs = () => {
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreatePOModal, setShowCreatePOModal] = useState(false)
  const [selectedPR, setSelectedPR] = useState(null)
  const [expandedPRId, setExpandedPRId] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [poFormData, setPoFormData] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    place_of_delivery: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchPRs()
    fetchSuppliers()
  }, [])

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getAll()
      // Filter PRs with "For Purchase" status (ready for Admin to create PO)
      const forPurchasePRs = data.filter(pr => pr.status === 'For Purchase')
      setPRs(forPurchasePRs)
    } catch (err) {
      setError('Failed to fetch purchase requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      // For now, use mock suppliers. Replace with real API when available
      setSuppliers(MOCK_SUPPLIERS)
    } catch (err) {
      console.error('Failed to fetch suppliers', err)
    }
  }

  const handleCreatePO = (pr) => {
    setSelectedPR(pr)
    setShowCreatePOModal(true)
    setPoFormData({
      supplier_id: pr.supplier_id || '',
      expected_delivery_date: '',
      place_of_delivery: pr.project_address || '',
      notes: ''
    })
    setSubmitError('')
    setSubmitSuccess(false)
  }

  const handleSubmitPO = async () => {
    if (!poFormData.expected_delivery_date) {
      setSubmitError('Expected delivery date is required')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)

    try {
      // Get PR items to include in PO
      const prDetails = await purchaseRequestService.getById(selectedPR.id)

      const poItems = (prDetails.items || []).map((item) => ({
        purchase_request_item_id: item.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      await purchaseOrderService.create({
        purchase_request_id: selectedPR.id,
        supplier_id: parseInt(poFormData.supplier_id) || selectedPR.supplier_id,
        expected_delivery_date: poFormData.expected_delivery_date,
        place_of_delivery: poFormData.place_of_delivery,
        project: selectedPR.project,
        notes: poFormData.notes,
        items: poItems
      })

      setSubmitSuccess(true)
      setTimeout(() => {
        setShowCreatePOModal(false)
        setSelectedPR(null)
        setSubmitSuccess(false)
        setPRs(prev => prev.filter(pr => pr.id !== selectedPR.id))
      }, 2000)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create purchase order')
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Purchase Requests Ready for PO</h2>
        <div className="text-sm text-gray-500">
          {prs.length} PR{prs.length !== 1 ? 's' : ''} ready
        </div>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prs.map(pr => (
                <React.Fragment key={pr.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {pr.requester_first_name} {pr.requester_last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                    <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.total_amount ? formatCurrency(pr.total_amount) : '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={(e) => { e.stopPropagation(); handleCreatePO(pr); }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Create PO
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }}>
                          {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedPRId === pr.id && (
                    <tr>
                      <td colSpan="7" className="bg-gray-50 p-4">
                        <PRExpandedDetails pr={pr} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No purchase requests ready for Purchase Order creation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {prs.map(pr => (
              <div
                key={pr.id}
                onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPRId === pr.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{pr.pr_number}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{pr.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }}>
                    {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Requester */}
                <p className="text-xs text-gray-600 mb-2">
                  By: {pr.requester_first_name} {pr.requester_last_name}
                </p>

                {/* Amount & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {pr.total_amount ? formatCurrency(pr.total_amount) : '-'}
                  </span>
                  <StatusBadge status={pr.status} />
                </div>

                {/* Date & Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatDate(pr.created_at)}</span>
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={(e) => { e.stopPropagation(); handleCreatePO(pr); }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Create PO
                  </Button>
                </div>

                {/* Expanded Details */}
                {expandedPRId === pr.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <PRExpandedDetails pr={pr} />
                  </div>
                )}
              </div>
            ))}
            {prs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No purchase requests ready for Purchase Order creation</p>
            )}
          </div>
        </div>
      </Card>

      {/* Create PO Modal */}
      {showCreatePOModal && selectedPR && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Purchase Order</h2>
              <p className="text-sm text-gray-500 mt-1">For PR: {selectedPR.pr_number}</p>
            </div>
            <div className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">Purchase order created successfully!</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier (from PR)</label>
                  <select
                    value={poFormData.supplier_id}
                    onChange={(e) => setPoFormData({ ...poFormData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Pre-filled from PR. Change if needed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    value={poFormData.expected_delivery_date}
                    onChange={(e) => setPoFormData({ ...poFormData, expected_delivery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Delivery</label>
                <input
                  type="text"
                  value={poFormData.place_of_delivery}
                  onChange={(e) => setPoFormData({ ...poFormData, place_of_delivery: e.target.value })}
                  placeholder="Where items will be delivered..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-xs text-gray-500 mt-1">Pre-filled with Project Address from PR. Change if needed.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={poFormData.notes}
                  onChange={(e) => setPoFormData({ ...poFormData, notes: e.target.value })}
                  placeholder="Additional notes for this purchase order..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">PR Details</h3>
                <div className="bg-gray-50 p-3 rounded-md space-y-1">
                  <p><strong>PR Number:</strong> {selectedPR.pr_number}</p>
                  <p><strong>Project:</strong> {selectedPR.project || '-'}</p>
                  <p><strong>Project Address:</strong> {selectedPR.project_address || '-'}</p>
                  <p><strong>Purpose:</strong> {selectedPR.purpose}</p>
                  <p><strong>Requested by:</strong> {selectedPR.requester_first_name} {selectedPR.requester_last_name}</p>
                  <p><strong>Created:</strong> {formatDate(selectedPR.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowCreatePOModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPO}
                disabled={submitting || !poFormData.expected_delivery_date}
              >
                {submitting ? 'Creating...' : 'Create PO'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  const [prs, setPRs] = useState([])
  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prsData, posData] = await Promise.all([
        purchaseRequestService.getAll(),
        purchaseOrderService.getAll()
      ])
      setPRs(prsData)
      setPOs(posData)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  const forPurchasePRs = prs.filter(pr => pr.status === 'For Purchase')
  const pendingPRsCount = forPurchasePRs.length
  const totalItems = MOCK_ITEMS.length
  const totalSuppliers = MOCK_SUPPLIERS.length
  const pendingPOs = pos.filter(po => po.status === 'Ordered').length

  const handleExportPO = async (po) => {
    try {
      const blob = await purchaseOrderService.exportToExcel(po.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `PO-${po.po_number}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export PO to Excel', err)
      alert('Failed to export to Excel')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PRs for PO</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingPRsCount}</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PRs Ready for PO Creation</h2>
          <div className="space-y-3">
            {forPurchasePRs.map(pr => (
              <div key={pr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{pr.pr_number}</p>
                  <p className="text-xs text-gray-500">{pr.purpose}</p>
                </div>
                <Button size="sm" variant="success">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Create PO
                </Button>
              </div>
            ))}
            {forPurchasePRs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No PRs ready for Purchase Order</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchase Orders</h2>
          <div className="space-y-3">
            {pos.slice(0, 5).map(po => (
              <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{po.po_number}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(po.total_amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={po.status} />
                  <Button size="sm" variant="secondary" onClick={() => handleExportPO(po)}>
                    <FileDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pos.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No purchase orders found</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

const ItemsManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    description: '',
    category_id: '',
    unit: ''
  })

  useEffect(() => {
    fetchItems()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await itemService.getAll()
      setItems(data)
    } catch (err) {
      setError('Failed to fetch items')
      console.error('Failed to fetch items', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!formData.item_code.trim() || !formData.item_name.trim()) {
      setError('Item code and name are required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await itemService.create(formData)
      setShowAddModal(false)
      setFormData({ item_code: '', item_name: '', description: '', category_id: '', unit: '' })
      await fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (item) => {
    setSelectedItem(item)
    setFormData({
      item_code: item.item_code || '',
      item_name: item.item_name || item.name || '',
      description: item.description || '',
      category_id: item.category_id || '',
      unit: item.unit || ''
    })
    setShowEditModal(true)
    setError('')
  }

  const handleUpdate = async () => {
    if (!formData.item_name.trim()) {
      setError('Item name is required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await itemService.update(selectedItem.id, formData)
      setShowEditModal(false)
      setSelectedItem(null)
      setFormData({ item_code: '', item_name: '', description: '', category_id: '', unit: '' })
      await fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.item_name || item.name}?`)) return

    try {
      await itemService.delete(item.id)
      await fetchItems()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item')
    }
  }

  const filteredItems = items.filter(item => 
    (item.item_name || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.item_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button onClick={() => {
          setShowAddModal(true)
          setError('')
          setFormData({ item_code: '', item_name: '', description: '', category_id: '', unit: '' })
        }} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {error && !showAddModal && !showEditModal && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                  <td className="py-3 px-4 text-sm text-gray-900">{item.item_name || item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.category_name || item.category || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.unit}</td>
                  <td className="py-3 px-4"><StatusBadge status={item.status || 'Active'} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-gray-500 font-mono">{item.item_code}</p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Item Name */}
                <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                  {item.item_name || item.name}
                </h3>

                {/* Category */}
                <p className="text-xs text-gray-600 mb-2">
                  {item.category_name || item.category || '-'}
                </p>

                {/* Unit & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                  <StatusBadge status={item.status || 'Active'} />
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-center text-gray-500 py-8 col-span-full">No items found</p>
            )}
          </div>
        </div>
      </Card>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
                <input
                  type="text"
                  name="item_code"
                  value={formData.item_code}
                  onChange={handleInputChange}
                  placeholder="e.g., ITM008"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g., pc, kg, box"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Item</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedItem.item_code}</p>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g., pc, kg, box"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const SuppliersManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [expandedSupplierId, setExpandedSupplierId] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tin: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getAll()
      setSuppliers(data)
    } catch (err) {
      setError('Failed to fetch suppliers')
      console.error('Failed to fetch suppliers', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.supplier_name || supplier.name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      tin: supplier.tin || ''
    })
    setShowEditModal(true)
    setError('')
  }

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      setError('Supplier name is required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await supplierService.update(selectedSupplier.id, formData)
      setShowEditModal(false)
      setSelectedSupplier(null)
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tin: '' })
      await fetchSuppliers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpand = (supplierId) => {
    setExpandedSupplierId(expandedSupplierId === supplierId ? null : supplierId)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Supplier name is required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await supplierService.create(formData)
      setShowAddModal(false)
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', tin: '' })
      await fetchSuppliers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredSuppliers = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button onClick={() => setShowAddModal(true)} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Supplier</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <React.Fragment key={supplier.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(supplier.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{supplier.name || supplier.supplier_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.contact_person || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{supplier.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e && e.stopPropagation(); toggleExpand(supplier.id); }}>
                          {expandedSupplierId === supplier.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e && e.stopPropagation(); handleEditClick(supplier); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedSupplierId === supplier.id && (
                    <tr>
                      <td colSpan="5" className="bg-gray-50 p-4">
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div><span className="font-medium text-gray-700">Supplier Code:</span> {supplier.supplier_code || '-'}</div>
                            <div><span className="font-medium text-gray-700">Status:</span> {supplier.status || 'Active'}</div>
                            <div><span className="font-medium text-gray-700">Contact Person:</span> {supplier.contact_person || '-'}</div>
                            <div><span className="font-medium text-gray-700">Email:</span> {supplier.email || '-'}</div>
                            <div><span className="font-medium text-gray-700">Phone:</span> {supplier.phone || '-'}</div>
                            <div><span className="font-medium text-gray-700">Created:</span> {formatDate(supplier.created_at)}</div>
                          </div>
                          <div><span className="font-medium text-gray-700">Address:</span> {supplier.address || '-'}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                onClick={() => toggleExpand(supplier.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedSupplierId === supplier.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{supplier.name || supplier.supplier_name}</h3>
                    <p className="text-xs text-gray-600">{supplier.contact_person || '-'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleExpand(supplier.id); }}>
                      {expandedSupplierId === supplier.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(supplier); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-gray-600 mb-2">
                  <p>{supplier.email || '-'}</p>
                  <p>{supplier.phone || '-'}</p>
                </div>

                {/* Expanded Details */}
                {expandedSupplierId === supplier.id && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs">
                    <p><span className="font-medium text-gray-700">Code:</span> {supplier.supplier_code || '-'}</p>
                    <p><span className="font-medium text-gray-700">Status:</span> {supplier.status || 'Active'}</p>
                    <p><span className="font-medium text-gray-700">Created:</span> {formatDate(supplier.created_at)}</p>
                    <p><span className="font-medium text-gray-700">Address:</span> {supplier.address || '-'}</p>
                  </div>
                )}
              </div>
            ))}
            {filteredSuppliers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No suppliers found</p>
            )}
          </div>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Supplier</h2>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  placeholder="Enter contact person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TIN</label>
                <input
                  type="text"
                  name="tin"
                  value={formData.tin}
                  onChange={handleInputChange}
                  placeholder="Tax Identification Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Supplier</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedSupplier.supplier_name || selectedSupplier.name}</p>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  placeholder="Enter contact person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const PurchaseOrders = () => {
  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [expandedPOId, setExpandedPOId] = useState(null)

  useEffect(() => {
    fetchPOs()
  }, [])

  const fetchPOs = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderService.getAll()
      setPOs(data)
    } catch (err) {
      setError('Failed to fetch purchase orders')
    } finally {
      setLoading(false)
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
        <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
        <div className="text-sm text-gray-500">
          {pos.length} PO{pos.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map(po => (
                <React.Fragment key={po.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedPOId(expandedPOId === po.id ? null : po.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{po.po_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{po.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{po.supplier_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(po.total_amount)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(po.po_date || po.created_at)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(po.expected_delivery_date)}</td>
                    <td className="py-3 px-4"><StatusBadge status={po.status} /></td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPOId(expandedPOId === po.id ? null : po.id); }}>
                        {expandedPOId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedPOId === po.id && (
                    <tr>
                      <td colSpan="8" className="bg-gray-50 p-4">
                        <POExpandedDetails po={po} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {pos.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {pos.map(po => (
              <div
                key={po.id}
                onClick={() => setExpandedPOId(expandedPOId === po.id ? null : po.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPOId === po.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{po.po_number}</p>
                    <p className="text-sm text-gray-600">PR: {po.pr_number}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPOId(expandedPOId === po.id ? null : po.id); }}>
                    {expandedPOId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Supplier & Amount */}
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-900">{po.supplier_name}</p>
                  <p className="text-sm font-medium text-gray-700">{formatCurrency(po.total_amount)}</p>
                </div>

                {/* Dates & Status */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>PO: {formatDate(po.po_date || po.created_at)}</span>
                  <span>Del: {formatDate(po.expected_delivery_date)}</span>
                </div>
                <StatusBadge status={po.status} />

                {/* Expanded Details */}
                {expandedPOId === po.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <POExpandedDetails po={po} />
                  </div>
                )}
              </div>
            ))}
            {pos.length === 0 && (
              <p className="text-center text-gray-500 py-8">No purchase orders found</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

const POExpandedDetails = ({ po }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Check if user can export (Super Admin, Procurement, Admin, Engineer)
  const canExport = ['super_admin', 'procurement', 'admin', 'engineer'].includes(user?.role)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await purchaseOrderService.getById(po.id)
        setItems(data.items || [])
      } catch (err) {
        console.error('Failed to fetch PO details', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [po.id])

  const handleExportExcel = async () => {
    try {
      const blob = await purchaseOrderService.exportToExcel(po.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `PO-${po.po_number}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export PO to Excel', err)
      alert('Failed to export to Excel')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-700">Related PR:</span> {po.pr_number || '-'}</div>
          <div><span className="font-medium text-gray-700">Supplier:</span> {po.supplier_name || '-'}</div>
          <div><span className="font-medium text-gray-700">PO Date:</span> {formatDate(po.po_date || po.created_at)}</div>
          <div><span className="font-medium text-gray-700">Expected Delivery:</span> {formatDate(po.expected_delivery_date)}</div>
          <div><span className="font-medium text-gray-700">Total Amount:</span> {formatCurrency(po.total_amount || 0)}</div>
          <div><span className="font-medium text-gray-700">Status:</span> <StatusBadge status={po.status} /></div>
        </div>
        {canExport && (
          <Button size="sm" variant="secondary" onClick={handleExportExcel}>
            <FileDown className="w-4 h-4 mr-1" />
            Export Excel
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Item</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Qty</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Unit Price</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="py-2 px-3">{item.item_name || '-'}</td>
                  <td className="py-2 px-3">{item.quantity}</td>
                  <td className="py-2 px-3">{item.unit || '-'}</td>
                  <td className="py-2 px-3">{formatCurrency(item.unit_price || 0)}</td>
                  <td className="py-2 px-3 font-medium">{formatCurrency(item.total_price || 0)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ PROCUREMENT VIEWS ============
const ProcurementDashboard = () => {
  const pendingApprovals = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Super Admin Approved').length
  const totalApproved = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Procurement Approved').length
  const totalRejected = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Rejected' && pr.rejection_reason).length
  const totalItems = MOCK_ITEMS.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved by You</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalApproved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected (with reason)</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalRejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PRs Awaiting Your Approval</h2>
        <div className="space-y-3">
          {MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Super Admin Approved').map(pr => (
            <div key={pr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">{pr.pr_number}</p>
                <p className="text-xs text-gray-500">{pr.purpose}</p>
              </div>
              <Button size="sm">Review</Button>
            </div>
          ))}
          {MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Super Admin Approved').length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No PRs awaiting approval</p>
          )}
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

  const [procurementOverview, setProcurementOverview] = useState({
    totalSpendYtd: 0,
    avgProcessingDays: 0,
    activeSuppliers: 0
  })
  const [overviewLoading, setOverviewLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setOverviewLoading(true)
        const data = await reportService.getDashboardStats()
        if (data?.procurementOverview) {
          setProcurementOverview({
            totalSpendYtd: Number(data.procurementOverview.totalSpendYtd) || 0,
            avgProcessingDays: Number(data.procurementOverview.avgProcessingDays) || 0,
            activeSuppliers: Number(data.procurementOverview.activeSuppliers) || 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setOverviewLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

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
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {overviewLoading ? '—' : formatCurrency(procurementOverview.totalSpendYtd)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Processing Time</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {overviewLoading ? '—' : `${procurementOverview.avgProcessingDays.toFixed(1)} days`}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Suppliers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {overviewLoading ? '—' : procurementOverview.activeSuppliers}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

const ApprovePRs = () => {
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPR, setSelectedPR] = useState(null)
  const [expandedPRId, setExpandedPRId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalItems, setApprovalItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [supplierAddress, setSupplierAddress] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { user } = useAuth()

  const isSuperAdmin = user?.role === 'super_admin'
  const isProcurement = user?.role === 'procurement'

  // Determine which PRs to show based on role
  const getPendingPRs = () => {
    if (isSuperAdmin) {
      // Super Admin sees: Pending (first approval) and For Super Admin Final Approval (final approval)
      return prs.filter(pr => pr.status === 'Pending' || pr.status === 'For Super Admin Final Approval')
    } else if (isProcurement) {
      // Procurement sees: For Procurement Review
      return prs.filter(pr => pr.status === 'For Procurement Review')
    }
    return []
  }

  const pendingPRs = getPendingPRs()

  useEffect(() => {
    fetchPRs()
  }, [])

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getAll()
      setPRs(data)
    } catch (err) {
      console.error('Failed to fetch PRs', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (pr) => {
    // For procurement, show modal to enter unit prices for items before approving
    if (isProcurement) {
      setSelectedPR(pr)
      // Fetch PR details to get items
      try {
        const [prDetails, suppliersData] = await Promise.all([
          purchaseRequestService.getById(pr.id),
          supplierService.getAll()
        ])
        setApprovalItems(prDetails.items || [])
        setSuppliers(suppliersData || [])
        setSelectedSupplier('')
        setSupplierAddress('')
        setShowApproveModal(true)
      } catch (err) {
        console.error('Failed to fetch PR items or suppliers', err)
      }
      return
    }
    
    // For Super Admin, approve directly
    setActionLoading(true)
    try {
      await purchaseRequestService.superAdminFirstApprove(pr.id, 'approved')
      await fetchPRs()
    } catch (err) {
      console.error('Approval failed', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleItemPriceChange = (itemId, unitPrice) => {
    setApprovalItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, unit_price: parseFloat(unitPrice) || 0, total_price: (parseFloat(unitPrice) || 0) * item.quantity }
        : item
    ))
  }

  const handleSupplierChange = (supplierId) => {
    setSelectedSupplier(supplierId)
    const selectedSupplierData = suppliers.find(s => s.id === parseInt(supplierId))
    setSupplierAddress(selectedSupplierData?.address || '')
  }

  const calculateTotalAmount = () => {
    return approvalItems.reduce((sum, item) => sum + (item.total_price || 0), 0)
  }

  const handleConfirmApprove = async () => {
    if (!selectedPR) return
    
    if (!selectedSupplier) {
      alert('Please select a supplier')
      return
    }
    
    setActionLoading(true)
    try {
      // Prepare items array with id, unit_price, and quantity
      const itemsForApi = approvalItems.map(item => ({
        id: item.id,
        unit_price: item.unit_price || 0,
        quantity: item.quantity
      }))
      
      await purchaseRequestService.procurementApprove(
        selectedPR.id, 
        'approved', 
        null, 
        itemsForApi,
        selectedSupplier,
        supplierAddress
      )
      setShowApproveModal(false)
      setSelectedPR(null)
      setApprovalItems([])
      setSelectedSupplier('')
      setSupplierAddress('')
      await fetchPRs()
    } catch (err) {
      console.error('Approval failed', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (pr) => {
    // If rejection reason is empty and it's Procurement (required), show modal first
    if (!rejectionReason.trim() && isProcurement) {
      setSelectedPR(pr)
      setShowRejectModal(true)
      return
    }

    // For Super Admin, rejection reason is optional - proceed with or without reason
    if (!rejectionReason.trim() && !showRejectModal) {
      // First click - show modal to give SA chance to add reason (optional)
      setSelectedPR(pr)
      setShowRejectModal(true)
      return
    }

    setActionLoading(true)
    try {
      if (isSuperAdmin) {
        await purchaseRequestService.superAdminFirstApprove(pr.id, 'rejected', rejectionReason)
      } else if (isProcurement) {
        await purchaseRequestService.procurementApprove(pr.id, 'rejected', rejectionReason)
      }
      setShowRejectModal(false)
      setRejectionReason('')
      await fetchPRs()
    } catch (err) {
      console.error('Rejection failed', err)
    } finally {
      setActionLoading(false)
    }
  }

  const getApprovalLabel = (status) => {
    if (status === 'Pending') return 'SA First Approval'
    if (status === 'For Procurement Review') return 'Procurement Review'
    if (status === 'For Super Admin Final Approval') return 'SA Final Approval'
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isSuperAdmin ? 'Super Admin Approval' : 'Procurement Approval'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSuperAdmin 
              ? 'First approval: Pending → For Procurement Review | Final approval: For Super Admin Final Approval → For Purchase'
              : 'Review PRs and forward to Super Admin for final approval'}
          </p>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Current Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPRs.map(pr => (
                <React.Fragment key={pr.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {pr.requester_first_name} {pr.requester_last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                    <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                    <td className="py-3 px-4 text-sm text-blue-600 font-medium">
                      {getApprovalLabel(pr.status)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.total_amount ? formatCurrency(pr.total_amount) : '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }} disabled={actionLoading}>
                          {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="success" 
                          onClick={(e) => { e.stopPropagation(); handleApprove(pr); }}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={(e) => { e.stopPropagation(); handleReject(pr); }}
                          disabled={actionLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedPRId === pr.id && (
                    <tr>
                      <td colSpan="8" className="bg-gray-50 p-4">
                        <PRExpandedDetails pr={pr} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {pendingPRs.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No purchase requests awaiting your approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {pendingPRs.map(pr => (
              <div
                key={pr.id}
                onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPRId === pr.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{pr.pr_number}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{pr.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }} disabled={actionLoading}>
                    {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Requester & Stage */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">
                    By: {pr.requester_first_name} {pr.requester_last_name}
                  </p>
                  <span className="text-xs text-blue-600 font-medium">
                    {getApprovalLabel(pr.status)}
                  </span>
                </div>

                {/* Amount & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {pr.total_amount ? formatCurrency(pr.total_amount) : '-'}
                  </span>
                  <StatusBadge status={pr.status} />
                </div>

                {/* Date & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatDate(pr.created_at)}</span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={(e) => { e.stopPropagation(); handleApprove(pr); }}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={(e) => { e.stopPropagation(); handleReject(pr); }}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPRId === pr.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <PRExpandedDetails pr={pr} />
                  </div>
                )}
              </div>
            ))}
            {pendingPRs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No purchase requests awaiting your approval</p>
            )}
          </div>
        </div>
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Purchase Request</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedPR?.pr_number}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isProcurement ? 'Rejection Reason (Required)' : 'Rejection Reason (Optional)'}
                </label>
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
              <Button 
                variant="danger" 
                onClick={() => handleReject(selectedPR)}
                disabled={actionLoading || (isProcurement && !rejectionReason.trim())}
              >
                {actionLoading ? 'Rejecting...' : 'Reject PR'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Approve Purchase Request</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedPR?.pr_number} - Enter unit cost for each item and select supplier</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Item</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Qty</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Unit</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Unit Cost (PHP)</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalItems.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="py-2 px-3">{item.item_name || item.item_code}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3">{item.unit}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.unit_price || ''}
                            onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                            placeholder="0.00"
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {formatCurrency(item.total_price || 0)}
                        </td>
                      </tr>
                    ))}
                    {approvalItems.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">No items found</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="py-2 px-3 text-right font-medium text-gray-700">Total Amount:</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">{formatCurrency(calculateTotalAmount())}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Address</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 min-h-[38px]">
                    {supplierAddress || <span className="text-gray-400">Select a supplier to see address</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>Cancel</Button>
              <Button 
                variant="success" 
                onClick={handleConfirmApprove}
                disabled={actionLoading || approvalItems.length === 0 || !selectedSupplier}
              >
                {actionLoading ? 'Approving...' : 'Approve & Forward'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const ApprovePOs = () => {
  const [selectedPO, setSelectedPO] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [pos, setPOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [expandedPOId, setExpandedPOId] = useState(null)

  const fetchPOs = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderService.getAll()
      setPOs(data)
    } catch (err) {
      setError('Failed to fetch purchase orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPOs()
  }, [])

  const pendingPOs = pos.filter(po => po.status === 'Draft')

  const handleApprove = async (po) => {
    setActionLoading(true)
    try {
      await purchaseOrderService.superAdminApprove(po.id, 'approved')
      await fetchPOs()
    } catch (err) {
      console.error('Failed to approve PO', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (po) => {
    setSelectedPO(po)
    setShowRejectModal(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedPO) return
    setActionLoading(true)
    try {
      await purchaseOrderService.superAdminApprove(selectedPO.id, 'rejected')
      setShowRejectModal(false)
      setSelectedPO(null)
      await fetchPOs()
    } catch (err) {
      console.error('Failed to reject PO', err)
    } finally {
      setActionLoading(false)
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
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Orders Pending Approval</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve/reject purchase orders placed by Admin</p>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Related PR</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPOs.map(po => {
                return (
                  <React.Fragment key={po.id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedPOId(expandedPOId === po.id ? null : po.id)}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{po.po_number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{po.pr_number || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{po.supplier_name || '-'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatDate(po.po_date || po.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPOId(expandedPOId === po.id ? null : po.id); }} disabled={actionLoading}>
                            {expandedPOId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleApprove(po); }} disabled={actionLoading}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleReject(po); }} disabled={actionLoading}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedPOId === po.id && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50 p-4">
                          <POExpandedDetails po={po} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {pendingPOs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No pending purchase orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {pendingPOs.map(po => (
              <div
                key={po.id}
                onClick={() => setExpandedPOId(expandedPOId === po.id ? null : po.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPOId === po.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{po.po_number}</p>
                    <p className="text-sm text-gray-600">PR: {po.pr_number || '-'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPOId(expandedPOId === po.id ? null : po.id); }} disabled={actionLoading}>
                    {expandedPOId === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Supplier & Amount */}
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-900">{po.supplier_name || '-'}</p>
                  <p className="text-sm font-medium text-gray-700">{formatCurrency(po.total_amount)}</p>
                </div>

                {/* Date & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatDate(po.po_date || po.created_at)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleApprove(po); }} disabled={actionLoading}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleReject(po); }} disabled={actionLoading}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPOId === po.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <POExpandedDetails po={po} />
                  </div>
                )}
              </div>
            ))}
            {pendingPOs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending purchase orders</p>
            )}
          </div>
        </div>
      </Card>

      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Purchase Order</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedPO?.po_number}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                <textarea
                  placeholder="Enter reason for rejection..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Reject PO'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

const AllPurchaseRequests = () => {
  const [prs, setPRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPRId, setExpandedPRId] = useState(null)

  useEffect(() => {
    fetchPRs()
  }, [])

  const fetchPRs = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getAll()
      setPRs(data)
    } catch (err) {
      setError('Failed to fetch purchase requests')
      console.error('Failed to fetch PRs', err)
    } finally {
      setLoading(false)
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
      <Card>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Purchase Requests</h2>
          <div className="text-sm text-gray-500">
            {prs.length} PR{prs.length !== 1 ? 's' : ''} total
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prs.map(pr => (
                <React.Fragment key={pr.id}>
                  <tr 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {pr.requester_first_name} {pr.requester_last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{pr.purpose}</td>
                    <td className="py-3 px-4"><StatusBadge status={pr.status} /></td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }}>
                        {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                  {expandedPRId === pr.id && (
                    <tr>
                      <td colSpan="7" className="bg-gray-50 p-4">
                        <PRExpandedDetails pr={pr} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No purchase requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="space-y-3">
            {prs.map(pr => (
              <div
                key={pr.id}
                onClick={() => setExpandedPRId(expandedPRId === pr.id ? null : pr.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  expandedPRId === pr.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{pr.pr_number}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{pr.purpose}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedPRId(expandedPRId === pr.id ? null : pr.id); }}>
                    {expandedPRId === pr.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Requester */}
                <p className="text-xs text-gray-600 mb-2">
                  By: {pr.requester_first_name} {pr.requester_last_name}
                </p>

                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={pr.status} />
                  <span className="text-xs text-gray-500">{formatDate(pr.created_at)}</span>
                </div>

                {/* Expanded Details */}
                {expandedPRId === pr.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <PRExpandedDetails pr={pr} />
                  </div>
                )}
              </div>
            ))}
            {prs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No purchase requests found</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

const ReportsAnalytics = () => {
  const [spendingByCategory, setSpendingByCategory] = useState([])
  const [topSuppliers, setTopSuppliers] = useState([])
  const [prStatusData, setPrStatusData] = useState({ statusData: [], total: 0 })
  const [monthlySpending, setMonthlySpending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [categoryData, suppliersData, statusData, monthlyData] = await Promise.all([
        reportService.getSpendingByCategory(),
        reportService.getTopSuppliers(),
        reportService.getPRStatusOverview(),
        reportService.getMonthlySpending()
      ])
      
      setSpendingByCategory(categoryData.categories || [])
      setTopSuppliers(suppliersData.suppliers || [])
      setPrStatusData(statusData || { statusData: [], total: 0 })
      setMonthlySpending(monthlyData.monthlyData || [])
    } catch (err) {
      console.error('Failed to fetch report data:', err)
      setError('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate max spending for category chart scaling
  const maxCategorySpending = spendingByCategory.length > 0 
    ? Math.max(...spendingByCategory.map(c => c.total_amount || 0))
    : 1

  // Calculate max spending for monthly chart scaling
  const maxMonthlySpending = monthlySpending.length > 0
    ? Math.max(...monthlySpending.map(m => m.total_amount || 0))
    : 1

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {spendingByCategory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No spending data available</p>
            ) : (
              spendingByCategory.map(cat => (
                <div key={cat.category_name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cat.category_name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full" 
                        style={{ width: `${Math.min(100, (cat.total_amount / maxCategorySpending) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      {formatCurrency(cat.total_amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-3">
            {topSuppliers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No supplier data available</p>
            ) : (
              topSuppliers.map((supplier, idx) => (
                <div key={supplier.supplier_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{supplier.supplier_name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(supplier.total_amount)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PR Status Overview</h3>
          <div className="space-y-2">
            {prStatusData.statusData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No PR data available</p>
            ) : (
              prStatusData.statusData.map(status => {
                const percentage = prStatusData.total > 0 
                  ? (status.count / prStatusData.total) * 100 
                  : 0
                return (
                  <div key={status.status} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status).split(' ')[0]}`} />
                      <span className="text-sm text-gray-600">{status.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getStatusColor(status.status).split(' ')[0].replace('100', '500')}`} 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-6 text-right">{status.count}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
        <div className="h-64 flex items-end gap-2">
          {monthlySpending.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No monthly spending data available
            </div>
          ) : (
            monthlySpending.map((monthData) => {
              const height = maxMonthlySpending > 0 
                ? (monthData.total_amount / maxMonthlySpending) * 100 
                : 0
              return (
                <div key={monthData.month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-yellow-500 rounded-t-md transition-all hover:bg-yellow-600"
                    style={{ height: `${Math.max(5, height)}%` }}
                  />
                  <span className="text-xs text-gray-600">{monthNames[monthData.month - 1]}</span>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

// ============ EMPLOYEES MANAGEMENT ============
const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    employee_no: '',
    first_name: '',
    last_name: '',
    role: 'engineer',
    department: ''
  })

  const roleOptions = [
    { value: 'engineer', label: 'Engineer' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (err) {
      setError('Failed to fetch employees')
      console.error('Failed to fetch employees', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!formData.employee_no.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Employee number, first name, and last name are required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await employeeService.create(formData)
      setShowAddModal(false)
      setFormData({ employee_no: '', first_name: '', middle_initial: '', last_name: '', role: 'engineer', department: '' })
      await fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee)
    setFormData({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      role: employee.role || 'engineer',
      department: employee.department || ''
    })
    setShowEditModal(true)
    setError('')
  }

  const handleUpdate = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await employeeService.update(selectedEmployee.id, formData)
      setShowEditModal(false)
      setSelectedEmployee(null)
      setFormData({ employee_no: '', first_name: '', middle_initial: '', last_name: '', role: 'engineer', department: '' })
      await fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (employee) => {
    if (!confirm(`Reset password for ${employee.first_name} ${employee.last_name}? The default password will be set to 'jajrconstruction'.`)) {
      return
    }

    try {
      await employeeService.resetPassword(employee.id)
      alert('Password reset successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      'engineer': 'bg-yellow-100 text-yellow-800',
      'procurement': 'bg-blue-100 text-blue-800',
      'admin': 'bg-green-100 text-green-800',
      'super_admin': 'bg-purple-100 text-purple-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role) => {
    const labels = {
      'engineer': 'Engineer',
      'procurement': 'Procurement',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    }
    return labels[role] || role
  }

  const filteredEmployees = employees.filter(e => 
    (e.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.employee_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <Button onClick={() => {
          setShowAddModal(true)
          setError('')
          setFormData({ employee_no: '', first_name: '', middle_initial: '', last_name: '', role: 'engineer', department: '' })
        }} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Employee No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{employee.employee_no}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{employee.first_name} {employee.last_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{employee.department || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(employee)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(employee)}>
                        <User className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{employee.employee_no}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(employee)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleResetPassword(employee)}>
                      <User className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Role & Department */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                    {getRoleLabel(employee.role)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Department */}
                <p className="text-xs text-gray-600">
                  Dept: {employee.department || '-'}
                </p>
              </div>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-gray-500 py-8 col-span-full">No employees found</p>
            )}
          </div>
        </div>
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Employee</h2>
              <p className="text-sm text-gray-500 mt-1">Default password will be set to 'jajrconstruction'</p>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number *</label>
                <input
                  type="text"
                  name="employee_no"
                  value={formData.employee_no}
                  onChange={handleInputChange}
                  placeholder="Enter employee number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial</label>
                  <input
                    type="text"
                    name="middle_initial"
                    value={formData.middle_initial}
                    onChange={handleInputChange}
                    placeholder="M.I."
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Employee</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedEmployee.employee_no} - {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial</label>
                  <input
                    type="text"
                    name="middle_initial"
                    value={formData.middle_initial}
                    onChange={handleInputChange}
                    placeholder="M.I."
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Enter department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="is_active"
                  value={formData.is_active !== undefined ? formData.is_active : selectedEmployee.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
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
        case 'settings':
          return <SettingsPage />
        default:
          return <EngineerDashboard />
      }
    }

    // Procurement Views
    if (currentRole === 'procurement') {
      switch (activeNav) {
        case 'dashboard':
          return <ProcurementDashboard />
        case 'approve-prs':
          return <ApprovePRs />
        case 'items':
          return <ItemsManagement />
        case 'add-item':
          return <AddItem />
        case 'all-prs':
          return <AllPurchaseRequests />
        case 'settings':
          return <SettingsPage />
        default:
          return <ProcurementDashboard />
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
          return <PendingPRs />
        case 'settings':
          return <SettingsPage />
        default:
          return <AdminDashboard />
      }
    }

    // Super Admin Views
    if (currentRole === 'superadmin') {
      switch (activeNav) {
        case 'dashboard':
          return <SuperAdminDashboard />
        case 'employees':
          return <EmployeesManagement />
        case 'approve-prs':
          return <ApprovePRs />
        case 'approve-pos':
          return <ApprovePOs />
        case 'items':
          return <ItemsManagement />
        case 'add-item':
          return <AddItem />
        case 'all-prs':
          return <AllPurchaseRequests />
        case 'all-pos':
          return <PurchaseOrders />
        case 'reports':
          return <ReportsAnalytics />
        case 'settings':
          return <SettingsPage />
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
