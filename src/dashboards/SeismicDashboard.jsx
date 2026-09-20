/* Seismic Activity Monitor — Sunda Arc and Banda Sea.

   Interactive companion to the indonesia-earthquake-analysis study (10,294
   USGS M4.5+ events, 2015 to 2026, b-value 1.07). The catalog rendered here
   is synthetic and deterministic, sampled from a Gutenberg-Richter
   distribution with the same b-value. No feed, no network calls.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Segment, Chip, List, Row, Meters, Meter, MapOverlay,
} from './ui'

/* Depth is an ordered quantity, so it reads on a single-hue ordinal ramp
   rather than three unrelated colours. */
const DEPTH = [
  { label: 'Shallow', range: '< 70 km' },
  { label: 'Intermediate', range: '70-300 km' },
  { label: 'Deep', range: '> 300 km' },
]
const depthIndex = (d) => (d < 70 ? 0 : d < 300 ? 1 : 2)
const depthClass = (d) => DEPTH[depthIndex(d)]

const markerRadius = (m) => 2.5 + (m - 4.5) * 2.4

/* 12-month window ending at the fixed demo date. */
const AS_OF = '15 Jul 2026'
const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i - 5, 1)
  return { label: MN[d.getMonth()], y: d.getFullYear() }
})
const fmtDate = (e) => `${e.day} ${MONTHS[e.mi].label} ${MONTHS[e.mi].y}`

function mkR(s) {
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* Gutenberg-Richter sampling (b = 1.07, as in the USGS study): exponentially
   fewer large events. Seeded events cap at M 7.2 so the handcrafted notable
   events below stay at the top of the list. */
const GR_B = 1.07
const MAG_SPAN = 1 - Math.pow(10, -GR_B * (7.2 - 4.5))
const sampleMag = (r) => +(4.5 - Math.log10(1 - r * MAG_SPAN) / GR_B).toFixed(1)

const ZONES = [
  { n: 48, lat: [-4, 4], lng: [96, 102], depth: (r) => 12 + Math.pow(r, 1.6) * 220, regions: ['Off West Coast of Sumatra', 'Mentawai Islands region', 'Nias region', 'Simeulue region', 'Southern Sumatra'] },
  { n: 36, lat: [-9.5, -7.5], lng: [105, 115], depth: (r) => 15 + Math.pow(r, 1.3) * 320, regions: ['South of Java', 'Sunda Strait', 'Java region', 'South of Bali'] },
  { n: 44, lat: [-10, -6], lng: [116, 131], depth: (r) => 25 + Math.pow(r, 0.75) * 575, regions: ['Banda Sea', 'Flores Sea', 'Sumba region', 'Timor region', 'Tanimbar Islands region'] },
  { n: 20, lat: [-2, 2], lng: [119, 126], depth: (r) => 10 + Math.pow(r, 1.5) * 180, regions: ['Minahasa Peninsula, Sulawesi', 'Sulawesi region', 'Molucca Sea', 'Palu region'] },
]

/* Handcrafted anchor events so the top-five list reads like a real year. */
const NOTABLE = [
  { lat: -3.05, lng: 100.12, mag: 7.6, depth: 24, mi: 6, day: 11, region: 'Mentawai Islands region' },
  { lat: -6.62, lng: 129.92, mag: 7.1, depth: 517, mi: 3, day: 19, region: 'Banda Sea' },
  { lat: -9.12, lng: 107.44, mag: 6.8, depth: 68, mi: 9, day: 4, region: 'South of Java' },
  { lat: -7.38, lng: 121.84, mag: 6.6, depth: 512, mi: 1, day: 27, region: 'Flores Sea' },
  { lat: 0.92, lng: 122.88, mag: 6.5, depth: 121, mi: 11, day: 8, region: 'Minahasa Peninsula, Sulawesi' },
]

const EVENTS = (() => {
  const out = []
  ZONES.forEach((z, zi) => {
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
  { value: 0, label: 'All' },
  { value: 5, label: 'M ≥ 5.0' },
  { value: 6, label: 'M ≥ 6.0' },
]

const CountTip = chartTooltip({ format: (v) => `${v} events` })

export default function SeismicDashboard() {
  const t = useChartTheme()
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const quakeRef = useRef(null)
  const [minMag, setMinMag] = useState(0)

  /* Depth ramp resolved from the theme, darkest for the deepest class. */
  const depthColors = useMemo(() => DEPTH.map((_, i) => t.ordinalAt(i, DEPTH.length)), [t])

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
    () => DEPTH.map((d, i) => ({ ...d, count: filtered.filter((e) => depthIndex(e.depth) === i).length })),
    [filtered],
  )
  const top5 = useMemo(() => [...filtered].sort((a, b) => b.mag - a.mag).slice(0, 5), [filtered])

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [-2.5, 118],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map
    quakeRef.current = L.layerGroup().addTo(map)

    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(mapEl.current)
    const settle = setTimeout(() => map.invalidateSize({ animate: false }), 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      quakeRef.current = null
    }
  }, [])

  /* Redraw markers whenever the filter or the theme's ramp changes. */
  useEffect(() => {
    const group = quakeRef.current
    if (!group) return
    group.clearLayers()

    /* Large events drawn first so small ones land on top of them. */
    const byMag = [...filtered].sort((a, b) => b.mag - a.mag)
    byMag.forEach((e) => {
      const i = depthIndex(e.depth)
      L.circleMarker([e.lat, e.lng], {
        radius: markerRadius(e.mag),
        color: t.surface,
        weight: 1.5,
        fillColor: depthColors[i],
        fillOpacity: 0.85,
      })
        .bindPopup(
          `<div class="dash-pop-title">M ${e.mag.toFixed(1)} · ${e.region}</div>` +
            `<div class="dash-pop-meta">Depth ${e.depth} km · ${DEPTH[i].label.toLowerCase()}</div>` +
            `<div class="dash-pop-meta">${fmtDate(e)}</div>`,
          { className: 'dash-pop', closeButton: false },
        )
        .addTo(group)
    })
  }, [filtered, depthColors, t.surface])

  return (
    <DashFrame>
      <DashBar
        icon="pulse"
        title="Seismic Activity Monitor"
        subtitle="Sunda Arc & Banda Sea · synthetic USGS-style catalog, M 4.5+ · 12 months"
      >
        <Chip icon="clock">As of {AS_OF}</Chip>
        <Segment options={FILTERS} value={minMag} onChange={setMinMag} label="Filter by magnitude" />
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat label="Events · 12 mo" value={kpis.n} note={`of ${EVENTS.length} in catalog`} />
          <Stat
            label="Strongest"
            value={`M ${kpis.strongest.toFixed(1)}`}
            note={top5[0] ? top5[0].region : 'None in range'}
          />
          <Stat
            label="Mean depth"
            value={kpis.avgDepth}
            unit="km"
            note={`${depthClass(kpis.avgDepth).label.toLowerCase()} on average`}
          />
          <Stat label="This month" value={kpis.thisMonth} note="Jul 2026 · to date" />
        </StatGrid>

        <DashBody columns="minmax(0, 1fr) 340px" style={{ padding: 0 }}>
          {/* ── Map ─────────────────────────────────────────── */}
          <Col>
            <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
              <div ref={mapEl} className="dash-map" />

              <MapOverlay position="bottom-left" title="Depth class">
                <div className="dash-legend is-stacked">
                  {DEPTH.map((d, i) => (
                    <span className="dash-legend-item" key={d.label}>
                      <span className="dash-legend-swatch" style={{ background: depthColors[i] }} />
                      {d.label}
                      <span className="spacer" />
                      <span className="value">{d.range}</span>
                    </span>
                  ))}
                </div>
                <div className="dash-sep" style={{ margin: '8px 0' }} />
                <div className="dash-overlay-title">Magnitude</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  {[5, 6, 7].map((mv) => (
                    <span
                      key={mv}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }}
                    >
                      <span
                        style={{
                          width: markerRadius(mv) * 2,
                          height: markerRadius(mv) * 2,
                          borderRadius: '50%',
                          background: depthColors[0],
                        }}
                      />
                      M{mv}
                    </span>
                  ))}
                </div>
              </MapOverlay>
            </Panel>
          </Col>

          {/* ── Distributions and the notable list ──────────── */}
          <Col scroll>
            <Panel title="Monthly events" note="12-month window">
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={118}>
                  <BarChart data={monthly} margin={{ top: 4, right: 6, left: -16, bottom: 4 }} barCategoryGap="26%">
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="m" {...t.xAxis} interval={0} tick={{ fill: t.faint, fontSize: 10 }} />
                    <YAxis {...t.yAxis} width={28} allowDecimals={false} />
                    <Tooltip content={<CountTip />} cursor={t.barCursor} />
                    <Bar dataKey="count" name="Events" fill={t.seriesAt(0)} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Magnitude distribution" note="Gutenberg-Richter">
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={118}>
                  <BarChart data={histogram} margin={{ top: 4, right: 6, left: -16, bottom: 4 }} barCategoryGap="26%">
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="short" {...t.xAxis} interval={0} />
                    <YAxis {...t.yAxis} width={28} allowDecimals={false} />
                    <Tooltip
                      content={<CountTip />}
                      cursor={t.barCursor}
                      labelFormatter={(v, p) => (p && p[0] ? p[0].payload.bin : v)}
                    />
                    <Bar dataKey="count" name="Events" fill={t.seriesAt(0)} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="dash-note" style={{ marginTop: 6 }}>
                Counts fall off exponentially with magnitude. Each step down brings roughly ten
                times more events, which is a b-value near 1.
              </p>
            </Panel>

            <Panel title="Depth classes" note={`of ${kpis.n} shown`}>
              <Meters>
                {depthMix.map((d, i) => (
                  <Meter
                    key={d.label}
                    label={`${d.label} · ${d.range}`}
                    value={kpis.n ? (d.count / kpis.n) * 100 : 0}
                    color={depthColors[i]}
                    display={d.count}
                  />
                ))}
              </Meters>
            </Panel>

            <Panel title="Strongest events" note="top 5 · click to locate">
              <List>
                {top5.map((e, i) => (
                  <Row
                    key={`${e.lat},${e.lng},${e.mag}`}
                    rank={i + 1}
                    name={e.region}
                    sub={`${e.depth} km · ${depthClass(e.depth).label.toLowerCase()} · ${fmtDate(e)}`}
                    value={`M ${e.mag.toFixed(1)}`}
                    onSelect={() =>
                      mapRef.current && mapRef.current.flyTo([e.lat, e.lng], 7, { duration: 0.8 })
                    }
                  />
                ))}
              </List>
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
