module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        res.json({ 
            status: 'OK',
            message: 'API is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            envVars: {
                hasOpenAI: !!process.env.OPENAI_API_KEY,
                hasSupabaseURL: !!process.env.SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
            }
        });
    } catch (error) {
        console.error('Test API Error:', error);
        res.status(500).json({ 
            error: 'Test API failed',
            details: error.message 
        });
    }
}; 