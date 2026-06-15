/* NETRA — Strategic Interdependence Intelligence Console.
   Faithful React port of erpdesign/NETRA/congonetra.jsx.
   Mapbox -> free Leaflet/OSM. Live ACLED/intel API calls -> embedded
   synthetic sample data. Everything below is SYNTHETIC. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './netra.css'

/* ---- severity palette (matches NETRA --crit/--hi/--elev/--mon) ---- */
const SEV = {
  critical: { c: '#f43f5e', label: 'CRITICAL' },
  high: { c: '#fb923c', label: 'HIGH' },
  elevated: { c: '#facc15', label: 'ELEVATED' },
  monitoring: { c: '#22d3ee', label: 'MONITORING' },
}
const sevC = (s) => (SEV[s] || SEV.monitoring).c

/* ---- DATA LAYERS switcher config (faithful keys/labels) ---- */
const LAYER_GROUPS = [
  {
    label: 'INTELLIGENCE SOURCES',
    items: [
      { key: 'geo', name: 'GEO EVENTS', tag: 'GEO' },
      { key: 'acled', name: 'ACLED HISTORICAL', tag: 'ACLED' },
      { key: 'shadow_broker', name: 'SHADOW BROKER', tag: 'SHADOW' },
    ],
  },
  {
    label: 'STRATEGIC INFRASTRUCTURE',
    items: [
      { key: 'pipelines', name: 'ENERGY PIPELINES' },
      { key: 'cables', name: 'SUBMARINE CABLES' },
      { key: 'waterways', name: 'STRATEGIC WATERWAYS' },
      { key: 'landing_points', name: 'LANDING POINTS' },
    ],
  },
]

/* ---- synthetic strategic events (geo + acled + shadow/air) ---- */
const EVENTS = [
  { id: 'EV-001', src: 'geo', sev: 'critical', title: 'OPEC+ supply cut shocks Brent above $108', cat: 'Energy Security', loc: 'Vienna', actor: 'OPEC+', flag: 'AT', lat: 48.21, lng: 16.37, ts: '14:22 UTC', summary: 'Coordinated production quota tightening propagates a price shock down the refined-fuel supply chain, hitting net-importer economies hardest.' },
  { id: 'EV-002', src: 'geo', sev: 'critical', title: 'Red Sea chokepoint disruption reroutes tankers', cat: 'Maritime', loc: 'Bab-el-Mandeb', actor: 'Multiple', flag: 'YE', lat: 12.58, lng: 43.33, ts: '13:05 UTC', summary: 'Container and crude carriers diverting around the Cape add ~14 days transit, inflating "distance inflation" on landlocked import routes.' },
  { id: 'EV-003', src: 'geo', sev: 'high', title: 'Katanga copperbelt diesel shortfall halts haul fleets', cat: 'Extractive Industry', loc: 'Lubumbashi', actor: 'DRC Mining', flag: 'CD', lat: -11.66, lng: 27.48, ts: '11:48 UTC', summary: 'SNEL grid instability forces generator reliance; >$100/bbl crude lifts mine OPEX and erodes state royalty capture.' },
  { id: 'EV-004', src: 'geo', sev: 'high', title: 'Subsidy rollback risk in Kinshasa fuel pumps', cat: 'Political Stability', loc: 'Kinshasa', actor: 'GoDRC', flag: 'CD', lat: -4.32, lng: 15.31, ts: '10:30 UTC', summary: 'Exhausted fiscal space narrows the runway for pump-price suppression; historical correlation with demonstrations elevated.' },
  { id: 'EV-005', src: 'geo', sev: 'elevated', title: 'CORAF refinery outage forces gasoline imports', cat: 'Energy Security', loc: 'Pointe-Noire', actor: 'Congo-B', flag: 'CG', lat: -4.78, lng: 11.86, ts: '09:14 UTC', summary: 'OPEC exporter paradox: domestic refining failure drives import of refined product at full market price despite crude exports.' },
  { id: 'EV-006', src: 'geo', sev: 'elevated', title: 'Oil-backed loan repayment absorbs price upside', cat: 'Sovereign Debt', loc: 'Brazzaville', actor: 'Congo-B', flag: 'CG', lat: -4.27, lng: 15.27, ts: '08:50 UTC', summary: 'Pre-pledged barrels to commodity traders mean treasury sees limited cash benefit from the rally.' },
  { id: 'EV-007', src: 'geo', sev: 'high', title: 'Indonesia widens energy import bill on rupiah slide', cat: 'Macro Exposure', loc: 'Jakarta', actor: 'GoI', flag: 'ID', lat: -6.21, lng: 106.85, ts: '07:32 UTC', summary: 'Net fuel importer status amplifies imported inflation; Pertamina subsidy load climbs with the global benchmark.' },
  { id: 'EV-008', src: 'acled', sev: 'critical', title: 'Armed clash near Goma supply corridor', cat: 'Conflict', loc: 'Goma', actor: 'Non-state', flag: 'CD', lat: -1.68, lng: 29.23, ts: 'D-2', summary: 'ACLED historical: violence along the eastern logistics artery threatens tank-truck convoys from Tanzania/Kenya.' },
  { id: 'EV-009', src: 'acled', sev: 'high', title: 'Protest activity over pump prices, Kinshasa', cat: 'Civil Unrest', loc: 'Kinshasa', actor: 'Civil', flag: 'CD', lat: -4.44, lng: 15.27, ts: 'D-5', summary: 'ACLED historical: demonstrations recorded following a fuel price adjustment event.' },
  { id: 'EV-010', src: 'acled', sev: 'elevated', title: 'Strike action at port logistics hub', cat: 'Labour', loc: 'Matadi', actor: 'Unions', flag: 'CD', lat: -5.82, lng: 13.46, ts: 'D-9', summary: 'ACLED historical: labour disruption at the Atlantic port slows inland fuel distribution.' },
  { id: 'EV-011', src: 'geo', sev: 'monitoring', title: 'Strait of Malacca traffic density nominal', cat: 'Maritime', loc: 'Malacca', actor: 'Regional', flag: 'MY', lat: 2.5, lng: 101.3, ts: '06:10 UTC', summary: 'Chokepoint throughput within seasonal band; watch maintained for cascade risk from Red Sea reroutes.' },
  { id: 'EV-012', src: 'geo', sev: 'monitoring', title: 'Gulf cable landing maintenance window', cat: 'Comms Infrastructure', loc: 'Marseille', actor: 'Carrier', flag: 'FR', lat: 43.3, lng: 5.37, ts: '05:00 UTC', summary: 'Scheduled landing-point works; redundancy adequate, monitoring only.' },
  { id: 'EV-013', src: 'shadow_broker', sev: 'critical', title: 'Unscheduled military transport, Horn of Africa', cat: 'Air Intel', loc: 'ADIZ', actor: 'Unknown', flag: 'SO', lat: 8.0, lng: 47.0, ts: 'CONTACT', summary: 'Shadow Broker: squawk anomaly on a heavy transport near a sensitive corridor.' },
  { id: 'EV-014', src: 'shadow_broker', sev: 'high', title: 'ISR loiter pattern over Mozambique Channel', cat: 'Air Intel', loc: 'Channel', actor: 'Unknown', flag: 'MZ', lat: -17.0, lng: 41.0, ts: 'TRACK', summary: 'Shadow Broker: persistent loiter consistent with maritime surveillance tasking.' },
  { id: 'EV-015', src: 'geo', sev: 'elevated', title: 'Strait of Hormuz insurance premia tick up', cat: 'Maritime', loc: 'Hormuz', actor: 'Insurers', flag: 'OM', lat: 26.57, lng: 56.25, ts: '04:20 UTC', summary: 'War-risk premia rising on tanker hulls transiting the chokepoint.' },
  { id: 'EV-016', src: 'geo', sev: 'monitoring', title: 'Suez Canal northbound queue clears', cat: 'Maritime', loc: 'Suez', actor: 'SCA', flag: 'EG', lat: 30.0, lng: 32.55, ts: '03:10 UTC', summary: 'Backlog normalised after weather delay; monitoring maintained.' },
]

/* ---- synthetic infrastructure overlays ---- */
const CABLES = [
  { name: 'SEA-ME-WE Synthetic', sev: 'monitoring', path: [[1.29, 103.85], [6.92, 79.86], [25.27, 55.30], [12.58, 43.33], [30.0, 32.55], [43.3, 5.37]] },
  { name: 'Atlantic-Equatorial Link', sev: 'monitoring', path: [[-4.78, 11.86], [-8.84, 13.23], [5.55, -0.20], [14.72, -17.47], [43.3, 5.37]] },
  { name: 'Indo-Pacific Trunk', sev: 'monitoring', path: [[-6.21, 106.85], [2.5, 101.3], [1.29, 103.85], [22.4, 114.1], [35.68, 139.69]] },
]
const PIPELINES = [
  { name: 'Trans-Sahara Gas (synthetic)', kind: 'gas', path: [[6.45, 3.39], [9.08, 7.49], [16.97, 7.99], [36.75, 3.06]] },
  { name: 'East Africa Crude (synthetic)', kind: 'oil', path: [[-1.29, 36.82], [0.35, 32.58], [-6.16, 39.20]] },
]
const WATERWAYS = [
  { name: 'Bab-el-Mandeb', lat: 12.58, lng: 43.33 },
  { name: 'Strait of Hormuz', lat: 26.57, lng: 56.25 },
  { name: 'Strait of Malacca', lat: 2.5, lng: 101.3 },
  { name: 'Suez Canal', lat: 30.0, lng: 32.55 },
]
const LANDING_POINTS = [
  { name: 'Marseille LP', lat: 43.3, lng: 5.37 },
  { name: 'Pointe-Noire LP', lat: -4.78, lng: 11.86 },
  { name: 'Jakarta LP', lat: -6.21, lng: 106.85 },
  { name: 'Singapore LP', lat: 1.29, lng: 103.85 },
]
/* connection lines DIRECT/INDIRECT between an event and an exposed actor */
const LINKS = [
  { a: [48.21, 16.37], b: [-11.66, 27.48], rel: 'direct' },
  { a: [48.21, 16.37], b: [-6.21, 106.85], rel: 'direct' },
  { a: [12.58, 43.33], b: [-4.78, 11.86], rel: 'indirect' },
  { a: [-4.32, 15.31], b: [-1.68, 29.23], rel: 'indirect' },
]

/* ---- watchlist countries (from COUNTRY_CONFIGS) ---- */
const COUNTRIES = [
  {
    key: 'indonesia', name: 'Indonesia', label: 'Indonesia', flag: 'id', sev: 'high', lat: -6.21, lng: 106.85,
    persona: '"The Net Importer: Imported Inflation Through the Subsidy Channel"',
    sections: {
      strategy: 'Importir bersih BBM dengan beban subsidi Pertamina yang sensitif terhadap benchmark global. Setiap lonjakan harga minyak langsung menekan ruang fiskal dan memperlebar defisit transaksi berjalan.',
      relational: 'Bergantung pada pasokan dari Timur Tengah dan Singapura. Eksposur tinggi terhadap gangguan Selat Malaka dan Hormuz pada rantai pasok energi.',
      systemic: 'Pelemahan rupiah memperkuat efek imported inflation; harga pangan dan logistik domestik ikut terkerek naik.',
      regional: 'Aktor poros di Indo-Pasifik; stabilitas harga energi domestik berdampak pada sentimen politik nasional.',
    },
  },
  {
    key: 'drc', name: 'Republik Demokratik Kongo', label: 'Republik Demokratik Kongo (DRC)', flag: 'cd', sev: 'critical', lat: -4.32, lng: 15.31,
    persona: '"The Fragile Giant: High Costs in the Heart of the Mineral Supply Chain"',
    sections: {
      strategy: 'Importir bersih produk minyak olahan meski memiliki cadangan mentah di Muanda. Kapasitas kilang domestik nyaris nihil, sehingga kenaikan harga global langsung menjadi kenaikan biaya hidup.',
      relational: 'Distribusi BBM ke timur (Goma/Bukavu) bergantung pada truk tangki ribuan kilometer dari pelabuhan Tanzania/Kenya — menciptakan "inflasi jarak" yang mematikan.',
      systemic: 'Sektor tambang Grand Katanga (tembaga/kobalt) menyedot diesel masif; harga >$100/barel melonjakkan OPEX dan menggerus royalti negara.',
      regional: 'Harga BBM adalah indikator stabilitas politik. Habisnya ruang fiskal subsidi berisiko memicu demonstrasi besar di Kinshasa.',
    },
  },
  {
    key: 'cg', name: 'Republik Kongo', label: 'Republik Kongo (Kongo-Brazzaville)', flag: 'cg', sev: 'elevated', lat: -4.27, lng: 15.27,
    persona: '"The Oil-Rich Debtor: The Illusion of Wealth Amidst Quotas and Debt"',
    sections: {
      strategy: 'Anggota OPEC dengan 80-90% pendapatan ekspor dari minyak mentah, namun kilang tunggal CORAF sering gangguan — eksportir yang justru mengimpor bensin olahan.',
      relational: 'Produksi sudah "dijanjikan" sebagai pembayaran oil-backed loans ke trader global (Glencore/Trafigura) dan kreditur Tiongkok; kas negara tidak otomatis penuh saat harga naik.',
      systemic: 'Kuota produksi OPEC membatasi kemampuan memanfaatkan harga tinggi; kehilangan volume sering lebih menyakitkan daripada keuntungan harga.',
      regional: 'Kesenjangan fiskal vs rakyat melebar: elit melihat perbaikan di atas kertas, masyarakat menanggung inflasi impor.',
    },
  },
]

const PROFILE_TABS = [
  { key: 'strategy', label: 'STRATEGIC' },
  { key: 'relational', label: 'RELATIONAL' },
  { key: 'systemic', label: 'SYSTEMIC' },
  { key: 'regional', label: 'REGIONAL' },
]

const MODES = [
  { key: 'events', label: 'EVENTS' },
  { key: 'network', label: 'NETWORK' },
  { key: 'crossborder', label: 'CROSS-BORDER' },
]

const fmtPill = '01 — 14 Jun 2026'

export default function NetraDashboard() {
  const mapEl = useRef(null), mapRef = useRef(null)
  const groupsRef = useRef({})
  const didFitRef = useRef(false)
  const [layers, setLayers] = useState({ geo: true, acled: true, shadow_broker: false, pipelines: false, cables: true, waterways: true, landing_points: false })
  const [layerOpen, setLayerOpen] = useState(false)
  const [sideOpen, setSideOpen] = useState(true)
  const [mode, setMode] = useState('events')
  const [q, setQ] = useState('')
  const [selEvent, setSelEvent] = useState(null)
  const [selCountry, setSelCountry] = useState(null)
  const [tab, setTab] = useState('strategy')
  const [filterOpen, setFilterOpen] = useState(false)
  const [legend, setLegend] = useState({ critical: true, high: true, elevated: true, monitoring: true, direct: true, indirect: true })

  const isShadow = layers.shadow_broker
  const title = useMemo(() => {
    const on = Object.entries(layers).filter(([, v]) => v).map(([k]) => k)
    const intel = on.filter((k) => ['geo', 'acled', 'shadow_broker'].includes(k))
    if (intel.length > 1) return 'Multi-Layer View'
    if (intel[0] === 'acled') return 'Acled Historical Events'
    if (intel[0] === 'shadow_broker') return 'Shadow Broker'
    return 'Maps Events'
  }, [layers])

  const visibleEvents = useMemo(() => EVENTS.filter((e) => {
    if (!layers[e.src]) return false
    if (!legend[e.sev]) return false
    if (q && !(e.title + e.loc + e.actor).toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [layers, legend, q])

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, elevated: 0, monitoring: 0 }
    visibleEvents.forEach((e) => c[e.sev]++)
    return c
  }, [visibleEvents])

  /* ---- MAP INIT (Leaflet, replaces Mapbox) ---- */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, {
      center: [8, 40], zoom: 3, zoomControl: false, worldCopyJump: true, minZoom: 2,
      scrollWheelZoom: true, doubleClickZoom: true, zoomDelta: 0.5, zoomSnap: 0.25,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 }).addTo(m)
    mapRef.current = m

    const g = {}
    g.geo = L.layerGroup()
    g.acled = L.layerGroup()
    g.shadow_broker = L.layerGroup()
    g.cables = L.layerGroup()
    g.pipelines = L.layerGroup()
    g.waterways = L.layerGroup()
    g.landing_points = L.layerGroup()
    g.links = L.layerGroup()

    EVENTS.forEach((e) => {
      const col = sevC(e.sev)
      const square = e.src === 'shadow_broker'
      const mk = L.circleMarker([e.lat, e.lng], {
        radius: e.sev === 'critical' ? 7 : 5,
        color: '#141414', weight: 1.5, fillColor: col, fillOpacity: 0.95,
      })
      mk.bindTooltip(`<b style="color:${col}">${e.title}</b><br/><span style="color:#94a3b8">${e.cat} · ${e.loc}</span><br/><span style="color:${col};font-weight:700">${(SEV[e.sev] || {}).label}</span> · ${e.ts}`, { sticky: true, className: 'netra-tt' })
      mk.on('click', () => setSelEvent((p) => (p?.id === e.id ? null : e)))
      if (square) mk.setStyle({ radius: 4 })
      mk.addTo(g[e.src])
    })

    CABLES.forEach((cb) => {
      L.polyline(cb.path, { color: '#8b5cf6', weight: 1.8, opacity: 0.85, className: 'nx-flow nx-flow-c' }).bindTooltip(`Cable · ${cb.name}`, { className: 'netra-tt' }).addTo(g.cables)
    })
    PIPELINES.forEach((p) => {
      L.polyline(p.path, { color: p.kind === 'gas' ? '#f97316' : '#eab308', weight: 2, opacity: 0.8 }).bindTooltip(`${p.kind.toUpperCase()} · ${p.name}`, { className: 'netra-tt' }).addTo(g.pipelines)
    })
    WATERWAYS.forEach((w) => {
      L.circleMarker([w.lat, w.lng], { radius: 8, color: '#22d3ee', weight: 1.4, fillColor: '#22d3ee', fillOpacity: 0.12 }).bindTooltip(`Chokepoint · ${w.name}`, { className: 'netra-tt' }).addTo(g.waterways)
    })
    LANDING_POINTS.forEach((lp) => {
      L.circleMarker([lp.lat, lp.lng], { radius: 4, color: '#fff', weight: 1, fillColor: '#10b981', fillOpacity: 1 }).bindTooltip(`Landing point · ${lp.name}`, { className: 'netra-tt' }).addTo(g.landing_points)
    })
    LINKS.forEach((ln) => {
      const direct = ln.rel === 'direct'
      L.polyline([ln.a, ln.b], {
        color: direct ? '#f43f5e' : '#fb923c',
        weight: direct ? 1.8 : 1.4,
        opacity: direct ? 0.85 : 0.6,
        className: direct ? 'nx-flow nx-flow-d' : 'nx-flow nx-flow-i',
      }).addTo(g.links)
    })
    g.links.addTo(m)
    groupsRef.current = g

    // "full" initial view — fit all signals into frame
    const pts = EVENTS.map((e) => [e.lat, e.lng])
    const fitAll = () => { if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.25), { animate: false }) }

    // Leaflet computes tile coverage from the container size at init; when the
    // demo mounts inside a lazy/Suspense layout the container isn't sized yet,
    // leaving empty bands. Re-measure once layout settles + on every resize.
    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false }))
    ro.observe(mapEl.current)
    const t1 = setTimeout(() => { m.invalidateSize({ animate: false }); fitAll() }, 60)
    const t2 = setTimeout(() => { m.invalidateSize({ animate: false }); fitAll() }, 350)

    return () => { clearTimeout(t1); clearTimeout(t2); ro.disconnect(); m.remove(); mapRef.current = null }
  }, [])

  /* ---- toggle map layers ---- */
  useEffect(() => {
    const m = mapRef.current, g = groupsRef.current
    if (!m || !g.geo) return
    ;['geo', 'acled', 'shadow_broker', 'cables', 'pipelines', 'waterways', 'landing_points'].forEach((k) => {
      const grp = g[k]
      if (layers[k] && !m.hasLayer(grp)) grp.addTo(m)
      if (!layers[k] && m.hasLayer(grp)) m.removeLayer(grp)
    })
  }, [layers])

  /* ---- map movement: zoom to selection, auto zoom-out on deselect ---- */
  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    if (selEvent) { m.flyTo([selEvent.lat, selEvent.lng], 5, { duration: 0.9 }); didFitRef.current = true; return }
    if (selCountry) { m.flyTo([selCountry.lat, selCountry.lng], 4, { duration: 0.9 }); didFitRef.current = true; return }
    // nothing selected — skip the very first run (init handles it), otherwise zoom back out to full
    if (!didFitRef.current) { didFitRef.current = true; return }
    m.flyToBounds(L.latLngBounds(EVENTS.map((e) => [e.lat, e.lng])).pad(0.25), { duration: 0.9 })
  }, [selEvent, selCountry])

  const toggleLayer = (k) => setLayers((s) => ({ ...s, [k]: !s[k] }))
  const toggleLegend = (k) => setLegend((s) => ({ ...s, [k]: !s[k] }))
  const pickCountry = (c) => { setSelCountry(c); setSelEvent(null) }

  return (
    <div className="netra-dash">
      {/* ===== TOP BAR ===== */}
      <div className="nx-top">
        <div className="nx-head-left">
          <h1 className="nx-title">{title}</h1>
          <p className="nx-sub">
            Strategic Interdependence
            <span className="nx-tag geo">GEO EVENTS</span>
            <span className="nx-tag acled">ACLED HISTORICAL</span>
          </p>
        </div>
        <div className="nx-top-right">
          <div className="nx-date-pill"><span className="nx-cal">📅</span><span className="nx-pill-txt">{fmtPill}</span><span className="nx-caret">▾</span></div>
          <button className={`nx-filter-btn ${filterOpen ? 'active' : ''}`} onClick={() => setFilterOpen((v) => !v)}>⚙ FILTERS</button>
          {filterOpen && (
            <div className="nx-filter-panel">
              <div className="fd-header"><span className="fd-title">DATA FILTERS</span><button className="fd-x" onClick={() => setFilterOpen(false)}>✕</button></div>
              <div className="fd-body">
                <div className="fd-section">
                  <div className="fd-section-title">GEOGRAPHIC FILTER</div>
                  <div className="nx-preset-grid">
                    {['ALL REGIONS', 'AFRICA', 'INDO-PACIFIC', 'MIDDLE EAST', 'EUROPE'].map((r, i) => (
                      <div key={r} className={`preset-item ${i === 0 ? 'active' : ''}`}>{r}</div>
                    ))}
                  </div>
                </div>
                <div className="fd-section">
                  <div className="fd-section-title">SEVERITY</div>
                  <div className="nx-preset-grid">
                    {Object.keys(SEV).map((s) => (
                      <div key={s} className={`preset-item ${legend[s] ? 'active' : ''}`} onClick={() => toggleLegend(s)} style={legend[s] ? { color: sevC(s), borderColor: sevC(s) } : null}>{SEV[s].label}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="fd-footer"><button className="nx-apply" onClick={() => setFilterOpen(false)}>APPLY FILTERS</button></div>
            </div>
          )}
        </div>
      </div>

      <div className="nx-body" style={{ gridTemplateColumns: `${sideOpen ? '320px ' : ''}1fr${(selEvent || selCountry) ? ' 380px' : ''}` }}>
        {/* ===== LEFT SIDEBAR ===== */}
        {sideOpen && (
        <div className="nx-sidebar">
          <div className="nx-sh">
            <div className="nx-sh-title">{title.toUpperCase()} DIRECTORY<button className="nx-side-x" title="Hide panel" onClick={() => setSideOpen(false)}>‹</button></div>
            <div className="nx-search">
              <span className="nx-search-ic">🔍</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, actors, regions…" />
            </div>
            <div className="nx-mode-sw">
              {MODES.map((mo) => (
                <button key={mo.key} className={`nx-mode-btn ${mode === mo.key ? 'active' : ''}`} onClick={() => setMode(mo.key)}>{mo.label}</button>
              ))}
            </div>
          </div>

          <div className="nx-evlist">
            <div className="nx-list-cap">{visibleEvents.length} SIGNALS · LIVE FEED</div>
            {visibleEvents.length === 0 && <div className="nx-empty">No events found in this category.</div>}
            {visibleEvents.map((e) => (
              <div key={e.id} className={`nx-ecard ${selEvent?.id === e.id ? 'active' : ''}`} onClick={() => setSelEvent(selEvent?.id === e.id ? null : e)}>
                <div className="nx-ec-top">
                  <span className="nx-ec-dot" data-sev={e.sev} />
                  <span className="nx-ec-sev" data-sev={e.sev}>{SEV[e.sev].label}</span>
                  <span className="nx-ec-src">{e.src === 'acled' ? 'ACLED' : e.src === 'shadow_broker' ? 'SHADOW' : 'GEO'}</span>
                  <span className="nx-ec-ts">{e.ts}</span>
                </div>
                <div className="nx-ec-title">{e.title}</div>
                <div className="nx-ec-meta">
                  <img className="nx-flag" src={`https://flagcdn.com/${e.flag.toLowerCase()}.svg`} alt="" />
                  <span>{e.cat} · {e.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ===== MAP ===== */}
        <div className="nx-map-wrap">
          {!sideOpen && (
            <button className="nx-side-show" title="Show signal panel" onClick={() => setSideOpen(true)}>› SIGNALS</button>
          )}
          <div ref={mapEl} className="netra-map" />

          {/* floating DATA LAYERS switcher */}
          <div className={`nx-layerswitch ${layerOpen ? '' : 'collapsed'}`}>
            <div className="nx-ls-head" onClick={() => setLayerOpen((v) => !v)}>
              <span>DATA LAYERS</span><span className="nx-ls-caret">{layerOpen ? '▾' : '◂'}</span>
            </div>
            {layerOpen ? (
              <div className="nx-ls-body">
                {LAYER_GROUPS.map((grp) => (
                  <div key={grp.label}>
                    <div className="nx-ls-group">{grp.label}</div>
                    {grp.items.map((it) => (
                      <button key={it.key} className={`nx-layer-btn ${layers[it.key] ? 'active' : ''}`} onClick={() => toggleLayer(it.key)}>
                        <span className={`nx-cb ${layers[it.key] ? 'on' : ''}`}>{layers[it.key] ? '✓' : ''}</span>
                        {it.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="nx-ls-chips">
                {['GEO', 'ACLED', 'SHADOW'].map((c) => <span key={c}>{c}</span>)}
              </div>
            )}
          </div>

          {/* mini metric chips */}
          <div className="nx-map-chips">
            <div className="nx-mc"><span className="nx-mc-dot" style={{ background: SEV.critical.c }} />{counts.critical} CRIT</div>
            <div className="nx-mc"><span className="nx-mc-dot" style={{ background: SEV.high.c }} />{counts.high} HIGH</div>
            <div className="nx-mc"><span className="nx-mc-dot" style={{ background: SEV.elevated.c }} />{counts.elevated} ELEV</div>
            <div className="nx-mc"><span className="nx-mc-dot" style={{ background: SEV.monitoring.c }} />{counts.monitoring} MON</div>
          </div>

          {/* watchlist (cross-border actors) */}
          <div className="nx-watch">
            <div className="nx-watch-t">WATCHLIST · EXPOSED ACTORS</div>
            {COUNTRIES.map((c) => (
              <div key={c.key} className={`nx-watch-row ${selCountry?.key === c.key ? 'active' : ''}`} onClick={() => pickCountry(c)}>
                <img className="nx-flag" src={`https://flagcdn.com/${c.flag}.svg`} alt="" />
                <span className="nx-watch-name">{c.label}</span>
                <span className="nx-watch-sev" data-sev={c.sev}>{SEV[c.sev].label}</span>
              </div>
            ))}
          </div>

          {/* LEGEND */}
          <div className="nx-legend">
            <span className="nx-lg-t">LEGEND</span>
            <span className="nx-lg-t" style={{ color: '#ef4444', opacity: 0.8 }}>{isShadow ? 'AIR INTEL' : 'EVENTS'}</span>
            {(['critical', 'high', 'elevated', 'monitoring']).map((s) => (
              <span key={s} className={`nx-lg-i ${legend[s] ? '' : 'dimmed'}`} onClick={() => toggleLegend(s)}>
                <span className="nx-lg-dot" style={{ background: sevC(s) }} />
                {isShadow ? { critical: 'DANGER', high: 'ALERT', elevated: 'NORMAL', monitoring: 'GROUND' }[s] : SEV[s].label}
              </span>
            ))}
            <span className="nx-lg-div" />
            <span className={`nx-lg-i ${legend.direct ? '' : 'dimmed'}`} onClick={() => toggleLegend('direct')}><span className="nx-lg-ln d" />DIRECT</span>
            <span className={`nx-lg-i ${legend.indirect ? '' : 'dimmed'}`} onClick={() => toggleLegend('indirect')}><span className="nx-lg-ln i" />INDIRECT</span>
          </div>
        </div>

        {/* ===== RIGHT DETAIL PANEL (only when a point is selected) ===== */}
        {(selEvent || selCountry) && (
        <div className="nx-detail">
          <button className="nx-d-close" title="Close" onClick={() => { setSelEvent(null); setSelCountry(null) }}>✕</button>
          {selEvent ? (
            <>
              <div className="nx-d-head">
                <div className="nx-d-badge" data-sev={selEvent.sev}>{SEV[selEvent.sev].label}</div>
                <div className="nx-d-src">{selEvent.src === 'acled' ? 'ACLED HISTORICAL' : selEvent.src === 'shadow_broker' ? 'SHADOW BROKER' : 'GEO EVENT'} · {selEvent.id}</div>
                <h2 className="nx-d-title">{selEvent.title}</h2>
                <div className="nx-d-meta">
                  <img className="nx-flag" src={`https://flagcdn.com/${selEvent.flag.toLowerCase()}.svg`} alt="" />
                  <span>{selEvent.cat} · {selEvent.loc} · {selEvent.ts}</span>
                </div>
              </div>
              <div className="nx-d-section">
                <div className="nx-d-label">⚠ STRATEGIC ASSESSMENT</div>
                <div className="nx-d-text">{selEvent.summary}</div>
              </div>
              <div className="nx-d-section">
                <div className="nx-d-label">🔗 DIRECT STRATEGIC IMPACT</div>
                {COUNTRIES.map((c) => (
                  <div key={c.key} className="nx-impact-row" onClick={() => pickCountry(c)}>
                    <img className="nx-flag" src={`https://flagcdn.com/${c.flag}.svg`} alt="" />
                    <span className="nx-impact-name">{c.label}</span>
                    <span className="nx-impact-sev" data-sev={c.sev}>{SEV[c.sev].label}</span>
                  </div>
                ))}
              </div>
              <button className="nx-d-back" onClick={() => setSelEvent(null)}>{selCountry ? '← BACK TO COUNTRY PROFILE' : '← CLOSE'}</button>
            </>
          ) : selCountry ? (
            <>
              <div className="nx-d-head">
                <div className="nx-d-flag-big">
                  <img src={`https://flagcdn.com/${selCountry.flag}.svg`} alt="" />
                  <div>
                    <div className="nx-d-badge" data-sev={selCountry.sev}>{SEV[selCountry.sev].label}</div>
                    <h2 className="nx-d-title">{selCountry.label}</h2>
                  </div>
                </div>
                <div className="nx-d-persona">{selCountry.persona}</div>
              </div>

              <div className="nx-d-tabs">
                {PROFILE_TABS.map((t) => (
                  <button key={t.key} className={`nx-d-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
                ))}
              </div>

              <div className="nx-d-section">
                <div className="nx-d-label">{(PROFILE_TABS.find((t) => t.key === tab) || {}).label} ANALYSIS</div>
                <div className="nx-d-text">{selCountry.sections[tab]}</div>
              </div>

              <div className="nx-d-section">
                <div className="nx-d-label">📊 EXPOSURE INDEX</div>
                <div className="nx-expo">
                  {[['Energy', 86], ['Maritime', 72], ['Fiscal', 64], ['Political', 78]].map(([k, v]) => (
                    <div key={k} className="nx-expo-row">
                      <span className="nx-expo-k">{k}</span>
                      <span className="nx-expo-bar"><span style={{ width: `${v}%`, background: sevC(selCountry.sev) }} /></span>
                      <span className="nx-expo-v">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nx-d-section">
                <div className="nx-d-label">🎯 RELATED SIGNALS</div>
                {EVENTS.filter((e) => e.flag.toLowerCase() === selCountry.flag).slice(0, 4).map((e) => (
                  <div key={e.id} className="nx-rel-row" onClick={() => setSelEvent(e)}>
                    <span className="nx-ec-dot" data-sev={e.sev} />
                    <span className="nx-rel-title">{e.title}</span>
                  </div>
                ))}
                {EVENTS.filter((e) => e.flag.toLowerCase() === selCountry.flag).length === 0 && <div className="nx-d-text" style={{ opacity: 0.6 }}>No direct signals in current window.</div>}
              </div>
            </>
          ) : null}
        </div>
        )}
      </div>
    </div>
  )
}
