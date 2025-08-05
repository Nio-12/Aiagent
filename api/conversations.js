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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
}; 