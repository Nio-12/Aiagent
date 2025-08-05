const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Store conversations in memory as fallback (will be replaced by Supabase)
const conversations = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

// API endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get existing conversation from Supabase
        let { data: existingConversation, error: fetchError } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', sessionId)
            .single();

        let conversation = [];
        if (existingConversation) {
            conversation = existingConversation.messages || [];
        }
        
        // Add user message to conversation history
        conversation.push({ role: 'user', content: message });
        
        // Prepare messages for OpenAI (include system message and conversation history)
        const messages = [
            {
                role: 'system',
                content: `You are the NiO AI Assistant - a friendly and helpful virtual assistant representing AI, a company that offers AI consulting and implementation services.

Your goal is to guide users through a structured discovery conversation to understand their industry, challenges, and contact details, and recommend appropriate services.

Always keep responses short, helpful, and polite.
Always reply in the same language the user speaks.
Ask only one question at a time.

RECOMMENDED SERVICES:
- For real estate: Mention customer data extraction from documents, integration with CRM, and lead generation via 24/7 chatbots.
- For education: Mention email automation and AI training.
- For retail/customer service: Mention voice-based customer service chatbots, digital marketing, and AI training.
- For other industries: Mention chatbots, process automation, and digital marketing.

BENEFITS: Emphasize saving time, reducing costs, and improving customer satisfaction.

PRICING: Only mention 'starting from $1000 USD' if the user explicitly asks about pricing.

CONVERSATION FLOW:
1. Ask what industry the user works in.
2. Then ask what specific challenges or goals they have.
3. Based on that, recommend relevant MindTek AI services.
4. Ask if they'd like to learn more about the solutions.
5. If yes, collect their name -> email -> phone number (one at a time).
6. Provide a more technical description of the solution and invite them to book a free consultation.
7. Finally, ask if they have any notes or questions before ending the chat.

OTHER RULES:
- Be friendly but concise.
- Do not ask multiple questions at once.
- Do not mention pricing unless asked.
- Stay on-topic and professional throughout the conversation.`
            },
            ...conversation
        ];
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
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
        
        // Save conversation to Supabase
        if (existingConversation) {
            // Update existing conversation
            const { error: updateError } = await supabase
                .from('conversations')
                .update({ 
                    messages: conversation,
                    created_at: new Date().toISOString()
                })
                .eq('conversation_id', sessionId);
                
            if (updateError) {
                console.error('Error updating conversation:', updateError);
            }
        } else {
            // Create new conversation
            const { error: insertError } = await supabase
                .from('conversations')
                .insert({
                    conversation_id: sessionId,
                    messages: conversation,
                    created_at: new Date().toISOString()
                });
                
            if (insertError) {
                console.error('Error creating conversation:', insertError);
            }
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
app.get('/api/conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const { data: conversation, error } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', sessionId)
            .single();
            
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching conversation:', error);
            return res.status(500).json({ error: 'Failed to fetch conversation' });
        }
        
        res.json({ conversation: conversation?.messages || [] });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// API endpoint to clear conversation history
app.delete('/api/conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('conversation_id', sessionId);
            
        if (error) {
            console.error('Error deleting conversation:', error);
            return res.status(500).json({ error: 'Failed to delete conversation' });
        }
        
        res.json({ message: 'Conversation cleared' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// Get all conversations endpoint
app.get('/api/conversations', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ error: 'Failed to fetch conversations' });
        }
        
        // Add empty analysis data for now (temporary workaround)
        const conversationsWithAnalysis = (data || []).map(conv => ({
            ...conv,
            customer_analysis: null,
            analysis_timestamp: null
        }));
        
        res.json({ conversations: conversationsWithAnalysis });
    } catch (error) {
        console.error('Error in /api/conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Customer analysis endpoint
app.post('/api/analyze/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Get conversation from Supabase
        const { data: conversation, error: fetchError } = await supabase
            .from('conversations')
            .select('messages')
            .eq('conversation_id', sessionId)
            .single();
            
        if (fetchError) {
            console.error('Error fetching conversation:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch conversation' });
        }
        
        if (!conversation || !conversation.messages) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        // Prepare conversation transcript for analysis
        const transcript = conversation.messages
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
            .join('\n');
        
        // System prompt for customer analysis
        const systemPrompt = `Extract the following customer details from the transcript:
- Name
- Email address
- Phone number
- Industry
- Problems, needs, and goals summary
- Availability
- Whether they have booked a consultation (true/false)
- Any special notes
- Lead quality (categorize as 'good', 'ok', or 'spam')

Format the response using this JSON schema:
{
  "type": "object",
  "properties": {
    "customerName": { "type": "string" },
    "customerEmail": { "type": "string" },
    "customerPhone": { "type": "string" },
    "customerIndustry": { "type": "string" },
    "customerProblem": { "type": "string" },
    "customerAvailability": { "type": "string" },
    "customerConsultation": { "type": "boolean" },
    "specialNotes": { "type": "string" },
    "leadQuality": { "type": "string", "enum": ["good", "ok", "spam"] }
  },
  "required": ["customerName", "customerEmail", "customerProblem", "leadQuality"]
}

If the user provided contact details, set lead quality to "good"; otherwise, "spam".

Analyze this conversation transcript and return only the JSON response:`;

        // Call OpenAI API for analysis
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: transcript
                }
            ],
            max_tokens: 500,
            temperature: 0.1,
        });
        
        const analysisResponse = completion.choices[0].message.content;
        
        // Parse the JSON response
        let analysis;
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing analysis response:', parseError);
            return res.status(500).json({ 
                error: 'Failed to parse analysis response',
                details: analysisResponse 
            });
        }
        
        // Update conversation with analysis results (temporarily disabled)
        // const { error: updateError } = await supabase
        //     .from('conversations')
        //     .update({ 
        //         customer_analysis: analysis,
        //         analysis_timestamp: new Date().toISOString()
        //     })
        //     .eq('conversation_id', sessionId);
            
        // if (updateError) {
        //     console.error('Error updating conversation with analysis:', updateError);
        //     return res.status(500).json({ error: 'Failed to save analysis' });
        // }
        
        res.json({ 
            analysis: analysis,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in customer analysis:', error);
        res.status(500).json({ 
            error: 'Failed to analyze conversation',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Get conversation count from Supabase
        const { count, error } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true });
            
        if (error) {
            console.error('Error getting conversation count:', error);
        }
        
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            conversationsCount: count || 0,
            database: error ? 'Error' : 'Connected'
        });
        
    } catch (error) {
        console.error('Health check error:', error);
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            conversationsCount: 0,
            database: 'Error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`Supabase URL configured: ${process.env.SUPABASE_URL ? 'Yes' : 'No'}`);
    console.log(`Supabase Key configured: ${process.env.SUPABASE_ANON_KEY ? 'Yes' : 'No'}`);
}); 