import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  FileText, Search, ChevronDown, ChevronUp, Building2, 
  ShoppingCart, Wrench, Banknote, Receipt, ArrowLeft,
  Calendar, MapPin, User, DollarSign, Filter
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'https://procurement-api.xandree.com/api';

const COLORS = {
  'Purchase Requests': '#3B82F6', // blue-500
  'Service Requests': '#10B981', // emerald-500
  'Cash Requests': '#F59E0B', // amber-500
  'Reimbursements': '#EF4444' // red-500
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600'
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

const OrderNumbers = () => {
  const navigate = useNavigate();
  const [orderNumbers, setOrderNumbers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    purchaseRequests: true,
    serviceRequests: false,
    cashRequests: false,
    reimbursements: false
  });

  useEffect(() => {
    fetchOrderNumbers();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchDashboardData(selectedOrder.order_number, selectedProject);
    }
  }, [selectedOrder, selectedProject]);

  const fetchOrderNumbers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/order-numbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderNumbers(response.data);
    } catch (error) {
      console.error('Failed to fetch order numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (orderNumber, project) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = project && project !== 'all' ? `?project=${encodeURIComponent(project)}` : '';
      const response = await axios.get(`${API_BASE_URL}/order-numbers/dashboard/${orderNumber}${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = orderNumbers.filter(o => 
    o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.project?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary Cards Component
  const SummaryCards = () => {
    if (!dashboardData) return null;
    const { summary } = dashboardData;

    const cards = [
      { 
        title: 'Total Actual Cost', 
        value: summary.totalActualCost, 
        icon: DollarSign, 
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
      },
      { 
        title: 'Purchase Requests', 
        value: summary.purchaseRequests.total, 
        count: summary.purchaseRequests.count,
        icon: ShoppingCart, 
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
      },
      { 
        title: 'Service Requests', 
        value: summary.serviceRequests.total, 
        count: summary.serviceRequests.count,
        icon: Wrench, 
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600'
      },
      { 
        title: 'Cash Requests', 
        value: summary.cashRequests.total, 
        count: summary.cashRequests.count,
        icon: Banknote, 
        color: 'bg-amber-500',
        textColor: 'text-amber-600'
      },
      { 
        title: 'Reimbursements', 
        value: summary.reimbursements.total, 
        count: summary.reimbursements.count,
        icon: Receipt, 
        color: 'bg-red-500',
        textColor: 'text-red-600'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map((card, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className={`text-xl font-bold ${card.textColor}`}>
                  {formatCurrency(card.value)}
                </p>
                {card.count !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">{card.count} request(s)</p>
                )}
              </div>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Pie Chart Component
  const CostDistributionChart = () => {
    if (!dashboardData?.pieChartData?.length) return null;

    const data = dashboardData.pieChartData.filter(item => item.value > 0);
    if (data.length === 0) {
      return (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            No cost data available
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.name] }}
              />
              <span className="text-gray-600">{item.name}:</span>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Request Table Component
  const RequestTable = ({ data, type, columns }) => {
    if (!data?.length) return null;

    const icons = {
      purchaseRequests: ShoppingCart,
      serviceRequests: Wrench,
      cashRequests: Banknote,
      reimbursements: Receipt
    };
    const Icon = icons[type];
    const isExpanded = expandedSections[type];

    return (
      <Card className="mb-4">
        <button 
          onClick={() => toggleSection(type)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: COLORS[type.replace(/([A-Z])/g, ' $1').trim()] }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
              </h3>
              <p className="text-sm text-gray-500">{data.length} item(s)</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 text-sm">
                        {col.format ? col.format(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  };

  // Dashboard View
  if (selectedOrder) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
            <ArrowLeft className="w-5 h-5" />
            Back to Order Numbers
          </Button>
        </div>

        {/* Order Info Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedOrder.order_number}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {selectedOrder.project || 'No Project'}
                </span>
                {selectedOrder.project_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedOrder.project_address}
                  </span>
                )}
              </div>
            </div>
            
            {/* Project Filter */}
            {dashboardData?.projects?.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All Projects</option>
                  {dashboardData.projects.map((proj, idx) => (
                    <option key={idx} value={proj.project}>
                      {proj.project}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Summary Cards */}
            <SummaryCards />

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <CostDistributionChart />
              </div>
              <div className="lg:col-span-2">
                <Card className="p-6 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Type</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.pieChartData.filter(d => d.value > 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(val) => `₱${(val/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {dashboardData.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Breakdown</h2>
              
              <RequestTable 
                type="purchaseRequests"
                data={dashboardData.details.purchaseRequests}
                columns={[
                  { header: 'PR Number', key: 'pr_number' },
                  { header: 'Purpose', key: 'purpose' },
                  { header: 'Project', key: 'project' },
                  { header: 'Amount', key: 'total_amount', format: (v) => formatCurrency(v) },
                  { header: 'Status', key: 'status' },
                  { header: 'Created', key: 'created_at', format: (v) => formatDate(v) }
                ]}
              />

              <RequestTable 
                type="serviceRequests"
                data={dashboardData.details.serviceRequests}
                columns={[
                  { header: 'SR Number', key: 'sr_number' },
                  { header: 'Purpose', key: 'purpose' },
                  { header: 'Service Type', key: 'service_type' },
                  { header: 'Project', key: 'project' },
                  { header: 'Amount', key: 'amount', format: (v) => formatCurrency(v) },
                  { header: 'Status', key: 'status' },
                  { header: 'Created', key: 'created_at', format: (v) => formatDate(v) }
                ]}
              />

              <RequestTable 
                type="cashRequests"
                data={dashboardData.details.cashRequests}
                columns={[
                  { header: 'CR Number', key: 'cr_number' },
                  { header: 'Purpose', key: 'purpose' },
                  { header: 'Type', key: 'cr_type' },
                  { header: 'Project', key: 'project' },
                  { header: 'Amount', key: 'amount', format: (v) => formatCurrency(v) },
                  { header: 'Status', key: 'status' },
                  { header: 'Created', key: 'created_at', format: (v) => formatDate(v) }
                ]}
              />

              <RequestTable 
                type="reimbursements"
                data={dashboardData.details.reimbursements}
                columns={[
                  { header: 'RMB Number', key: 'rmb_number' },
                  { header: 'Purpose', key: 'purpose' },
                  { header: 'Payee', key: 'payee' },
                  { header: 'Project', key: 'project' },
                  { header: 'Amount', key: 'amount', format: (v) => formatCurrency(v) },
                  { header: 'Status', key: 'status' },
                  { header: 'Created', key: 'created_at', format: (v) => formatDate(v) }
                ]}
              />
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Order Numbers List View
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Numbers Dashboard</h1>
        <p className="text-gray-500">View cost breakdown and analysis by order number</p>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search order numbers or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </Card>

      {/* Order Numbers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order, index) => (
            <Card 
              key={index} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  View Dashboard
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{order.order_number}</h3>
              <div className="space-y-1">
                {order.project && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {order.project}
                  </p>
                )}
                {order.project_address && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.project_address}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No order numbers found</p>
        </div>
      )}
    </div>
  );
};

export default OrderNumbers;
