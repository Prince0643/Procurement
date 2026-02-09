// Mock categories data
const MOCK_CATEGORIES = [
  { id: 1, category_name: 'Electronics', description: 'Electronic devices and accessories' },
  { id: 2, category_name: 'Office Supplies', description: 'Office stationery and supplies' },
  { id: 3, category_name: 'Furniture', description: 'Office furniture and fixtures' },
];

let categories = [...MOCK_CATEGORIES];

export const categoryService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return categories;
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return categories.find(cat => cat.id === id);
  },

  create: async (categoryData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCategory = {
      id: Math.max(...categories.map(c => c.id), 0) + 1,
      category_name: categoryData.name || categoryData.category_name,
      description: categoryData.description || ''
    };
    categories.push(newCategory);
    return { category: newCategory, message: 'Category created successfully' };
  },

  update: async (id, categoryData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = { ...categories[index], ...categoryData };
    return { category: categories[index], message: 'Category updated successfully' };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) throw new Error('Category not found');
    categories.splice(index, 1);
    return { message: 'Category deleted successfully' };
  }
};
