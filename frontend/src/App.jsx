import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createAircraftIcon, createAirportIcon } from './aircraftIcon';
import FlightPopup from './FlightPopup';
import FlightDetailPanel from './FlightDetailPanel';
import AirportPanel from './AirportPanel';
import HUD from './HUD';

const FETCH_INTERVAL = 5000;
const MAX_MARKERS    = 3000;

// ── Data hooks ────────────────────────────────────────────────────────────────

function useFlightData() {
  const [flights,    setFlights]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetch_ = useCallback(async (initial = false) => {
    try {
      const res  = await fetch('/api/flights');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const sorted = [...(data.flights||[])].sort((a,b)=>(b.altitude_m||0)-(a.altitude_m||0));
      setFlights(sorted.slice(0, MAX_MARKERS));
      setLastUpdate(data.timestamp || null);
      setError(null);
    } catch(e) {
      setError(e.message || 'Failed to fetch flights');
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_(true);
    const id = setInterval(() => fetch_(), FETCH_INTERVAL);
    return () => clearInterval(id);
  }, [fetch_]);

  return { flights, loading, error, lastUpdate };
}

function useAirports() {
  const [airports, setAirports] = useState([]);
  useEffect(() => {
    fetch('/api/airports')
      .then(r => r.json())
      .then(d => setAirports(d.airports || []))
      .catch(() => {});
  }, []);
  return airports;
}

// ── Map helpers ───────────────────────────────────────────────────────────────

function MapFlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 5), { duration: 1.2 });
  }, [target, map]);
  return null;
}

// Great-circle path: intermediate points between two coords
function gcPoints(lat1, lon1, lat2, lon2, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const f  = i / steps;
    const d  = Math.PI * Math.sqrt((lat2-lat1)**2 + (lon2-lon1)**2) / 180;
    const A  = Math.sin((1-f)*d) / Math.sin(d || 1e-9);
    const B  = Math.sin(f*d)     / Math.sin(d || 1e-9);
    const x  = A*Math.cos(lat1*Math.PI/180)*Math.cos(lon1*Math.PI/180)
              + B*Math.cos(lat2*Math.PI/180)*Math.cos(lon2*Math.PI/180);
    const y  = A*Math.cos(lat1*Math.PI/180)*Math.sin(lon1*Math.PI/180)
              + B*Math.cos(lat2*Math.PI/180)*Math.sin(lon2*Math.PI/180);
    const z  = A*Math.sin(lat1*Math.PI/180) + B*Math.sin(lat2*Math.PI/180);
    pts.push([
      Math.atan2(z, Math.sqrt(x*x+y*y)) * 180/Math.PI,
      Math.atan2(y, x) * 180/Math.PI,
    ]);
  }
  return pts;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const AircraftMarker = React.memo(function AircraftMarker({ flight, selected, onSelect }) {
  return (
    <Marker
      position={[flight.latitude, flight.longitude]}
      icon={createAircraftIcon(flight.heading || 0, selected)}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(flight) }}
    >
      <Popup><FlightPopup flight={flight} /></Popup>
    </Marker>
  );
});

function AirportMarker({ airport, selected, onSelect }) {
  return (
    <>
      {/* Glowing radius ring */}
      <Circle
        center={[airport.lat, airport.lon]}
        radius={selected ? 80000 : 45000}
        pathOptions={{
          color:       selected ? '#ffaa00' : '#4fc3f7',
          fillColor:   selected ? '#ffaa00' : '#4fc3f7',
          fillOpacity: selected ? 0.08 : 0.04,
          weight:      selected ? 1.5 : 1,
          opacity:     selected ? 0.7 : 0.35,
          dashArray:   '4 6',
        }}
      />
      <Marker
        position={[airport.lat, airport.lon]}
        icon={createAirportIcon(selected)}
        zIndexOffset={selected ? 900 : 100}
        eventHandlers={{ click: () => onSelect(airport) }}
      >
        <Popup>
          <div style={{
            minWidth: '160px', fontFamily: "'Barlow', sans-serif",
            background: 'rgba(6,10,20,0.95)', padding: '0',
          }}>
            <div style={{
              background:'rgba(79,195,247,0.08)', borderBottom:'1px solid rgba(79,195,247,0.2)',
              padding:'8px 12px',
            }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'20px', fontWeight:700, color:'#4fc3f7', letterSpacing:'2px' }}>
                {airport.iata}
              </div>
              <div style={{ fontSize:'11px', color:'rgba(200,220,240,0.8)', marginTop:'2px' }}>{airport.name}</div>
            </div>
            <div style={{ padding:'8px 12px 10px' }}>
              <div style={{ fontSize:'10px', color:'rgba(112,144,176,0.7)', fontFamily:"'Share Tech Mono',monospace" }}>
                {airport.city}, {airport.country}
              </div>
              <div style={{ fontSize:'9px', color:'rgba(79,195,247,0.4)', marginTop:'4px', letterSpacing:'0.8px' }}>
                Click to view flight board
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

function FlightPath({ pathData }) {
  if (!pathData?.path || pathData.path.length < 2) return null;

  const pts = pathData.path;
  const segments = [];

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i+1];
    const gc = gcPoints(a.lat, a.lon, b.lat, b.lon);
    const isPast   = a.type === 'origin'  || b.type === 'current';
    const isFuture = a.type === 'current' || b.type === 'destination';

    segments.push(
      <Polyline
        key={i}
        positions={gc}
        pathOptions={{
          color:    isPast ? 'rgba(0,255,136,0.5)' : 'rgba(255,170,0,0.55)',
          weight:   isPast ? 1.5 : 2,
          dashArray: isPast ? '4 6' : '6 4',
          opacity:   1,
        }}
      />
    );
  }

  return <>{segments}</>;
}

function LoadingOverlay() {
  return (
    <div style={{
      position:'absolute', inset:0, zIndex:2000,
      background:'radial-gradient(ellipse at center, #050810 60%, #080c18)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'24px',
      fontFamily:"'Share Tech Mono',monospace",
    }}>
      <div style={{ position:'relative', width:'110px', height:'110px' }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            position:'absolute', inset:`${i*14}px`, borderRadius:'50%',
            border:`1px solid rgba(0,255,136,${0.5-i*0.12})`,
          }}/>
        ))}
        <div style={{
          position:'absolute', top:'50%', left:'50%', width:'50%', height:'2px',
          transformOrigin:'0 50%', transform:'translateY(-50%)',
          background:'linear-gradient(to right,#00ff88,transparent)',
          animation:'sweep 1.5s linear infinite',
        }}/>
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'5px', height:'5px', borderRadius:'50%',
          background:'#00ff88', boxShadow:'0 0 8px #00ff88',
        }}/>
      </div>
      <div style={{color:'#00ff88', fontSize:'13px', letterSpacing:'3px', textTransform:'uppercase'}}>
        Acquiring Signal
      </div>
      <div style={{color:'rgba(0,255,136,0.4)', fontSize:'10px', letterSpacing:'2px', animation:'blink 1.2s ease-in-out infinite'}}>
        Connecting to OpenSky Network...
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { flights, loading, error, lastUpdate } = useFlightData();
  const airports = useAirports();

  const [selectedFlight,  setSelectedFlight]  = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [pathData,        setPathData]        = useState(null);
  const [pathLoading,     setPathLoading]     = useState(false);
  const [airportData,     setAirportData]     = useState(null);
  const [airportLoading,  setAirportLoading]  = useState(false);
  const [flyTarget,       setFlyTarget]       = useState(null);

  // Select a flight → load path, open side panel
  const handleFlightSelect = useCallback(async (flight) => {
    setSelectedAirport(null);
    setAirportData(null);

    if (selectedFlight?.icao24 === flight.icao24) {
      setSelectedFlight(null);
      setPathData(null);
      return;
    }

    setSelectedFlight(flight);
    setPathData(null);
    setPathLoading(true);
    setFlyTarget([flight.latitude, flight.longitude]);

    try {
      const res  = await fetch(`/api/flight-path/${flight.icao24}`);
      const data = await res.json();
      setPathData(data);
    } catch {
      setPathData(null);
    } finally {
      setPathLoading(false);
    }
  }, [selectedFlight]);

  // Select an airport → load board
  const handleAirportSelect = useCallback(async (airport) => {
    setSelectedFlight(null);
    setPathData(null);

    if (selectedAirport?.icao === airport.icao) {
      setSelectedAirport(null);
      setAirportData(null);
      return;
    }

    setSelectedAirport(airport);
    setAirportData(null);
    setAirportLoading(true);
    setFlyTarget([airport.lat, airport.lon]);

    try {
      const res  = await fetch(`/api/airport/${airport.icao}`);
      const data = await res.json();
      setAirportData(data);
    } catch {
      setAirportData(null);
    } finally {
      setAirportLoading(false);
    }
  }, [selectedAirport]);

  const closeAll = useCallback(() => {
    setSelectedFlight(null);
    setSelectedAirport(null);
    setPathData(null);
    setAirportData(null);
  }, []);

  return (
    <div style={{ position:'relative', width:'100vw', height:'100vh', overflow:'hidden' }}>
      {loading && <LoadingOverlay />}

      <MapContainer
        center={[20, 0]} zoom={3}
        style={{ width:'100%', height:'100%' }}
        zoomControl={true}
        attributionControl={true}
        preferCanvas={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapFlyTo target={flyTarget} />

        {/* Flight path polyline */}
        {pathData && <FlightPath pathData={pathData} />}

        {/* Airport markers */}
        {airports.map(ap => (
          <AirportMarker
            key={ap.icao}
            airport={ap}
            selected={selectedAirport?.icao === ap.icao}
            onSelect={handleAirportSelect}
          />
        ))}

        {/* Aircraft markers */}
        {flights.map(f => (
          <AircraftMarker
            key={f.icao24}
            flight={f}
            selected={selectedFlight?.icao24 === f.icao24}
            onSelect={handleFlightSelect}
          />
        ))}
      </MapContainer>

      {/* HUD overlay (top-left) */}
      <HUD
        flightCount={flights.length}
        loading={loading}
        error={error}
        lastUpdate={lastUpdate}
      />

      {/* Flight detail side panel (right) */}
      {selectedFlight && (
        <FlightDetailPanel
          flight={selectedFlight}
          pathData={pathData}
          pathLoading={pathLoading}
          onClose={closeAll}
        />
      )}

      {/* Airport board side panel (right) */}
      {(selectedAirport || airportLoading) && (
        <AirportPanel
          data={airportData}
          loading={airportLoading}
          onClose={closeAll}
        />
      )}
    </div>
  );
}
