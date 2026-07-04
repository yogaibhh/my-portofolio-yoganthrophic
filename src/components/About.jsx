export default function About() {
  const stats = [
    { value: '3+', label: 'Years of Experience' },
    { value: '40%', label: 'Pipeline Optimization' },
    { value: '4', label: 'LLM Providers Integrated' },
  ]

  return (
    <section id="about" className="bg-canvas py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section heading */}
        <div className="mb-12">
          <h2>About Me</h2>
          <div className="w-16 h-[3px] bg-primary mt-4"></div>
        </div>

        {/* Bio */}
        <div className="max-w-3xl mb-16">
          <p className="text-body text-lg leading-relaxed mb-6">
            I'm an AI/ML-focused engineer based in Bogor, Indonesia, with hands-on experience
            training and deploying edge-inference models (PyTorch, TensorFlow Lite),
            integrating multiple LLM providers (OpenAI, Groq, OpenRouter, Deepgram) into
            production tooling, and building agentic data workflows with the Model Context
            Protocol (MCP).
          </p>
          <p className="text-body text-lg leading-relaxed">
            I currently own full-stack scope — frontend, backend, and database — in an AI
            Native engineering track, having shipped a standardized full-stack boilerplate
            that replaced a fragmented internal dashboard system. My background in data
            engineering (Python ETL pipelines, Elasticsearch, PostgreSQL) gives me a practical
            foundation for building the data layer that AI systems depend on. I graduated
            from IPB University with a degree in Applied Meteorology, GPA 3.67/4.00.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-card rounded-xl p-8 text-center"
            >
              <div className="text-4xl font-display text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
