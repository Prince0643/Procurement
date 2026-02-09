// Mock purchase requests data
const MOCK_PURCHASE_REQUESTS = [
  { id: 1, pr_number: 'PR-2024-001', requested_by: 'Engineer 1', purpose: 'New laptop for development', remarks: 'Urgent need', status: 'Approved', approved_by: 'Super Admin', approved_at: '2024-01-15', rejection_reason: null, created_at: '2024-01-10' },
  { id: 2, pr_number: 'PR-2024-002', requested_by: 'Engineer 2', purpose: 'Office supplies replenishment', remarks: 'Monthly restock', status: 'Pending', approved_by: null, approved_at: null, rejection_reason: null, created_at: '2024-01-16' },
  { id: 3, pr_number: 'PR-2024-003', requested_by: 'Engineer 1', purpose: 'New chairs for conference room', remarks: 'For 10 people', status: 'For Purchase', approved_by: 'Super Admin', approved_at: '2024-01-12', rejection_reason: null, created_at: '2024-01-08' },
  { id: 4, pr_number: 'PR-2024-004', requested_by: 'Engineer 3', purpose: 'Printer maintenance kit', remarks: 'Annual maintenance', status: 'Rejected', approved_by: 'Super Admin', approved_at: null, rejection_reason: 'Budget exceeded for this quarter', created_at: '2024-01-14' },
  { id: 5, pr_number: 'PR-2024-005', requested_by: 'Engineer 2', purpose: 'Wireless keyboards', remarks: 'For new hires', status: 'Completed', approved_by: 'Super Admin', approved_at: '2024-01-05', rejection_reason: null, created_at: '2024-01-01' },
];

let purchaseRequests = [...MOCK_PURCHASE_REQUESTS];
let nextId = 6;

export const purchaseRequestService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return purchaseRequests;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return purchaseRequests.find(pr => pr.id === id);
  },

  create: async (prData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPR = {
      id: nextId++,
      pr_number: `PR-2024-${String(nextId).padStart(3, '0')}`,
      requested_by: 'Engineer 1',
      purpose: prData.purpose,
      remarks: prData.remarks || '',
      status: 'Pending',
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      created_at: new Date().toISOString().split('T')[0]
    };
    purchaseRequests.push(newPR);
    return { purchaseRequest: newPR, message: 'Purchase request created successfully' };
  },

  approve: async (id, status, remarks) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = purchaseRequests.findIndex(pr => pr.id === id);
    if (index === -1) throw new Error('Purchase request not found');
    
    purchaseRequests[index] = {
      ...purchaseRequests[index],
      status,
      approved_by: status === 'Approved' ? 'Super Admin' : null,
      approved_at: status === 'Approved' ? new Date().toISOString().split('T')[0] : null,
      rejection_reason: status === 'Rejected' ? remarks : null
    };
    
    return { purchaseRequest: purchaseRequests[index], message: `Purchase request ${status.toLowerCase()} successfully` };
  }
};
