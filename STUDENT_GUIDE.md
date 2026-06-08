# Student Guide to fleet-osc-server

## What is this?

Real-time OSC bridge for agent state→audio.```bash\necho '[1,0,-1,1]' | nc -u localhost 57120```

## Why does it matter in the fleet?

All 15 MIDI fleet repos connect through the ternary⇄music bridge. This repo
handles one specific aspect of that bridge. Start here, explore outward.

## Next Steps

After understanding this repo, explore:
- fleet-ternary-music (the core theory)
- fleet-midi-text2midi (text→MIDI using this theory)
- fleet-music-theorist (analyze what you build)
