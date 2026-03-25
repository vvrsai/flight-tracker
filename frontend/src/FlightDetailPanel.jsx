import React from 'react';

const s = {
  panel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    bottom: '40px',
    width: '300px',
    zIndex: 1000,
    background: 'rgba(6,10,20,0.94)',
    border: '1px solid rgba(0,255,136,0.25)',
    borderRadius: '6px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.25s ease',
    fontFamily: "'Barlow', sans-serif",
    boxShadow: '0 0 30px rgba(0,255,136,0.08), 0 8px 32px rgba(0,0,0,0.6)',
  },
  header: {
    background: 'rgba(0,255,136,0.07)',
    borderBottom: '1px solid rgba(0,255,136,0.15)',
    padding: '12px 14px 10px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  callsign: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#ffaa00',
    letterSpacing: '2px',
  },
  icao: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: 'rgba(0,255,136,0.5)',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid rgba(0,255,136,0.2)',
    color: 'rgba(0,255,136,0.6)',
    borderRadius: '3px',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  sectionTitle: {
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'rgba(0,255,136,0.45)',
    fontFamily: "'Share Tech Mono', monospace",
    padding: '10px 14px 4px',
    borderBottom: '1px solid rgba(0,255,136,0.07)',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    padding: '8px 14px 10px',
    flexShrink: 0,
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '4px 0',
  },
  label: {
    fontSize: '9px',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: 'rgba(112,144,176,0.8)',
    fontWeight: 500,
  },
  value: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '14px',
    color: '#e8f4ff',
  },
  valueGreen: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '14px',
    color: '#00ff88',
  },
  pathSection: {
    flex: 1,
    overflow: 'auto',
    padding: '0 0 8px',
  },
  routeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px 14px',
    borderBottom: '1px solid rgba(0,255,136,0.05)',
  },
  routeDot: (type) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '3px',
    background: type === 'origin' ? 'rgba(0,255,136,0.6)'
               : type === 'destination' ? '#ffaa00'
               : '#4fc3f7',
    boxShadow: type === 'destination' ? '0 0 6px #ffaa00' : 'none',
  }),
  routeLabel: {
    fontSize: '9px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: 'rgba(112,144,176,0.7)',
  },
  routeName: {
    fontSize: '13px',
    color: '#e8f4ff',
    fontWeight: 500,
    marginTop: '1px',
  },
  routeSub: {
    fontSize: '10px',
    color: 'rgba(112,144,176,0.6)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  loadingPath: {
    padding: '16px 14px',
    color: 'rgba(0,255,136,0.4)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '1px solid rgba(0,255,136,0.2)',
    borderTop: '1px solid #00ff88',
    borderRadius: '50%',
    animation: 'sweep 0.8s linear infinite',
    flexShrink: 0,
  },
};

function RouteNode({ point }) {
  const label = point.type === 'origin' ? 'Origin'
              : point.type === 'destination' ? 'Destination'
              : 'Current Position';

  return (
    <div style={s.routeRow}>
      <div style={s.routeDot(point.type)} />
      <div>
        <div style={s.routeLabel}>{label}</div>
        {point.airport ? (
          <>
            <div style={s.routeName}>{point.airport.name}</div>
            <div style={s.routeSub}>{point.airport.iata} · {point.airport.city}, {point.airport.country}</div>
          </>
        ) : (
          <div style={s.routeName}>
            {point.lat.toFixed(2)}°, {point.lon.toFixed(2)}°
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightDetailPanel({ flight, pathData, pathLoading, onClose }) {
  if (!flight) return null;

  const fmt = (v, unit='') => v != null ? `${Number(v).toLocaleString()}${unit}` : '—';

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.callsign}>{flight.callsign}</div>
          <div style={s.icao}>{(flight.icao24 || '').toUpperCase()} · {flight.origin_country}</div>
        </div>
        <button style={s.closeBtn} onClick={onClose} title="Close">✕</button>
      </div>

      {/* Stats grid */}
      <div style={s.sectionTitle}>Flight Data</div>
      <div style={s.grid}>
        <div style={s.cell}>
          <span style={s.label}>Altitude</span>
          <span style={s.valueGreen}>{fmt(flight.altitude_ft)} ft</span>
        </div>
        <div style={s.cell}>
          <span style={s.label}>Speed</span>
          <span style={s.value}>{fmt(flight.velocity_kmh)} km/h</span>
        </div>
        <div style={s.cell}>
          <span style={s.label}>Heading</span>
          <span style={s.value}>{flight.heading != null ? `${flight.heading}°` : '—'}</span>
        </div>
        <div style={s.cell}>
          <span style={s.label}>Speed (m/s)</span>
          <span style={s.value}>{fmt(flight.velocity_ms)} m/s</span>
        </div>
        <div style={s.cell}>
          <span style={s.label}>Latitude</span>
          <span style={s.value}>{flight.latitude?.toFixed(4)}°</span>
        </div>
        <div style={s.cell}>
          <span style={s.label}>Longitude</span>
          <span style={s.value}>{flight.longitude?.toFixed(4)}°</span>
        </div>
      </div>

      {/* Route */}
      <div style={s.sectionTitle}>Estimated Route</div>
      <div style={s.pathSection}>
        {pathLoading ? (
          <div style={s.loadingPath}>
            <div style={s.spinner} />
            Calculating route...
          </div>
        ) : pathData?.path?.length > 0 ? (
          pathData.path.map((pt, i) => <RouteNode key={i} point={pt} />)
        ) : (
          <div style={{ ...s.loadingPath, color: 'rgba(112,144,176,0.5)' }}>
            Route data unavailable
          </div>
        )}
      </div>
    </div>
  );
}
