# sktch.ai Authentication System - Technical Reference

This document explains how the authentication system works in sktch.ai. It's designed to be modern, secure, and prepared for future OAuth integration.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Token System](#token-system)
4. [Security Features](#security-features)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Database Schema](#database-schema)
8. [Future: Google OAuth](#future-google-oauth)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ AuthContext │──│ Auth Service│──│ Protected/Public Routes │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Express)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Auth Routes  │──│  Controller  │──│     Middleware        │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│                             │                                   │
│                             ▼                                   │
│                    ┌──────────────┐                             │
│                    │  User Model  │                             │
│                    └──────────────┘                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    MongoDB       │
                    │  (User Storage)  │
                    └──────────────────┘
```

---

## Authentication Flow

### 1. Registration Flow

```
User fills form → POST /api/auth/register
                          │
                          ▼
                  ┌───────────────┐
                  │ Validate Input │
                  │ (express-validator)
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Check if email │
                  │ already exists │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Hash password │
                  │ (bcrypt, 12 rounds)
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Create user in │
                  │    MongoDB    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Generate tokens│
                  │ (access+refresh)
                  └───────┬───────┘
                          │
                          ▼
              Return user + tokens to client
```

### 2. Login Flow

```
User submits credentials → POST /api/auth/login
                                   │
                                   ▼
                           ┌───────────────┐
                           │ Validate input │
                           └───────┬───────┘
                                   │
                                   ▼
                           ┌───────────────┐
                           │ Check if user │
                           │ account locked │
                           └───────┬───────┘
                                   │
                                   ▼
                           ┌───────────────┐
                           │ Find user by  │
                           │    email      │
                           └───────┬───────┘
                                   │
                                   ▼
                           ┌───────────────┐
                           │ Compare password│
                           │ (bcrypt.compare) │
                           └───────┬───────┘
                                   │
                      ┌────────────┴────────────┐
                      │                         │
              Password matches           Password wrong
                      │                         │
                      ▼                         ▼
              Reset login attempts      Increment attempts
              Generate tokens           (Lock after 5 fails)
              Return success            Return error
```

### 3. Request Authentication Flow

```
Client makes request with Bearer token
                 │
                 ▼
         ┌───────────────┐
         │ Auth Middleware│
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │ Extract token │
         │ from header   │
         └───────┬───────┘
                 │
                 ▼
         ┌───────────────┐
         │ Verify JWT    │
         │ signature     │
         └───────┬───────┘
                 │
         ┌───────┴───────┐
         │               │
     Valid token    Invalid/Expired
         │               │
         ▼               ▼
   Find user       Return 401
   Attach to req   (TOKEN_EXPIRED code
   Continue        triggers refresh)
```

---

## Token System

### Access Token (JWT)

- **Purpose**: Short-lived token for API authentication
- **Expiry**: 15 minutes
- **Storage**: `localStorage` (client-side)
- **Format**: JWT with `userId` and `type: 'access'`

```javascript
// Payload structure
{
  userId: "64abc123...",
  type: "access",
  iat: 1699999999,
  exp: 1699999999 + 900 // 15 min
}
```

### Refresh Token

- **Purpose**: Long-lived token for getting new access tokens
- **Expiry**: 7 days
- **Storage**: `localStorage` + HTTP-only cookie (dual storage)
- **Format**: Random 64-byte hex string
- **Rotation**: New refresh token issued on each use (security)

```
Refresh token: "a3f5c8d9e2b1...64 hex characters"
```

### Token Refresh Flow

```
Access token expired (401 with TOKEN_EXPIRED)
                 │
                 ▼
    ┌─────────────────────────┐
    │ POST /api/auth/refresh  │
    │ with refresh token      │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │ Validate refresh token  │
    │ (exists, not expired)   │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │ Delete old refresh token│
    │ (token rotation)        │
    └────────────┬────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │ Generate new pair       │
    │ (access + refresh)      │
    └────────────┬────────────┘
                 │
                 ▼
         Return new tokens
```

---

## Security Features

### 1. Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 8 chars, uppercase, lowercase, number
- **Never stored in plain text**

### 2. Account Lockout

```
Failed login attempt
        │
        ▼
  Increment counter
        │
        ▼
  Counter >= 5? ──Yes──> Lock account for 15 min
        │
       No
        │
        ▼
  Allow retry
```

### 3. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/login`, `/register` | 10 requests | 15 minutes |
| `/refresh` | 10 requests | 1 minute |
| `/me`, other protected | 60 requests | 1 minute |

### 4. Token Security

- **Access tokens**: Short-lived (15 min), reduces exposure window
- **Refresh tokens**: Stored server-side, can be revoked
- **Token rotation**: New refresh token on each use
- **Multiple sessions**: Max 5 active sessions per user

### 5. Input Validation

All inputs validated with `express-validator`:
- Email format validation
- Password strength requirements
- Name character restrictions
- XSS prevention through sanitization

---

## API Endpoints

### Public Endpoints

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (201):
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { id, name, email, avatar, createdAt },
    "accessToken": "eyJ...",
    "refreshToken": "a3f5c8...",
    "expiresIn": 900
  }
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200): Same as register
```

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a3f5c8..."
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new-jwt...",
    "refreshToken": "new-refresh...",
    "expiresIn": 900
  }
}
```

### Protected Endpoints

```http
GET /api/auth/me
Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "data": {
    "user": { id, name, email, avatar, createdAt, lastLogin }
  }
}
```

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>

{
  "refreshToken": "a3f5c8..." (optional, for cookie-less clients)
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

```http
POST /api/auth/change-password
Authorization: Bearer <accessToken>

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecure456"
}
```

---

## Frontend Integration

### AuthContext

The `AuthContext` provides authentication state and methods throughout the app:

```typescript
const { 
  user,           // Current user object or null
  isLoading,      // Initial auth check in progress
  isAuthenticated,// Boolean shorthand
  login,          // (email, password) => Promise
  register,       // (name, email, password) => Promise
  logout,         // () => Promise
  updateProfile,  // (data) => Promise
  changePassword, // (current, new) => Promise
} = useAuth();
```

### Protected Routes

```tsx
// Requires authentication
<Route path="/app" element={
  <ProtectedRoute>
    <SketchApp />
  </ProtectedRoute>
} />

// Redirects authenticated users (e.g., login page)
<Route path="/login" element={
  <PublicOnlyRoute>
    <LoginPage />
  </PublicOnlyRoute>
} />
```

### Automatic Token Refresh

The `authFetch` function automatically handles:
1. Adding Authorization header
2. Detecting expired tokens (401 + TOKEN_EXPIRED)
3. Refreshing tokens transparently
4. Retrying the original request

```typescript
// Usage is transparent
const response = await authFetch('/me');
// Tokens refreshed automatically if needed
```

---

## Database Schema

### User Model

```javascript
{
  name: String,           // Required, 2-50 chars
  email: String,          // Required, unique, lowercase
  password: String,       // Hashed, not returned in queries
  avatar: String,         // URL, optional
  
  // Future OAuth
  googleId: String,       // Unique, sparse index
  authProvider: String,   // 'local' or 'google'
  
  // Session management
  refreshTokens: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    userAgent: String,
    ipAddress: String
  }],
  
  // Security
  passwordChangedAt: Date,
  loginAttempts: Number,  // Resets on success
  lockUntil: Date,        // Account lockout time
  
  // Status
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## Future: Google OAuth

The system is designed to easily add Google OAuth:

### Prepared Fields

- `googleId`: Stores Google's unique user ID
- `authProvider`: Tracks authentication method
- `avatar`: Can store Google profile picture

### Implementation Steps

1. Install `passport` and `passport-google-oauth20`
2. Create OAuth callback route
3. Link Google account to existing or new user
4. Skip password requirement for OAuth users

### Example Flow (Future)

```
User clicks "Continue with Google"
            │
            ▼
    Redirect to Google OAuth
            │
            ▼
    User authorizes app
            │
            ▼
    Google redirects to callback
            │
            ▼
    Server receives profile
            │
    ┌───────┴───────┐
    │               │
  Existing      New user
  googleId          │
    │               ▼
    │         Create user
    │         googleId + email
    │               │
    └───────┬───────┘
            │
            ▼
    Generate tokens
    Redirect to app
```

---

## Environment Variables

Required in `.env`:

```env
# Database
DB_URI=mongodb+srv://...

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-64-char-secret-here

# Future: Google OAuth
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

---

## Testing the Auth System

### 1. Register a new user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### 3. Access protected route

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### 4. Refresh token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

---

## Summary

This authentication system provides:

✅ **Security**: bcrypt hashing, JWT, rate limiting, account lockout  
✅ **User Experience**: Automatic token refresh, persistent sessions  
✅ **Scalability**: Stateless JWT, MongoDB storage  
✅ **Maintainability**: Clean separation of concerns  
✅ **Future-ready**: Prepared for OAuth providers  

