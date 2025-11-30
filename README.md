<p align="center">
  <img src="Client/public/favicon.svg" alt="sktch.ai Logo" width="80" height="80">
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

## 🎬 Demo

![sktch.ai Demo](https://via.placeholder.com/800x400?text=Demo+Screenshot)

> Draw → Generate → Refine → Export

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Canvas:** tldraw
- **Icons:** Lucide React
- **Routing:** React Router DOM

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI:** OpenAI GPT-4o Vision API
- **Security:** Helmet, CORS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

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
   
   # Add your OpenAI API key
   OPENAI_API_KEY=your_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
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

## 📁 Project Structure

```
sktch.ai/
├── Client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── Server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Prompts & utilities
│   │   └── server.js       # Express app
│   └── package.json
│
└── README.md
```

## 🔧 Environment Variables

### Server (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ |

## 📦 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `Client`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Railway / Render)

1. Connect your GitHub repo
2. Set root directory to `Server`
3. Add environment variables
4. Start command: `npm start`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

