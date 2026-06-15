/* Karhutla Command Center v3.0 — faithful React port of
   erpdesign/FIRE_PREDICTION/dashboard_mockup.html.
   Mapbox -> free Leaflet/OSM. Live OpenWeather + Groq calls -> embedded
   sample data + local AI fallback. All data is synthetic. */
import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './fire.css'

const RC = { Rendah: '#22c55e', Sedang: '#eab308', Tinggi: '#f97316', Ekstrem: '#ef4444' }
const rc = (s) => (s >= 76 ? 'Ekstrem' : s >= 51 ? 'Tinggi' : s >= 26 ? 'Sedang' : 'Rendah')
const rcc = (s) => RC[rc(s)]

const TIP = {
  FWI: 'Fire Weather Index v2 (Tropis). Dibagi 15 untuk normalisasi karena anomali RH.',
  NDVI: 'Normalized Difference Vegetation Index — Indikator bahan bakar kering. Bobot 15%.',
  NDMI: 'Normalized Difference Moisture Index — Indikator water stress. Bobot 10%.',
  LST: 'Land Surface Temperature — Suhu tanah. Bobot 10%.',
  SM: 'Soil Moisture — Kelembaban tanah. Bobot 10%.',
  Rain: 'Kekeringan akibat minim hujan. Bobot 10%.',
}
const T = (k) => TIP[k] || k

function mkR(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 } }
function mkPoly(lng, lat, sz, rnd) {
  const pts = 7 + Math.floor(rnd() * 4), cs = []
  for (let i = 0; i < pts; i++) { const a = (i / pts) * Math.PI * 2, r = sz * (0.6 + rnd() * 0.8); cs.push([+(lng + r * Math.cos(a)).toFixed(5), +(lat + r * Math.sin(a) * 1.1).toFixed(5)]) }
  cs.push(cs[0]); return [cs]
}

const FUEL = { 'Hutan Rawa Gambut': 0.5, Perkebunan: 1.5, 'Hutan Lahan Kering': 1.0, Pemukiman: 0.0, Sawah: 0.2, 'Pertanian LK': 2.0, 'Hutan Mangrove': 0.3 }

const DR = [
  { n: 'Tanjung Lajau', k: 'Indragiri Hilir', kc: 'Enok', lat: 0.34, lng: 103.18, p: 1 }, { n: 'Sungai Buluh', k: 'Indragiri Hilir', kc: 'Enok', lat: 0.28, lng: 103.25, p: 1 },
  { n: 'Concong Dalam', k: 'Indragiri Hilir', kc: 'Concong', lat: 0.42, lng: 103.35, p: 1 }, { n: 'Guntung', k: 'Indragiri Hilir', kc: 'Kateman', lat: 0.01, lng: 103.30, p: 1 },
  { n: 'Kuala Cenaku', k: 'Indragiri Hilir', kc: 'Kuala Cenaku', lat: 0.15, lng: 103.10, p: 1 },
  { n: 'Teluk Meranti', k: 'Pelalawan', kc: 'Teluk Meranti', lat: 0.42, lng: 102.08, p: 1 }, { n: 'Kerumutan', k: 'Pelalawan', kc: 'Kerumutan', lat: 0.20, lng: 102.30, p: 1 },
  { n: 'Ukui Aksi', k: 'Pelalawan', kc: 'Ukui', lat: 0.15, lng: 102.42, p: 1 }, { n: 'Kuala Kampar', k: 'Pelalawan', kc: 'Kuala Kampar', lat: 0.65, lng: 102.50, p: 1 },
  { n: 'Pangkalan Kerinci', k: 'Pelalawan', kc: 'P. Kerinci', lat: 0.35, lng: 102.12, p: 0 },
  { n: 'Tanjung Buton', k: 'Siak', kc: 'Tanjung Buton', lat: 1.20, lng: 102.15, p: 1 }, { n: 'Dayun', k: 'Siak', kc: 'Dayun', lat: 1.10, lng: 101.80, p: 1 },
  { n: 'Tualang', k: 'Siak', kc: 'Tualang', lat: 0.98, lng: 101.60, p: 0 }, { n: 'Merbau', k: 'Siak', kc: 'Merbau', lat: 1.05, lng: 102.40, p: 1 },
  { n: 'Bengkalis Kota', k: 'Bengkalis', kc: 'Bengkalis', lat: 1.48, lng: 102.08, p: 1 }, { n: 'Mandau', k: 'Bengkalis', kc: 'Mandau', lat: 1.35, lng: 101.75, p: 1 },
  { n: 'Pinggir', k: 'Bengkalis', kc: 'Pinggir', lat: 1.25, lng: 101.55, p: 0 }, { n: 'Rupat', k: 'Bengkalis', kc: 'Rupat', lat: 1.82, lng: 101.70, p: 1 },
  { n: 'Bagan Siapi-api', k: 'Rokan Hilir', kc: 'Bangko', lat: 2.16, lng: 100.81, p: 1 }, { n: 'Rimba Sekampung', k: 'Rokan Hilir', kc: 'Rimba Mel.', lat: 2.05, lng: 100.95, p: 1 },
  { n: 'Bangko', k: 'Rokan Hilir', kc: 'Bangko Pus.', lat: 1.95, lng: 101.10, p: 1 }, { n: 'Kubu', k: 'Rokan Hilir', kc: 'Kubu', lat: 1.85, lng: 101.25, p: 1 },
  { n: 'Pangkalan Serai', k: 'Kampar', kc: 'Kampar Timur', lat: 0.35, lng: 101.20, p: 0 }, { n: 'Lipat Kain', k: 'Kampar', kc: 'Kampar Kiri', lat: 0.22, lng: 101.55, p: 0 },
  { n: 'Rantau Berangin', k: 'Kampar', kc: 'Kampar Utara', lat: 0.10, lng: 101.40, p: 0 }, { n: 'Siak Hulu', k: 'Kampar', kc: 'Siak Hulu', lat: 0.48, lng: 101.30, p: 0 },
  { n: 'Pasir Pengaraian', k: 'Rokan Hulu', kc: 'Rambah', lat: 0.85, lng: 100.25, p: 0 }, { n: 'Ujung Batu', k: 'Rokan Hulu', kc: 'Ujung Batu', lat: 0.95, lng: 100.50, p: 0 },
  { n: 'Tandun', k: 'Rokan Hulu', kc: 'Tandun', lat: 0.75, lng: 100.60, p: 0 },
  { n: 'Tanjung Samak', k: 'Kep. Meranti', kc: 'Rangsang', lat: 1.10, lng: 102.55, p: 1 }, { n: 'Selat Panjang', k: 'Kep. Meranti', kc: 'Tebing Tinggi', lat: 0.98, lng: 102.70, p: 1 },
  { n: 'Rangsang', k: 'Kep. Meranti', kc: 'Rangsang Barat', lat: 1.02, lng: 102.85, p: 1 },
  { n: 'Medang Kampai', k: 'Dumai', kc: 'Medang Kampai', lat: 1.72, lng: 101.52, p: 1 }, { n: 'Bukit Kapur', k: 'Dumai', kc: 'Bukit Kapur', lat: 1.68, lng: 101.45, p: 0 },
  { n: 'Rengat', k: 'Indragiri Hulu', kc: 'Rengat', lat: -0.35, lng: 102.55, p: 0 }, { n: 'Peranap', k: 'Indragiri Hulu', kc: 'Peranap', lat: -0.52, lng: 102.15, p: 0 },
  { n: 'Pasir Penyu', k: 'Indragiri Hulu', kc: 'Pasir Penyu', lat: -0.30, lng: 102.30, p: 0 },
  { n: 'Taluk Kuantan', k: 'Kuantan Singingi', kc: 'Kuantan Tengah', lat: -0.53, lng: 101.55, p: 0 },
  { n: 'Cerenti', k: 'Kuantan Singingi', kc: 'Cerenti', lat: -0.40, lng: 101.35, p: 0 },
  { n: 'Tampan', k: 'Pekanbaru', kc: 'Tampan', lat: 0.46, lng: 101.42, p: 0 }, { n: 'Tenayan Raya', k: 'Pekanbaru', kc: 'Tenayan Raya', lat: 0.55, lng: 101.50, p: 0 },
  { n: 'Rumbai', k: 'Pekanbaru', kc: 'Rumbai', lat: 0.58, lng: 101.40, p: 0 }, { n: 'Sail', k: 'Pekanbaru', kc: 'Sail', lat: 0.52, lng: 101.45, p: 0 },
  { n: 'Bukit Raya', k: 'Pekanbaru', kc: 'Bukit Raya', lat: 0.48, lng: 101.48, p: 0 },
]

const HS = [
  { id: 'HS001', lat: 0.32, lng: 103.20, conf: 'high', sat: 'SNPP', date: '15 Apr', wd: 135, ws: 16, rain: 0 },
  { id: 'HS002', lat: 0.26, lng: 103.28, conf: 'high', sat: 'NOAA-20', date: '15 Apr', wd: 120, ws: 12, rain: 0 },
  { id: 'HS003', lat: 0.43, lng: 102.10, conf: 'medium', sat: 'SNPP', date: '15 Apr', wd: 90, ws: 8, rain: 0 },
  { id: 'HS004', lat: 0.21, lng: 102.33, conf: 'high', sat: 'Aqua', date: '15 Apr', wd: 150, ws: 22, rain: 0 },
  { id: 'HS005', lat: 1.36, lng: 101.77, conf: 'medium', sat: 'SNPP', date: '14 Apr', wd: 180, ws: 5, rain: 8 },
  { id: 'HS006', lat: 1.83, lng: 101.69, conf: 'high', sat: 'NOAA-20', date: '14 Apr', wd: 200, ws: 10, rain: 12 },
  { id: 'HS007', lat: 0.16, lng: 102.44, conf: 'medium', sat: 'Aqua', date: '15 Apr', wd: 100, ws: 15, rain: 0 },
  { id: 'HS008', lat: 2.07, lng: 100.90, conf: 'high', sat: 'SNPP', date: '13 Apr', wd: 170, ws: 4, rain: 20 },
  { id: 'HS009', lat: 1.11, lng: 102.56, conf: 'medium', sat: 'NOAA-20', date: '15 Apr', wd: 110, ws: 18, rain: 0 },
  { id: 'HS010', lat: 0.66, lng: 102.52, conf: 'high', sat: 'Aqua', date: '14 Apr', wd: 160, ws: 25, rain: 0 },
  { id: 'HS011', lat: 2.17, lng: 100.83, conf: 'medium', sat: 'SNPP', date: '12 Apr', wd: 190, ws: 8, rain: 15 },
  { id: 'HS012', lat: 0.14, lng: 103.12, conf: 'high', sat: 'NOAA-20', date: '15 Apr', wd: 130, ws: 14, rain: 0 },
]

const LAYERS = [
  { id: 'risk', name: 'Heatmap Risiko', icon: '🌡️', desc: 'Polygon zona diwarnai sesuai skor risiko', g: 'utama', on: true },
  { id: 'wind', name: 'Animasi Angin', icon: '🌬️', desc: 'Partikel angin bergerak di peta (Windy-style)', g: 'utama', on: true },
  { id: 'hotspot', name: 'Titik Panas KLHK', icon: '🔴', desc: 'Hotspot dari satelit SNPP/NOAA/Aqua', g: 'utama', on: true },
  { id: 'border', name: 'Batas Zona', icon: '🗺️', desc: 'Garis batas wilayah rawan', g: 'utama', on: true },
  { id: 'peat', name: 'Lahan Gambut', icon: '🟤', desc: 'Area gambut (Kemendagri)', g: 'teknis', on: false },
  { id: 'landcover', name: 'Tutupan Lahan', icon: '🌳', desc: 'Jenis lahan: hutan, sawit, sawah', g: 'teknis', on: false },
  { id: 'ndvi', name: 'Kehijauan (NDVI)', icon: '🌿', desc: 'Indeks kehijauan vegetasi dari satelit', g: 'teknis', on: false },
  { id: 'ndmi', name: 'Kelembaban Daun (NDMI)', icon: '💦', desc: 'Kadar air tanaman dari satelit', g: 'teknis', on: false },
  { id: 'slope', name: 'Kemiringan Lereng', icon: '⛰️', desc: 'Derajat kemiringan lahan', g: 'teknis', on: false },
  { id: 'spread', name: 'Simulasi Jalar Api', icon: '🔥', desc: 'Simulasi perambatan api CA', g: 'teknis', on: false },
]

/* Static synthetic wind field over Riau (replaces the OpenWeather IDW fetch). */
const WGRID = (() => {
  const g = []
  for (let lat = -1; lat <= 3.0001; lat += 0.25) {
    for (let lng = 99.5; lng <= 104.0001; lng += 0.25) {
      const ang = 3.9 + Math.sin(lat * 0.8) * 0.7 + Math.cos(lng * 0.55) * 0.6
      const spd = 8 + 9 * Math.abs(Math.sin(lat * 1.25 + lng * 0.6))
      g.push({ lat, lng, u: spd * Math.cos(ang), v: spd * Math.sin(ang), spd })
    }
  }
  return g
})()

function calcD(d, i) {
  const r = mkR(i * 7919 + 31), rn = () => r()
  const zId = `ZR-140412-${String(i + 1).padStart(3, '0')}`
  const cap = (v) => (v <= 92 ? Math.round(Math.max(0, v)) : Math.round(92 + ((v - 92) * 7) / ((v - 92) + 7)))
  const temp = +(28 + rn() * 7).toFixed(1), rh = +(55 + rn() * 25).toFixed(1)
  const wind = +(12 + rn() * 15).toFixed(1)
  const rain = +(rn() > 0.6 ? 0 : rn() * 8).toFixed(1)
  const lst = +(28 + rn() * 15).toFixed(1)
  const fwi_raw = +(rn() * 18).toFixed(2)
  const fwiNorm = +Math.min((fwi_raw / 15) * 100, 100).toFixed(1)
  const ndvi = +(d.p ? 0.2 + rn() * 0.4 : 0.5 + rn() * 0.4).toFixed(3)
  const ndmi = +(d.p ? -0.1 + rn() * 0.3 : 0.2 + rn() * 0.3).toFixed(3)
  const sm = +(d.p ? 0.05 + rn() * 0.2 : 0.2 + rn() * 0.3).toFixed(3)
  const nr = Math.max(0, Math.min(100, ((0.8 - ndvi) / 0.8) * 100))
  const mr = Math.max(0, Math.min(100, ((0.3 - ndmi) / 0.8) * 100))
  const lr = Math.max(0, Math.min(100, ((lst - 25) / 15) * 100))
  const sr = Math.max(0, Math.min(100, (1 - sm) * 100))
  const rr = Math.max(0, Math.min(100, (1 - rain / 10) * 100))
  const w_ndvi = nr * 0.15, w_ndmi = mr * 0.10, w_lst = lr * 0.10, w_sm = sr * 0.10, w_rain = rr * 0.10, w_fwi = fwiNorm * 0.30
  const base0_100 = (w_ndvi + w_ndmi + w_lst + w_sm + w_rain + w_fwi) / 0.85
  const lc = d.p
    ? [{ n: 'Hutan Rawa Gambut', pct: Math.round(20 + rn() * 30) }, { n: 'Perkebunan', pct: Math.round(20 + rn() * 25) }, { n: 'Hutan Lahan Kering', pct: 0 }, { n: 'Pemukiman', pct: Math.round(5 + rn() * 10) }, { n: 'Sawah', pct: 0 }]
    : [{ n: 'Hutan Lahan Kering', pct: Math.round(15 + rn() * 30) }, { n: 'Perkebunan', pct: Math.round(10 + rn() * 25) }, { n: 'Pemukiman', pct: Math.round(10 + rn() * 20) }, { n: 'Pertanian LK', pct: Math.round(5 + rn() * 15) }, { n: 'Sawah', pct: 0 }]
  const usedPct = lc.reduce((s, x) => s + x.pct, 0)
  if (usedPct < 100) { const rem = lc.find((x) => x.pct === 0); if (rem) rem.pct = 100 - usedPct; else lc[0].pct += 100 - usedPct }
  lc.sort((a, b) => b.pct - a.pct)
  const fFuel = +lc.reduce((s, x) => s + ((FUEL[x.n] || 0.5) * x.pct) / 100, 0).toFixed(3)
  const slopeDeg = +(d.p ? rn() * 3 : rn() * 15).toFixed(1)
  const peatRatio = d.p ? +(0.3 + rn() * 0.7).toFixed(2) : 0
  const pb = +(15 * peatRatio).toFixed(1)
  const hsHistory = d.p ? Math.floor(rn() * 5) : Math.floor(rn() * 2)
  const hb = hsHistory >= 2 ? 5 : 0
  const baseScore = cap(base0_100 + pb + hb)
  let distStr = 99
  HS.forEach((h) => { const dist = Math.sqrt(Math.pow(h.lat - d.lat, 2) + Math.pow(h.lng - d.lng, 2)) * 111; if (dist < distStr) distStr = dist })
  const rtHs = distStr < 5 ? 20 : distStr < 10 ? 10 : 0
  const rtWind = wind > 20 ? 10 : wind > 15 ? 5 : 0
  const rtRain = rain > 5 ? -15 : rain > 2 ? -8 : 0
  const rtMod = rtHs + rtWind + rtRain
  const score = cap(baseScore + rtMod)
  const hist = Array.from({ length: 7 }, (_, j) => cap(score + (j - 6) * rn() * 5 * (rn() > 0.5 ? 1 : -1)))
  const forecast = Array.from({ length: 7 }, (_, j) => cap(score + (j + 1) * rn() * 4 * (rn() > 0.5 ? 1 : -1)))
  return { ...d, id: zId, score, baseScore, cls: rc(score), fwi: fwi_raw, fwiNorm, ndvi, ndmi, lst, sm, rain, rh, temp, wind, w_ndvi, w_ndmi, w_lst, w_sm, w_rain, w_fwi, pb, hb, peatRatio, rtMod, rtHs, rtWind, rtRain, lc, fFuel, slopeDeg, hist, forecast, poly: mkPoly(d.lng, d.lat, 0.03 + rn() * 0.02, rn) }
}
const ZONES = DR.map((d, i) => calcD(d, i)).sort((a, b) => b.score - a.score)
const dGeo = { type: 'FeatureCollection', features: ZONES.map((d) => ({ type: 'Feature', properties: { id: d.id, name: d.n, kab: d.k, kec: d.kc, score: d.score, cls: d.cls, color: rcc(d.score) }, geometry: { type: 'Polygon', coordinates: d.poly } })) }
const KABLIST = [...new Set(ZONES.map((d) => d.k))].sort()

/* Local AI agent (the original's offline fallback — no external call). */
function localAI(z) {
  const lvl = rc(z.score)
  if (lvl === 'Rendah') return { RISIKO: `Risiko Rendah (${z.score}/100). Kondisi vegetasi aman dan kelembaban stabil.`, FAKTOR: `• NDVI normal (${z.ndvi}) • Tidak ada anomali cuaca BMKG.`, REKOMENDASI: `• Monitoring rutin satelit • Data on-demand.` }
  if (lvl === 'Sedang') return { RISIKO: `Risiko mulai meningkat (${z.score}/100) di wilayah Kec. ${z.kc}.`, FAKTOR: `• Indeks FWI v2 naik ke ${z.fwiNorm} • Kecepatan angin rata-rata ${z.wind} km/j.`, REKOMENDASI: `• Daily summary per kabupaten • Pantau tren penurunan NDMI di GEE.` }
  if (lvl === 'Tinggi') return { RISIKO: `ALERT: Risiko TINGGI (${z.score}/100) terdeteksi di ${z.id} (${z.n}).`, FAKTOR: `• NDMI turun ke ${z.ndmi} (water stress) • Lahan gambut menyumbang +${z.pb} boost.`, REKOMENDASI: `• Push notification ke Satgas Regu 3 • Siapkan jadwal patroli darat segera.` }
  return { RISIKO: `TACTICAL BRIEFING: EKSTREM (${z.score}/100) di ${z.n}!`, FAKTOR: `• RT Modifier aktif (+${z.rtMod}) • Hotspot <5km dari titik referensi • Angin ${z.wind} km/h.`, REKOMENDASI: `• SMS blast ke tim pemadam terdekat • Auto-dispatch armada sekarang juga.` }
}

function genSpreadRings(lat, lng, wd, idxMul = 1) {
  const rings = [], steps = [1, 3, 6, 12, 24]
  const colors = ['#ef4444', '#f97316', '#fb923c', '#fbbf24', '#fef08a']
  steps.forEach((t, idx) => {
    const pts = [], n = 24, baseR = t * 0.008
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, wRad = (wd * Math.PI) / 180, stretch = 1 + Math.cos(a - wRad) * 0.7 * idx
      const rr = baseR * stretch * (0.9 + ((i * idxMul) % 5) * 0.04)
      pts.push([lat + rr * Math.sin(a) * 1.1, lng + rr * Math.cos(a)])
    }
    rings.push({ ring: pts, opacity: 0.4 - idx * 0.06, color: colors[idx] })
  })
  return rings
}

function getDates() {
  const today = new Date('2026-04-16T00:00:00')
  const days = []
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  for (let i = -7; i <= 7; i++) { const d = new Date(today); d.setDate(d.getDate() + i); days.push({ offset: i, label: d.getDate() + ' ' + M[d.getMonth()], isToday: i === 0 }) }
  return days
}
const TL_DAYS = getDates()

export default function FireRiskDashboard() {
  const mapEl = useRef(null), mapRef = useRef(null), canvasRef = useRef(null)
  const geoRef = useRef(null), hsRef = useRef(null), spreadRef = useRef(null), animRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [spread, setSpread] = useState(false)
  const [spreadIdx, setSpreadIdx] = useState(0)
  const [spreadStep, setSpreadStep] = useState(0)
  const [layerOpen, setLayerOpen] = useState(false)
  const [layers, setLayers] = useState(() => { const s = {}; LAYERS.forEach((l) => (s[l.id] = l.on)); return s })
  const [filterKab, setFilterKab] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [filterPeat, setFilterPeat] = useState(false)
  const [tlDay, setTlDay] = useState(0)

  const stats = useMemo(() => {
    const c = { Rendah: 0, Sedang: 0, Tinggi: 0, Ekstrem: 0 }; ZONES.forEach((d) => c[d.cls]++)
    return { c, avg: Math.round(ZONES.reduce((s, d) => s + d.score, 0) / ZONES.length), avgFwi: (ZONES.reduce((s, d) => s + d.fwiNorm, 0) / ZONES.length).toFixed(1), hs: HS.length, total: ZONES.length, peat: ZONES.filter((d) => d.p).length }
  }, [])

  const filtered = useMemo(() => {
    let list = ZONES
    if (filterKab) list = list.filter((d) => d.k === filterKab)
    if (filterRisk) list = list.filter((d) => d.cls === filterRisk)
    if (filterPeat) list = list.filter((d) => d.p)
    return list
  }, [filterKab, filterRisk, filterPeat])

  const analysis = useMemo(() => (sel ? localAI(sel) : null), [sel])
  const getTimeScore = (d, offset) => (offset === 0 ? d.score : offset < 0 ? d.hist[offset + 7] || d.score : d.forecast[offset - 1] || d.score)

  // MAP INIT (Leaflet, replaces Mapbox)
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const m = L.map(mapEl.current, { center: [0.6, 101.8], zoom: 7, zoomControl: true, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 18 }).addTo(m)
    mapRef.current = m

    const geo = L.geoJSON(dGeo, {
      style: (f) => ({ color: f.properties.color, weight: 1.2, opacity: 0.6, fillColor: f.properties.color, fillOpacity: 0.35 }),
      onEachFeature: (f, layer) => {
        layer.bindTooltip(`<b>Desa ${f.properties.name}</b><br/>Kec. ${f.properties.kec}<br/>Risk v3: <b style="color:${f.properties.color}">${f.properties.score} (${f.properties.cls})</b>`, { sticky: true })
        layer.on('click', () => { const dd = ZONES.find((d) => d.id === f.properties.id); setSel((prev) => (prev?.id === dd.id ? null : dd)) })
      },
    }).addTo(m)
    geoRef.current = geo

    const hs = L.layerGroup(HS.map((h) => {
      const col = h.conf === 'high' ? '#ef4444' : '#f97316'
      return L.circleMarker([h.lat, h.lng], { radius: 5, color: '#fff', weight: 1.5, fillColor: col, fillOpacity: 1 })
        .bindTooltip(`<b>${h.id}</b> · ${h.sat}<br/>Confidence: ${h.conf}<br/>Wind: ${h.ws} km/h`)
    })).addTo(m)
    hsRef.current = hs
    spreadRef.current = L.layerGroup().addTo(m)

    // WIND CANVAS overlay (Windy-style particle field)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const particles = []
    const PCOUNT = 650, PLIFE = 75
    const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight }
    resize()
    for (let i = 0; i < PCOUNT; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, age: Math.floor(Math.random() * PLIFE) })
    const cols = Math.round((104 - 99.5) / 0.25) + 1
    const interpWind = (lat, lng) => { const col = (lng - 99.5) / 0.25, row = (lat - -1) / 0.25; return WGRID[Math.floor(row) * cols + Math.floor(col)] || { u: 0, v: 0, spd: 0 } }
    let prev = performance.now()
    const draw = (time) => {
      const dt = Math.min((time - prev) / 16.66, 2) || 1; prev = time
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (canvas.dataset.on !== 'true') { animRef.current = requestAnimationFrame(draw); return }
      const b = m.getBounds(), sw = b.getSouthWest(), ne = b.getNorthEast()
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round'
      particles.forEach((p) => {
        const lng = sw.lng + (p.x / canvas.width) * (ne.lng - sw.lng)
        const lat = ne.lat - (p.y / canvas.height) * (ne.lat - sw.lat)
        const w = interpWind(lat, lng)
        const px = p.x, py = p.y
        p.x += w.u * 0.08 * dt; p.y += -w.v * 0.08 * dt; p.age += dt
        if (p.age > PLIFE || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) { p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height; p.age = 0; return }
        const alpha = Math.min(1, p.age / 8) * Math.max(0, 1 - (p.age - PLIFE + 15) / 15) * 0.9
        ctx.strokeStyle = w.spd < 8 ? `rgba(140,140,140,${alpha * 0.7})` : w.spd < 15 ? `rgba(180,180,180,${alpha * 0.8})` : w.spd < 22 ? `rgba(210,210,210,${alpha * 0.9})` : `rgba(240,240,240,${alpha})`
        ctx.lineWidth = 0.8 + w.spd * 0.04
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke()
      })
      animRef.current = requestAnimationFrame(draw)
    }
    canvas.dataset.on = 'true'
    animRef.current = requestAnimationFrame(draw)
    m.on('movestart', () => { canvas.style.opacity = '0' })
    m.on('moveend', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach((p) => { if (Math.random() < 0.3) p.age = Math.random() * PLIFE }); if (canvas.dataset.on === 'true') canvas.style.opacity = '1' })
    const ro = new ResizeObserver(() => { resize(); m.invalidateSize({ animate: false }) }); ro.observe(canvas)
    const t = setTimeout(() => m.invalidateSize({ animate: false }), 80)

    return () => { clearTimeout(t); ro.disconnect(); if (animRef.current) cancelAnimationFrame(animRef.current); m.remove(); mapRef.current = null }
  }, [])

  // toggle map layers
  useEffect(() => {
    const m = mapRef.current; if (!m) return
    if (canvasRef.current) { canvasRef.current.dataset.on = String(layers.wind); canvasRef.current.style.transition = 'opacity .25s'; canvasRef.current.style.opacity = layers.wind ? '1' : '0' }
    if (geoRef.current) { if (layers.risk && !m.hasLayer(geoRef.current)) geoRef.current.addTo(m); if (!layers.risk && m.hasLayer(geoRef.current)) m.removeLayer(geoRef.current) }
    if (hsRef.current) { if (layers.hotspot && !m.hasLayer(hsRef.current)) hsRef.current.addTo(m); if (!layers.hotspot && m.hasLayer(hsRef.current)) m.removeLayer(hsRef.current) }
  }, [layers])

  // highlight + fly to selected zone
  useEffect(() => {
    const m = mapRef.current, geo = geoRef.current; if (!m || !geo) return
    geo.eachLayer((l) => { const isSel = sel && l.feature.properties.id === sel.id; l.setStyle({ weight: isSel ? 4 : 1.2, fillOpacity: isSel ? 0.12 : 0.35 }) })
    if (sel) m.flyTo([sel.lat, sel.lng], 10, { duration: 1 })
    else m.flyTo([0.6, 101.8], 7, { duration: 1 })
  }, [sel])

  // Cellular-automata spread overlay
  useEffect(() => {
    const m = mapRef.current, grp = spreadRef.current; if (!m || !grp) return
    grp.clearLayers()
    if (!spread) { setSpreadStep(0); return }
    const h = HS[spreadIdx % HS.length]; setSpreadStep(0)
    m.flyTo([h.lat, h.lng], 10, { duration: 1 })
    const rings = genSpreadRings(h.lat, h.lng, h.wd, spreadIdx + 1)
    const timers = [1, 2, 3, 4, 5].map((step, i) => setTimeout(() => {
      setSpreadStep(step); grp.clearLayers()
      rings.slice(0, step).forEach((rg) => L.polygon(rg.ring, { color: rg.color, weight: 1, fillColor: rg.color, fillOpacity: rg.opacity, dashArray: '3 2' }).addTo(grp))
    }, i * 1100))
    return () => timers.forEach(clearTimeout)
  }, [spread, spreadIdx])

  const toggleLayer = (id) => setLayers((p) => ({ ...p, [id]: !p[id] }))
  const fmt = (t) => (t || '').split('•').filter(Boolean).map((s, i) => <div key={i}>• {s.trim()}</div>)

  return (
    <div className="fire-dash">
      <div className="L" style={{ gridTemplateColumns: sel ? '280px 1fr 360px' : '280px 1fr' }}>
        {/* HEADER */}
        <div className="H">
          <h1>Prediksi Risiko Kebakaran <span style={{ fontSize: 8, color: 'var(--tx3)', fontWeight: 400 }}>Provinsi Riau v3.0 • Tingkat Zona Rawan</span></h1>
          <div className="hr">
            <div className="lv">LIVE</div>
            <span>16 April 2026</span>
            <span className="rt-badge">RT Modifier · tiap 3 jam</span>
            <button className="layer-btn" onClick={() => setLayerOpen(!layerOpen)}>Layer Peta</button>
          </div>
        </div>

        {/* LEFT PANEL */}
        <div className="lp">
          <div className="c"><div className="ct">Ringkasan Provinsi</div>
            <div className="sg">
              <div className="si"><div className="sv" style={{ color: 'var(--ac)' }}>{stats.total}</div><div className="sl">Zona Rawan</div></div>
              <div className="si"><div className="sv" style={{ color: rcc(stats.avg) }}>{stats.avg}</div><div className="sl">Rata Skor</div></div>
              <div className="si"><div className="sv" style={{ color: 'var(--hi)' }}>{stats.avgFwi}</div><div className="sl">Rata FWI v2</div></div>
              <div className="si"><div className="sv" style={{ color: 'var(--ex)' }}>{stats.hs}</div><div className="sl">Titik Panas</div></div>
            </div>
          </div>

          <div className="c"><div className="ct">Filter Zona</div>
            <select className="fsel" value={filterKab} onChange={(e) => setFilterKab(e.target.value)} style={{ marginBottom: 3 }}>
              <option value="">Semua Kabupaten</option>
              {KABLIST.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <div className="fbar">
              <button className={`fbtn ${filterRisk === '' ? 'on' : ''}`} onClick={() => setFilterRisk('')}>Semua Risiko</button>
              {['Rendah', 'Sedang', 'Tinggi', 'Ekstrem'].map((r) => <button key={r} className={`fbtn ${filterRisk === r ? 'on' : ''}`} style={filterRisk === r ? { background: RC[r], borderColor: RC[r], color: '#fff' } : {}} onClick={() => setFilterRisk(filterRisk === r ? '' : r)}>{r}</button>)}
            </div>
            <button className={`fbtn ${filterPeat ? 'on' : ''}`} style={{ width: '100%', ...(filterPeat ? { background: '#92400e', borderColor: '#92400e', color: '#fff' } : {}) }} onClick={() => setFilterPeat(!filterPeat)}>Hanya Gambut ({stats.peat})</button>
          </div>

          <div className="ct" style={{ padding: '0 2px' }}>Daftar Zona Rawan ({filtered.length})</div>
          {filtered.slice(0, 25).map((d, i) =>
            <div key={d.id} className={`vi${sel?.id === d.id ? ' sel' : ''}`} onClick={() => setSel(sel?.id === d.id ? null : d)}>
              <div className="vr" style={{ background: rcc(d.score) + '20', color: rcc(d.score) }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div className="vn">Desa {d.n}</div><div className="vk">Kec. {d.kc} • {d.lc.filter((x) => x.pct > 0).slice(0, 2).map((x) => `${x.n} ${x.pct}%`).join(', ')}</div></div>
              <div className="vs" style={{ color: rcc(d.score) }}>{d.score}</div>
            </div>)}
        </div>

        {/* MAP */}
        <div className="mp">
          <div ref={mapEl} className="fire-map" />
          <canvas ref={canvasRef} className="wind-canvas" />
          <div className="mi">
            <div className="mc"><span className="mc-dot" style={{ background: 'var(--ex)' }} />{stats.hs} Titik Panas</div>
            <div className="mc"><span className="mc-dot" style={{ background: 'var(--ac)' }} />{stats.total} Zona Rawan</div>
            <div className="mc"><span className="mc-dot" style={{ background: '#92400e' }} />{stats.peat} Gambut</div>
          </div>

          <div className="spread-ctrl">
            <button className={`spread-btn ${spread ? '' : 'off'}`} onClick={() => setSpread(!spread)}>{spread ? 'Stop Simulasi CA' : 'Cellular Automata (Spread)'}</button>
            {spread && <>
              <button className="spread-btn" style={{ background: 'rgba(59,130,246,.8)', fontSize: 7 }} onClick={() => setSpreadIdx((i) => i + 1)}>Pindah Hotspot</button>
              <div className="spread-info">Simulasi CA (P_spread = P_base × F_wind × F_slope × F_fuel × F_moisture). T+1h hingga T+24h.</div>
            </>}
          </div>
          {spread && spreadStep > 0 && <div className="spread-progress">
            {['T+1h', 'T+3h', 'T+6h', 'T+12h', 'T+24h'].map((l, i) => <div key={l} className={`sp-dot ${spreadStep === i + 1 ? 'active' : spreadStep > i + 1 ? 'done' : ''}`} style={{ '--c': '#f97316', background: spreadStep >= i + 1 ? '#f97316' : 'rgba(255,255,255,.1)' }}>{l}</div>)}
          </div>}

          <div className="ml">
            <div className="mlt">Skor Risiko</div>
            {['Ekstrem', 'Tinggi', 'Sedang', 'Rendah'].map((r) => <div className="mli" key={r}><span className="mld" style={{ background: RC[r] }} /> {r}</div>)}
          </div>

          <div className={`layer-panel ${layerOpen ? 'open' : ''}`} style={{ pointerEvents: layerOpen ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3>Layer Peta</h3>
              <button style={{ background: 'rgba(255,255,255,.08)', border: '1px solid var(--bd)', color: '#fff', cursor: 'pointer', fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 700 }} onClick={() => setLayerOpen(false)}>✕</button>
            </div>
            <div className="ly-group">Layer Utama</div>
            {LAYERS.filter((l) => l.g === 'utama').map((l) => (
              <div key={l.id} className="ly-item" onClick={() => toggleLayer(l.id)}>
                <div className={`ly-toggle ${layers[l.id] ? 'on' : ''}`} />
                <div><div>{l.name}</div><div className="ly-desc">{l.desc}</div></div>
              </div>))}
            <div className="ly-group" style={{ marginTop: 8 }}>Layer Teknis</div>
            {LAYERS.filter((l) => l.g === 'teknis').map((l) => (
              <div key={l.id} className="ly-item" onClick={() => toggleLayer(l.id)}>
                <div className={`ly-toggle ${layers[l.id] ? 'on' : ''}`} />
                <div><div>{l.name}</div><div className="ly-desc">{l.desc}</div></div>
              </div>))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        {sel && <div className="rp">
          <div className="c" style={{ background: `linear-gradient(135deg,${rcc(sel.score)}10,transparent)`, borderColor: rcc(sel.score) + '33' }}>
            <div className="ct">Profil Zona Rawan</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>Desa {sel.n}</div>
            <div style={{ fontSize: 7, color: 'var(--tx3)', marginBottom: 4 }}>Kec. {sel.kc} • {sel.lc.filter((x) => x.pct > 0).slice(0, 2).map((x) => `${x.n} ${x.pct}%`).join(', ')} {sel.p ? '• Gambut ' + Math.round(sel.peatRatio * 100) + '%' : ''}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: rcc(tlDay === 0 ? sel.score : getTimeScore(sel, tlDay)) }}>{tlDay === 0 ? sel.score : getTimeScore(sel, tlDay)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: rcc(tlDay === 0 ? sel.score : getTimeScore(sel, tlDay)), padding: '3px 6px', background: rcc(tlDay === 0 ? sel.score : getTimeScore(sel, tlDay)) + '15', borderRadius: 4 }}>{rc(tlDay === 0 ? sel.score : getTimeScore(sel, tlDay))}</span>
            </div>
          </div>

          <div className="c">
            <div className="ct">Tier 1 · Base Score <span className="src">Formula v3.0</span></div>
            <div className="wb">
              {[{ w: sel.w_fwi, c: '#f97316' }, { w: sel.w_ndvi, c: '#22c55e' }, { w: sel.w_ndmi, c: '#3b82f6' }, { w: sel.w_lst, c: '#ef4444' }, { w: sel.w_sm, c: '#0ea5e9' }, { w: sel.w_rain, c: '#8b5cf6' }].map((x, i) => <div key={i} className="wbi" style={{ width: `${(x.w / 85) * 100}%`, background: x.c }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 6 }}>
              <div className="dri"><span title={T('FWI')}>FWI v2</span><span style={{ color: '#f97316', fontWeight: 700 }}>{sel.fwiNorm}</span></div>
              <div className="dri"><span title={T('NDVI')}>NDVI</span><span style={{ color: '#22c55e', fontWeight: 700 }}>{sel.w_ndvi.toFixed(1)}</span></div>
              <div className="dri"><span title={T('NDMI')}>NDMI</span><span style={{ color: '#3b82f6', fontWeight: 700 }}>{sel.w_ndmi.toFixed(1)}</span></div>
              <div className="dri"><span title={T('LST')}>LST</span><span style={{ color: '#ef4444', fontWeight: 700 }}>{sel.w_lst.toFixed(1)}</span></div>
              <div className="dri"><span title={T('SM')}>SM</span><span style={{ color: '#0ea5e9', fontWeight: 700 }}>{sel.w_sm.toFixed(1)}</span></div>
              <div className="dri"><span title={T('Rain')}>Rain</span><span style={{ color: '#8b5cf6', fontWeight: 700 }}>{sel.w_rain.toFixed(1)}</span></div>
            </div>
            <div style={{ borderTop: '1px solid var(--bd)', marginTop: 4, paddingTop: 4, display: 'grid', gap: 2 }}>
              <div className="dri"><span>PeatBoost</span><span style={{ color: 'var(--hi)', fontWeight: 800 }}>+{sel.pb}</span></div>
              <div className="dri"><span>HistoryBoost</span><span style={{ color: 'var(--hi)', fontWeight: 800 }}>+{sel.hb}</span></div>
            </div>
          </div>

          <div className="c" style={{ borderColor: sel.rtMod !== 0 ? 'rgba(239,68,68,.3)' : 'var(--bd)', background: sel.rtMod !== 0 ? 'rgba(239,68,68,.04)' : 'var(--s2)' }}>
            <div className="ct">Tier 2 · Real-Time Modifier <span className="src">FIRMS + BMKG</span></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: sel.rtMod > 0 ? '#ef4444' : sel.rtMod < 0 ? '#22c55e' : 'var(--tx3)' }}>{sel.rtMod > 0 ? '+' : ''}{sel.rtMod}</span>
              <span style={{ fontSize: 6, marginLeft: 'auto', color: 'var(--tx3)' }}>Base: {sel.baseScore} → Final: {sel.score}</span>
            </div>
            <div style={{ display: 'grid', gap: 1 }}>
              {sel.rtHs > 0 && <div className="dri" style={{ background: 'rgba(239,68,68,.08)' }}><span>Hotspot &lt;{sel.rtHs === 20 ? '5' : '10'} km</span><span style={{ fontWeight: 700, color: '#ef4444' }}>+{sel.rtHs}</span></div>}
              {sel.rtWind > 0 && <div className="dri" style={{ background: 'rgba(249,115,22,.08)' }}><span>Angin &gt;{sel.rtWind === 10 ? '20' : '15'}km/h</span><span style={{ fontWeight: 700, color: '#f97316' }}>+{sel.rtWind}</span></div>}
              {sel.rtRain < 0 && <div className="dri" style={{ background: 'rgba(34,197,94,.08)' }}><span>Hujan</span><span style={{ fontWeight: 700, color: '#22c55e' }}>{sel.rtRain}</span></div>}
              {sel.rtMod === 0 && <div style={{ fontSize: 6, color: 'var(--tx3)', textAlign: 'center' }}>Tidak ada modifier aktif saat ini</div>}
            </div>
          </div>

          <div className="ai-card">
            <div className="ct">AI Agent <span style={{ fontSize: 6, color: 'var(--pu)', fontWeight: 400 }}>LLaMA 3.3 • 4-Level Behavior</span></div>
            {analysis && <>
              <div className="ai-section"><div className="ai-label">Evaluasi</div><div className="ai-text">{analysis.RISIKO}</div></div>
              <div className="ai-section"><div className="ai-label">Konteks Data</div><div className="ai-text">{fmt(analysis.FAKTOR)}</div></div>
              <div className="ai-section"><div className="ai-label">Rekomendasi Aksi</div><div className="ai-text">{fmt(analysis.REKOMENDASI)}</div></div>
            </>}
          </div>

          <div className="c"><div className="ct">Prediksi 7 Hari <span className="src">BMKG predict</span></div>
            <div className="fg">{sel.forecast.map((v, i) => {
              const d = TL_DAYS.find((x) => x.offset === i + 1); return (
                <div key={i} className={`fi ${tlDay === i + 1 ? 'active' : ''}`} style={{ background: rcc(v) + '15' }} onClick={() => setTlDay(tlDay === i + 1 ? 0 : i + 1)}>
                  <div className="fv" style={{ color: rcc(v) }}>{v}</div>
                  <div className="fl" style={{ color: rcc(v) }}>{rc(v).substring(0, 3)}</div>
                  <div className="fl">{d?.label || ''}</div>
                </div>)
            })}</div>
          </div>

          <div className="c"><div className="ct">Parameter Mentah <span className="src">NASA POWER & GEE</span></div>
            <div className="dr">
              {[['Suhu', sel.temp + '°C'], ['RH', sel.rh + '%'], ['Angin', sel.wind + ' km/j'], ['Hujan', sel.rain + ' mm'], ['NDVI', sel.ndvi], ['NDMI', sel.ndmi], ['LST', sel.lst + '°C'], ['Slope', sel.slopeDeg + '°']].map(([l, v]) =>
                <div key={l} className="dri"><span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
            </div>
          </div>
        </div>}

        {/* TIMELINE FOOTER */}
        <div className="tl" style={{ opacity: sel ? 1 : 0.3, pointerEvents: sel ? 'auto' : 'none' }}>
          <div className="tl-label">Historis</div>
          {TL_DAYS.filter((d) => d.offset < 0).map((d) => {
            const s = sel ? getTimeScore(sel, d.offset) : 0; return (
              <div key={d.offset} className={`tl-day ${tlDay === d.offset ? 'active' : ''}`} onClick={() => setTlDay(tlDay === d.offset ? 0 : d.offset)} style={{ background: sel ? rcc(s) + '12' : '', flex: 1 }}>
                <div className="tl-score" style={{ color: sel ? rcc(s) : 'var(--tx3)' }}>{sel ? s : '-'}</div>
                <div className="tl-date">{d.label}</div>
              </div>)
          })}
          <div className="tl-div" />
          <div className={`tl-day today ${tlDay === 0 ? 'active' : ''}`} onClick={() => setTlDay(0)} style={{ background: sel ? 'rgba(59,130,246,.1)' : '', flex: 1 }}>
            <div className="tl-score" style={{ color: sel ? 'var(--ac)' : 'var(--tx3)' }}>{sel ? sel.score : '-'}</div>
            <div className="tl-date" style={{ fontWeight: 700, color: sel ? 'var(--ac)' : 'var(--tx3)' }}>Hari ini</div>
          </div>
          <div className="tl-div" />
          <div className="tl-label" style={{ color: 'var(--hi)' }}>Prediksi</div>
          {TL_DAYS.filter((d) => d.offset > 0).map((d) => {
            const s = sel ? getTimeScore(sel, d.offset) : 0; return (
              <div key={d.offset} className={`tl-day ${tlDay === d.offset ? 'active' : ''}`} onClick={() => setTlDay(tlDay === d.offset ? 0 : d.offset)} style={{ background: sel ? rcc(s) + '12' : '', flex: 1 }}>
                <div className="tl-score" style={{ color: sel ? rcc(s) : 'var(--tx3)' }}>{sel ? s : '-'}</div>
                <div className="tl-cat" style={{ color: sel ? rcc(s) : 'var(--tx3)' }}>{sel ? rc(s).substring(0, 4) : '-'}</div>
                <div className="tl-date">{d.label}</div>
              </div>)
          })}
        </div>
      </div>
    </div>
  )
}
