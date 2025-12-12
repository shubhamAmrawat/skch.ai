# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Sketch2Code application.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: `Sketch2Code` (or your app name)
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Sketch2Code Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com` (for production)
7. Click **Create** and copy the **Client ID**

## Step 2: Configure Environment Variables

### Client (.env or .env.local)

Create a `.env` file in the `Client` directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Server (.env)

Add to your existing `.env` file in the `Server` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Important:** The Client ID should be the same for both client and server.

## Step 3: Verify Installation

### Dependencies

The following packages should be installed:

**Server:**
- `google-auth-library` ✅

**Client:**
- `@react-oauth/google` ✅

### Test the Integration

1. Start the server:
   ```bash
   cd Server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd Client
   npm run dev
   ```

3. Navigate to `/login` or `/signup`
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected to the home page upon successful authentication

## How It Works

### Authentication Flow

1. User clicks "Continue with Google" button
2. Google OAuth popup opens
3. User authorizes the application
4. Google returns an access token
5. Client sends the access token to the server
6. Server verifies the token with Google's API
7. Server creates/updates user account
8. Server returns JWT tokens (access + refresh)
9. Client stores tokens and redirects user

### User Account Linking

- If a user signs up with Google, a new account is created
- If a user with the same email already exists (local account), the Google account is linked
- Users can sign in with either method after linking

### Security Features

- Token verification on the server
- Email verification check (Google emails are automatically verified)
- Account linking protection (prevents duplicate accounts)
- JWT-based session management
- Refresh token rotation

## Troubleshooting

### "Google OAuth is not properly configured"

- Check that `GOOGLE_CLIENT_ID` is set in server `.env`
- Verify the Client ID is correct

### "Invalid Google token"

- Check that `VITE_GOOGLE_CLIENT_ID` is set in client `.env`
- Verify the Client ID matches between client and server
- Ensure the OAuth consent screen is properly configured

### "Origin not allowed"

- Add your domain to **Authorized JavaScript origins** in Google Cloud Console
- For development: `http://localhost:5173`
- For production: Your production domain

### CORS Errors

- Ensure your client URL is in the `ALLOWED_ORIGINS` environment variable on the server
- Check server CORS configuration in `Server/src/server.js`

## Production Considerations

1. **Use HTTPS**: Google OAuth requires HTTPS in production
2. **Update Redirect URIs**: Add your production domain to Google Cloud Console
3. **Environment Variables**: Use secure environment variable management
4. **Rate Limiting**: Already configured in the auth routes
5. **Token Security**: Refresh tokens are stored securely with httpOnly cookies

## API Endpoints

### POST `/api/auth/google`

Authenticate with Google OAuth.

**Request Body:**
```json
{
  "accessToken": "google-access-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "https://...",
      "isEmailVerified": true,
      "authProvider": "google",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "refresh-token",
    "expiresIn": 900
  }
}
```

## Support

For issues or questions, please check:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

