/* Single source of truth for every piece of personal content on the site.
   Edit here — components only handle presentation. */

export const profile = {
  name: 'Muhamad Yoga Ibrahim',
  shortName: 'Yoga Ibrahim',
  initials: 'YI',
  roles: ['AI Engineer', 'Data Scientist', 'Data Analyst', 'ML Practitioner'],
  tagline: 'AI Engineer · Data Scientist · Data Analyst',
  location: 'Bogor, Indonesia',
  timezone: 'Asia/Jakarta',
  email: 'yoga.ibh205@gmail.com',
  phone: '+62 812-9235-8420',
  availability: 'Open to AI/ML, Data Science & Data Analyst roles',
  cvFile: 'Muhamad_Yoga_Ibrahim_CV_AI_Engineer.pdf',
  githubUser: 'yogaibhh',
  summary:
    'AI/ML engineer building edge-inference models, integrating LLM providers (OpenAI, Groq, OpenRouter, Deepgram) into production tooling, and shipping agentic workflows with the Model Context Protocol — backed by a data engineering foundation in Python, Elasticsearch, and PostgreSQL.',
  bio: [
    "I'm an AI/ML-focused engineer based in Bogor, Indonesia, with hands-on experience training and deploying edge-inference models (PyTorch, TensorFlow Lite), integrating multiple LLM providers into production tooling, and building agentic data workflows with the Model Context Protocol (MCP).",
    'I currently own full-stack scope — frontend, backend, and database — in an AI Native engineering track, having shipped a standardized full-stack boilerplate that replaced a fragmented internal dashboard system. My background in data engineering (Python ETL pipelines, Elasticsearch, PostgreSQL) gives me a practical foundation for building the data layer that AI systems depend on.',
  ],
  now: [
    'Migrating a fragmented internal BI system onto one AI-generated full-stack boilerplate',
    'Researching multi-format data cleaning — documents, spreadsheets, audio, satellite imagery',
    'Building MCP servers that let agents query production data under strict read-only scope',
  ],
}

export const socials = [
  { label: 'GitHub', href: 'https://github.com/yogaibhh', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhamadyogaibra', icon: 'linkedin' },
  { label: 'Email', href: 'mailto:yoga.ibh205@gmail.com', icon: 'mail' },
]

export const stats = [
  { value: 3, suffix: '+', label: 'Years of experience', hint: 'Data analyst → data scientist → AI native engineer' },
  { value: 40, suffix: '%', label: 'Faster reporting', hint: 'Automated meteorological data workflows' },
  { value: 4, suffix: '', label: 'LLM providers integrated', hint: 'OpenAI · Groq · OpenRouter · Deepgram' },
  { value: 9, suffix: '', label: 'Live dashboards shipped', hint: 'Interactive demos you can open on this site' },
]

export const experiences = [
  {
    role: 'AI Native Engineer',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'Jun 2026 — Present',
    current: true,
    stack: ['React', 'Python', 'LLM APIs', 'PostgreSQL'],
    bullets: [
      'Own full-stack scope (frontend, backend, database) building applied-AI "skills" that automate internal engineering workflows, moving beyond a data-scientist-only remit',
      'Migrating a fragmented internal BI-style dashboard system into a standardized full-stack boilerplate built through AI-assisted code generation, making bug handling faster and more consistent across dashboards',
      'Researching additional applied-AI capabilities: multi-format data cleaning (documents, spreadsheets, video, audio, satellite imagery), handwritten-document extraction from scanned PDFs, and Google Earth Engine code generation',
    ],
  },
  {
    role: 'Data Scientist',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'Oct 2025 — Jun 2026',
    stack: ['Python', 'Elasticsearch', 'Mapbox GL', 'Google Earth Engine'],
    bullets: [
      'Engineered Python-based ETL pipelines to parse and normalize high-volume unstructured data feeding the National Stability Index and NPI predictive models',
      'Built React-based geospatial monitoring dashboards backed by Elasticsearch/Lucene queries and Mapbox GL, rendering real-time spatial and network-flow (Sankey) data for security operations',
      'Developed a fire-risk prediction model (Karhutla) using Google Earth Engine and NASA POWER meteorological data',
      'Prototyped AI-agent-assisted dashboard and template generation for internal ERP tooling — an early version of the full-stack standardization work later formalized in the AI Native role',
    ],
  },
  {
    role: 'Data Analyst',
    company: 'PT Pixel Digital (PT Ebdesk Teknologi)',
    location: 'Tangerang',
    period: 'May — Oct 2025',
    stack: ['PostgreSQL', 'Python', 'BI'],
    bullets: [
      'Integrated multi-agent simulation outputs into PostgreSQL, connecting raw simulation logs to downstream visualization layers',
      'Built dashboards tracking trade patterns and geopolitical trends for stakeholder use',
    ],
  },
  {
    role: 'Data Analyst',
    company: 'Anugerah Wisesa Selaras (weathermod.id)',
    location: 'Bandung',
    period: 'Oct — Dec 2024',
    stack: ['Python', 'Google Colab', 'Excel'],
    bullets: [
      'Processed and analyzed 480+ hours of weather data in Python (Google Colab) and Excel, automating cleaning and visualization workflows',
      'Cut reporting time by 40% through automated data processing workflows for large meteorological datasets',
    ],
  },
  {
    role: 'Research Assistant',
    company: 'PIAREA Environment & Technology',
    location: 'Bogor',
    period: 'Sep — Oct 2023',
    stack: ['Excel', 'ArcGIS'],
    bullets: [
      'Processed 175,000+ hourly weather data points (10 years, rainfall & temperature) in Excel',
      'Compiled the 2023 DKI Jakarta Air Quality Monitoring Map Album across 20+ monitoring locations',
    ],
  },
]

export const projectCategories = ['All', 'AI & LLM', 'Machine Learning', 'Data Analysis', 'Data Engineering']

export const projects = [
  {
    title: 'Cloud Seeding Hunter',
    blurb: 'Offline edge-ML classifier + Flutter field app for cloud-seeding crews.',
    description:
      'Trained and deployed a lightweight edge-inference classification model (PyTorch, TensorFlow Lite) for offline, on-device predictions in remote areas. Built the end-to-end Flutter mobile app, including an interactive geospatial tracking dashboard for the field engineering team.',
    tags: ['Flutter', 'PyTorch', 'TensorFlow Lite', 'Edge AI', 'Geospatial'],
    category: 'Machine Learning',
    metric: { value: '100%', label: 'offline inference' },
    featured: true,
    icon: 'cloud',
    link: '',
  },
  {
    title: 'AI Screen Reader',
    blurb: 'Cross-platform desktop agent that reads and explains on-screen context.',
    description:
      'Electron/React desktop app integrating multiple LLM providers (Deepgram, Groq, OpenRouter) to read and interpret on-screen visual context automatically, with API credential handling across a compiled cross-platform executable.',
    tags: ['Electron', 'React', 'Deepgram', 'Groq', 'OpenRouter'],
    category: 'AI & LLM',
    metric: { value: '3', label: 'LLM providers' },
    featured: true,
    icon: 'eye',
    link: '',
  },
  {
    title: 'MCP AI Data Analyst',
    blurb: 'Natural-language SQL over a live database, sandboxed to read-only.',
    description:
      'Configured Model Context Protocol (MCP) to connect a local PostgreSQL instance for real-time, natural-language querying of production tables — scoped to a strict read-only role to sandbox all AI operations. Public SQLite demo implementation on GitHub.',
    tags: ['MCP', 'PostgreSQL', 'AI Agent', 'Python'],
    category: 'AI & LLM',
    metric: { value: 'read-only', label: 'agent scope' },
    featured: true,
    icon: 'terminal',
    link: 'https://github.com/yogaibhh/mcp-sqlite-analyst',
  },
  {
    title: 'Telco Customer Churn Prediction',
    blurb: 'Three-model churn comparison on 7,043 subscribers, 0.84 ROC-AUC.',
    description:
      'End-to-end churn analysis of 7,043 telecom customers: EDA of churn drivers, sklearn preprocessing pipelines, and a three-model comparison reaching 0.84 ROC-AUC — permutation importance points to tenure, fiber-optic service, and month-to-month contracts.',
    tags: ['Python', 'scikit-learn', 'Machine Learning', 'EDA'],
    category: 'Machine Learning',
    metric: { value: '0.84', label: 'ROC-AUC' },
    icon: 'chart',
    link: 'https://github.com/yogaibhh/telco-churn-prediction',
  },
  {
    title: 'Music Store SQL Analytics',
    blurb: 'Twelve business questions answered in pure SQL — CTEs and window functions.',
    description:
      'Twelve business questions answered in pure SQL on the Chinook database — CTEs, window functions (LAG, ROW_NUMBER, running totals), and multi-table joins — surfacing revenue concentration, catalog dead stock, and customer lifetime value.',
    tags: ['SQL', 'SQLite', 'Window Functions', 'Data Analysis'],
    category: 'Data Analysis',
    metric: { value: '12', label: 'business questions' },
    icon: 'database',
    link: 'https://github.com/yogaibhh/chinook-sql-analytics',
  },
  {
    title: 'Weather ETL Pipeline',
    blurb: 'Idempotent API-to-warehouse pipeline with data-quality gates and 17 tests.',
    description:
      'Production-style ETL from the Open-Meteo API into a SQLite dim/fact warehouse for five Indonesian cities (4,560 daily rows): retry/backoff extraction, data-quality gates, idempotent upserts, logging, and 17 unit tests.',
    tags: ['Python', 'ETL', 'SQLite', 'Data Engineering'],
    category: 'Data Engineering',
    metric: { value: '17', label: 'unit tests' },
    icon: 'pipeline',
    link: 'https://github.com/yogaibhh/weather-etl-pipeline',
  },
  {
    title: 'Indonesia Earthquake Analysis',
    blurb: 'Gutenberg-Richter b-value fitting across 10,294 M4.5+ events.',
    description:
      'Geospatial EDA of 10,294 M4.5+ earthquakes from the USGS catalog (2015–2026): Gutenberg-Richter b-value fitting, depth profiling, and a spatial map tracing the Sunda subduction zone.',
    tags: ['Python', 'Geospatial', 'EDA', 'USGS API'],
    category: 'Data Analysis',
    metric: { value: '10,294', label: 'events analysed' },
    icon: 'globe',
    link: 'https://github.com/yogaibhh/indonesia-earthquake-analysis',
  },
  {
    title: 'FMCG Sales Dashboard (Excel)',
    blurb: 'Excel BI dashboard generated end-to-end by a reproducible Python workflow.',
    description:
      'Interactive Excel dashboard built from cleaned FMCG transaction data — KPI cards, charts, and a real dropdown-driven filter wired to SUMIFS/AVERAGEIFS formulas, generated end-to-end with a reproducible Python workflow.',
    tags: ['Excel', 'Python', 'Data Visualization', 'BI'],
    category: 'Data Analysis',
    metric: { value: '1 script', label: 'fully reproducible' },
    icon: 'grid',
    link: 'https://github.com/yogaibhh/fmcg-dashboard-excel-testing',
  },
]

export const skillGroups = [
  {
    title: 'AI / ML',
    icon: 'spark',
    accent: 'primary',
    skills: [
      { name: 'LLM API integration', detail: 'OpenAI · Groq · OpenRouter · Deepgram', level: 90 },
      { name: 'Model Context Protocol', detail: 'Agentic tool servers, read-only scoping', level: 85 },
      { name: 'PyTorch & TensorFlow Lite', detail: 'Training → quantised edge inference', level: 78 },
      { name: 'scikit-learn', detail: 'Pipelines, model comparison, explainability', level: 82 },
    ],
  },
  {
    title: 'Data Engineering',
    icon: 'pipeline',
    accent: 'teal',
    skills: [
      { name: 'Python', detail: 'Pandas · NumPy · requests · pytest', level: 92 },
      { name: 'SQL & PostgreSQL', detail: 'CTEs, window functions, schema design', level: 88 },
      { name: 'Elasticsearch', detail: 'Lucene queries, aggregations', level: 75 },
      { name: 'ETL design', detail: 'Idempotent loads, quality gates, retries', level: 84 },
    ],
  },
  {
    title: 'Frontend & Apps',
    icon: 'code',
    accent: 'violet',
    skills: [
      { name: 'React', detail: 'Hooks, routing, data-viz dashboards', level: 85 },
      { name: 'Recharts & D3-style viz', detail: 'BI charts, Sankey, maps', level: 80 },
      { name: 'Flutter (Dart)', detail: 'Field apps with on-device ML', level: 70 },
      { name: 'Electron', detail: 'Cross-platform desktop packaging', level: 68 },
    ],
  },
  {
    title: 'Geospatial',
    icon: 'globe',
    accent: 'amber',
    skills: [
      { name: 'Google Earth Engine', detail: 'Satellite composites, fire-risk modelling', level: 80 },
      { name: 'Mapbox GL & Leaflet', detail: 'Real-time spatial monitoring layers', level: 82 },
      { name: 'ArcGIS', detail: 'Cartography and map album production', level: 65 },
      { name: 'NASA POWER / USGS APIs', detail: 'Meteorological & seismic feeds', level: 78 },
    ],
  },
]

/* Flat list used by the tech marquee */
export const techMarquee = [
  'Python', 'PyTorch', 'TensorFlow Lite', 'scikit-learn', 'Pandas', 'NumPy',
  'PostgreSQL', 'Elasticsearch', 'SQL', 'MCP', 'OpenAI', 'Groq', 'OpenRouter',
  'Deepgram', 'React', 'Recharts', 'Flutter', 'Electron', 'Google Earth Engine',
  'Mapbox GL', 'Leaflet', 'Vite', 'Git',
]

export const education = {
  school: 'IPB University',
  location: 'Bogor, Indonesia',
  degree: 'Applied Meteorology',
  period: '2020 — 2024',
  gpa: '3.67 / 4.00',
  activities: [
    'Research assistant and presenter at international conferences',
    'Treasurer and PKM team leader',
    'Presented on the AOD–PM relationship in Jakarta',
  ],
}

export const certifications = [
  { name: 'Associate Data Analyst in Python', issuer: 'DataCamp' },
  { name: 'Associate Data Analyst in PowerBI', issuer: 'DataCamp' },
  { name: 'Working with the OpenAI API', issuer: 'DataCamp', year: '2025' },
  { name: 'Associate Business Analyst in SQL', issuer: 'DataCamp', year: '2025' },
  { name: 'Associate Data Analyst in SQL', issuer: 'DataCamp', year: '2025' },
  { name: 'Data Analyst — Generasi Gigih 3.0', issuer: 'GoTo Impact Foundation', year: '2023' },
]

export const awards = [
  { title: 'Finalist, National Infographic Competition', org: 'Agrocompetition', year: '2022' },
  { title: 'Presenter, Indonesian Aerosol Association Conference', org: 'IAA', year: '2024' },
  { title: 'Best Member, Special Team Division', org: 'PSN', year: '2021' },
]
