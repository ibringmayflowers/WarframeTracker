#!/bin/bash

# Set default database file to test_db.db
DB_FILE="test_db.db"
RECREATE_DB=false
MODE="TEST"

# Parse arguments
for arg in "$@"
do
  case $arg in
    --production)
    MODE="PROD"
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
    echo "TEST_PORT=28473" >> .env
    echo "PROD_PORT=28472" >> .env
fi

# Update the DB_PATH variable in the .env file
sed -i "s|^DB_PATH=.*|DB_PATH=./$DB_FILE|" .env

# Set PORT based on the environment
if grep -q '^PROD_PORT=' .env; then
    PROD_PORT=$(grep '^PROD_PORT=' .env | cut -d '=' -f 2)
else
    echo "PROD_PORT is not set in .env. Plese set it to continue."
    exit 1
fi

if grep -q '^TEST_PORT=' .env; then
    TEST_PORT=$(grep '^TEST_PORT=' .env | cut -d '=' -f 2)
else
    echo "TEST_PORT is not set in .env. Plese set it to continue."
    exit 1
fi

# Set PORT variable
if [ "$MODE" = "PROD" ]; then
    PORT="$PROD_PORT" # Use production port
else
    PORT="$TEST_PORT"  # Use test port
fi

# Update the PORT variable in the .env file
sed -i "s|^PORT=.*|PORT=$PORT|" .env

# Recreate the database if --recreate is passed
if [ "$RECREATE_DB" = true ]; then
  echo "Recreating database"
  node initDB.js
fi

node index.js &

