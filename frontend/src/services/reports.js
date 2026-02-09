// Mock reports data
const MOCK_DASHBOARD_STATS = {
  total_prs: 15,
  pending_prs: 3,
  approved_prs: 8,
  rejected_prs: 2,
  completed_prs: 2,
  total_items: 25,
  total_suppliers: 5,
  total_spend: 50000
};

const MOCK_MONTHLY_SPENDING = [
  { month: 'Jan', amount: 5000 },
  { month: 'Feb', amount: 7500 },
  { month: 'Mar', amount: 4500 },
  { month: 'Apr', amount: 9000 },
  { month: 'May', amount: 6200 },
  { month: 'Jun', amount: 7800 }
];

const MOCK_SUPPLIER_PERFORMANCE = [
  { supplier_id: 1, supplier_name: 'TechCorp Solutions', total_orders: 10, on_time_delivery: 9, avg_delivery_days: 3.2 },
  { supplier_id: 2, supplier_name: 'Office Supplies Inc', total_orders: 15, on_time_delivery: 14, avg_delivery_days: 2.5 },
  { supplier_id: 3, supplier_name: 'Furniture Max', total_orders: 5, on_time_delivery: 4, avg_delivery_days: 5.1 }
];

const MOCK_PENDING_APPROVALS = {
  pending_count: 3,
  pending_items: [
    { id: 2, pr_number: 'PR-2024-002', requested_by: 'Engineer 2', purpose: 'Office supplies replenishment', total_amount: 150 },
    { id: 4, pr_number: 'PR-2024-004', requested_by: 'Engineer 3', purpose: 'Printer maintenance kit', total_amount: 225 }
  ]
};

export const reportService = {
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DASHBOARD_STATS;
  },

  getMonthlySpending: async (year) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { year: year || 2024, data: MOCK_MONTHLY_SPENDING };
  },

  getSupplierPerformance: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SUPPLIER_PERFORMANCE;
  },

  getPendingApprovals: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PENDING_APPROVALS;
  }
};
