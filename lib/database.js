// lib/database.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Demo account credentials
export const DEMO_CREDENTIALS = {
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User'
};

// Demo data for the demo account
export const DEMO_TRANSACTIONS = [
    {
        amount: 3200,
        description: 'Monthly Salary',
        category: 'Salary',
        type: 'income',
        date: new Date('2024-08-01')
    },
    {
        amount: 1200,
        description: 'Freelance Project',
        category: 'Freelance',
        type: 'income',
        date: new Date('2024-08-15')
    },
    {
    amount: 850,
        description: 'Rent Payment',
        category: 'Housing',
        type: 'expense',
        date: new Date('2024-08-01')
    },
    {
        amount: 320,
        description: 'Grocery Shopping',
        category: 'Food & Dining',
        type: 'expense',
        date: new Date('2024-08-05')
    },
    {
        amount: 45,
        description: 'Gas Station',
        category: 'Transportation',
        type: 'expense',
        date: new Date('2024-08-10')
    },
    {
        amount: 89,
        description: 'Movie Night',
        category: 'Entertainment',
        type: 'expense',
        date: new Date('2024-08-12')
    },
    {
        amount: 156,
        description: 'Online Shopping',
        category: 'Shopping',
        type: 'expense',
        date: new Date('2024-08-18')
    },
    {
        amount: 75,
        description: 'Gym Membership',
        category: 'Health & Fitness',
        type: 'expense',
        date: new Date('2024-08-20')
    }
];

export const DEMO_BUDGETS = [
    {
        category: 'Food & Dining',
        budget: 800,
        spent: 567,
        icon: 'ri-restaurant-line',
        color: 'bg-blue-500',
        description: 'Restaurants, groceries, and food delivery'
    },
    {
        category: 'Transportation',
        budget: 400,
        spent: 285,
        icon: 'ri-gas-station-line',
        color: 'bg-teal-500',
        description: 'Gas, public transport, and ride-sharing'
    },
    {
        category: 'Entertainment',
        budget: 200,
        spent: 178,
        icon: 'ri-film-line',
        color: 'bg-pink-500',
        description: 'Movies, games, and leisure activities'
    },
    {
        category: 'Shopping',
        budget: 600,
        spent: 432,
        icon: 'ri-shopping-bag-line',
        color: 'bg-red-500',
        description: 'Clothes, electronics, and general shopping'
    },
    {
        category: 'Health & Fitness',
        budget: 150,
        spent: 99,
        icon: 'ri-heart-pulse-line',
        color: 'bg-orange-500',
        description: 'Gym, supplements, and medical expenses'
    },
    {
        category: 'Utilities',
        budget: 250,
        spent: 234,
        icon: 'ri-flashlight-line',
        color: 'bg-yellow-500',
        description: 'Electricity, water, internet, and phone'
    },
    {
        category: 'Education',
        budget: 300,
        spent: 165,
        icon: 'ri-book-line',
        color: 'bg-indigo-500',
        description: 'Courses, books, and learning materials'
    },
    {
        category: 'Travel',
        budget: 500,
        spent: 0,
        icon: 'ri-plane-line',
        color: 'bg-purple-500',
        description: 'Flights, hotels, and vacation expenses'
    }
];

// NEW FUNCTION: Get user settings for notifications and currency
export async function getUserSettings(userId) {
    // In a real application, this would fetch from a dedicated settings table.
    // Since you don't have one, we will use a fallback, or you can check a user profile field.
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                // Assuming you might add these fields to the user model later
                currencySymbol: true, 
                largeTransactionThreshold: true
            }
        });

        // Use sensible defaults if the fields aren't on the User model yet
        return {
            currencySymbol: user?.currencySymbol || 'R', // Replace 'R' with your default
            largeTransactionThreshold: user?.largeTransactionThreshold || 1000, 
            budgetThreshold: 0.85 // 85%
        };
    } catch (error) {
        console.error('Error getting user settings:', error);
        // Fallback for demo/error
        return {
            currencySymbol: 'R',
            largeTransactionThreshold: 1000,
            budgetThreshold: 0.85 
        };
    }
}


// Create or get the demo user
export async function createOrGetDemoUser() {
    try {
        // Check if demo user already exists
        let demoUser = await prisma.user.findUnique({
            where: { email: DEMO_CREDENTIALS.email }
        });

        if (!demoUser) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(DEMO_CREDENTIALS.password, 12);

            // Create the demo user
            demoUser = await prisma.user.create({
                data: {
                    email: DEMO_CREDENTIALS.email,
                    password: hashedPassword,
                    name: DEMO_CREDENTIALS.name,
                    isDemo: true
                }
            });

            console.log('Demo user created successfully');
        }

        return demoUser;
    } catch (error) {
        console.error('Error creating demo user:', error);
        throw error;
    }
}

// Seed demo data for the demo user
export async function seedDemoData() {
    try {
        const demoUser = await createOrGetDemoUser();

        // Check if demo data already exists
        const existingTransactions = await prisma.transaction.count({
            where: { userId: demoUser.id }
        });

        const existingBudgets = await prisma.budget.count({
            where: { userId: demoUser.id }
        });

        // Only seed if no data exists
        if (existingTransactions === 0) {
            await prisma.transaction.createMany({
                data: DEMO_TRANSACTIONS.map(transaction => ({
                    ...transaction,
                    userId: demoUser.id
                }))
            });
            console.log('Demo transactions seeded successfully');
        }

        if (existingBudgets === 0) {
            await prisma.budget.createMany({
                data: DEMO_BUDGETS.map(budget => ({
                    ...budget,
                    userId: demoUser.id
                }))
            });
            console.log('Demo budgets seeded successfully');
        }

        return demoUser;
    } catch (error) {
        console.error('Error seeding demo data:', error);
        throw error;
    }
}

// Reset demo data (useful for testing)
export async function resetDemoData() {
    try {
        const demoUser = await prisma.user.findUnique({
            where: { email: DEMO_CREDENTIALS.email }
        });

        if (demoUser) {
            // Delete existing demo data
            await prisma.transaction.deleteMany({
                where: { userId: demoUser.id }
            });

            await prisma.budget.deleteMany({
                where: { userId: demoUser.id }
            });

            // Re-seed demo data
            await seedDemoData();
            console.log('Demo data reset successfully');
        }
    } catch (error) {
        console.error('Error resetting demo data:', error);
        throw error;
    }
}

// Authenticate user
export async function authenticateUser(email, password) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

// Create a new user
export async function createUser(email, password, name) {
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                isDemo: false
            }
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Get user by ID
export async function getUserById(id) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                isDemo: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return user;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        throw error;
    }
}

// Get user transactions
export async function getUserTransactions(userId, budgetId = null) {
    try {
        const whereClause = { userId };
        
        // If budgetId is provided, filter by budget
        if (budgetId) {
            whereClause.budgetId = budgetId;
        }
        
        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                budget: {
                    select: {
                        id: true,
                        category: true,
                        icon: true,
                        color: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        return transactions;
    } catch (error) {
        console.error('Error getting user transactions:', error);
        throw error;
    }
}

// Get user budgets with calculated spent amounts
export async function getUserBudgets(userId) {
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId },
            include: {
                transactions: {
                    where: {
                        type: 'expense'
                    }
                }
            },
            orderBy: { category: 'asc' }
        });

    // Calculate spent amount for each budget from related transactions
    const budgetsWithSpent = budgets.map((budget) => {
      const spent = budget.transactions.reduce((sum, transaction) => {
        return sum + Math.abs(transaction.amount);
      }, 0);

      return {
        ...budget,
        spent,
        transactionCount: budget.transactions.length,
        // Remove transactions from the response to keep it clean
        transactions: undefined
      };
    });

        return budgetsWithSpent;
    } catch (error) {
        console.error('Error getting user budgets:', error);
        throw error;
    }
}

// Get a specific budget with its transactions
export async function getBudgetWithTransactions(userId, budgetId) {
    try {
        const budget = await prisma.budget.findFirst({
            where: { 
                id: budgetId,
                userId 
            },
            include: {
                transactions: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!budget) {
            return null;
        }

        // Calculate spent amount
        const spent = budget.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        return {
            ...budget,
            spent,
            transactionCount: budget.transactions.length
        };
    } catch (error) {
        console.error('Error getting budget with transactions:', error);
        throw error;
    }
}

// Add transaction
export async function addTransaction(userId, transactionData) {
    try {
        // Extract only the fields that exist in the database schema
        const { description, category, amount, date, type, budgetId } = transactionData;
        
        // Find budget by category if budgetId is not provided but category matches
        let finalBudgetId = budgetId;
        if (!finalBudgetId && type === 'expense') {
            const budget = await prisma.budget.findFirst({
                where: {
                    userId,
                    category
                }
            });
            finalBudgetId = budget?.id;
        }
        
        const transaction = await prisma.transaction.create({
            data: {
                description,
                category,
                amount,
                type,
                date: new Date(date),
                userId,
                budgetId: finalBudgetId
            }
        });

        let updatedBudget = null;

        // Update budget spent amount if this is an expense with a budget
        if (type === 'expense' && finalBudgetId) {
            // Get the updated budget object back
            updatedBudget = await updateBudgetSpent(finalBudgetId);
        }

        // MODIFIED RETURN: Return transaction, merchant (for large transaction alert), and the updated budget (for budget alert)
        return { 
            ...transaction,
            merchant: description, // Use description as merchant for the alert
            updatedBudget // Will be null if no budget was affected/found
        };
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
}

// Add budget
export async function addBudget(userId, budgetData) {
    try {
        const budget = await prisma.budget.create({
            data: {
                ...budgetData,
                userId
            }
        });

        return budget;
    } catch (error) {
        console.error('Error adding budget:', error);
        throw error;
    }
}

// Update budget
export async function updateBudget(budgetId, budgetData) {
    try {
        const budget = await prisma.budget.update({
            where: { id: budgetId },
            data: budgetData
        });

        return budget;
    } catch (error) {
        console.error('Error updating budget:', error);
        throw error;
    }
}

// Update transaction
export async function updateTransaction(transactionId, transactionData) {
    try {
        // Get the original transaction to check if budget changed
        const originalTransaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: transactionData
        });

        // Update budget spent amounts for affected budgets
        if (originalTransaction?.budgetId && originalTransaction.type === 'expense') {
            await updateBudgetSpent(originalTransaction.budgetId);
        }
        
        if (transaction.budgetId && transaction.type === 'expense' && 
            transaction.budgetId !== originalTransaction?.budgetId) {
            await updateBudgetSpent(transaction.budgetId);
        }

        return transaction;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
}

// Delete transaction
export async function deleteTransaction(transactionId) {
    try {
        // Get the transaction before deleting to update budget
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        await prisma.transaction.delete({
            where: { id: transactionId }
        });

        // Update budget spent amount if this was an expense with a budget
        if (transaction?.budgetId && transaction.type === 'expense') {
            await updateBudgetSpent(transaction.budgetId);
        }

        return true;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

// Delete budget
export async function deleteBudget(budgetId) {
    try {
        await prisma.budget.delete({
            where: { id: budgetId }
        });

        return true;
    } catch (error) {
        console.error('Error deleting budget:', error);
        throw error;
    }
}

// Update budget spent amount
export async function updateBudgetSpent(budgetId) {
    try {
        // Calculate total spent for this budget from transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                budgetId: budgetId,
                type: 'expense'
            }
        });

        const totalSpent = transactions.reduce((sum, transaction) => {
            return sum + Math.abs(transaction.amount);
        }, 0);

        // Update the budget with the calculated spent amount
        const budget = await prisma.budget.update({
            where: { id: budgetId },
            data: { spent: totalSpent }
        });

        return budget;
    } catch (error) {
        console.error('Error updating budget spent:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(userId, profileData) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: profileData.name,
                email: profileData.email,
                avatar: profileData.avatar,
            }
        });

        return user;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}