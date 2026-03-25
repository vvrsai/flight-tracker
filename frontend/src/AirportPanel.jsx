import React, { useState } from 'react';

const STATUS_COLOR = {
  'Arrived':   '#00ff88',
  'Departed':  '#00ff88',
  'Landing':   '#4fc3f7',
  'Taxiing':   '#4fc3f7',
  'Boarding':  '#ffaa00',
  'Expected':  '#ffaa00',
  'Scheduled': 'rgba(200,220,240,0.5)',
};

const s = {
  panel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    bottom: '40px',
    width: '320px',
    zIndex: 1000,
    background: 'rgba(6,10,20,0.95)',
    border: '1px solid rgba(79,195,247,0.3)',
    borderRadius: '6px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.25s ease',
    fontFamily: "'Barlow', sans-serif",
    boxShadow: '0 0 30px rgba(79,195,247,0.06), 0 8px 32px rgba(0,0,0,0.6)',
  },
  header: {
    background: 'rgba(79,195,247,0.07)',
    borderBottom: '1px solid rgba(79,195,247,0.15)',
    padding: '12px 14px 10px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  iata: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '26px',
    fontWeight: 700,
    color: '#4fc3f7',
    letterSpacing: '3px',
    lineHeight: 1,
  },
  airportName: {
    fontSize: '11px',
    color: 'rgba(200,220,240,0.8)',
    marginTop: '3px',
    fontWeight: 500,
  },
  city: {
    fontSize: '10px',
    color: 'rgba(112,144,176,0.6)',
    fontFamily: "'Share Tech Mono', monospace",
    marginTop: '1px',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid rgba(79,195,247,0.2)',
    color: 'rgba(79,195,247,0.6)',
    borderRadius: '3px',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(79,195,247,0.1)',
    flexShrink: 0,
  },
  tab: (active) => ({
    flex: 1,
    padding: '8px 0',
    background: active ? 'rgba(79,195,247,0.08)' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #4fc3f7' : '2px solid transparent',
    color: active ? '#4fc3f7' : 'rgba(112,144,176,0.6)',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  list: {
    flex: 1,
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderBottom: '1px solid rgba(79,195,247,0.05)',
    gap: '10px',
    transition: 'background 0.1s',
    cursor: 'default',
  },
  rowHover: {
    background: 'rgba(79,195,247,0.04)',
  },
  statusDot: (status) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: STATUS_COLOR[status] || 'rgba(200,220,240,0.3)',
    flexShrink: 0,
    boxShadow: `0 0 4px ${STATUS_COLOR[status] || 'transparent'}`,
  }),
  callsign: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#e8f4ff',
    minWidth: '72px',
  },
  airport: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    color: 'rgba(112,144,176,0.7)',
    flex: 1,
  },
  time: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    color: 'rgba(200,220,240,0.5)',
    minWidth: '46px',
    textAlign: 'right',
  },
  statusBadge: (status) => ({
    fontSize: '9px',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    color: STATUS_COLOR[status] || 'rgba(200,220,240,0.3)',
    minWidth: '60px',
    textAlign: 'right',
    fontFamily: "'Share Tech Mono', monospace",
  }),
  empty: {
    padding: '24px 14px',
    color: 'rgba(112,144,176,0.4)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    textAlign: 'center',
  },
  loading: {
    padding: '20px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(79,195,247,0.5)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    justifyContent: 'center',
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '1px solid rgba(79,195,247,0.2)',
    borderTop: '1px solid #4fc3f7',
    borderRadius: '50%',
    animation: 'sweep 0.8s linear infinite',
    flexShrink: 0,
  },
};

function fmtTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function FlightRow({ flight }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...s.row, ...(hovered ? s.rowHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.statusDot(flight.status)} />
      <span style={s.callsign}>{flight.callsign}</span>
      <span style={s.airport}>{flight.estOrigin || '—'}</span>
      <span style={s.time}>{fmtTime(flight.time)}</span>
      <span style={s.statusBadge(flight.status)}>{flight.status}</span>
    </div>
  );
}

export default function AirportPanel({ data, loading, onClose }) {
  const [tab, setTab] = useState('arrivals');

  if (!data && !loading) return null;

  const airport    = data?.airport;
  const arrivals   = data?.arrivals   || [];
  const departures = data?.departures || [];
  const list       = tab === 'arrivals' ? arrivals : departures;

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.iata}>{airport?.iata || '...'}</div>
          <div style={s.airportName}>{airport?.name}</div>
          <div style={s.city}>{airport?.city}, {airport?.country} · {airport?.icao}</div>
        </div>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(tab === 'arrivals')}   onClick={() => setTab('arrivals')}>
          ↓ Arrivals ({arrivals.length})
        </button>
        <button style={s.tab(tab === 'departures')} onClick={() => setTab('departures')}>
          ↑ Departures ({departures.length})
        </button>
      </div>

      {/* Table header */}
      {!loading && list.length > 0 && (
        <div style={{
          display: 'flex', padding: '4px 14px',
          borderBottom: '1px solid rgba(79,195,247,0.08)',
          background: 'rgba(79,195,247,0.03)',
          flexShrink: 0,
        }}>
          {['Flight','Route','Time','Status'].map(h => (
            <span key={h} style={{
              fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase',
              color: 'rgba(79,195,247,0.35)',
              fontFamily: "'Share Tech Mono', monospace",
              flex: h==='Flight'?'0 0 82px' : h==='Route'?1 : h==='Time'?'0 0 46px':'0 0 60px',
              textAlign: h==='Time'||h==='Status' ? 'right' : 'left',
            }}>{h}</span>
          ))}
        </div>
      )}

      {/* List */}
      <div style={s.list}>
        {loading ? (
          <div style={s.loading}>
            <div style={s.spinner} /> Loading flight board...
          </div>
        ) : list.length === 0 ? (
          <div style={s.empty}>No {tab} data available</div>
        ) : (
          list.map((f, i) => <FlightRow key={i} flight={f} />)
        )}
      </div>
    </div>
  );
}
