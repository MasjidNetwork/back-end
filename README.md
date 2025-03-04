# Masjid Network API

Backend API for the Masjid Network platform.

## Overview

This NestJS application provides the backend services for the Masjid Network platform, including user authentication, masjid management, fundraising campaigns, and payment processing.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/masjid_network"
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRATION="1d"
   PORT=3000
   NODE_ENV=development
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

## API Documentation

### Swagger UI

The API documentation is available at `/api/docs` when the server is running. This provides an interactive UI to explore and test the API endpoints.

### Documentation Scripts

The project includes two scripts for generating documentation:

1. **Generate API Documentation** (`yarn docs` or `npm run docs`):
   - Generates standard OpenAPI/Swagger documentation
   - Creates a `swagger.json` file in the `/docs` folder
   - Used by Swagger UI when accessing `/api/docs`

2. **Generate Postman Collection** (`yarn postman` or `npm run postman`):
   - Creates an enhanced Postman collection with proper folder structure
   - Generates a Postman environment file with pre-configured variables
   - Outputs files to the `/postman` directory:
     - `swagger.json`: Enhanced OpenAPI spec with Postman extensions
     - `masjid-network-environment.json`: Postman environment variables
     - `masjid-network-api.postman_collection.json`: Ready-to-import Postman collection

### Using Postman Collection

1. Install [Postman](https://www.postman.com/downloads/)
2. Import the collection from `/postman/masjid-network-api.postman_collection.json`
3. Import the environment from `/postman/masjid-network-environment.json`
4. Select the imported environment in Postman
5. Use the collection to test API endpoints

## Cleaning Up Generated Files

The project includes cleanup scripts to remove all generated files and temporary directories:

### Cleanup Scripts

1. **Cross-Platform Cleanup** (`yarn cleanup`):
   - Automatically detects your platform and runs the appropriate script
   - Use this for the most convenient cleanup experience

2. **Windows Cleanup** (`yarn cleanup:win`):
   - Runs the Windows batch script directly (`cleanup.bat`)
   - Cleans up all generated files on Windows systems

3. **Unix/Linux/macOS Cleanup** (`yarn cleanup:unix`):
   - Runs the bash script directly (`cleanup.sh`)
   - Cleans up all generated files on Unix-based systems

### What Gets Cleaned

The cleanup scripts remove:
- Build output in the `dist` directory
- Documentation files in `docs` and `postman` folders
- Log files in the `logs` directory
- Cache files (`.eslintcache` and `node_modules/.cache`)
- Test coverage reports in the `coverage` directory

This is particularly useful before committing changes, when you want to ensure a clean build, or when switching between branches.

## Project Structure

```
backend/
├── prisma/             # Prisma schema and migrations
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # Users module
│   ├── masjids/        # Masjids module
│   ├── campaigns/      # Campaigns module
│   ├── payments/       # Payments module
│   ├── logger/         # Logging service
│   ├── common/         # Shared utilities and filters
│   ├── main.ts         # Application entry point
│   ├── generate-docs.ts # Swagger documentation generator
│   └── swagger-to-postman.ts # Postman collection generator
├── docs/               # Generated Swagger documentation
├── postman/            # Generated Postman collection and environment
├── cleanup.bat         # Windows cleanup script
└── cleanup.sh          # Unix/Linux/macOS cleanup script
```

## Available Scripts

- `yarn start:dev`: Start development server with hot-reload
- `yarn build`: Build the application
- `yarn start:prod`: Start production server
- `yarn docs`: Generate Swagger documentation
- `yarn postman`: Generate Postman collection and environment
- `yarn cleanup`: Clean up all generated files (cross-platform)
- `yarn cleanup:win`: Clean up all generated files (Windows)
- `yarn cleanup:unix`: Clean up all generated files (Unix/Linux/macOS)
- `yarn test`: Run tests
- `yarn lint`: Run linting

## Feature Modules

### Auth Module
Handles user authentication, registration, and JWT token management.

### Users Module
Manages user profiles and permissions.

### Masjids Module
Handles mosque/masjid profiles and administration.

### Campaigns Module
Manages fundraising campaigns and donations.

### Payments Module
Processes payments and integrates with payment gateways.
