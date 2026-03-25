import React from 'react';

export default function FlightPopup({ flight }) {
  const { callsign, icao24, origin_country, altitude_ft, velocity_kmh, heading } = flight;
  const fmt = (v, u='') => v != null ? `${Number(v).toLocaleString()}${u}` : '—';

  return (
    <div style={{ minWidth: '180px', fontFamily: "'Barlow', sans-serif" }}>
      <div style={{
        background: 'rgba(255,170,0,0.08)',
        borderBottom: '1px solid rgba(255,170,0,0.2)',
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#ffaa00', boxShadow: '0 0 5px #ffaa00',
          animation: 'blink 1.5s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '16px', fontWeight: 700, color: '#ffaa00',
          letterSpacing: '2px',
        }}>{callsign}</span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px', color: 'rgba(255,170,0,0.4)', marginLeft: 'auto',
        }}>{(icao24||'').toUpperCase()}</span>
      </div>
      <div style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[
          ['Country',  origin_country],
          ['Altitude', fmt(altitude_ft, ' ft')],
          ['Speed',    fmt(velocity_kmh, ' km/h')],
          ['Heading',  heading != null ? `${heading}°` : '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(120,160,200,0.7)', fontWeight: 500 }}>{label}</span>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#e8f4ff' }}>{value}</span>
          </div>
        ))}
        <div style={{ marginTop: '4px', fontSize: '9px', color: 'rgba(255,170,0,0.5)', textAlign: 'center', letterSpacing: '0.8px' }}>
          Click to open detail panel
        </div>
      </div>
    </div>
  );
}
