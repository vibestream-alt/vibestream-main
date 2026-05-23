const { WebSocketServer } = require('ws');

// Use port 8080 or environment variable
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`==================================================`);
console.log(`   Vibestream WebSocket Chat Server running       `);
console.log(`   URL: ws://localhost:${PORT}                    `);
console.log(`==================================================`);

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[${new Date().toLocaleTimeString()}] Ny deltagare ansluten från IP: ${ip}`);

  ws.on('message', (message) => {
    try {
      // Parse to ensure it's valid JSON
      const data = JSON.parse(message);
      console.log(`[${new Date().toLocaleTimeString()}] Meddelande från ${data.username}: "${data.text || data.icon || ''}"`);

      // Broadcast the message payload to all connected clients
      const broadcastPayload = JSON.stringify(data);
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // 1 = OPEN
          client.send(broadcastPayload);
        }
      });
    } catch (err) {
      console.error('Kunde inte parsa eller vidarebefordra meddelande:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] Deltagare kopplade ifrån.`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket-fel:', err);
  });
});
