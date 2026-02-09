// Mock purchase orders data
const MOCK_PURCHASE_ORDERS = [
  { id: 1, po_number: 'PO-2024-001', purchase_request_id: 1, supplier_id: 1, prepared_by: 'Admin', total_amount: 2400, po_date: '2024-01-16', expected_delivery_date: '2024-01-23', actual_delivery_date: '2024-01-20', status: 'Delivered' },
  { id: 2, po_number: 'PO-2024-002', purchase_request_id: 5, supplier_id: 1, prepared_by: 'Admin', total_amount: 125, po_date: '2024-01-06', expected_delivery_date: '2024-01-09', actual_delivery_date: '2024-01-10', status: 'Delivered' },
  { id: 3, po_number: 'PO-2024-003', purchase_request_id: 3, supplier_id: 3, prepared_by: 'Admin', total_amount: 3500, po_date: '2024-01-17', expected_delivery_date: '2024-02-01', actual_delivery_date: null, status: 'Ordered' },
];

let purchaseOrders = [...MOCK_PURCHASE_ORDERS];

export const purchaseOrderService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return purchaseOrders;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return purchaseOrders.find(po => po.id === id);
  },

  create: async (poData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPO = {
      id: Math.max(...purchaseOrders.map(po => po.id), 0) + 1,
      po_number: `PO-2024-${String(new Date().getTime()).slice(-3)}`,
      prepared_by: 'Admin',
      po_date: new Date().toISOString().split('T')[0],
      actual_delivery_date: null,
      status: 'Ordered',
      ...poData
    };
    purchaseOrders.push(newPO);
    return { purchaseOrder: newPO, message: 'Purchase order created successfully' };
  },

  updateStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = purchaseOrders.findIndex(po => po.id === id);
    if (index === -1) throw new Error('Purchase order not found');
    purchaseOrders[index] = { 
      ...purchaseOrders[index], 
      status,
      actual_delivery_date: status === 'Delivered' ? new Date().toISOString().split('T')[0] : purchaseOrders[index].actual_delivery_date
    };
    return { purchaseOrder: purchaseOrders[index], message: 'Status updated successfully' };
  }
};
