# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Connect your repository to Vercel
3. **Environment Variables**: Set up your environment variables

## Environment Variables Setup

In your Vercel project settings, add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

## Project Structure

```
/
├── api/                    # Serverless functions
│   ├── chat.js            # Chat API endpoint
│   ├── conversations.js   # Get all conversations
│   ├── analyze/[sessionId].js  # Analyze conversation
│   ├── conversation/[sessionId].js  # Get/delete conversation
│   └── health.js          # Health check
├── index.html             # Main chat interface
├── dashboard.html         # Dashboard interface
├── script.js              # Frontend chat logic
├── dashboard.js           # Frontend dashboard logic
├── styles.css             # Main styles
├── dashboard.css          # Dashboard styles
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## API Endpoints

- `POST /api/chat` - Send chat message
- `GET /api/conversations` - Get all conversations
- `POST /api/analyze/[sessionId]` - Analyze conversation
- `GET /api/conversation/[sessionId]` - Get conversation
- `DELETE /api/conversation/[sessionId]` - Delete conversation
- `GET /api/health` - Health check

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your environment variables

3. Run locally:
```bash
npm run dev
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**: Make sure all required environment variables are set in Vercel
2. **CORS Issues**: The API functions include CORS headers for cross-origin requests
3. **Database Connection**: Ensure your Supabase URL and key are correct

### Debugging

- Check Vercel function logs in the dashboard
- Use the health endpoint to verify database connection
- Test API endpoints individually

## Features

- ✅ Chat interface with OpenAI integration
- ✅ Conversation management
- ✅ Customer analysis with AI
- ✅ Dashboard with filtering
- ✅ Real-time conversation updates
- ✅ Responsive design
- ✅ Serverless architecture 