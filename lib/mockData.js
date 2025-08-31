// Mock data for demo mode
// This file contains all placeholder/dummy data used in the application
// Data is only loaded when USE_DEMO_DATA environment variable is set to 'true'

// Mock user data
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined
};

// Mock transactions data
export const mockTransactions = [
  {
    id: 1,
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    amount: -89.50,
    date: '2024-07-15',
    merchant: 'Whole Foods',
    tags: ['groceries', 'food'],
    type: 'expense',
    icon: 'ri-restaurant-line',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 2,
    description: 'Salary Deposit',
    category: 'Income',
    amount: 5800.00,
    date: '2024-07-15',
    merchant: 'Tech Corp',
    tags: ['salary', 'income'],
    type: 'income',
    icon: 'ri-money-dollar-circle-line',
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 3,
    description: 'Gas Station',
    category: 'Transportation',
    amount: -45.20,
    date: '2024-07-14',
    merchant: 'Shell',
    tags: ['gas', 'transportation'],
    type: 'expense',
    icon: 'ri-gas-station-line',
    color: 'text-teal-600 bg-teal-50'
  },
  {
    id: 4,
    description: 'Netflix Subscription',
    category: 'Entertainment',
    amount: -15.99,
    date: '2024-07-14',
    merchant: 'Netflix',
    tags: ['subscription', 'streaming'],
    type: 'expense',
    icon: 'ri-film-line',
    color: 'text-pink-600 bg-pink-50'
  },
  {
    id: 5,
    description: 'Online Shopping',
    category: 'Shopping',
    amount: -124.99,
    date: '2024-07-13',
    merchant: 'Amazon',
    tags: ['online', 'shopping'],
    type: 'expense',
    icon: 'ri-shopping-bag-line',
    color: 'text-red-600 bg-red-50'
  },
  {
    id: 6,
    description: 'Gym Membership',
    category: 'Health & Fitness',
    amount: -49.99,
    date: '2024-07-12',
    merchant: 'Planet Fitness',
    tags: ['gym', 'fitness'],
    type: 'expense',
    icon: 'ri-heart-pulse-line',
    color: 'text-orange-600 bg-orange-50'
  },
  {
    id: 7,
    description: 'Coffee Shop',
    category: 'Food & Dining',
    amount: -4.50,
    date: '2024-07-12',
    merchant: 'Starbucks',
    tags: ['coffee', 'food'],
    type: 'expense',
    icon: 'ri-cup-line',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 8,
    description: 'Freelance Payment',
    category: 'Income',
    amount: 750.00,
    date: '2024-07-09',
    merchant: 'Client ABC',
    tags: ['freelance', 'income'],
    type: 'income',
    icon: 'ri-money-dollar-circle-line',
    color: 'text-green-600 bg-green-50'
  }
];

// Mock budgets data
export const mockBudgets = [
  {
    id: 1,
    category: 'Food & Dining',
    budget: 800,
    spent: 567,
    icon: 'ri-restaurant-line',
    color: 'bg-blue-500',
    description: 'Restaurants, groceries, and food delivery'
  },
  {
    id: 2,
    category: 'Transportation',
    budget: 400,
    spent: 285,
    icon: 'ri-gas-station-line',
    color: 'bg-teal-500',
    description: 'Gas, public transport, and ride-sharing'
  },
  {
    id: 3,
    category: 'Entertainment',
    budget: 200,
    spent: 178,
    icon: 'ri-film-line',
    color: 'bg-pink-500',
    description: 'Movies, games, and leisure activities'
  },
  {
    id: 4,
    category: 'Shopping',
    budget: 600,
    spent: 432,
    icon: 'ri-shopping-bag-line',
    color: 'bg-red-500',
    description: 'Clothes, electronics, and general shopping'
  },
  {
    id: 5,
    category: 'Health & Fitness',
    budget: 150,
    spent: 99,
    icon: 'ri-heart-pulse-line',
    color: 'bg-orange-500',
    description: 'Gym, supplements, and medical expenses'
  },
  {
    id: 6,
    category: 'Utilities',
    budget: 250,
    spent: 234,
    icon: 'ri-flashlight-line',
    color: 'bg-yellow-500',
    description: 'Electricity, water, internet, and phone'
  },
  {
    id: 7,
    category: 'Education',
    budget: 300,
    spent: 165,
    icon: 'ri-book-line',
    color: 'bg-indigo-500',
    description: 'Courses, books, and learning materials'
  },
  {
    id: 8,
    category: 'Travel',
    budget: 500,
    spent: 0,
    icon: 'ri-plane-line',
    color: 'bg-purple-500',
    description: 'Flights, hotels, and vacation expenses'
  }
];

// Demo mode credentials
export const demoCredentials = {
  email: 'demo@example.com',
  password: 'demo123'
};

// Utility function to check if demo mode is enabled
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';
};

// Utility function to get mock data only if demo mode is enabled
export const getDemoData = () => {
  if (!isDemoMode()) {
    return {
      user: null,
      transactions: [],
      budgets: []
    };
  }

  return {
    user: mockUser,
    transactions: mockTransactions,
    budgets: mockBudgets
  };
};