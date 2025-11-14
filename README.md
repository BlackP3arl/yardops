# YardOps

A full-stack web application for automating meter reading management at boat yards.

## 🎯 Overview

YardOps is a comprehensive meter reading management system designed for boat yards to efficiently track water and electric meter readings. The system supports multiple user roles (Admin and Reader), automated notifications, and comprehensive reporting.

## 🏗️ Architecture

This project follows a monorepo structure with clear separation between frontend, backend, and shared code:

```
yardops/
├── frontend/          # Next.js 14 frontend application
├── backend/           # Express.js backend API
├── common/            # Shared TypeScript types
├── tests/             # Test files
├── scripts/           # Utility scripts
├── docker/            # Docker configurations
└── docs/              # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (httpOnly cookies)
- **Validation**: Zod
- **Email**: Nodemailer (optional)
- **Logging**: Pino

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 15 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yardops
   ```

2. **Run setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure environment variables**
   
   Backend (`.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/yardops?schema=public"
   JWT_SECRET="your-secret-key"
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```
   
   Frontend (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📝 Default Credentials

After seeding the database:
- **Admin**: admin@yardops.com / admin123
- **Reader**: reader@yardops.com / reader123

## 🎨 Features

### Admin Features
- User management (create, update, delete users)
- Location management
- Meter management
- Assign meters to readers
- Schedule readings
- View comprehensive statistics and reports
- Export readings as CSV or PDF

### Reader Features
- View assigned meters
- Submit meter readings
- View reading history
- Receive notifications for due/missed readings
- Personal dashboard with to-do list

## 📊 API Documentation

The backend API follows RESTful conventions:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/users` - Get all users (Admin only)
- `GET /api/locations` - Get all locations
- `GET /api/meters` - Get all meters
- `POST /api/meters/assign` - Assign meter to user
- `GET /api/readings` - Get all readings
- `POST /api/readings` - Create reading
- `GET /api/reports` - Generate report
- `GET /api/reports/export` - Export report (CSV/PDF)

## 🐳 Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

2. **Run database migrations**
   ```bash
   docker exec -it yardops-backend npx prisma migrate deploy
   ```

3. **Seed the database**
   ```bash
   docker exec -it yardops-backend npm run prisma:seed
   ```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🔐 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on auth endpoints
- CORS configuration
- Helmet for security headers
- SQL injection prevention (Prisma)

## 📄 License

ISC

## 🤝 Contributing

1. Follow the architecture guidelines in `architecture.md`
2. Maintain code quality standards (ESLint, Prettier)
3. Write tests for new features
4. Update documentation as needed

## 📚 Documentation

- [Architecture Documentation](./architecture.md)
- [Product Requirements](./prd.md)
- [Development Guidelines](./guideline.md)

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database exists

### Port Already in Use
- Change PORT in backend `.env`
- Update NEXT_PUBLIC_API_URL in frontend `.env.local`

### Prisma Issues
- Run `npx prisma generate` in backend directory
- Run `npx prisma migrate dev` to apply migrations

## 🔄 Future Enhancements

- [ ] Redis for caching
- [ ] WebSocket for real-time notifications
- [ ] File upload for meter photos
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support

