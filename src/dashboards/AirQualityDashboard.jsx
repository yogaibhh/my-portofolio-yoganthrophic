/* DKI Jakarta Air Quality — Operations Command Center.
   Bespoke dense dark tactical UI (NOT the generic ./ui template).
   Leaflet/OSM map (tiles darkened via CSS) + recharts charts. All data
   from ./data (synthetic). Scoped under .aq-dash, @keyframes at top level. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import { air, aqiColor, aqiCat } from './data'
import './airquality.css'

/* AQI band reference (matches aqiColor / aqiCat thresholds) */
const BANDS = [
  { label: 'Good', color: '#34d399', lo: 0, hi: 50 },
  { label: 'Moderate', color: '#facc15', lo: 51, hi: 100 },
  { label: 'Sensitive', color: '#fb923c', lo: 101, hi: 150 },
  { label: 'Unhealthy', color: '#f43f5e', lo: 151, hi: 200 },
  { label: 'Hazardous', color: '#c084fc', lo: 201, hi: 500 },
]

/* deterministic per-station pollutant breakdown (seeded by name) so each
   selected station gets a distinct, stable mix scaled around its AQI. */
function stationPollutants(s) {
  let seed = 0
  for (let i = 0; i < s.name.length; i++) seed = (seed * 31 + s.name.charCodeAt(i)) >>> 0
  const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const k = s.aqi / 155
  return air.pollutants.map((p) => ({
    ...p,
    value: Math.max(6, Math.round(p.value * k * (0.78 + r() * 0.44))),
  }))
}

export default function AirQualityDashboard() {
  const sorted = useMemo(() => [...air.stations].sort((a, b) => b.aqi - a.aqi), [])
  const [sel, setSel] = useState(sorted[0])

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  const cityAqi = air.kpis.aqi
  const worst = sorted[0]
  const avg = useMemo(
    () => Math.round(air.stations.reduce((s, x) => s + x.aqi, 0) / air.stations.length),
    [],
  )
  const poll = useMemo(() => stationPollutants(sel), [sel])
  const pollMax = useMemo(() => Math.max(...poll.map((p) => p.value)), [poll])

  // MAP INIT (StrictMode-guarded)
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, {
      center: [-6.25, 106.85], zoom: 10, zoomControl: true, attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 18,
    }).addTo(m)
    mapRef.current = m

    const markers = {}
    air.stations.forEach((s) => {
      const col = aqiColor(s.aqi)
      const mk = L.circleMarker([s.lat, s.lng], {
        radius: 6 + s.aqi / 24,
        color: '#0b0f1a', weight: 1.5,
        fillColor: col, fillOpacity: 0.92,
      })
        .bindPopup(
          `<div class="aq-pop-t">${s.name}</div>` +
          `<div class="aq-pop-v" style="color:${col}">AQI ${s.aqi} · ${aqiCat(s.aqi)}</div>`,
          { className: 'aq-popup', closeButton: false },
        )
        .on('click', () => setSel(s))
        .addTo(m)
      markers[s.name] = mk
    })
    markersRef.current = markers

    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false })); ro.observe(mapEl.current)
    const tid = setTimeout(() => m.invalidateSize({ animate: false }), 80)
    return () => { clearTimeout(tid); ro.disconnect(); m.remove(); mapRef.current = null; markersRef.current = {} }
  }, [])

  // highlight selected marker + pan
  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    Object.entries(markersRef.current).forEach(([name, mk]) => {
      const s = air.stations.find((x) => x.name === name)
      const isSel = name === sel.name
      mk.setStyle({
        weight: isSel ? 2.5 : 1.5,
        color: isSel ? '#ffffff' : '#0b0f1a',
        fillOpacity: isSel ? 1 : 0.92,
        radius: (6 + s.aqi / 24) * (isSel ? 1.35 : 1),
      })
      if (isSel) mk.bringToFront()
    })
    m.panTo([sel.lat, sel.lng], { animate: true, duration: 0.6 })
  }, [sel])

  const cityColor = aqiColor(cityAqi)
  const selColor = aqiColor(sel.aqi)

  return (
    <div className="aq-dash">
      <div className="L">
        {/* HEADER */}
        <div className="H">
          <h1>
            <span style={{ fontSize: 15 }}>🌫️</span> DKI Jakarta Air Quality
            <span className="sub">Jabodetabek • 20+ stations • 10-year record</span>
          </h1>
          <div className="hr">
            <div className="live">LIVE</div>
            <span>📍 {air.kpis.stations} stations online</span>
            <span className="pts">🗃️ {air.kpis.points} readings</span>
            <div className="city-readout" style={{ borderColor: cityColor + '55' }}>
              <span className="cr-l">CITY AQI</span>
              <span className="cr-v" style={{ color: cityColor }}>{cityAqi}</span>
              <span className="cr-c" style={{ color: cityColor }}>{aqiCat(cityAqi)}</span>
            </div>
          </div>
        </div>

        {/* LEFT */}
        <div className="lp">
          <div className="gauge" style={{ background: `radial-gradient(circle at 50% 28%, ${cityColor}18, transparent 70%)`, borderColor: cityColor + '33' }}>
            <div className="g-l">Current City Index</div>
            <div className="g-v" style={{ color: cityColor }}>{cityAqi}</div>
            <div className="g-cat" style={{ background: cityColor + '1c', color: cityColor }}>{aqiCat(cityAqi)}</div>
            <div className="g-bar">
              {BANDS.map((b) => (
                <span key={b.label} className="g-seg" style={{ background: b.color, opacity: cityAqi >= b.lo ? 1 : 0.25 }} />
              ))}
            </div>
            <div className="g-meta">
              <span>Worst: <b style={{ color: aqiColor(worst.aqi) }}>{worst.name}</b></span>
              <span>Avg: <b style={{ color: aqiColor(avg) }}>{avg}</b></span>
            </div>
          </div>

          <div className="ct">📡 Stations · AQI desc ({sorted.length})</div>
          <div className="slist">
            {sorted.map((s, i) => {
              const c = aqiColor(s.aqi)
              return (
                <div
                  key={s.name}
                  className={`srow${sel.name === s.name ? ' sel' : ''}`}
                  onClick={() => setSel(s)}
                >
                  <span className="s-rank" style={{ background: c + '22', color: c }}>{i + 1}</span>
                  <span className="s-info">
                    <span className="s-name">{s.name}</span>
                    <span className="s-cat">{aqiCat(s.aqi)}</span>
                  </span>
                  <span className="s-aqi" style={{ color: c }}>{s.aqi}</span>
                </div>
              )
            })}
          </div>

          <div className="ct">🎚️ AQI Bands</div>
          <div className="legend">
            {BANDS.map((b) => (
              <div className="lg-row" key={b.label}>
                <span className="lg-dot" style={{ background: b.color }} />
                <span className="lg-lab">{b.label}</span>
                <span className="lg-rng">{b.lo}{b.hi >= 500 ? '+' : `–${b.hi}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER MAP */}
        <div className="mp">
          <div ref={mapEl} className="aq-map" />
          <div className="mi">
            <div className="mc">⚠️ Worst <b style={{ color: aqiColor(worst.aqi) }}>{worst.name} · {worst.aqi}</b></div>
            <div className="mc">📊 Avg AQI <b style={{ color: aqiColor(avg) }}>{avg}</b></div>
          </div>
          <div className="ml">
            <div className="mlt">AQI Band</div>
            {BANDS.map((b) => (
              <div className="mli" key={b.label}>
                <span className="mld" style={{ background: b.color }} /> {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DETAIL */}
        <div className="rp">
          <div className="c hero" style={{ background: `linear-gradient(135deg,${selColor}14,transparent)`, borderColor: selColor + '33' }}>
            <div className="ct">📍 Station Detail</div>
            <div className="h-name">{sel.name}</div>
            <div className="h-coord">{sel.lat.toFixed(3)}, {sel.lng.toFixed(3)}</div>
            <div className="h-row">
              <span className="h-aqi" style={{ color: selColor }}>{sel.aqi}</span>
              <span className="h-badge" style={{ background: selColor + '1c', color: selColor }}>{aqiCat(sel.aqi)}</span>
            </div>
          </div>

          <div className="c">
            <div className="ct">🧪 Pollutant Breakdown <span className="src">µg/m³</span></div>
            <div className="pgrid">
              {poll.map((p) => (
                <div className="prow" key={p.label}>
                  <span className="p-lab">{p.label}</span>
                  <span className="p-track">
                    <span className="p-fill" style={{ width: `${(p.value / pollMax) * 100}%`, background: p.color }} />
                  </span>
                  <span className="p-val" style={{ color: p.color }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="c">
            <div className="ct">📈 PM2.5 · 10-Year Trend <span className="src">annual mean</span></div>
            <ResponsiveContainer width="100%" height={128}>
              <AreaChart data={air.trend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#5a6478', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a6478', fontSize: 8 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#94a3b8' }} />
                <ReferenceLine y={15} stroke="#34d399" strokeDasharray="4 4" strokeWidth={1.4}
                  label={{ value: 'WHO 15', fill: '#34d399', fontSize: 8, position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="pm25" stroke="#f43f5e" fill="url(#aqTrend)" strokeWidth={1.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="c">
            <div className="ct">🕐 Diurnal PM2.5 (24h) <span className="src">rush-hour peaks</span></div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={air.diurnal} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqDiur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#5a6478', fontSize: 8 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a6478', fontSize: 8 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="pm25" stroke="#fb923c" fill="url(#aqDiur)" strokeWidth={1.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
