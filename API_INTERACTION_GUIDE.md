# Masjid Network API Interaction Guide

This document provides a comprehensive overview of all possible interactions with the Masjid Network API, including state changes, access control, user flows, and potential bottlenecks.

## Table of Contents

- [Masjid Network API Interaction Guide](#masjid-network-api-interaction-guide)
  - [Table of Contents](#table-of-contents)
  - [API Structure Overview](#api-structure-overview)
  - [Authentication Flows](#authentication-flows)
    - [User Registration](#user-registration)
    - [User Login](#user-login)
    - [Password Reset](#password-reset)
  - [User Management](#user-management)
    - [User Role Progression](#user-role-progression)
    - [Profile Management](#profile-management)
    - [Account Deactivation](#account-deactivation)
  - [Masjid Management](#masjid-management)
    - [Masjid Creation](#masjid-creation)
    - [Masjid Administration](#masjid-administration)
    - [Masjid Verification](#masjid-verification)
  - [Campaign Management](#campaign-management)
    - [Campaign Creation](#campaign-creation)
    - [Campaign Lifecycle](#campaign-lifecycle)
    - [Campaign Donations](#campaign-donations)
  - [Payment Processing](#payment-processing)
    - [Donation Flow](#donation-flow)
    - [Payment Verification](#payment-verification)
    - [Refund Processing](#refund-processing)
  - [Access Control Matrix](#access-control-matrix)
  - [State Transition Diagrams](#state-transition-diagrams)
    - [User States](#user-states)
    - [Masjid States](#masjid-states)
    - [Campaign States](#campaign-states)
    - [Donation States](#donation-states)
  - [Potential Bottlenecks and Solutions](#potential-bottlenecks-and-solutions)
  - [API Standardization](#api-standardization)
    - [Endpoint Structure](#endpoint-structure)
    - [Request/Response Format](#requestresponse-format)
    - [Error Handling](#error-handling)
  - [API Versioning Strategy](#api-versioning-strategy)

## API Structure Overview

The Masjid Network API follows a RESTful design with the following base structure:

```
/api/v1/[resource]
```

Main resources:
- `/api/v1/auth` - Authentication endpoints
- `/api/v1/users` - User management
- `/api/v1/masjids` - Masjid/mosque management
- `/api/v1/campaigns` - Fundraising campaign management
- `/api/v1/donations` - Donation management
- `/api/v1/payments` - Payment processing

This structure provides:
- Clear separation of concerns
- Versioning support for future changes
- Intuitive resource-based organization

## Authentication Flows

### User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Process:**
1. User submits registration information (email, password, name)
2. System validates the input
3. System checks if email already exists
4. If email is unique, creates a new user with **USER** role
5. Returns user information and authentication token

**State Changes:**
- New user record created in database
- User starts with default **USER** role
- User is marked as active

**Access Control:**
- Public endpoint, no authentication required

**Potential Issues:**
- Email verification is not currently implemented, which could lead to fake accounts
- No protection against bulk registrations (potential for spam)

**Improvement Suggestions:**
- Add email verification step
- Implement rate limiting for registration attempts
- Add CAPTCHA for bot prevention

### User Login

**Endpoint:** `POST /api/v1/auth/login`

**Process:**
1. User submits email and password
2. System validates credentials
3. If valid, generates JWT token
4. Updates last login timestamp
5. Returns token and user information

**State Changes:**
- User's `lastLogin` field is updated
- New JWT token is generated

**Access Control:**
- Public endpoint, no authentication required

**Potential Issues:**
- No rate limiting could allow brute force attacks
- No account lockout after failed attempts

**Improvement Suggestions:**
- Implement rate limiting for login attempts
- Add account lockout after multiple failed attempts
- Add two-factor authentication option

### Password Reset

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Process:**
1. User submits email address
2. System generates password reset token
3. System sends email with reset link
4. User clicks link and sets new password

**State Changes:**
- Password reset token is created
- When reset is complete, user's password is updated

**Access Control:**
- Initial request is public
- Password reset confirmation requires valid token

**Potential Issues:**
- Email delivery issues could block password recovery
- No expiration for reset tokens could be a security risk

**Improvement Suggestions:**
- Add token expiration (e.g., 24 hours)
- Implement alternative recovery methods

## User Management

### User Role Progression

Users in the system can have the following roles, with increasing privileges:

1. **USER** (Default)
   - Can browse masjids and campaigns
   - Can make donations
   - Can manage their own profile

2. **MASJID_ADMIN**
   - All USER permissions
   - Can manage specific masjids they are assigned to
   - Can create and manage campaigns for their masjids
   - Can view donations to their masjids' campaigns

3. **ADMIN**
   - All MASJID_ADMIN permissions
   - Can manage all users
   - Can manage all masjids
   - Can access system-wide reports

4. **SUPER_ADMIN**
   - All ADMIN permissions
   - Can manage other admins
   - Can access system configuration
   - Has unrestricted access to all features

**Role Upgrade Process:**

1. USER → MASJID_ADMIN:
   - When a user is assigned as an admin to a masjid
   - Requires ADMIN approval
   - Endpoint: `POST /api/v1/masjids/{masjidId}/admins`

2. USER/MASJID_ADMIN → ADMIN:
   - Manual upgrade by existing ADMIN or SUPER_ADMIN
   - Endpoint: `PATCH /api/v1/users/{userId}`

3. ADMIN → SUPER_ADMIN:
   - Manual upgrade by existing SUPER_ADMIN only
   - Endpoint: `PATCH /api/v1/users/{userId}`

**Potential Issues:**
- No automated approval workflow for MASJID_ADMIN requests
- No audit trail for role changes

**Improvement Suggestions:**
- Add role change request workflow
- Implement comprehensive audit logging
- Add time-limited admin roles

### Profile Management

**Endpoints:**
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users/{id}` - Get specific user (admin only)
- `PATCH /api/v1/users/{id}` - Update specific user (admin only)

**State Changes:**
- User profile information is updated
- Profile image may be uploaded/changed

**Access Control:**
- Users can only view and edit their own profiles
- ADMIN and SUPER_ADMIN can view and edit any profile

**Potential Issues:**
- No validation for phone numbers in international format
- No restrictions on profile image size/type

**Improvement Suggestions:**
- Add proper validation for all profile fields
- Implement image optimization for profile pictures
- Add profile completion percentage

### Account Deactivation

**Endpoint:** `DELETE /api/v1/users/{id}`

**Process:**
1. User or admin requests account deactivation
2. System marks user as inactive
3. User can no longer log in
4. Admin can reactivate account if needed

**State Changes:**
- User `isActive` flag is set to false
- User cannot log in while inactive

**Access Control:**
- Users can deactivate their own accounts
- Only ADMIN and SUPER_ADMIN can deactivate other accounts

**Potential Issues:**
- Deactivation doesn't handle linked resources (masjids, campaigns)
- No grace period for accidental deactivation

**Improvement Suggestions:**
- Add confirmation step for deactivation
- Implement soft delete with recovery period
- Add automated cleanup of inactive accounts

## Masjid Management

### Masjid Creation

**Endpoint:** `POST /api/v1/masjids`

**Process:**
1. Authenticated user submits masjid information
2. System validates the input
3. System creates new masjid record
4. Creator is automatically assigned as a masjid admin
5. Masjid starts with unverified status

**State Changes:**
- New masjid record is created
- Creator is added to masjid admins
- If creator was a regular USER, role is upgraded to MASJID_ADMIN

**Access Control:**
- Any authenticated user can create a masjid
- Creating user automatically becomes a masjid admin

**Potential Issues:**
- No verification at creation could lead to duplicate/fake masjids
- No limit on how many masjids a user can create

**Improvement Suggestions:**
- Add initial verification step
- Implement masjid creation limits
- Add masjid templates for faster creation

### Masjid Administration

**Endpoints:**
- `GET /api/v1/masjids/{masjidId}/admins` - List masjid admins
- `POST /api/v1/masjids/{masjidId}/admins` - Add masjid admin
- `PATCH /api/v1/masjids/{masjidId}/admins/{adminId}` - Update admin role
- `DELETE /api/v1/masjids/{masjidId}/admins/{adminId}` - Remove admin

**Process:**
1. Existing masjid admin can add new admins
2. System assigns MASJID_ADMIN role if user doesn't have it
3. Multiple admins can manage the same masjid
4. Admins can have different roles within the masjid (ADMIN, EDITOR, FINANCE)

**State Changes:**
- New MasjidAdmin record is created
- User role may be upgraded to MASJID_ADMIN
- Admin permissions for the masjid are updated

**Access Control:**
- Only existing masjid admins can manage other admins
- ADMIN and SUPER_ADMIN can manage any masjid's admins

**Potential Issues:**
- No limit on number of admins per masjid
- No hierarchy among masjid admins
- Last admin can be removed, leaving masjid without administration

**Improvement Suggestions:**
- Implement admin hierarchy (owner, admin, editor)
- Prevent removal of last admin
- Add admin invitation workflow

### Masjid Verification

**Endpoint:** `PATCH /api/v1/masjids/{masjidId}/verify`

**Process:**
1. ADMIN reviews masjid information
2. If legitimate, admin approves verification
3. Masjid is marked as verified
4. Verified status is displayed to users

**State Changes:**
- Masjid `isVerified` flag is set to true
- Verified badge appears on masjid profile

**Access Control:**
- Only ADMIN and SUPER_ADMIN can verify masjids

**Potential Issues:**
- No structured verification process
- No renewal/review of verification status

**Improvement Suggestions:**
- Add verification checklist
- Implement periodic verification renewal
- Allow users to report suspicious masjids

## Campaign Management

### Campaign Creation

**Endpoint:** `POST /api/v1/campaigns`

**Process:**
1. Masjid admin submits campaign information
2. System validates input (dates, goal amount, etc.)
3. System creates new campaign associated with masjid
4. Campaign starts with active status if start date is current/past

**State Changes:**
- New campaign record is created
- Campaign is linked to specific masjid
- Campaign status is set based on dates

**Access Control:**
- Only MASJID_ADMIN for the specific masjid can create campaigns
- ADMIN and SUPER_ADMIN can create campaigns for any masjid

**Potential Issues:**
- No limit on number of active campaigns per masjid
- No approval process for campaigns

**Improvement Suggestions:**
- Add campaign limits based on masjid size/activity
- Implement campaign approval workflow
- Add campaign templates

### Campaign Lifecycle

**Endpoints:**
- `PATCH /api/v1/campaigns/{id}` - Update campaign
- `DELETE /api/v1/campaigns/{id}` - Delete campaign

**States:**
1. **Draft** - Created but not yet published
2. **Scheduled** - Published but start date is in future
3. **Active** - Currently accepting donations
4. **Completed** - End date has passed
5. **Cancelled** - Manually cancelled

**State Changes:**
- Campaign status changes based on dates and admin actions
- Campaign details can be updated while in draft or scheduled state
- Limited updates allowed while active

**Access Control:**
- Only masjid admins for the specific masjid can manage its campaigns
- ADMIN and SUPER_ADMIN can manage any campaign

**Potential Issues:**
- No notifications for campaign state changes
- Limited reporting on campaign performance

**Improvement Suggestions:**
- Add campaign performance metrics
- Implement milestone notifications
- Add campaign extension functionality

### Campaign Donations

**Endpoints:**
- `GET /api/v1/campaigns/{campaignId}/donations` - List donations
- `POST /api/v1/campaigns/{campaignId}/donations` - Create donation

**Process:**
1. User selects donation amount and payment method
2. System creates donation record with PENDING status
3. User completes payment process
4. System updates donation status and campaign raised amount

**State Changes:**
- New donation record is created
- Campaign raised amount is updated
- Payment record is created and linked

**Access Control:**
- Anyone can make donations (even without authentication)
- Only campaign admins can view detailed donation information

**Potential Issues:**
- No handling of failed/abandoned donations
- Campaign goal can be exceeded without notification

**Improvement Suggestions:**
- Add donation limits/validations
- Implement donation matching features
- Add recurring donation options

## Payment Processing

### Donation Flow

**Endpoints:**
- `POST /api/v1/payments/create-intent` - Create payment intent
- `POST /api/v1/payments/confirm-intent/{id}/{donationId}` - Confirm payment
- `POST /api/v1/payments/webhook` - Payment webhook

**Process:**
1. User initiates donation
2. System creates payment intent with payment provider
3. User completes payment on provider's interface
4. Provider sends webhook notification
5. System updates donation and campaign status

**State Changes:**
- Payment intent is created
- Donation status changes from PENDING to COMPLETED
- Campaign raised amount is updated
- Receipt is generated

**Access Control:**
- Payment creation is public
- Webhook endpoint is public but verified by signature

**Potential Issues:**
- Payment abandonment leads to orphaned records
- No handling of partial payments
- Webhook failures could lead to inconsistent state

**Improvement Suggestions:**
- Implement payment timeout and cleanup
- Add support for partial payments
- Create robust webhook retry mechanism

### Payment Verification

**Process:**
1. Payment provider sends webhook with payment status
2. System verifies webhook signature
3. System updates donation status based on payment result
4. System generates receipt for completed payments

**State Changes:**
- Donation status updated (COMPLETED, FAILED)
- Payment details recorded
- Receipt URL generated

**Potential Issues:**
- Webhook delivery failures
- Race conditions in concurrent updates

**Improvement Suggestions:**
- Implement webhook queueing system
- Add manual verification option for admins
- Create payment reconciliation process

### Refund Processing

**Endpoint:** `POST /api/v1/payments/refund/{donationId}`

**Process:**
1. Admin initiates refund
2. System requests refund from payment provider
3. Provider processes refund
4. System updates donation status to REFUNDED
5. System adjusts campaign raised amount

**State Changes:**
- Donation status changes to REFUNDED
- Campaign raised amount is reduced
- Refund record is created

**Access Control:**
- Only MASJID_ADMIN for the campaign's masjid can initiate refunds
- ADMIN and SUPER_ADMIN can refund any donation

**Potential Issues:**
- Partial refunds not supported
- No automated refund for failed campaigns

**Improvement Suggestions:**
- Add partial refund support
- Implement refund reason tracking
- Create automated refund workflows

## Access Control Matrix

| Resource Action                | USER | MASJID_ADMIN | ADMIN | SUPER_ADMIN |
|--------------------------------|------|--------------|-------|-------------|
| View public masjids/campaigns  | ✅   | ✅           | ✅    | ✅          |
| Create masjid                  | ✅   | ✅           | ✅    | ✅          |
| Manage own masjid              | ❌   | ✅*          | ✅    | ✅          |
| Verify masjid                  | ❌   | ❌           | ✅    | ✅          |
| Create campaign                | ❌   | ✅*          | ✅    | ✅          |
| Manage campaign                | ❌   | ✅*          | ✅    | ✅          |
| Make donation                  | ✅   | ✅           | ✅    | ✅          |
| View all donations             | ❌   | ❌           | ✅    | ✅          |
| View masjid donations          | ❌   | ✅*          | ✅    | ✅          |
| Process refunds                | ❌   | ✅*          | ✅    | ✅          |
| Manage users                   | ❌   | ❌           | ✅    | ✅          |
| Manage admins                  | ❌   | ❌           | ❌    | ✅          |
| Access system settings         | ❌   | ❌           | ❌    | ✅          |

*MASJID_ADMIN can only manage masjids, campaigns, and donations for masjids where they are assigned as an admin.

## State Transition Diagrams

### User States

```
[Registration] → [Active User] → [Masjid Admin] → [Admin] → [Super Admin]
                      ↓
                [Inactive User]
```

### Masjid States

```
[Creation] → [Unverified] → [Verified]
                 ↓
            [Inactive]
```

### Campaign States

```
[Draft] → [Scheduled] → [Active] → [Completed]
            ↓             ↓
        [Cancelled]   [Cancelled]
```

### Donation States

```
[Created] → [Pending] → [Completed]
               ↓            ↓
           [Failed]     [Refunded]
```

## Potential Bottlenecks and Solutions

1. **User Registration Spam**
   - **Issue**: Automated bots creating fake accounts
   - **Solution**: Implement CAPTCHA, email verification, and rate limiting

2. **Masjid Verification Backlog**
   - **Issue**: Admins unable to verify masjids quickly enough
   - **Solution**: Implement community verification, automated checks, and verification tiers

3. **Payment Processing Delays**
   - **Issue**: High volume of concurrent donations causing processing delays
   - **Solution**: Queue payment processing, optimize database queries, implement caching

4. **Webhook Handling Failures**
   - **Issue**: Lost webhooks leading to inconsistent payment states
   - **Solution**: Implement webhook retry mechanism, reconciliation process, and manual verification

5. **Campaign Management Complexity**
   - **Issue**: Masjid admins struggling with campaign creation/management
   - **Solution**: Create campaign templates, simplified workflow, and better guidance

## API Standardization

### Endpoint Structure

We recommend standardizing all endpoints with the following structure:

```
/api/v1/[resource]/[id]/[sub-resource]
```

Examples:
- `/api/v1/auth/login`
- `/api/v1/users/profile`
- `/api/v1/masjids/123/admins`
- `/api/v1/campaigns/456/donations`

Benefits:
- Consistent and intuitive URL structure
- Clear resource hierarchy
- Support for versioning
- Easier documentation and client implementation

### Request/Response Format

All API responses should follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": { ... }
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

Benefits:
- Consistent client-side handling
- Clear separation of data and metadata
- Standardized error handling

### Error Handling

Standardized error codes should be used across the API:

- `AUTH_001`: Authentication required
- `AUTH_002`: Invalid credentials
- `AUTH_003`: Insufficient permissions
- `VALIDATION_001`: Invalid input data
- `RESOURCE_001`: Resource not found
- `RESOURCE_002`: Resource already exists
- `PAYMENT_001`: Payment processing error

## API Versioning Strategy

We recommend implementing API versioning to ensure backward compatibility:

1. **URL-based versioning**: `/api/v1/resource`
2. **Gradual deprecation**: Mark endpoints as deprecated before removal
3. **Version lifecycle**:
   - Development (alpha/beta)
   - Stable
   - Deprecated
   - Sunset

This approach allows:
- Clear communication about API changes
- Gradual client migration
- Backward compatibility
- Future extensibility 