import { lazy } from 'react'

/* Map portfolio dashboard ids -> live interactive demo component.
   Lazy-loaded so Leaflet/Recharts only ship when a demo is actually opened.
   Kept in a plain .js module (no component exports) so react-refresh can
   fast-refresh the renderer in registry.jsx cleanly. */
export const demos = {
  'fmcg-sales-performance': lazy(() => import('./FmcgSalesDashboard')),
  'customer-churn-monitor': lazy(() => import('./ChurnMonitorDashboard')),
  'seismic-activity-monitor': lazy(() => import('./SeismicDashboard')),
  'netra-security-monitoring': lazy(() => import('./NetraDashboard')),
  'national-stability-index': lazy(() => import('./NpiDashboard')),
  'karhutla-fire-risk': lazy(() => import('./FireRiskDashboard')),
  'geopolitical-simulation': lazy(() => import('./WhatIfDashboard')),
  'weather-modification': lazy(() => import('./WeatherModDashboard')),
  'dki-jakarta-air-quality': lazy(() => import('./AirQualityDashboard')),
}

export function hasDemo(id) {
  return Boolean(demos[id])
}
