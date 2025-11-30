# Sketch2Code Backend Server

AI-powered wireframe to React code generation service.

## Quick Start

### 1. Install Dependencies

```bash
cd Server
npm install
```

### 2. Configure Environment

Create a `.env` file in the Server directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration (comma-separated origins for production)
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "service": "sketch2code-ai",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "openai": {
    "configured": true,
    "keyPrefix": "sk-proj..."
  }
}
```

### Generate UI
```
POST /api/generate
Content-Type: application/json

{
  "image": "data:image/png;base64,...",
  "history": []
}
```

Response:
```json
{
  "success": true,
  "code": "export default function Component() { ... }",
  "usage": {
    "promptTokens": 1000,
    "completionTokens": 500,
    "totalTokens": 1500
  }
}
```

### Iterate on Generated Code
```
POST /api/generate
Content-Type: application/json

{
  "feedback": "Make the button blue",
  "currentCode": "export default function Component() { ... }"
}
```

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required field | Image or feedback is required |
| 401 | Invalid API key | OpenAI API key is incorrect |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Failed to generate UI | General server error |

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: OpenAI GPT-4o
- **Security**: Helmet, CORS

