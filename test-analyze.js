// Test analyze API
const fetch = require('node-fetch');

const BASE_URL = 'https://aiagents-six.vercel.app';

async function testAnalyze() {
    console.log('🧪 Testing analyze API...\n');
    
    const testSessionId = 'session_1754419586710_azwlf6s9d';
    
    try {
        console.log(`📋 Testing: Analyze API`);
        console.log(`   URL: ${BASE_URL}/api/analyze/${testSessionId}`);
        console.log(`   Method: POST`);
        
        const response = await fetch(`${BASE_URL}/api/analyze/${testSessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Analyze API: SUCCESS`);
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        } else {
            const errorText = await response.text();
            console.log(`❌ Analyze API: FAILED`);
            console.log(`   Error: ${errorText}`);
        }
        
    } catch (error) {
        console.log(`❌ Analyze API: ERROR`);
        console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n🎉 Analyze API test completed!');
}

// Run test
testAnalyze().catch(console.error); 