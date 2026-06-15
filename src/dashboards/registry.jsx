import { lazy, Suspense } from 'react'

/* Map portfolio dashboard ids -> live interactive demo component.
   Lazy-loaded so Leaflet/Recharts only ship when a demo is opened. */
const components = {
  'netra-security-monitoring': lazy(() => import('./NetraDashboard')),
  'national-stability-index': lazy(() => import('./NpiDashboard')),
  'karhutla-fire-risk': lazy(() => import('./FireRiskDashboard')),
  'geopolitical-simulation': lazy(() => import('./WhatIfDashboard')),
  'weather-modification': lazy(() => import('./WeatherModDashboard')),
  'dki-jakarta-air-quality': lazy(() => import('./AirQualityDashboard')),
}

export function hasDemo(id) {
  return Boolean(components[id])
}

export function DashboardDemo({ id }) {
  const Cmp = components[id]
  if (!Cmp) return null
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#9aa6be' }}>Loading live demo…</div>}>
      <Cmp />
    </Suspense>
  )
}
