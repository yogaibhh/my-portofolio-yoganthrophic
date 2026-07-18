import Reveal from './Reveal'

const skillCategories = [
  {
    title: 'AI / ML',
    skills: ['LLM API Integration (OpenAI, Groq, OpenRouter, Deepgram)', 'Model Context Protocol (MCP)', 'PyTorch & TensorFlow Lite', 'Edge AI Inference', 'Agentic Workflows'],
  },
  {
    title: 'Full-Stack & Data Engineering',
    skills: ['Python (Pandas, NumPy)', 'SQL & PostgreSQL', 'Elasticsearch & Lucene Queries', 'ETL Pipeline Design'],
  },
  {
    title: 'Systems & Frontend',
    skills: ['JavaScript (React)', 'Dart (Flutter)', 'Electron'],
  },
  {
    title: 'Geospatial',
    skills: ['Google Earth Engine (GEE)', 'Mapbox GL', 'ArcGIS'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="bg-surface-card py-24">
      <Reveal className="max-w-[1200px] mx-auto px-6">
        {/* Section heading */}
        <div className="mb-12">
          <h2>Skills & Expertise</h2>
          <div className="w-16 h-[3px] bg-primary mt-4"></div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className="bg-canvas rounded-xl p-6"
            >
              <h3 className="text-ink text-lg font-body font-semibold mb-4">
                {category.title}
              </h3>

              <ul className="space-y-3">
                {category.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-teal shrink-0"></span>
                    <span className="text-body text-sm">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
