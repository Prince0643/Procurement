// Mock users for authentication
const MOCK_USERS = [
  { id: 1, employee_no: 'ENG001', first_name: 'John', last_name: 'Doe', role: 'engineer', password: 'password123' },
  { id: 2, employee_no: 'ADM001', first_name: 'Jane', last_name: 'Smith', role: 'admin', password: 'password123' },
  { id: 3, employee_no: 'SAD001', first_name: 'Super', last_name: 'Admin', role: 'super_admin', password: 'password123' },
];

export const authService = {
  login: async (employee_no, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(u => u.employee_no === employee_no && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return { 
      token: mockToken,
      user: userWithoutPassword,
      message: 'Login successful'
    };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getMe: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return { user };
  }
};
