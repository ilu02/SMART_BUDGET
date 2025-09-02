# Smart Budget App

A comprehensive personal finance management application built with Next.js, TypeScript, and PostgreSQL. Track expenses, manage budgets, and gain insights into your spending patterns with beautiful analytics and charts.

## Features

- 📊 **Transaction Management** - Add, edit, and categorize income and expenses
- 💰 **Budget Tracking** - Set budgets by category and monitor spending
- 📈 **Analytics & Charts** - Visualize spending patterns with interactive charts
- 🎯 **Smart Insights** - Get personalized spending insights and alerts
- 🌙 **Dark/Light Mode** - Customizable appearance settings
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **User Authentication** - Secure login and user management
- 🎮 **Demo Mode** - Try the app with sample data

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **Authentication**: Custom implementation with bcryptjs
- **Server**: Express.js

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart_project2
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/smart_budget_db"

# Demo Mode (optional)
NEXT_PUBLIC_USE_DEMO_DATA=true
```

**Database URL Format:**
- Local PostgreSQL: `postgresql://username:password@localhost:5432/database_name`
- Cloud PostgreSQL: Use the connection string provided by your cloud provider

### 4. Database Setup

This project uses PostgreSQL with Prisma ORM for data management. Choose one of the following options:

#### Option A: Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`
   
   ⚠️ **Important**: Remember the admin password you set during installation - you'll need it for the next steps.

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL (you'll be prompted for the password)
   psql -U postgres
   
   # Create database
   CREATE DATABASE smart_budget_db;
   
   # Create user (optional but recommended)
   CREATE USER budget_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE smart_budget_db TO budget_user;
   
   # Exit PostgreSQL
   \q
   ```

3. **Update Environment Variables**:
   Make sure your `.env.local` file has the correct DATABASE_URL:
   ```env
   # Using postgres user (simpler)
   DATABASE_URL="postgresql://postgres:your_admin_password@localhost:5432/smart_budget_db"
   
   # OR using the custom user you created
   DATABASE_URL="postgresql://budget_user:your_secure_password@localhost:5432/smart_budget_db"
   ```

### 5. Database Migration & Setup

Run Prisma migrations to set up the database schema:

```bash
# Install dependencies (if you haven't already)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations to create tables
npx prisma migrate deploy

# (Optional) Seed database with sample data
npx prisma db seed
```

### 6. Verify Database Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and manage your database tables.

### 7. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Demo Mode

The app includes a demo mode with sample data for testing and demonstration purposes.

### Enable Demo Mode

Set in `.env.local`:
```env
NEXT_PUBLIC_USE_DEMO_DATA=true
```

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

### Disable Demo Mode (Production)

Set in `.env.local`:
```env
NEXT_PUBLIC_USE_DEMO_DATA=false
```

Or simply omit the variable. The app will start with empty data.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (⚠️ This will delete all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name
```

## Project Structure

```
smart_project2/
├── app/                    # Next.js app directory
│   ├── analytics/         # Analytics and charts pages
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── budgets/          # Budget management
│   ├── contexts/         # React contexts
│   ├── dashboard/        # Dashboard components
│   ├── settings/         # Settings pages
│   └── transactions/     # Transaction management
├── components/           # Reusable UI components
├── lib/                 # Utility functions and configurations
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── hooks/               # Custom React hooks
```

## Key Features Guide

### 1. Transaction Management
- Add income and expense transactions
- Categorize transactions
- Edit and delete transactions
- Filter and search transactions

### 2. Budget Management
- Create budgets by category
- Set spending limits
- Track budget progress
- Receive spending alerts

### 3. Analytics
- View spending trends over time
- Category-wise expense breakdown
- Income vs expense comparison
- Interactive charts and graphs

### 4. Settings
- Customize appearance (dark/light mode)
- Set currency preferences
- Configure notifications
- Manage profile settings

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in `.env.local`
   - Ensure database exists

2. **Migration Errors**
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   PORT=3001 npm run dev
   ```

4. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing issues in the repository
3. Create a new issue with detailed information

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Recharts](https://recharts.org/) - composable charting library
