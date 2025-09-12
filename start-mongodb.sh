#!/bin/bash

echo "🚀 Starting QuizMaster with MongoDB Integration"
echo "=============================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   - Install MongoDB: https://docs.mongodb.com/manual/installation/"
    echo "   - Start MongoDB: mongod"
    echo "   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
    echo ""
    echo "For local MongoDB:"
    echo "   brew install mongodb-community  # macOS"
    echo "   brew services start mongodb-community"
    echo ""
    exit 1
fi

echo "✅ MongoDB is running"

# Start the backend server
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the Angular frontend
echo "🎨 Starting Angular frontend..."
cd ..
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 QuizMaster is now running with MongoDB!"
echo "=========================================="
echo "Frontend: http://localhost:4200"
echo "Backend API: http://localhost:4000"
echo "MongoDB: mongodb://localhost:27017/quizmaster"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
