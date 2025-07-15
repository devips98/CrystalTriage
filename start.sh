#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting CrystalTriage deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo "Please set up a PostgreSQL database and configure the DATABASE_URL environment variable."
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run database migrations/schema push
echo "🔄 Setting up database schema..."
npm run db:push

echo "✅ Database schema setup complete"

# Start the application
echo "🌟 Starting CrystalTriage server..."
npm start
