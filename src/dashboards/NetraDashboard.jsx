/* NETRA — strategic interdependence console.

   A React port of an internal intelligence console: Mapbox became Leaflet
   with OpenStreetMap tiles, and the live ACLED and intel feeds became
   embedded sample data. Every event, link and country note is synthetic.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useChartTheme from './ui/chartTheme'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Chip, Status, Segment, List, Row, MapOverlay, DashIcon,
} from './ui'

/* Severity maps onto the shared status vocabulary. */
const SEV = {
  critical: { label: 'Critical', level: 'critical' },
  high: { label: 'High', level: 'serious' },
  elevated: { label: 'Elevated', level: 'warning' },
  monitoring: { label: 'Monitoring', level: 'good' },
}
const SEV_ORDER = ['critical', 'high', 'elevated', 'monitoring']

const LAYER_GROUPS = [
  {
    label: 'Intelligence sources',
    items: [
      { key: 'geo', name: 'Geo events', icon: 'globe' },
      { key: 'acled', name: 'ACLED historical', icon: 'database' },
      { key: 'shadow_broker', name: 'Air intel', icon: 'satellite' },
    ],
  },
  {
    label: 'Strategic infrastructure',
    items: [
      { key: 'pipelines', name: 'Energy pipelines', icon: 'pipeline' },
      { key: 'cables', name: 'Submarine cables', icon: 'waves' },
      { key: 'waterways', name: 'Strategic waterways', icon: 'target' },
      { key: 'landing_points', name: 'Landing points', icon: 'map' },
    ],
  },
]

const EVENTS = [
  { id: 'EV-001', src: 'geo', sev: 'critical', title: 'OPEC+ supply cut shocks Brent above $108', cat: 'Energy Security', loc: 'Vienna', actor: 'OPEC+', lat: 48.21, lng: 16.37, ts: '14:22 UTC', summary: 'Coordinated production quota tightening propagates a price shock down the refined-fuel supply chain, hitting net-importer economies hardest.' },
  { id: 'EV-002', src: 'geo', sev: 'critical', title: 'Red Sea chokepoint disruption reroutes tankers', cat: 'Maritime', loc: 'Bab-el-Mandeb', actor: 'Multiple', lat: 12.58, lng: 43.33, ts: '13:05 UTC', summary: 'Container and crude carriers diverting around the Cape add about 14 days transit, inflating distance costs on landlocked import routes.' },
  { id: 'EV-003', src: 'geo', sev: 'high', title: 'Katanga copperbelt diesel shortfall halts haul fleets', cat: 'Extractive Industry', loc: 'Lubumbashi', actor: 'DRC Mining', lat: -11.66, lng: 27.48, ts: '11:48 UTC', summary: 'Grid instability forces generator reliance; crude above $100/bbl lifts mine operating cost and erodes state royalty capture.' },
  { id: 'EV-004', src: 'geo', sev: 'high', title: 'Subsidy rollback risk in Kinshasa fuel pumps', cat: 'Political Stability', loc: 'Kinshasa', actor: 'GoDRC', lat: -4.32, lng: 15.31, ts: '10:30 UTC', summary: 'Exhausted fiscal space narrows the runway for pump-price suppression; the historical correlation with demonstrations is elevated.' },
  { id: 'EV-005', src: 'geo', sev: 'elevated', title: 'CORAF refinery outage forces gasoline imports', cat: 'Energy Security', loc: 'Pointe-Noire', actor: 'Congo-B', lat: -4.78, lng: 11.86, ts: '09:14 UTC', summary: 'The exporter paradox: domestic refining failure drives import of refined product at full market price despite crude exports.' },
  { id: 'EV-006', src: 'geo', sev: 'elevated', title: 'Oil-backed loan repayment absorbs price upside', cat: 'Sovereign Debt', loc: 'Brazzaville', actor: 'Congo-B', lat: -4.27, lng: 15.27, ts: '08:50 UTC', summary: 'Pre-pledged barrels to commodity traders mean the treasury sees limited cash benefit from the rally.' },
  { id: 'EV-007', src: 'geo', sev: 'high', title: 'Indonesia widens energy import bill on rupiah slide', cat: 'Macro Exposure', loc: 'Jakarta', actor: 'GoI', lat: -6.21, lng: 106.85, ts: '07:32 UTC', summary: 'Net fuel importer status amplifies imported inflation; the subsidy load climbs with the global benchmark.' },
  { id: 'EV-008', src: 'acled', sev: 'critical', title: 'Armed clash near Goma supply corridor', cat: 'Conflict', loc: 'Goma', actor: 'Non-state', lat: -1.68, lng: 29.23, ts: 'D-2', summary: 'Historical record: violence along the eastern logistics artery threatens tank-truck convoys from Tanzania and Kenya.' },
  { id: 'EV-009', src: 'acled', sev: 'high', title: 'Protest activity over pump prices, Kinshasa', cat: 'Civil Unrest', loc: 'Kinshasa', actor: 'Civil', lat: -4.44, lng: 15.27, ts: 'D-5', summary: 'Historical record: demonstrations recorded following a fuel price adjustment.' },
  { id: 'EV-010', src: 'acled', sev: 'elevated', title: 'Strike action at port logistics hub', cat: 'Labour', loc: 'Matadi', actor: 'Unions', lat: -5.82, lng: 13.46, ts: 'D-9', summary: 'Historical record: labour disruption at the Atlantic port slows inland fuel distribution.' },
  { id: 'EV-011', src: 'geo', sev: 'monitoring', title: 'Strait of Malacca traffic density nominal', cat: 'Maritime', loc: 'Malacca', actor: 'Regional', lat: 2.5, lng: 101.3, ts: '06:10 UTC', summary: 'Chokepoint throughput sits within the seasonal band; watch maintained for cascade risk from Red Sea reroutes.' },
  { id: 'EV-012', src: 'geo', sev: 'monitoring', title: 'Gulf cable landing maintenance window', cat: 'Comms Infrastructure', loc: 'Marseille', actor: 'Carrier', lat: 43.3, lng: 5.37, ts: '05:00 UTC', summary: 'Scheduled landing-point works; redundancy adequate, monitoring only.' },
  { id: 'EV-013', src: 'shadow_broker', sev: 'critical', title: 'Unscheduled military transport, Horn of Africa', cat: 'Air Intel', loc: 'ADIZ', actor: 'Unknown', lat: 8.0, lng: 47.0, ts: 'CONTACT', summary: 'Squawk anomaly on a heavy transport near a sensitive corridor.' },
  { id: 'EV-014', src: 'shadow_broker', sev: 'high', title: 'ISR loiter pattern over Mozambique Channel', cat: 'Air Intel', loc: 'Channel', actor: 'Unknown', lat: -17.0, lng: 41.0, ts: 'TRACK', summary: 'Persistent loiter consistent with maritime surveillance tasking.' },
  { id: 'EV-015', src: 'geo', sev: 'elevated', title: 'Strait of Hormuz insurance premia tick up', cat: 'Maritime', loc: 'Hormuz', actor: 'Insurers', lat: 26.57, lng: 56.25, ts: '04:20 UTC', summary: 'War-risk premia rising on tanker hulls transiting the chokepoint.' },
  { id: 'EV-016', src: 'geo', sev: 'monitoring', title: 'Suez Canal northbound queue clears', cat: 'Maritime', loc: 'Suez', actor: 'SCA', lat: 30.0, lng: 32.55, ts: '03:10 UTC', summary: 'Backlog normalised after weather delay; monitoring maintained.' },
]

const CABLES = [
  { name: 'SEA-ME-WE (synthetic)', path: [[1.29, 103.85], [6.92, 79.86], [25.27, 55.30], [12.58, 43.33], [30.0, 32.55], [43.3, 5.37]] },
  { name: 'Atlantic-Equatorial Link', path: [[-4.78, 11.86], [-8.84, 13.23], [5.55, -0.20], [14.72, -17.47], [43.3, 5.37]] },
  { name: 'Indo-Pacific Trunk', path: [[-6.21, 106.85], [2.5, 101.3], [1.29, 103.85], [22.4, 114.1], [35.68, 139.69]] },
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

/* Direct and indirect exposure lines between an event and an exposed actor. */
const LINKS = [
  { a: [48.21, 16.37], b: [-11.66, 27.48], rel: 'direct' },
  { a: [48.21, 16.37], b: [-6.21, 106.85], rel: 'direct' },
  { a: [12.58, 43.33], b: [-4.78, 11.86], rel: 'indirect' },
  { a: [-4.32, 15.31], b: [-1.68, 29.23], rel: 'indirect' },
]

const COUNTRIES = [
  {
    key: 'indonesia', name: 'Indonesia', sev: 'high', lat: -6.21, lng: 106.85,
    persona: 'The net importer: imported inflation through the subsidy channel',
    sections: {
      strategy: 'Importir bersih BBM dengan beban subsidi Pertamina yang sensitif terhadap benchmark global. Setiap lonjakan harga minyak langsung menekan ruang fiskal dan memperlebar defisit transaksi berjalan.',
      relational: 'Bergantung pada pasokan dari Timur Tengah dan Singapura. Eksposur tinggi terhadap gangguan Selat Malaka dan Hormuz pada rantai pasok energi.',
      systemic: 'Pelemahan rupiah memperkuat efek imported inflation; harga pangan dan logistik domestik ikut terkerek naik.',
      regional: 'Aktor poros di Indo-Pasifik; stabilitas harga energi domestik berdampak pada sentimen politik nasional.',
    },
  },
  {
    key: 'drc', name: 'DR Congo', sev: 'critical', lat: -4.32, lng: 15.31,
    persona: 'The fragile giant: high costs in the heart of the mineral supply chain',
    sections: {
      strategy: 'Importir bersih produk minyak olahan meski memiliki cadangan mentah di Muanda. Kapasitas kilang domestik nyaris nihil, sehingga kenaikan harga global langsung menjadi kenaikan biaya hidup.',
      relational: 'Distribusi BBM ke timur (Goma/Bukavu) bergantung pada truk tangki ribuan kilometer dari pelabuhan Tanzania dan Kenya, menciptakan inflasi jarak yang mematikan.',
      systemic: 'Sektor tambang Grand Katanga (tembaga dan kobalt) menyedot diesel masif; harga di atas $100 per barel melonjakkan OPEX dan menggerus royalti negara.',
      regional: 'Harga BBM adalah indikator stabilitas politik. Habisnya ruang fiskal subsidi berisiko memicu demonstrasi besar di Kinshasa.',
    },
  },
  {
    key: 'cg', name: 'Republic of the Congo', sev: 'elevated', lat: -4.27, lng: 15.27,
    persona: 'The oil-rich debtor: the illusion of wealth amid quotas and debt',
    sections: {
      strategy: 'Anggota OPEC dengan 80 sampai 90% pendapatan ekspor dari minyak mentah, namun kilang tunggal CORAF sering gangguan, sehingga eksportir justru mengimpor bensin olahan.',
      relational: 'Produksi sudah dijanjikan sebagai pembayaran oil-backed loans ke trader global dan kreditur Tiongkok; kas negara tidak otomatis penuh saat harga naik.',
      systemic: 'Kuota produksi OPEC membatasi kemampuan memanfaatkan harga tinggi; kehilangan volume sering lebih menyakitkan daripada keuntungan harga.',
      regional: 'Kesenjangan fiskal melebar: elit melihat perbaikan di atas kertas, masyarakat menanggung inflasi impor.',
    },
  },
]

const PROFILE_TABS = [
  { value: 'strategy', label: 'Strategic' },
  { value: 'relational', label: 'Relational' },
  { value: 'systemic', label: 'Systemic' },
  { value: 'regional', label: 'Regional' },
]

const PERIOD = '01 to 14 Jun 2026'

export default function NetraDashboard() {
  const t = useChartTheme()

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const groupsRef = useRef({})
  const didFitRef = useRef(false)

  const [layers, setLayers] = useState({
    geo: true, acled: true, shadow_broker: false,
    pipelines: false, cables: true, waterways: true, landing_points: false,
  })
  const [layerOpen, setLayerOpen] = useState(false)
  const [q, setQ] = useState('')
  const [selEvent, setSelEvent] = useState(null)
  const [selCountry, setSelCountry] = useState(null)
  const [tab, setTab] = useState('strategy')
  const [legend, setLegend] = useState({ critical: true, high: true, elevated: true, monitoring: true })

  /* The resize handler needs the current selection without re-running the
     map effect, so it reads it from a ref. */
  const hasSelectionRef = useRef(false)

  const sevColor = useMemo(
    () => ({
      critical: t.status.critical,
      high: t.status.serious,
      elevated: t.status.warning,
      monitoring: t.seriesAt(0),
    }),
    [t],
  )

  useEffect(() => {
    hasSelectionRef.current = Boolean(selEvent || selCountry)
  }, [selEvent, selCountry])

  /* Infrastructure classes are identities, so each takes a fixed slot. */
  const infraColor = useMemo(
    () => ({
      cable: t.seriesAt(6),
      gas: t.seriesAt(1),
      oil: t.seriesAt(3),
      waterway: t.seriesAt(2),
      landing: t.seriesAt(5),
      direct: t.status.critical,
      indirect: t.status.serious,
    }),
    [t],
  )

  const visibleEvents = useMemo(
    () =>
      EVENTS.filter((e) => {
        if (!layers[e.src]) return false
        if (!legend[e.sev]) return false
        if (q && !(e.title + e.loc + e.actor).toLowerCase().includes(q.toLowerCase())) return false
        return true
      }),
    [layers, legend, q],
  )

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, elevated: 0, monitoring: 0 }
    visibleEvents.forEach((e) => c[e.sev]++)
    return c
  }, [visibleEvents])

  const sourceLabel = useMemo(() => {
    const on = ['geo', 'acled', 'shadow_broker'].filter((k) => layers[k])
    if (on.length > 1) return 'Multi-layer view'
    if (on[0] === 'acled') return 'Historical events'
    if (on[0] === 'shadow_broker') return 'Air intel'
    if (on[0] === 'geo') return 'Geo events'
    return 'No source active'
  }, [layers])

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [8, 40],
      zoom: 3,
      zoomControl: false,
      worldCopyJump: true,
      /* The events run from Marseille to Jakarta. Fitting that span into this
         column needs a zoom just below 2, so a minZoom of 2 clamped the fit
         and parked the outermost events on the panel edge. */
      minZoom: 1,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      zoomDelta: 0.5,
      zoomSnap: 0.25,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map

    const g = {
      geo: L.layerGroup(),
      acled: L.layerGroup(),
      shadow_broker: L.layerGroup(),
      cables: L.layerGroup(),
      pipelines: L.layerGroup(),
      waterways: L.layerGroup(),
      landing_points: L.layerGroup(),
      links: L.layerGroup(),
    }

    EVENTS.forEach((e) => {
      const color = sevColor[e.sev]
      const marker = L.circleMarker([e.lat, e.lng], {
        radius: e.sev === 'critical' ? 7 : e.src === 'shadow_broker' ? 4 : 5,
        color: t.surface,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.95,
      })
      marker.bindTooltip(
        `<b>${e.title}</b><br/>${e.cat} · ${e.loc}<br/>${SEV[e.sev].label} · ${e.ts}`,
        { sticky: true },
      )
      marker.on('click', () => setSelEvent((p) => (p?.id === e.id ? null : e)))
      marker.addTo(g[e.src])
    })

    CABLES.forEach((cb) => {
      L.polyline(cb.path, { color: infraColor.cable, weight: 1.8, opacity: 0.85 })
        .bindTooltip(`Cable · ${cb.name}`)
        .addTo(g.cables)
    })
    PIPELINES.forEach((p) => {
      L.polyline(p.path, { color: p.kind === 'gas' ? infraColor.gas : infraColor.oil, weight: 2, opacity: 0.85 })
        .bindTooltip(`${p.kind === 'gas' ? 'Gas' : 'Oil'} · ${p.name}`)
        .addTo(g.pipelines)
    })
    WATERWAYS.forEach((w) => {
      L.circleMarker([w.lat, w.lng], {
        radius: 8,
        color: infraColor.waterway,
        weight: 1.5,
        fillColor: infraColor.waterway,
        fillOpacity: 0.14,
      })
        .bindTooltip(`Chokepoint · ${w.name}`)
        .addTo(g.waterways)
    })
    LANDING_POINTS.forEach((lp) => {
      L.circleMarker([lp.lat, lp.lng], {
        radius: 4,
        color: t.surface,
        weight: 1.5,
        fillColor: infraColor.landing,
        fillOpacity: 1,
      })
        .bindTooltip(`Landing point · ${lp.name}`)
        .addTo(g.landing_points)
    })
    LINKS.forEach((ln) => {
      const direct = ln.rel === 'direct'
      L.polyline([ln.a, ln.b], {
        color: direct ? infraColor.direct : infraColor.indirect,
        weight: direct ? 1.8 : 1.4,
        opacity: direct ? 0.8 : 0.55,
        dashArray: direct ? undefined : '5 4',
      }).addTo(g.links)
    })
    g.links.addTo(map)
    groupsRef.current = g

    /* Leaflet sizes tile coverage from the container at init. Inside a lazy
       layout the container is not sized yet, which leaves empty bands, so
       re-measure once layout settles and on every resize. */
    const pts = EVENTS.map((e) => [e.lat, e.lng])
    /* Padding in pixels, not as a fraction of the bounds: a fractional pad
       is absorbed by Leaflet's integer zoom steps and left markers sitting on
       the edge of the panel. */
    const fitAll = () => {
      if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [24, 24], animate: false })
    }
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false })
      /* A resize after the initial fit leaves the old zoom in place, which
         pushes events off the edge when the panel gets smaller. Re-fit,
         unless the visitor has zoomed to something specific. */
      if (!hasSelectionRef.current) fitAll()
    })
    observer.observe(mapEl.current)
    const t1 = setTimeout(() => {
      map.invalidateSize({ animate: false })
      fitAll()
    }, 60)
    const t2 = setTimeout(() => {
      map.invalidateSize({ animate: false })
      fitAll()
    }, 350)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Layer toggles. */
  useEffect(() => {
    const map = mapRef.current
    const g = groupsRef.current
    if (!map || !g.geo) return
    ;['geo', 'acled', 'shadow_broker', 'cables', 'pipelines', 'waterways', 'landing_points'].forEach((k) => {
      const grp = g[k]
      if (layers[k] && !map.hasLayer(grp)) grp.addTo(map)
      if (!layers[k] && map.hasLayer(grp)) map.removeLayer(grp)
    })
  }, [layers])

  /* Zoom to a selection, zoom back out when it clears. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (selEvent) {
      map.flyTo([selEvent.lat, selEvent.lng], 5, { duration: 0.9 })
      didFitRef.current = true
      return
    }
    if (selCountry) {
      map.flyTo([selCountry.lat, selCountry.lng], 4, { duration: 0.9 })
      didFitRef.current = true
      return
    }
    if (!didFitRef.current) {
      didFitRef.current = true
      return
    }
    map.flyToBounds(L.latLngBounds(EVENTS.map((e) => [e.lat, e.lng])), {
      padding: [24, 24],
      duration: 0.9,
    })
  }, [selEvent, selCountry])

  const toggleLayer = (k) => setLayers((s) => ({ ...s, [k]: !s[k] }))
  const toggleLegend = (k) => setLegend((s) => ({ ...s, [k]: !s[k] }))

  return (
    <DashFrame>
      <DashBar
        icon="shield"
        title="NETRA · Strategic Interdependence"
        subtitle={`${sourceLabel} · ${PERIOD} · synthetic demo data`}
      >
        <Chip icon="pulse" value={visibleEvents.length}>
          Signals
        </Chip>
        <button
          type="button"
          className="dash-chip"
          onClick={() => setLayerOpen(!layerOpen)}
          aria-pressed={layerOpen}
          style={{
            cursor: 'pointer',
            borderColor: layerOpen ? 'var(--dash-accent-line)' : undefined,
            background: layerOpen ? 'var(--dash-selected)' : undefined,
            color: layerOpen ? 'var(--dash-ink)' : undefined,
          }}
        >
          <DashIcon name="layers" size={12} />
          Data layers
        </button>
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          {SEV_ORDER.map((k) => (
            <Stat
              key={k}
              label={SEV[k].label}
              value={counts[k]}
              note={legend[k] ? 'shown on map' : 'hidden'}
            />
          ))}
        </StatGrid>

        {/* The map carries a global picture, so it gets the width the two
            rails can spare. */}
        <DashBody columns="296px minmax(0, 1fr) 316px" style={{ padding: 0 }}>
          {/* ── Filters and signal list ─────────────────────── */}
          <Col>
            <Panel title="Severity filter" note="click to toggle">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {SEV_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="dash-chip"
                    aria-pressed={legend[k]}
                    onClick={() => toggleLegend(k)}
                    style={{
                      cursor: 'pointer',
                      opacity: legend[k] ? 1 : 0.45,
                      borderColor: legend[k] ? 'var(--dash-accent-line)' : undefined,
                      background: legend[k] ? 'var(--dash-selected)' : undefined,
                      color: legend[k] ? 'var(--dash-ink)' : undefined,
                    }}
                  >
                    <span className="dash-legend-swatch" style={{ background: sevColor[k] }} />
                    {SEV[k].label}
                    <span className="num">{counts[k]}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Signals" note={`${visibleEvents.length} shown`} grow bodyFill>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                <span className="sr-only">Search signals</span>
                <DashIcon name="filter" size={13} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, location, actor"
                  style={{
                    flex: 1,
                    padding: '6px 9px',
                    border: '1px solid var(--dash-line)',
                    borderRadius: 7,
                    background: 'var(--dash-panel-alt)',
                    color: 'var(--dash-ink)',
                    font: 'inherit',
                    fontSize: 11,
                  }}
                />
              </label>

              {/* The list owns the scrollbar rather than the whole column,
                  so the search box above it stays put while you scroll. */}
              <div className="dash-scroll" style={{ flex: 1, minHeight: 0 }}>
                <List>
                  {visibleEvents.map((e) => (
                    <Row
                      key={e.id}
                      wrap
                      name={e.title}
                      sub={`${e.cat} · ${e.loc} · ${e.ts}`}
                      selected={selEvent?.id === e.id}
                      onSelect={() => {
                        setSelEvent(selEvent?.id === e.id ? null : e)
                        setSelCountry(null)
                      }}
                    >
                      <span
                        className="dash-legend-swatch"
                        style={{ background: sevColor[e.sev] }}
                        aria-hidden="true"
                      />
                    </Row>
                  ))}
                </List>

                {visibleEvents.length === 0 && (
                  <p className="dash-note" style={{ padding: '18px 0', textAlign: 'center' }}>
                    No signals match the current filters.
                  </p>
                )}
              </div>
            </Panel>
          </Col>

          {/* ── Map ─────────────────────────────────────────── */}
          <Col>
            <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
              <div ref={mapEl} className="dash-map" />

              <MapOverlay position="bottom-left" title="Legend">
                <div className="dash-legend is-stacked">
                  {SEV_ORDER.filter((k) => legend[k]).map((k) => (
                    <span className="dash-legend-item" key={k}>
                      <span className="dash-legend-swatch" style={{ background: sevColor[k] }} />
                      {SEV[k].label}
                    </span>
                  ))}
                  <span className="dash-legend-item">
                    <span className="dash-legend-swatch" style={{ background: infraColor.direct }} />
                    Direct exposure
                  </span>
                  <span className="dash-legend-item">
                    <span className="dash-legend-swatch" style={{ background: infraColor.indirect }} />
                    Indirect exposure
                  </span>
                  {layers.cables && (
                    <span className="dash-legend-item">
                      <span className="dash-legend-swatch" style={{ background: infraColor.cable }} />
                      Submarine cable
                    </span>
                  )}
                  {layers.waterways && (
                    <span className="dash-legend-item">
                      <span className="dash-legend-swatch" style={{ background: infraColor.waterway }} />
                      Chokepoint
                    </span>
                  )}
                </div>
              </MapOverlay>

              {layerOpen && (
                <MapOverlay position="top-right" title="Data layers">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 220 }}>
                    {LAYER_GROUPS.map((group) => (
                      <div key={group.label}>
                        <div className="dash-overlay-title">{group.label}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {group.items.map((item) => (
                            <label
                              key={item.key}
                              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={layers[item.key]}
                                onChange={() => toggleLayer(item.key)}
                                style={{ accentColor: t.accent, width: 13, height: 13, cursor: 'pointer' }}
                              />
                              <DashIcon name={item.icon} size={12} />
                              {item.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </MapOverlay>
              )}
            </Panel>
          </Col>

          {/* ── Detail and country profiles ─────────────────── */}
          <Col scroll>
            {selEvent ? (
              <Panel title="Signal detail" note={selEvent.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Status level={SEV[selEvent.sev].level}>{SEV[selEvent.sev].label}</Status>
                  <button
                    type="button"
                    onClick={() => setSelEvent(null)}
                    style={{
                      marginLeft: 'auto',
                      border: 0,
                      background: 'transparent',
                      color: 'var(--dash-muted)',
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 11,
                    }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-ink)' }}>
                  {selEvent.title}
                </div>
                <p className="dash-note" style={{ margin: '6px 0 10px' }}>
                  {selEvent.summary}
                </p>
                <table className="dash-table">
                  <tbody>
                    <tr>
                      <td>Category</td>
                      <td className="num">{selEvent.cat}</td>
                    </tr>
                    <tr>
                      <td>Location</td>
                      <td className="num">{selEvent.loc}</td>
                    </tr>
                    <tr>
                      <td>Actor</td>
                      <td className="num">{selEvent.actor}</td>
                    </tr>
                    <tr>
                      <td>Timestamp</td>
                      <td className="num">{selEvent.ts}</td>
                    </tr>
                  </tbody>
                </table>
              </Panel>
            ) : (
              <Panel title="Signal detail" note="none selected">
                <p className="dash-note">
                  Pick a signal from the list or the map to see its summary and metadata.
                </p>
              </Panel>
            )}

            <Panel title="Watchlist" note={`${COUNTRIES.length} countries`}>
              <List>
                {COUNTRIES.map((c) => (
                  <Row
                    key={c.key}
                    name={c.name}
                    sub={c.persona}
                    selected={selCountry?.key === c.key}
                    onSelect={() => {
                      setSelCountry(selCountry?.key === c.key ? null : c)
                      setSelEvent(null)
                    }}
                  >
                    <span
                      className="dash-legend-swatch"
                      style={{ background: sevColor[c.sev] }}
                      aria-hidden="true"
                    />
                  </Row>
                ))}
              </List>
            </Panel>

            {selCountry && (
              <Panel title="Country profile" note={selCountry.name} grow>
                <div style={{ marginBottom: 10 }}>
                  <Segment options={PROFILE_TABS} value={tab} onChange={setTab} label="Profile section" />
                </div>
                <p className="dash-note" style={{ lineHeight: 1.6 }}>
                  {selCountry.sections[tab]}
                </p>
              </Panel>
            )}
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
