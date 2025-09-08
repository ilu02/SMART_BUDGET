// Test script to verify demo mode functionality
const { mockUser, mockTransactions, mockBudgets, isDemoMode, getDemoData } = require('../lib/mockData.js');

console.log('=== Demo Mode Test ===');
console.log('Current environment variable:', process.env.NEXT_PUBLIC_USE_DEMO_DATA);
console.log('isDemoMode():', isDemoMode());

const demoData = getDemoData();
console.log('\nDemo data results:');
console.log('- User:', demoData.user ? 'Present' : 'Empty');
console.log('- Transactions:', demoData.transactions.length, 'items');
console.log('- Budgets:', demoData.budgets.length, 'items');

if (isDemoMode()) {
  console.log('\n✅ Demo mode is ENABLED - Sample data will be loaded');
  console.log('- Sample user:', mockUser.name, '(' + mockUser.email + ')');
  console.log('- Sample transactions:', mockTransactions.length);
  console.log('- Sample budgets:', mockBudgets.length);
} else {
  console.log('\n✅ Demo mode is DISABLED - App will start with empty data');
  console.log('- No sample data will be loaded');
  console.log('- Users will start with empty transactions and budgets');
}

console.log('\n=== Test Complete ===');