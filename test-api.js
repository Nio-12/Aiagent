// Simple API test for Vercel deployment
const fetch = require('node-fetch');

const BASE_URL = 'https://aiagent-ivory.vercel.app';

async function testAPI() {
    console.log('🧪 Testing Vercel API endpoints...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: `${BASE_URL}/api/health`,
            method: 'GET'
        },
        {
            name: 'Chat (POST)',
            url: `${BASE_URL}/api/chat`,
            method: 'POST',
            body: {
                message: 'Hello',
                sessionId: 'test-session-' + Date.now()
            }
        },
        {
            name: 'Analyze (POST)',
            url: `${BASE_URL}/api/analyze/session_1754419586710_azwlf6s9d`,
            method: 'POST'
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            console.log(`   URL: ${test.url}`);
            
            const options = {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (test.body) {
                options.body = JSON.stringify(test.body);
            }
            
            const response = await fetch(test.url, options);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${test.name}: SUCCESS`);
                console.log(`   Status: ${response.status}`);
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Status: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎉 API test completed!');
}

// Run test
testAPI().catch(console.error); 