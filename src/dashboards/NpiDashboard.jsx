/* National Stability Index (NPI) — faithful React port of the RETS national-scale
   monitoring map dashboard (erpdesign/RETS_FINAL/MAPS.jsx).
   Mapbox -> free Leaflet/OSM. Live API + echarts -> embedded synthetic sample data
   + recharts. styled-components -> scoped CSS. All data is SYNTHETIC. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import './npi.css'

/* ── Severity palette (from MAPS.jsx :root) ── */
const SEV = {
  CRIT: { c: '#f43f5e', label: 'CRITICAL' },
  HIGH: { c: '#fb923c', label: 'HIGH' },
  ELEV: { c: '#facc15', label: 'ELEVATED' },
  MON: { c: '#22d3ee', label: 'MONITOR' },
  OK: { c: '#22c55e', label: 'STABLE' },
}
const sevColor = (s) => SEV[s]?.c || '#94a3b8'

/* ── Synthetic national-scale stability events across Indonesia (provinces) ── */
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
  { id: 'E21', title: 'Stabilitas harga sembako membaik di Kupang', place: 'Kupang', prov: 'NTT', lat: -10.1772, lng: 123.6070, sev: 'OK', cat: 'Ekonomi', npi: 25, time: '12j', src: 'Pos Kupang', n: 28 },
  { id: 'E22', title: 'Friksi komunitas adat soal izin tambang di Maluku', place: 'Ambon', prov: 'Maluku', lat: -3.6954, lng: 128.1814, sev: 'HIGH', cat: 'Konflik', npi: 64, time: '13j', src: 'Mongabay', n: 141 },
]

const CATS = ['Sosial', 'Ekonomi', 'Politik', 'Konflik', 'Keamanan', 'Bencana']
const CAT_COLOR = { Sosial: '#f43f5e', Ekonomi: '#fb923c', Politik: '#facc15', Konflik: '#8e44ad', Keamanan: '#22d3ee', Bencana: '#22c55e' }
const SEV_ORDER = ['CRIT', 'HIGH', 'ELEV', 'MON', 'OK']

/* ── Tactical word cloud terms (synthetic, weighted) ── */
const TERMS = [
  { text: 'subsidi', value: 98 }, { text: 'demonstrasi', value: 91 }, { text: 'inflasi', value: 84 },
  { text: 'pemilu', value: 77 }, { text: 'BBM', value: 88 }, { text: 'buruh', value: 72 },
  { text: 'agraria', value: 64 }, { text: 'separatisme', value: 59 }, { text: 'pangan', value: 68 },
  { text: 'tambang', value: 61 }, { text: 'UMP', value: 55 }, { text: 'sembako', value: 52 },
  { text: 'reklamasi', value: 44 }, { text: 'honorer', value: 41 }, { text: 'mediasi', value: 38 },
  { text: 'pilkada', value: 49 }, { text: 'logistik', value: 46 }, { text: 'sawit', value: 57 },
  { text: 'keamanan', value: 63 }, { text: 'adat', value: 36 }, { text: 'distribusi', value: 42 },
  { text: 'anggaran', value: 48 }, { text: 'konflik', value: 70 }, { text: 'stabilitas', value: 75 },
]

/* ── 30-day national stability index trend (synthetic) ── */
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

/* Tactical word cloud (font-size scaled by weight, like the original). */
function WordCloud({ terms }) {
  const vals = terms.map((d) => d.value)
  const min = Math.min(...vals), max = Math.max(...vals)
  return (
    <div className="kw-cloud">
      {terms.map((t, i) => {
        const r = max === min ? 0 : (t.value - min) / (max - min)
        const fs = 10 + r * 13
        const op = 0.4 + r * 0.6
        const hot = r > 0.8
        return (
          <span key={i} className={`kw-tag${hot ? ' hot' : ''}`} title={`${t.text}: ${t.value}`}
            style={{ fontSize: `${fs}px`, fontWeight: hot ? 700 : 500, color: hot ? '#f43f5e' : `rgba(154,138,138,${op})` }}>
            {t.text.toLowerCase()}
          </span>
        )
      })}
    </div>
  )
}

export default function NpiDashboard() {
  const mapEl = useRef(null), mapRef = useRef(null), markersRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [filterSev, setFilterSev] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    const totalNews = EVENTS.reduce((a, e) => a + e.n, 0)
    const sources = new Set(EVENTS.map((e) => e.src)).size
    const avg = Math.round(EVENTS.reduce((a, e) => a + e.npi, 0) / EVENTS.length)
    const sevCount = {}; SEV_ORDER.forEach((k) => (sevCount[k] = EVENTS.filter((e) => e.sev === k).length))
    const catCount = {}; CATS.forEach((c) => (catCount[c] = EVENTS.filter((e) => e.cat === c).length))
    const maxCat = Math.max(...CATS.map((c) => catCount[c]))
    return { totalNews, sources, events: EVENTS.length, avg, sevCount, catCount, maxCat }
  }, [])

  const filtered = useMemo(() => {
    let list = EVENTS
    if (filterSev) list = list.filter((e) => e.sev === filterSev)
    if (filterCat) list = list.filter((e) => e.cat === filterCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.place.toLowerCase().includes(q) || e.prov.toLowerCase().includes(q))
    }
    return list
  }, [filterSev, filterCat, search])

  const stabilityLevel = stats.avg >= 70 ? { t: 'VOLATILE', c: '#f43f5e' } : stats.avg >= 55 ? { t: 'UNSTABLE', c: '#fb923c' } : stats.avg >= 40 ? { t: 'ALERT', c: '#facc15' } : { t: 'CALM', c: '#22c55e' }

  // MAP INIT (Leaflet, replaces Mapbox). Guarded vs StrictMode double-mount.
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, { center: [-2.5, 118], zoom: 5, zoomControl: true, attributionControl: true, worldCopyJump: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 }).addTo(m)
    mapRef.current = m
    markersRef.current = L.layerGroup().addTo(m)
    const ro = new ResizeObserver(() => m.invalidateSize({ animate: false })); ro.observe(mapEl.current)
    const t = setTimeout(() => m.invalidateSize({ animate: false }), 80)
    return () => { clearTimeout(t); ro.disconnect(); m.remove(); mapRef.current = null }
  }, [])

  // Plot / refresh markers when filter changes
  useEffect(() => {
    const grp = markersRef.current; if (!grp) return
    grp.clearLayers()
    filtered.forEach((e) => {
      const col = sevColor(e.sev)
      const r = 5 + (e.npi / 100) * 8
      const mk = L.circleMarker([e.lat, e.lng], { radius: r, color: col, weight: 1.5, fillColor: col, fillOpacity: 0.55 })
      mk.bindPopup(
        `<div class="npi-pop"><div class="pp-sev" style="color:${col}">${SEV[e.sev].label} · NPI ${e.npi}</div>` +
        `<div class="pp-title">${e.title}</div>` +
        `<div class="pp-meta">${e.place} · ${e.prov}</div>` +
        `<div class="pp-meta">${e.cat} · ${e.n} berita · ${e.time} lalu</div></div>`,
        { className: 'npi-popup' }
      )
      mk.on('click', () => setSel((p) => (p?.id === e.id ? null : e)))
      mk.addTo(grp)
    })
  }, [filtered])

  // fly to selected event
  useEffect(() => {
    const m = mapRef.current; if (!m) return
    if (sel) m.flyTo([sel.lat, sel.lng], 7, { duration: 1 })
    else m.flyTo([-2.5, 118], 5, { duration: 1 })
  }, [sel])

  const tickerItems = [...EVENTS, ...EVENTS]

  return (
    <div className="npi-dash">
      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label"><span className="tk-dot" /> LIVE</div>
        <div className="ticker-vp">
          <div className="ticker-track">
            {tickerItems.map((e, i) => (
              <div className="ticker-item" key={i}><span className="tk-idot" style={{ background: sevColor(e.sev) }} /> {e.title}</div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="left-scroll">
            <div className="brand">
              <div className="brand-t">NATIONAL STABILITY INDEX</div>
              <div className="brand-s">RETS · National-Scale Monitoring</div>
            </div>

            {/* STATS */}
            <div className="stats-inline">
              <div className="stat-cell"><div className="stat-num red">{stats.totalNews.toLocaleString('id-ID')}</div><div className="stat-lbl">TOTAL NEWS</div></div>
              <div className="stat-cell"><div className="stat-num white">{stats.sources}</div><div className="stat-lbl">SOURCES</div></div>
              <div className="stat-cell"><div className="stat-num orange">{stats.events}</div><div className="stat-lbl">EVENTS</div></div>
            </div>

            {/* NATIONAL NPI GAUGE */}
            <div className="npi-gauge">
              <div className="ng-num" style={{ color: stabilityLevel.c }}>{stats.avg}</div>
              <div className="ng-side">
                <div className="ng-lvl" style={{ color: stabilityLevel.c }}>{stabilityLevel.t}</div>
                <div className="ng-lbl">NATIONAL NPI · avg 22 prov</div>
              </div>
            </div>

            {/* TREND */}
            <div className="sec-title">30-DAY STABILITY TREND</div>
            <div className="trend-box">
              <ResponsiveContainer width="100%" height={92}>
                <AreaChart data={TREND} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="npiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2e2424" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 7, fill: '#64748b' }} interval={6} axisLine={{ stroke: '#2e2424' }} tickLine={false} />
                  <YAxis domain={[20, 90]} tick={{ fontSize: 7, fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #2e2424', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#f43f5e' }} />
                  <Area type="monotone" dataKey="npi" stroke="#f43f5e" strokeWidth={1.6} fill="url(#npiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* CATEGORY BREAKDOWN */}
            <div className="sec-title">CATEGORY BREAKDOWN</div>
            {CATS.map((c) => (
              <div key={c} className={`bkd-item${filterCat === c ? ' on' : ''}`} onClick={() => setFilterCat(filterCat === c ? '' : c)}>
                <div className="bkd-name"><span className="dot" style={{ background: CAT_COLOR[c] }} /> {c}</div>
                <div className="bkd-bar-wrap"><div className="bkd-bar" style={{ width: `${(stats.catCount[c] / stats.maxCat) * 100}%`, background: CAT_COLOR[c] }} /></div>
                <div className="bkd-num">{stats.catCount[c]}</div>
              </div>
            ))}

            {/* SEVERITY FILTER / LEGEND */}
            <div className="sec-title">SEVERITY FILTER</div>
            <div className="sev-grid">
              <button className={`sev-chip${filterSev === '' ? ' on' : ''}`} onClick={() => setFilterSev('')}>ALL</button>
              {SEV_ORDER.map((k) => (
                <button key={k} className={`sev-chip${filterSev === k ? ' on' : ''}`} style={filterSev === k ? { background: SEV[k].c, borderColor: SEV[k].c, color: '#fff' } : {}} onClick={() => setFilterSev(filterSev === k ? '' : k)}>
                  <span className="dot" style={{ background: SEV[k].c }} /> {SEV[k].label} <span className="sev-n">{stats.sevCount[k]}</span>
                </button>
              ))}
            </div>

            {/* WORD CLOUD */}
            <div className="sec-title">TACTICAL KEYWORDS</div>
            <WordCloud terms={TERMS} />
          </div>
        </div>

        {/* MAP */}
        <div className="map-wrap">
          <div ref={mapEl} className="npi-map" />
          <div className="map-overlay-top">
            <div className="map-badge"><span className="hl">●</span> NATIONAL STABILITY MONITOR <span className="hl">{filtered.length}</span> EVENTS</div>
            <div className="map-score-box">
              <div className="map-score-num" style={{ color: stabilityLevel.c }}>{stats.avg}</div>
              <div className="map-score-lbl">NPI · {stabilityLevel.t}</div>
            </div>
          </div>
          <div className="map-legend">
            <div className="ml-title">SEVERITY</div>
            {SEV_ORDER.map((k) => (
              <div className="ml-item" key={k}><span className="ml-dot" style={{ background: SEV[k].c }} /> {SEV[k].label}</div>
            ))}
          </div>
          <div className="map-watermark">RETS · NPI ENGINE v2</div>
        </div>

        {/* RIGHT PANEL — INTEL / EVENT FEED */}
        <div className="right-panel">
          <div className="rp-header">
            <div className="rp-title">INTEL FEED</div>
            <div className="rp-badge">{filtered.length}</div>
          </div>
          <div className="ev-search-wrap">
            <input className="ev-search" placeholder="Cari peristiwa, kota, provinsi…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {sel && (
            <div className="intel-detail" style={{ borderColor: sevColor(sel.sev) + '55' }}>
              <div className="id-top">
                <span className="id-sev" style={{ background: sevColor(sel.sev) + '22', color: sevColor(sel.sev) }}>{SEV[sel.sev].label}</span>
                <span className="id-npi" style={{ color: sevColor(sel.sev) }}>NPI {sel.npi}</span>
                <button className="id-close" onClick={() => setSel(null)}>✕</button>
              </div>
              <div className="id-title">{sel.title}</div>
              <div className="id-meta">{sel.place} · {sel.prov}</div>
              <div className="id-stats">
                <div className="id-st"><span>KATEGORI</span><b style={{ color: CAT_COLOR[sel.cat] }}>{sel.cat}</b></div>
                <div className="id-st"><span>BERITA</span><b>{sel.n}</b></div>
                <div className="id-st"><span>SUMBER</span><b>{sel.src}</b></div>
                <div className="id-st"><span>WAKTU</span><b>{sel.time} lalu</b></div>
              </div>
            </div>
          )}

          <div className="ev-list">
            {filtered.map((e) => (
              <div key={e.id} className={`ev-card${sel?.id === e.id ? ' sel' : ''}`} onClick={() => setSel(sel?.id === e.id ? null : e)}>
                <div className="ev-bar" style={{ background: sevColor(e.sev) }} />
                <div className="ev-body">
                  <div className="ev-title">{e.title}</div>
                  <div className="ev-meta">
                    <span className="ev-place">{e.place}</span>
                    <span className="ev-cat" style={{ color: CAT_COLOR[e.cat] }}>{e.cat}</span>
                    <span className="ev-time">{e.time}</span>
                  </div>
                </div>
                <div className="ev-npi" style={{ color: sevColor(e.sev) }}>{e.npi}</div>
              </div>
            ))}
            {filtered.length === 0 && <div className="ev-empty">NO EVENTS MATCH FILTER</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
