const { createClient } = require('@supabase/supabase-js');

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

    const { sessionId } = req.query;

    if (req.method === 'DELETE') {
        try {
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
    } else if (req.method === 'GET') {
        try {
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
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}; 