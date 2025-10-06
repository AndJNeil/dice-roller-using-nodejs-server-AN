const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Handles all CORS 
app.use(express.json());

// Wake up server
app.get('/api/wake', (req, res) => {
  res.json({ 
    status: 'awake', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get random number
app.get('/api/random', (req, res) => {
  res.json({ 
    random: Math.random(),
    timestamp: new Date().toISOString()
  });
});

// Roll die with sides
app.get('/api/roll/:sides', (req, res) => {
  const sides = parseInt(req.params.sides);
  
  if (isNaN(sides) || sides < 1) {
    return res.status(400).json({ error: 'Invalid number of sides' });
  }
  
  const roll = Math.floor(Math.random() * sides) + 1;
  res.json({ 
    sides: sides,
    result: roll,
    timestamp: new Date().toISOString()
  });
});

// Test for CORS failure
app.get('/api/no-cors', (req, res) => {
  res.removeHeader('Access-Control-Allow-Origin');
  res.json({ 
    message: 'This endpoint has no CORS headers',
    random: Math.random()
  });
});

//  Home page with API tester
app.get('/', (req, res) => {
  res.send(`
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
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log('API endpoints available:');
  console.log('  - http://localhost:3000/api/wake');
  console.log('  - http://localhost:3000/api/random');
  console.log('  - http://localhost:3000/api/roll/6');
  console.log('  - http://localhost:3000/api/no-cors');
});