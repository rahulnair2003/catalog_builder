#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Step 1: Navigate to the frontend directory
if [ -d "frontend" ]; then
    cd frontend
else
    echo "Error: 'frontend' directory not found. Exiting."
    exit 1
fi

# Step 2: Check for node_modules and install dependencies if missing
if [ -d "node_modules" ]; then
    echo "Dependencies already installed. Skipping installation."
else
    echo "Installing frontend dependencies..."
    npm install
fi

# Step 3: Start the React development server
echo "Starting the React development server..."
npm start

