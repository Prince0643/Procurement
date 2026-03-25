import React, { useState, useEffect } from 'react'
import { purchaseRequestService } from '../services/purchaseRequests'
import { purchaseOrderService } from '../services/purchaseOrders'
import { serviceRequestService } from '../services/serviceRequests'
import { cashRequestService } from '../services/cashRequests'
import pricingHistoryService from '../services/pricingHistory'
import { FileText, Clock, CheckCircle, ShoppingCart, AlertCircle, CreditCard, TrendingUp, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </Card>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <span className="text-xs text-gray-700 text-right break-words">{value}</span>
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(false)
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [stats, setStats] = useState({
    totalPRs: 0,
    pendingPRs: 0,
    approvedPRs: 0,
    totalPOs: 0,
    totalSRs: 0,
    pendingSRs: 0,
    totalCRs: 0,
    pendingCRs: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [pricingTrends, setPricingTrends] = useState([])
  const [topItems, setTopItems] = useState([])
  const [selectedItem, setSelectedItem] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchPricingTrends()
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(media.matches)
    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    fetchPricingTrends()
  }, [selectedItem, selectedYear])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data
      const [prs, pos, srs, crs] = await Promise.all([
        purchaseRequestService.getAll('all'),
        purchaseOrderService.getAll(),
        serviceRequestService.getAll(),
        cashRequestService.getAll()
      ])

      // Store full data for tabs
      setPurchaseRequests(prs)
      setPurchaseOrders(pos)

      // Calculate stats
      const pendingPRs = prs.filter(pr => pr.status === 'Pending' || pr.status === 'For Approval').length
      const approvedPRs = prs.filter(pr => pr.status === 'Approved' || pr.status === 'PO Created' || pr.status === 'For Purchase').length
      const pendingSRs = srs.filter(sr => sr.status === 'For Procurement Review').length
      const pendingCRs = crs.filter(cr => cr.status === 'Pending' || cr.status === 'For Admin Approval').length

      setStats({
        totalPRs: prs.length,
        pendingPRs,
        approvedPRs,
        totalPOs: pos.length,
        totalSRs: srs.length,
        pendingSRs,
        totalCRs: crs.length,
        pendingCRs
      })

      // Create recent activity list (combine and sort by date)
      const activity = [
        ...prs.slice(0, 5).map(pr => ({
          type: 'PR',
          number: pr.pr_number,
          status: pr.status,
          date: pr.created_at,
          description: `Purchase Request ${pr.pr_number} - ${pr.status}`
        })),
        ...pos.slice(0, 5).map(po => ({
          type: 'PO',
          number: po.po_number,
          status: po.status,
          date: po.created_at,
          description: `Purchase Order ${po.po_number} created`
        })),
        ...srs.slice(0, 5).map(sr => ({
          type: 'SR',
          number: sr.sr_number,
          status: sr.status,
          date: sr.created_at,
          description: `Service Request ${sr.sr_number} - ${sr.status}`
        })),
        ...crs.slice(0, 5).map(cr => ({
          type: 'CR',
          number: cr.cr_number,
          status: cr.status,
          date: cr.created_at,
          description: `Cash Request ${cr.cr_number} - ${cr.status}`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

      setRecentActivity(activity)
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPricingTrends = async () => {
    try {
      const response = await pricingHistoryService.getMonthlyTrends(
        selectedItem || undefined, 
        12, 
        selectedYear || undefined
      )
      setPricingTrends(response.trends || [])
      if (response.topItems && response.topItems.length > 0 && !selectedItem) {
        setTopItems(response.topItems)
      }
      if (response.availableYears) {
        setAvailableYears(response.availableYears)
      }
    } catch (err) {
      console.error('Failed to fetch pricing trends', err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'For Approval': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'For Procurement Review': 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of procurement activities</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('purchase-requests')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'purchase-requests'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Purchase Requests</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {purchaseRequests.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('purchase-orders')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'purchase-orders'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Purchase Orders</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                {purchaseOrders.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Purchase Requests"
          value={stats.totalPRs}
          icon={FileText}
          color="bg-blue-500"
          subtitle={`${stats.pendingPRs} pending approval`}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingPRs + stats.pendingSRs}
          icon={Clock}
          color="bg-yellow-500"
          subtitle={`${stats.pendingPRs} PRs, ${stats.pendingSRs} SRs`}
        />
        <StatCard
          title="Approved Requests"
          value={stats.approvedPRs}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Purchase Orders"
          value={stats.totalPOs}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
        <StatCard
          title="Service Requests"
          value={stats.totalSRs}
          icon={AlertCircle}
          color="bg-orange-500"
          subtitle={`${stats.pendingSRs} pending review`}
        />
        <StatCard
          title="Cash Requests"
          value={stats.totalCRs}
          icon={CreditCard}
          color="bg-teal-500"
          subtitle={`${stats.pendingCRs} pending approval`}
        />
      </div>

      {/* Pricing Trends Chart */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Item Pricing Trends</h3>
            <p className="text-xs text-gray-500">
              {selectedYear ? `Monthly average pricing for ${selectedYear}` : 'Monthly average pricing over the last 12 months'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Last 12 Months</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Items (Combined)</option>
              {topItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.item_code} - {item.item_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {pricingTrends.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
              <LineChart data={pricingTrends} margin={isMobile ? { top: 8, right: 8, left: 0, bottom: 8 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month_label" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  stroke="#9ca3af"
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  tickMargin={isMobile ? 6 : 8}
                />
                <YAxis 
                  width={isMobile ? 40 : 60}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip 
                  formatter={(value, name) => [`₱${parseFloat(value).toFixed(2)}`, name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend wrapperStyle={isMobile ? { fontSize: 10 } : undefined} />
                <Line 
                  type="monotone" 
                  dataKey="avg_price" 
                  name="Average Price" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: isMobile ? 3 : 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="min_price" 
                  name="Min Price" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="max_price" 
                  name="Max Price" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No pricing data available</p>
              <p className="text-xs text-gray-400 mt-1">Add pricing history records to see trends</p>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.type === 'PR' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'PO' ? 'bg-purple-100 text-purple-700' :
                    item.type === 'CR' ? 'bg-teal-100 text-teal-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {item.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.number}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.date)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </div>
      </Card>
      </>)}

      {/* Purchase Requests Tab */}
      {activeTab === 'purchase-requests' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">All Purchase Requests</h3>
            <span className="text-sm text-gray-500">{purchaseRequests.length} total</span>
          </div>

          {/* Mobile list */}
          <div className="space-y-3 md:hidden">
            {purchaseRequests.length > 0 ? (
              purchaseRequests.map((pr) => (
                <div key={pr.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{pr.pr_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pr.project || '-'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(pr.status)}`}>
                      {pr.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <InfoRow label="Purpose" value={pr.purpose || '-'} />
                    <InfoRow label="Amount" value={formatCurrency(pr.total_amount)} />
                    <InfoRow label="Date" value={formatDate(pr.created_at)} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No purchase requests found</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.length > 0 ? (
                  purchaseRequests.map((pr) => (
                    <tr key={pr.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{pr.pr_number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{pr.project || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{pr.purpose || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(pr.total_amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(pr.status)}`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatDate(pr.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No purchase requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase-orders' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">All Purchase Orders</h3>
            <span className="text-sm text-gray-500">{purchaseOrders.length} total</span>
          </div>

          {/* Mobile list */}
          <div className="space-y-3 md:hidden">
            {purchaseOrders.length > 0 ? (
              purchaseOrders.map((po) => (
                <div key={po.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{po.po_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PR: {po.pr_number || '-'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(po.status)}`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <InfoRow label="Supplier" value={po.supplier_name || '-'} />
                    <InfoRow label="Total" value={formatCurrency(po.total_amount)} />
                    <InfoRow label="Date" value={formatDate(po.created_at)} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No purchase orders found</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">PR Number</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length > 0 ? (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{po.po_number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{po.pr_number || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{po.supplier_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(po.total_amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatDate(po.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No purchase orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
