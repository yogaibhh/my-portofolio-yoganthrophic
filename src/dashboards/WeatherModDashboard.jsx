/* TMC Operations Center — Weather Modification / Cloud Seeding Ops.
   Bespoke dense dark command-center over the Jatiluhur catchment, West Java.
   Free Leaflet/OSM map + recharts. All data synthetic. Not a generic KPI template. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { weather } from './data'
import './weathermod.css'

/* ---- status palette ---- */
const SC = { completed: '#22d3ee', active: '#fbbf24', planned: '#64748b' }
const SLABEL = { completed: 'COMPLETED', active: 'ACTIVE', planned: 'PLANNED' }
/* suitability palette */
const SUIT = { high: '#22d3ee', medium: '#fbbf24', low: '#64748b' }

/* forward operating base — sorties fly out from here */
const BASE = { lat: -6.9, lng: 107.6, name: 'Husein Sastranegara FOB' }

export default function WeatherModDashboard() {
  const { sorties, target, hours, cells, kpis } = weather
  const mapEl = useRef(null), mapRef = useRef(null)
  const sortieRef = useRef(null), targetRef = useRef(null), pathRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [show, setShow] = useState({ sorties: true, target: true, paths: true })

  /* derived ops figures */
  const fleet = useMemo(() => {
    const completed = sorties.filter((s) => s.status === 'completed').length
    const active = sorties.filter((s) => s.status === 'active').length
    const planned = sorties.filter((s) => s.status === 'planned').length
    const estRain = sorties.reduce((a, s) => a + s.rain, 0)
    return { completed, active, planned, estRain }
  }, [sorties])

  /* enhancement math from the 24h series */
  const enh = useMemo(() => {
    const seeded = hours.reduce((a, h) => a + h.seeded, 0)
    const control = hours.reduce((a, h) => a + h.control, 0)
    const pct = control ? Math.round(((seeded - control) / control) * 100) : 0
    return { seeded, control, pct }
  }, [hours])

  const narrative = useMemo(() => {
    const lead = sorties.reduce((b, s) => (s.rain > b.rain ? s : b), sorties[0])
    return `TMC tasking over ${target.name}: ${fleet.completed} sorties completed, ${fleet.active} airborne, ` +
      `${fleet.planned} on the apron. ${kpis.flares} NaCl/CaO flares expended across ${kpis.hours} cloud-data hours. ` +
      `Sortie ${lead.id} returned the strongest column (${lead.rain} mm est.). Gauge network indicates a ` +
      `+${enh.pct}% rainfall enhancement vs. the unseeded control corridor. Recommend re-tasking on the NW Cb cluster ` +
      `while convective tops hold above 9 km.`
  }, [sorties, target, fleet, kpis, enh])

  /* ---- map init (Leaflet, StrictMode-guarded) ---- */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, { center: [-6.6, 107.15], zoom: 9, zoomControl: true, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 }).addTo(m)
    mapRef.current = m

    /* TARGET zone — distinct diamond marker + seeding radius circle */
    const tgrp = L.layerGroup()
    L.circle([target.lat, target.lng], { radius: 18000, color: '#22d3ee', weight: 1.4, dashArray: '5 4', fillColor: '#22d3ee', fillOpacity: 0.06 }).addTo(tgrp)
    L.marker([target.lat, target.lng], {
      icon: L.divIcon({ className: 'wmod-tgt', html: '<div class="wmod-tgt-d">◆</div>', iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).bindPopup(`<b>🎯 ${target.name}</b><br/>Seeding target zone<br/>Radius: 18 km`).addTo(tgrp)
    tgrp.addTo(m)
    targetRef.current = tgrp

    /* flight paths base -> sortie */
    const pgrp = L.layerGroup()
    sorties.forEach((s) => {
      L.polyline([[BASE.lat, BASE.lng], [s.lat, s.lng]], {
        color: SC[s.status], weight: 1.2, opacity: 0.5, dashArray: s.status === 'planned' ? '3 4' : '6 5',
      }).addTo(pgrp)
    })
    L.marker([BASE.lat, BASE.lng], {
      icon: L.divIcon({ className: 'wmod-base', html: '<div class="wmod-base-d">▲</div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
    }).bindPopup(`<b>🛩 ${BASE.name}</b><br/>Forward operating base`).addTo(pgrp)
    pgrp.addTo(m)
    pathRef.current = pgrp

    /* sortie markers (status-colored circleMarkers) */
    const sgrp = L.layerGroup()
    sorties.forEach((s) => {
      const cm = L.circleMarker([s.lat, s.lng], {
        radius: 7, color: '#fff', weight: 1.4, fillColor: SC[s.status], fillOpacity: 0.95,
      }).bindPopup(
        `<b>${s.id}</b> · <span style="color:${SC[s.status]}">${SLABEL[s.status]}</span><br/>` +
        `Flares: ${s.flares}<br/>Est. rain: ${s.rain} mm`
      )
      cm.on('click', () => setSel((p) => (p?.id === s.id ? null : s)))
      cm.addTo(sgrp)
    })
    sgrp.addTo(m)
    sortieRef.current = sgrp

    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false })); ro.observe(mapEl.current)
    const t = setTimeout(() => m.invalidateSize({ animate: false }), 80)
    return () => { clearTimeout(t); ro.disconnect(); m.remove(); mapRef.current = null }
  }, [sorties, target])

  /* layer toggles */
  useEffect(() => {
    const m = mapRef.current; if (!m) return
    const tog = (ref, on) => { if (!ref) return; if (on && !m.hasLayer(ref)) ref.addTo(m); if (!on && m.hasLayer(ref)) m.removeLayer(ref) }
    tog(sortieRef.current, show.sorties)
    tog(targetRef.current, show.target)
    tog(pathRef.current, show.paths)
  }, [show])

  /* fly to selected sortie */
  useEffect(() => {
    const m = mapRef.current; if (!m) return
    if (sel) m.flyTo([sel.lat, sel.lng], 10, { duration: 0.8 })
    else m.flyTo([-6.6, 107.15], 9, { duration: 0.8 })
  }, [sel])

  const toggle = (k) => setShow((p) => ({ ...p, [k]: !p[k] }))

  return (
    <div className="wmod-dash">
      <div className="wm-grid">
        {/* HEADER */}
        <header className="wm-head">
          <h1>🌧️ Weather Modification — Cloud Seeding Ops
            <span className="wm-sub">Jatiluhur Catchment • TMC v2</span>
          </h1>
          <div className="wm-hr">
            <span className="wm-live">LIVE</span>
            <span className="wm-tac">⚡ TASKING WINDOW 06:00–18:00 LT</span>
            <span className="wm-date">📅 15 Jun 2026</span>
          </div>
        </header>

        {/* LEFT PANEL */}
        <aside className="wm-left">
          <div className="wm-card">
            <div className="wm-ct">📋 Mission Summary</div>
            <div className="wm-sg">
              <div className="wm-si"><div className="wm-sv" style={{ color: '#22d3ee' }}>{kpis.sorties}</div><div className="wm-sl">Sorties Flown</div></div>
              <div className="wm-si"><div className="wm-sv" style={{ color: '#fbbf24' }}>{kpis.flares}</div><div className="wm-sl">Flares Deployed</div></div>
              <div className="wm-si"><div className="wm-sv" style={{ color: '#818cf8' }}>{kpis.hours}</div><div className="wm-sl">Data Hours</div></div>
              <div className="wm-si"><div className="wm-sv" style={{ color: '#34d399' }}>{kpis.addRain}</div><div className="wm-sl">Added Rainfall</div></div>
            </div>
            <div className="wm-fleet">
              <span className="wm-fchip"><i style={{ background: SC.completed }} />{fleet.completed} done</span>
              <span className="wm-fchip"><i style={{ background: SC.active }} />{fleet.active} active</span>
              <span className="wm-fchip"><i style={{ background: SC.planned }} />{fleet.planned} planned</span>
            </div>
          </div>

          <div className="wm-ct wm-pad">🛩 Sortie Log ({sorties.length})</div>
          {sorties.map((s) => (
            <div key={s.id} className={`wm-sortie${sel?.id === s.id ? ' sel' : ''}`} onClick={() => setSel(sel?.id === s.id ? null : s)}>
              <div className="wm-sortie-h">
                <span className="wm-sid">{s.id}</span>
                <span className="wm-badge" style={{ background: SC[s.status] + '22', color: SC[s.status], borderColor: SC[s.status] + '55' }}>{SLABEL[s.status]}</span>
              </div>
              <div className="wm-sortie-m">
                <span>🔥 {s.flares} flares</span>
                <span style={{ color: '#34d399' }}>🌧 {s.rain} mm est.</span>
              </div>
            </div>
          ))}

          <div className="wm-ct wm-pad">☁️ Cloud-Cell Suitability</div>
          {cells.map((c) => (
            <div key={c.name} className="wm-cell">
              <div className="wm-cell-h">
                <span className="wm-cell-n">{c.name}</span>
                <span className="wm-cell-s" style={{ color: SUIT[c.suit] }}>{c.suit.toUpperCase()}</span>
              </div>
              <div className="wm-bar"><div className="wm-bar-f" style={{ width: `${c.cover}%`, background: SUIT[c.suit] }} /></div>
              <div className="wm-cell-m"><span>cover {c.cover}%</span><span>top {c.top} km</span></div>
            </div>
          ))}
        </aside>

        {/* CENTER MAP */}
        <main className="wm-map-wrap">
          <div ref={mapEl} className="wm-map" />

          {/* glassmorphism live chips */}
          <div className="wm-chips">
            <div className="wm-chip">🛩 {kpis.sorties} sorties</div>
            <div className="wm-chip">🎯 1 target</div>
            <div className="wm-chip">🔥 {kpis.flares} flares</div>
            <div className="wm-chip" style={{ color: '#34d399' }}>🌧 {fleet.estRain} mm est.</div>
          </div>

          {/* floating layer control */}
          <div className="wm-layers">
            <div className="wm-layers-t">LAYERS</div>
            {[['sorties', '🛩 Sorties'], ['target', '🎯 Target zone'], ['paths', '✈ Flight paths']].map(([k, lbl]) => (
              <div key={k} className="wm-ly" onClick={() => toggle(k)}>
                <span className={`wm-tg${show[k] ? ' on' : ''}`} /> {lbl}
              </div>
            ))}
          </div>

          {/* legend */}
          <div className="wm-legend">
            <div className="wm-legend-t">Sortie Status</div>
            {['completed', 'active', 'planned'].map((k) => (
              <div key={k} className="wm-li"><span className="wm-ld" style={{ background: SC[k] }} /> {SLABEL[k]}</div>
            ))}
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="wm-right">
          <div className="wm-card wm-hero">
            <div className="wm-ct">📈 Rainfall Enhancement</div>
            <div className="wm-hero-row">
              <span className="wm-hero-v">{kpis.addRain}</span>
              <span className="wm-hero-l">vs. unseeded control</span>
            </div>
            <div className="wm-hero-sub">{enh.seeded} mm seeded · {enh.control} mm control (24h gauge accum.)</div>
          </div>

          <div className="wm-card">
            <div className="wm-ct">🌧 Rainfall: Seeded vs Control <span className="wm-src">24h • gauge net</span></div>
            <div className="wm-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hours} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wmSeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#5a6478', fontSize: 6 }} interval={3} axisLine={{ stroke: 'rgba(255,255,255,.08)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#5a6478', fontSize: 6 }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 9, color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="seeded" name="Seeded" stroke="#22d3ee" strokeWidth={1.6} fill="url(#wmSeed)" />
                  <Line type="monotone" dataKey="control" name="Control" stroke="#64748b" strokeWidth={1.2} strokeDasharray="4 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="wm-clegend">
              <span><i style={{ background: '#22d3ee' }} /> Seeded</span>
              <span><i style={{ background: '#64748b' }} /> Control (dashed)</span>
            </div>
          </div>

          {sel && (
            <div className="wm-card wm-detail">
              <div className="wm-ct">🎯 Sortie Detail <span className="wm-src" style={{ color: SC[sel.status] }}>{SLABEL[sel.status]}</span></div>
              <div className="wm-detail-id">{sel.id}</div>
              <div className="wm-dr">
                <div className="wm-dri"><span>🔥 Flares</span><span>{sel.flares}</span></div>
                <div className="wm-dri"><span>🌧 Est. rain</span><span style={{ color: '#34d399' }}>{sel.rain} mm</span></div>
                <div className="wm-dri"><span>📍 Lat</span><span>{sel.lat.toFixed(3)}</span></div>
                <div className="wm-dri"><span>📍 Lng</span><span>{sel.lng.toFixed(3)}</span></div>
              </div>
            </div>
          )}

          <div className="wm-card wm-narr">
            <div className="wm-ct">🤖 Ops Narrative <span className="wm-src">auto-generated</span></div>
            <p>{narrative}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
