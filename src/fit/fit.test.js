import { describe, it, expect } from 'vitest'
import taxonomy, { taxonomyById } from '../data/skillTaxonomy'
import sampleJobs from '../data/sampleJobs'
import { skillGroups, projects } from '../data/profile'
import dashboards from '../data/dashboards'
import { findMentions } from './terms'
import { evidenceFor, evidenceIndex, resolveRef } from './evidence'
import { analyzeJob, summaryText, emailDraft, whatsappDraft } from './analyze'

/* The fit check makes claims about the work in front of a recruiter, so
   what is worth testing is that it never claims more than the site shows,
   and that it reads a posting the way a person would: "A or B" is one
   requirement, a benefits list is not a requirement at all. */

const ids = (text) => findMentions(text).map((m) => m.id)
const find = (report, id) => report.requirements.find((r) => r.ids.includes(id))

describe('skill taxonomy', () => {
  it('keeps ids unique and URL-safe', () => {
    const all = taxonomy.map((e) => e.id)
    expect(new Set(all).size).toBe(all.length)
    all.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it('points every related and implied skill at a real entry', () => {
    taxonomy.forEach((entry) => {
      ;[...(entry.related ?? []), ...(entry.implies ?? [])].forEach((ref) => {
        expect(taxonomyById.has(ref), `${entry.id} → ${ref}`).toBe(true)
      })
    })
  })

  it('never lets two skills claim the same term', () => {
    const owner = new Map()
    taxonomy.forEach((entry) => {
      entry.terms
        .filter((t) => typeof t === 'string')
        .forEach((term) => {
          const other = owner.get(term)
          expect(other === undefined || other === entry.id, `"${term}" is claimed by ${other} and ${entry.id}`).toBe(true)
          owner.set(term, entry.id)
        })
    })
  })

  it('resolves every curated piece of evidence to a real page', () => {
    taxonomy.forEach((entry) => {
      ;(entry.evidence ?? []).forEach((ref) => {
        expect(resolveRef(ref), `${entry.id} cites ${ref}, which does not exist`).toBeTruthy()
      })
    })
  })
})

describe('reading text', () => {
  it('prefers the longest match, so a product is not read as its parent', () => {
    expect(ids('TensorFlow Lite')).toEqual(['tflite'])
    expect(ids('React Native')).toEqual(['react-native'])
    expect(ids('Power BI')).toEqual(['power-bi'])
    expect(ids('Spark SQL')).toEqual(['spark'])
  })

  it('matches whole words only', () => {
    expect(ids('JavaScript')).toEqual(['javascript'])
    expect(ids('MySQL and PostgreSQL')).toEqual(['mysql', 'postgresql'])
    expect(ids('HTML')).toEqual(['html-css'])
  })

  it('accepts hyphen, spacing and plural variants', () => {
    expect(ids('scikit learn')).toEqual(['scikit-learn'])
    expect(ids('Power-BI dashboards')).toEqual(['power-bi', 'dashboards'])
  })

  it('reads a bare "R" only next to another analysis language', () => {
    expect(ids('Python or R')).toEqual(['python', 'r'])
    expect(ids('R&D budget')).toEqual([])
  })
})

describe('evidence', () => {
  /* Nothing on the site shows these. Several of them are named in the case
     studies precisely as things that were not used ("without hiding behind
     Airflow", "rather than native Slicers and PivotTables"). */
  it.each([
    'orchestration', 'aws', 'azure', 'docker', 'kubernetes', 'tableau', 'spark', 'databricks', 'dbt', 'langchain', 'rag',
    'vector-search', 'fine-tuning', 'deep-learning', 'computer-vision', 'nlp', 'tensorflow', 'excel-advanced', 'java', 'streaming',
    'ci-cd', 'causal-inference', 'web-analytics', 'bigquery', 'snowflake',
  ])('claims no direct evidence for %s', (id) => {
    expect(evidenceFor(id)).toEqual([])
  })

  it('does not read the multi-agent simulation job as AI agent work', () => {
    expect(evidenceFor('simulation').some((e) => /multi-agent simulation/i.test(e.via ?? ''))).toBe(true)
    expect(evidenceFor('agents').some((e) => /simulation/i.test(e.via ?? ''))).toBe(false)
  })

  it('treats TensorFlow as transferable, since only TensorFlow Lite is shown', () => {
    const report = analyzeJob('Requirements\n- TensorFlow\n- SQL\n- Python')
    expect(find(report, 'tensorflow').status).toBe('transferable')
    expect(find(report, 'tensorflow').via).toContain('tflite')
  })

  it('backs every skill in the Skills section with work shown elsewhere', () => {
    skillGroups.forEach((group) => {
      group.skills.forEach((skill) => {
        const found = ids(`${skill.name} ${skill.detail}`)
        expect(
          found.some((id) => evidenceFor(id).length),
          `"${skill.name}" is claimed in Skills but nothing on the site backs it`,
        ).toBe(true)
      })
    })
  })

  it('links every piece of evidence to a page that exists', () => {
    const slugs = new Set(projects.map((p) => p.slug))
    const dashboardIds = new Set(dashboards.map((d) => d.id))
    evidenceIndex().forEach((items, skill) => {
      items.forEach((item) => {
        expect(item.href, `${skill}: ${item.label}`).toMatch(/^\/(project\/[a-z0-9-]+|dashboard\/[a-z0-9-]+|#(experience|education|github))$/)
        if (item.kind === 'project') expect(slugs.has(item.href.split('/')[2])).toBe(true)
        if (item.kind === 'dashboard') expect(dashboardIds.has(item.href.split('/')[2])).toBe(true)
      })
    })
  })
})

describe('reading a job description', () => {
  it('reads English sections and skips the benefits', () => {
    const report = analyzeJob(`Requirements
- Python and SQL

Nice to have
- Tableau

Benefits
- Docker stickers and AWS credits`)
    expect(find(report, 'python').tier).toBe('core')
    expect(find(report, 'tableau').tier).toBe('nice')
    expect(find(report, 'docker')).toBeUndefined()
    expect(find(report, 'aws')).toBeUndefined()
  })

  it('reads Indonesian sections', () => {
    const report = analyzeJob(`Kualifikasi
- Menguasai SQL dan Excel

Nilai Plus
- Pengalaman dengan Tableau

Fasilitas
- Laptop dan lisensi Docker Desktop`)
    expect(find(report, 'sql').tier).toBe('core')
    expect(find(report, 'excel').tier).toBe('core')
    expect(find(report, 'tableau').tier).toBe('nice')
    expect(find(report, 'docker')).toBeUndefined()
  })

  it('weights a line marked as a plus as nice to have', () => {
    const report = analyzeJob('Requirements\n- SQL\n- Excel\n- Python is a plus')
    expect(find(report, 'python').tier).toBe('nice')
    expect(find(report, 'sql').tier).toBe('core')
  })

  it('treats "A or B" as one requirement that either satisfies', () => {
    const report = analyzeJob('Requirements\n- Experience with Tableau, Power BI, or Looker\n- SQL\n- Excel')
    const bi = find(report, 'power-bi')
    expect(bi.ids).toEqual(['tableau', 'power-bi', 'looker'])
    expect(bi.said).toBe('Tableau or Power BI or Looker')
    expect(bi.status).toBe('direct')
    expect(bi.matched).toBe('power-bi')
  })

  it('keeps "A, B and C" as separate requirements', () => {
    const report = analyzeJob('Requirements\n- Python, SQL, and Spark')
    expect(report.requirements.map((r) => r.ids).sort()).toEqual([['python'], ['spark'], ['sql']])
  })

  it('splits "SQL and Python or R" at the "and"', () => {
    const report = analyzeJob('Requirements\n- SQL and Python or R\n- Excel')
    expect(find(report, 'sql').ids).toEqual(['sql'])
    expect(find(report, 'r').ids).toEqual(['python', 'r'])
  })

  it('treats a list of examples as alternatives', () => {
    const report = analyzeJob('Requirements\n- BI tools (e.g., Tableau, Qlik)\n- SQL\n- Excel')
    expect(find(report, 'tableau').ids).toEqual(['tableau', 'other-bi'])
  })

  it('does not score degree or certification lines', () => {
    const report = analyzeJob('Kualifikasi\n- Minimal S1 Statistika atau jurusan terkait\n- SQL\n- Excel\n- Python')
    expect(find(report, 'statistics')).toBeUndefined()
    expect(report.notScored).toBe(1)
  })

  it('does not mistake role titles, reporting lines or places for skills', () => {
    const report = analyzeJob(`Requirements
- Reports to the Head of Data
- Work closely with data scientists
- Based in West Java
- SQL, Python and Excel`)
    expect(find(report, 'reporting')).toBeUndefined()
    expect(find(report, 'data-science')).toBeUndefined()
    expect(find(report, 'java')).toBeUndefined()
    expect(report.requirements).toHaveLength(3)
  })

  it('names the role, seniority included', () => {
    expect(analyzeJob('Senior Data Analyst\nRequirements\n- SQL').title).toBe('Senior Data Analyst')
    expect(analyzeJob('Lowongan: Data Analyst\nKualifikasi\n- SQL').title).toBe('Data Analyst')
    expect(analyzeJob('Requirements\n- SQL').title).toBeNull()
  })

  it('splits a single-paragraph paste into sentences', () => {
    const report = analyzeJob(
      'We are hiring a data scientist for our analytics team. You will build machine learning models in Python or R and work with SQL every day. Experience with AWS/GCP/Azure is preferred. You will present findings in Tableau, Power BI, or Looker. We offer a competitive salary and a friendly team.',
    )
    expect(find(report, 'python').ids).toEqual(['python', 'r'])
    expect(find(report, 'aws').tier).toBe('nice')
    expect(find(report, 'power-bi').ids).toEqual(['tableau', 'power-bi', 'looker'])
  })

  it('refuses to score a text with too few requirements', () => {
    expect(analyzeJob('').enough).toBe(false)
    const report = analyzeJob('We are hiring a friendly person who enjoys Python.')
    expect(report.enough).toBe(false)
    expect(report.score).toBeNull()
  })

  it('shows the gaps on a role the portfolio does not cover', () => {
    const report = analyzeJob(`Backend Engineer (Java)
Requirements
- 3+ years with Java and Spring Boot
- Designing microservices and REST APIs
- Kafka or RabbitMQ
- Docker, Kubernetes and AWS
- PostgreSQL or MySQL`)
    expect(report.title).toBe('Backend Engineer')
    expect(report.score).toBeLessThan(40)
    expect(report.label).toBe('Stretch role')
    expect(report.counts.gap).toBeGreaterThanOrEqual(5)
  })
})

describe('sample job descriptions', () => {
  it.each(sampleJobs.map((s) => [s.label, s]))('%s reads as a fair test, gaps included', (_, sample) => {
    const report = analyzeJob(sample.text)
    expect(report.requirements.length).toBeGreaterThanOrEqual(8)
    expect(report.counts.gap, 'a sample with no gaps reads as rigged').toBeGreaterThan(0)
    expect(report.score).toBeGreaterThanOrEqual(40)
    expect(report.score).toBeLessThanOrEqual(95)
    expect(report.title).toBeTruthy()
    expect(report.topProjects).toHaveLength(3)
  })
})

describe('words for the recruiter', () => {
  const report = analyzeJob(sampleJobs[0].text)

  it('writes a forwardable summary with absolute links', () => {
    const text = summaryText(report, { site: 'https://example.test/site' })
    expect(text).not.toMatch(/undefined|null|NaN/)
    expect(text).toContain(`${report.score}%`)
    expect(text).toMatch(/https:\/\/example\.test\/site\/project\/[a-z0-9-]+\//)
    expect(text).toMatch(/not uploaded/i)
  })

  it('drafts an email and a WhatsApp message that name the role', () => {
    expect(emailDraft(report).subject).toContain(report.title)
    expect(emailDraft(report).body).toContain(`${report.score}%`)
    expect(whatsappDraft(report)).toContain(report.title)
  })
})
