#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Step 1: Create a fresh virtual environment named "catalog_venv"
if [ -d "catalog_venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf catalog_venv
fi

echo "Creating a new virtual environment named 'catalog_venv'..."
python3 -m venv catalog_venv
source catalog_venv/bin/activate

echo "Upgrading pip and installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 2: Verify the Python environment
echo "Using Python version:"
python --version

echo "Installed packages:"
pip list

# Step 3: Navigate to the backend directory
if [ -d "backend" ]; then
    cd backend
else
    echo "Error: 'backend' directory not found. Exiting."
    exit 1
fi

# Step 4: Apply migrations
echo "Applying migrations..."
if ! python manage.py makemigrations && python manage.py migrate; then
    echo "Migration failed. Exiting."
    exit 1
fi

# Step 5: Collect static files (optional)
if [ "$1" == "--collectstatic" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput || {
        echo "Failed to collect static files. Continuing without it."
    }
fi

# Step 6: Start the development server
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000
