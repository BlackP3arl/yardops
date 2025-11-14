#!/bin/bash

echo "🚀 Setting up YardOps project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need it for the database."
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your database credentials."
fi
npm install
echo "✅ Backend dependencies installed"

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local file."
fi
npm install
echo "✅ Frontend dependencies installed"

# Setup Prisma
echo "🗄️  Setting up database..."
cd ../backend
npx prisma generate
echo "✅ Prisma client generated"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run 'npm run prisma:migrate' in the backend directory to create the database"
echo "3. Run 'npm run dev' in the backend directory to start the backend server"
echo "4. Run 'npm run dev' in the frontend directory to start the frontend server"
echo ""

