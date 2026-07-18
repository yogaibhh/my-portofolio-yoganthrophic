/* Seismic Activity Monitor — Sunda Arc & Banda Sea.
   Interactive companion to the indonesia-earthquake-analysis study
   (10,294 USGS M4.5+ events, 2015-2026, b-value 1.07). Dense dark
   tactical UI matching the other command-center demos. Leaflet/OSM map
   (tiles darkened via CSS) + recharts. Entire catalog is synthetic and
   deterministic (seeded PRNG, Gutenberg-Richter magnitudes) — no feed,
   no network calls. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import './SeismicDashboard.css'

/* ---- depth classes (bucketed sequential: shallow -> deep) ---- */
const DEPTH = [
  { label: 'Shallow', range: '< 70 km', color: '#fde047' },
  { label: 'Intermediate', range: '70-300 km', color: '#fb923c' },
  { label: 'Deep', range: '> 300 km', color: '#60a5fa' },
]
const depthClass = (d) => (d < 70 ? DEPTH[0] : d < 300 ? DEPTH[1] : DEPTH[2])

/* magnitude class ramp (rose, light -> dark) for badges and lists */
const magColor = (m) => (m >= 7 ? '#f43f5e' : m >= 6 ? '#fb7185' : m >= 5 ? '#fda4af' : '#94a3b8')

const markerRadius = (m) => 2.5 + (m - 4.5) * 2.4

/* ---- 12-month window ending at the fixed demo date (15 Jul 2026) ---- */
const AS_OF = '15 Jul 2026'
const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i - 5, 1)
  return { label: MN[d.getMonth()], y: d.getFullYear() }
})
const fmtDate = (e) => `${e.day} ${MONTHS[e.mi].label} ${MONTHS[e.mi].y}`

/* ---- deterministic synthetic catalog along the Sunda arc ---- */
function mkR(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }

/* Gutenberg-Richter sampling (b = 1.07, as in the USGS study): exponentially
   fewer large events. Seeded events cap at M 7.2 so the handcrafted notable
   events below stay on top of the list. */
const GR_B = 1.07
const MAG_SPAN = 1 - Math.pow(10, -GR_B * (7.2 - 4.5))
const sampleMag = (r) => +(4.5 - Math.log10(1 - r * MAG_SPAN) / GR_B).toFixed(1)

const SEGMENTS = [
  { n: 48, lat: [-4, 4], lng: [96, 102], depth: (r) => 12 + Math.pow(r, 1.6) * 220, regions: ['Off West Coast of Sumatra', 'Mentawai Islands region', 'Nias region', 'Simeulue region', 'Southern Sumatra'] },
  { n: 36, lat: [-9.5, -7.5], lng: [105, 115], depth: (r) => 15 + Math.pow(r, 1.3) * 320, regions: ['South of Java', 'Sunda Strait', 'Java region', 'South of Bali'] },
  { n: 44, lat: [-10, -6], lng: [116, 131], depth: (r) => 25 + Math.pow(r, 0.75) * 575, regions: ['Banda Sea', 'Flores Sea', 'Sumba region', 'Timor region', 'Tanimbar Islands region'] },
  { n: 20, lat: [-2, 2], lng: [119, 126], depth: (r) => 10 + Math.pow(r, 1.5) * 180, regions: ['Minahasa Peninsula, Sulawesi', 'Sulawesi region', 'Molucca Sea', 'Palu region'] },
]

/* Handcrafted anchor events so the top-5 list reads like a real year. */
const NOTABLE = [
  { lat: -3.05, lng: 100.12, mag: 7.6, depth: 24, mi: 6, day: 11, region: 'Mentawai Islands region' },
  { lat: -6.62, lng: 129.92, mag: 7.1, depth: 517, mi: 3, day: 19, region: 'Banda Sea' },
  { lat: -9.12, lng: 107.44, mag: 6.8, depth: 68, mi: 9, day: 4, region: 'South of Java' },
  { lat: -7.38, lng: 121.84, mag: 6.6, depth: 512, mi: 1, day: 27, region: 'Flores Sea' },
  { lat: 0.92, lng: 122.88, mag: 6.5, depth: 121, mi: 11, day: 8, region: 'Minahasa Peninsula, Sulawesi' },
]

const EVENTS = (() => {
  const out = []
  SEGMENTS.forEach((z, zi) => {
    const r = mkR(zi * 104729 + 7919)
    for (let i = 0; i < z.n; i++) {
      const lat = +(z.lat[0] + r() * (z.lat[1] - z.lat[0])).toFixed(2)
      const lng = +(z.lng[0] + r() * (z.lng[1] - z.lng[0])).toFixed(2)
      const mag = sampleMag(r())
      const depth = Math.round(z.depth(r()))
      const mi = Math.min(11, Math.floor(r() * 12))
      const day = mi === 11 ? 1 + Math.floor(r() * 14) : 1 + Math.floor(r() * 28)
      const region = z.regions[Math.floor(r() * z.regions.length)]
      out.push({ lat, lng, mag, depth, mi, day, region })
    }
  })
  return out.concat(NOTABLE)
})()

const BINS = [
  { bin: 'M 4.5-4.9', short: '4.5', lo: 4.5, hi: 5 },
  { bin: 'M 5.0-5.4', short: '5.0', lo: 5, hi: 5.5 },
  { bin: 'M 5.5-5.9', short: '5.5', lo: 5.5, hi: 6 },
  { bin: 'M 6.0-6.4', short: '6.0', lo: 6, hi: 6.5 },
  { bin: 'M 6.5-6.9', short: '6.5', lo: 6.5, hi: 7 },
  { bin: 'M 7.0+', short: '7+', lo: 7, hi: Infinity },
]

const FILTERS = [
  { label: 'All', v: 0 },
  { label: 'M ≥ 5.0', v: 5 },
  { label: 'M ≥ 6.0', v: 6 },
]

const TT_STYLE = { background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 10 }

export default function SeismicDashboard() {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const quakeRef = useRef(null)
  const [minMag, setMinMag] = useState(0)

  const filtered = useMemo(() => EVENTS.filter((e) => e.mag >= minMag), [minMag])

  const kpis = useMemo(() => {
    const n = filtered.length
    return {
      n,
      strongest: n ? Math.max(...filtered.map((e) => e.mag)) : 0,
      avgDepth: n ? Math.round(filtered.reduce((s, e) => s + e.depth, 0) / n) : 0,
      thisMonth: filtered.filter((e) => e.mi === 11).length,
    }
  }, [filtered])

  const monthly = useMemo(
    () => MONTHS.map((mo, i) => ({ m: mo.label, count: filtered.filter((e) => e.mi === i).length })),
    [filtered],
  )
  const histogram = useMemo(
    () => BINS.map((b) => ({ ...b, count: filtered.filter((e) => e.mag >= b.lo && e.mag < b.hi).length })),
    [filtered],
  )
  const depthMix = useMemo(
    () => DEPTH.map((d) => ({ ...d, count: filtered.filter((e) => depthClass(e.depth).label === d.label).length })),
    [filtered],
  )
  const top5 = useMemo(() => [...filtered].sort((a, b) => b.mag - a.mag).slice(0, 5), [filtered])

  // MAP INIT (StrictMode-guarded)
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, {
      center: [-2.5, 118], zoom: 5, zoomControl: true, attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 }).addTo(m)
    mapRef.current = m
    quakeRef.current = L.layerGroup().addTo(m)

    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false })); ro.observe(mapEl.current)
    const tid = setTimeout(() => m.invalidateSize({ animate: false }), 80)
    return () => { clearTimeout(tid); ro.disconnect(); m.remove(); mapRef.current = null; quakeRef.current = null }
  }, [])

  // (re)draw event markers whenever the magnitude filter changes
  useEffect(() => {
    const grp = quakeRef.current
    if (!grp) return
    grp.clearLayers()
    const byMag = [...filtered].sort((a, b) => b.mag - a.mag) // big quakes below small ones
    byMag.forEach((e) => {
      const dc = depthClass(e.depth)
      L.circleMarker([e.lat, e.lng], {
        radius: markerRadius(e.mag),
        color: '#0b0f1a', weight: 1,
        fillColor: dc.color, fillOpacity: 0.85,
      })
        .bindPopup(
          `<div class="sp-t">M ${e.mag.toFixed(1)} — ${e.region}</div>` +
          `<div class="sp-r">Depth <b style="color:${dc.color}">${e.depth} km</b> · ${dc.label.toLowerCase()}</div>` +
          `<div class="sp-r">${fmtDate(e)}</div>`,
          { className: 'seis-popup', closeButton: false },
        )
        .addTo(grp)
    })
  }, [filtered])

  return (
    <div className="seis-dash">
      <div className="L">
        {/* HEADER */}
        <div className="H">
          <h1>
            Seismic Activity Monitor
            <span className="sub">Sunda Arc & Banda Sea · synthetic demo catalog (USGS-style, M 4.5+) · 12 months</span>
          </h1>
          <div className="hr">
            <div className="feed">SYNTHETIC FEED</div>
            <span>As of {AS_OF}</span>
            <div className="fbar">
              {FILTERS.map((f) => (
                <button
                  key={f.label}
                  className={`fbtn ${minMag === f.v ? 'on' : ''}`}
                  onClick={() => setMinMag(f.v)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI ROW */}
        <div className="kpis">
          <div className="kpi">
            <div className="k-l">Events · 12 mo</div>
            <div className="k-v" style={{ color: '#22d3ee' }}>{kpis.n}</div>
            <div className="k-s">of {EVENTS.length} in catalog</div>
          </div>
          <div className="kpi">
            <div className="k-l">Strongest</div>
            <div className="k-v" style={{ color: magColor(kpis.strongest) }}>M {kpis.strongest.toFixed(1)}</div>
            <div className="k-s">{top5[0] ? top5[0].region : '—'}</div>
          </div>
          <div className="kpi">
            <div className="k-l">Avg depth</div>
            <div className="k-v" style={{ color: depthClass(kpis.avgDepth).color }}>{kpis.avgDepth} km</div>
            <div className="k-s">{depthClass(kpis.avgDepth).label.toLowerCase()} on average</div>
          </div>
          <div className="kpi">
            <div className="k-l">This month</div>
            <div className="k-v" style={{ color: 'var(--ac)' }}>{kpis.thisMonth}</div>
            <div className="k-s">Jul 2026 · to date</div>
          </div>
        </div>

        {/* CENTER MAP */}
        <div className="mp">
          <div ref={mapEl} className="seis-map" />
          <div className="mi">
            <div className="mc">Showing <b style={{ color: '#22d3ee' }}>{kpis.n}</b> / {EVENTS.length} events</div>
            <div className="mc">Strongest <b style={{ color: magColor(kpis.strongest) }}>M {kpis.strongest.toFixed(1)}</b></div>
          </div>
          <div className="ml">
            <div className="mlt">Depth class</div>
            {DEPTH.map((d) => (
              <div className="mli" key={d.label}>
                <span className="mld" style={{ background: d.color }} /> {d.label}
                <span className="mlr">{d.range}</span>
              </div>
            ))}
            <div className="ml-div" />
            <div className="mlt">Magnitude</div>
            <div className="mls">
              {[5, 6, 7].map((mv) => (
                <span className="mls-i" key={mv}>
                  <span className="mlc" style={{ width: markerRadius(mv) * 2, height: markerRadius(mv) * 2 }} />
                  M{mv}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rp">
          <div className="c">
            <div className="ct">Monthly events <span className="src">12-month window</span></div>
            <ResponsiveContainer width="100%" height={116}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="m" tick={{ fill: '#5a6478', fontSize: 7 }} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a6478', fontSize: 8 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,.05)' }} contentStyle={TT_STYLE} labelStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="count" name="events" fill="#22d3ee" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="c">
            <div className="ct">Magnitude distribution <span className="src">Gutenberg-Richter</span></div>
            <ResponsiveContainer width="100%" height={116}>
              <BarChart data={histogram} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="short" tick={{ fill: '#5a6478', fontSize: 8 }} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a6478', fontSize: 8 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,.05)' }}
                  contentStyle={TT_STYLE}
                  labelStyle={{ color: '#94a3b8' }}
                  labelFormatter={(v, p) => (p && p[0] ? p[0].payload.bin : v)}
                />
                <Bar dataKey="count" name="events" fill="#fb7185" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="c">
            <div className="ct">Depth classes <span className="src">of {kpis.n} shown</span></div>
            <div className="dgrid">
              {depthMix.map((d) => (
                <div className="drow" key={d.label}>
                  <span className="d-dot" style={{ background: d.color }} />
                  <span className="d-lab">{d.label} <span className="d-rng">{d.range}</span></span>
                  <span className="d-track">
                    <span className="d-fill" style={{ width: `${kpis.n ? (d.count / kpis.n) * 100 : 0}%`, background: d.color }} />
                  </span>
                  <span className="d-val" style={{ color: d.color }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="c">
            <div className="ct">Strongest events <span className="src">top 5 · click to locate</span></div>
            <div className="qlist">
              {top5.map((e, i) => (
                <div
                  className="qrow"
                  key={`${e.lat},${e.lng},${e.mag}`}
                  onClick={() => mapRef.current && mapRef.current.flyTo([e.lat, e.lng], 7, { duration: 0.8 })}
                >
                  <span className="q-rank" style={{ background: magColor(e.mag) + '22', color: magColor(e.mag) }}>{i + 1}</span>
                  <span className="q-info">
                    <span className="q-reg">{e.region}</span>
                    <span className="q-meta">{e.depth} km · {depthClass(e.depth).label.toLowerCase()} · {fmtDate(e)}</span>
                  </span>
                  <span className="q-mag" style={{ color: magColor(e.mag) }}>M {e.mag.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
