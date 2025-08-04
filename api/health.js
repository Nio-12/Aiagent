const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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
            database: error ? 'Error' : 'Connected',
            environment: process.env.NODE_ENV || 'development'
        });
        
    } catch (error) {
        console.error('Health check error:', error);
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            conversationsCount: 0,
            database: 'Error',
            environment: process.env.NODE_ENV || 'development'
        });
    }
}; 