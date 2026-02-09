// Mock suppliers data
const MOCK_SUPPLIERS = [
  { id: 1, supplier_code: 'SUP001', supplier_name: 'TechCorp Solutions', contact_person: 'John Smith', email: 'john@techcorp.com', phone: '+1234567890', address: '123 Tech Street, NY', status: 'Active' },
  { id: 2, supplier_code: 'SUP002', supplier_name: 'Office Supplies Inc', contact_person: 'Jane Doe', email: 'jane@officesupplies.com', phone: '+0987654321', address: '456 Office Ave, CA', status: 'Active' },
  { id: 3, supplier_code: 'SUP003', supplier_name: 'Furniture Max', contact_person: 'Bob Wilson', email: 'bob@furnituremax.com', phone: '+1122334455', address: '789 Furniture Blvd, TX', status: 'Active' },
];

let suppliers = [...MOCK_SUPPLIERS];

export const supplierService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return suppliers;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return suppliers.find(s => s.id === id);
  },

  create: async (supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newSupplier = {
      id: Math.max(...suppliers.map(s => s.id), 0) + 1,
      ...supplierData,
      status: 'Active'
    };
    suppliers.push(newSupplier);
    return { supplier: newSupplier, message: 'Supplier created successfully' };
  },

  update: async (id, supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    suppliers[index] = { ...suppliers[index], ...supplierData };
    return { supplier: suppliers[index], message: 'Supplier updated successfully' };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    suppliers.splice(index, 1);
    return { message: 'Supplier deleted successfully' };
  }
};
