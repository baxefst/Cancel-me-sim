# Cancel Me Simulator

> Feed it a statement. Watch the internet destroy it.

<img width="1280" height="680" alt="ScreenRecording2026-04-19150224-ezgif com-video-to-gif-converter (1)" src="https://github.com/user-attachments/assets/ea4a4511-ff2b-4020-b411-f9c58e2772cd" />



---

## The Concept

Every statement you make online gets processed by a invisible machine of human behavior patterns. Stans defend. Bots amplify. The Outraged activate without reading. The Journalist writes the Substack. The Ratio Vulture arrives when you're already losing.

This simulator makes that machine visible.

---

## Demo

| Round | What Happens |
|-------|-------------|
| **1 — The Quiet** | 40 nodes drift in dark water. Peaceful. Not for long. |
| **2 — Clustering** | Stan loyalists find each other. Gravitational pull increases. |
| **3 — Bot Injection** | 100 bots materialize as a frozen 10×10 grid. Hold for 600ms. Then explode into physics. |
| **4 — Outrage Cascade** | The hub node appears. Normies physically flee the void it creates. |
| **5 — Peak Chaos** | `simulation.alpha(1.0).restart()` — the swarm goes violent. Canvas shakes. Scanlines overload. |
| **6 — The Freeze** | Everything stops. Everything goes grey. Only Outraged and Journalist nodes keep their color. Only the noise remains. |

---

## The 12 Internet Personas

| Persona | Color | The Real Behavior |
|---------|-------|-------------------|
| **Stan** | `#FF007A` | Parasocial loyalist. Their identity IS the fandom. Will die on this hill. Travels in packs. Never reads the full thread. |
| **BotFarm** | `#00FF41` | Not a person. A weapon. Floods the zone with noise until the signal is buried. Spawns as a rigid geometric wall. |
| **Outraged** | `#FF4500` | Perpetually activated. Doesn't need context — the headline was enough. Shares before reading. Screenshots without links. |
| **Journalist** | `#FBBF24` | Bridge node. Watches the chaos academically then drops a 3000-word Substack. Quote-tweets with "this is important." |
| **Normie** | `#888888` | Just here. Mild opinions. Slightly confused. Will log off and touch grass. The background radiation of the internet. |
| **CloutChaser** | `#A855F7` | Arrived 4 hours late. Doesn't care about the issue. Cares about the engagement. Will switch sides if the wind changes. |
| **ReplyGuy** | `#06B6D4` | Under every single post. Every. Single. One. Has a "well actually." Has been muted by 60% of his following. |
| **IronyPoisoned** | `#84CC16` | Can't tell if they're serious. They can't either. Uses memes as emotional armor. Vibes are chaotic neutral, damage is chaotic evil. |
| **MainCharacter** | `#F97316` | This discourse is about them now. Somehow. Will post a 12-part thread about how they were affected. |
| **RatioVulture** | `#EF4444` | Circles dying tweets. Arrives specifically when someone is losing badly. Posts one word. A harbinger. |
| **TonePolice** | `#E2E8F0` | Doesn't care who's right. Cares that you're being mean about it. Appeared to derail the point with civility discourse. |
| **Contextualizer** | `#10B981` | Posts the thing everyone needed 6 hours ago. Has the receipts. Has the archived link. Gets 200 likes and 0 retweets. |

---

## Physics Engine

The simulation runs on three golden rules:

### Rule I — Tiered Link Strength
No global charge. Every connection has a purpose.
Stan → Hub          strength 1.0  distance 20   tight cluster
Bot  → Bot          strength 0.9  distance 35   rigid lattice
Outraged → Normie   REPULSION     -0.8          void formation
Journalist          strength 0.6  distance 70   bridge node
Default             strength 0.3  distance 60   open drift

### Rule II — The Birth Sequence
Nodes never spawn at `(0,0)`. Always center + small random offset.

Round 3 exception: BotFarm nodes spawn in a locked 10×10 grid formation. Physics engine is paused for 600ms so the wall is visible. Then released. The lattice deforms into chaos.

### Rule III — The Shake
Round 5 doesn't just shake the canvas. It calls:
```javascript
simulation.alpha(1.0).restart()
```
The swarm goes from settled to violent instantly. Canvas translates ±4px per frame. Scanlines flicker at 60ms intervals.

### Viscosity
```javascript
simulation.velocityDecay(0.6)  // high drag — dark water feel
simulation.alphaDecay(0.015)   // slow cooling — nothing resolves fast
```

---

## Node Intelligence

Click any node to open the intelligence panel:

- **Handle** — the node's internet identity
- **UUID** — full D3 simulation ID, selectable
- **Statement** — what this persona is saying
- **Connections** — every directly linked node, filterable by persona type
- **Metrics** — mass, radius, connection count, allegiance score, spawn time

Click any connection to jump to that node. Escape to close.

---

## AI Inference

Your statement is sent to Groq (Gemini 2.0 Flash as fallback) with a system prompt that returns:

```json
{
  "sentiment_vector": [valence, arousal, dominance, virality, toxicity],
  "persona_weights": {
    "Stan": 0.3,
    "BotFarm": 0.9,
    "Outraged": 0.8,
    "Journalist": 0.5,
    "Normie": 0.2,
    "CloutChaser": 0.6,
    "ReplyGuy": 0.4,
    "IronyPoisoned": 0.3,
    "MainCharacter": 0.7,
    "RatioVulture": 0.8,
    "TonePolice": 0.3,
    "Contextualizer": 0.2
  },
  "risk_score": 94,
  "risk_label": "EXTINCTION",
  "summary": "one sentence autopsy of your statement",
  "micro_replies": [
    "L + ratio",
    "I am literally shaking rn",
    "signal confirmed. share.",
    "thread incoming. buckle up.",
    "delete this before they find it",
    "lmao whatever I guess",
    "this is somehow about me",
    "this is why nobody listens to your side"
  ]
}
```

**BotFarm scaling law:**
risk_score 0–29   → BotFarm ≤ 0.20
risk_score 30–59  → BotFarm 0.20–0.50
risk_score 60–84  → BotFarm 0.50–0.80
risk_score 85–100 → BotFarm ≥ 0.90

`persona_weights` scales node spawn counts per round.
`sentiment_vector[2]` (dominance) determines node mass.
`sentiment_vector[3]` (virality) scales total node count.

---

## Tech Stack
Framework     Next.js 14+ App Router
Language      TypeScript strict mode, zero any types
Physics       D3-force simulation
Rendering     Canvas API — no SVG, ever
Styling       Tailwind CSS layout + inline CSS visuals
AI Primary    Groq — llama-3.3-70b-versatile
AI Fallback   Google Gemini 2.0 Flash
Export        html2canvas
Font          IBM Plex Mono — the only font
Deploy        Vercel

---

## Setup

**1. Clone and install**
```bash
git clone https://github.com/baxefst/Cancel-me-sim.git
cd Cancel-me-sim
npm install
```

**2. Run locally**
```bash
npm run dev
```
Open `http://localhost:3000`

**3. Add API keys**

Click the ⚙ gear icon in the top right corner.

| Key | Where to get it | Cost |
|-----|----------------|------|
| Groq API Key | [console.groq.com](https://console.groq.com) | Free |
| Google AI Key | [aistudio.google.com](https://aistudio.google.com) | Free |

Keys are stored in `localStorage` only. Never transmitted anywhere except directly to the AI APIs.

**4. Deploy to Vercel**
```bash
npx vercel --prod
```

No environment variables needed. Everything runs client-side.

---

## Project Structure
app/
layout.tsx          — CRT overlay, IBM Plex Mono, dark root
page.tsx            — State machine: idle → analyzing → simulating → report
globals.css         — Scanlines, vignette, keyframes, CRT aesthetic
components/
TerminalInput.tsx       — The input screen
NetworkCanvas.tsx       — D3 simulation + Canvas draw loop
SimulationController.tsx — 6-round orchestrator
NodeIntelligence.tsx    — Click panel with connections + metrics
NodeTooltip.tsx         — Hover tooltip
ThreatReport.tsx        — Round 6 analysis panel + export
LogOverlay.tsx          — Terminal log messages
SettingsModal.tsx       — API key management
lib/
ai.ts               — Groq + Gemini inference + fallback logic
personas.ts         — 12 persona configs + node/link generators
types/
index.ts            — All TypeScript interfaces, zero any

---

## The Threat Report

After Round 6 freezes the simulation, a panel slides up with:

- **Risk label** — LOW / MEDIUM / HIGH / CRITICAL / EXTINCTION
- **Three progress bars** — Outrage Index, Logic Coherence, Absurdity Factor
- **Assessment** — one sentence summary with typewriter effect
- **Live feed** — 8 raw internet micro-replies from the AI
- **Export** — downloads a PNG with CANCELLED watermark in a 3×3 grid

---

## Risk Labels

| Score | Label | What it means |
|-------|-------|---------------|
| 0–20 | `LOW` | You're fine. Probably. |
| 21–40 | `MEDIUM` | Someone is writing a thread. |
| 41–65 | `HIGH` | The Journalist has a Google Doc open. |
| 66–85 | `CRITICAL` | BotFarm has your name. |
| 86–100 | `EXTINCTION` | It's over. The Ratio Vultures are circling. |

---

## Contributing

Issues and PRs welcome.

If you find a statement that produces a particularly unhinged simulation, open a Discussion and share it.

Known issues being worked on:
- Stan cluster formation inconsistency
- Bot grid wall timing on slower devices
- Round 6 dual-canvas desaturation edge cases

---

## License

MIT
