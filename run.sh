#!/bin/bash

# Set default database file to test_db.db
DB_FILE="test_db.db"
RECREATE_DB=false

# Parse arguments
for arg in "$@"
do
  case $arg in
    --production)
    DB_FILE="db.db"
    shift # Remove --production from processing
    ;;
    --recreate)
    RECREATE_DB=true
    shift # Remove --recreate from processing
    ;;
  esac
done

# Check if .env file exists, if not create one
if [ ! -f .env ]; then
    echo "DB_PATH=./$DB_FILE" > .env
else
    # Update the DB_PATH variable in the .env file
    sed -i "s|^DB_PATH=.*|DB_PATH=./$DB_FILE|" .env
fi

# Recreate the database if --recreate is passed
if [ "$RECREATE_DB" = true ]; then
  echo "Recreating database..."
  node initDB.js
fi

# Run your Node.js application
node index.js &
