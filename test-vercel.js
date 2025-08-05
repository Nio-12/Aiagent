// Test script for Vercel functions
const { exec } = require('child_process');

console.log('Testing Vercel functions...');

// Test health endpoint
const testHealth = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        console.log('✅ Health check:', data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
};

// Test conversations endpoint
const testConversations = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/conversations');
        const data = await response.json();
        console.log('✅ Conversations:', data);
    } catch (error) {
        console.log('❌ Conversations failed:', error.message);
    }
};

// Run tests
testHealth();
testConversations(); 