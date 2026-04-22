const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer(function(req, res) {
  const url = req.url.split('?')[0];

  // Health check for Railway
  if (url === '/health' || url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Serve the main app for all routes (SPA)
  fs.readFile(HTML_FILE, function(err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Server error: ' + err.message);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    res.end(data);
  });
});

server.listen(PORT, function() {
  console.log('Utrust server running on port ' + PORT);
});
