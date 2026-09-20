/* National Stability Index (NPI) — national-scale monitoring.

   A React port of an internal RETS monitoring dashboard: Mapbox became
   Leaflet with OpenStreetMap tiles, and the live API became embedded
   synthetic sample data. Every event, score and keyword below is synthetic.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import useChartTheme from './ui/chartTheme'
import { chartTooltip } from './ui/chartTooltip'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Chip, Status, List, Row, Meters, Meter, MapOverlay, DashIcon,
} from './ui'

/* Severity maps onto the shared status vocabulary, so a level always arrives
   with an icon and a word rather than a colour by itself. */
const SEV = {
  CRIT: { label: 'Critical', level: 'critical' },
  HIGH: { label: 'High', level: 'serious' },
  ELEV: { label: 'Elevated', level: 'warning' },
  MON: { label: 'Monitor', level: 'good' },
  OK: { label: 'Stable', level: 'good' },
}
const SEV_ORDER = ['CRIT', 'HIGH', 'ELEV', 'MON', 'OK']

const EVENTS = [
  { id: 'E01', title: 'Demonstrasi tolak kenaikan harga BBM di Jakarta', place: 'DKI Jakarta', prov: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, sev: 'CRIT', cat: 'Sosial', npi: 84, time: '12m', src: 'Antara', n: 412 },
  { id: 'E02', title: 'Aksi buruh terkait UMP di kawasan industri Bekasi', place: 'Bekasi', prov: 'Jawa Barat', lat: -6.2383, lng: 106.9756, sev: 'HIGH', cat: 'Ekonomi', npi: 71, time: '34m', src: 'Detik', n: 287 },
  { id: 'E03', title: 'Sengketa lahan tambang memanas di Sumatera Selatan', place: 'Palembang', prov: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, sev: 'HIGH', cat: 'Konflik', npi: 68, time: '1j', src: 'Kompas', n: 196 },
  { id: 'E04', title: 'Inflasi pangan picu keresahan di pasar Surabaya', place: 'Surabaya', prov: 'Jawa Timur', lat: -7.2575, lng: 112.7521, sev: 'ELEV', cat: 'Ekonomi', npi: 58, time: '1j', src: 'Tempo', n: 154 },
  { id: 'E05', title: 'Polemik kampanye pemilu di Medan', place: 'Medan', prov: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, sev: 'ELEV', cat: 'Politik', npi: 55, time: '2j', src: 'Antara', n: 132 },
  { id: 'E06', title: 'Konflik agraria perkebunan sawit di Riau', place: 'Pekanbaru', prov: 'Riau', lat: 0.5071, lng: 101.4478, sev: 'HIGH', cat: 'Konflik', npi: 66, time: '2j', src: 'Mongabay', n: 178 },
  { id: 'E07', title: 'Demo mahasiswa tuntut transparansi anggaran di Makassar', place: 'Makassar', prov: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, sev: 'ELEV', cat: 'Sosial', npi: 52, time: '3j', src: 'Detik', n: 121 },
  { id: 'E08', title: 'Ketegangan antar-warga soal subsidi pupuk di Lampung', place: 'Bandar Lampung', prov: 'Lampung', lat: -5.4294, lng: 105.2611, sev: 'MON', cat: 'Ekonomi', npi: 41, time: '3j', src: 'Kompas', n: 88 },
  { id: 'E09', title: 'Banjir bandang ganggu logistik distribusi di Semarang', place: 'Semarang', prov: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, sev: 'MON', cat: 'Bencana', npi: 44, time: '4j', src: 'BNPB', n: 96 },
  { id: 'E10', title: 'Isu separatisme kembali mengemuka di Papua', place: 'Jayapura', prov: 'Papua', lat: -2.5337, lng: 140.7181, sev: 'CRIT', cat: 'Keamanan', npi: 79, time: '4j', src: 'Antara', n: 233 },
  { id: 'E11', title: 'Protes nelayan terhadap reklamasi di Bali', place: 'Denpasar', prov: 'Bali', lat: -8.6705, lng: 115.2126, sev: 'ELEV', cat: 'Sosial', npi: 49, time: '5j', src: 'Tempo', n: 74 },
  { id: 'E12', title: 'Gejolak harga komoditas tambang di Kalimantan Timur', place: 'Samarinda', prov: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536, sev: 'MON', cat: 'Ekonomi', npi: 38, time: '5j', src: 'Bisnis', n: 61 },
  { id: 'E13', title: 'Sengketa pilkada berujung mediasi di Padang', place: 'Padang', prov: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, sev: 'MON', cat: 'Politik', npi: 36, time: '6j', src: 'Antara', n: 53 },
  { id: 'E14', title: 'Aksi solidaritas pekerja informal di Bandung', place: 'Bandung', prov: 'Jawa Barat', lat: -6.9175, lng: 107.6191, sev: 'ELEV', cat: 'Sosial', npi: 51, time: '6j', src: 'Detik', n: 109 },
  { id: 'E15', title: 'Stabilitas terkendali pasca dialog di Yogyakarta', place: 'Yogyakarta', prov: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, sev: 'OK', cat: 'Sosial', npi: 22, time: '7j', src: 'Kompas', n: 31 },
  { id: 'E16', title: 'Pengamanan jalur distribusi BBM diperketat di Banten', place: 'Serang', prov: 'Banten', lat: -6.1201, lng: 106.1503, sev: 'MON', cat: 'Keamanan', npi: 40, time: '7j', src: 'Antara', n: 47 },
  { id: 'E17', title: 'Ketegangan perbatasan administratif di Aceh', place: 'Banda Aceh', prov: 'Aceh', lat: 5.5483, lng: 95.3238, sev: 'ELEV', cat: 'Konflik', npi: 53, time: '8j', src: 'Serambi', n: 82 },
  { id: 'E18', title: 'Kondisi kondusif dilaporkan di Manado', place: 'Manado', prov: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421, sev: 'OK', cat: 'Sosial', npi: 19, time: '9j', src: 'Antara', n: 24 },
  { id: 'E19', title: 'Demonstrasi guru honorer di Pontianak', place: 'Pontianak', prov: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, sev: 'MON', cat: 'Sosial', npi: 43, time: '10j', src: 'Tribun', n: 58 },
  { id: 'E20', title: 'Aksi tolak relokasi pasar tradisional di Mataram', place: 'Mataram', prov: 'NTB', lat: -8.5833, lng: 116.1167, sev: 'ELEV', cat: 'Sosial', npi: 50, time: '11j', src: 'Antara', n: 69 },
  { id: 'E21', title: 'Stabilitas harga sembako membaik di Kupang', place: 'Kupang', prov: 'NTT', lat: -10.1772, lng: 123.607, sev: 'OK', cat: 'Ekonomi', npi: 25, time: '12j', src: 'Pos Kupang', n: 28 },
  { id: 'E22', title: 'Friksi komunitas adat soal izin tambang di Maluku', place: 'Ambon', prov: 'Maluku', lat: -3.6954, lng: 128.1814, sev: 'HIGH', cat: 'Konflik', npi: 64, time: '13j', src: 'Mongabay', n: 141 },
]

const CATS = ['Sosial', 'Ekonomi', 'Politik', 'Konflik', 'Keamanan', 'Bencana']

/* Keywords ranked by weight. This replaced a word cloud: a cloud encodes
   magnitude as font size, which is the hardest channel to compare, and it
   cannot be read back as numbers. A ranked bar list answers the same
   question and carries its values. */
const TERMS = [
  { text: 'subsidi', value: 98 }, { text: 'demonstrasi', value: 91 }, { text: 'BBM', value: 88 },
  { text: 'inflasi', value: 84 }, { text: 'pemilu', value: 77 }, { text: 'stabilitas', value: 75 },
  { text: 'buruh', value: 72 }, { text: 'konflik', value: 70 }, { text: 'pangan', value: 68 },
  { text: 'agraria', value: 64 }, { text: 'keamanan', value: 63 }, { text: 'tambang', value: 61 },
]

/* 30-day national stability index trend (synthetic, deterministic). */
const TREND = (() => {
  let s = 47
  const out = []
  const M = ['Mei', 'Jun', 'Jul']
  for (let i = 0; i < 30; i++) {
    s += Math.sin(i * 0.6) * 4 + (i > 20 ? 1.6 : 0) + Math.cos(i * 1.3) * 2
    s = Math.max(28, Math.min(86, s))
    const d = new Date(2026, 4, 16 + i)
    out.push({ day: `${d.getDate()} ${M[d.getMonth() - 4] || 'Jul'}`, npi: +s.toFixed(1) })
  }
  return out
})()

const NpiTip = chartTooltip({ format: (v) => v })

export default function NpiDashboard() {
  const t = useChartTheme()
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(null)

  const [selected, setSelected] = useState(null)
  const [filterSev, setFilterSev] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    const totalNews = EVENTS.reduce((a, e) => a + e.n, 0)
    const sources = new Set(EVENTS.map((e) => e.src)).size
    const avg = Math.round(EVENTS.reduce((a, e) => a + e.npi, 0) / EVENTS.length)
    const sevCount = {}
    SEV_ORDER.forEach((k) => (sevCount[k] = EVENTS.filter((e) => e.sev === k).length))
    const catCount = {}
    CATS.forEach((c) => (catCount[c] = EVENTS.filter((e) => e.cat === c).length))
    return {
      totalNews,
      sources,
      events: EVENTS.length,
      avg,
      sevCount,
      catCount,
      maxCat: Math.max(...CATS.map((c) => catCount[c])),
    }
  }, [])

  const filtered = useMemo(() => {
    let list = EVENTS
    if (filterSev) list = list.filter((e) => e.sev === filterSev)
    if (filterCat) list = list.filter((e) => e.cat === filterCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.place.toLowerCase().includes(q) ||
          e.prov.toLowerCase().includes(q),
      )
    }
    return list
  }, [filterSev, filterCat, search])

  const level =
    stats.avg >= 70
      ? { label: 'Volatile', status: 'critical' }
      : stats.avg >= 55
        ? { label: 'Unstable', status: 'serious' }
        : stats.avg >= 40
          ? { label: 'Alert', status: 'warning' }
          : { label: 'Calm', status: 'good' }

  const sevColor = useMemo(
    () => ({
      CRIT: t.status.critical,
      HIGH: t.status.serious,
      ELEV: t.status.warning,
      MON: t.seriesAt(0),
      OK: t.status.good,
    }),
    [t],
  )

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [-2.5, 118],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(mapEl.current)
    const settle = setTimeout(() => map.invalidateSize({ animate: false }), 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  /* Redraw markers when the filter or the theme changes. */
  useEffect(() => {
    const group = markersRef.current
    if (!group) return
    group.clearLayers()

    filtered.forEach((e) => {
      const color = sevColor[e.sev]
      L.circleMarker([e.lat, e.lng], {
        radius: 5 + (e.npi / 100) * 8,
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.55,
      })
        .bindPopup(
          `<div class="dash-pop-title">${e.title}</div>` +
            `<div class="dash-pop-meta">${SEV[e.sev].label} · NPI ${e.npi}</div>` +
            `<div class="dash-pop-meta">${e.place} · ${e.prov}</div>` +
            `<div class="dash-pop-meta">${e.cat} · ${e.n} berita · ${e.time} lalu</div>`,
          { className: 'dash-pop' },
        )
        .on('click', () => setSelected((p) => (p?.id === e.id ? null : e)))
        .addTo(group)
    })
  }, [filtered, sevColor])

  /* Fly to the selected event, or back out when it is cleared. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (selected) map.flyTo([selected.lat, selected.lng], 7, { duration: 1 })
    else map.flyTo([-2.5, 118], 5, { duration: 1 })
  }, [selected])

  return (
    <DashFrame>
      <DashBar
        icon="shield"
        title="National Stability Index"
        subtitle="RETS · national-scale monitoring · synthetic demo data"
      >
        <Chip icon="database" value={stats.totalNews.toLocaleString('en-US')}>
          Articles
        </Chip>
        <Chip icon="layers" value={stats.sources}>
          Sources
        </Chip>
        <Status level={level.status}>
          NPI {stats.avg} · {level.label}
        </Status>
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr)">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat label="National NPI" value={stats.avg} note={`${level.label} · mean of 22 provinces`} />
          <Stat label="Events tracked" value={stats.events} note={`${filtered.length} match the current filter`} />
          <Stat label="Articles ingested" value={stats.totalNews.toLocaleString('en-US')} note={`${stats.sources} distinct sources`} />
          <Stat
            label="Critical + high"
            value={stats.sevCount.CRIT + stats.sevCount.HIGH}
            note={`${stats.sevCount.CRIT} critical · ${stats.sevCount.HIGH} high`}
          />
        </StatGrid>

        <DashBody columns="300px minmax(0, 1fr) 340px" style={{ padding: 0 }}>
          {/* ── Trend, breakdown, filters ───────────────────── */}
          <Col scroll>
            <Panel title="30-day stability trend" note="national index">
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={116}>
                  <AreaChart data={TREND} margin={{ top: 6, right: 8, left: -18, bottom: 4 }}>
                    <defs>
                      <linearGradient id="npiTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.seriesAt(0)} stopOpacity={0.26} />
                        <stop offset="100%" stopColor={t.seriesAt(0)} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...t.grid} />
                    <XAxis dataKey="day" {...t.xAxis} interval={6} />
                    <YAxis domain={[20, 90]} {...t.yAxis} width={30} />
                    <Tooltip content={<NpiTip />} cursor={t.cursor} />
                    <Area
                      type="monotone"
                      dataKey="npi"
                      name="NPI"
                      stroke={t.seriesAt(0)}
                      strokeWidth={2}
                      fill="url(#npiTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Category breakdown" note="click to filter">
              <Meters>
                {CATS.map((c) => (
                  <Meter
                    key={c}
                    label={c}
                    value={stats.catCount[c]}
                    max={stats.maxCat}
                    color={filterCat && filterCat !== c ? t.grid.stroke : t.seriesAt(0)}
                    display={stats.catCount[c]}
                  />
                ))}
              </Meters>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                {CATS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="dash-chip"
                    aria-pressed={filterCat === c}
                    onClick={() => setFilterCat(filterCat === c ? '' : c)}
                    style={{
                      cursor: 'pointer',
                      borderColor: filterCat === c ? 'var(--dash-accent-line)' : undefined,
                      background: filterCat === c ? 'var(--dash-selected)' : undefined,
                      color: filterCat === c ? 'var(--dash-ink)' : undefined,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Severity" note="click to filter">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <button
                  type="button"
                  className="dash-row"
                  aria-selected={filterSev === ''}
                  onClick={() => setFilterSev('')}
                >
                  <span className="dash-row-main">
                    <span className="dash-row-name">All severities</span>
                  </span>
                  <span className="dash-row-value">{EVENTS.length}</span>
                </button>
                {SEV_ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="dash-row"
                    aria-selected={filterSev === k}
                    onClick={() => setFilterSev(filterSev === k ? '' : k)}
                  >
                    <span className="dash-row-main">
                      <Status level={SEV[k].level}>{SEV[k].label}</Status>
                    </span>
                    <span className="dash-row-value">{stats.sevCount[k]}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Top keywords" note="weighted mentions">
              <Meters>
                {TERMS.map((term) => (
                  <Meter
                    key={term.text}
                    label={term.text}
                    value={term.value}
                    color={t.seriesAt(0)}
                    display={term.value}
                  />
                ))}
              </Meters>
            </Panel>
          </Col>

          {/* ── Map ─────────────────────────────────────────── */}
          <Col>
            <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
              <div ref={mapEl} className="dash-map" />
              <MapOverlay position="bottom-left" title="Severity">
                <div className="dash-legend is-stacked">
                  {SEV_ORDER.map((k) => (
                    <span className="dash-legend-item" key={k}>
                      <span className="dash-legend-swatch" style={{ background: sevColor[k] }} />
                      {SEV[k].label}
                      <span className="spacer" />
                      <span className="value">{stats.sevCount[k]}</span>
                    </span>
                  ))}
                </div>
              </MapOverlay>
            </Panel>
          </Col>

          {/* ── Event feed ──────────────────────────────────── */}
          <Col scroll>
            <Panel title="Event feed" note={`${filtered.length} shown`} grow>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                <span className="sr-only">Search events</span>
                <DashIcon name="filter" size={13} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari peristiwa, kota, provinsi"
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

              {selected && (
                <div
                  style={{
                    padding: 10,
                    marginBottom: 9,
                    border: '1px solid var(--dash-accent-line)',
                    borderRadius: 8,
                    background: 'var(--dash-selected)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Status level={SEV[selected.sev].level}>{SEV[selected.sev].label}</Status>
                    <span className="dash-num" style={{ fontWeight: 600, color: 'var(--dash-ink)' }}>
                      NPI {selected.npi}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
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
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dash-ink)' }}>
                    {selected.title}
                  </div>
                  <table className="dash-table" style={{ marginTop: 8 }}>
                    <tbody>
                      <tr>
                        <td>Location</td>
                        <td className="num">{selected.place}, {selected.prov}</td>
                      </tr>
                      <tr>
                        <td>Category</td>
                        <td className="num">{selected.cat}</td>
                      </tr>
                      <tr>
                        <td>Articles</td>
                        <td className="num">{selected.n}</td>
                      </tr>
                      <tr>
                        <td>Source</td>
                        <td className="num">{selected.src} · {selected.time} lalu</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <List>
                {filtered.map((e) => (
                  <Row
                    key={e.id}
                    name={e.title}
                    sub={`${e.place} · ${e.cat} · ${e.time}`}
                    value={e.npi}
                    selected={selected?.id === e.id}
                    onSelect={() => setSelected(selected?.id === e.id ? null : e)}
                  >
                    <span
                      className="dash-legend-swatch"
                      style={{ background: sevColor[e.sev] }}
                      aria-hidden="true"
                    />
                  </Row>
                ))}
              </List>

              {filtered.length === 0 && (
                <p className="dash-note" style={{ padding: '18px 0', textAlign: 'center' }}>
                  No events match the current filter.
                </p>
              )}
            </Panel>
          </Col>
        </DashBody>
      </DashBody>
    </DashFrame>
  )
}
