# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Set up your Supabase database
3. **OpenAI API Key**: Get your API key from [OpenAI](https://platform.openai.com)

## Environment Variables

Set these environment variables in your Vercel project:

```
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables
After deployment, go to your Vercel dashboard and set the environment variables listed above.

### 5. Redeploy with Environment Variables
```bash
vercel --prod
```

## Project Structure

```
├── api/
│   ├── chat.js          # Chat endpoint
│   ├── conversations.js  # Get conversations
│   ├── analyze.js       # Analyze conversations
│   └── health.js        # Health check
├── index.html           # Main chat interface
├── dashboard.html       # Dashboard interface
├── script.js           # Frontend chat logic
├── dashboard.js        # Frontend dashboard logic
├── styles.css          # Main styles
├── dashboard.css       # Dashboard styles
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── DEPLOYMENT.md       # This file
```

## API Endpoints

- `POST /api/chat` - Send chat message
- `GET /api/conversations` - Get all conversations
- `POST /api/analyze` - Analyze conversation
- `GET /api/health` - Health check

## Features

- ✅ Real-time chat with OpenAI
- ✅ Conversation management
- ✅ Customer analysis
- ✅ Dashboard with filtering
- ✅ Serverless deployment

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all environment variables are set in Vercel dashboard
   - Redeploy after setting variables

2. **CORS Issues**
   - All API endpoints include CORS headers
   - Check browser console for errors

3. **Database Connection**
   - Verify Supabase URL and key are correct
   - Check Supabase dashboard for connection issues

### Local Development

For local development, you can still use the original server:

```bash
npm install
npm run dev
```

This will run the Express server on localhost:3003.

## Support

For issues with deployment, check:
1. Vercel function logs in dashboard
2. Browser console for frontend errors
3. Supabase logs for database issues 