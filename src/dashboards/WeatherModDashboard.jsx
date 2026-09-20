/* Weather Modification — cloud seeding operations over the Jatiluhur
   catchment, West Java. Leaflet and OpenStreetMap for the tasking map,
   Recharts for the seeded-against-control rainfall series. All data is
   synthetic.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend as RcLegend,
} from 'recharts'
import { weather } from './data'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Chip, Status, List, Row, Meters, Meter, MapOverlay, DashIcon,
} from './ui'

/* Sortie state is a state, so it wears the reserved status vocabulary and
   always ships its label alongside the colour. */
const SORTIE_STATE = {
  completed: { level: 'good', label: 'Completed' },
  active: { level: 'warning', label: 'Airborne' },
  planned: { level: 'good', label: 'Planned' },
}

/* Forward operating base: sorties fly out from here. */
const BASE = { lat: -6.9, lng: 107.6, name: 'Husein Sastranegara FOB' }

const RainTip = chartTooltip({ format: (v) => `${v} mm` })

export default function WeatherModDashboard() {
  const t = useChartTheme()
  const { sorties, target, hours, cells, kpis } = weather

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const sortieRef = useRef(null)
  const targetRef = useRef(null)
  const pathRef = useRef(null)

  const [selected, setSelected] = useState(null)
  const [layers, setLayers] = useState({ sorties: true, target: true, paths: true })

  const statusColor = useMemo(
    () => ({
      completed: t.status.good,
      active: t.status.warning,
      planned: t.muted,
    }),
    [t],
  )

  const suitColor = useMemo(
    () => ({
      low: t.ordinalAt(0, 3),
      medium: t.ordinalAt(1, 3),
      high: t.ordinalAt(2, 3),
    }),
    [t],
  )

  const fleet = useMemo(() => {
    const completed = sorties.filter((s) => s.status === 'completed').length
    const active = sorties.filter((s) => s.status === 'active').length
    const planned = sorties.filter((s) => s.status === 'planned').length
    const estRain = sorties.reduce((a, s) => a + s.rain, 0)
    return { completed, active, planned, estRain }
  }, [sorties])

  const enhancement = useMemo(() => {
    const seeded = hours.reduce((a, h) => a + h.seeded, 0)
    const control = hours.reduce((a, h) => a + h.control, 0)
    return { seeded, control, pct: control ? Math.round(((seeded - control) / control) * 100) : 0 }
  }, [hours])

  const narrative = useMemo(() => {
    const lead = sorties.reduce((best, s) => (s.rain > best.rain ? s : best), sorties[0])
    return (
      `Tasking over ${target.name}: ${fleet.completed} sorties completed, ${fleet.active} airborne, ` +
      `${fleet.planned} on the apron. ${kpis.flares} NaCl/CaO flares expended across ${kpis.hours} ` +
      `cloud-data hours. Sortie ${lead.id} returned the strongest column at ${lead.rain} mm estimated. ` +
      `The gauge network indicates a ${enhancement.pct}% rainfall enhancement against the unseeded ` +
      `control corridor. Recommendation: re-task on the north-west Cb cluster while convective tops ` +
      `hold above 9 km.`
    )
  }, [sorties, target, fleet, kpis, enhancement])

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [-6.6, 107.15],
      zoom: 9,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map

    /* Target zone: seeding radius plus a marker. */
    const targetGroup = L.layerGroup()
    L.circle([target.lat, target.lng], {
      radius: 18000,
      color: t.accent,
      weight: 1.5,
      dashArray: '5 4',
      fillColor: t.accent,
      fillOpacity: 0.07,
    }).addTo(targetGroup)
    L.circleMarker([target.lat, target.lng], {
      radius: 7,
      color: t.surface,
      weight: 2,
      fillColor: t.accent,
      fillOpacity: 1,
    })
      .bindPopup(
        `<div class="dash-pop-title">${target.name}</div>` +
          `<div class="dash-pop-meta">Seeding target · 18 km radius</div>`,
      )
      .addTo(targetGroup)
    targetGroup.addTo(map)
    targetRef.current = targetGroup

    /* Flight paths from the base out to each sortie. */
    const pathGroup = L.layerGroup()
    sorties.forEach((s) => {
      L.polyline(
        [
          [BASE.lat, BASE.lng],
          [s.lat, s.lng],
        ],
        {
          color: statusColor[s.status],
          weight: 1.4,
          opacity: 0.6,
          dashArray: s.status === 'planned' ? '3 4' : undefined,
        },
      ).addTo(pathGroup)
    })
    L.circleMarker([BASE.lat, BASE.lng], {
      radius: 5,
      color: t.surface,
      weight: 2,
      fillColor: t.ink,
      fillOpacity: 1,
    })
      .bindPopup(
        `<div class="dash-pop-title">${BASE.name}</div>` +
          `<div class="dash-pop-meta">Forward operating base</div>`,
      )
      .addTo(pathGroup)
    pathGroup.addTo(map)
    pathRef.current = pathGroup

    /* Sortie markers. */
    const sortieGroup = L.layerGroup()
    sorties.forEach((s) => {
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 7,
        color: t.surface,
        weight: 2,
        fillColor: statusColor[s.status],
        fillOpacity: 0.95,
      }).bindPopup(
        `<div class="dash-pop-title">${s.id} · ${SORTIE_STATE[s.status].label}</div>` +
          `<div class="dash-pop-meta">Flares ${s.flares} · est. rain ${s.rain} mm</div>`,
      )
      marker.on('click', () => setSelected((p) => (p?.id === s.id ? null : s)))
      marker.addTo(sortieGroup)
    })
    sortieGroup.addTo(map)
    sortieRef.current = sortieGroup

    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(mapEl.current)
    const settle = setTimeout(() => map.invalidateSize({ animate: false }), 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [sorties, target, statusColor, t.accent, t.surface, t.ink])

  /* Layer toggles. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const toggle = (ref, on) => {
      if (!ref) return
      if (on && !map.hasLayer(ref)) ref.addTo(map)
      if (!on && map.hasLayer(ref)) map.removeLayer(ref)
    }
    toggle(sortieRef.current, layers.sorties)
    toggle(targetRef.current, layers.target)
    toggle(pathRef.current, layers.paths)
  }, [layers])

  /* Fly to the selected sortie, or back out when it is cleared. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (selected) map.flyTo([selected.lat, selected.lng], 10, { duration: 0.8 })
    else map.flyTo([-6.6, 107.15], 9, { duration: 0.8 })
  }, [selected])

  const toggleLayer = (key) => setLayers((p) => ({ ...p, [key]: !p[key] }))

  return (
    <DashFrame>
      <DashBar
        icon="cloud"
        title="Weather Modification · Cloud Seeding Ops"
        subtitle="Jatiluhur catchment, West Java · tasking window 06:00 to 18:00 LT"
      >
        <Chip icon="clock">15 Jun 2026</Chip>
        <Chip icon="droplet" value={`${fleet.estRain} mm`}>
          Est. total
        </Chip>
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat label="Sorties flown" value={kpis.sorties} note={`${fleet.completed} completed · ${fleet.active} airborne`} />
          <Stat label="Flares deployed" value={kpis.flares} note="NaCl / CaO" />
          <Stat label="Cloud-data hours" value={kpis.hours} note="across the campaign" />
          <Stat
            label="Rainfall enhancement"
            value={kpis.addRain}
            delta={`${enhancement.pct}%`}
            deltaDir="up"
            note="vs unseeded control"
          />
        </StatGrid>

        <DashBody columns="300px minmax(0, 1fr) 330px" style={{ padding: 0 }}>
          {/* ── Sortie log and cloud cells ──────────────────── */}
          <Col scroll>
            <Panel title="Sortie log" note={`${sorties.length} tasked`}>
              <List>
                {sorties.map((s) => {
                  const state = SORTIE_STATE[s.status]
                  return (
                    <Row
                      key={s.id}
                      name={s.id}
                      sub={`${s.flares} flares · ${s.rain} mm est.`}
                      selected={selected?.id === s.id}
                      onSelect={() => setSelected(selected?.id === s.id ? null : s)}
                    >
                      <Status level={state.level}>{state.label}</Status>
                    </Row>
                  )
                })}
              </List>
            </Panel>

            <Panel title="Cloud-cell suitability" note="cover %">
              <Meters>
                {cells.map((c) => (
                  <Meter
                    key={c.name}
                    label={c.name}
                    value={c.cover}
                    color={suitColor[c.suit]}
                    display={`${c.cover}%`}
                  />
                ))}
              </Meters>
              <div className="dash-sep" style={{ margin: '10px 0 8px' }} />
              <table className="dash-table">
                <thead>
                  <tr>
                    <th scope="col">Cell</th>
                    <th scope="col" className="num">Top</th>
                    <th scope="col">Suitability</th>
                  </tr>
                </thead>
                <tbody>
                  {cells.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td className="num">{c.top} km</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="dash-legend-swatch"
                            style={{ background: suitColor[c.suit] }}
                            aria-hidden="true"
                          />
                          {c.suit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Col>

          {/* ── Tasking map ─────────────────────────────────── */}
          <Col>
            <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
              <div ref={mapEl} className="dash-map" />

              <MapOverlay position="top-right" title="Layers">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    ['sorties', 'Sorties'],
                    ['target', 'Target zone'],
                    ['paths', 'Flight paths'],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={layers[key]}
                        onChange={() => toggleLayer(key)}
                        style={{ accentColor: t.accent, width: 13, height: 13, cursor: 'pointer' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </MapOverlay>

              <MapOverlay position="bottom-left" title="Sortie status">
                <div className="dash-legend is-stacked">
                  {Object.entries(SORTIE_STATE).map(([key, state]) => (
                    <span className="dash-legend-item" key={key}>
                      <span className="dash-legend-swatch" style={{ background: statusColor[key] }} />
                      {state.label}
                    </span>
                  ))}
                </div>
              </MapOverlay>
            </Panel>
          </Col>

          {/* ── Rainfall and narrative ──────────────────────── */}
          <Col scroll>
            <Panel title="Rainfall: seeded vs control" note="24h · gauge network" bodyFill>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={168}>
                  <AreaChart data={hours} margin={{ top: 8, right: 10, left: -18, bottom: 4 }}>
                    <defs>
                      <linearGradient id="wmSeeded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.seriesAt(0)} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={t.seriesAt(0)} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="hour" {...t.xAxis} interval={3} />
                    <YAxis {...t.yAxis} width={30} />
                    <Tooltip content={<RainTip />} cursor={t.cursor} />
                    <RcLegend
                      verticalAlign="top"
                      height={20}
                      iconType="plainline"
                      iconSize={12}
                      wrapperStyle={{ fontSize: 11, color: t.body }}
                    />
                    <Area
                      type="monotone"
                      dataKey="seeded"
                      name="Seeded"
                      stroke={t.seriesAt(0)}
                      strokeWidth={2}
                      fill="url(#wmSeeded)"
                    />
                    <Line
                      type="monotone"
                      dataKey="control"
                      name="Control"
                      stroke={t.muted}
                      strokeWidth={1.6}
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="dash-note" style={{ marginTop: 6 }}>
                {enhancement.seeded} mm seeded against {enhancement.control} mm control over 24 hours of
                gauge accumulation.
              </p>
            </Panel>

            {selected && (
              <Panel title="Sortie detail" note={SORTIE_STATE[selected.status].label}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dash-ink)', marginBottom: 8 }}>
                  {selected.id}
                </div>
                <table className="dash-table">
                  <tbody>
                    <tr>
                      <td>Flares</td>
                      <td className="num">{selected.flares}</td>
                    </tr>
                    <tr>
                      <td>Estimated rain</td>
                      <td className="num">{selected.rain} mm</td>
                    </tr>
                    <tr>
                      <td>Position</td>
                      <td className="num">
                        {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Panel>
            )}

            <Panel title="Operations narrative" note="generated from the tasking data">
              <p className="dash-note" style={{ display: 'flex', gap: 7 }}>
                <DashIcon name="zap" size={13} />
                <span>{narrative}</span>
              </p>
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
