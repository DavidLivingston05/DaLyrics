const { WebSocketServer } = require('ws');
const { networkInterfaces } = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Keep track of state
let wss = null;
let httpServer = null;
let desktopSocket = null;
let remoteSockets = new Set();
let lastKnownState = null;
let currentPin = "1234";

// Resolves and classifies all active machine network interfaces
function getNetworkInterfacesList() {
  const nets = networkInterfaces();
  const list = [];
  
  for (const name of Object.keys(nets)) {
    const isVirtual = name.toLowerCase().includes('virtual') || 
                      name.toLowerCase().includes('vbox') || 
                      name.toLowerCase().includes('vmware') || 
                      name.toLowerCase().includes('wsl') ||
                      name.toLowerCase().includes('loopback') ||
                      name.toLowerCase().includes('host-only') ||
                      name.toLowerCase().includes('vethernet');
    
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        list.push({
          name: name,
          address: net.address,
          isVirtual: isVirtual
        });
      }
    }
  }

  // Sort interfaces: Physical Wi-Fi/Ethernet adapters first, then prefer standard home subnets
  list.sort((a, b) => {
    if (a.isVirtual && !b.isVirtual) return 1;
    if (!a.isVirtual && b.isVirtual) return -1;
    
    const aIs192 = a.address.startsWith('192.168.');
    const bIs192 = b.address.startsWith('192.168.');
    if (aIs192 && !bIs192) return -1;
    if (!aIs192 && bIs192) return 1;
    
    const aIs172 = a.address.startsWith('172.');
    const bIs172 = b.address.startsWith('172.');
    if (aIs172 && !bIs172) return -1;
    if (!aIs172 && bIs172) return 1;

    return a.name.localeCompare(b.name);
  });

  return list;
}

// Starts static file HTTP server to serve the remote UI on port 3001
function startHttpServer(port = 3001) {
  try {
    httpServer = http.createServer((req, res) => {
      const parsedUrl = req.url.split('?')[0].split('#')[0];
      const relativePath = parsedUrl === '/' || parsedUrl === '/remote' ? 'index.html' : parsedUrl;
      const filePath = path.join(__dirname, '../dist', relativePath);
      
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.ico') contentType = 'image/x-icon';
      else if (ext === '.json') contentType = 'application/json';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          fs.readFile(path.join(__dirname, '../dist/index.html'), (err2, indexContent) => {
            if (err2) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error loading remote UI assets. Make sure to build before running.');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`[HTTP Server] Serving Remote assets offline at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('[HTTP Server] Failed to start:', error);
  }
}

function startWebSocketServer(pin = "1234", wsPort = 3002, httpPort = 3001) {
  currentPin = pin;
  const interfaces = getNetworkInterfacesList();
  
  console.log('[WebSocket] Detected active network interfaces:');
  interfaces.forEach(i => {
    console.log(`  - [${i.name}] ${i.address} ${i.isVirtual ? '(Virtual)' : '(Physical)'}`);
  });

  const preferredIp = interfaces.length > 0 ? interfaces[0].address : '127.0.0.1';
  console.log(`[WebSocket] Resolved active network IP: ${preferredIp}`);

  // Start HTTP Asset server for offline phone loading
  startHttpServer(httpPort);

  try {
    wss = new WebSocketServer({ port: wsPort });
    console.log(`[WebSocket] Server running offline-first on ws://${preferredIp}:${wsPort}`);
  } catch (error) {
    console.error('[WebSocket] Failed to start server:', error);
    return null;
  }

  // Helper to broadcast event to all authenticated remotes
  function broadcastToRemotes(event) {
    const raw = JSON.stringify(event);
    remoteSockets.forEach(client => {
      if (client.readyState === 1 && client.authenticated) { // 1 = OPEN
        try {
          client.send(raw);
        } catch (e) {
          console.error('[WebSocket] Error sending to remote:', e);
        }
      }
    });
  }

  // Helper to send connection count to everyone
  function broadcastConnectionCount() {
    const count = remoteSockets.size;
    const payload = JSON.stringify({ type: 'CONNECTION_COUNT', count });
    
    // Send to desktop
    if (desktopSocket && desktopSocket.readyState === 1) {
      try { desktopSocket.send(payload); } catch {}
    }
    // Send to all authenticated remotes
    broadcastToRemotes({ type: 'CONNECTION_COUNT', count });
  }

  wss.on('connection', (ws, req) => {
    ws.authenticated = false;
    ws.isDesktop = false;

    console.log('[WebSocket] New client connected from:', req.socket.remoteAddress);

    ws.on('message', (message) => {
      try {
        const event = JSON.parse(message.toString());

        // Handle PING immediately for keep-alive
        if (event.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
          return;
        }

        // Handle desktop registration
        if (event.type === 'DESKTOP_REGISTER') {
          ws.isDesktop = true;
          ws.authenticated = true;
          desktopSocket = ws;
          console.log('[WebSocket] Desktop master client registered.');
          
          // Send current connection count to desktop immediately
          ws.send(JSON.stringify({ type: 'CONNECTION_COUNT', count: remoteSockets.size }));

          // If we had a previous state, sync it (although desktop usually initiates state)
          if (lastKnownState) {
            ws.send(JSON.stringify({ type: 'STATE_SYNC', state: lastKnownState }));
          }
          return;
        }

        // Handle authentication
        if (event.type === 'AUTH') {
          const isCorrect = event.pin === currentPin;
          ws.authenticated = isCorrect;
          ws.send(JSON.stringify({
            type: isCorrect ? 'AUTH_OK' : 'AUTH_FAIL'
          }));

          if (isCorrect) {
            console.log('[WebSocket] Mobile client successfully authenticated.');
            remoteSockets.add(ws);
            broadcastConnectionCount();

            // Push the last known presentation state to the new client
            if (lastKnownState) {
              ws.send(JSON.stringify({ type: 'STATE_SYNC', state: lastKnownState }));
            }
          } else {
            console.warn('[WebSocket] Mobile client authentication failed with PIN:', event.pin);
          }
          return;
        }

        // Block unauthenticated clients
        if (!ws.authenticated) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
          return;
        }

        // EVENT ROUTING:
        if (ws.isDesktop) {
          if (event.type === 'UPDATE_PIN') {
            currentPin = event.pin;
            console.log('[WebSocket] PIN updated by desktop to:', currentPin);
            return;
          }
          if (event.type === 'STATE_SYNC') {
            lastKnownState = event.state;
          }
          broadcastToRemotes(event);
        } else {
          if (desktopSocket && desktopSocket.readyState === 1) {
            desktopSocket.send(JSON.stringify(event));
          } else {
            console.warn('[WebSocket] Remote event received but desktop client is not connected.');
          }
        }
      } catch (err) {
        console.error('[WebSocket] Error processing message:', err);
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid payload format' }));
      }
    });

    ws.on('close', () => {
      if (ws.isDesktop) {
        console.log('[WebSocket] Desktop master client disconnected.');
        if (desktopSocket === ws) {
          desktopSocket = null;
        }
      } else {
        if (remoteSockets.has(ws)) {
          console.log('[WebSocket] Mobile client disconnected.');
          remoteSockets.delete(ws);
          broadcastConnectionCount();
        }
      }
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Socket error:', err);
    });
  });

  return {
    localIp: preferredIp,
    interfaces,
    updatePin: (newPin) => { currentPin = newPin; }
  };
}

function getLocalIP() {
  const list = getNetworkInterfacesList();
  return list.length > 0 ? list[0].address : '127.0.0.1';
}

module.exports = {
  startWebSocketServer,
  getNetworkInterfacesList,
  getLocalIP
};
