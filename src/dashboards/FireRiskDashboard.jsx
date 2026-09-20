/* Karhutla — fire risk prediction for Riau province.

   A React port of an internal fire-prediction dashboard: Mapbox became
   Leaflet with OpenStreetMap tiles, and the live OpenWeather and LLM calls
   became embedded sample data with a local rule-based assessment. Every
   figure is synthetic.

   The scoring model is kept intact: a weighted base score from FWI, NDVI,
   NDMI, LST, soil moisture and rainfall, plus peat and history boosts, then
   a real-time modifier from nearby hotspots, wind and rain.

   Presentation comes from the shared dashboard system in ./ui. */

import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useChartTheme from './ui/chartTheme'
import {
  DashFrame, DashBar, DashBody, Region as Col, Panel, Stat, StatGrid,
  Chip, Status, List, Row, Meters, Meter, MapOverlay, DashIcon,
} from './ui'

/* Risk classes are ordered, and each one always renders with its name, so
   the level never rides on colour alone. */
const RISK_CLASSES = ['Rendah', 'Sedang', 'Tinggi', 'Ekstrem']
const RISK_LEVEL = { Rendah: 'good', Sedang: 'warning', Tinggi: 'serious', Ekstrem: 'critical' }
const riskClass = (s) => (s >= 76 ? 'Ekstrem' : s >= 51 ? 'Tinggi' : s >= 26 ? 'Sedang' : 'Rendah')

const DRIVER_HELP = {
  'FWI v2': 'Fire Weather Index v2 (tropical), divided by 15 to normalise for RH anomalies. Weight 30%.',
  NDVI: 'Normalized Difference Vegetation Index, a dry-fuel indicator. Weight 15%.',
  NDMI: 'Normalized Difference Moisture Index, a water-stress indicator. Weight 10%.',
  LST: 'Land Surface Temperature. Weight 10%.',
  'Soil moisture': 'Soil moisture. Weight 10%.',
  Rainfall: 'Dryness from absent rainfall. Weight 10%.',
}

function mkR(s) {
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function mkPoly(lng, lat, sz, rnd) {
  const pts = 7 + Math.floor(rnd() * 4)
  const cs = []
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const r = sz * (0.6 + rnd() * 0.8)
    cs.push([+(lng + r * Math.cos(a)).toFixed(5), +(lat + r * Math.sin(a) * 1.1).toFixed(5)])
  }
  cs.push(cs[0])
  return [cs]
}

const FUEL = {
  'Hutan Rawa Gambut': 0.5,
  Perkebunan: 1.5,
  'Hutan Lahan Kering': 1.0,
  Pemukiman: 0.0,
  Sawah: 0.2,
  'Pertanian LK': 2.0,
  'Hutan Mangrove': 0.3,
}

/* Villages, with `p` flagging peatland. */
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
  { id: 'risk', name: 'Risk zones', icon: 'layers', desc: 'Zone polygons shaded by risk score', group: 'Primary', on: true },
  { id: 'wind', name: 'Wind field', icon: 'wind', desc: 'Animated particle field over the map', group: 'Primary', on: true },
  { id: 'hotspot', name: 'Satellite hotspots', icon: 'flame', desc: 'SNPP, NOAA-20 and Aqua detections', group: 'Primary', on: true },
  { id: 'peat', name: 'Peatland', icon: 'droplet', desc: 'Peat extent', group: 'Technical', on: false },
  { id: 'landcover', name: 'Land cover', icon: 'grid', desc: 'Forest, plantation and paddy classes', group: 'Technical', on: false },
  { id: 'ndvi', name: 'Vegetation (NDVI)', icon: 'satellite', desc: 'Greenness index from satellite', group: 'Technical', on: false },
  { id: 'ndmi', name: 'Leaf moisture (NDMI)', icon: 'droplet', desc: 'Plant water content from satellite', group: 'Technical', on: false },
  { id: 'slope', name: 'Slope', icon: 'chart', desc: 'Terrain gradient', group: 'Technical', on: false },
]

/* Static synthetic wind field over Riau, replacing an OpenWeather fetch. */
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
  const r = mkR(i * 7919 + 31)
  const rn = () => r()
  const zId = `ZR-140412-${String(i + 1).padStart(3, '0')}`
  const cap = (v) => (v <= 92 ? Math.round(Math.max(0, v)) : Math.round(92 + ((v - 92) * 7) / (v - 92 + 7)))

  const temp = +(28 + rn() * 7).toFixed(1)
  const rh = +(55 + rn() * 25).toFixed(1)
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

  const w_ndvi = nr * 0.15
  const w_ndmi = mr * 0.1
  const w_lst = lr * 0.1
  const w_sm = sr * 0.1
  const w_rain = rr * 0.1
  const w_fwi = fwiNorm * 0.3
  const base0_100 = (w_ndvi + w_ndmi + w_lst + w_sm + w_rain + w_fwi) / 0.85

  const lc = d.p
    ? [{ n: 'Hutan Rawa Gambut', pct: Math.round(20 + rn() * 30) }, { n: 'Perkebunan', pct: Math.round(20 + rn() * 25) }, { n: 'Hutan Lahan Kering', pct: 0 }, { n: 'Pemukiman', pct: Math.round(5 + rn() * 10) }, { n: 'Sawah', pct: 0 }]
    : [{ n: 'Hutan Lahan Kering', pct: Math.round(15 + rn() * 30) }, { n: 'Perkebunan', pct: Math.round(10 + rn() * 25) }, { n: 'Pemukiman', pct: Math.round(10 + rn() * 20) }, { n: 'Pertanian LK', pct: Math.round(5 + rn() * 15) }, { n: 'Sawah', pct: 0 }]
  const usedPct = lc.reduce((s, x) => s + x.pct, 0)
  if (usedPct < 100) {
    const rem = lc.find((x) => x.pct === 0)
    if (rem) rem.pct = 100 - usedPct
    else lc[0].pct += 100 - usedPct
  }
  lc.sort((a, b) => b.pct - a.pct)

  const fFuel = +lc.reduce((s, x) => s + ((FUEL[x.n] || 0.5) * x.pct) / 100, 0).toFixed(3)
  const slopeDeg = +(d.p ? rn() * 3 : rn() * 15).toFixed(1)
  const peatRatio = d.p ? +(0.3 + rn() * 0.7).toFixed(2) : 0
  const pb = +(15 * peatRatio).toFixed(1)
  const hsHistory = d.p ? Math.floor(rn() * 5) : Math.floor(rn() * 2)
  const hb = hsHistory >= 2 ? 5 : 0
  const baseScore = cap(base0_100 + pb + hb)

  let distStr = 99
  HS.forEach((h) => {
    const dist = Math.sqrt(Math.pow(h.lat - d.lat, 2) + Math.pow(h.lng - d.lng, 2)) * 111
    if (dist < distStr) distStr = dist
  })
  const rtHs = distStr < 5 ? 20 : distStr < 10 ? 10 : 0
  const rtWind = wind > 20 ? 10 : wind > 15 ? 5 : 0
  const rtRain = rain > 5 ? -15 : rain > 2 ? -8 : 0
  const rtMod = rtHs + rtWind + rtRain
  const score = cap(baseScore + rtMod)

  const hist = Array.from({ length: 7 }, (_, j) => cap(score + (j - 6) * rn() * 5 * (rn() > 0.5 ? 1 : -1)))
  const forecast = Array.from({ length: 7 }, (_, j) => cap(score + (j + 1) * rn() * 4 * (rn() > 0.5 ? 1 : -1)))

  return {
    ...d, id: zId, score, baseScore, cls: riskClass(score), fwi: fwi_raw, fwiNorm, ndvi, ndmi,
    lst, sm, rain, rh, temp, wind, w_ndvi, w_ndmi, w_lst, w_sm, w_rain, w_fwi, pb, hb,
    peatRatio, rtMod, rtHs, rtWind, rtRain, lc, fFuel, slopeDeg, hist, forecast,
    poly: mkPoly(d.lng, d.lat, 0.03 + rn() * 0.02, rn),
  }
}

const ZONES = DR.map((d, i) => calcD(d, i)).sort((a, b) => b.score - a.score)
const KABLIST = [...new Set(ZONES.map((d) => d.k))].sort()

/* Rule-based assessment. The original called an LLM; this is its offline
   fallback, kept so the demo never makes a network request. */
function assess(z) {
  const level = riskClass(z.score)
  if (level === 'Rendah') {
    return {
      verdict: `Low risk (${z.score}/100). Vegetation condition is safe and moisture is stable.`,
      context: `NDVI normal at ${z.ndvi}. No weather anomaly reported.`,
      action: 'Routine satellite monitoring. Data on demand.',
    }
  }
  if (level === 'Sedang') {
    return {
      verdict: `Risk starting to climb (${z.score}/100) in Kec. ${z.kc}.`,
      context: `FWI v2 has risen to ${z.fwiNorm}. Mean wind speed ${z.wind} km/h.`,
      action: 'Daily summary per regency. Watch the NDMI downtrend in Earth Engine.',
    }
  }
  if (level === 'Tinggi') {
    return {
      verdict: `High risk (${z.score}/100) detected in ${z.id}, ${z.n}.`,
      context: `NDMI has fallen to ${z.ndmi}, indicating water stress. Peatland contributes +${z.pb}.`,
      action: 'Notify the field team. Schedule a ground patrol.',
    }
  }
  return {
    verdict: `Extreme risk (${z.score}/100) in ${z.n}.`,
    context: `Real-time modifier active at +${z.rtMod}. Hotspot within 5 km. Wind ${z.wind} km/h.`,
    action: 'Alert the nearest suppression team and dispatch now.',
  }
}

function genSpreadRings(lat, lng, wd, idxMul = 1) {
  const rings = []
  const steps = [1, 3, 6, 12, 24]
  steps.forEach((t, idx) => {
    const pts = []
    const n = 24
    const baseR = t * 0.008
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      const wRad = (wd * Math.PI) / 180
      const stretch = 1 + Math.cos(a - wRad) * 0.7 * idx
      const rr = baseR * stretch * (0.9 + ((i * idxMul) % 5) * 0.04)
      pts.push([lat + rr * Math.sin(a) * 1.1, lng + rr * Math.cos(a)])
    }
    rings.push({ ring: pts, step: idx })
  })
  return rings
}

function getDates() {
  const today = new Date('2026-04-16T00:00:00')
  const days = []
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  for (let i = -7; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push({ offset: i, label: `${d.getDate()} ${M[d.getMonth()]}`, isToday: i === 0 })
  }
  return days
}
const TL_DAYS = getDates()

const SPREAD_STEPS = ['T+1h', 'T+3h', 'T+6h', 'T+12h', 'T+24h']

export default function FireRiskDashboard() {
  const t = useChartTheme()

  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const canvasRef = useRef(null)
  const geoRef = useRef(null)
  const hsRef = useRef(null)
  const spreadRef = useRef(null)
  const animRef = useRef(null)

  const [selected, setSelected] = useState(null)
  const [spread, setSpread] = useState(false)
  const [spreadIdx, setSpreadIdx] = useState(0)
  const [spreadStep, setSpreadStep] = useState(0)
  const [layerOpen, setLayerOpen] = useState(false)
  const [layers, setLayers] = useState(() => {
    const s = {}
    LAYERS.forEach((l) => (s[l.id] = l.on))
    return s
  })
  const [filterKab, setFilterKab] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [filterPeat, setFilterPeat] = useState(false)
  const [tlDay, setTlDay] = useState(0)

  const riskColor = useMemo(
    () => ({
      Rendah: t.status.good,
      Sedang: t.status.warning,
      Tinggi: t.status.serious,
      Ekstrem: t.status.critical,
    }),
    [t],
  )
  const scoreColor = (s) => riskColor[riskClass(s)]

  const stats = useMemo(() => {
    const counts = { Rendah: 0, Sedang: 0, Tinggi: 0, Ekstrem: 0 }
    ZONES.forEach((d) => counts[d.cls]++)
    return {
      counts,
      avg: Math.round(ZONES.reduce((s, d) => s + d.score, 0) / ZONES.length),
      avgFwi: (ZONES.reduce((s, d) => s + d.fwiNorm, 0) / ZONES.length).toFixed(1),
      hs: HS.length,
      total: ZONES.length,
      peat: ZONES.filter((d) => d.p).length,
    }
  }, [])

  const filtered = useMemo(() => {
    let list = ZONES
    if (filterKab) list = list.filter((d) => d.k === filterKab)
    if (filterRisk) list = list.filter((d) => d.cls === filterRisk)
    if (filterPeat) list = list.filter((d) => d.p)
    return list
  }, [filterKab, filterRisk, filterPeat])

  const analysis = useMemo(() => (selected ? assess(selected) : null), [selected])
  const getTimeScore = (d, offset) =>
    offset === 0 ? d.score : offset < 0 ? d.hist[offset + 7] || d.score : d.forecast[offset - 1] || d.score

  const shownScore = selected ? (tlDay === 0 ? selected.score : getTimeScore(selected, tlDay)) : 0

  /* Map init, guarded against StrictMode's double effect. */
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, {
      center: [0.6, 101.8],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map

    const geoData = {
      type: 'FeatureCollection',
      features: ZONES.map((d) => ({
        type: 'Feature',
        properties: { id: d.id, name: d.n, kec: d.kc, score: d.score, cls: d.cls, color: scoreColor(d.score) },
        geometry: { type: 'Polygon', coordinates: d.poly },
      })),
    }

    const geo = L.geoJSON(geoData, {
      style: (f) => ({
        color: f.properties.color,
        weight: 1.2,
        opacity: 0.7,
        fillColor: f.properties.color,
        fillOpacity: 0.32,
      }),
      onEachFeature: (f, layer) => {
        layer.bindTooltip(
          `<b>Desa ${f.properties.name}</b><br/>Kec. ${f.properties.kec}<br/>Risk ${f.properties.score} · ${f.properties.cls}`,
          { sticky: true },
        )
        layer.on('click', () => {
          const zone = ZONES.find((d) => d.id === f.properties.id)
          setSelected((prev) => (prev?.id === zone.id ? null : zone))
        })
      },
    }).addTo(map)
    geoRef.current = geo

    const hotspots = L.layerGroup(
      HS.map((h) =>
        L.circleMarker([h.lat, h.lng], {
          radius: 5,
          color: t.surface,
          weight: 1.5,
          fillColor: h.conf === 'high' ? t.status.critical : t.status.serious,
          fillOpacity: 1,
        }).bindTooltip(
          `<b>${h.id}</b> · ${h.sat}<br/>Confidence ${h.conf}<br/>Wind ${h.ws} km/h`,
        ),
      ),
    ).addTo(map)
    hsRef.current = hotspots
    spreadRef.current = L.layerGroup().addTo(map)

    /* Wind particle field on a canvas above the tiles. */
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const particles = []
    const PCOUNT = 650
    const PLIFE = 75
    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resize()
    for (let i = 0; i < PCOUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        age: Math.floor(Math.random() * PLIFE),
      })
    }
    const cols = Math.round((104 - 99.5) / 0.25) + 1
    const interpWind = (lat, lng) => {
      const col = (lng - 99.5) / 0.25
      const row = (lat - -1) / 0.25
      return WGRID[Math.floor(row) * cols + Math.floor(col)] || { u: 0, v: 0, spd: 0 }
    }

    let prev = performance.now()
    const draw = (time) => {
      const dt = Math.min((time - prev) / 16.66, 2) || 1
      prev = time
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = 'rgba(0,0,0,0.92)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (canvas.dataset.on !== 'true') {
        animRef.current = requestAnimationFrame(draw)
        return
      }
      const b = map.getBounds()
      const sw = b.getSouthWest()
      const ne = b.getNorthEast()
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineCap = 'round'

      /* Particle ink follows the theme: light trails on the dark map,
         dark trails on the light one. */
      const ink = canvas.dataset.ink === 'dark' ? '20,20,19' : '245,243,239'

      particles.forEach((p) => {
        const lng = sw.lng + (p.x / canvas.width) * (ne.lng - sw.lng)
        const lat = ne.lat - (p.y / canvas.height) * (ne.lat - sw.lat)
        const w = interpWind(lat, lng)
        const px = p.x
        const py = p.y
        p.x += w.u * 0.08 * dt
        p.y += -w.v * 0.08 * dt
        p.age += dt
        if (p.age > PLIFE || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width
          p.y = Math.random() * canvas.height
          p.age = 0
          return
        }
        const alpha =
          Math.min(1, p.age / 8) * Math.max(0, 1 - (p.age - PLIFE + 15) / 15) * (w.spd < 8 ? 0.45 : 0.62)
        ctx.strokeStyle = `rgba(${ink},${alpha})`
        ctx.lineWidth = 0.8 + w.spd * 0.035
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
      })
      animRef.current = requestAnimationFrame(draw)
    }
    canvas.dataset.on = 'true'
    animRef.current = requestAnimationFrame(draw)

    map.on('movestart', () => {
      canvas.style.opacity = '0'
    })
    map.on('moveend', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        if (Math.random() < 0.3) p.age = Math.random() * PLIFE
      })
      if (canvas.dataset.on === 'true') canvas.style.opacity = '1'
    })

    const observer = new ResizeObserver(() => {
      resize()
      map.invalidateSize({ animate: false })
    })
    observer.observe(canvas)
    const settle = setTimeout(() => map.invalidateSize({ animate: false }), 80)

    return () => {
      clearTimeout(settle)
      observer.disconnect()
      if (animRef.current) cancelAnimationFrame(animRef.current)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Keep the particle ink in step with the theme. */
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.dataset.ink = t.dark ? 'light' : 'dark'
  }, [t.dark])

  /* Layer toggles. */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (canvasRef.current) {
      canvasRef.current.dataset.on = String(layers.wind)
      canvasRef.current.style.transition = 'opacity .25s'
      canvasRef.current.style.opacity = layers.wind ? '1' : '0'
    }
    if (geoRef.current) {
      if (layers.risk && !map.hasLayer(geoRef.current)) geoRef.current.addTo(map)
      if (!layers.risk && map.hasLayer(geoRef.current)) map.removeLayer(geoRef.current)
    }
    if (hsRef.current) {
      if (layers.hotspot && !map.hasLayer(hsRef.current)) hsRef.current.addTo(map)
      if (!layers.hotspot && map.hasLayer(hsRef.current)) map.removeLayer(hsRef.current)
    }
  }, [layers])

  /* Highlight and fly to the selected zone. */
  useEffect(() => {
    const map = mapRef.current
    const geo = geoRef.current
    if (!map || !geo) return
    geo.eachLayer((l) => {
      const isSel = selected && l.feature.properties.id === selected.id
      l.setStyle({ weight: isSel ? 3.5 : 1.2, fillOpacity: isSel ? 0.14 : 0.32 })
    })
    if (selected) map.flyTo([selected.lat, selected.lng], 10, { duration: 1 })
    else map.flyTo([0.6, 101.8], 7, { duration: 1 })
  }, [selected])

  /* Cellular-automata spread overlay. */
  useEffect(() => {
    const map = mapRef.current
    const group = spreadRef.current
    if (!map || !group) return
    group.clearLayers()
    if (!spread) return

    const h = HS[spreadIdx % HS.length]
    map.flyTo([h.lat, h.lng], 10, { duration: 1 })
    const rings = genSpreadRings(h.lat, h.lng, h.wd, spreadIdx + 1)

    const timers = [1, 2, 3, 4, 5].map((step, i) =>
      setTimeout(() => {
        setSpreadStep(step)
        group.clearLayers()
        rings.slice(0, step).forEach((rg) => {
          /* Elapsed time is ordered, so the rings step along the ordinal
             ramp rather than through a spectrum. */
          const color = t.ordinalAt(rings.length - 1 - rg.step, rings.length)
          L.polygon(rg.ring, {
            color,
            weight: 1.2,
            fillColor: color,
            fillOpacity: 0.32 - rg.step * 0.045,
          }).addTo(group)
        })
      }, i * 1100),
    )
    return () => timers.forEach(clearTimeout)
  }, [spread, spreadIdx, t])

  const toggleLayer = (id) => setLayers((p) => ({ ...p, [id]: !p[id] }))

  return (
    <DashFrame>
      <DashBar
        icon="flame"
        title="Karhutla · Fire Risk Prediction"
        subtitle="Riau province · zone level · synthetic demo data"
      >
        <Chip icon="clock">16 April 2026</Chip>
        <Chip icon="pulse">Modifier refresh every 3h</Chip>
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
          Map layers
        </button>
      </DashBar>

      <DashBody rows="auto minmax(0, 1fr) auto">
        <StatGrid columns="repeat(4, minmax(0, 1fr))">
          <Stat label="Risk zones" value={stats.total} note={`${stats.peat} on peatland`} />
          <Stat label="Mean score" value={stats.avg} note={riskClass(stats.avg)} />
          <Stat label="Mean FWI v2" value={stats.avgFwi} note="normalised index" />
          <Stat label="Satellite hotspots" value={stats.hs} note="SNPP · NOAA-20 · Aqua" />
        </StatGrid>

        <DashBody
          columns={selected ? '292px minmax(0, 1fr) 340px' : '292px minmax(0, 1fr)'}
          style={{ padding: 0 }}
        >
          {/* ── Filters and zone list ───────────────────────── */}
          <Col scroll>
            <Panel title="Filter zones">
              <select
                value={filterKab}
                onChange={(e) => setFilterKab(e.target.value)}
                aria-label="Filter by regency"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid var(--dash-line)',
                  borderRadius: 7,
                  background: 'var(--dash-panel-alt)',
                  color: 'var(--dash-ink)',
                  font: 'inherit',
                  fontSize: 11,
                  marginBottom: 8,
                }}
              >
                <option value="">All regencies</option>
                {KABLIST.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                <button
                  type="button"
                  className="dash-chip"
                  aria-pressed={filterRisk === ''}
                  onClick={() => setFilterRisk('')}
                  style={{
                    cursor: 'pointer',
                    borderColor: filterRisk === '' ? 'var(--dash-accent-line)' : undefined,
                    background: filterRisk === '' ? 'var(--dash-selected)' : undefined,
                    color: filterRisk === '' ? 'var(--dash-ink)' : undefined,
                  }}
                >
                  All risk
                </button>
                {RISK_CLASSES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="dash-chip"
                    aria-pressed={filterRisk === r}
                    onClick={() => setFilterRisk(filterRisk === r ? '' : r)}
                    style={{
                      cursor: 'pointer',
                      borderColor: filterRisk === r ? 'var(--dash-accent-line)' : undefined,
                      background: filterRisk === r ? 'var(--dash-selected)' : undefined,
                      color: filterRisk === r ? 'var(--dash-ink)' : undefined,
                    }}
                  >
                    <span className="dash-legend-swatch" style={{ background: riskColor[r] }} />
                    {r}
                    <span className="num">{stats.counts[r]}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="dash-chip"
                  aria-pressed={filterPeat}
                  onClick={() => setFilterPeat(!filterPeat)}
                  style={{
                    cursor: 'pointer',
                    borderColor: filterPeat ? 'var(--dash-accent-line)' : undefined,
                    background: filterPeat ? 'var(--dash-selected)' : undefined,
                    color: filterPeat ? 'var(--dash-ink)' : undefined,
                  }}
                >
                  <DashIcon name="droplet" size={12} />
                  Peatland only
                  <span className="num">{stats.peat}</span>
                </button>
              </div>
            </Panel>

            <Panel title="Zone ranking" note={`${filtered.length} zones`} grow>
              <List>
                {filtered.slice(0, 25).map((d, i) => (
                  <Row
                    key={d.id}
                    rank={i + 1}
                    name={`Desa ${d.n}`}
                    sub={`Kec. ${d.kc} · ${d.cls}`}
                    value={d.score}
                    selected={selected?.id === d.id}
                    onSelect={() => setSelected(selected?.id === d.id ? null : d)}
                  >
                    <span
                      className="dash-legend-swatch"
                      style={{ background: scoreColor(d.score) }}
                      aria-hidden="true"
                    />
                  </Row>
                ))}
              </List>
            </Panel>
          </Col>

          {/* ── Map ─────────────────────────────────────────── */}
          <Col>
            <Panel flush grow bodyFill style={{ position: 'relative', overflow: 'hidden' }}>
              <div ref={mapEl} className="dash-map" />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 400,
                }}
              />

              {/* Spread simulation control */}
              <div style={{ position: 'absolute', top: 10, left: 52, zIndex: 420, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  type="button"
                  className="dash-chip"
                  onClick={() => {
                    setSpreadStep(0)
                    setSpread(!spread)
                  }}
                  style={{
                    cursor: 'pointer',
                    background: spread ? 'var(--dash-selected)' : 'var(--dash-panel)',
                    borderColor: spread ? 'var(--dash-accent-line)' : undefined,
                    color: spread ? 'var(--dash-ink)' : undefined,
                  }}
                >
                  <DashIcon name="flame" size={12} />
                  {spread ? 'Stop spread simulation' : 'Run spread simulation'}
                </button>
                {spread && (
                  <>
                    <button
                      type="button"
                      className="dash-chip"
                      onClick={() => {
                        setSpreadStep(0)
                        setSpreadIdx((i) => i + 1)
                      }}
                      style={{ cursor: 'pointer', background: 'var(--dash-panel)' }}
                    >
                      Next hotspot
                    </button>
                    <span className="dash-chip" style={{ background: 'var(--dash-panel)' }}>
                      {spreadStep > 0 ? SPREAD_STEPS[spreadStep - 1] : 'Starting'}
                    </span>
                  </>
                )}
              </div>

              <MapOverlay position="bottom-left" title="Risk score">
                <div className="dash-legend is-stacked">
                  {[...RISK_CLASSES].reverse().map((r) => (
                    <span className="dash-legend-item" key={r}>
                      <span className="dash-legend-swatch" style={{ background: riskColor[r] }} />
                      {r}
                      <span className="spacer" />
                      <span className="value">{stats.counts[r]}</span>
                    </span>
                  ))}
                </div>
              </MapOverlay>

              {layerOpen && (
                <MapOverlay position="top-right" title="Map layers">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 220 }}>
                    {['Primary', 'Technical'].map((group) => (
                      <div key={group}>
                        <div className="dash-overlay-title">{group}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {LAYERS.filter((l) => l.group === group).map((l) => (
                            <label
                              key={l.id}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 11, cursor: 'pointer' }}
                            >
                              <input
                                type="checkbox"
                                checked={layers[l.id]}
                                onChange={() => toggleLayer(l.id)}
                                style={{ accentColor: t.accent, width: 13, height: 13, marginTop: 2, cursor: 'pointer' }}
                              />
                              <span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--dash-ink)' }}>
                                  <DashIcon name={l.icon} size={12} />
                                  {l.name}
                                </span>
                                <span style={{ display: 'block', color: 'var(--dash-faint)' }}>{l.desc}</span>
                              </span>
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

          {/* ── Zone profile ────────────────────────────────── */}
          {selected && (
            <Col scroll>
              <Panel title="Zone profile" note={selected.id}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dash-ink)' }}>
                  Desa {selected.n}
                </div>
                <div className="dash-note">
                  Kec. {selected.kc}
                  {selected.p ? ` · peat ${Math.round(selected.peatRatio * 100)}%` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 600,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'var(--dash-ink)',
                    }}
                  >
                    {shownScore}
                  </span>
                  <Status level={RISK_LEVEL[riskClass(shownScore)]}>{riskClass(shownScore)}</Status>
                </div>
              </Panel>

              <Panel title="Tier 1 · base score" note="weighted drivers">
                <Meters>
                  {[
                    ['FWI v2', selected.w_fwi, 30],
                    ['NDVI', selected.w_ndvi, 15],
                    ['NDMI', selected.w_ndmi, 10],
                    ['LST', selected.w_lst, 10],
                    ['Soil moisture', selected.w_sm, 10],
                    ['Rainfall', selected.w_rain, 10],
                  ].map(([label, value, weight]) => (
                    <Meter
                      key={label}
                      label={label}
                      value={value}
                      max={weight}
                      color={t.seriesAt(0)}
                      display={value.toFixed(1)}
                    />
                  ))}
                </Meters>
                <div className="dash-sep" style={{ margin: '10px 0 8px' }} />
                <table className="dash-table">
                  <tbody>
                    <tr>
                      <td>Peat boost</td>
                      <td className="num">+{selected.pb}</td>
                    </tr>
                    <tr>
                      <td>History boost</td>
                      <td className="num">+{selected.hb}</td>
                    </tr>
                    <tr>
                      <td>Base score</td>
                      <td className="num">{selected.baseScore}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="dash-note" style={{ marginTop: 8 }}>
                  {DRIVER_HELP['FWI v2']}
                </p>
              </Panel>

              <Panel title="Tier 2 · real-time modifier" note="FIRMS + BMKG">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--dash-ink)' }}>
                    {selected.rtMod > 0 ? '+' : ''}
                    {selected.rtMod}
                  </span>
                  <span className="dash-note">
                    base {selected.baseScore} to final {selected.score}
                  </span>
                </div>
                {selected.rtMod === 0 ? (
                  <p className="dash-note">No modifier is active right now.</p>
                ) : (
                  <table className="dash-table">
                    <tbody>
                      {selected.rtHs > 0 && (
                        <tr>
                          <td>Hotspot within {selected.rtHs === 20 ? '5' : '10'} km</td>
                          <td className="num">+{selected.rtHs}</td>
                        </tr>
                      )}
                      {selected.rtWind > 0 && (
                        <tr>
                          <td>Wind above {selected.rtWind === 10 ? '20' : '15'} km/h</td>
                          <td className="num">+{selected.rtWind}</td>
                        </tr>
                      )}
                      {selected.rtRain < 0 && (
                        <tr>
                          <td>Rainfall</td>
                          <td className="num">{selected.rtRain}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </Panel>

              <Panel title="Assessment" note="rule-based, offline">
                <table className="dash-table">
                  <tbody>
                    <tr>
                      <td style={{ width: 90, color: 'var(--dash-faint)' }}>Verdict</td>
                      <td>{analysis.verdict}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--dash-faint)' }}>Context</td>
                      <td>{analysis.context}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--dash-faint)' }}>Action</td>
                      <td>{analysis.action}</td>
                    </tr>
                  </tbody>
                </table>
              </Panel>

              <Panel title="Raw parameters" note="NASA POWER & GEE">
                <table className="dash-table">
                  <tbody>
                    {[
                      ['Temperature', `${selected.temp} °C`],
                      ['Relative humidity', `${selected.rh}%`],
                      ['Wind', `${selected.wind} km/h`],
                      ['Rainfall', `${selected.rain} mm`],
                      ['NDVI', selected.ndvi],
                      ['NDMI', selected.ndmi],
                      ['LST', `${selected.lst} °C`],
                      ['Slope', `${selected.slopeDeg}°`],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className="num">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </Col>
          )}
        </DashBody>

        {/* ── Timeline ──────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 2,
            padding: 8,
            border: '1px solid var(--dash-line)',
            borderRadius: 'var(--dash-radius)',
            background: 'var(--dash-panel)',
            opacity: selected ? 1 : 0.45,
            pointerEvents: selected ? 'auto' : 'none',
          }}
        >
          <span className="dash-panel-title" style={{ alignSelf: 'center', padding: '0 8px' }}>
            History
          </span>
          {TL_DAYS.filter((d) => d.offset !== 0).map((d, i, arr) => {
            const score = selected ? getTimeScore(selected, d.offset) : 0
            const isForecastStart = d.offset === 1
            return (
              <div key={d.offset} style={{ display: 'contents' }}>
                {isForecastStart && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTlDay(0)}
                      aria-pressed={tlDay === 0}
                      style={{
                        flex: 1,
                        border: `1px solid ${tlDay === 0 ? 'var(--dash-accent-line)' : 'transparent'}`,
                        borderRadius: 7,
                        background: tlDay === 0 ? 'var(--dash-selected)' : 'transparent',
                        font: 'inherit',
                        cursor: 'pointer',
                        padding: '5px 2px',
                      }}
                    >
                      <span
                        className="dash-num"
                        style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dash-ink)' }}
                      >
                        {selected ? selected.score : '-'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--dash-accent)' }}>Today</span>
                    </button>
                    <span className="dash-panel-title" style={{ alignSelf: 'center', padding: '0 8px' }}>
                      Forecast
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setTlDay(tlDay === d.offset ? 0 : d.offset)}
                  aria-pressed={tlDay === d.offset}
                  style={{
                    flex: 1,
                    border: `1px solid ${tlDay === d.offset ? 'var(--dash-accent-line)' : 'transparent'}`,
                    borderRadius: 7,
                    background: tlDay === d.offset ? 'var(--dash-selected)' : 'transparent',
                    font: 'inherit',
                    cursor: 'pointer',
                    padding: '5px 2px',
                  }}
                >
                  <span
                    className="dash-num"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--dash-ink)' }}
                  >
                    {selected ? score : '-'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--dash-faint)' }}>{d.label}</span>
                </button>
                {i === arr.length - 1 && null}
              </div>
            )
          })}
        </div>
      </DashBody>
    </DashFrame>
  )
}
