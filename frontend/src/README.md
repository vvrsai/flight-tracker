# SkyTrack — Live Flight Radar

A real-time full-stack flight tracking application powered by the **OpenSky Network** free API, rendered on an interactive **OpenStreetMap** using **React + Flask**.

```
┌─────────────────────────────────────────────┐
│   Browser (React + react-leaflet)           │
│   ↕  GET /api/flights every 5s             │
│   Flask Backend                             │
│   ↕  GET opensky-network.org/api/states/all │
│   OpenSky Network (Free public API)         │
└─────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool       | Version |
|------------|---------|
| Python     | 3.8+    |
| Node.js    | 18+     |
| npm        | 9+      |

---

## Quick Start

```bash
chmod +x start.sh
./start.sh
```

Then open **http://localhost:3000** in your browser.

---

## Manual Setup

### Backend (Flask)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Running on http://localhost:5000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## Project Structure

```
flight-tracker/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── vite.config.js      # Proxy /api → localhost:5000
│   └── src/
│       ├── main.jsx
│       ├── index.css       # Global styles + Leaflet overrides
│       ├── App.jsx         # Root component, data fetching, map
│       ├── HUD.jsx         # Tactical overlay UI
│       ├── FlightPopup.jsx # Aircraft detail popup
│       └── aircraftIcon.js # Dynamic SVG aircraft markers
├── start.sh                # One-command startup
└── README.md
```

---

## API Reference

### `GET /api/flights`

Returns current live flights from OpenSky Network.

**Response:**
```json
{
  "flights": [
    {
      "icao24": "a1b2c3",
      "callsign": "UAL123",
      "origin_country": "United States",
      "latitude": 40.71,
      "longitude": -74.00,
      "altitude_m": 10668.0,
      "altitude_ft": 35000.0,
      "velocity_ms": 245.0,
      "velocity_kmh": 882.0,
      "heading": 270.0,
      "on_ground": false
    }
  ],
  "count": 6823,
  "timestamp": 1712000000,
  "source_count": 7100
}
```

### `GET /api/health`

Health check endpoint.

---

## Architecture Decisions

### Performance
- Aircraft markers are capped at **3,000** (sorted by altitude — highest first for visibility)
- `React.memo` prevents re-rendering of unchanged markers on each poll cycle
- Leaflet's `preferCanvas: true` uses canvas rendering for better performance with many markers
- Invalid flights filtered server-side (null lat/lon, on-ground, negative altitude)

### Frontend Data Flow
```
useFlightData() hook
  → fetch every 5s
  → setFlights(sorted.slice(0, 3000))
  → AircraftMarker (memoized) re-renders only changed markers
```

### Icon System
- Custom SVG aircraft shape rotated to match heading
- Selected aircraft gets amber color + pulse ring animation
- Leaflet `DivIcon` allows full CSS/SVG control without image files

---

## Notes

- **OpenSky Network** is a free, community-run API — rate limits apply (anonymous: ~100 requests/day, registered: ~400/day)
- Data is delayed by ~10–15 seconds per their policy
- No authentication required for basic access
- For higher limits, register at https://opensky-network.org/

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, react-leaflet, Leaflet    |
| Map tiles | OpenStreetMap                       |
| Backend   | Flask, flask-cors, requests         |
| Data      | OpenSky Network REST API            |
| Build     | Vite 5                              |
| Fonts     | Barlow, Barlow Condensed, Share Tech Mono |
