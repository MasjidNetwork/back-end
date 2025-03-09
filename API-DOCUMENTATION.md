# Masjid Network API Documentation

This document provides comprehensive information about the Masjid Network API endpoints, authentication, user roles, and usage examples.

## Table of Contents

- [Masjid Network API Documentation](#masjid-network-api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [User Roles and Authentication](#user-roles-and-authentication)
    - [Available Roles](#available-roles)
    - [Default Role Assignment](#default-role-assignment)
    - [How to Change User Roles](#how-to-change-user-roles)
      - [1. Admin API (Recommended)](#1-admin-api-recommended)
      - [2. Direct Database Update](#2-direct-database-update)
  - [Authentication](#authentication)
    - [Getting a Token](#getting-a-token)
    - [Using the Token](#using-the-token)
  - [API Endpoints](#api-endpoints)
    - [Auth](#auth)
    - [Users](#users)
    - [Masjids](#masjids)
    - [Campaigns](#campaigns)
    - [Payments](#payments)
  - [Request \& Response Examples](#request--response-examples)
    - [Creating a Masjid](#creating-a-masjid)
    - [Creating a Campaign](#creating-a-campaign)
    - [Making a Donation](#making-a-donation)
  - [Common Edge Cases](#common-edge-cases)
    - [1. Users with Multiple Roles](#1-users-with-multiple-roles)
    - [2. Role Requirements for Masjid Management](#2-role-requirements-for-masjid-management)
    - [3. Donation Permissions](#3-donation-permissions)
    - [4. Authentication Edge Cases](#4-authentication-edge-cases)
  - [Error Handling](#error-handling)
  - [Testing](#testing)
    - [Using the Seed Script for Testing](#using-the-seed-script-for-testing)
      - [Test User Credentials](#test-user-credentials)
    - [Swagger Documentation](#swagger-documentation)
    - [Postman Collection](#postman-collection)
  - [Security Considerations](#security-considerations)
  - [Maintenance Scripts](#maintenance-scripts)

## Introduction

The Masjid Network API serves as the backend for the Masjid Network platform, providing functionality for:
- User authentication and management
- Masjid/mosque profiles and administration
- Fundraising campaigns
- Donation processing
- Payment handling

This RESTful API follows standard HTTP methods and status codes, with JSON as the primary data format.

## User Roles and Authentication

### Available Roles

The Masjid Network platform has the following user roles:

1. **USER** - Regular users who can browse masjids, campaigns, and make donations.
2. **MASJID_ADMIN** - Users who manage specific masjids, create campaigns, and view donation details.
3. **ADMIN** - Platform administrators who have broader access to manage users and masjids.
4. **SUPER_ADMIN** - Highest level administrators with complete system access.

### Default Role Assignment

- When a user registers through the `/auth/register` endpoint, they are automatically assigned the **USER** role.
- There is no default root/admin user created by the system; admin users must be created manually.
- To create the initial admin user, you can use the seed script or manually update a user's role in the database.

### How to Change User Roles

User roles can be changed in two ways:

#### 1. Admin API (Recommended)

Only users with ADMIN or SUPER_ADMIN roles can change other users' roles:

```
PUT /users/{userId}
```

Request body:
```json
{
  "role": "ADMIN"  // Can be USER, ADMIN, MASJID_ADMIN, or SUPER_ADMIN
}
```

This endpoint uses the `AdminUpdateUserDto` which includes the `role` field.

#### 2. Direct Database Update

For the initial setup or emergency access, you can modify the role directly in the database:

```sql
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'admin@example.com';
```

## Authentication

Most endpoints in the API require authentication using JWT (JSON Web Tokens).

### Getting a Token

To obtain a token, make a POST request to `/auth/login` with valid credentials:

```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "your_password"
}
```

The response will include an access token:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### Using the Token

Include the token in the Authorization header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Auth

| Method | Endpoint       | Description                 | Auth Required |
|--------|----------------|-----------------------------|---------------|
| POST   | /auth/register | Register a new user         | No            |
| POST   | /auth/login    | Authenticate and get token  | No            |
| GET    | /auth/profile  | Get current user's profile  | Yes           |

### Users

| Method | Endpoint        | Description                | Auth Required | Role Required  |
|--------|-----------------|----------------------------|---------------|----------------|
| GET    | /users          | Get all users              | Yes           | ADMIN          |
| GET    | /users/:id      | Get user by ID             | Yes           | Self or ADMIN  |
| PATCH  | /users/:id      | Update user                | Yes           | Self or ADMIN  |
| DELETE | /users/:id      | Delete user                | Yes           | ADMIN          |
| GET    | /users/profile  | Get current user profile   | Yes           | Authenticated  |
| PUT    | /users/profile  | Update current user profile| Yes           | Authenticated  |

### Masjids

| Method | Endpoint                          | Description                 | Auth Required | Role Required            |
|--------|-----------------------------------|-----------------------------|---------------|--------------------------|
| GET    | /masjids                          | Get all masjids             | No            | None                     |
| GET    | /masjids/:id                      | Get masjid by ID            | No            | None                     |
| POST   | /masjids                          | Create a new masjid         | Yes           | Any                      |
| PATCH  | /masjids/:id                      | Update a masjid             | Yes           | Masjid Admin or ADMIN    |
| DELETE | /masjids/:id                      | Delete a masjid             | Yes           | ADMIN                    |
| GET    | /masjids/:masjidId/admins         | Get masjid admins           | Yes           | Masjid Admin or ADMIN    |
| POST   | /masjids/:masjidId/admins         | Add masjid admin            | Yes           | Masjid Admin or ADMIN    |
| PATCH  | /masjids/:masjidId/admins/:adminId| Update masjid admin         | Yes           | Masjid Admin or ADMIN    |
| DELETE | /masjids/:masjidId/admins/:adminId| Remove masjid admin         | Yes           | Masjid Admin or ADMIN    |

### Campaigns

| Method | Endpoint                            | Description                 | Auth Required | Role Required            |
|--------|-------------------------------------|-----------------------------|---------------|--------------------------|
| GET    | /campaigns                          | Get all campaigns           | No            | None                     |
| GET    | /campaigns/masjid/:masjidId         | Get campaigns by masjid     | No            | None                     |
| GET    | /campaigns/:id                      | Get campaign by ID          | No            | None                     |
| POST   | /campaigns                          | Create a new campaign       | Yes           | Masjid Admin             |
| PATCH  | /campaigns/:id                      | Update a campaign           | Yes           | Masjid Admin             |
| DELETE | /campaigns/:id                      | Delete a campaign           | Yes           | Masjid Admin             |
| GET    | /campaigns/:campaignId/donations    | Get campaign donations      | Yes           | Masjid Admin or ADMIN    |
| POST   | /campaigns/:campaignId/donations    | Create a donation           | No*           | None                     |

### Payments

| Method | Endpoint                            | Description                 | Auth Required | Role Required            |
|--------|-------------------------------------|-----------------------------|---------------|--------------------------|
| GET    | /payments/details                   | Get all payment details     | Yes           | ADMIN                    |
| GET    | /payments/details/:id               | Get payment detail by ID    | Yes           | ADMIN                    |
| GET    | /payments/details/donation/:id      | Get payment by donation     | Yes           | Self, Masjid Admin, ADMIN|
| POST   | /payments/create-intent             | Create payment intent       | No*           | None                     |
| POST   | /payments/confirm-intent/:id/:donId | Confirm payment intent      | No            | None                     |
| POST   | /payments/webhook                   | Payment webhook endpoint    | No            | None                     |

\* *While no auth is required, providing a token will associate the donation with the user.*

## Request & Response Examples

### Creating a Masjid

Request:
```json
POST /api/masjids
Authorization: Bearer <token>
{
  "name": "Al-Noor Masjid",
  "description": "Community mosque serving the local area",
  "address": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "country": "USA",
  "zipCode": "62701",
  "email": "info@al-noor.example.com",
  "phone": "+1-217-555-0123",
  "website": "https://al-noor.example.com"
}
```

Response:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Al-Noor Masjid",
  "description": "Community mosque serving the local area",
  "address": "123 Main Street",
  "city": "Springfield",
  "state": "IL",
  "country": "USA",
  "zipCode": "62701",
  "email": "info@al-noor.example.com",
  "phone": "+1-217-555-0123",
  "website": "https://al-noor.example.com",
  "logoUrl": null,
  "coverImageUrl": null,
  "createdAt": "2023-07-12T15:30:45.123Z",
  "updatedAt": "2023-07-12T15:30:45.123Z",
  "isVerified": false
}
```

### Creating a Campaign

Request:
```json
POST /api/campaigns
Authorization: Bearer <token>
{
  "title": "Ramadan Fundraiser 2023",
  "description": "Help us raise funds for our community programs during Ramadan",
  "goal": 10000,
  "startDate": "2023-03-01T00:00:00Z",
  "endDate": "2023-04-30T23:59:59Z",
  "masjidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

Response:
```json
{
  "id": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "title": "Ramadan Fundraiser 2023",
  "description": "Help us raise funds for our community programs during Ramadan",
  "goal": 10000,
  "raised": 0,
  "startDate": "2023-03-01T00:00:00Z",
  "endDate": "2023-04-30T23:59:59Z",
  "isActive": true,
  "coverImageUrl": null,
  "masjidId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2023-02-15T14:22:33.456Z",
  "updatedAt": "2023-02-15T14:22:33.456Z"
}
```

### Making a Donation

Request:
```json
POST /api/campaigns/c1d2e3f4-a5b6-7890-abcd-ef1234567890/donations
Authorization: Bearer <token> (optional)
{
  "amount": 100,
  "paymentMethod": "CREDIT_CARD",
  "isAnonymous": false,
  "message": "May Allah accept this donation"
}
```

Response:
```json
{
  "id": "d1e2f3g4-h5i6-7890-abcd-ef1234567890",
  "amount": 100,
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "payment-test-id",
  "status": "COMPLETED",
  "isAnonymous": false,
  "message": "May Allah accept this donation",
  "userId": "user-uuid",
  "campaignId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
  "createdAt": "2023-03-15T18:45:12.789Z",
  "updatedAt": "2023-03-15T18:45:12.789Z"
}
```

## Common Edge Cases

### 1. Users with Multiple Roles

- A user with MASJID_ADMIN role may administer multiple masjids with different admin roles (ADMIN, EDITOR, etc.)
- The user's platform role (MASJID_ADMIN) is distinct from their role within each masjid

### 2. Role Requirements for Masjid Management

- A user must have the MASJID_ADMIN platform role before they can be assigned as an admin to a specific masjid
- When a user is assigned as a masjid admin, their platform role should be updated to MASJID_ADMIN if it isn't already

### 3. Donation Permissions

- Users can only view their own donations unless they are ADMIN or MASJID_ADMIN
- Masjid admins can only view donations for campaigns associated with their masjids

### 4. Authentication Edge Cases

- JWT tokens expire after the set period (default: 1 day)
- If a user's role is changed, the change takes effect immediately, but existing JWTs will still carry the old role until they expire

## Error Handling

The API uses standard HTTP status codes and provides error details in the response body:

```json
{
  "statusCode": 400,
  "message": "Email already in use",
  "error": "Bad Request",
  "timestamp": "2023-07-15T12:34:56.789Z",
  "path": "/api/auth/register"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors, etc.)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Testing

### Using the Seed Script for Testing

The seed script creates a complete test environment with:

- Regular users (USER role)
- Masjid administrators (MASJID_ADMIN role)
- Platform administrators (ADMIN role)
- Super administrator (SUPER_ADMIN role)
- Sample masjids, campaigns, and donations

To run the seed script:

```bash
cd backend
npm run seed
```

#### Test User Credentials

| Email                        | Password      | Role         |
|------------------------------|--------------|--------------|
| user1@example.com            | User123!     | USER         |
| user2@example.com            | User123!     | USER         |
| masjid_admin@example.com     | Admin123!    | MASJID_ADMIN |
| multi_masjid_admin@example.com | Admin123!  | MASJID_ADMIN |
| admin@masjidnetwork.com      | Admin123!    | ADMIN        |
| superadmin@masjidnetwork.com | Superadmin123! | SUPER_ADMIN |

These test users can be used to:
1. Test different permission levels
2. Verify role-specific functionality
3. Simulate real-world usage patterns

### Swagger Documentation

The API documentation is available through Swagger UI at:

```
http://localhost:3000/api/docs
```

This interactive documentation allows you to:
- Browse all available endpoints
- See request and response schemas
- Test endpoints directly from the browser
- Authenticate with JWT tokens

### Postman Collection

A Postman collection is automatically generated and available in the `/backend/postman` directory. This collection includes:

- All API endpoints
- Request examples
- Authentication setup
- Environment variables

To use the collection:
1. Import the `masjid-network-api.postman_collection.json` file into Postman
2. Set up an environment with the `baseUrl` variable (e.g., `http://localhost:3000/api`)
3. Use the authentication endpoints to get a token
4. Set the token in the collection's authorization settings

## Security Considerations

- All endpoints except public ones require a valid JWT in the Authorization header
- Role checks are enforced at the controller level using Guards
- Changes to user roles should be carefully managed as they grant increased privileges
- Password hashing is implemented using bcrypt
- Rate limiting is applied to sensitive endpoints
- CORS is configured to allow only specific origins

## Maintenance Scripts

The project includes several utility scripts to help with maintenance:

1. **Documentation Generation**:
   - `yarn docs`: Generate Swagger documentation in the `/docs` folder
   - `yarn postman`: Generate Postman collection and environment in the `/postman` folder

2. **Database Seeding**:
   - `yarn seed`: Populate the database with sample data for testing

3. **Cleanup Scripts**:
   - `yarn cleanup`: Remove all generated files (cross-platform)
   - `yarn cleanup:win`: Remove all generated files on Windows
   - `yarn cleanup:unix`: Remove all generated files on Unix/Linux/macOS

The cleanup scripts remove build artifacts, documentation, logs, cache files, and test coverage reports, giving you a clean slate for development or deployment. 