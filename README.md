# fleet-osc-server

OSC-like UDP server for broadcasting ternary vector state. JavaScript implementation is functional; Python implementation is a 2-line stub.

## Problem

You have real-time agent state represented as ternary vectors (`[1, 0, -1, 1, ...]`). You want to stream this state to audio/visual tools that speak OSC (Sonic Pi, TouchDesigner, FoxDot, ORCA). You need a lightweight UDP server that accepts vectors and relays them to connected clients.

## Insight

OSC (Open Sound Control) is a UDP-based protocol used by most live-coding and visual tools. In practice, many "OSC" implementations just send JSON over UDP — it's simpler, works everywhere, and avoids the OSC binary format's complexity. This server takes that pragmatic approach: it's a UDP relay that sends JSON payloads, not a strict OSC-binary implementation.

The server maintains a set of connected clients (learned from incoming messages) and broadcasts to all of them. This is a hub-and-spoke model: one server, N clients, all receive every message.

## How It Works

```
Client sends UDP message (JSON) to server port 7000
  → Server parses JSON
  → Server records client address
  → Server broadcasts payload to all known clients

sendState(ternaryVector):
  → Computes density and balance from vector
  → Broadcasts {type: 'fleet_state', vector, density, balance, timestamp}
  → All connected clients receive it
```

The server auto-discovers clients: any UDP packet received registers the sender as a client. No explicit connect/disconnect protocol.

## Code

### JavaScript (`lib/osc.js`) — FUNCTIONAL

```javascript
const { OSCServer } = require('./lib/osc');

// Start server on port 7000
const server = new OSCServer(7000).start();

// Send a ternary vector state
server.sendState([1, 0, -1, 1, 0, -1, 1, 1]);
// Broadcasts to all clients:
// {
//   type: 'fleet_state',
//   vector: [1, 0, -1, 1, 0, -1, 1, 1],
//   density: 0.75,
//   balance: 0.25,
//   timestamp: 1717863600000
// }
```

The CLI demo (`node lib/osc.js`) starts the server and broadcasts the example vector every second.

### Python (`lib/osc-server.py`) — STUB

```python
# OSC implementation
# See THEORY.md for the deeper mathematics
```

Two comment lines. No code. `THEORY.md` does not exist in this repo.

## Module Map

```
lib/
  osc.js          — OSCServer class (functional)
                   Methods: constructor(port, host), start(), broadcast(data), sendState(vector)
  osc-server.py   — 2-line comment stub (no executable code)
```

## Design Decisions

### What was chosen (JavaScript)

- **JSON over UDP, not OSC binary.** Pragmatic choice. Easier to debug (readable payloads), works with any UDP listener without an OSC parser. Strict OSC tools would need a translation layer.
- **Auto-discovery of clients.** Any incoming UDP message registers the sender. No handshake, no protocol overhead. Simple but means stale clients accumulate (no disconnect detection).
- **Set-based client tracking.** Clients stored in a `Set` of `address:port` strings. Works for small numbers of clients. Would need cleanup for long-running sessions.
- **Separate `sendState()` from `broadcast()`.** `sendState()` adds fleet-specific metadata (density, balance, timestamp). `broadcast()` sends raw data. Good separation — you can send arbitrary JSON via `broadcast()` or use the structured format via `sendState()`.

### What was NOT chosen (Python)

Nothing. The Python file is a stub with two comment lines and a reference to a nonexistent `THEORY.md`.

### Known limitations

1. **Not real OSC.** The protocol is JSON-over-UDP, not the OSC binary format. Sonic Pi, FoxDot, and TouchDesigner all have OSC parsing built in, but they expect the binary format. This server would need a proper OSC encoder to work with them directly. The JSON payloads are human-readable but not OSC-compatible.

2. **No client cleanup.** Clients are added to the set but never removed. A client that disconnects is still in the broadcast list. `server.send()` will silently fail for dead clients (UDP is fire-and-forget), so this doesn't crash anything, but it wastes bandwidth.

3. **No message validation.** `JSON.parse()` is in a try/catch that silently swallows malformed input. No error logging, no feedback to sender.

4. **Density/balance computed client-side.** `sendState()` recomputes density and balance from the vector. If the server is downstream of fleet-midi-bridge (which already computes these), it's redundant work.

5. **README is corrupted.** The README.md content is mangled — repeated `** [sonicpi](...)` lines, broken formatting, no coherent documentation.

6. **Python stub is misleading.** The file exists but does nothing. Anyone looking for a Python OSC implementation will find two comment lines and a reference to a file that doesn't exist.

### What this is not

- Not a proper OSC server (wrong wire format).
- Not a Python library (stub only).
- Not production-ready for any real-time audio work (no client cleanup, no validation, no reconnect).

## Status

**JavaScript: functional prototype.** The `OSCServer` class works as a UDP JSON relay. It starts, accepts messages, tracks clients, and broadcasts. The `sendState()` method adds useful fleet-specific metadata. For local development and testing, it works.

**Python: nonexistent.** Two comment lines. Not usable.

**README: broken.** Needs a complete rewrite (done in this review).

**No tests.** Neither language has tests.

**No dependencies declared.** The JS code uses Node.js `dgram` (built-in) and no npm packages. No `package.json`. The Python stub has no dependencies because it has no code.
