/* Sample job descriptions for the fit check, so a visitor without a posting
   to hand can still see how the report reads.

   Written from scratch for this site; they describe no real company. Each
   one asks for a few things the portfolio does not show (Docker, causal
   inference, Google Analytics…), on purpose: a sample that scored a clean
   hundred would read as rigged, and the tests keep it that way. */

const sampleJobs = [
  {
    id: 'ai-engineer',
    label: 'AI Engineer',
    text: `AI Engineer, LLM Applications

About the role
You will build LLM-powered features and internal agents that work on real company data, from the first prototype to production.

What you'll do
- Integrate LLM APIs (OpenAI, Anthropic) into internal tools and customer-facing features
- Build agent workflows with tool calling and the Model Context Protocol
- Design retrieval-augmented generation (RAG) over internal documents
- Put guardrails around what agents are allowed to read and write
- Ship features end to end, from a React front end to Python services on FastAPI

Requirements
- 2+ years of professional experience with Python
- Hands-on experience with LLM APIs and prompt engineering
- Solid SQL, ideally with PostgreSQL
- Familiarity with Docker and CI/CD pipelines
- Comfortable with Git and code review

Nice to have
- Vector databases such as pgvector or Pinecone
- LangChain or LlamaIndex
- Experience deploying ML models to edge or mobile devices
- AWS or GCP

Benefits
- Remote-friendly team and flexible hours
- Yearly learning budget`,
  },
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    text: `Data Scientist, Customer Analytics

What you'll do
- Build churn and propensity models that the retention team acts on every week
- Explain what drives each model to non-technical stakeholders
- Design A/B tests to measure the impact of retention offers
- Put models into production with Docker on AWS
- Turn model output into dashboards the business can use without you

Qualifications
- Strong Python, including pandas, NumPy and scikit-learn
- Solid statistics: hypothesis testing, cross-validation and model evaluation
- Feature engineering on messy tabular data
- SQL for pulling and shaping your own data
- Experience with XGBoost or LightGBM

Preferred
- Spark or Databricks
- Time series forecasting
- Causal inference or uplift modelling
- Tableau or Power BI

What we offer
- Hybrid working, three days in the office
- Health insurance for you and your family`,
  },
  {
    id: 'data-analyst',
    label: 'Data Analyst',
    text: `Data Analyst, Sales & BI

Responsibilities
- Own weekly and monthly sales reporting across regions and channels
- Build and maintain dashboards in Power BI
- Answer ad-hoc business questions with SQL
- Automate recurring reports that are still built by hand in Excel

Requirements
- Advanced SQL, including window functions and CTEs
- Advanced Excel: pivot tables and lookups
- Experience with Tableau or Looker for self-serve reporting
- Comfortable designing A/B tests for promotions
- Understanding of sales KPIs in FMCG or retail
- Python for data cleaning and analysis is a plus

Nice to have
- dbt or Airflow
- BigQuery or Snowflake
- Google Analytics 4

Benefits
- Hybrid working from our Jakarta office`,
  },
  {
    id: 'data-analyst-id',
    label: 'Data Analyst (Bahasa Indonesia)',
    text: `Lowongan: Data Analyst

Tanggung Jawab
- Menyusun laporan penjualan mingguan dan bulanan untuk tim manajemen
- Membangun dan memelihara dashboard di Power BI atau Looker Studio
- Menjawab pertanyaan bisnis menggunakan SQL
- Otomatisasi laporan rutin yang masih dibuat manual di Excel

Kualifikasi
- Minimal S1 Statistika, Matematika, Teknik Informatika, atau jurusan terkait
- Menguasai SQL dan Microsoft Excel (pivot table, VLOOKUP)
- Terbiasa menggunakan Looker Studio atau Tableau
- Pengalaman menggunakan Python (pandas) untuk pembersihan data
- Memahami visualisasi data dan mampu menyampaikan insight dengan jelas
- Pengalaman di industri FMCG atau retail

Nilai Plus
- Pengalaman dengan Google Cloud Platform (BigQuery)
- Familiar dengan Tableau
- Pengalaman dengan Google Analytics

Benefit
- BPJS Kesehatan dan Ketenagakerjaan
- Hybrid working`,
  },
]

export function getSampleJob(id) {
  return sampleJobs.find((s) => s.id === id) ?? null
}

export default sampleJobs
