// Development script to test Vercel functions locally
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Import and use Vercel functions
const chatHandler = require('./api/chat');
const conversationsHandler = require('./api/conversations');
const analyzeHandler = require('./api/analyze');
const healthHandler = require('./api/health');

// Routes
app.post('/api/chat', chatHandler);
app.get('/api/conversations', conversationsHandler);
app.post('/api/analyze', analyzeHandler);
app.get('/api/health', healthHandler);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Vercel dev server running on http://localhost:${PORT}`);
    console.log('This simulates Vercel deployment locally');
    console.log('Set environment variables:');
    console.log('- OPENAI_API_KEY');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_ANON_KEY');
}); 