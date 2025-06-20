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
    <html>
    <head>
        <title>QR Code Generator</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            input, button { padding: 10px; margin: 10px 0; font-size: 16px; }
            input[type="text"] { width: 100%; }
            button { background: #007bff; color: white; border: none; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
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
        </ul>
        
        <p><strong>Example:</strong> <a href="/qr/Hello%20World" target="_blank">/qr/Hello World</a></p>
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
      <html>
      <head>
          <title>Generated QR Code</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .qr-container { margin: 20px 0; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <h1>Generated QR Code</h1>
          <p><strong>Text:</strong> ${text}</p>
          <div class="qr-container">
              <img src="data:image/png;base64,${base64QR}" alt="QR Code" />
          </div>
          <p><a href="/">← Generate Another QR Code</a></p>
          <p><a href="data:image/png;base64,${base64QR}" download="qrcode.png">Download QR Code</a></p>
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