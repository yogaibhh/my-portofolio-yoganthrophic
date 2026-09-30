/* The vocabulary the job fit check reads with (/fit, and the skill rows on
   the recruiter briefs).

   Each entry is one skill as a job description would name it:

   - `terms`     How it is written, lowercase. A space also matches a hyphen
                 ("power bi" matches "Power-BI"), a hyphen is optional
                 ("scikit-learn" matches "scikit learn"), and a plural "s"
                 is allowed automatically. A RegExp covers anything that
                 needs more than that.
   - `related`   Skills that transfer to this one. When a job asks for it
                 and the site shows no direct evidence, but does show one of
                 these, the requirement reads "Transferable" rather than
                 "Not yet".
   - `implies`   Evidence for this skill also counts for these: PostgreSQL
                 work is SQL work.
   - `evidence`  Curated proof for concepts no tag or stack item names:
                 'project:<slug>', 'dashboard:<id>' or 'section:github'.
                 These are claims about the work, so the tests check that
                 each one points at a real page.

   Everything else is read from the tags, case-study stacks, job history,
   dashboard tech lists and certifications in the other data files, so
   adding a project feeds the fit check without touching this file.

   Skills the portfolio does not show (AWS, Docker, Airflow, Tableau…) are
   listed on purpose. Leaving them out would not hide the gap, it would drop
   the requirement from the score and make the fit look better than it is.

   Terms stay specific. Bare words that mean something else in a job ad
   ("cloud", "agent", "report", "climate", "mapping") are left out, because
   one stray match turns into a requirement nobody wrote. */

const taxonomy = [
  /* ── Languages ─────────────────────────────────────────── */
  { id: 'python', label: 'Python', terms: ['python', 'python3', 'python 3'] },
  {
    id: 'sql',
    label: 'SQL',
    terms: ['sql', 't-sql', 'tsql', 'pl/sql', 'plsql', 'window function', 'cte', 'common table expression', 'structured query language', 'sql queries', 'kueri sql'],
  },
  {
    id: 'r',
    label: 'R',
    terms: ['r programming', 'r language', 'rstudio', 'tidyverse', 'ggplot2', 'dplyr', 'r shiny'],
    /* A bare "R" only counts next to another analysis language, so "R&D"
       or a stray initial never reads as a requirement. */
    letter: { char: 'r', near: ['python', 'sql', 'sas', 'spss', 'stata', 'julia', 'matlab', 'scala'] },
    related: ['python'],
  },
  { id: 'javascript', label: 'JavaScript', terms: ['javascript', 'js', 'ecmascript', 'es6'] },
  { id: 'typescript', label: 'TypeScript', terms: ['typescript'], implies: ['javascript'] },
  { id: 'node', label: 'Node.js', terms: ['node.js', 'nodejs', 'node js', /node\s?\d{2}\+?/], implies: ['javascript'] },
  { id: 'dart', label: 'Dart', terms: ['dart'] },
  { id: 'java', label: 'Java', terms: ['java', 'jvm', 'java ee'] },
  { id: 'scala', label: 'Scala', terms: ['scala'] },
  { id: 'go', label: 'Go', terms: ['golang', 'go language', 'go programming'] },
  { id: 'cpp', label: 'C++', terms: ['c++', 'cpp'] },
  { id: 'csharp', label: 'C# / .NET', terms: ['c#', '.net', 'dotnet', 'asp.net'] },
  { id: 'php', label: 'PHP', terms: ['php', 'laravel'] },
  { id: 'ruby', label: 'Ruby', terms: ['ruby', 'ruby on rails'] },
  { id: 'rust', label: 'Rust', terms: ['rust'] },
  { id: 'matlab', label: 'MATLAB', terms: ['matlab'], related: ['python'] },
  { id: 'stats-packages', label: 'SAS / SPSS / Stata', terms: ['sas', 'spss', 'stata', 'eviews'], related: ['python', 'statistics'] },
  { id: 'powershell', label: 'PowerShell', terms: ['powershell'] },
  {
    id: 'shell',
    label: 'Linux & shell scripting',
    terms: ['linux', 'unix', 'bash', 'shell scripting', 'shell script', 'command line'],
    related: ['powershell'],
  },

  /* ── Data libraries & notebooks ────────────────────────── */
  { id: 'pandas', label: 'pandas', terms: ['pandas'] },
  { id: 'numpy', label: 'NumPy', terms: ['numpy'] },
  { id: 'dataframes-at-scale', label: 'Polars / Dask', terms: ['polars', 'dask', 'modin', 'vaex'], related: ['pandas'] },
  { id: 'matplotlib', label: 'matplotlib', terms: ['matplotlib'], implies: ['data-visualization'] },
  { id: 'seaborn', label: 'seaborn', terms: ['seaborn'], related: ['matplotlib'] },
  { id: 'plotly', label: 'Plotly / Bokeh', terms: ['plotly', 'bokeh', 'altair'], related: ['matplotlib', 'recharts'] },
  { id: 'streamlit', label: 'Streamlit / Gradio', terms: ['streamlit', 'gradio', 'plotly dash'], related: ['dashboards', 'python', 'react'] },
  { id: 'notebooks', label: 'Jupyter / Colab', terms: ['jupyter', 'jupyterlab', 'jupyter notebook', 'google colab', 'colab', 'ipython'] },
  { id: 'scipy', label: 'SciPy / statsmodels', terms: ['scipy', 'statsmodels'], related: ['statistics', 'numpy'] },

  /* ── Machine learning ──────────────────────────────────── */
  {
    id: 'machine-learning',
    label: 'Machine learning',
    terms: [
      'machine learning', 'ml', 'ai/ml', 'ml/ai', 'predictive model', 'predictive modeling', 'predictive modelling',
      'predictive analytics', 'prediction model', 'propensity model', 'classification model', 'classifier',
      'supervised learning', 'random forest', 'logistic regression', 'pembelajaran mesin',
    ],
  },
  { id: 'scikit-learn', label: 'scikit-learn', terms: ['scikit-learn', 'sklearn'], implies: ['machine-learning'] },
  {
    id: 'gradient-boosting',
    label: 'Gradient boosting',
    terms: ['gradient boosting', 'gradient-boosted', 'boosted trees', 'gbm', 'gbdt'],
    implies: ['machine-learning'],
    evidence: ['project:telco-churn-prediction'],
  },
  { id: 'xgboost', label: 'XGBoost / LightGBM', terms: ['xgboost', 'lightgbm', 'catboost'], related: ['gradient-boosting', 'scikit-learn'] },
  {
    id: 'model-evaluation',
    label: 'Model evaluation',
    terms: [
      'model evaluation', 'model validation', 'cross-validation', 'roc-auc', 'auc', 'f1 score', 'confusion matrix',
      'evaluation metric', 'precision and recall', 'precision/recall',
    ],
    evidence: ['project:telco-churn-prediction'],
  },
  {
    id: 'feature-engineering',
    label: 'Feature engineering',
    terms: ['feature engineering', 'feature selection', 'feature extraction'],
    evidence: ['project:telco-churn-prediction', 'dashboard:karhutla-fire-risk'],
  },
  {
    id: 'explainability',
    label: 'Model explainability',
    terms: ['explainability', 'explainable ai', 'xai', 'interpretability', 'interpretable', 'feature importance', 'permutation importance', 'model explanation'],
  },
  { id: 'shap', label: 'SHAP / LIME', terms: ['shap', 'shapley', 'lime'], related: ['explainability'] },
  {
    id: 'statistics',
    label: 'Statistics',
    terms: [
      'statistics', 'statistical', 'statistical analysis', 'statistical modeling', 'statistical modelling', 'hypothesis testing',
      'inferential statistics', 'descriptive statistics', 'regression analysis', 'probability', 'statistik', 'statistika',
    ],
    evidence: ['project:telco-churn-prediction', 'project:indonesia-earthquake-analysis'],
  },
  { id: 'bayesian', label: 'Bayesian methods', terms: ['bayesian', 'pymc', 'probabilistic programming'], related: ['statistics'] },
  {
    id: 'ab-testing',
    label: 'A/B testing',
    terms: ['a/b test', 'a/b testing', 'ab test', 'ab testing', 'split test', 'split testing', 'experimentation', 'controlled experiment', 'online experiment', 'uji a/b'],
    related: ['statistics'],
  },
  {
    id: 'causal-inference',
    label: 'Causal inference',
    terms: ['causal inference', 'causal', 'uplift model', 'uplift modeling', 'uplift modelling', 'difference-in-differences', 'propensity score'],
  },
  {
    id: 'time-series',
    label: 'Time-series analysis',
    terms: ['time series', 'deret waktu', 'temporal analysis', 'trend analysis', 'seasonality'],
    evidence: ['project:indonesia-earthquake-analysis', 'dashboard:dki-jakarta-air-quality'],
  },
  {
    id: 'forecasting',
    label: 'Forecasting',
    terms: ['forecasting', 'forecast', 'demand forecasting', 'arima', 'sarima', 'prophet', 'peramalan'],
    related: ['time-series', 'machine-learning'],
  },
  {
    id: 'deep-learning',
    label: 'Deep learning',
    terms: ['deep learning', 'neural network', 'neural net', 'cnn', 'rnn', 'lstm', 'transformer model', 'transformer architecture', 'pembelajaran mendalam'],
    related: ['pytorch', 'tflite'],
  },
  { id: 'pytorch', label: 'PyTorch', terms: ['pytorch', 'torch'], implies: ['machine-learning'] },
  { id: 'tensorflow', label: 'TensorFlow / Keras', terms: ['tensorflow', 'keras', 'tf.keras'], related: ['tflite', 'pytorch'] },
  { id: 'tflite', label: 'TensorFlow Lite', terms: ['tensorflow lite', 'tflite', 'tf lite', 'litert'] },
  { id: 'onnx', label: 'ONNX / TensorRT', terms: ['onnx', 'tensorrt', 'openvino', 'coreml', 'core ml'], related: ['tflite', 'quantization'] },
  {
    id: 'edge-ai',
    label: 'Edge / on-device ML',
    terms: [
      'edge ai', 'edge ml', 'edge inference', 'edge computing', 'edge deployment', 'on-device', 'tinyml', 'embedded ml', 'mobile ml',
      /edge (?:or mobile )?devices?/,
    ],
  },
  { id: 'quantization', label: 'Model quantization', terms: ['quantization', 'quantisation', 'quantized', 'quantised', 'model compression'] },
  {
    id: 'model-deployment',
    label: 'Deploying ML models',
    terms: [
      'model deployment', 'deploy models', 'deploying models', 'deploy ml models', 'deploying ml models', 'deploy machine learning models',
      'model serving', 'ml deployment', 'productionize', 'productionise', 'production ml', 'ml in production', 'models in production',
      'models into production', 'models to production',
    ],
    evidence: ['project:cloud-seeding-hunter'],
  },
  {
    id: 'mlops',
    label: 'MLOps tooling',
    terms: [
      'mlops', 'ml ops', 'mlflow', 'kubeflow', 'sagemaker', 'vertex ai', 'bentoml', 'experiment tracking', 'experiment tracker',
      'model registry', 'weights & biases', 'wandb', 'model monitoring',
    ],
    related: ['model-deployment', 'testing'],
  },
  {
    id: 'computer-vision',
    label: 'Computer vision',
    terms: ['computer vision', 'image classification', 'object detection', 'image segmentation', 'image recognition', 'opencv', 'yolo', 'image processing', 'visi komputer'],
    related: ['pytorch', 'tflite', 'remote-sensing'],
  },
  {
    id: 'nlp',
    label: 'NLP',
    terms: [
      'nlp', 'natural language processing', 'text classification', 'named entity recognition', 'ner', 'sentiment analysis', 'text mining',
      'topic modeling', 'topic modelling', 'text analytics', 'pemrosesan bahasa alami',
    ],
    related: ['llm'],
  },
  {
    id: 'speech-ai',
    label: 'Speech AI',
    terms: ['speech to text', 'automatic speech recognition', 'asr', 'transcription', 'voice ai', 'text to speech', 'tts', 'whisper', 'deepgram'],
  },
  { id: 'hugging-face', label: 'Hugging Face', terms: ['hugging face', 'huggingface', 'transformers library', 'hf transformers'], related: ['pytorch', 'llm'] },
  {
    id: 'recommender',
    label: 'Recommender systems',
    terms: ['recommender system', 'recommender', 'recommendation system', 'recommendation engine', 'collaborative filtering'],
    related: ['machine-learning'],
  },
  {
    id: 'document-ai',
    label: 'OCR / document AI',
    terms: ['ocr', 'optical character recognition', 'document ai', 'intelligent document processing', 'document understanding'],
    related: ['llm', 'data-cleaning'],
  },
  { id: 'reinforcement-learning', label: 'Reinforcement learning', terms: ['reinforcement learning'] },
  {
    id: 'optimization',
    label: 'Optimisation / operations research',
    terms: ['operations research', 'linear programming', 'mathematical optimization', 'optimization modeling', 'gurobi', 'or-tools', 'pulp'],
  },

  /* ── LLMs & agents ─────────────────────────────────────── */
  {
    id: 'llm',
    label: 'LLM integration',
    terms: [
      'llm', 'large language model', 'genai', 'gen ai', 'generative ai', 'gpt', 'chatgpt', 'foundation model', 'llm api',
      'llm-powered', 'llm application', 'ai generatif',
    ],
  },
  { id: 'openai', label: 'OpenAI API', terms: ['openai', 'open ai', 'openai api', 'azure openai'], implies: ['llm'] },
  { id: 'claude', label: 'Anthropic Claude', terms: ['claude', 'anthropic', 'claude code'], implies: ['llm'] },
  {
    id: 'other-llms',
    label: 'Gemini / Llama / Mistral',
    terms: ['gemini', 'llama', 'mistral', 'cohere', 'qwen', 'deepseek', 'bedrock', 'ollama', 'vllm'],
    related: ['llm', 'openai'],
  },
  { id: 'groq-openrouter', label: 'Groq / OpenRouter', terms: ['groq', 'openrouter'], implies: ['llm'] },
  { id: 'llmops', label: 'LLMOps', terms: ['llmops', 'llm ops', 'llm operations', 'llm deployment'], implies: ['llm'] },
  {
    id: 'prompt-engineering',
    label: 'Prompt engineering',
    terms: ['prompt engineering', 'prompting', 'prompt design', 'context engineering', 'system prompt'],
    /* Agent skills are structured instructions an LLM follows; writing and
       testing three of them is prompt engineering by another name. */
    evidence: ['project:clean-data-skill', 'project:build-dashboard-skill', 'project:powerbi-dashboard-skill'],
  },
  {
    id: 'agents',
    label: 'AI agents & tool calling',
    terms: [
      'ai agent', 'agentic', 'autonomous agent', 'agent framework', 'agent workflow', 'agentic workflow', 'multi-agent system',
      'tool calling', 'tool use', 'function calling', 'agent skill', 'agen ai',
    ],
  },
  { id: 'mcp', label: 'Model Context Protocol', terms: ['mcp', 'model context protocol', 'mcp server'], implies: ['agents'] },
  { id: 'hermes', label: 'Hermes Agent', terms: ['hermes agent', 'hermes'], implies: ['agents', 'self-hosting'] },
  {
    id: 'langchain',
    label: 'LangChain / LlamaIndex',
    terms: ['langchain', 'langgraph', 'llamaindex', 'llama index', 'crewai', 'autogen', 'semantic kernel', 'haystack', 'dspy', 'pydantic ai'],
    related: ['agents', 'mcp', 'llm'],
  },
  {
    id: 'rag',
    label: 'RAG',
    terms: ['rag', 'retrieval augmented generation', 'retrieval augmented'],
    related: ['llm', 'elasticsearch'],
  },
  {
    id: 'vector-search',
    label: 'Vector search & embeddings',
    terms: [
      'vector database', 'vector db', 'vector store', 'vector search', 'embedding', 'embedding model', 'semantic search',
      'pgvector', 'pinecone', 'weaviate', 'qdrant', 'milvus', 'chroma', 'chromadb', 'faiss',
    ],
    related: ['elasticsearch', 'postgresql'],
  },
  {
    id: 'fine-tuning',
    label: 'Fine-tuning',
    terms: ['fine-tuning', 'fine-tune', 'lora', 'qlora', 'peft', 'rlhf', 'instruction tuning', 'sft'],
    related: ['pytorch', 'llm'],
  },
  {
    id: 'ai-guardrails',
    label: 'AI guardrails & sandboxing',
    terms: ['guardrails', 'guard rails', 'prompt injection', 'ai safety', 'llm safety', 'responsible ai', 'sandboxing', 'sandboxed', 'least privilege'],
    evidence: ['project:mcp-ai-data-analyst'],
  },
  {
    id: 'llm-evals',
    label: 'LLM evaluation',
    terms: ['llm evaluation', 'llm evals', 'evals', 'eval harness', 'evaluation harness', 'llm-as-a-judge', 'offline evals', 'offline evaluation'],
    related: ['ai-guardrails', 'testing', 'model-evaluation'],
  },
  {
    id: 'ai-coding',
    label: 'AI-assisted development',
    terms: [
      'ai-assisted', 'code generation', 'copilot', 'github copilot', 'cursor ai', 'cursor ide', 'ai coding', 'ai-generated code',
      'ai pair programming', 'vibe coding',
    ],
  },
  {
    id: 'chatbots',
    label: 'Chatbots & assistants',
    terms: ['chatbot', 'conversational ai', 'virtual assistant', 'chat assistant', 'ai assistant'],
    related: ['llm', 'agents'],
    /* Hermes answers the team in Telegram, Slack and Discord. */
    evidence: ['project:hermes-agent'],
  },
  {
    id: 'ai-engineering',
    label: 'Applied AI engineering',
    terms: ['ai engineering', 'applied ai', 'ai native', 'ai native engineer', 'ml engineering', 'machine learning engineering'],
  },

  /* ── Data engineering ──────────────────────────────────── */
  { id: 'data-engineering', label: 'Data engineering', terms: ['data engineering', 'rekayasa data'] },
  {
    id: 'etl',
    label: 'ETL / data pipelines',
    terms: ['etl', 'elt', 'etl pipeline', 'data pipeline', 'pipeline data', 'data ingestion', 'ingestion pipeline', 'data integration'],
    implies: ['data-engineering'],
  },
  {
    id: 'orchestration',
    label: 'Airflow / orchestration',
    terms: ['airflow', 'apache airflow', 'dagster', 'prefect', 'luigi', 'workflow orchestration', 'orchestration tool'],
    related: ['etl', 'automation'],
  },
  { id: 'dbt', label: 'dbt', terms: ['dbt', 'data build tool'], related: ['sql', 'etl'] },
  {
    id: 'spark',
    label: 'Spark / big data',
    terms: ['spark', 'pyspark', 'apache spark', 'spark sql', 'hadoop', 'hive', 'big data', 'mapreduce'],
    related: ['pandas', 'etl'],
  },
  { id: 'databricks', label: 'Databricks', terms: ['databricks', 'delta lake', 'lakehouse'] },
  {
    id: 'streaming',
    label: 'Kafka / streaming',
    terms: ['kafka', 'rabbitmq', 'kinesis', 'pub/sub', 'pubsub', 'event streaming', 'stream processing', 'streaming data', 'flink', 'message queue', 'message broker'],
  },
  {
    id: 'data-warehouse',
    label: 'Data warehousing',
    terms: [
      'data warehouse', 'data warehousing', 'data mart', 'star schema', 'snowflake schema', 'dimensional model', 'dimensional modeling',
      'dimensional modelling', 'fact table', 'kimball', 'gudang data',
    ],
    implies: ['data-modeling'],
  },
  {
    id: 'data-modeling',
    label: 'Data modelling',
    terms: ['data modeling', 'data modelling', 'data model', 'schema design', 'database design', 'database schema', 'erd'],
  },
  {
    id: 'data-quality',
    label: 'Data quality & validation',
    terms: ['data quality', 'data validation', 'quality gate', 'data testing', 'data integrity', 'kualitas data', 'validasi data'],
    evidence: ['project:weather-etl-pipeline', 'project:clean-data-skill'],
  },
  {
    id: 'data-quality-tools',
    label: 'Great Expectations / Soda',
    terms: ['great expectations', 'soda core', 'dbt tests', 'pandera', 'deequ'],
    related: ['data-quality', 'testing'],
  },
  {
    id: 'data-governance',
    label: 'Data governance & privacy',
    terms: ['data governance', 'data lineage', 'data catalog', 'data catalogue', 'master data management', 'gdpr', 'data privacy'],
  },
  {
    id: 'data-cleaning',
    label: 'Data cleaning & wrangling',
    terms: [
      'data cleaning', 'data cleansing', 'data wrangling', 'data preparation', 'data preprocessing', 'data pre-processing', 'data munging',
      'cleaning data', 'pembersihan data',
    ],
  },
  { id: 'unstructured-data', label: 'Unstructured data', terms: ['unstructured data', 'semi-structured data', 'data tidak terstruktur'] },
  {
    id: 'web-scraping',
    label: 'Web scraping',
    terms: ['web scraping', 'scraping', 'web crawling', 'crawler', 'beautifulsoup', 'scrapy', 'selenium', 'playwright'],
    related: ['api-integration', 'python'],
  },
  {
    id: 'api-integration',
    label: 'API integration',
    terms: ['api', 'api integration', 'rest api', 'restful', 'web api', 'third-party api', 'http api', 'json api'],
    evidence: ['project:weather-etl-pipeline', 'project:indonesia-earthquake-analysis', 'project:ai-screen-reader'],
  },
  { id: 'python-web', label: 'FastAPI / Flask / Django', terms: ['fastapi', 'flask', 'django', 'starlette'], related: ['python', 'api-integration', 'backend'] },
  { id: 'spring', label: 'Spring Boot', terms: ['spring boot', 'spring framework', 'spring mvc'] },
  {
    id: 'microservices',
    label: 'Microservices',
    terms: ['microservice', 'microservice architecture', 'distributed system', 'grpc', 'service mesh'],
  },
  { id: 'graphql', label: 'GraphQL', terms: ['graphql'], related: ['api-integration'] },
  {
    id: 'testing',
    label: 'Automated testing',
    terms: [
      'unit test', 'unit testing', 'pytest', 'tdd', 'test-driven', 'automated testing', 'automated test', 'integration test',
      'integration testing', 'test coverage', 'smoke test', 'jest', 'vitest', 'pengujian unit',
    ],
  },
  {
    id: 'ci-cd',
    label: 'CI/CD',
    terms: [
      'ci/cd', 'cicd', 'ci cd', 'continuous integration', 'continuous delivery', 'continuous deployment', 'github actions', 'gitlab ci',
      'jenkins', 'ci pipeline', 'circleci',
    ],
    related: ['git', 'testing'],
  },
  {
    id: 'git',
    label: 'Git & version control',
    terms: ['git', 'github', 'gitlab', 'bitbucket', 'version control', 'source control'],
    evidence: ['section:github'],
  },
  {
    id: 'docker',
    label: 'Docker / containers',
    terms: ['docker', 'container', 'containerization', 'containerisation', 'containerized', 'containerised', 'docker compose', 'podman'],
  },
  { id: 'kubernetes', label: 'Kubernetes', terms: ['kubernetes', 'k8s', 'helm', 'openshift', 'eks', 'gke', 'aks'] },
  { id: 'iac', label: 'Terraform / IaC', terms: ['terraform', 'infrastructure as code', 'iac', 'pulumi', 'cloudformation', 'ansible'] },
  {
    id: 'self-hosting',
    label: 'Self-hosted deployment',
    terms: ['self-hosted', 'self-hosting', 'on-premise', 'on-prem', 'private deployment'],
  },

  /* ── Cloud & databases ─────────────────────────────────── */
  { id: 'aws', label: 'AWS', terms: ['aws', 'amazon web services', 's3', 'ec2', 'aws lambda', 'redshift', 'aws glue', 'athena'] },
  {
    id: 'gcp',
    label: 'Google Cloud',
    terms: ['gcp', 'google cloud', 'google cloud platform', 'cloud run', 'cloud functions', 'dataflow', 'dataproc', 'cloud storage'],
    related: ['google-earth-engine'],
  },
  { id: 'azure', label: 'Microsoft Azure', terms: ['azure', 'microsoft azure', 'azure data factory', 'azure synapse', 'synapse analytics'] },
  {
    id: 'cloud',
    label: 'Cloud platforms',
    terms: ['cloud platform', 'cloud computing', 'cloud service', 'cloud infrastructure', 'cloud environment', 'cloud-native', 'komputasi awan'],
    related: ['google-earth-engine'],
  },
  { id: 'bigquery', label: 'BigQuery', terms: ['bigquery', 'big query'], related: ['sql', 'postgresql'] },
  { id: 'snowflake', label: 'Snowflake', terms: ['snowflake'], related: ['sql', 'data-warehouse'] },
  { id: 'postgresql', label: 'PostgreSQL', terms: ['postgresql', 'postgres', 'psql'], implies: ['sql', 'relational-db'] },
  { id: 'mysql', label: 'MySQL', terms: ['mysql', 'mariadb'], related: ['postgresql', 'sql'] },
  { id: 'sql-server', label: 'SQL Server', terms: ['sql server', 'mssql', 'ms sql', 'ssis', 'ssrs', 'ssas'], related: ['postgresql', 'sql'] },
  { id: 'oracle', label: 'Oracle Database', terms: ['oracle', 'oracle database', 'oracle db'], related: ['postgresql', 'sql'] },
  { id: 'sqlite', label: 'SQLite', terms: ['sqlite'], implies: ['sql', 'relational-db'] },
  { id: 'relational-db', label: 'Relational databases', terms: ['relational database', 'relational db', 'rdbms', 'basis data relasional'] },
  {
    id: 'nosql',
    label: 'NoSQL / MongoDB',
    terms: ['nosql', 'mongodb', 'mongo', 'dynamodb', 'cassandra', 'couchdb', 'firestore', 'document database', 'document store'],
    related: ['elasticsearch'],
  },
  { id: 'redis', label: 'Redis', terms: ['redis', 'memcached'] },
  {
    id: 'elasticsearch',
    label: 'Elasticsearch',
    terms: ['elasticsearch', 'elastic search', 'elastic stack', 'lucene', 'opensearch', 'elk', 'elk stack'],
  },
  { id: 'kibana', label: 'Kibana / Grafana', terms: ['kibana', 'grafana'], related: ['elasticsearch', 'dashboards'] },
  { id: 'graph-db', label: 'Graph databases', terms: ['neo4j', 'graph database', 'cypher'] },
  { id: 'erp', label: 'ERP systems', terms: ['erp', 'enterprise resource planning'] },
  { id: 'sap', label: 'SAP', terms: ['sap', 'sap hana', 's/4hana', 'sap bw'] },
  { id: 'crm', label: 'CRM (Salesforce, HubSpot)', terms: ['crm', 'salesforce', 'hubspot', 'dynamics 365'] },
  {
    id: 'automation',
    label: 'Workflow & report automation',
    terms: [
      'automation', 'automate', 'automated', 'automating', 'workflow automation', 'process automation', 'otomatisasi', 'otomasi',
      'cron', 'cron job', 'scheduled job',
    ],
  },
  {
    id: 'rpa',
    label: 'RPA / no-code automation',
    terms: ['rpa', 'robotic process automation', 'uipath', 'power automate', 'zapier', 'n8n', 'make.com', 'automation anywhere'],
    related: ['automation'],
  },

  /* ── BI & analytics ────────────────────────────────────── */
  { id: 'business-intelligence', label: 'Business intelligence', terms: ['business intelligence', 'bi', 'bi tool', 'bi reporting', 'bi platform'] },
  { id: 'power-bi', label: 'Power BI', terms: ['power bi', 'powerbi', 'pbix', 'pbir', 'pbip'], implies: ['business-intelligence', 'dashboards'] },
  { id: 'fabric', label: 'Microsoft Fabric', terms: ['microsoft fabric', 'ms fabric', 'fabric workspace'] },
  { id: 'dax', label: 'DAX / Power Query', terms: ['dax', 'power query', 'power pivot', 'm language'], related: ['power-bi', 'excel'] },
  { id: 'tableau', label: 'Tableau', terms: ['tableau'], related: ['power-bi', 'data-visualization'] },
  {
    id: 'looker',
    label: 'Looker / Looker Studio',
    terms: ['looker', 'looker studio', 'google data studio', 'data studio'],
    related: ['power-bi', 'data-visualization'],
  },
  {
    id: 'other-bi',
    label: 'Qlik / Metabase / Superset',
    terms: ['qlik', 'qlikview', 'qlik sense', 'metabase', 'superset', 'apache superset', 'redash', 'sisense', 'domo', 'spotfire'],
    related: ['power-bi', 'data-visualization'],
  },
  {
    id: 'excel',
    label: 'Excel',
    /* "spreadsheet" alone is left out: the job history mentions cleaning
       spreadsheets as a file format, which says nothing about Excel. */
    terms: [
      'excel', 'microsoft excel', 'ms excel', 'spreadsheet skill', 'spreadsheet software', 'spreadsheet tool', 'spreadsheet modeling',
      'spreadsheet modelling', 'advanced spreadsheet', 'sumifs', 'averageifs', 'excel formula', 'advanced excel', 'xlsxwriter', 'openpyxl',
    ],
  },
  {
    id: 'excel-advanced',
    label: 'Pivot tables, lookups & VBA',
    terms: ['pivot table', 'pivottable', 'vlookup', 'xlookup', 'hlookup', 'index match', 'index/match', 'lookup', 'vba', 'macros', 'excel macro'],
    related: ['excel'],
  },
  { id: 'google-sheets', label: 'Google Sheets', terms: ['google sheet', 'gsheets', 'google spreadsheet'] },
  {
    id: 'data-visualization',
    label: 'Data visualisation',
    terms: [
      'data visualization', 'data visualisation', 'data viz', 'dataviz', 'visualization', 'visualisation', 'visualisasi data', 'visualisasi',
      'charting', 'chart', 'infographic', 'data storytelling', 'storytelling with data', 'sankey',
    ],
  },
  { id: 'dashboards', label: 'Dashboards', terms: ['dashboard', 'dashboarding', 'dasbor', 'monitoring dashboard'] },
  {
    id: 'reporting',
    label: 'Reporting',
    terms: [
      'reporting', 'reports', 'laporan', 'pelaporan', 'report automation', 'automated reporting', 'automated report', 'management report',
      'ad-hoc report', 'ad hoc report',
    ],
  },
  {
    id: 'kpi',
    label: 'KPIs & business metrics',
    terms: ['kpi', 'key performance indicator', 'business metric', 'okr', 'north star metric', 'metric definition', 'metrics definition'],
    evidence: ['project:fmcg-excel-dashboard', 'project:build-dashboard-skill', 'dashboard:fmcg-sales-performance'],
  },
  {
    id: 'eda',
    label: 'Exploratory data analysis',
    terms: ['eda', 'exploratory data analysis', 'exploratory analysis', 'data exploration', 'analisis eksploratif'],
    implies: ['data-analysis'],
  },
  {
    id: 'data-analysis',
    label: 'Data analysis',
    terms: [
      'data analysis', 'data analytics', 'analytics', 'data analyst', 'analisis data', 'analisa data', 'quantitative analysis',
      'ad-hoc analysis', 'ad hoc analysis', 'business analytics',
    ],
  },
  {
    id: 'data-science',
    label: 'Data science',
    terms: ['data science', 'data scientist', 'sains data', 'ilmu data'],
  },
  {
    id: 'web-analytics',
    label: 'Web & product analytics',
    terms: ['google analytics', 'ga4', 'adobe analytics', 'mixpanel', 'amplitude', 'web analytics', 'product analytics', 'google tag manager'],
  },
  {
    id: 'customer-analytics',
    label: 'Churn & customer analytics',
    terms: [
      'churn', 'customer churn', 'churn prediction', 'churn analysis', 'retention analysis', 'customer retention', 'customer analytics',
      'customer segmentation', 'cohort analysis', 'customer lifetime value', 'clv', 'ltv', 'rfm',
    ],
    implies: ['data-analysis'],
    evidence: ['project:chinook-sql-analytics'],
  },

  /* ── Frontend & apps ───────────────────────────────────── */
  { id: 'react', label: 'React', terms: ['react', 'react.js', 'reactjs', 'react js', 'react hooks'], implies: ['javascript', 'html-css', 'frontend'] },
  { id: 'react-native', label: 'React Native', terms: ['react native'], related: ['react', 'flutter'] },
  {
    id: 'js-frameworks',
    label: 'Vue / Angular / Next.js',
    terms: ['vue', 'vue.js', 'vuejs', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt'],
    related: ['react'],
  },
  { id: 'html-css', label: 'HTML & CSS', terms: ['html', 'css', 'html5', 'css3', 'tailwind', 'tailwindcss', 'sass', 'scss'] },
  {
    id: 'frontend',
    label: 'Frontend development',
    terms: ['frontend', 'front end', 'web development', 'web app', 'web application', 'ui development', 'pengembangan web'],
  },
  { id: 'backend', label: 'Backend development', terms: ['backend', 'back end', 'server-side'] },
  { id: 'full-stack', label: 'Full-stack development', terms: ['full-stack', 'fullstack'] },
  { id: 'recharts', label: 'Recharts', terms: ['recharts'], implies: ['data-visualization'] },
  {
    id: 'js-charting',
    label: 'D3 / JS charting',
    terms: ['d3', 'd3.js', 'chart.js', 'chartjs', 'echarts', 'highcharts', 'nivo', 'vega-lite', 'vega'],
    related: ['recharts', 'data-visualization'],
  },
  { id: 'flutter', label: 'Flutter', terms: ['flutter'], implies: ['dart', 'mobile'] },
  {
    id: 'mobile',
    label: 'Mobile apps',
    terms: ['mobile app', 'mobile application', 'mobile development', 'android', 'ios', 'aplikasi mobile', 'cross-platform mobile'],
  },
  {
    id: 'native-mobile',
    label: 'Native iOS / Android',
    terms: ['kotlin', 'swiftui', 'jetpack compose', 'objective-c', 'android studio'],
    related: ['flutter'],
  },
  { id: 'electron', label: 'Desktop apps (Electron)', terms: ['electron', 'electron.js', 'desktop app', 'desktop application'] },
  {
    id: 'ui-ux',
    label: 'UI/UX design',
    terms: ['figma', 'ui/ux', 'ux design', 'ui design', 'user research', 'wireframing', 'wireframe', 'usability testing'],
  },

  /* ── Geospatial & domains ──────────────────────────────── */
  {
    id: 'geospatial',
    label: 'Geospatial analysis',
    terms: [
      'geospatial', 'gis', 'spatial analysis', 'spatial data', 'geographic information system', 'geodata', 'location data',
      'location intelligence', 'geospasial', 'sistem informasi geografis', 'spasial',
    ],
  },
  { id: 'arcgis', label: 'ArcGIS', terms: ['arcgis', 'arcgis pro', 'arcmap', 'esri'], implies: ['geospatial'] },
  { id: 'qgis', label: 'QGIS', terms: ['qgis'], related: ['arcgis', 'geospatial'] },
  {
    id: 'web-maps',
    label: 'Web maps (Mapbox, Leaflet)',
    terms: ['mapbox', 'mapbox gl', 'leaflet', 'openstreetmap', 'osm', 'web map', 'web mapping', 'interactive map'],
    implies: ['geospatial'],
  },
  {
    id: 'other-web-maps',
    label: 'OpenLayers / deck.gl / Cesium',
    terms: ['openlayers', 'kepler.gl', 'deck.gl', 'cesium', 'arcgis js', 'google maps api'],
    related: ['web-maps'],
  },
  {
    id: 'google-earth-engine',
    label: 'Google Earth Engine',
    terms: ['google earth engine', 'earth engine', 'gee'],
    implies: ['remote-sensing', 'geospatial'],
  },
  {
    id: 'remote-sensing',
    label: 'Remote sensing & satellite data',
    terms: [
      'remote sensing', 'satellite imagery', 'satellite data', 'satellite image', 'earth observation', 'sentinel-2', 'landsat', 'modis',
      'penginderaan jauh', 'citra satelit',
    ],
  },
  {
    id: 'geo-python',
    label: 'GeoPandas / PostGIS / GDAL',
    terms: ['geopandas', 'postgis', 'shapely', 'gdal', 'rasterio', 'geoserver', 'xarray'],
    related: ['geospatial', 'pandas', 'postgresql'],
  },
  {
    id: 'meteorology',
    label: 'Weather & climate data',
    terms: [
      'meteorology', 'meteorological', 'weather', 'weather data', 'climate data', 'climate science', 'climate change', 'climate risk',
      'climatology', 'atmospheric', 'hydrometeorology', 'hydrometeorological', 'rainfall', 'precipitation', 'cloud seeding',
      'weather modification', 'nasa power', 'open-meteo', 'era5', 'bmkg', 'meteorologi', 'cuaca', 'data iklim', 'perubahan iklim',
      'klimatologi', 'curah hujan',
    ],
  },
  {
    id: 'air-quality',
    label: 'Air quality & environmental data',
    terms: [
      'air quality', 'air pollution', 'pm2.5', 'pm10', 'aerosol', 'emission monitoring', 'environmental monitoring', 'environmental data',
      'kualitas udara', 'polusi udara',
    ],
  },
  {
    id: 'natural-hazards',
    label: 'Natural hazards (seismic, fire)',
    terms: [
      'earthquake', 'seismic', 'seismology', 'seismicity', 'natural hazard', 'disaster risk', 'disaster management', 'wildfire',
      'forest fire', 'fire risk', 'karhutla', 'usgs', 'bencana', 'kebencanaan', 'gempa', 'kebakaran hutan',
    ],
  },
  {
    id: 'flood',
    label: 'Flood & hydrology',
    terms: ['flood', 'flooding', 'flood risk', 'hydrology', 'hydrological', 'banjir', 'hidrologi'],
    related: ['natural-hazards', 'meteorology'],
  },
  { id: 'telco', label: 'Telecom domain', terms: ['telco', 'telecom', 'telecommunication', 'telekomunikasi'] },
  {
    id: 'retail',
    label: 'Retail / FMCG domain',
    terms: [
      'fmcg', 'retail', 'cpg', 'consumer goods', 'e-commerce', 'sales analytics', 'sales analysis', 'sales performance', 'sales data',
      'penjualan',
    ],
  },
  {
    id: 'simulation',
    label: 'Simulation modelling',
    terms: ['simulation', 'multi-agent simulation', 'agent-based model', 'agent-based modeling', 'agent-based modelling', 'simulasi'],
  },
]

export const taxonomyById = new Map(taxonomy.map((entry) => [entry.id, entry]))

export default taxonomy
