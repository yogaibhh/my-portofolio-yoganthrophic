/* DKI Jakarta Air Quality.

   Built on the shared dashboard system (./ui). Leaflet + OpenStreetMap for
   the station map, Recharts for the two time series. All figures are
   synthetic sample data from ./data. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from 'recharts'
import { air } from './data'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region, Panel, Chip, Status, List, Row,
  Meters, Meter, Legend, MapOverlay, DashIcon,
} from './ui'

/* AQI is a published scale, so its bands keep their conventional ordered
   heat reading. Every use pairs the colour with the category name, so the
   band is never carried by hue alone. */
const BANDS = [
  { label: 'Good', color: '#0ca30c', lo: 0, hi: 50, level: 'good' },
  { label: 'Moderate', color: '#fab219', lo: 51, hi: 100, level: 'warning' },
  { label: 'Sensitive', color: '#ec835a', lo: 101, hi: 150, level: 'serious' },
  { label: 'Unhealthy', color: '#d03b3b', lo: 151, hi: 200, level: 'critical' },
  { label: 'Hazardous', color: '#7b3f8f', lo: 201, hi: 500, level: 'critical' },
]

function band(aqi) {
  return BANDS.find((b) => aqi <= b.hi) ?? BANDS[BANDS.length - 1]
}

/* Deterministic per-station pollutant mix, seeded by name, so each station
   gets a distinct but stable breakdown scaled around its AQI. */
function stationPollutants(station) {
  let seed = 0
  for (let i = 0; i < station.name.length; i++) {
    seed = (seed * 31 + station.name.charCodeAt(i)) >>> 0
  }
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const scale = station.aqi / 155
  return air.pollutants.map((p) => ({
    label: p.label,
    value: Math.max(6, Math.round(p.value * scale * (0.78 + next() * 0.44))),
  }))
}

const Tip = chartTooltip({ format: (v) => `${v} µg/m³` })

export default function AirQualityDashboard() {
  const t = useChartTheme()

  const sorted = useMemo(() => [...air.stations].sort((a, b) => b.aqi - a.aqi), [])
  const [selected, setSelected] = useState(sorted[0])

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  const cityAqi = air.kpis.aqi
  const worst = sorted[0]
  const average = useMemo(
    () => Math.round(air.stations.reduce((sum, s) => sum + s.aqi, 0) / air.stations.length),
    [],
  )

  const pollutants = useMemo(() => stationPollutants(selected), [selected])
  const pollutantMax = useMemo(() => Math.max(...pollutants.map((p) => p.value)), [pollutants])

  const cityBand = band(cityAqi)
  const selectedBand = band(selected.aqi)

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [-6.25, 106.85],
      zoom: 10,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map

    const markers = {}
    air.stations.forEach((station) => {
      const b = band(station.aqi)
      markers[station.name] = L.circleMarker([station.lat, station.lng], {
        radius: 6 + station.aqi / 26,
        color: '#ffffff',
        weight: 2,
        fillColor: b.color,
        fillOpacity: 0.9,
      })
        .bindPopup(
          `<div class="dash-pop-title">${station.name}</div>` +
            `<div class="dash-pop-meta">AQI ${station.aqi} · ${b.label}</div>`,
          { className: 'dash-pop', closeButton: false },
        )
        .on('click', () => setSelected(station))
        .addTo(map)
    })
    markersRef.current = markers

    /* Fit the station network rather than trusting a fixed zoom: the panel
       is narrow and the outermost stations were landing off the edge. */
    const bounds = L.latLngBounds(air.stations.map((s) => [s.lat, s.lng]))
    const fit = () => {
      map.invalidateSize({ animate: false })
      map.fitBounds(bounds, { padding: [26, 26], animate: false })
    }
    const observer = new ResizeObserver(fit)
    observer.observe(mapEl.current)
    const settle = setTimeout(fit, 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  /* Highlight the selected marker and pan to it. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    Object.entries(markersRef.current).forEach(([name, marker]) => {
      const station = air.stations.find((s) => s.name === name)
      const isSelected = name === selected.name
      marker.setStyle({
        weight: isSelected ? 3 : 2,
        fillOpacity: isSelected ? 1 : 0.85,
        radius: (6 + station.aqi / 26) * (isSelected ? 1.3 : 1),
      })
      if (isSelected) marker.bringToFront()
    })
    map.panTo([selected.lat, selected.lng], { animate: true, duration: 0.6 })
  }, [selected])

  return (
    <DashFrame>
      <DashBar
        icon="waves"
        title="DKI Jakarta Air Quality"
        subtitle="Jabodetabek · 20+ monitoring stations · 10-year record"
      >
        <Chip icon="map" value={air.kpis.stations}>
          Stations
        </Chip>
        <Chip icon="database" value={air.kpis.points}>
          Readings
        </Chip>
        <Status level={cityBand.level}>
          City AQI {cityAqi} · {cityBand.label}
        </Status>
      </DashBar>

      <DashBody columns="286px minmax(0, 1fr) 330px">
        {/* ── Left: city index and station ranking ─────────── */}
        <Region>
          <Panel title="Current city index" note="Composite">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  color: 'var(--dash-ink)',
                }}
              >
                {cityAqi}
              </span>
              <Status level={cityBand.level}>{cityBand.label}</Status>
            </div>

            {/* Band position: the filled segments show where the reading
                sits on the scale, and the legend below names each band. */}
            <div style={{ display: 'flex', gap: 2, margin: '12px 0 8px' }} aria-hidden="true">
              {BANDS.map((b) => (
                <span
                  key={b.label}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 2,
                    background: b.color,
                    opacity: cityAqi >= b.lo ? 1 : 0.22,
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="dash-note">
              <span>
                Worst: <strong style={{ color: 'var(--dash-ink)' }}>{worst.name}</strong> ({worst.aqi})
              </span>
              <span>
                Station mean: <strong style={{ color: 'var(--dash-ink)' }}>{average}</strong>
              </span>
            </div>
          </Panel>

          <Panel title="Stations" note={`${sorted.length} · AQI desc`} grow bodyFill>
            <div className="dash-scroll" style={{ flex: 1, minHeight: 0 }}>
              <List>
                {sorted.map((station, i) => {
                  const b = band(station.aqi)
                  return (
                    <Row
                      key={station.name}
                      rank={i + 1}
                      name={station.name}
                      sub={b.label}
                      value={station.aqi}
                      selected={selected.name === station.name}
                      onSelect={() => setSelected(station)}
                    >
                      <span
                        className="dash-legend-swatch"
                        style={{ background: b.color }}
                        aria-hidden="true"
                      />
                    </Row>
                  )
                })}
              </List>
            </div>
          </Panel>

          <Panel title="AQI bands" note="µg/m³ composite">
            <Legend
              stacked
              items={BANDS.map((b) => ({
                label: b.label,
                color: b.color,
                value: b.hi >= 500 ? `${b.lo}+` : `${b.lo}-${b.hi}`,
              }))}
            />
          </Panel>
        </Region>

        {/* ── Centre: map ──────────────────────────────────── */}
        <Region>
          <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
            <div ref={mapEl} className="dash-map" />
            <MapOverlay position="bottom-left" title="AQI band">
              <Legend
                stacked
                items={BANDS.map((b) => ({ label: b.label, color: b.color }))}
              />
            </MapOverlay>
          </Panel>
        </Region>

        {/* ── Right: selected station detail ───────────────── */}
        <Region scroll>
          <Panel title="Station detail" note={`${selected.lat.toFixed(3)}, ${selected.lng.toFixed(3)}`}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dash-ink)' }}>
              {selected.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: 'var(--dash-ink)',
                }}
              >
                {selected.aqi}
              </span>
              <Status level={selectedBand.level}>{selectedBand.label}</Status>
            </div>
          </Panel>

          {/* One measure across nominal categories, so one colour for every
              bar. The value sits beside each label. */}
          <Panel title="Pollutant breakdown" note="µg/m³">
            <Meters>
              {pollutants.map((p) => (
                <Meter
                  key={p.label}
                  label={p.label}
                  value={p.value}
                  max={pollutantMax}
                  color={t.seriesAt(0)}
                  display={p.value}
                />
              ))}
            </Meters>
          </Panel>

          <Panel title="PM2.5 annual mean" note="10-year record">
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={136}>
                <AreaChart data={air.trend} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqPm25" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.seriesAt(0)} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={t.seriesAt(0)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...t.grid} />
                  <XAxis dataKey="year" {...t.xAxis} />
                  <YAxis {...t.yAxis} width={30} />
                  <Tooltip content={<Tip />} cursor={t.cursor} />
                  <ReferenceLine
                    y={15}
                    stroke={t.status.good}
                    strokeWidth={1.5}
                    label={{ value: 'WHO 15', fill: t.status.good, fontSize: 11, position: 'insideTopRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pm25"
                    name="PM2.5"
                    stroke={t.seriesAt(0)}
                    strokeWidth={2}
                    fill="url(#aqPm25)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="dash-note" style={{ marginTop: 6 }}>
              Every year of the record sits above the WHO annual guideline of 15 µg/m³.
            </p>
          </Panel>

          <Panel title="Diurnal PM2.5" note="24-hour mean">
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={128}>
                <AreaChart data={air.diurnal} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqDiurnal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.seriesAt(1)} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={t.seriesAt(1)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...t.grid} />
                  <XAxis dataKey="hour" {...t.xAxis} interval={3} />
                  <YAxis {...t.yAxis} width={30} />
                  <Tooltip content={<Tip />} cursor={t.cursor} />
                  <Area
                    type="monotone"
                    dataKey="pm25"
                    name="PM2.5"
                    stroke={t.seriesAt(1)}
                    strokeWidth={2}
                    fill="url(#aqDiurnal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="dash-note" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <DashIcon name="clock" size={12} />
              Peaks track the morning and evening commute.
            </p>
          </Panel>
        </Region>
      </DashBody>
    </DashFrame>
  )
}
