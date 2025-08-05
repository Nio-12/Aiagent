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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionId } = req.query;
        
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
        
        // Update conversation with analysis results (temporarily disabled due to missing column)
        // const { error: updateError } = await supabase
        //     .from('conversations')
        //     .update({ 
        //         customer_analysis: analysis
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
}; 