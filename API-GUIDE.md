# Masjid Network API Guide

This guide provides detailed information about the Masjid Network API, including explanations of all routes, role management, and edge cases.

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

## API Routes Overview

### Authentication Endpoints

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| POST   | /auth/register    | Register a new user        | Public         |
| POST   | /auth/login       | Log in and receive JWT     | Public         |

### User Management

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| GET    | /users            | Get all users              | ADMIN+         |
| GET    | /users/profile    | Get current user profile   | Authenticated  |
| GET    | /users/{id}       | Get specific user by ID    | Self or ADMIN+ |
| PUT    | /users/profile    | Update current user profile| Authenticated  |
| PUT    | /users/{id}       | Update any user (including role) | ADMIN+   |
| DELETE | /users/{id}       | Delete a user              | ADMIN+         |

### Masjid Management

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| GET    | /masjids          | Get all masjids            | Public         |
| GET    | /masjids/{id}     | Get specific masjid        | Public         |
| POST   | /masjids          | Create a masjid            | ADMIN+         |
| PUT    | /masjids/{id}     | Update a masjid            | MASJID_ADMIN, ADMIN+ |
| DELETE | /masjids/{id}     | Delete a masjid            | ADMIN+         |
| GET    | /masjids/{id}/admins | Get masjid admins       | MASJID_ADMIN, ADMIN+ |
| POST   | /masjids/{id}/admins | Add masjid admin        | ADMIN+         |
| DELETE | /masjids/{id}/admins/{userId} | Remove admin   | ADMIN+         |

### Campaign Management

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| GET    | /campaigns        | Get all campaigns          | Public         |
| GET    | /campaigns/{id}   | Get specific campaign      | Public         |
| POST   | /campaigns        | Create a campaign          | MASJID_ADMIN, ADMIN+ |
| PUT    | /campaigns/{id}   | Update a campaign          | Creator, MASJID_ADMIN, ADMIN+ |
| DELETE | /campaigns/{id}   | Delete a campaign          | Creator, ADMIN+ |
| GET    | /campaigns/{id}/donations | Get campaign donations | MASJID_ADMIN, ADMIN+ |

### Donation Endpoints

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| GET    | /donations        | Get all donations          | ADMIN+         |
| GET    | /donations/{id}   | Get specific donation      | Self, MASJID_ADMIN, ADMIN+ |
| POST   | /donations        | Create a donation          | Authenticated  |
| GET    | /users/me/donations | Get current user's donations | Authenticated |

### Payment Processing

| Method | Endpoint           | Description                | Access          |
|--------|-------------------|----------------------------|----------------|
| POST   | /payments/intent  | Create payment intent      | Authenticated  |
| POST   | /payments/webhook | Payment gateway webhook    | Public (webhook) |

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

## Using the Seed Script for Testing

The seed script creates a complete test environment with:

- Regular users (USER role)
- Masjid administrators (MASJID_ADMIN role)
- Platform administrators (ADMIN role)
- Super administrator (SUPER_ADMIN role)
- Sample masjids, campaigns, and donations

### Test User Credentials

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

## Security Considerations

- All endpoints except public ones require a valid JWT in the Authorization header
- Role checks are enforced at the controller level using Guards
- Changes to user roles should be carefully managed as they grant increased privileges 