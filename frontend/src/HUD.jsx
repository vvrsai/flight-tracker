import React, { useEffect, useState } from 'react';

const css = `
  .hud-panel {
    position: absolute;
    z-index: 1000;
    background: rgba(6, 10, 20, 0.88);
    border: 1px solid rgba(0, 255, 136, 0.18);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-family: 'Barlow', sans-serif;
    animation: fadeIn 0.4s ease;
  }
  .hud-topleft {
    top: 16px; left: 16px;
    min-width: 230px;
    border-radius: 4px;
    overflow: hidden;
  }
  .hud-title-bar {
    background: rgba(0,255,136,0.06);
    border-bottom: 1px solid rgba(0,255,136,0.15);
    padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .radar-icon {
    width: 28px; height: 28px;
    position: relative; flex-shrink: 0;
  }
  .radar-ring {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(0,255,136,0.4);
  }
  .radar-sweep {
    position: absolute; top: 50%; left: 50%;
    width: 50%; height: 1px;
    transform-origin: 0% 50%;
    background: linear-gradient(to right, #00ff88, transparent);
    animation: sweep 2s linear infinite;
  }
  .radar-center {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 4px; height: 4px; border-radius: 50%;
    background: #00ff88; box-shadow: 0 0 4px #00ff88;
  }
  .hud-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 700;
    letter-spacing: 3px; color: #00ff88; text-transform: uppercase;
  }
  .hud-subtitle {
    font-size: 9px; color: rgba(0,255,136,0.45);
    letter-spacing: 1.5px; font-family: 'Share Tech Mono', monospace; margin-top: 1px;
  }
  .hud-stats {
    padding: 8px 14px 10px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  }
  .stat-cell { display: flex; flex-direction: column; gap: 1px; }
  .stat-label {
    font-size: 8px; letter-spacing: 1px; text-transform: uppercase;
    color: rgba(112,144,176,0.8); font-weight: 500;
  }
  .stat-value { font-family: 'Share Tech Mono', monospace; font-size: 16px; color: #e8f4ff; line-height: 1; }
  .stat-value.green { color: #00ff88; }
  .stat-value.amber { color: #ffaa00; }

  .hud-statusbar {
    top: 16px; left: 16px;
    margin-top: 130px;
  }

  .hud-legend {
    bottom: 48px; left: 16px;
    border-radius: 4px;
    padding: 8px 12px;
    display: flex; flex-direction: column; gap: 5px;
  }
  .legend-item {
    display: flex; align-items: center; gap: 7px;
    font-size: 10px; color: rgba(200,220,240,0.6);
    font-family: 'Share Tech Mono', monospace;
  }
  .legend-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  .hud-bottom {
    bottom: 0; left: 0; right: 0;
    border-radius: 0; border-left: none; border-right: none; border-bottom: none;
    padding: 5px 14px;
    display: flex; align-items: center; gap: 16px;
    font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(112,144,176,0.6);
  }
  .bottom-sep { flex: 1; }
  .bottom-accent { color: rgba(0,255,136,0.5); }

  .status-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 10px; border-radius: 20px;
    font-family: 'Share Tech Mono', monospace; font-size: 10px;
    color: rgba(200,220,240,0.7);
  }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .status-dot.live    { background:#00ff88; box-shadow:0 0 5px #00ff88; animation:blink 1.5s ease-in-out infinite; }
  .status-dot.loading { background:#ffaa00; box-shadow:0 0 5px #ffaa00; animation:blink 0.6s ease-in-out infinite; }
  .status-dot.error   { background:#ff3355; box-shadow:0 0 5px #ff3355; }

  .error-banner {
    position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
    z-index: 1000; background: rgba(255,51,85,0.12);
    border: 1px solid rgba(255,51,85,0.4); border-radius: 4px;
    padding: 7px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px;
    color: #ff3355; display: flex; align-items: center; gap: 8px;
    animation: fadeIn 0.3s ease; white-space: nowrap;
  }
  .scanline {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(to bottom, transparent, rgba(0,255,136,0.04), transparent);
    pointer-events: none; animation: scanline 4s linear infinite; z-index: 999;
  }
`;

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  const p = n => String(n).padStart(2, '0');
  return <span style={{ color: 'rgba(0,255,136,0.55)', marginLeft: '6px' }}>
    {p(t.getUTCHours())}:{p(t.getUTCMinutes())}:{p(t.getUTCSeconds())} UTC
  </span>;
}

export default function HUD({ flightCount, loading, error, lastUpdate }) {
  const st = error ? 'error' : loading ? 'loading' : 'live';
  const lb = error ? 'SIGNAL LOST' : loading ? 'ACQUIRING' : 'LIVE';

  return (
    <>
      <style>{css}</style>
      <div className="scanline" />

      {/* Top-left info panel */}
      <div className="hud-panel hud-topleft">
        <div className="hud-title-bar">
          <div className="radar-icon">
            <div className="radar-ring" />
            <div className="radar-sweep" />
            <div className="radar-center" />
          </div>
          <div>
            <div className="hud-title">SkyTrack</div>
            <div className="hud-subtitle">LIVE FLIGHT RADAR</div>
          </div>
        </div>
        <div className="hud-stats">
          <div className="stat-cell">
            <span className="stat-label">Aircraft</span>
            <span className={`stat-value ${flightCount > 0 ? 'green' : ''}`}>{flightCount.toLocaleString()}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Status</span>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', paddingTop:'2px' }}>
              <div className={`status-dot ${st}`} />
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'11px', color: st==='live'?'#00ff88': st==='loading'?'#ffaa00':'#ff3355' }}>{lb}</span>
            </div>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Refresh</span>
            <span className="stat-value amber" style={{fontSize:'12px',paddingTop:'3px'}}>5s</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">UTC</span>
            <Clock />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="hud-panel hud-legend" style={{ position:'absolute', bottom:'48px', left:'16px' }}>
        <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88',boxShadow:'0 0 4px #00ff88'}}/>Aircraft</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'#ffaa00',boxShadow:'0 0 4px #ffaa00'}}/>Selected Flight</div>
        <div className="legend-item"><div className="legend-dot" style={{background:'#4fc3f7',boxShadow:'0 0 4px #4fc3f7'}}/>Airport</div>
      </div>

      {/* Bottom bar */}
      <div className="hud-panel hud-bottom">
        <span><span className="bottom-accent">◆</span> OpenStreetMap · OpenSky Network</span>
        <span><span className="bottom-accent">◆</span> Data delayed ~15s</span>
        <div className="bottom-sep" />
        {lastUpdate && <span>UPDATED <span className="bottom-accent">{new Date(lastUpdate*1000).toLocaleTimeString()}</span></span>}
      </div>

      {error && (
        <div className="error-banner"><span>⚠</span><span>{error}</span></div>
      )}
    </>
  );
}
