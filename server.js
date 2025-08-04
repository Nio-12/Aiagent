const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Store conversations in memory (in production, use a database)
const conversations = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history for this session
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        
        const conversation = conversations.get(sessionId);
        
        // Add user message to conversation history
        conversation.push({ role: 'user', content: message });
        
        // Prepare messages for OpenAI (include system message and conversation history)
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant. Be friendly, concise, and helpful in your responses.'
            },
            ...conversation
        ];
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
        });
        
        const botResponse = completion.choices[0].message.content;
        
        // Add bot response to conversation history
        conversation.push({ role: 'assistant', content: botResponse });
        
        // Keep only last 10 messages to prevent context from getting too long
        if (conversation.length > 10) {
            conversation.splice(0, 2); // Remove oldest user and assistant messages
        }
        
        res.json({ 
            response: botResponse,
            conversation: conversation
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message 
        });
    }
});

// API endpoint to get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const conversation = conversations.get(sessionId) || [];
    res.json({ conversation });
});

// API endpoint to clear conversation history
app.delete('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    conversations.delete(sessionId);
    res.json({ message: 'Conversation cleared' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        conversationsCount: conversations.size
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
}); 