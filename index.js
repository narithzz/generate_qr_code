const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for HTML form)
app.use(express.static('public'));

// Route to serve a simple HTML form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium QR Code Generator</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary-color: #4A90E2;
                --secondary-color: #50E3C2;
                --text-color: #333;
                --bg-color: #f4f7f6;
                --card-bg: #fff;
                --border-color: #e0e0e0;
                --shadow-light: rgba(0, 0, 0, 0.05);
                --shadow-medium: rgba(0, 0, 0, 0.1);
            }
            body {
                font-family: 'Poppins', sans-serif;
                background-color: var(--bg-color);
                color: var(--text-color);
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .container {
                background-color: var(--card-bg);
                border-radius: 12px;
                box-shadow: 0 10px 30px var(--shadow-medium);
                padding: 40px;
                max-width: 700px;
                width: 100%;
                text-align: center;
                border: 1px solid var(--border-color);
            }
            h1 {
                color: var(--primary-color);
                font-weight: 600;
                margin-bottom: 25px;
                font-size: 2.2em;
            }
            h2 {
                color: var(--text-color);
                font-weight: 400;
                margin-top: 40px;
                margin-bottom: 20px;
                font-size: 1.5em;
            }
            form {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }
            input[type="text"] {
                width: calc(100% - 24px);
                padding: 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 1em;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
                outline: none;
            }
            input[type="text"]:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
            }
            button {
                background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                padding: 14px 25px;
                font-size: 1.1em;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                box-shadow: 0 5px 15px var(--shadow-light);
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px var(--shadow-medium);
            }
            ul {
                list-style: none;
                padding: 0;
                margin: 0;
                text-align: left;
            }
            ul li {
                background-color: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                font-size: 0.95em;
            }
            ul li strong {
                color: var(--primary-color);
                margin-right: 8px;
            }
            a {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: 600;
                transition: color 0.2s ease;
            }
            a:hover {
                color: var(--secondary-color);
                text-decoration: underline;
            }
            .example-link {
                margin-top: 20px;
                font-size: 1.1em;
            }
            @media (max-width: 600px) {
                .container {
                    padding: 25px;
                    margin: 10px;
                }
                h1 {
                    font-size: 1.8em;
                }
                button {
                    padding: 12px 20px;
                    font-size: 1em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>QR Code Generator</h1>
            <form action="/generate" method="post">
                <input type="text" name="text" placeholder="Enter text or URL to generate QR code" required>
                <button type="submit">Generate QR Code</button>
            </form>
            
            <h2>API Endpoints:</h2>
            <ul>
                <li><strong>GET /qr/:text</strong> - Generate QR code from URL parameter</li>
                <li><strong>POST /generate</strong> - Generate QR code from form data</li>
                <li><strong>GET /qr-json/:text</strong> - Get QR code as base64 JSON</li>
                <li><strong>POST /qr-advanced</strong> - Advanced QR code generation with custom options</li>
            </ul>
            
            <p class="example-link"><strong>Example:</strong> <a href="/qr/Hello%20World" target="_blank">/qr/Hello World</a></p>
        </div>
    </body>
    </html>
  `);
});

// Generate QR code from URL parameter and return as image
app.get('/qr/:text', async (req, res) => {
  try {
    const text = decodeURIComponent(req.params.text);
    
    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Set headers and send image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-${Date.now()}.png"`);
    res.send(qrBuffer);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate QR code from form data
app.post('/generate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).send('Text is required');
    }
    
    const qrBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 400,
      margin: 2
    });
    
    // Convert to base64 for embedding in HTML
    const base64QR = qrBuffer.toString('base64');
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Generated QR Code</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary-color: #4A90E2;
                  --secondary-color: #50E3C2;
                  --text-color: #333;
                  --bg-color: #f4f7f6;
                  --card-bg: #fff;
                  --border-color: #e0e0e0;
                  --shadow-light: rgba(0, 0, 0, 0.05);
                  --shadow-medium: rgba(0, 0, 0, 0.1);
              }
              body {
                  font-family: 'Poppins', sans-serif;
                  background-color: var(--bg-color);
                  color: var(--text-color);
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  box-sizing: border-box;
              }
              .container {
                  background-color: var(--card-bg);
                  border-radius: 12px;
                  box-shadow: 0 10px 30px var(--shadow-medium);
                  padding: 40px;
                  max-width: 600px;
                  width: 100%;
                  text-align: center;
                  border: 1px solid var(--border-color);
              }
              h1 {
                  color: var(--primary-color);
                  font-weight: 600;
                  margin-bottom: 25px;
                  font-size: 2.2em;
              }
              p {
                  font-size: 1.1em;
                  margin-bottom: 15px;
              }
              .qr-container {
                  margin: 30px 0;
                  padding: 20px;
                  background-color: #fff;
                  border: 1px solid var(--border-color);
                  border-radius: 8px;
                  box-shadow: 0 5px 15px var(--shadow-light);
                  display: inline-block; /* To center the container itself */
              }
              .qr-container img {
                  max-width: 100%;
                  height: auto;
                  display: block; /* Remove extra space below image */
              }
              .button-group {
                  margin-top: 30px;
                  display: flex;
                  justify-content: center;
                  gap: 20px;
                  flex-wrap: wrap;
              }
              .button-group a {
                  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                  color: white;
                  border: none;
                  padding: 12px 25px;
                  font-size: 1em;
                  font-weight: 600;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                  box-shadow: 0 5px 15px var(--shadow-light);
                  text-decoration: none;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
              }
              .button-group a:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px var(--shadow-medium);
              }
              .button-group a.secondary {
                  background: var(--bg-color);
                  color: var(--primary-color);
                  border: 1px solid var(--primary-color);
                  box-shadow: none;
              }
              .button-group a.secondary:hover {
                  background: var(--primary-color);
                  color: white;
              }
              @media (max-width: 600px) {
                  .container {
                      padding: 25px;
                      margin: 10px;
                  }
                  h1 {
                      font-size: 1.8em;
                  }
                  .button-group {
                      flex-direction: column;
                      gap: 15px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Generated QR Code</h1>
              <p><strong>Text:</strong> ${text}</p>
              <div class="qr-container">
                  <img src="data:image/png;base64,${base64QR}" alt="QR Code" />
              </div>
              <div class="button-group">
                  <a href="/">← Generate Another QR Code</a>
                  <a href="data:image/png;base64,${base64QR}" download="qrcode.png">Download QR Code</a>
              </div>
          </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Failed to generate QR code');
  }
});

// API endpoint to get QR code as base64 JSON
app.get('/qr-json/:text', async (req, res) => {
  try {
    const text = decodeURIComponent(req.params.text);
    
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2
    });
    
    res.json({
      text: text,
      qrCode: qrDataURL,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Advanced QR code generation with custom options
app.post('/qr-advanced', async (req, res) => {
  try {
    const { 
      text, 
      size = 300, 
      margin = 2, 
      darkColor = '#000000', 
      lightColor = '#FFFFFF',
      format = 'png' 
    } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const options = {
      type: format,
      width: parseInt(size),
      margin: parseInt(margin),
      color: {
        dark: darkColor,
        light: lightColor
      }
    };
    
    if (format === 'svg') {
      const qrSVG = await QRCode.toString(text, { ...options, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(qrSVG);
    } else {
      const qrBuffer = await QRCode.toBuffer(text, options);
      res.setHeader('Content-Type', `image/${format}`);
      res.send(qrBuffer);
    }
    
  } catch (error) {
    console.error('Error generating advanced QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`QR Code Generator server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log(`  GET  /                    - HTML form interface`);
  console.log(`  GET  /qr/:text           - Generate QR code image`);
  console.log(`  POST /generate           - Generate QR code from form`);
  console.log(`  GET  /qr-json/:text      - Get QR code as JSON`);
  console.log(`  POST /qr-advanced        - Advanced QR code generation`);
});