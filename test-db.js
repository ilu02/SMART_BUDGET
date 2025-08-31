import { prisma } from './lib/database.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist by counting users
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible. Current user count: ${userCount}`);
    
    // Test if transactions table exists
    const transactionCount = await prisma.transaction.count();
    console.log(`✅ Transactions table accessible. Current transaction count: ${transactionCount}`);
    
    // Test if budgets table exists
    const budgetCount = await prisma.budget.count();
    console.log(`✅ Budgets table accessible. Current budget count: ${budgetCount}`);
    
    console.log('\n🎉 Database is fully operational!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();