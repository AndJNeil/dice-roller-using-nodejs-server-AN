const http = require('node:http');
const url = require('node:url');
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Route: Wake up server
  if (path === '/api/wake') {
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      status: 'awake', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }));
  }
  
  // Route: Get random number
  else if (path === '/api/random') {
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      random: Math.random(),
      timestamp: new Date().toISOString()
    }));
  }
  
  // Route: Roll die with sides
  else if (path.startsWith('/api/roll/')) {
    const parts = path.split('/');
    const sides = parseInt(parts[3]);
    
    if (isNaN(sides) || sides < 1) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid number of sides' }));
      return;
    }
    
    const roll = Math.floor(Math.random() * sides) + 1;
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      sides: sides,
      result: roll,
      timestamp: new Date().toISOString()
    }));
  }
  
  // Route: No CORS (for testing CORS failure)
  else if (path === '/api/no-cors') {
    // Remove CORS headers for this endpoint
    res.removeHeader('Access-Control-Allow-Origin');
    res.statusCode = 200;
    res.end(JSON.stringify({ 
      message: 'This endpoint has no CORS headers',
      random: Math.random()
    }));
  }
  
  // Route: Home page with API tester
  else if (path === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Dice Roller API</title></head>
      <body>
        <h1>Dice Roller API</h1>
        <h2>Available Endpoints:</h2>
        <ul>
          <li>GET /api/wake - Wake up server</li>
          <li>GET /api/random - Get random number (0-1)</li>
          <li>GET /api/roll/:sides - Roll a die</li>
          <li>GET /api/no-cors - Test CORS failure</li>
        </ul>
        
        <h2>Test the API:</h2>
        <button onclick="testWake()">Test /api/wake</button>
        <p id="wake-result"></p>
        
        <button onclick="testRandom()">Test /api/random</button>
        <p id="random-result"></p>
        
        <input type="number" id="sides" value="6">
        <button onclick="testRoll()">Test /api/roll</button>
        <p id="roll-result"></p>
        
        <button onclick="testCORS()">Test CORS Failure</button>
        <p id="cors-result"></p>
        
        <script>
          async function testWake() {
            try {
              const res = await fetch('/api/wake');
              const data = await res.json();
              document.getElementById('wake-result').textContent = JSON.stringify(data);
            } catch (e) {
              document.getElementById('wake-result').textContent = 'Error: ' + e.message;
            }
          }
          
          async function testRandom() {
            try {
              const res = await fetch('/api/random');
              const data = await res.json();
              document.getElementById('random-result').textContent = JSON.stringify(data);
            } catch (e) {
              document.getElementById('random-result').textContent = 'Error: ' + e.message;
            }
          }
          
          async function testRoll() {
            try {
              const sides = document.getElementById('sides').value;
              const res = await fetch('/api/roll/' + sides);
              const data = await res.json();
              document.getElementById('roll-result').textContent = JSON.stringify(data);
            } catch (e) {
              document.getElementById('roll-result').textContent = 'Error: ' + e.message;
            }
          }
          
          async function testCORS() {
            try {
              const res = await fetch('/api/no-cors');
              const data = await res.json();
              document.getElementById('cors-result').textContent = JSON.stringify(data);
            } catch (e) {
              document.getElementById('cors-result').textContent = 'CORS Error (expected): ' + e.message;
            }
          }
        </script>
      </body>
      </html>
    `);
  }
  
  // 404 Not Found
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log('API endpoints available:');
  console.log('  - http://127.0.0.1:3000/api/wake');
  console.log('  - http://127.0.0.1:3000/api/random');
  console.log('  - http://127.0.0.1:3000/api/roll/6');
  console.log('  - http://127.0.0.1:3000/api/no-cors');
});