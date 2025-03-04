#!/bin/bash

echo "Cleaning up generated files..."

# Remove build output
echo "Removing dist directory..."
rm -rf dist

# Remove documentation
echo "Removing generated documentation..."
rm -rf docs
rm -rf postman

# Remove logs
echo "Removing logs..."
rm -rf logs

# Remove cache
echo "Removing cache files..."
rm -f .eslintcache
rm -rf node_modules/.cache

# Remove coverage reports
echo "Removing test coverage reports..."
rm -rf coverage

echo "Cleanup complete!" 