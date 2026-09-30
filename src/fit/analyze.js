import { taxonomyById } from '../data/skillTaxonomy'
import { profile, projects } from '../data/profile'
import { boundedPattern, findMentions, normalize, termSource } from './terms'
import { evidenceFor } from './evidence'

/* Reads a job description and scores it against the evidence on this site.

   - Each skill the posting names becomes a requirement, and "A or B"
     becomes a single requirement either one satisfies. A requirement is
     weighted by the section it came from.
   - Each requirement is Direct (the site shows it), Transferable (the site
     shows a close neighbour) or Not yet.
   - The score is the weighted share the site can back up.

   Years, degrees, certifications, languages and soft skills are not
   scored, and the page says so: those belong in a conversation, not in a
   keyword match. Nothing here makes a request; it all runs in the browser. */

export const WEIGHTS = { required: 1, general: 0.8, responsibilities: 0.7, nice: 0.35 }
export const CREDIT = { direct: 1, transferable: 0.5, gap: 0 }
export const MIN_REQUIREMENTS = 3
export const MAX_CHARS = 20000

/* ── Section headers, English and Indonesian ───────────────── */

const HEADER_PHRASES = {
  ignore: [
    'benefits?', 'perks', 'what we offer', 'we offer', "what'?s in it for you", 'why (?:join|work (?:with|for)) us',
    "why you'?ll love (?:it|us|working here)", 'about (?:us|the company|the team|company)', 'company (?:overview|profile|description)',
    'who we are', 'our (?:culture|values|story|mission)', 'compensation', 'salary', 'how to apply', 'application process',
    'equal (?:opportunity|employment)', 'fasilitas', 'keuntungan', 'tunjangan', 'tentang (?:kami|perusahaan)', 'profil perusahaan',
    'apa yang (?:kami tawarkan|kamu dapatkan|anda dapatkan)', 'cara melamar', 'gaji', 'location', 'lokasi', 'penempatan',
  ],
  nice: [
    'nice[\\s-]to[\\s-]haves?', 'preferred(?: qualifications| skills| experience)?', 'bonus(?: points| skills)?', 'pluses',
    'good[\\s-]to[\\s-]haves?', "it'?s a plus", 'extra credit', 'desirable(?: skills)?', 'additional (?:qualifications|skills)',
    'nilai (?:plus|tambah)', 'diutamakan', 'lebih disukai', 'poin plus', 'kualifikasi tambahan',
  ],
  required: [
    'requirements?', 'qualifications?', 'minimum qualifications', 'basic qualifications', 'required (?:skills|qualifications|experience)',
    'must[\\s-]haves?', "what you(?:'ll| will)? (?:need|bring)", "what we(?:'re| are)? looking for", 'you (?:have|bring|are|will have|might be)',
    'who you are', 'about you', '(?:the )?ideal candidate', 'skills', 'key skills', 'technical skills', 'experience',
    'your (?:profile|skills|experience|background)', 'kualifikasi', 'persyaratan', 'syarat', 'kriteria', 'yang kami cari', 'keahlian',
    'kemampuan',
  ],
  responsibilities: [
    'responsibilities', 'key responsibilities', 'job responsibilities', "what you(?:'ll| will)? do", 'what you will be doing',
    'your (?:role|mission|responsibilities|impact)', '(?:about )?the role', 'role (?:overview|description|summary)',
    'job (?:description|summary|details)', 'position (?:summary|overview)', 'overview', 'duties', 'day[\\s-]to[\\s-]day', 'in this role',
    'tanggung jawab', 'deskripsi (?:pekerjaan|tugas)', 'tugas(?: (?:dan|&) tanggung jawab)?', 'job ?desc(?:ription)?', 'rincian pekerjaan',
  ],
}

/* A header is the phrase plus at most a few words ("Qualifications & skills",
   "Requirements for this role"), and nothing that reads as a skill. */
const HEADERS = ['ignore', 'nice', 'required', 'responsibilities'].map((kind) => [
  kind,
  new RegExp(`^(?:${HEADER_PHRASES[kind].join('|')})(?:[\\s,&/-]+[\\w'()]+){0,4}$`),
])

const NICE_MARKER =
  /\b(?:is a plus|are a plus|a plus|plus point|bonus|preferred|nice to have|good to have|desirable|advantageous|an advantage|would be great|nilai (?:plus|tambah)|diutamakan|lebih disukai|menjadi (?:nilai )?(?:plus|keunggulan)|merupakan nilai)\b/

/* Degree and certification lines are read but not scored. "S1 Statistika"
   asks for a degree, not for statistics as a skill. (No bare "D3" here:
   that is also the charting library.) */
const NOT_SCORED =
  /\b(?:bachelor'?s?|master'?s?|ph\.?\s?d|degree|diploma|b\.?\s?sc|m\.?\s?sc|undergraduate|graduated?|s1|s2|sarjana|jurusan|lulusan|pendidikan|ipk|gpa|certification|certified|certificate|sertifikasi|sertifikat)\b/

/* A list introduced like this is a list of examples: any one will do. */
const EXAMPLE_LEAD =
  /(?:\(|\be\.?\s?g\.?,?|\bsuch as|\blike|\bfor example|\bfor instance|\bseperti|\bmisalnya|\bcontohnya)\s*:?\s*$/

/* ── Role titles ─────────────────────────────────────────── */

/* Masked before skills are read, so "work with data scientists" is not a
   requirement, and used to name the role in the email subject. */
const ROLE_TITLES = [
  ['machine learning engineer', 'Machine Learning Engineer'],
  ['ai/ml engineer', 'AI/ML Engineer'],
  ['ml engineer', 'ML Engineer'],
  ['ai engineer', 'AI Engineer'],
  ['llm engineer', 'LLM Engineer'],
  ['generative ai engineer', 'Generative AI Engineer'],
  ['genai engineer', 'GenAI Engineer'],
  ['mlops engineer', 'MLOps Engineer'],
  ['applied scientist', 'Applied Scientist'],
  ['research scientist', 'Research Scientist'],
  ['data scientist', 'Data Scientist'],
  ['data analyst', 'Data Analyst'],
  ['analis data', 'Data Analyst'],
  ['business intelligence analyst', 'Business Intelligence Analyst'],
  ['business intelligence developer', 'BI Developer'],
  ['bi analyst', 'BI Analyst'],
  ['bi developer', 'BI Developer'],
  ['bi engineer', 'BI Engineer'],
  ['analytics engineer', 'Analytics Engineer'],
  ['data engineer', 'Data Engineer'],
  ['business analyst', 'Business Analyst'],
  ['product analyst', 'Product Analyst'],
  ['marketing analyst', 'Marketing Analyst'],
  ['reporting analyst', 'Reporting Analyst'],
  ['financial analyst', 'Financial Analyst'],
  ['gis analyst', 'GIS Analyst'],
  ['gis specialist', 'GIS Specialist'],
  ['geospatial analyst', 'Geospatial Analyst'],
  ['remote sensing specialist', 'Remote Sensing Specialist'],
  ['software engineer', 'Software Engineer'],
  ['back-end engineer', 'Backend Engineer'],
  ['back-end developer', 'Backend Developer'],
  ['full-stack developer', 'Full-Stack Developer'],
  ['full-stack engineer', 'Full-Stack Engineer'],
  ['front-end engineer', 'Frontend Engineer'],
  ['front-end developer', 'Frontend Developer'],
  ['mobile developer', 'Mobile Developer'],
  ['flutter developer', 'Flutter Developer'],
  ['prompt engineer', 'Prompt Engineer'],
  ['ai specialist', 'AI Specialist'],
  ['ai researcher', 'AI Researcher'],
  ['meteorologist', 'Meteorologist'],
]

const SENIORITY = "senior|sr\\.?|junior|jr\\.?|lead|principal|staff|head of|associate|mid[\\s-]level|entry[\\s-]level|intern"

const TITLE_PATTERNS = ROLE_TITLES.map(([phrase, display]) => ({
  display,
  re: new RegExp(`(^|[^a-z0-9])(?:(${SENIORITY})\\s+)?(${termSource(phrase)})(?![a-z0-9])`),
}))

/* Phrases that look like skills but are not requirements: role titles,
   reporting lines, and the Indonesian provinces named after Java. */
const JD_MASK = boundedPattern([
  ...ROLE_TITLES.map(([phrase]) => phrase),
  'reports to', 'reporting to', 'report to', 'reporting line',
  'west java', 'east java', 'central java', 'java island', 'java sea',
])

function findTitle(text) {
  let best = null
  for (const { display, re } of TITLE_PATTERNS) {
    const m = re.exec(text)
    if (m && (!best || m.index < best.index)) best = { index: m.index, display, seniority: m[2] }
  }
  if (!best) return null
  if (!best.seniority) return best.display
  const seniority = best.seniority.replace(/\s+/g, ' ')
  return `${seniority.charAt(0).toUpperCase()}${seniority.slice(1)} ${best.display}`
}

function detectTitle(lines) {
  const normalized = lines.map(normalize)
  return findTitle(normalized.slice(0, 3).join('\n')) ?? findTitle(normalized.join('\n'))
}

/* ── Lines & sections ────────────────────────────────────── */

/* Pastes from job boards often lose their line breaks, so a long block with
   almost none is split into sentences (abbreviations like "e.g." kept). */
function splitLines(text) {
  let t = text.replace(/\r\n?/g, '\n').replace(/\s[•▪●◦■]\s/g, '\n')
  if ((t.match(/\n/g) ?? []).length < 4 && t.length > 300) {
    t = t
      .replace(/\b(e\.g|i\.e|etc|vs|incl|approx|sr|jr|min|max)\./gi, '$1\u2024')
      .replace(/([.;!?])\s+(?=\S)/g, '$1\n')
      .replace(/\u2024/g, '.')
  }
  return t
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function stripDecoration(line) {
  return line
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/[*_#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/* → { kind, label, rest } for a header line, or null for content.
   "Requirements" alone switches the section. "Requirements: Python" only
   weights its own line, which also keeps "Location: Jakarta" at the top of
   a posting from switching everything after it off. */
function readHeader(line) {
  const clean = stripDecoration(line)
  const lower = normalize(clean)
  const colon = lower.match(/^([^:]{2,50}):\s*(.*)$/)
  /* A heading does not end in a full stop; "We offer a competitive salary."
     is a sentence, even though it starts like one. */
  if (!colon && /[.!?]$/.test(lower)) return null
  const head = (colon ? colon[1] : lower).replace(/[:\s]+$/, '').trim()
  if (!head || head.length > 50) return null

  for (const [kind, re] of HEADERS) {
    if (!re.test(head)) continue
    if (!colon && findMentions(head).length) return null
    const resolved = kind !== 'ignore' && NICE_MARKER.test(head) ? 'nice' : kind
    const label = colon ? clean.slice(0, colon[1].length).trim() : clean.replace(/[:\s]+$/, '')
    return { kind: resolved, label, rest: colon ? clean.slice(clean.indexOf(':') + 1).trim() : '' }
  }
  return null
}

/* ── One line → requirements ─────────────────────────────── */

function connectorKind(between) {
  if (between.includes(')') || between.includes(';')) return 'break'
  if (between.includes('(') && !/\(\s*(?:or|atau)\b/.test(between)) return 'break'
  const t = between.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (t === '' || /^[,·|]$/.test(t)) return 'comma'
  if (t === '/' || /^,?\s?(?:or|atau|and\/or|dan\/atau)$/.test(t)) return 'or'
  if (/^,?\s?(?:and|dan|&|serta|as well as|plus)$/.test(t)) return 'and'
  return 'break'
}

const unique = (list) => [...new Set(list)]

/* A run of mentions joined only by commas and "or"/"and" is one list.
   "or" anywhere, or an introduction like "such as", makes it a list of
   alternatives; "and" or bare commas make every item required on its own;
   "SQL and Python or R" splits at the "and". Returns groups of mentions. */
function groupsOf({ items, connectors, lead }) {
  if (items.length === 1) return [items]

  const hasOr = connectors.includes('or')
  const hasAnd = connectors.includes('and')
  if (EXAMPLE_LEAD.test(lead) || (hasOr && !hasAnd)) return [items]
  if (!hasOr) return items.map((m) => [m])

  const runs = [{ items: [items[0]], or: false }]
  connectors.forEach((c, i) => {
    if (c === 'and') {
      runs.push({ items: [items[i + 1]], or: false })
    } else {
      const run = runs[runs.length - 1]
      run.items.push(items[i + 1])
      if (c === 'or') run.or = true
    }
  })
  return runs.flatMap((run) => (run.or ? [run.items] : run.items.map((m) => [m])))
}

/* → [{ ids, said }]: the skills a line asks for, and the words it used for
   them ("pgvector or Pinecone"), which is what the report shows. */
function requirementsIn(content) {
  const norm = normalize(content)
  const mentions = findMentions(content, { mask: JD_MASK })
  if (!mentions.length) return []

  /* Positions come from the normalised text; lowercasing a handful of
     non-Latin letters changes the length, and then the taxonomy's own
     label is the safer thing to show. */
  const aligned = norm.length === content.length
  const wordsFor = (m) => (aligned ? content.slice(m.start, m.end).replace(/\s+/g, ' ') : labelOf(m.id))

  const segments = []
  let current = { items: [mentions[0]], connectors: [], lead: norm.slice(0, mentions[0].start) }
  for (let i = 1; i < mentions.length; i++) {
    const between = norm.slice(mentions[i - 1].end, mentions[i].start)
    const kind = connectorKind(between)
    if (kind === 'break') {
      segments.push(current)
      current = { items: [mentions[i]], connectors: [], lead: between }
    } else {
      current.items.push(mentions[i])
      current.connectors.push(kind)
    }
  }
  segments.push(current)

  return segments.flatMap(groupsOf).map((group) => ({
    ids: unique(group.map((m) => m.id)),
    said: unique(group.map(wordsFor)).join(' or '),
  }))
}

/* ── Scoring ─────────────────────────────────────────────── */

function labelOf(id) {
  return taxonomyById.get(id)?.label ?? id
}

function projectCount(list) {
  return list.filter((e) => e.kind === 'project').length
}

/* Evidence for several skills, strongest skill first, each item once. */
function mergedEvidence(ids) {
  const seen = new Set()
  return ids.flatMap((id) => evidenceFor(id)).filter((e) => (seen.has(e.key) ? false : seen.add(e.key)))
}

function assess(ids) {
  const direct = ids
    .filter((id) => evidenceFor(id).length)
    .sort((a, b) => projectCount(evidenceFor(b)) - projectCount(evidenceFor(a)) || evidenceFor(b).length - evidenceFor(a).length)
  if (direct.length) {
    /* "OpenAI or Anthropic": every alternative the site can show counts as
       proof, with the best-evidenced one named. */
    return { status: 'direct', matched: direct[0], via: [], evidence: mergedEvidence(direct) }
  }

  const via = unique(ids.flatMap((id) => taxonomyById.get(id)?.related ?? [])).filter(
    (id) => !ids.includes(id) && evidenceFor(id).length,
  )
  if (via.length) return { status: 'transferable', matched: null, via, evidence: mergedEvidence(via) }

  return { status: 'gap', matched: null, via: [], evidence: [] }
}

export function scoreLabel(score) {
  if (score === null) return null
  if (score >= 80) return 'Strong fit'
  if (score >= 60) return 'Good fit'
  if (score >= 40) return 'Partial fit'
  return 'Stretch role'
}

const STATUS_ORDER = { direct: 0, transferable: 1, gap: 2 }

function rankProjects(requirements) {
  const scores = new Map()
  requirements.forEach((r) => {
    if (r.status === 'gap') return
    const credit = r.weight * CREDIT[r.status]
    unique(r.evidence.filter((e) => e.kind === 'project').map((e) => e.key)).forEach((key) => {
      const slug = key.slice('project:'.length)
      const entry = scores.get(slug) ?? { slug, score: 0, covers: [] }
      entry.score += credit
      if (!entry.covers.includes(r.said)) entry.covers.push(r.said)
      scores.set(slug, entry)
    })
  })

  const order = (slug) => projects.findIndex((p) => p.slug === slug)
  return [...scores.values()]
    .sort((a, b) => b.score - a.score || order(a.slug) - order(b.slug))
    .slice(0, 3)
    .map((entry) => ({ ...entry, project: projects.find((p) => p.slug === entry.slug) }))
}

export function analyzeJob(text) {
  const lines = splitLines(String(text ?? '').slice(0, MAX_CHARS))

  let section = 'general'
  const sections = []
  let notScored = 0
  const byKey = new Map()
  let order = 0

  for (const line of lines) {
    const header = readHeader(line)
    let content = line
    let kind = section

    if (header) {
      if (!header.rest) {
        section = header.kind
        sections.push({ kind: header.kind, label: header.label, lines: 0 })
        continue
      }
      kind = header.kind
      content = header.rest
    }

    if (kind === 'ignore') continue
    if (NOT_SCORED.test(normalize(content))) {
      notScored++
      continue
    }
    if (sections.length && !header) sections[sections.length - 1].lines++

    const nice = kind === 'nice' || NICE_MARKER.test(normalize(content))
    const weight = nice ? WEIGHTS.nice : WEIGHTS[kind]

    for (const { ids, said } of requirementsIn(content)) {
      const key = [...ids].sort().join('|')
      const existing = byKey.get(key)
      if (existing && existing.weight >= weight) continue
      byKey.set(key, { key, ids, said, weight, tier: nice ? 'nice' : 'core', line, order: existing?.order ?? order++ })
    }
  }

  const requirements = [...byKey.values()]
    .map((r) => ({ ...r, label: r.ids.map(labelOf).join(' or '), ...assess(r.ids) }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.weight - a.weight || a.order - b.order)

  const counts = { direct: 0, transferable: 0, gap: 0 }
  requirements.forEach((r) => counts[r.status]++)

  const enough = requirements.length >= MIN_REQUIREMENTS
  const totalWeight = requirements.reduce((sum, r) => sum + r.weight, 0)
  const earned = requirements.reduce((sum, r) => sum + r.weight * CREDIT[r.status], 0)
  const score = enough ? Math.round((100 * earned) / totalWeight) : null

  return {
    title: detectTitle(lines),
    requirements,
    core: requirements.filter((r) => r.tier === 'core'),
    nice: requirements.filter((r) => r.tier === 'nice'),
    counts,
    score,
    label: scoreLabel(score),
    enough,
    topProjects: rankProjects(requirements),
    sections,
    notScored,
  }
}

/* ── Words for the report, the email and the forward ────── */

export function countsSentence({ direct, transferable, gap }) {
  const total = direct + transferable + gap
  const head = `${direct} of ${total} requirement${total === 1 ? '' : 's'} ${direct === 1 ? 'has' : 'have'} direct evidence`
  const rest = []
  if (transferable) rest.push(`${transferable} ${transferable === 1 ? 'is' : 'are'} transferable`)
  if (gap) rest.push(`${gap} ${gap === 1 ? 'is' : 'are'} not shown yet`)
  return rest.length ? `${head}, ${rest.join(' and ')}.` : `${head}.`
}

const firstName = () => profile.shortName.split(' ')[0]

/* Plain text for a recruiter to forward to the hiring manager. Links are
   absolute because it will be read outside this site. */
export function summaryText(report, { site }) {
  const out = [`Fit check: ${profile.name}${report.title ? ` for ${report.title}` : ''}`]
  if (report.enough) out.push(`Fit score ${report.score}% (${report.label}). ${countsSentence(report.counts)}`)

  const block = (heading, list, format) => {
    if (!list.length) return
    out.push('', heading)
    list.forEach((item) => out.push(`- ${format(item)}`))
  }
  const byStatus = (status) => report.requirements.filter((r) => r.status === status)

  block('Direct evidence', byStatus('direct'), (r) => `${r.said}: ${r.evidence.slice(0, 2).map((e) => e.label).join('; ')}`)
  block('Transferable', byStatus('transferable'), (r) => `${r.said}, from ${r.via.map(labelOf).join(', ')}`)
  block('Not shown yet', byStatus('gap'), (r) => r.said)
  block('Case studies to start with', report.topProjects, (p) => `${p.project.title}: ${site}/project/${p.slug}/`)

  out.push(
    '',
    `Portfolio: ${site}/`,
    `CV: ${site}/${profile.cvFile}`,
    `Email: ${profile.email}`,
    `Phone${profile.whatsapp ? ' / WhatsApp' : ''}: ${profile.phone}`,
    '',
    'Scored in the browser by the fit check on the portfolio above. The job description was not uploaded anywhere.',
  )
  return out.join('\n')
}

export function emailDraft(report) {
  const role = report.title ? `our ${report.title} opening` : 'a role we are hiring for'
  const result = report.enough ? ` It came out at ${report.score}% (${report.label.toLowerCase()}).` : ''
  return {
    subject: report.title ? `${report.title} role: fit check` : 'A role that could fit: fit check',
    body: `Hi ${firstName()},\n\nI ran your portfolio's fit check against ${role}.${result} I'd like to talk about it.\n\nRole / link:\nCompany:\n\nBest regards,\n`,
  }
}

export function whatsappDraft(report) {
  const role = report.title ? `our ${report.title} opening` : 'a role we are hiring for'
  const result = report.enough ? ` (${report.score}%, ${report.label.toLowerCase()})` : ''
  return `Hi ${firstName()}, I ran your portfolio's fit check against ${role}${result}. Are you open to a quick chat?`
}
