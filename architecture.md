# YardOps Architecture Documentation

## 🏗️ Project Structure

```
yardops/
├── frontend/                 # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router
│   │   │   ├── (auth)/      # Auth routes (login, register)
│   │   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   │   ├── admin/   # Admin-specific pages
│   │   │   │   └── reader/  # Reader-specific pages
│   │   │   └── api/         # Next.js API routes (if needed)
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── forms/       # Form components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   └── layout/      # Layout components
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types (frontend-specific)
│   │   └── lib/             # Library configurations
│   ├── public/              # Static assets
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                  # Express.js backend application
│   ├── src/
│   │   ├── api/             # API route handlers (controllers)
│   │   │   ├── auth/        # Authentication routes
│   │   │   ├── users/       # User management routes
│   │   │   ├── locations/   # Location CRUD routes
│   │   │   ├── meters/      # Meter CRUD routes
│   │   │   ├── readings/    # Reading management routes
│   │   │   ├── notifications/# Notification routes
│   │   │   └── reports/     # Reporting routes
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── location.service.ts
│   │   │   ├── meter.service.ts
│   │   │   ├── reading.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── report.service.ts
│   │   ├── models/          # Database models (Prisma/TypeORM)
│   │   ├── repositories/    # Data access layer
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types (backend-specific)
│   │   ├── config/          # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   └── email.ts
│   │   └── app.ts           # Express app setup
│   ├── prisma/              # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tsconfig.json
│   └── package.json
│
├── common/                   # Shared code between frontend and backend
│   └── types/               # Shared TypeScript types/interfaces
│       ├── user.types.ts
│       ├── meter.types.ts
│       ├── reading.types.ts
│       └── api.types.ts
│
├── tests/                    # Test files
│   ├── backend/             # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   └── frontend/            # Frontend tests
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── scripts/                 # Utility scripts
│   ├── setup.sh             # Initial setup script
│   ├── migrate.sh           # Database migration script
│   └── seed.sh              # Database seeding script
│
├── github/                   # GitHub workflows
│   └── workflows/
│       ├── ci.yml           # Continuous Integration
│       └── cd.yml           # Continuous Deployment
│
├── docker/                   # Docker configurations
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── docs/                     # Additional documentation
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Ant Design 5.0 (optional, for complex components)
- **State Management**: React Context API / Zustand (if needed)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios or Fetch API
- **Authentication**: JWT tokens stored in httpOnly cookies

### Backend
- **Framework**: Express.js with TypeScript
- **Language**: TypeScript
- **Database**: PostgreSQL (local instance)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer
- **Logging**: Winston or Pino
- **Security**: Helmet, CORS, rate limiting

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Database Migrations**: Prisma Migrate

## 📋 Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Utilities/Services**: camelCase (e.g., `authService.ts`)
- **Types/Interfaces**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)
- **API Routes**: kebab-case (e.g., `user-management.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Code
- **Variables/Functions**: camelCase
- **Classes/Interfaces/Types**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefix with underscore (e.g., `_privateMethod`)

## 🔐 Security Guidelines

1. **Authentication**
   - JWT tokens with expiration (15min access, 7d refresh)
   - Tokens stored in httpOnly cookies
   - Password hashing with bcrypt (salt rounds: 10)

2. **Authorization**
   - Role-based access control (RBAC)
   - Middleware for route protection
   - Resource-level permissions

3. **Data Protection**
   - Input validation on all endpoints (Zod schemas)
   - SQL injection prevention (Prisma parameterized queries)
   - XSS prevention (sanitize user inputs)
   - CORS configuration
   - Rate limiting on auth endpoints

4. **Error Handling**
   - Never expose sensitive information in error messages
   - Structured error responses
   - Logging without sensitive data

## 🔄 Data Flow

1. **Frontend → Backend**
   - Frontend services call backend API endpoints
   - Requests include JWT token in Authorization header or cookie
   - Backend validates token and processes request

2. **Backend → Database**
   - Services use repositories for data access
   - Prisma handles database queries
   - Transactions for multi-step operations

3. **Backend → Frontend**
   - Structured JSON responses
   - Consistent error format
   - Type-safe responses using shared types

## 🧪 Testing Strategy

1. **Unit Tests**
   - Services and utilities
   - React components (React Testing Library)
   - Jest as test runner

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - Authentication flows

3. **E2E Tests**
   - Critical user flows
   - Playwright or Cypress

## 📦 Deployment

1. **Development**
   - Local PostgreSQL instance
   - Hot reload for both frontend and backend
   - Environment variables in `.env` files

2. **Production**
   - Docker containers for frontend and backend
   - PostgreSQL in Docker or managed service
   - Environment variables via secrets management
   - Reverse proxy (Nginx) for routing

## 🔍 Code Quality

1. **Linting**: ESLint with TypeScript rules
2. **Formatting**: Prettier
3. **Type Safety**: Strict TypeScript configuration
4. **Pre-commit**: Husky hooks for linting and formatting

## 📝 Documentation Standards

1. **Code Comments**
   - JSDoc for functions and classes
   - Inline comments for complex logic
   - Type definitions for all interfaces

2. **API Documentation**
   - OpenAPI/Swagger for backend APIs
   - README files for each major module

## 🚀 Performance Considerations

1. **Frontend**
   - Code splitting with Next.js
   - Image optimization
   - Lazy loading for components
   - Caching strategies

2. **Backend**
   - Database indexing
   - Query optimization
   - Response caching (Redis - future)
   - Connection pooling

## 🔄 Future Enhancements

- [ ] Redis for caching and session management
- [ ] WebSocket for real-time notifications
- [ ] File upload for meter photos
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
