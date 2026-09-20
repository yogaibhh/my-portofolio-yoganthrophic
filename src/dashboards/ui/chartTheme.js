import { useMemo } from 'react'
import useTheme from '../../hooks/useTheme'

/* ──────────────────────────────────────────────────────────────
   One chart theme for all nine demos.

   The categorical slots are a validated palette: both modes clear the
   lightness band, the chroma floor, adjacent-pair CVD separation and the
   normal-vision floor on the dashboard surfaces (#fbfaf7 light,
   #171614 dark). Slot order is the colourblind-safety mechanism, so
   assign slots in order and never cycle past the eighth.

   Three light-mode slots (aqua, yellow, magenta) sit under 3:1 against the
   light surface. Every chart using them therefore ships visible labels, a
   legend or a table view, which is the documented relief.
   ────────────────────────────────────────────────────────────── */

const SERIES_LIGHT = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
]

const SERIES_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
]

/* Status is fixed in both modes and never doubles as a series colour.
   Anything painted with these also carries an icon and a label. */
export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
}

/* Single-hue sequential ramp for magnitude (blue, light to dark).
   Ordinal use starts at index 1 so the lightest step still clears 2:1. */
const SEQUENTIAL = ['#cde2fb', '#86b6ef', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95']

/* Diverging: warm/cool poles with a neutral midpoint. */
const DIVERGING_LIGHT = ['#184f95', '#2a78d6', '#86b6ef', '#f0efec', '#eda6a6', '#e34948', '#a82b2b']
const DIVERGING_DARK = ['#3987e5', '#6da7ec', '#9ec5f4', '#383835', '#e89a9a', '#e66767', '#c94444']

const SURFACE = {
  light: {
    surface: '#fbfaf7',
    panel: '#f7f5f0',
    ink: '#1b1a18',
    body: '#43413c',
    muted: '#6f6c64',
    faint: '#918d84',
    grid: 'rgba(27, 26, 24, 0.08)',
    axis: 'rgba(27, 26, 24, 0.16)',
    accent: '#b4623f',
  },
  dark: {
    surface: '#171614',
    panel: '#1c1a18',
    ink: '#f3f1ec',
    body: '#c9c5bd',
    muted: '#979289',
    faint: '#746f66',
    grid: 'rgba(245, 243, 239, 0.08)',
    axis: 'rgba(245, 243, 239, 0.16)',
    accent: '#e08a6b',
  },
}

/* Severity language shared by the monitoring demos. Each level maps to a
   status colour and always renders with its label, never colour alone. */
export const SEVERITY_ORDER = ['critical', 'high', 'elevated', 'monitor', 'ok']

export const SEVERITY = {
  critical: { label: 'Critical', level: 'critical' },
  high: { label: 'High', level: 'serious' },
  elevated: { label: 'Elevated', level: 'warning' },
  monitor: { label: 'Monitor', level: 'good' },
  ok: { label: 'Nominal', level: 'good' },
}

export function severityColor(key) {
  return STATUS[SEVERITY[key]?.level ?? 'good']
}

export default function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return useMemo(() => {
    const c = SURFACE[dark ? 'dark' : 'light']
    const series = dark ? SERIES_DARK : SERIES_LIGHT

    /* Recharts props shared by every cartesian chart, so grid weight, tick
       size and axis colour never drift between demos. */
    const tick = { fill: c.faint, fontSize: 11 }

    return {
      dark,
      ...c,
      series,
      /* Colour follows the entity: callers pass a stable index, never a
         rank that changes when a filter runs. */
      seriesAt: (i) => series[i % series.length],
      status: STATUS,
      sequential: SEQUENTIAL,
      /* t in [0,1] to a sequential step */
      sequentialAt: (t) => SEQUENTIAL[Math.min(SEQUENTIAL.length - 1, Math.max(0, Math.round(t * (SEQUENTIAL.length - 1))))],
      ordinalAt: (i, n) => SEQUENTIAL[1 + Math.min(SEQUENTIAL.length - 2, Math.round((i / Math.max(1, n - 1)) * (SEQUENTIAL.length - 2)))],
      diverging: dark ? DIVERGING_DARK : DIVERGING_LIGHT,

      /* Shared cartesian chrome. Gridlines are solid hairlines, one shade
         off the surface, horizontal only. */
      grid: {
        stroke: c.grid,
        vertical: false,
        strokeDasharray: undefined,
      },
      xAxis: {
        tick,
        axisLine: { stroke: c.axis },
        tickLine: false,
        tickMargin: 6,
        minTickGap: 12,
      },
      yAxis: {
        tick,
        axisLine: false,
        tickLine: false,
        tickMargin: 4,
        width: 38,
      },
      cursor: { stroke: c.axis, strokeWidth: 1 },
      barCursor: { fill: dark ? 'rgba(245,243,239,0.05)' : 'rgba(27,26,24,0.04)' },
    }
  }, [dark])
}
