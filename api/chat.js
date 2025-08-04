const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}; 