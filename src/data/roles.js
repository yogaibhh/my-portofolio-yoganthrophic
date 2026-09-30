/* Recruiter-facing content: the one-page briefs at /brief and /for/<role>,
   and the page copy for the fit check at /fit.

   Every claim here has to be provable on this site. `focusSkills` are ids
   from skillTaxonomy.js, and the content tests fail if any of them has no
   evidence behind it, so a brief can never pitch a skill the portfolio does
   not show. The pitches reuse figures from the case studies and the CV
   rather than introducing new ones.

   Imported by scripts/routes.mjs under plain Node, so imports here carry
   their extension and nothing reaches for `import.meta.env`. */

import { profile, projects } from './profile.js'

export const roles = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    headline: 'LLM tooling, agents and edge ML',
    pitch:
      'I integrate LLM providers into production tooling, build MCP servers that give agents read-only access to real data, and ship edge models that predict with no connection at all. Right now I own full-stack scope as an AI Native Engineer, turning recurring engineering work into reusable agent skills.',
    description:
      'One-page brief on Muhamad Yoga Ibrahim for AI Engineer roles: LLM integration, MCP agents with read-only data access, and edge ML, each linked to the work that proves it.',
    focusSkills: ['llm', 'agents', 'mcp', 'ai-guardrails', 'python', 'pytorch', 'edge-ai', 'full-stack'],
    projects: ['mcp-ai-data-analyst', 'hermes-agent', 'cloud-seeding-hunter'],
    dashboards: [],
    sample: 'ai-engineer',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    headline: 'Predictive models, statistics and geospatial data',
    pitch:
      'I build models that hold up on a held-out test set and explain themselves in terms a team can act on: a leak-free churn model at 0.84 ROC-AUC on 7,043 subscribers, a Gutenberg-Richter fit across 10,294 earthquakes, and a fire-risk model on Google Earth Engine and NASA POWER data.',
    description:
      'One-page brief on Muhamad Yoga Ibrahim for Data Scientist roles: leak-free predictive models, statistics and geospatial data, each linked to the work that proves it.',
    focusSkills: [
      'machine-learning', 'scikit-learn', 'statistics', 'model-evaluation', 'explainability', 'python', 'geospatial', 'remote-sensing',
    ],
    projects: ['telco-churn-prediction', 'indonesia-earthquake-analysis', 'cloud-seeding-hunter'],
    dashboards: ['customer-churn-monitor', 'karhutla-fire-risk'],
    sample: 'data-scientist',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    headline: 'SQL, BI dashboards and reporting automation',
    pitch:
      "I answer business questions in SQL someone else can audit, and turn the answers into dashboards a stakeholder can filter themselves: twelve questions on a music store's sales in pure SQL, a reproducible Excel dashboard over 190,754 FMCG sales records, and reporting that got 40% faster once I automated it.",
    description:
      'One-page brief on Muhamad Yoga Ibrahim for Data Analyst roles: SQL, BI dashboards and reporting automation, each linked to the work that proves it.',
    focusSkills: ['sql', 'excel', 'power-bi', 'dashboards', 'data-visualization', 'python', 'reporting', 'automation'],
    projects: ['chinook-sql-analytics', 'fmcg-excel-dashboard', 'build-dashboard-skill'],
    dashboards: ['fmcg-sales-performance', 'customer-churn-monitor'],
    sample: 'data-analyst',
  },
]

/* /brief: the same page for a visitor who has not picked a role yet. */
export const generalBrief = {
  id: 'general',
  title: 'General',
  headline: profile.tagline,
  pitch: profile.summary,
  description:
    'One-page brief on Muhamad Yoga Ibrahim, AI Engineer, Data Scientist and Data Analyst in Bogor, Indonesia: skills with proof, the case studies to read first, availability and contact.',
  focusSkills: ['python', 'sql', 'llm', 'agents', 'machine-learning', 'dashboards', 'etl', 'geospatial'],
  projects: projects.filter((p) => p.featured).map((p) => p.slug),
  dashboards: ['fmcg-sales-performance', 'seismic-activity-monitor'],
  sample: null,
}

export const fitCheck = {
  title: 'Job fit check',
  description:
    "Paste a job description and see, requirement by requirement, where Muhamad Yoga Ibrahim's projects and experience match, with a link to the proof. Runs in your browser; nothing is uploaded.",
}

/* No id means /brief. An unknown id means a page that does not exist. */
export function getBrief(id) {
  if (!id) return generalBrief
  return roles.find((r) => r.id === id) ?? null
}

/* Page titles, shared by the static route files and the in-app head. */
export function briefTitle(brief) {
  return brief.id === 'general' ? '30-second brief' : `${brief.title} brief`
}
