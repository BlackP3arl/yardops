#!/bin/bash

echo "🌱 Seeding database..."

cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Run Prisma seed
npx tsx prisma/seed.ts

echo "✅ Database seeded successfully!"

