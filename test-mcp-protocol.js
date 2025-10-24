#!/usr/bin/env node

// MCP Protocol Test Script
// Tests the MCP server using the official MCP protocol

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing MCP Protocol Server...\n');

// Test 1: Initialize MCP connection
async function testMCPConnection() {
  console.log('📡 Testing MCP connection...');
  
  const serverPath = path.join(__dirname, 'dist', 'server.js');
  
  // Start the MCP server in stdio mode
  const mcpProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Send MCP initialize request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: "mcp-test-client",
        version: "1.0.0"
      }
    }
  };
  
  console.log('📤 Sending initialize request...');
  mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Listen for response
  mcpProcess.stdout.on('data', (data) => {
    console.log('📥 Received response:');
    console.log(JSON.stringify(JSON.parse(data.toString()), null, 2));
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.log('❌ Error:', data.toString());
  });
  
  // Wait a bit then send list tools request
  setTimeout(() => {
    const listToolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list"
    };
    
    console.log('\n📤 Sending tools/list request...');
    mcpProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  }, 1000);
  
  // Wait a bit then send call tool request
  setTimeout(() => {
    const callToolRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "topMovers",
        arguments: {
          limit: 3
        }
      }
    };
    
    console.log('\n📤 Sending tools/call request...');
    mcpProcess.stdin.write(JSON.stringify(callToolRequest) + '\n');
  }, 2000);
  
  // Clean up after 5 seconds
  setTimeout(() => {
    console.log('\n✅ Test completed!');
    mcpProcess.kill();
    process.exit(0);
  }, 5000);
}

// Run the test
testMCPConnection().catch(console.error);

