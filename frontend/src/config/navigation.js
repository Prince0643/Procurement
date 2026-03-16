import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Package,
  DollarSign,
  Receipt,
  ShoppingCart,
  History,
  Plus,
  Settings,
  UserCheck,
  CheckCircle,
  Gavel
} from 'lucide-react';

// Navigation configuration - centralized for easy management
export const navigationItems = [
  // Dashboard
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['engineer', 'procurement', 'admin', 'super_admin']
  },
  
  // Purchase Requests
  {
    path: '/dashboard/purchase-requests',
    label: 'Purchase Requests',
    icon: FileText,
    roles: ['engineer', 'procurement', 'admin']
  },
  
  // Service Requests
  {
    path: '/dashboard/service-requests',
    label: 'Service Requests',
    icon: ClipboardCheck,
    roles: ['engineer', 'procurement', 'admin']
  },
  
  // Approvals - for super admin
  {
    path: '/dashboard/approvals',
    label: 'Approvals',
    icon: Gavel,
    roles: ['super_admin']
  },
  
  // Items
  {
    path: '/dashboard/items',
    label: 'Items',
    icon: Package,
    roles: ['engineer', 'procurement', 'admin', 'super_admin']
  },
  {
    path: '/dashboard/pricing-history',
    label: 'Pricing History',
    icon: History,
    roles: ['procurement', 'admin', 'super_admin']
  },
  
  // Purchase Orders
  {
    path: '/dashboard/purchase-orders',
    label: 'Purchase Orders',
    icon: ShoppingCart,
    roles: ['admin']
  },
  
  // Payment Requests
  {
    path: '/dashboard/payment-requests',
    label: 'Payment Requests',
    icon: Receipt,
    roles: ['admin', 'super_admin']
  },
  
  // Payment Orders
  {
    path: '/dashboard/payment-orders',
    label: 'Payment Orders',
    icon: DollarSign,
    roles: ['admin', 'super_admin']
  },
  
  // Disbursement Vouchers
  {
    path: '/dashboard/disbursement-vouchers',
    label: 'Disbursement Vouchers',
    icon: FileText,
    roles: ['admin', 'super_admin']
  },
  
  // Order Numbers
  {
    path: '/dashboard/order-numbers',
    label: 'Order Numbers',
    icon: Receipt,
    roles: ['admin', 'super_admin']
  },
  
  // Cash Requests
  {
    path: '/dashboard/cash-requests',
    label: 'Cash Requests',
    icon: DollarSign,
    roles: ['engineer', 'procurement', 'admin', 'super_admin']
  },
  
  // Reimbursements
  {
    path: '/dashboard/reimbursements',
    label: 'Reimbursements',
    icon: Receipt,
    roles: ['engineer', 'procurement', 'admin', 'super_admin']
  },
  
  // Settings
  {
    path: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['engineer', 'procurement', 'admin', 'super_admin']
  },
  
  // Attendance
  {
    path: '/dashboard/attendance',
    label: 'Attendance',
    icon: UserCheck,
    roles: ['engineer', 'procurement', 'admin', 'super_admin'],
    externalUrl: 'https://jajr.xandree.com/'
  }
];

// Group navigation items by category
export const navigationGroups = [
  {
    title: null,
    items: ['/dashboard', '/dashboard/purchase-requests', '/dashboard/service-requests']
  },
  {
    title: 'Orders & Vouchers',
    items: ['/dashboard/purchase-orders', '/dashboard/payment-requests', '/dashboard/payment-orders', '/dashboard/disbursement-vouchers', '/dashboard/order-numbers']
  },
  {
    title: 'Items',
    items: ['/dashboard/items', '/dashboard/pricing-history']
  },
  {
    title: 'Finance',
    items: ['/dashboard/cash-requests', '/dashboard/reimbursements']
  },
  {
    title: 'Administration',
    items: ['/dashboard/approvals', '/dashboard/settings', '/dashboard/attendance']
  }
];

// Filter navigation items by user role
export const filterNavigationByRole = (items, userRole) => {
  return items.filter(item => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(userRole);
  });
};

// Get navigation item by path
export const getNavigationItemByPath = (path) => {
  return navigationItems.find(item => item.path === path);
};
