# Smart Budget App - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    %% User Layer
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    %% Frontend Layer
    subgraph "Frontend Application (Next.js 14)"
        subgraph "Pages & Components"
            Dashboard[Dashboard Page]
            Analytics[Analytics Page]
            Auth[Auth Pages]
            Budgets[Budget Management]
        end
        
        subgraph "State Management"
            AuthCtx[Auth Context]
            TransCtx[Transaction Context]
            BudgetCtx[Budget Context]
            SettingsCtx[Settings Context]
            NotifCtx[Notification Context]
        end
        
        subgraph "UI Components"
            Charts[Recharts Components]
            Forms[Form Components]
            Modals[Modal Components]
            Layout[Layout Components]
        end
    end

    %% Middleware Layer
    subgraph "Middleware & Routing"
        NextMiddleware[Next.js Middleware]
        AuthGuard[Route Protection]
        APIRoutes[API Routes]
    end

    %% Backend Layer
    subgraph "Backend Services"
        subgraph "Express Server"
            CustomServer[Custom Express Server]
            StaticFiles[Static File Serving]
        end
        
        subgraph "API Endpoints"
            AuthAPI[/api/auth/*]
            TransAPI[/api/transactions]
            BudgetAPI[/api/budgets]
            DemoAPI[/api/demo/*]
        end
        
        subgraph "Business Logic"
            AuthService[Authentication Service]
            TransService[Transaction Service]
            BudgetService[Budget Service]
            DemoService[Demo Data Service]
        end
    end

    %% Data Layer
    subgraph "Data Access Layer"
        PrismaORM[Prisma ORM]
        DatabaseLib[Database Library]
        Validation[Data Validation]
    end

    %% Database Layer
    subgraph "PostgreSQL Database"
        UserTable[(Users Table)]
        TransTable[(Transactions Table)]
        BudgetTable[(Budgets Table)]
    end

    %% External Services
    subgraph "External Dependencies"
        BCrypt[bcryptjs - Password Hashing]
        Fonts[Google Fonts]
        Icons[RemixIcon]
    end

    %% Connections
    Browser --> Dashboard
    Mobile --> Dashboard
    
    Dashboard --> AuthCtx
    Analytics --> TransCtx
    Auth --> AuthCtx
    Budgets --> BudgetCtx
    
    AuthCtx --> NextMiddleware
    TransCtx --> APIRoutes
    BudgetCtx --> APIRoutes
    
    NextMiddleware --> AuthGuard
    AuthGuard --> APIRoutes
    
    APIRoutes --> AuthAPI
    APIRoutes --> TransAPI
    APIRoutes --> BudgetAPI
    APIRoutes --> DemoAPI
    
    AuthAPI --> AuthService
    TransAPI --> TransService
    BudgetAPI --> BudgetService
    DemoAPI --> DemoService
    
    AuthService --> PrismaORM
    TransService --> PrismaORM
    BudgetService --> PrismaORM
    DemoService --> PrismaORM
    
    PrismaORM --> UserTable
    PrismaORM --> TransTable
    PrismaORM --> BudgetTable
    
    UserTable -.->|1:N| TransTable
    UserTable -.->|1:N| BudgetTable
    BudgetTable -.->|1:N| TransTable
    
    AuthService --> BCrypt
    Dashboard --> Charts
    Dashboard --> Fonts
    Dashboard --> Icons

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class Dashboard,Analytics,Auth,Budgets,AuthCtx,TransCtx,BudgetCtx,SettingsCtx,NotifCtx,Charts,Forms,Modals,Layout frontend
    class CustomServer,StaticFiles,AuthAPI,TransAPI,BudgetAPI,DemoAPI,AuthService,TransService,BudgetService,DemoService,NextMiddleware,AuthGuard,APIRoutes backend
    class PrismaORM,DatabaseLib,Validation,UserTable,TransTable,BudgetTable database
    class BCrypt,Fonts,Icons external
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant M as Middleware
    participant A as API Routes
    participant S as Services
    participant P as Prisma ORM
    participant D as Database

    Note over U,D: User Authentication Flow
    U->>F: Login Request
    F->>A: POST /api/auth/login
    A->>S: AuthService.authenticate()
    S->>P: prisma.user.findUnique()
    P->>D: SELECT * FROM users WHERE email=?
    D-->>P: User Data
    P-->>S: User Object
    S->>S: bcrypt.compare(password)
    S-->>A: Authentication Result
    A-->>F: JWT Token + User Data
    F->>F: Store in localStorage + cookies
    F-->>U: Redirect to Dashboard

    Note over U,D: Transaction Creation Flow
    U->>F: Add Transaction
    F->>M: Check Authentication
    M->>M: Validate JWT Token
    M-->>F: Authorized
    F->>A: POST /api/transactions
    A->>S: TransactionService.create()
    S->>P: prisma.transaction.create()
    P->>D: INSERT INTO transactions
    D-->>P: Created Transaction
    P-->>S: Transaction Object
    S->>S: Update Budget Spent Amount
    S->>P: prisma.budget.update()
    P->>D: UPDATE budgets SET spent=?
    D-->>P: Updated Budget
    P-->>S: Budget Object
    S-->>A: Success Response
    A-->>F: Transaction + Budget Data
    F->>F: Update Context State
    F-->>U: UI Update + Toast Notification
```

## Component Architecture

```mermaid
graph TD
    subgraph "App Layout Structure"
        RootLayout[Root Layout]
        RootLayout --> AuthProvider[Auth Provider]
        AuthProvider --> SettingsProvider[Settings Provider]
        SettingsProvider --> BudgetProvider[Budget Provider]
        BudgetProvider --> TransactionProvider[Transaction Provider]
        TransactionProvider --> BudgetSync[Budget Transaction Sync]
        BudgetSync --> NotificationProvider[Notification Provider]
        NotificationProvider --> ThemeWrapper[Theme Wrapper]
        ThemeWrapper --> PageContent[Page Content]
    end

    subgraph "Dashboard Components"
        PageContent --> Header[Header Component]
        PageContent --> DashboardOverview[Dashboard Overview]
        PageContent --> RecentTransactions[Recent Transactions]
        PageContent --> QuickActions[Quick Actions]
        PageContent --> AddTransactionModal[Add Transaction Modal]
    end

    subgraph "Analytics Components"
        PageContent --> AnalyticsCharts[Analytics Charts]
        AnalyticsCharts --> PieChart[Category Pie Chart]
        AnalyticsCharts --> BarChart[Trend Bar Chart]
        AnalyticsCharts --> AreaChart[Spending Area Chart]
        AnalyticsCharts --> IncomeExpenseChart[Income vs Expense Chart]
    end

    subgraph "Shared Components"
        Header --> ResponsiveLayout[Responsive Layout]
        DashboardOverview --> Card[Card Component]
        RecentTransactions --> TransactionList[Transaction List]
        QuickActions --> Button[Button Component]
        AddTransactionModal --> Form[Form Component]
    end

    %% Styling
    classDef provider fill:#e3f2fd
    classDef page fill:#f1f8e9
    classDef component fill:#fce4ec
    classDef shared fill:#fff8e1
    
    class AuthProvider,SettingsProvider,BudgetProvider,TransactionProvider,BudgetSync,NotificationProvider provider
    class Header,DashboardOverview,RecentTransactions,QuickActions,AnalyticsCharts page
    class PieChart,BarChart,AreaChart,IncomeExpenseChart,AddTransactionModal component
    class ResponsiveLayout,Card,TransactionList,Button,Form shared
```

## Security Architecture

```mermaid
graph LR
    subgraph "Client Security"
        CSP[Content Security Policy]
        XSS[XSS Protection]
        HTTPS[HTTPS Enforcement]
    end

    subgraph "Authentication Security"
        JWT[JWT Tokens]
        Cookies[Secure Cookies]
        Session[Session Management]
        BCrypt[Password Hashing]
    end

    subgraph "API Security"
        Middleware[Auth Middleware]
        Validation[Input Validation]
        CORS[CORS Policy]
        RateLimit[Rate Limiting]
    end

    subgraph "Database Security"
        Prisma[Prisma ORM Protection]
        Constraints[Foreign Key Constraints]
        Isolation[User Data Isolation]
        Encryption[Data Encryption]
    end

    CSP --> JWT
    XSS --> Cookies
    HTTPS --> Session
    
    JWT --> Middleware
    Cookies --> Validation
    Session --> CORS
    BCrypt --> RateLimit
    
    Middleware --> Prisma
    Validation --> Constraints
    CORS --> Isolation
    RateLimit --> Encryption

    %% Styling
    classDef client fill:#ffebee
    classDef auth fill:#e8f5e8
    classDef api fill:#e3f2fd
    classDef db fill:#fff3e0
    
    class CSP,XSS,HTTPS client
    class JWT,Cookies,Session,BCrypt auth
    class Middleware,Validation,CORS,RateLimit api
    class Prisma,Constraints,Isolation,Encryption db
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DevServer[Next.js Dev Server]
        DevDB[Local PostgreSQL]
        DevEnv[.env.local]
    end

    subgraph "Production Environment"
        subgraph "Application Server"
            ProdServer[Custom Express + Next.js]
            StaticAssets[Static Assets]
            APIEndpoints[API Endpoints]
        end
        
        subgraph "Database Server"
            ProdDB[PostgreSQL Database]
            Migrations[Prisma Migrations]
            Backups[Database Backups]
        end
        
        subgraph "Infrastructure"
            LoadBalancer[Load Balancer]
            CDN[CDN for Static Assets]
            SSL[SSL Certificates]
        end
    end

    subgraph "External Services"
        GoogleFonts[Google Fonts CDN]
        RemixIcons[RemixIcon CDN]
        Monitoring[Application Monitoring]
    end

    DevServer -.->|Deploy| ProdServer
    DevDB -.->|Migrate| ProdDB
    DevEnv -.->|Configure| ProdServer

    LoadBalancer --> ProdServer
    CDN --> StaticAssets
    SSL --> LoadBalancer
    
    ProdServer --> ProdDB
    Migrations --> ProdDB
    
    ProdServer --> GoogleFonts
    ProdServer --> RemixIcons
    ProdServer --> Monitoring

    %% Styling
    classDef dev fill:#e8f5e8
    classDef prod fill:#e3f2fd
    classDef infra fill:#fff3e0
    classDef external fill:#ffebee
    
    class DevServer,DevDB,DevEnv dev
    class ProdServer,StaticAssets,APIEndpoints,ProdDB,Migrations,Backups prod
    class LoadBalancer,CDN,SSL infra
    class GoogleFonts,RemixIcons,Monitoring external
```

## Technology Stack Diagram

```mermaid
graph TD
    subgraph "Frontend Stack"
        React[React 18]
        NextJS[Next.js 14]
        TypeScript[TypeScript 5]
        Tailwind[Tailwind CSS]
        Recharts[Recharts]
    end

    subgraph "Backend Stack"
        Express[Express.js]
        NodeJS[Node.js]
        Prisma[Prisma ORM]
        BCryptJS[bcryptjs]
    end

    subgraph "Database Stack"
        PostgreSQL[PostgreSQL]
        PrismaClient[Prisma Client]
        Migrations[Database Migrations]
    end

    subgraph "Development Tools"
        ESLint[ESLint]
        PostCSS[PostCSS]
        Autoprefixer[Autoprefixer]
    end

    subgraph "UI/UX Libraries"
        ReactHotToast[React Hot Toast]
        GoogleFonts[Google Fonts]
        RemixIcon[RemixIcon]
        TailwindAnimate[Tailwind Animate]
    end

    React --> NextJS
    NextJS --> TypeScript
    TypeScript --> Tailwind
    Tailwind --> Recharts

    Express --> NodeJS
    NodeJS --> Prisma
    Prisma --> BCryptJS

    PostgreSQL --> PrismaClient
    PrismaClient --> Migrations

    ESLint --> PostCSS
    PostCSS --> Autoprefixer

    ReactHotToast --> GoogleFonts
    GoogleFonts --> RemixIcon
    RemixIcon --> TailwindAnimate

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef tools fill:#fff3e0
    classDef ui fill:#fce4ec
    
    class React,NextJS,TypeScript,Tailwind,Recharts frontend
    class Express,NodeJS,Prisma,BCryptJS backend
    class PostgreSQL,PrismaClient,Migrations database
    class ESLint,PostCSS,Autoprefixer tools
    class ReactHotToast,GoogleFonts,RemixIcon,TailwindAnimate ui
```

---

## Architecture Principles

### 1. **Separation of Concerns**
- Clear separation between presentation, business logic, and data layers
- Context-based state management for different domains
- Modular component architecture

### 2. **Type Safety**
- Full TypeScript implementation across frontend and backend
- Prisma-generated types for database operations
- Strict type checking for API contracts

### 3. **Security First**
- Multi-layered authentication and authorization
- Input validation and sanitization
- Secure session management

### 4. **Performance Optimization**
- Server-side rendering with Next.js
- Optimistic UI updates
- Efficient data fetching and caching

### 5. **Scalability**
- Modular architecture supporting feature additions
- Database design supporting multi-tenancy
- API-first approach enabling multiple clients

### 6. **User Experience**
- Responsive design for all devices
- Progressive enhancement
- Accessibility compliance
- Real-time feedback and notifications