# Masjid Network API Documentation

This document provides comprehensive information about the Masjid Network API endpoints, authentication, and usage examples.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Masjids](#masjids)
   - [Campaigns](#campaigns)
   - [Payments](#payments)
4. [Request & Response Examples](#request--response-examples)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

## Introduction

The Masjid Network API serves as the backend for the Masjid Network platform, providing functionality for:
- User authentication and management
- Masjid/mosque profiles and administration
- Fundraising campaigns
- Donation processing
- Payment handling

This RESTful API follows standard HTTP methods and status codes, with JSON as the primary data format.

## Authentication

Most endpoints in the API require authentication using JWT (JSON Web Tokens).

### Getting a Token

To obtain a token, make a POST request to `/auth/login` with valid credentials:

```json
POST /api/auth/login
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

## Error Handling

The API uses standard HTTP status codes and provides error details in the response body:

```json
{
  "statusCode": 400,
  "message": "Invalid input data",
  "error": "Bad Request",
  "timestamp": "2023-03-15T18:45:12.789Z",
  "path": "/api/campaigns"
}
```

Common error codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Testing

### Swagger Documentation

The API includes Swagger documentation at `/api/docs` that you can use to explore and test endpoints interactively.

### Postman Collection

A Postman collection is available in the `/postman` directory, which includes pre-configured requests for all endpoints. 