from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
import math
import random

app = Flask(__name__)
CORS(app)

OPENSKY_URL        = "https://opensky-network.org/api/states/all"
OPENSKY_ARRIVALS   = "https://opensky-network.org/api/flights/arrival"
OPENSKY_DEPARTURES = "https://opensky-network.org/api/flights/departure"

AIRPORTS = [
    {"icao":"EGLL","iata":"LHR","name":"London Heathrow",          "city":"London",        "lat":51.4775,  "lon":-0.4614,   "country":"UK"},
    {"icao":"LFPG","iata":"CDG","name":"Paris Charles de Gaulle",  "city":"Paris",         "lat":49.0097,  "lon":2.5478,    "country":"France"},
    {"icao":"EDDF","iata":"FRA","name":"Frankfurt Airport",        "city":"Frankfurt",     "lat":50.0333,  "lon":8.5706,    "country":"Germany"},
    {"icao":"EHAM","iata":"AMS","name":"Amsterdam Schiphol",       "city":"Amsterdam",     "lat":52.3086,  "lon":4.7639,    "country":"Netherlands"},
    {"icao":"LEMD","iata":"MAD","name":"Madrid Barajas",           "city":"Madrid",        "lat":40.4936,  "lon":-3.5668,   "country":"Spain"},
    {"icao":"LIRF","iata":"FCO","name":"Rome Fiumicino",           "city":"Rome",          "lat":41.8003,  "lon":12.2389,   "country":"Italy"},
    {"icao":"LOWW","iata":"VIE","name":"Vienna International",     "city":"Vienna",        "lat":48.1103,  "lon":16.5697,   "country":"Austria"},
    {"icao":"LSZH","iata":"ZRH","name":"Zurich Airport",           "city":"Zurich",        "lat":47.4647,  "lon":8.5492,    "country":"Switzerland"},
    {"icao":"UUEE","iata":"SVO","name":"Moscow Sheremetyevo",      "city":"Moscow",        "lat":55.9726,  "lon":37.4146,   "country":"Russia"},
    {"icao":"OMDB","iata":"DXB","name":"Dubai International",      "city":"Dubai",         "lat":25.2532,  "lon":55.3657,   "country":"UAE"},
    {"icao":"VHHH","iata":"HKG","name":"Hong Kong International",  "city":"Hong Kong",     "lat":22.3080,  "lon":113.9185,  "country":"Hong Kong"},
    {"icao":"RJTT","iata":"HND","name":"Tokyo Haneda",             "city":"Tokyo",         "lat":35.5494,  "lon":139.7798,  "country":"Japan"},
    {"icao":"RJAA","iata":"NRT","name":"Tokyo Narita",             "city":"Tokyo",         "lat":35.7647,  "lon":140.3864,  "country":"Japan"},
    {"icao":"YSSY","iata":"SYD","name":"Sydney Kingsford Smith",   "city":"Sydney",        "lat":-33.9461, "lon":151.1772,  "country":"Australia"},
    {"icao":"WMKK","iata":"KUL","name":"Kuala Lumpur International","city":"Kuala Lumpur", "lat":2.7456,   "lon":101.7099,  "country":"Malaysia"},
    {"icao":"WSSS","iata":"SIN","name":"Singapore Changi",         "city":"Singapore",     "lat":1.3644,   "lon":103.9915,  "country":"Singapore"},
    {"icao":"ZBAA","iata":"PEK","name":"Beijing Capital International","city":"Beijing",   "lat":40.0799,  "lon":116.6031,  "country":"China"},
    {"icao":"ZSPD","iata":"PVG","name":"Shanghai Pudong International","city":"Shanghai",  "lat":31.1443,  "lon":121.8083,  "country":"China"},
    {"icao":"VIDP","iata":"DEL","name":"Indira Gandhi International","city":"New Delhi",   "lat":28.5665,  "lon":77.1031,   "country":"India"},
    {"icao":"VABB","iata":"BOM","name":"Chhatrapati Shivaji International","city":"Mumbai","lat":19.0896,  "lon":72.8656,   "country":"India"},
    {"icao":"VOBL","iata":"BLR","name":"Kempegowda International", "city":"Bangalore",     "lat":13.1986,  "lon":77.7066,   "country":"India"},
    {"icao":"VOMM","iata":"MAA","name":"Chennai International",    "city":"Chennai",       "lat":12.9941,  "lon":80.1709,   "country":"India"},
    {"icao":"VOHY","iata":"HYD","name":"Rajiv Gandhi International","city":"Hyderabad",    "lat":17.2403,  "lon":78.4294,   "country":"India"},
    {"icao":"VECC","iata":"CCU","name":"Netaji Subhash Chandra Bose International","city":"Kolkata","lat":22.6547,"lon":88.4467,"country":"India"},
    {"icao":"VOCI","iata":"COK","name":"Cochin International",     "city":"Kochi",         "lat":10.1520,  "lon":76.4019,   "country":"India"},
    {"icao":"KATL","iata":"ATL","name":"Hartsfield-Jackson Atlanta","city":"Atlanta",      "lat":33.6407,  "lon":-84.4277,  "country":"USA"},
    {"icao":"KLAX","iata":"LAX","name":"Los Angeles International","city":"Los Angeles",   "lat":33.9425,  "lon":-118.4081, "country":"USA"},
    {"icao":"KJFK","iata":"JFK","name":"John F. Kennedy International","city":"New York",  "lat":40.6413,  "lon":-73.7781,  "country":"USA"},
    {"icao":"KORD","iata":"ORD","name":"O'Hare International",     "city":"Chicago",       "lat":41.9742,  "lon":-87.9073,  "country":"USA"},
    {"icao":"KDFW","iata":"DFW","name":"Dallas/Fort Worth International","city":"Dallas",  "lat":32.8998,  "lon":-97.0403,  "country":"USA"},
    {"icao":"SBGR","iata":"GRU","name":"São Paulo Guarulhos",      "city":"São Paulo",     "lat":-23.4356, "lon":-46.4731,  "country":"Brazil"},
    {"icao":"FAOR","iata":"JNB","name":"O.R. Tambo International", "city":"Johannesburg",  "lat":-26.1392, "lon":28.2460,   "country":"South Africa"},
    {"icao":"HECA","iata":"CAI","name":"Cairo International",      "city":"Cairo",         "lat":30.1219,  "lon":31.4056,   "country":"Egypt"},
    {"icao":"OERK","iata":"RUH","name":"King Khalid International","city":"Riyadh",        "lat":24.9576,  "lon":46.6988,   "country":"Saudi Arabia"},
    {"icao":"CYYZ","iata":"YYZ","name":"Toronto Pearson International","city":"Toronto",   "lat":43.6777,  "lon":-79.6248,  "country":"Canada"},
    {"icao":"MMMX","iata":"MEX","name":"Mexico City International","city":"Mexico City",   "lat":19.4363,  "lon":-99.0721,  "country":"Mexico"},
]


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def project_point(lat, lon, bearing_deg, dist_km):
    R = 6371
    b = math.radians(bearing_deg)
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    lat2 = math.asin(math.sin(lat1)*math.cos(dist_km/R) +
                     math.cos(lat1)*math.sin(dist_km/R)*math.cos(b))
    lon2 = lon1 + math.atan2(math.sin(b)*math.sin(dist_km/R)*math.cos(lat1),
                              math.cos(dist_km/R)-math.sin(lat1)*math.sin(lat2))
    return math.degrees(lat2), math.degrees(lon2)


def nearest_airport(lat, lon, max_km=2000):
    best, best_d = None, float('inf')
    for ap in AIRPORTS:
        d = haversine_km(lat, lon, ap["lat"], ap["lon"])
        if d < best_d:
            best_d = d
            best = ap
    return (best, round(best_d)) if best_d <= max_km else (None, None)


def parse_flight(state):
    if not state or len(state) < 17:
        return None
    icao24, callsign, origin_country = state[0], state[1], state[2]
    longitude, latitude = state[5], state[6]
    altitude  = state[7]
    velocity  = state[9]
    heading   = state[10]
    on_ground = state[8]

    if latitude is None or longitude is None:
        return None
    if on_ground:
        return None
    if altitude is not None and altitude < 0:
        return None

    return {
        "icao24":         icao24 or "N/A",
        "callsign":       (callsign or "N/A").strip() or "N/A",
        "origin_country": origin_country or "Unknown",
        "latitude":       latitude,
        "longitude":      longitude,
        "altitude_m":     round(altitude, 1)          if altitude  is not None else None,
        "altitude_ft":    round(altitude * 3.28084, 0) if altitude  is not None else None,
        "velocity_ms":    round(velocity, 1)           if velocity  is not None else None,
        "velocity_kmh":   round(velocity * 3.6, 1)     if velocity  is not None else None,
        "heading":        round(heading, 1)             if heading   is not None else None,
        "on_ground":      on_ground,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/flights")
def get_flights():
    try:
        resp = requests.get(OPENSKY_URL, timeout=10)
        resp.raise_for_status()
        states = resp.json().get("states", [])
        flights = [p for s in states if (p := parse_flight(s))]
        return jsonify({"flights": flights, "count": len(flights),
                        "timestamp": int(time.time()), "source_count": len(states)})
    except requests.Timeout:
        return jsonify({"error": "OpenSky API timed out",  "flights": [], "count": 0}), 504
    except requests.HTTPError as e:
        return jsonify({"error": f"OpenSky API error: {e}", "flights": [], "count": 0}), 502
    except Exception as e:
        return jsonify({"error": f"Internal error: {e}",   "flights": [], "count": 0}), 500


@app.route("/api/airports")
def get_airports():
    return jsonify({"airports": AIRPORTS})


@app.route("/api/flight-path/<icao24>")
def get_flight_path(icao24):
    try:
        resp = requests.get(OPENSKY_URL, timeout=10)
        resp.raise_for_status()
        states = resp.json().get("states", [])

        flight = next((parse_flight(s) for s in states
                       if s and s[0] == icao24.lower()), None)
        if not flight:
            return jsonify({"error": "Flight not found", "path": []}), 404

        lat, lon, heading = flight["latitude"], flight["longitude"], flight["heading"] or 0

        dest_lat, dest_lon   = project_point(lat, lon, heading,                800)
        origin_lat, origin_lon = project_point(lat, lon, (heading+180) % 360, 800)

        dest_ap,   _ = nearest_airport(dest_lat,   dest_lon)
        origin_ap, _ = nearest_airport(origin_lat, origin_lon)

        path = []
        if origin_ap:
            path.append({"lat": origin_ap["lat"], "lon": origin_ap["lon"],
                         "type": "origin", "airport": origin_ap})
        path.append({"lat": lat, "lon": lon, "type": "current"})
        if dest_ap:
            path.append({"lat": dest_ap["lat"], "lon": dest_ap["lon"],
                         "type": "destination", "airport": dest_ap})

        return jsonify({"icao24": icao24, "flight": flight,
                        "path": path, "origin": origin_ap, "destination": dest_ap})
    except Exception as e:
        return jsonify({"error": str(e), "path": []}), 500


@app.route("/api/airport/<icao>")
def get_airport_flights(icao):
    airport = next((a for a in AIRPORTS if a["icao"].upper() == icao.upper()), None)
    if not airport:
        return jsonify({"error": "Airport not found"}), 404

    now   = int(time.time())
    begin = now - 7200
    end   = now + 7200

    arrivals, departures = [], []

    try:
        r = requests.get(OPENSKY_ARRIVALS,
                         params={"airport": icao.upper(), "begin": begin, "end": end},
                         timeout=10)
        if r.status_code == 200:
            arrivals = [_fmt(f, "arrival", now) for f in (r.json() or [])]
    except Exception:
        pass

    try:
        r = requests.get(OPENSKY_DEPARTURES,
                         params={"airport": icao.upper(), "begin": begin, "end": end},
                         timeout=10)
        if r.status_code == 200:
            departures = [_fmt(f, "departure", now) for f in (r.json() or [])]
    except Exception:
        pass

    if not arrivals and not departures:
        arrivals, departures = _demo_flights(airport, now)

    return jsonify({"airport": airport,
                    "arrivals":   arrivals[:15],
                    "departures": departures[:15],
                    "timestamp":  now})


def _fmt(f, kind, now):
    ts = f.get("lastSeen") or f.get("firstSeen") or now
    if   ts < now - 3600: status = "Arrived"  if kind == "arrival" else "Departed"
    elif ts < now:         status = "Landing"  if kind == "arrival" else "Boarding"
    else:                  status = "Expected" if kind == "arrival" else "Scheduled"
    return {
        "callsign":  (f.get("callsign") or "N/A").strip(),
        "icao24":     f.get("icao24", "N/A"),
        "estOrigin":  f.get("estDepartureAirport") or f.get("estArrivalAirport") or "N/A",
        "time": ts, "status": status, "type": kind,
    }


def _demo_flights(airport, now):
    airlines = ["UAL","BAW","DLH","AFR","SIA","EZY","RYR","QFA","AAL",
                "IBE","KLM","ETH","VIR","EIN","SWR","AUA","TAP","AZA","TKY","MSE"]
    iatas    = [a["iata"] for a in AIRPORTS if a["icao"] != airport["icao"]]

    def make(kind, offset):
        cs = random.choice(airlines) + str(random.randint(100, 999))
        ts = now + offset
        if   offset < -1800: st = "Arrived"  if kind=="arrival" else "Departed"
        elif offset < 0:     st = "Landing"  if kind=="arrival" else "Taxiing"
        elif offset < 1800:  st = "Expected" if kind=="arrival" else "Boarding"
        else:                st = "Scheduled"
        return {"callsign": cs,
                "icao24":   format(random.randint(0, 0xFFFFFF), '06x'),
                "estOrigin": random.choice(iatas),
                "time": ts, "status": st, "type": kind}

    arr = sorted([make("arrival",   random.randint(-5400, 3600)) for _ in range(12)], key=lambda x: x["time"])
    dep = sorted([make("departure", random.randint(-3600, 5400)) for _ in range(12)], key=lambda x: x["time"])
    return arr, dep


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": int(time.time())})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
