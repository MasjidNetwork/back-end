#!/bin/bash

# Generate Swagger documentation
echo "Generating API documentation..."
npm run docs

# Generate Postman collection
echo "Generating Postman collection..."
npm run generate:postman

# Start the application
echo "Starting the application..."
npm run start:dev 