const skillCategories = [
  {
    title: 'Languages & Dev',
    skills: ['Python (Pandas, NumPy)', 'SQL', 'JavaScript (React)', 'Dart (Flutter)'],
  },
  {
    title: 'Geospatial',
    skills: ['Google Earth Engine', 'Mapbox GL', 'ArcGIS', 'NASA POWER'],
  },
  {
    title: 'Data Infrastructure',
    skills: ['Elasticsearch', 'Lucene Queries', 'ETL Automation', 'PostgreSQL'],
  },
  {
    title: 'AI & Analytics',
    skills: ['Predictive Modeling', 'AI Agent Integration', 'Spatial Data Engineering', 'Statistical Analysis'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="bg-surface-card py-24">
      <div className="max-w-[1200px] mx-auto px-6">
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
      </div>
    </section>
  )
}
