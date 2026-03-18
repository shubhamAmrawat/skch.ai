<p align="center">
  <img src="Client/public/codingg.png" alt="sktch.ai Logo" width="80" height="80">
</p>

<h1 align="center">sktch.ai</h1>

<p align="center">
  <strong>Transform wireframes into production-ready React code with AI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai" alt="OpenAI">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js" alt="Node.js">
</p>

---

## ✨ Features

- 🎨 **Sketch to Code** - Draw wireframes or paste design images, get production-ready React components
- 🤖 **AI-Powered** - Uses GPT-4o Vision to understand your designs and generate accurate code
- ⚡ **Real-time Preview** - See your generated UI instantly with live preview
- 💬 **Iterative Refinement** - Chat with AI to refine and improve the generated code
- 🎯 **Modern Stack** - Generates React + Tailwind CSS code with best practices
- 🖼️ **Fullscreen Preview** - Open generated UIs in a new tab for full inspection
- 📱 **Responsive** - All generated code is mobile-first and responsive
- 💾 **Sketch Persistence** - Save and manage your sketches in the cloud with full CRUD functionality
- 🚀 **Streaming Generation** - Experience progressive code generation with real-time feedback (Server-Sent Events)
- 🔐 **User Authentication** - Secure login/signup with JWT, Google OAuth, and password recovery
- 🎯 **My Sketches Dashboard** - Organize, edit, delete, and export your saved sketches
<!-- - 🌍 **Share Sketches** - Public sketch routes for sharing your creations -->


> Draw → Generate → Refine → Export

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Canvas:** tldraw
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **State Management:** React Context API
- **Authentication:** JWT tokens with localStorage

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **AI:** OpenAI GPT-4o Vision API (with streaming support)
- **Authentication:** JWT (access + refresh tokens)
- **OAuth:** Google OAuth 2.0
- **Image Storage:** Cloudinary CDN
- **Email Service:** Nodemailer for notifications & password recovery
- **Real-time:** Server-Sent Events (SSE) for streaming responses
- **Security:** Helmet, CORS, authentication middleware

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- MongoDB instance (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional, for Google login)
- Email service credentials (SMTP for password recovery)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sktch.ai.git
   cd sktch.ai
   ```

2. **Install Client dependencies**
   ```bash
   cd Client
   npm install
   ```

3. **Install Server dependencies**
   ```bash
   cd ../Server
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In Server folder, create .env file
   cp .env.example .env
   
   # Add your required credentials (see Environment Variables section above)
   ```

5. **Start the development servers**

   Terminal 1 - Backend:
   ```bash
   cd Server
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd Client
   npm run dev
   ```

6. **Open the app**
   
   Navigate to `http://localhost:5173`

## 🎯 Key Features in Detail

### Save & Manage Sketches
- Generate a UI, then click **Save** to persist it to your account
- Access all your saved sketches from the **My Sketches** dashboard
- Edit, delete, or export sketches anytime
- Sketches are encrypted and only visible to the authenticated user

### Streaming Generation (Real-time Feedback)
- When generating UI code, watch the code stream in real-time
- No more waiting for the entire generation to complete
- Server sends progressive updates via Server-Sent Events (SSE)
- Perfect for seeing how the AI builds your component step-by-step
- Fully responsive to cancellations

### User Authentication
- **Email/Password:** Register with email and password, or login to existing account
- **Google OAuth:** One-click login with your Google account
- **Password Recovery:** Forgot your password? Use the OTP-based reset flow
- **Secure Tokens:** JWT-based authentication with automatic refresh
- **Profile Management:** View and manage your user profile

## 📁 Project Structure

```
sktch.ai/
├── Client/                          # React frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── WhiteboardContainer.tsx
│   │   │   ├── CodePreviewPanel.tsx
│   │   │   ├── LivePreview.tsx
│   │   │   ├── ResizableSplitPane.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── LoadingTransition.tsx
│   │   │   └── forgot-password/     # Password recovery components
│   │   ├── pages/                   # Page components
│   │   │   ├── SketchApp.tsx        # Main sketching interface
│   │   │   ├── MySketchesPage.tsx   # User sketches dashboard
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   └── LandingPage.tsx
│   │   ├── services/                # API & service layer
│   │   │   ├── api.ts               # Core API client
│   │   │   ├── sketchApi.ts         # Sketch CRUD operations
│   │   │   ├── auth.ts              # Authentication service
│   │   │   └── upload.ts            # Image upload service
│   │   ├── context/                 # React Context
│   │   │   ├── authContext.ts
│   │   │   └── AuthProvider.tsx
│   │   ├── hooks/                   # Custom hooks
│   │   │   └── useAuth.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── previewHtml.ts
│   │   │   └── avatarUrl.ts
│   │   └── App.tsx                  # Main app component
│   └── package.json
│
├── Server/                          # Express backend
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── aiController.js      # UI generation (streaming & non-streaming)
│   │   │   ├── sketchController.js  # Sketch CRUD operations
│   │   │   ├── authController.js    # Authentication
│   │   │   ├── googleAuthController.js
│   │   │   ├── uploadController.js  # Image upload
│   │   │   └── publicSketchController.js
│   │   ├── models/                  # Database models
│   │   │   ├── User.js              # User schema
│   │   │   └── Sketch.js            # Sketch schema (persistent storage)
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── aiRoutes.js          # Includes streaming endpoints
│   │   │   ├── sketchRoutes.js      # CRUD endpoints
│   │   │   ├── publicSketchRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── middleware/              # Express middleware
│   │   │   └── auth.js              # JWT verification
│   │   ├── services/                # Business logic
│   │   │   ├── emailService.js
│   │   │   └── otpStore.js
│   │   ├── config/                  # Configuration
│   │   │   ├── database.js
│   │   │   └── cloudinary.js
│   │   ├── emailTemplates/          # Email templates
│   │   │   └── emailTemplates.js
│   │   ├── utils/                   # Utilities
│   │   │   └── prompts.js           # AI prompts
│   │   └── server.js                # Express app entry point
│   ├── package.json
│   └── render.yaml                  # Render deployment config
│
└── README.md                        # This file
```

## � API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Initiate password recovery
- `POST /verify-otp` - Verify OTP
- `POST /reset-password` - Reset password with OTP

### Google OAuth (`/api/google`)
- `POST /google-login` - Google OAuth login/signup

### Sketch Management (`/api/sketches`) - *Requires Authentication*
- `POST /api/sketches` - Create new sketch
- `GET /api/sketches` - List user's sketches (paginated)
- `GET /api/sketches/:id` - Get single sketch details
- `PUT /api/sketches/:id` - Update sketch (title, code)
- `DELETE /api/sketches/:id` - Delete sketch

### Public Sketches (`/api/public-sketches`)
- `GET /api/public-sketches` - List all public sketches
- `GET /api/public-sketches/:id` - Get public sketch details

### UI Generation (`/api/generate`)
- `POST /api/generate` - Generate UI from sketch
  - **Non-streaming:** Returns complete response once generation is done
  - **Streaming:** Add `stream: true` to request body to get Server-Sent Events (SSE) with progressive code generation

### Upload (`/api/upload`)
- `POST /api/upload` - Upload sketch image to Cloudinary

## 🔧 Environment Variables

### Server (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | ✅ |
| `CLOUDINARY_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `SMTP_HOST` | Email service SMTP host | ✅ |
| `SMTP_PORT` | Email service SMTP port | ✅ |
| `SMTP_USER` | Email service username | ✅ |
| `SMTP_PASS` | Email service password | ✅ |
| `FROM_EMAIL` | Sender email address | ✅ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | ❌ |


## 📦 Deployment

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Deployment Options

**Frontend (Vercel):**
- Connect GitHub repo → Set root to `Client` → Deploy
- Configure environment variables:
  - `VITE_API_BASE_URL` - API server URL (e.g., https://api.sktch.ai)
  - `VITE_AUTH_API_BASE_URL` - Auth API URL

**Backend (Render):**
- Connect GitHub repo → Set root to `Server` → Deploy
- Set build command: `npm install`
- Set start command: `npm run dev` or `node src/server.js`
- Add all environment variables from the Server .env file

**Database (MongoDB Atlas):**
- Create free tier cluster
- Get connection string (MongoDB URI)
- Add to `MONGODB_URI` in Render environment

**Image Storage (Cloudinary):**
- Sign up for free account
- Get API credentials
- Add `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide with troubleshooting.

## 🏗️ Architecture Overview

### Data Flow

```
┌─────────────────┐
│  User Draws     │
│  Wireframe      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐       ┌──────────────────┐
│  Export Canvas to   │──────►│  Upload to       │
│  PNG (Base64)       │       │  Cloudinary      │
└──────────────────────────────┘──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Send to AI (GPT-4o Vision)                      │
│  - With streaming enabled (SSE)                  │
│  - Progressive token delivery                    │
└──────────────┬──────────────────────────────────┘
               │
         ┌─────┴─────┐
         ▼           ▼
   [User logged in] [Anonymous]
         │           │
         ▼           ▼
    [Save]      [Download]
     │              │
     ▼              ▼
  MongoDB      Local file
  (Sketch)
```

### Authentication Flow

```
User Registration/Login
    │
    ├─ Email/Password ──► Generate JWT Token
    │                     Store in localStorage
    │                     Auto-refresh before expiry
    │
    └─ Google OAuth ──► Callback to /auth/google
                        Generate JWT Token
                        Create user if new
```

## 📱 Usage Guide

### Creating & Saving a Sketch

1. Navigate to the **Sketch Editor** (`/app`)
2. Use tldraw to create your wireframe
3. Click **Generate** to convert to code
4. Watch the code stream in real-time (SSE)
5. **If logged in:** Click **Save** to store in your account
6. **If not logged in:** Click **Download** to save the `.tsx` file locally
7. Refine using the chat interface if needed
8. Preview the generated UI in real-time

### Managing Your Sketches

1. Go to **My Sketches** (`/mysketches`)
2. View all your saved sketches as cards
3. **Open** - Edit or view the sketch
4. **Export** - Download the code as `.tsx`
5. **Delete** - Permanently remove the sketch

### Iterating on Generated Code

1. In the code preview, use the **Chat** feature to request changes
2. Describe what you want to modify
3. AI will regenerate the code with your changes
4. Changes stream in real-time
5. Save the improved version when satisfied

## 🚀 Performance Features

### Streaming Generation
- **Real-time feedback** - See code as it's generated
- **Progressive enhancement** - Full component appears piece by piece
- **Cancellable** - Stop generation anytime
- **Reduced perceived latency** - Users see content within 1-3 seconds

### Optimization Strategies
- Image compression and smart scaling
- Configurable AI models (gpt-4o, gpt-4o-mini, Claude variants)
- Max token limits for faster responses
- Prompt caching for repeated patterns

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Additional Resources

- **[AUTH_REFERENCE.md](./Server/AUTH_REFERENCE.md)** - Authentication implementation details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment & hosting guide
- **[SKETCH_STORAGE_IMPLEMENTATION_PLAN.md](./SKETCH_STORAGE_IMPLEMENTATION_PLAN.md)** - Sketch persistence architecture
- **[STREAMING_IMPLEMENTATION_PLAN.md](./STREAMING_IMPLEMENTATION_PLAN.md)** - Streaming API details
- **[UI_GENERATION_OPTIMIZATION_PLAN.md](./UI_GENERATION_OPTIMIZATION_PLAN.md)** - Performance optimization guide
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment setup instructions
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [tldraw](https://tldraw.com) - For the amazing canvas library
- [OpenAI](https://openai.com) - For GPT-4o Vision API
- [Tailwind CSS](https://tailwindcss.com) - For the utility-first CSS framework
- [Lucide](https://lucide.dev) - For beautiful icons

---

<p align="center">
  Made with ❤️ by the sktch.ai team
</p>

