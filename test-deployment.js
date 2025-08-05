// Test deployment script
const fetch = require('node-fetch');

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';

async function testDeployment() {
    console.log('🧪 Testing Vercel deployment...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: `${BASE_URL}/api/health`,
            method: 'GET'
        },
        {
            name: 'Conversations',
            url: `${BASE_URL}/api/conversations`,
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
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            
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
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ ${test.name}: SUCCESS`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Data: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
            } else {
                console.log(`❌ ${test.name}: FAILED`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${JSON.stringify(data)}`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR`);
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎉 Deployment test completed!');
}

// Run tests
testDeployment().catch(console.error); 