import L from 'leaflet';

/**
 * Creates a proper airplane-shaped icon rotated to heading.
 */
export function createAircraftIcon(heading = 0, selected = false) {
  const color     = selected ? '#ffaa00' : '#00ff88';
  const glowColor = selected ? 'rgba(255,170,0,0.6)' : 'rgba(0,255,136,0.5)';
  const size      = selected ? 28 : 22;

  // Realistic top-down airplane silhouette
  const planePath = `
    M12,2
    C12,2 13.5,5 13.5,8
    L20,11 L20,13 L13.5,11.5
    L13,17 L16,18.5 L16,20 L12,19
    L8,20 L8,18.5 L11,17
    L10.5,11.5 L4,13 L4,11
    L10.5,8 C10.5,5 12,2 12,2 Z
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${size}" height="${size}"
         viewBox="0 0 24 24"
         style="transform:rotate(${heading}deg);
                filter:drop-shadow(0 0 3px ${glowColor}) drop-shadow(0 0 6px ${glowColor});">
      <path d="${planePath}"
            fill="${color}"
            stroke="${selected ? 'rgba(255,170,0,0.3)' : 'rgba(0,255,136,0.2)'}"
            stroke-width="0.3"
            opacity="0.95"/>
    </svg>
  `;

  const pulse = selected ? `
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:40px;height:40px;border-radius:50%;
      border:1.5px solid ${color};
      animation:pulse-ring 1.2s ease-out infinite;
      pointer-events:none;opacity:0.7;
    "></div>
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:52px;height:52px;border-radius:50%;
      border:1px solid ${color};
      animation:pulse-ring 1.2s ease-out 0.3s infinite;
      pointer-events:none;opacity:0.4;
    "></div>
  ` : '';

  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      ${svg}
    </div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 6],
  });
}

export function createAirportIcon(selected = false) {
  const color = selected ? '#ffaa00' : '#4fc3f7';
  const size  = selected ? 30 : 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"
         style="filter:drop-shadow(0 0 4px ${color})">
      <!-- Tower -->
      <rect x="10.5" y="4" width="3" height="8" fill="${color}" rx="0.5" opacity="0.9"/>
      <!-- Control room -->
      <rect x="8" y="2" width="8" height="4" fill="${color}" rx="1" opacity="0.95"/>
      <!-- Base -->
      <rect x="9" y="12" width="6" height="2" fill="${color}" rx="0.5" opacity="0.8"/>
      <!-- Runways -->
      <rect x="2" y="17" width="20" height="2.5" fill="${color}" rx="1" opacity="0.7"/>
      <rect x="10.5" y="14" width="3" height="7" fill="${color}" rx="0.5" opacity="0.5"/>
      <!-- Runway markings -->
      <rect x="5"  y="17.8" width="2" height="0.8" fill="rgba(0,0,0,0.4)" rx="0.2"/>
      <rect x="9"  y="17.8" width="2" height="0.8" fill="rgba(0,0,0,0.4)" rx="0.2"/>
      <rect x="13" y="17.8" width="2" height="0.8" fill="rgba(0,0,0,0.4)" rx="0.2"/>
      <rect x="17" y="17.8" width="2" height="0.8" fill="rgba(0,0,0,0.4)" rx="0.2"/>
    </svg>
  `;

  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
    ">${svg}</div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -size],
  });
}
