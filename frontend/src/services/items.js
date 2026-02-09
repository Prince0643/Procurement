// Mock data for items
const MOCK_ITEMS = [
  { id: 1, item_code: 'ITM001', item_name: 'Laptop Dell XPS 13', description: '13-inch business laptop', category: 'Electronics', category_id: 1, unit: 'pc', status: 'Active' },
  { id: 2, item_code: 'ITM002', item_name: 'Wireless Mouse', description: 'Logitech wireless mouse', category: 'Electronics', category_id: 1, unit: 'pc', status: 'Active' },
  { id: 3, item_code: 'ITM003', item_name: 'A4 Paper (500 sheets)', description: 'Premium quality paper', category: 'Office Supplies', category_id: 2, unit: 'box', status: 'Active' },
  { id: 4, item_code: 'ITM004', item_name: 'Office Chair', description: 'Ergonomic office chair', category: 'Furniture', category_id: 3, unit: 'pc', status: 'Active' },
  { id: 5, item_code: 'ITM005', item_name: 'Printer Ink HP 950', description: 'Black ink cartridge', category: 'Electronics', category_id: 1, unit: 'pc', status: 'Active' },
];

let items = [...MOCK_ITEMS];

export const itemService = {
  getAll: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return items;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return items.find(item => item.id === id);
  },

  create: async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      ...itemData,
      status: 'Active'
    };
    items.push(newItem);
    return { item: newItem, message: 'Item created successfully' };
  },

  update: async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    items[index] = { ...items[index], ...itemData };
    return { item: items[index], message: 'Item updated successfully' };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    items.splice(index, 1);
    return { message: 'Item deleted successfully' };
  }
};
