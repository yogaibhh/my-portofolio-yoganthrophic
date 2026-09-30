import taxonomy from '../data/skillTaxonomy'

/* Finds skill mentions in text, for both sides of the fit check: the job
   description being read, and the site's own tags and job history that the
   evidence is built from.

   Every entry's terms are searched, then overlapping hits are resolved in
   favour of the longest. That is what keeps "TensorFlow Lite" from also
   counting as "TensorFlow", "React Native" from counting as "React", and
   the "multi-agent simulation" in a job history from counting as AI agents.

   Word boundaries are written without lookbehind, which older iOS Safari
   cannot compile. A regex that throws at import would take the page down
   with it. */

const WORD = 'a-z0-9+#'

export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201b\u2032`]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, ' ')
}

function escapeChar(ch) {
  return /[.*+?^${}()|[\]\\/]/.test(ch) ? `\\${ch}` : ch
}

/* "power bi" → power[\s-]+bi(?:e?s)?   "scikit-learn" → scikit[\s-]?learn */
export function termSource(term) {
  if (term instanceof RegExp) return term.source
  const t = term.toLowerCase()
  let src = ''
  for (const ch of t) {
    if (ch === ' ') src += '[\\s-]+'
    else if (ch === '-') src += '[\\s-]?'
    else src += escapeChar(ch)
  }
  return /[a-z]$/.test(t) ? `${src}(?:e?s)?` : src
}

const termLength = (term) => (term instanceof RegExp ? term.source.length : term.length)

/* Group 1 is the character before the term (or the start of the line),
   group 2 is the term itself. */
export function boundedPattern(terms) {
  const sources = [...terms].sort((a, b) => termLength(b) - termLength(a)).map(termSource)
  return new RegExp(`(^|[^${WORD}])(${sources.join('|')})(?![${WORD}])`, 'g')
}

/* A bare single letter ("R") only counts when another analysis language is
   close by, so "R&D" or a stray initial never reads as a requirement. */
function letterHits(line, { char, near }) {
  const re = new RegExp(`(^|[^${WORD}&'])(${escapeChar(char)})(?![${WORD}&'])`, 'g')
  const hits = []
  let m
  while ((m = re.exec(line))) {
    const start = m.index + m[1].length
    const around = line.slice(Math.max(0, start - 16), start + 17)
    if (near.some((word) => around.includes(word))) hits.push({ start, end: start + 1 })
  }
  return hits
}

const compiled = taxonomy.map((entry) => ({ entry, re: boundedPattern(entry.terms) }))

/* Returns [{ id, start, end }] in reading order, positions measured in the
   normalised text. `mask` blanks out phrases first (role titles, place
   names) so they can never be read as skills. */
export function findMentions(text, { mask } = {}) {
  let line = normalize(text)
  if (mask) line = line.replace(mask, (_, before, hit) => before + ' '.repeat(hit.length))

  const hits = []
  for (const { entry, re } of compiled) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(line))) {
      const start = m.index + m[1].length
      hits.push({ id: entry.id, start, end: start + m[2].length })
    }
    if (entry.letter) {
      letterHits(line, entry.letter).forEach((hit) => hits.push({ id: entry.id, ...hit }))
    }
  }

  /* Longest wins; on a tie, whichever starts first. */
  hits.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start)
  const kept = []
  for (const hit of hits) {
    if (kept.every((k) => hit.end <= k.start || hit.start >= k.end)) kept.push(hit)
  }
  return kept.sort((a, b) => a.start - b.start)
}
