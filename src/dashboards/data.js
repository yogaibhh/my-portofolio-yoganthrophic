/* ============================================================
   Dummy / sample data for all 6 live demo dashboards.
   100% synthetic — no real intelligence, no real PII.
   Deterministic (seeded) so charts are stable across renders.
   ============================================================ */

// tiny seeded PRNG (mulberry32)
function rng(seed) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEV_KEYS = ['critical', 'high', 'elevated', 'monitor', 'ok']

/* ============================================================
   1. NETRA — Strategic / Security Monitoring
   ============================================================ */
export const netra = (() => {
  const r = rng(7)
  const events = [
    { id: 1, lat: 1.3, lng: 103.8, sev: 'critical', title: 'Maritime chokepoint anomaly', place: 'Singapore Strait', type: 'Maritime' },
    { id: 2, lat: 12.6, lng: 43.3, sev: 'critical', title: 'Naval escort surge', place: 'Bab-el-Mandeb', type: 'Maritime' },
    { id: 3, lat: 26.5, lng: 56.3, sev: 'high', title: 'Tanker AIS gap cluster', place: 'Strait of Hormuz', type: 'Maritime' },
    { id: 4, lat: 50.4, lng: 30.5, sev: 'high', title: 'Infrastructure strike reports', place: 'Kyiv Oblast', type: 'Conflict' },
    { id: 5, lat: 24.5, lng: 118.1, sev: 'elevated', title: 'Live-fire exercise notam', place: 'Taiwan Strait', type: 'Military' },
    { id: 6, lat: -6.2, lng: 106.8, sev: 'monitor', title: 'Port congestion uptick', place: 'Tanjung Priok', type: 'Logistics' },
    { id: 7, lat: 36.2, lng: 37.1, sev: 'high', title: 'Cross-border shelling', place: 'Northern Syria', type: 'Conflict' },
    { id: 8, lat: 9.1, lng: 38.7, sev: 'elevated', title: 'Grid instability signal', place: 'Addis Ababa', type: 'Energy' },
    { id: 9, lat: 14.6, lng: 121.0, sev: 'monitor', title: 'Coast guard standoff', place: 'West Philippine Sea', type: 'Maritime' },
    { id: 10, lat: 55.7, lng: 37.6, sev: 'elevated', title: 'Sanctioned-entity flight', place: 'Moscow FIR', type: 'Aviation' },
    { id: 11, lat: -33.9, lng: 18.4, sev: 'monitor', title: 'Cable landing maintenance', place: 'Cape Town', type: 'Subsea' },
    { id: 12, lat: 35.7, lng: 51.4, sev: 'high', title: 'Air-defense activation', place: 'Tehran', type: 'Military' },
  ]
  // submarine cable polylines (illustrative paths)
  const cables = [
    { name: 'SEA-ME-WE (sample)', color: '#22d3ee', path: [[1.3, 103.8], [6.9, 79.8], [25.2, 55.3], [30, 32], [43, 5], [51, 1]] },
    { name: 'Trans-Pacific (sample)', color: '#818cf8', path: [[1.3, 103.8], [14.6, 121], [22.3, 114.2], [35.6, 139.7], [37.8, -122.4]] },
    { name: 'Africa Loop (sample)', color: '#34d399', path: [[51, 1], [38.7, -9.1], [14.7, -17.4], [-4, 11], [-33.9, 18.4]] },
  ]
  const flows = [
    { from: 'Maritime', to: 'Energy', value: 38 },
    { from: 'Conflict', to: 'Logistics', value: 27 },
    { from: 'Military', to: 'Aviation', value: 19 },
    { from: 'Subsea', to: 'Energy', value: 14 },
    { from: 'Logistics', to: 'Maritime', value: 22 },
  ]
  const watch = [
    { code: 'ID', name: 'Indonesia', score: 62, trend: 'up', tags: ['Maritime', 'Chokepoints', 'Logistics'] },
    { code: 'IR', name: 'Iran', score: 81, trend: 'up', tags: ['Military', 'Sanctions', 'Maritime'] },
    { code: 'UA', name: 'Ukraine', score: 88, trend: 'flat', tags: ['Conflict', 'Energy'] },
    { code: 'PH', name: 'Philippines', score: 58, trend: 'up', tags: ['Maritime', 'Coast Guard'] },
    { code: 'ET', name: 'Ethiopia', score: 49, trend: 'down', tags: ['Energy', 'Internal'] },
  ]
  const tl = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    events: Math.round(4 + r() * 14 + (h > 8 && h < 20 ? 6 : 0)),
    critical: Math.round(r() * 5),
  }))
  return {
    events, cables, flows, watch, timeline: tl,
    kpis: { active: 248, critical: 12, regions: 19, infra: 7 },
  }
})()

/* ============================================================
   2. NPI — National Stability / Predictive Index
   ============================================================ */
export const npi = (() => {
  const r = rng(21)
  const provinces = [
    { name: 'DKI Jakarta', lat: -6.2, lng: 106.85, score: 74 },
    { name: 'Jawa Barat', lat: -6.9, lng: 107.6, score: 58 },
    { name: 'Jawa Tengah', lat: -7.15, lng: 110.4, score: 41 },
    { name: 'Jawa Timur', lat: -7.5, lng: 112.5, score: 52 },
    { name: 'Sumatera Utara', lat: 3.6, lng: 98.7, score: 63 },
    { name: 'Sulawesi Selatan', lat: -5.1, lng: 119.4, score: 47 },
    { name: 'Papua', lat: -4.3, lng: 138.1, score: 69 },
    { name: 'Aceh', lat: 5.5, lng: 95.3, score: 55 },
    { name: 'Kalimantan Timur', lat: -0.5, lng: 117.1, score: 38 },
    { name: 'Bali', lat: -8.4, lng: 115.2, score: 29 },
  ]
  const index = Array.from({ length: 30 }, (_, d) => ({
    day: `D-${30 - d}`,
    index: Math.round(50 + Math.sin(d / 4) * 9 + r() * 8),
    forecast: d > 22 ? Math.round(55 + (d - 22) * 1.4 + r() * 4) : null,
  }))
  const drivers = [
    { label: 'Socio-economic', value: 72, color: '#fb923c' },
    { label: 'Political', value: 64, color: '#f43f5e' },
    { label: 'Security', value: 48, color: '#facc15' },
    { label: 'Information', value: 81, color: '#818cf8' },
    { label: 'Environmental', value: 35, color: '#34d399' },
  ]
  const terms = [
    ['subsidi', 95], ['demonstrasi', 78], ['pemilu', 88], ['harga', 72], ['BBM', 68],
    ['kebijakan', 60], ['inflasi', 55], ['banjir', 50], ['relokasi', 44], ['tarif', 40],
    ['mogok', 38], ['regulasi', 35], ['investasi', 33], ['pangan', 48], ['logistik', 30],
  ]
  const feed = [
    { t: '14:02', sev: 'high', txt: 'Spike sentimen negatif terkait kebijakan subsidi — Jawa Barat' },
    { t: '13:48', sev: 'elevated', txt: 'Klaster diskusi harga pangan naik 2.4x — nasional' },
    { t: '13:31', sev: 'monitor', txt: 'Aktivitas terkoordinasi terdeteksi — kanal regional' },
    { t: '13:05', sev: 'critical', txt: 'Indikator eskalasi protes melewati ambang — DKI Jakarta' },
    { t: '12:50', sev: 'ok', txt: 'Indeks stabilitas Bali kembali ke baseline' },
  ]
  return { provinces, index, drivers, terms, feed, kpis: { index: 56, sources: '1.2M', alerts: 7, coverage: '34 prov' } }
})()

/* ============================================================
   3. KARHUTLA — Fire Risk Prediction (Riau, Sumatra)
   ============================================================ */
export const fire = (() => {
  const r = rng(33)
  const villages = [
    { name: 'Rimbo Panjang', lat: 0.42, lng: 101.3, risk: 88 },
    { name: 'Sungai Tohor', lat: 0.95, lng: 102.6, risk: 92 },
    { name: 'Teluk Meranti', lat: 0.18, lng: 102.55, risk: 76 },
    { name: 'Kampar Kiri', lat: 0.31, lng: 101.1, risk: 54 },
    { name: 'Bukit Batu', lat: 1.55, lng: 101.65, risk: 81 },
    { name: 'Tasik Serai', lat: 1.18, lng: 101.45, risk: 67 },
    { name: 'Pulau Burung', lat: 0.72, lng: 103.05, risk: 45 },
    { name: 'Pangkalan Kerinci', lat: 0.38, lng: 101.85, risk: 33 },
    { name: 'Tanjung Leban', lat: 1.72, lng: 101.55, risk: 71 },
    { name: 'Dayun', lat: 0.62, lng: 101.95, risk: 59 },
  ]
  const hotspots = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    lat: 0.2 + r() * 1.6,
    lng: 101.0 + r() * 2.1,
    conf: Math.round(55 + r() * 45),
  }))
  const forecast = Array.from({ length: 7 }, (_, d) => ({
    day: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][d],
    fwi: Math.round(28 + Math.sin(d / 1.5) * 10 + r() * 12),
    risk: Math.round(50 + d * 4 + r() * 14),
  }))
  const drivers = [
    { label: 'FWI (NASA POWER)', value: 78, color: '#f97316' },
    { label: 'Soil Moisture', value: 22, color: '#22d3ee' },
    { label: 'NDVI/NDMI dryness', value: 71, color: '#facc15' },
    { label: 'Peatland boost', value: 65, color: '#ef4444' },
    { label: 'Wind speed', value: 44, color: '#818cf8' },
  ]
  const wind = { dir: 215, speed: 14 } // deg, km/h
  return { villages, hotspots, forecast, drivers, wind, kpis: { hotspots: 26, extreme: 4, fwi: 31.4, villages: 142 } }
})()

/* ============================================================
   4. GEOPOLITICAL WHAT-IF — Scenario Simulation
   ============================================================ */
export const whatif = (() => {
  const r = rng(44)
  const scenarios = [
    {
      id: 'hormuz', label: 'Hormuz closure (30d)', type: 'Security', color: '#f43f5e',
      impacts: [
        { k: 'Brent crude', v: '+34%', dir: 'up', sev: 'critical' },
        { k: 'LNG spot Asia', v: '+22%', dir: 'up', sev: 'high' },
        { k: 'ID trade balance', v: '-8.1%', dir: 'down', sev: 'high' },
        { k: 'Regional escalation', v: 'High', dir: 'up', sev: 'critical' },
      ],
      nodes: [[26.5, 56.3], [25.2, 55.3], [29.3, 47.9], [1.3, 103.8], [-6.2, 106.8]],
      series: [62, 70, 88, 96, 91, 84, 79],
    },
    {
      id: 'chip', label: 'Semiconductor export curb', type: 'Technology', color: '#22d3ee',
      impacts: [
        { k: 'Global chip supply', v: '-18%', dir: 'down', sev: 'high' },
        { k: 'Electronics CPI', v: '+11%', dir: 'up', sev: 'elevated' },
        { k: 'ID assembly orders', v: '+6%', dir: 'up', sev: 'ok' },
        { k: 'Tech equity vol', v: '+27%', dir: 'up', sev: 'high' },
      ],
      nodes: [[24.5, 118.1], [35.6, 139.7], [37.5, 127], [1.3, 103.8], [37.8, -122.4]],
      series: [40, 52, 61, 74, 70, 66, 72],
    },
    {
      id: 'grain', label: 'Black Sea grain disruption', type: 'Economic', color: '#fb923c',
      impacts: [
        { k: 'Wheat futures', v: '+41%', dir: 'up', sev: 'critical' },
        { k: 'ID food inflation', v: '+5.3%', dir: 'up', sev: 'high' },
        { k: 'Fertilizer index', v: '+19%', dir: 'up', sev: 'elevated' },
        { k: 'Import substitution', v: 'Med', dir: 'up', sev: 'monitor' },
      ],
      nodes: [[46.5, 30.7], [41, 29], [30, 31.2], [-6.2, 106.8], [3.6, 98.7]],
      series: [55, 68, 82, 90, 86, 80, 77],
    },
  ]
  const baseline = Array.from({ length: 7 }, (_, d) => Math.round(50 + Math.sin(d / 2) * 6 + r() * 4))
  const days = ['T+0', 'T+5', 'T+10', 'T+15', 'T+20', 'T+25', 'T+30']
  return { scenarios, baseline, days }
})()

/* ============================================================
   5. WEATHER MODIFICATION — Cloud Seeding Operations (TMC)
   ============================================================ */
export const weather = (() => {
  const r = rng(58)
  // sorties over Jabodetabek / Jatiluhur catchment
  const sorties = [
    { id: 'S-01', lat: -6.55, lng: 107.4, flares: 24, status: 'completed', rain: 18 },
    { id: 'S-02', lat: -6.78, lng: 107.0, flares: 30, status: 'completed', rain: 26 },
    { id: 'S-03', lat: -6.35, lng: 106.7, flares: 20, status: 'active', rain: 11 },
    { id: 'S-04', lat: -6.9, lng: 106.9, flares: 28, status: 'completed', rain: 22 },
    { id: 'S-05', lat: -6.2, lng: 107.2, flares: 16, status: 'planned', rain: 0 },
  ]
  const target = { lat: -6.62, lng: 107.38, name: 'Jatiluhur Catchment' }
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}h`,
    seeded: Math.round((h > 6 && h < 18 ? 8 : 2) + r() * 6),
    control: Math.round((h > 6 && h < 18 ? 4 : 1) + r() * 4),
  }))
  const cells = [
    { name: 'Cb cluster NW', cover: 72, top: 11.2, suit: 'high' },
    { name: 'Stratocumulus S', cover: 48, top: 4.1, suit: 'medium' },
    { name: 'Cumulus congestus', cover: 61, top: 7.8, suit: 'high' },
    { name: 'Cirrus deck', cover: 35, top: 9.4, suit: 'low' },
  ]
  return {
    sorties, target, hours, cells,
    kpis: { sorties: 5, flares: 118, hours: 487, addRain: '+38%' },
  }
})()

/* ============================================================
   6. DKI JAKARTA — Air Quality Monitoring
   ============================================================ */
export const air = (() => {
  const r = rng(67)
  const stations = [
    { name: 'Bundaran HI', lat: -6.195, lng: 106.823, aqi: 162 },
    { name: 'Kelapa Gading', lat: -6.158, lng: 106.905, aqi: 148 },
    { name: 'Lubang Buaya', lat: -6.292, lng: 106.91, aqi: 171 },
    { name: 'Jagakarsa', lat: -6.33, lng: 106.82, aqi: 138 },
    { name: 'Kebon Jeruk', lat: -6.19, lng: 106.77, aqi: 155 },
    { name: 'Bekasi', lat: -6.24, lng: 106.99, aqi: 178 },
    { name: 'Tangerang', lat: -6.18, lng: 106.63, aqi: 144 },
    { name: 'Depok', lat: -6.4, lng: 106.82, aqi: 159 },
    { name: 'Ancol', lat: -6.12, lng: 106.84, aqi: 133 },
    { name: 'Cibubur', lat: -6.37, lng: 106.9, aqi: 151 },
  ]
  // 10-year annual mean PM2.5 trend
  const trend = Array.from({ length: 10 }, (_, y) => ({
    year: `${2016 + y}`,
    pm25: Math.round(38 + Math.sin(y / 2) * 6 + (y > 3 ? 4 : 0) + r() * 5),
    who: 15,
  }))
  // diurnal pattern
  const diurnal = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}`,
    pm25: Math.round(45 + Math.sin((h - 6) / 3.8) * 22 + r() * 8),
  }))
  const pollutants = [
    { label: 'PM2.5', value: 58, color: '#f43f5e' },
    { label: 'PM10', value: 41, color: '#fb923c' },
    { label: 'O₃', value: 33, color: '#facc15' },
    { label: 'NO₂', value: 27, color: '#22d3ee' },
    { label: 'CO', value: 19, color: '#818cf8' },
    { label: 'SO₂', value: 12, color: '#34d399' },
  ]
  return { stations, trend, diurnal, pollutants, kpis: { aqi: 155, category: 'Unhealthy', stations: 20, points: '175K+' } }
})()

/* AQI → category color */
export function aqiColor(aqi) {
  if (aqi <= 50) return '#34d399'
  if (aqi <= 100) return '#facc15'
  if (aqi <= 150) return '#fb923c'
  if (aqi <= 200) return '#f43f5e'
  return '#c084fc'
}
export function aqiCat(aqi) {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Sensitive'
  if (aqi <= 200) return 'Unhealthy'
  return 'Hazardous'
}

/* fire risk color ramp */
export function riskColor(v) {
  if (v >= 80) return '#ef4444'
  if (v >= 60) return '#f97316'
  if (v >= 40) return '#eab308'
  return '#22c55e'
}

export { SEV_KEYS }
