# Vercel Deployment - AI Chatbot

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-chatbot)

## 📋 Features

- ✅ **Real-time AI Chat**: Powered by OpenAI GPT-4
- ✅ **Conversation Management**: Store and retrieve chat history
- ✅ **Customer Analysis**: AI-powered lead analysis
- ✅ **Dashboard**: Filter conversations by industry, consultation status, and lead quality
- ✅ **Serverless**: Built for Vercel's serverless functions
- ✅ **Responsive Design**: Works on desktop and mobile

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo>
   cd ai-chatbot
   npm install
   ```

2. **Set environment variables**:
   ```bash
   # Create .env file
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server**:
   ```bash
   # For Express server (original)
   npm run dev
   
   # For Vercel simulation
   npm run vercel-dev
   ```

## 🌐 Deployment

### Option 1: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login and deploy**:
   ```bash
   vercel login
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy automatically** on every push

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── chat.js            # POST /api/chat
│   ├── conversations.js    # GET /api/conversations
│   ├── analyze.js         # POST /api/analyze
│   └── health.js          # GET /api/health
├── index.html             # Main chat interface
├── dashboard.html         # Dashboard interface
├── script.js             # Frontend chat logic
├── dashboard.js          # Frontend dashboard logic
├── styles.css            # Main styles
├── dashboard.css         # Dashboard styles
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send chat message to AI |
| `GET` | `/api/conversations` | Get all conversations |
| `POST` | `/api/analyze` | Analyze conversation for customer data |
| `GET` | `/api/health` | Health check |

## 🎯 Usage

### Chat Interface
1. Visit the deployed URL
2. Start chatting with the AI assistant
3. The AI will guide users through a structured discovery process

### Dashboard
1. Visit `/dashboard` on your deployed URL
2. View all conversations
3. Use filters to find specific conversations
4. Click "Analyze" to extract customer information
5. View detailed customer analysis

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after setting variables

2. **CORS Errors**
   - All API endpoints include CORS headers
   - Check browser console for specific errors

3. **Database Connection**
   - Verify Supabase credentials
   - Check Supabase dashboard for connection issues

4. **OpenAI API Errors**
   - Verify API key is correct
   - Check OpenAI dashboard for usage limits

### Debugging

1. **Check Vercel Function Logs**:
   - Go to Vercel dashboard
   - Click on your project
   - Go to Functions tab
   - Check logs for errors

2. **Test API Endpoints**:
   ```bash
   # Test health endpoint
   curl https://your-app.vercel.app/api/health
   
   # Test chat endpoint
   curl -X POST https://your-app.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello","sessionId":"test123"}'
   ```

## 📞 Support

For issues:
1. Check Vercel function logs
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test API endpoints individually

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run vercel-dev`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 