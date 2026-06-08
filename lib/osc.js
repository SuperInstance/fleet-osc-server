#!/usr/bin/env node
/** OSC Server — real-time agent state streaming.

Receives ternary vectors and sends them as OSC messages.
TouchDesigner, Sonic Pi, FoxDot, and ORCA all accept OSC natively.
*/
const dgram = require('dgram');

class OSCServer {
  constructor(port = 7000, host = '0.0.0.0') {
    this.port = port;
    this.host = host;
    this.server = dgram.createSocket('udp4');
    this.clients = new Set();
    
    this.server.on('message', (msg, rinfo) => {
      this.clients.add(`${rinfo.address}:${rinfo.port}`);
      try {
        const data = JSON.parse(msg.toString());
        this.broadcast(data);
      } catch(e) {}
    });
  }

  start() {
    this.server.bind(this.port, this.host);
    console.log(`📡 OSC Server on :${this.port}`);
    return this;
  }

  broadcast(data) {
    const msg = Buffer.from(JSON.stringify(data));
    this.clients.forEach(client => {
      const [host, port] = client.split(':');
      this.server.send(msg, 0, msg.length, parseInt(port), host);
    });
  }

  sendState(ternaryVector) {
    const density = ternaryVector.filter(v => v !== 0).length / ternaryVector.length;
    const balance = (ternaryVector.filter(v => v === 1).length -
                     ternaryVector.filter(v => v === -1).length) / ternaryVector.length;
    
    this.broadcast({
      type: 'fleet_state',
      vector: ternaryVector,
      density,
      balance,
      timestamp: Date.now()
    });
  }
}

module.exports = { OSCServer };

if (require.main === module) {
  const server = new OSCServer().start();
  setInterval(() => {
    const vec = [1, 0, -1, 1, 0, -1, 1, 1];
    server.sendState(vec);
  }, 1000);
}
