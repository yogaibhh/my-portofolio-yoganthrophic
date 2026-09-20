/* Long-form case studies, keyed by the `slug` on each entry in `projects`
   (src/data/profile.js). A project without an entry here still renders its
   card, it just has no "Read the case study" link.

   Every figure below is sourced from the project's own repository README or
   from the CV. A study that is still waiting on a real measurement carries a
   `pendingMetric` line, which renders only while running the dev server, so
   the published page never advertises a gap. */

const caseStudies = {
  /* ------------------------------------------------------------------ */
  'cloud-seeding-hunter': {
    tagline:
      'An offline edge-ML classifier, and the Flutter field app that puts it in a pilot’s hands.',
    role: 'ML engineer & mobile developer',
    context: [
      'Cloud-seeding operations happen where the weather is, which in Indonesia usually means somewhere a mobile signal does not reach. A crew in the air or on a remote strip cannot wait on a round trip to a server to find out whether the cloud in front of them is worth seeding.',
      'That one constraint drove the whole design. The model had to run on the device, the app had to work with no connection, and the interface had to be readable by someone who was already busy doing something else.',
    ],
    challenge:
      'Put a usable classification model on a phone that may have no network for an entire sortie, and wrap it in a field app the engineering crew actually wants to open.',
    approach: [
      {
        title: 'Train for the target, not the benchmark',
        body: 'I built and trained the classifier in PyTorch, then converted it to TensorFlow Lite so inference runs on the device. The conversion step is a design constraint rather than an afterthought: model size and operator support decide what architecture is worth training in the first place.',
      },
      {
        title: 'Quantise down to a phone budget',
        body: 'The exported TFLite artifact is quantised so it fits comfortably inside a mobile app bundle and returns a prediction fast enough to feel instant. There is no inference server anywhere in the path.',
      },
      {
        title: 'Build the app around the field, not the demo',
        body: 'I developed the Flutter application end to end, including an interactive geospatial tracking dashboard so the engineering team can see where the aircraft has been and what got classified where.',
      },
      {
        title: 'Assume the network is gone',
        body: 'Every prediction path works offline. Connectivity is a bonus for syncing later, never a prerequisite for the core job.',
      },
    ],
    results: [
      { value: '100%', label: 'offline inference', note: 'No server call in the prediction path' },
      { value: 'On-device', label: 'TFLite runtime', note: 'Quantised from a PyTorch model' },
      { value: 'End-to-end', label: 'ownership', note: 'Model, conversion, app and dashboard' },
    ],
    lessons: [
      'The deployment target belongs in the training decision. Picking an architecture first and worrying about TFLite conversion later is how you end up retraining.',
      'For a field tool, "works with no signal" beats almost any accuracy improvement you could offer instead.',
    ],
    stack: [
      { group: 'Model', items: ['PyTorch', 'TensorFlow Lite', 'Quantisation'] },
      { group: 'App', items: ['Flutter', 'Dart', 'Geospatial tracking'] },
    ],
    links: [],
    privateWork: true,
  },

  /* ------------------------------------------------------------------ */
  'ai-screen-reader': {
    tagline:
      'A cross-platform desktop agent that reads what is on your screen and explains it.',
    role: 'Full-stack / AI engineer',
    context: [
      'Plenty of AI assistants can answer a question you type. Far fewer can answer a question about the thing you are looking at right now, without you having to describe it first.',
      'This desktop agent closes that gap. It captures on-screen visual context by itself and routes it through several LLM providers, so the answer shows up in the same place the work is happening.',
    ],
    challenge:
      'Read and interpret arbitrary on-screen context in real time, across operating systems, while keeping API credentials safe inside a compiled binary that users install themselves.',
    approach: [
      {
        title: 'Pick a shell that ships everywhere',
        body: 'Electron with a React interface, so a single codebase compiles to a cross-platform executable instead of becoming a separate native app per operating system.',
      },
      {
        title: 'Route across three providers',
        body: 'Deepgram, Groq and OpenRouter sit behind one interface. Providers win at different things (transcription, latency, model breadth), and being able to route between them beats being stuck with whichever one you picked first.',
      },
      {
        title: 'Handle credentials like they matter',
        body: 'Distributing a desktop binary means anything bundled at build time is readable by whoever installs it, so credential handling became an architecture question rather than a config file.',
      },
      {
        title: 'Read the screen automatically',
        body: 'The agent captures and interprets visual context on its own. The user never has to describe, crop or paste what they are looking at.',
      },
    ],
    results: [
      { value: '3', label: 'LLM providers', note: 'Deepgram · Groq · OpenRouter' },
      { value: 'Cross-platform', label: 'single binary', note: 'Compiled from one Electron codebase' },
      { value: 'Automatic', label: 'context capture', note: 'No manual describing or pasting' },
    ],
    lessons: [
      'Multi-provider routing is cheap to build early and expensive to retrofit. Abstracting the provider on day one paid for itself the first time one of them changed its terms.',
      'Desktop distribution changes the threat model. What is safe in a server-side app is not safe in a binary sitting on someone else’s laptop.',
    ],
    stack: [
      { group: 'App', items: ['Electron', 'React', 'Cross-platform packaging'] },
      { group: 'AI', items: ['Deepgram', 'Groq', 'OpenRouter'] },
    ],
    links: [],
    privateWork: true,
  },

  /* ------------------------------------------------------------------ */
  'mcp-ai-data-analyst': {
    tagline:
      'Natural-language SQL over a live database, with a sandbox that makes writes physically impossible.',
    role: 'AI engineer',
    context: [
      'Handing an LLM agent direct database access is powerful and dangerous in equal measure. Agents run on natural language, so a prompt injection, a hallucinated query or a plain misunderstanding can turn "analyze my orders" into `DROP TABLE orders`.',
      'The position this project takes is that an analysis agent should be physically incapable of writing to the database, not simply instructed not to. The production version runs against PostgreSQL. The public repository is a runnable SQLite demo, so anyone can clone it and have a queryable database in seconds.',
    ],
    challenge:
      'Give an AI agent real, useful access to production tables through the Model Context Protocol, while guaranteeing that no sequence of tool calls can modify a single row.',
    approach: [
      {
        title: 'Four purpose-built tools, not one SQL hole',
        body: 'The server exposes `list_tables`, `describe_table`, `run_query` and `table_stats` over MCP via stdio. Narrow, typed tools give the agent the shape of the data without handing it an unbounded console.',
      },
      {
        title: 'Layer 1: read-only at the storage layer',
        body: 'The database file opens with the URI flag `mode=ro`, so the process never holds a writable handle in the first place.',
      },
      {
        title: 'Layer 2: read-only at the engine layer',
        body: '`PRAGMA query_only = ON` makes the SQL engine itself refuse data-modifying statements. Every tool call runs on a fresh connection, so the pragma is always reapplied and an earlier call cannot disable it.',
      },
      {
        title: 'Layer 3: validation at the application layer',
        body: 'Comments get stripped by a literal-aware scanner so a write cannot hide behind `/* … */`. Multi-statement smuggling like `SELECT 1; DELETE …` is rejected, the first keyword has to be SELECT, WITH, EXPLAIN or PRAGMA, and PRAGMA assignments are rejected too.',
      },
      {
        title: 'Layer 4: a cap on the context',
        body: 'Results truncate at 200 rows, so one call can neither flood the model’s context window nor pull an entire table out in a single shot. Queries abort after 5 seconds, and table names are matched against the real schema instead of being interpolated into SQL.',
      },
      {
        title: 'Prove it, do not claim it',
        body: 'The smoke test spawns the server as a real MCP subprocess and actively tries `DELETE FROM customers`, `DROP TABLE orders`, multi-statement smuggling and a PRAGMA downgrade. All of them have to be rejected. It ends at 13 passed, 0 failed out of 13 checks.',
      },
    ],
    results: [
      { value: '4', label: 'independent sandbox layers', note: 'Any one failing still leaves the data untouchable' },
      { value: '13/13', label: 'smoke-test checks pass', note: 'Including four real attack attempts' },
      { value: '200', label: 'row cap per call', note: 'Bounds both context blowup and exfiltration' },
      { value: '5s', label: 'query timeout', note: 'Enforced by a SQLite progress handler' },
    ],
    lessons: [
      'Defense in depth only means something if each layer holds on its own. The value here is not that there are four checks, it is that any three of them can fail and the database is still safe.',
      'A security claim you have never attacked is just a hope. Making the test suite actually run `DROP TABLE` is what turned the sandbox from a design note into something I can stand behind.',
    ],
    stack: [
      { group: 'Protocol', items: ['Model Context Protocol', 'MCP Python SDK', 'stdio transport'] },
      { group: 'Data', items: ['PostgreSQL (production)', 'SQLite (public demo)'] },
      { group: 'Language', items: ['Python 3.10+'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/mcp-sqlite-analyst', kind: 'github' },
      { label: 'Model Context Protocol', href: 'https://modelcontextprotocol.io', kind: 'external' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'hermes-agent': {
    tagline:
      'Self-hosting an open-source autonomous agent and wiring it into a real engineering team’s week.',
    role: 'AI Native Engineer, deployment & integration',
    /* This is an integration case study, not an authorship claim: the framework
       is Nous Research's, the rollout is mine. */
    credit: {
      label: 'Framework by Nous Research',
      body: 'Hermes Agent is an open-source, MIT-licensed autonomous agent released by Nous Research in February 2026. This case study covers deploying and integrating it. The framework itself is theirs.',
      href: 'https://github.com/NousResearch/hermes-agent',
    },
    context: [
      'A lot of engineering time goes into work that is repetitive rather than hard. The same report pulled every week, the same checks run before a release, the same context explained again to a chat window that forgot it yesterday.',
      'Hermes Agent is built for that shape of problem. It runs as an always-on self-hosted service instead of a per-session chat tool, keeps a multi-layer memory across sessions, and writes reusable skills from tasks it has already done. That last part is the one that matters here: recurring work gets cheaper every time it runs.',
    ],
    challenge:
      'Take an open-source agent framework from "interesting repo" to something a team leans on during the working day, without sending internal data to somebody else’s cloud.',
    approach: [
      {
        title: 'Self-host so the data stays in',
        body: 'Hermes runs on our own infrastructure rather than as a SaaS subscription. No telemetry and no cloud lock-in, which is the only reason it is viable for internal engineering data at all.',
      },
      {
        title: 'Point it at the models we already use',
        body: 'The framework is provider-agnostic across Nous Portal, OpenRouter, OpenAI or a custom endpoint, and models switch with `hermes model` without a code change. That suits an environment where provider choice moves with cost and availability.',
      },
      {
        title: 'Extend it through MCP',
        body: 'Hermes supports MCP servers, which is exactly where my earlier read-only database work plugs in. The agent gets real query access to internal data through tools that cannot write to it.',
      },
      {
        title: 'Let the recurring work become skills',
        body: 'The learning loop writes a reusable skill after a complex task and refines it during later use. Instead of re-prompting the same workflow every week, the workflow turns into a procedure the agent owns.',
      },
      {
        title: 'Put it where the team already talks',
        body: 'One gateway process reaches Telegram, Discord, Slack, WhatsApp, Signal and the CLI with conversation continuity across all of them, plus a built-in cron scheduler for recurring reports described in plain language.',
      },
    ],
    results: [
      { value: 'Self-hosted', label: 'runtime', note: 'Internal infrastructure, no third-party cloud' },
      { value: '40+', label: 'tools available to the agent', note: 'Plus MCP servers for internal systems' },
      { value: 'Cross-session', label: 'memory', note: 'FTS5 session search with LLM summarisation' },
      {
        value: 'Any model',
        label: 'provider-agnostic',
        note: 'Switched with one command, no code change',
      },
    ],
    /* Shown only while running the dev server, so the live page never
       advertises a gap. Replace it with a real figure and a results tile
       once the speed-up has been measured. */
    pendingMetric:
      'Add the measured speed-up on recurring engineering work: which workflows, and how much time they save.',
    lessons: [
      'The interesting part of adopting an agent framework is not the install. It is working out which workflows repeat often enough to be worth turning into a skill.',
      'Self-hosting is what makes an agent usable on internal data. The moment an answer requires shipping context to an outside service, half the useful questions become unaskable.',
    ],
    stack: [
      { group: 'Agent', items: ['Hermes Agent', 'Skills (agentskills.io)', 'MCP servers'] },
      { group: 'Models', items: ['Provider-agnostic', 'OpenRouter', 'OpenAI'] },
      { group: 'Delivery', items: ['Messaging gateway', 'Cron scheduling', 'CLI'] },
    ],
    links: [
      { label: 'Hermes Agent (Nous Research)', href: 'https://github.com/NousResearch/hermes-agent', kind: 'github' },
    ],
    privateWork: true,
  },

  /* ------------------------------------------------------------------ */
  'telco-churn-prediction': {
    tagline:
      'Ranking 7,043 subscribers by churn risk, and finding out a regularised linear model beats both ensembles.',
    role: 'Data scientist',
    context: [
      'Churn is one of the most expensive problems a subscription business has. Winning a new telecom customer costs far more than keeping one you already have, so spotting who is about to leave before they cancel means the retention budget goes to targeted offers instead of being sprayed at everyone.',
      'The project answers two questions rather than one. Who is likely to churn, and why, in terms a retention team can act on.',
    ],
    challenge:
      'Build a leak-free classifier on the IBM Telco dataset (7,043 customers, 26.5% churn) that ranks risk well and explains itself.',
    approach: [
      {
        title: 'Explore before modelling',
        body: 'Churn rate by contract, tenure, internet service and payment method, spending distributions, and numeric correlations. The signal turned out to be concentrated and legible rather than subtle.',
      },
      {
        title: 'Keep the pipeline leak-free',
        body: 'A single `ColumnTransformer` inside an sklearn `Pipeline`, so every transform fits on training folds only and nothing leaks into cross-validation or the test set. The `TotalCharges` blanks (11 brand-new customers) get coerced to NaN and median-imputed inside the pipeline, not before it.',
      },
      {
        title: 'Compare three models honestly',
        body: 'Stratified 80/20 split, model selection on 5-fold stratified CV ROC-AUC over the training set, and final numbers reported on the held-out test set only. Logistic regression, random forest and hist gradient boosting all run through the same pipeline.',
      },
      {
        title: 'Explain with permutation importance',
        body: 'I measured the mean drop in test ROC-AUC when each feature is shuffled. That gives drivers in the model’s own terms instead of coefficients that need a paragraph of caveats.',
      },
    ],
    results: [
      { value: '0.8419', label: 'test ROC-AUC', note: 'Logistic regression, held-out set' },
      { value: '0.8462', label: 'CV ROC-AUC', note: '±0.0126 over 5 stratified folds' },
      { value: '7,043', label: 'customers', note: '26.5% churned, moderately imbalanced' },
      { value: '0.168', label: 'top driver importance', note: 'Tenure, by permutation importance' },
    ],
    findings: [
      { label: 'Tenure 0 to 6 months', value: '52.9%', note: 'Against 9.5% at 49 to 72 months. Risk is front-loaded' },
      { label: 'Electronic check payment', value: '45.3%', note: '18.7pp above the 26.5% baseline' },
      { label: 'Month-to-month contract', value: '42.7%', note: 'Against 11.3% and 2.8% on 1- and 2-year terms' },
      { label: 'Fiber-optic internet', value: '41.9%', note: 'Roughly twice the DSL rate' },
      { label: 'No online security', value: '41.8%', note: '15.2pp above baseline' },
    ],
    lessons: [
      'Logistic regression won on both CV and test ROC-AUC. After one-hot encoding this signal is mostly linear and additive, and neither ensemble gained anything that survived the held-out evaluation. A well-regularised linear baseline is hard to beat on small and medium tabular problems, and it is cheaper to run and far easier to explain.',
      'The strongest finding is operational rather than statistical. Risk is concentrated in the first six months, so retention effort is worth spending at onboarding instead of at the cancellation screen.',
    ],
    stack: [
      { group: 'Modelling', items: ['scikit-learn', 'Pipeline + ColumnTransformer', 'Permutation importance'] },
      { group: 'Analysis', items: ['Python', 'pandas', 'matplotlib'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/telco-churn-prediction', kind: 'github' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'chinook-sql-analytics': {
    tagline:
      'Twelve business questions answered in plain SQL, with CTEs, window functions, and 43% dead stock.',
    role: 'Data analyst',
    context: [
      'The Chinook database models a digital music store: a catalog of artists, albums and tracks sold worldwide through invoices handled by support reps. I treated it the way an analyst treats a real commerce dataset and asked what a store manager would ask.',
      'Every analysis lives in a plain `.sql` file so each query can be read, reviewed and reused on its own. The Python layer only orchestrates. It runs each query, saves the full result to CSV, and draws the charts.',
    ],
    challenge:
      'Answer twelve real business questions across revenue, customers, catalog and sales-team performance, in SQL someone else can audit line by line.',
    approach: [
      {
        title: 'One question, one file',
        body: 'Twelve standalone SQL files, each answering a single business question. No monolithic script, because the artifact here is the query and it has to survive being read.',
      },
      {
        title: 'Use the real toolkit',
        body: 'CTEs, window functions (LAG for month-on-month, ROW_NUMBER for top-per-group, SUM OVER for running totals), correlated EXISTS subqueries, CASE pivots, and joins across up to five tables.',
      },
      {
        title: 'Keep it reproducible with zero setup',
        body: 'SQLite keeps the project self-contained. The database is a single 1 MB file committed to the repo, so anyone can clone and reproduce every number without standing up a server, and it still supports modern SQL so nothing had to be dumbed down.',
      },
      {
        title: 'Let the runner do only orchestration',
        body: 'A small Python runner executes each query with pandas, prints a preview, exports the full result, and renders the summary charts.',
      },
    ],
    results: [
      { value: '12', label: 'business questions', note: 'Each one a standalone, reviewable SQL file' },
      { value: '43.4%', label: 'of catalog never sold', note: '1,519 of 3,503 tracks. Heavy over-assortment' },
      { value: '$2,328.60', label: 'revenue analysed', note: '412 invoices over five years' },
      { value: '11', label: 'tables joined across', note: 'Sales, customers, staff and catalog' },
    ],
    findings: [
      { label: 'Rock’s share of revenue', value: '35.5%', note: '$826.65 from 835 tracks sold' },
      { label: 'Top 4 genres combined', value: '73.5%', note: 'Revenue is highly concentrated' },
      { label: 'USA share', value: '22.5%', note: '$523.06 from 13 customers. North America is 35.5%' },
      { label: 'Top artist', value: '$138.60', note: 'Iron Maiden, about 31% ahead of U2' },
      { label: 'Repeat rate', value: '100%', note: 'All 59 customers reordered, which says more about the dataset than about loyalty' },
    ],
    lessons: [
      'Dead stock was the most actionable finding and the least glamorous one. 43.4% of the catalog has never sold a unit, and even in the best-selling genre it is 42.6%. That is an assortment decision hiding inside a revenue dashboard.',
      'Noticing that every single customer is a repeat customer matters more than reporting it. A 100% repeat rate is a property of a synthetic dataset, not evidence of loyalty, and an analyst who does not say so is setting up a false conclusion downstream.',
    ],
    stack: [
      { group: 'SQL', items: ['SQLite', 'CTEs', 'Window functions', 'CASE pivots'] },
      { group: 'Orchestration', items: ['Python', 'pandas', 'matplotlib'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/chinook-sql-analytics', kind: 'github' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'weather-etl-pipeline': {
    tagline:
      'A production-shaped ETL pipeline with retry, quality gates, idempotent upserts and tests, and no orchestration framework in sight.',
    role: 'Data engineer',
    context: [
      'This pipeline pulls daily weather history for five Indonesian cities from the Open-Meteo archive, validates it against physical plausibility rules, and loads it into a local SQLite warehouse on a star schema. A separate analysis consumer then queries that warehouse in plain SQL.',
      'The subject matter is deliberate. My degree is in applied meteorology, so the validation thresholds, the WMO wet-day convention and the monsoon seasonality in the charts are things I can check on domain grounds instead of guessing at.',
    ],
    challenge:
      'Show ETL fundamentals end to end: extraction that survives a flaky API, transforms that reject bad physics, and loads you can safely run twice, without hiding behind Airflow.',
    approach: [
      {
        title: 'Extract with retry and archive the raw truth',
        body: 'An HTTP client with retry and backoff against the Open-Meteo archive API, writing the untouched JSON response to `data/raw/` before anything transforms it. If the transform turns out to be wrong, the source is still sitting there.',
      },
      {
        title: 'Gate on physics, not on nulls',
        body: 'Six data-quality rules, each reporting a per-city count of what it rejected: required completeness, temperature within -10 to 45 °C for tropical Indonesia, `temp_min <= temp_max` internal consistency, precipitation 0 to 600 mm/day, wind 0 to 250 km/h where present, and one row per city-day.',
      },
      {
        title: 'Derive columns the domain actually uses',
        body: '`temp_range_c` as the diurnal range, and `is_rainy_day` at the WMO 1.0 mm wet-day threshold. That is the convention, not an arbitrary cutoff I picked.',
      },
      {
        title: 'Load idempotently on a star schema',
        body: 'One dimension (`dim_city`) and one fact table (`fact_weather_daily`) with a composite primary key of city and date, loaded by UPSERT with a `loaded_at_utc` audit column. Re-running the pipeline converges instead of duplicating.',
      },
      {
        title: 'Fail one city, not the run',
        body: 'The orchestrator runs extract, transform and load per city, logs to console and file, and keeps going when one city fails, while the process exit code still reflects whether everything succeeded.',
      },
    ],
    results: [
      { value: '17', label: 'unit tests', note: 'Covering the transform and its quality gates' },
      { value: '4,560', label: 'daily rows loaded', note: '912 days across 5 Indonesian cities' },
      { value: '6', label: 'data-quality gates', note: 'Each reporting a per-city rejection count' },
      { value: '0', label: 'rows dropped in the full run', note: 'Clean source, but the gates are test-covered' },
    ],
    lessons: [
      'Idempotency is the property that makes a pipeline safe to operate. A load you can re-run without thinking is the difference between fixing a bad day with one command and reconciling duplicates by hand.',
      'All 912 days per city passed every check, which is the awkward case for quality gates: they look like dead code right up until the source degrades. Unit-testing the gates themselves is what keeps them honest while nothing is failing.',
    ],
    stack: [
      { group: 'Pipeline', items: ['Python', 'pandas', 'requests + backoff'] },
      { group: 'Warehouse', items: ['SQLite', 'Star schema', 'Idempotent UPSERT'] },
      { group: 'Quality', items: ['pytest', 'Structured logging'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/weather-etl-pipeline', kind: 'github' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'indonesia-earthquake-analysis': {
    tagline:
      'Eleven years of seismicity, a Gutenberg-Richter fit, and subduction zones drawn by nothing but epicentres.',
    role: 'Data analyst',
    context: [
      'Indonesia sits on the most seismically active stretch of the Ring of Fire. The Indo-Australian Plate converges with the Sunda Plate at 6 to 7 cm per year along the Java Trench, and the east of the country is a collision zone between four plates.',
      'That produces roughly 850 to 1,100 earthquakes of M 4.5 or greater every year, from shallow megathrust events near the trench to some of the deepest earthquakes on Earth beneath the Banda Sea. It is an ideal natural laboratory for earthquake statistics, and the stakes are not academic.',
    ],
    challenge:
      'Characterise the whole earthquake population, statistically and spatially, from a public catalog, in a way anyone can reproduce.',
    approach: [
      {
        title: 'Collect around the API’s limits',
        body: 'The USGS FDSN service caps responses at 20,000 events per request, so the fetcher downloads the catalog in one-year chunks, concatenates them, deduplicates by event ID, and writes a single combined snapshot. That snapshot is committed, so the analysis reproduces without hitting the API again.',
      },
      {
        title: 'Fit the frequency-magnitude law',
        body: 'I fitted the Gutenberg-Richter relation to the cumulative frequency-magnitude curve, which is linear on a log scale across three orders of magnitude, and reported both the least-squares and the Aki maximum-likelihood estimates rather than just the flattering one.',
      },
      {
        title: 'Profile depth against the slab',
        body: 'Binning events into shallow, intermediate and deep recovers the bimodal structure produced by the steeply dipping slab beneath the Banda and Flores Seas.',
      },
      {
        title: 'Map with no basemap',
        body: 'Plotting epicentres alone, coloured by depth, makes the Sunda arc coastlines appear on their own. The slab images itself in map view as events deepen northeastward from the trench.',
      },
    ],
    results: [
      { value: '10,294', label: 'events analysed', note: 'M ≥ 4.5, Jan 2015 to Jul 2026' },
      { value: '1.07', label: 'Gutenberg-Richter b-value', note: '±0.02 least squares, Aki MLE 1.26' },
      { value: '868', label: 'events per full year', note: 'Peak 1,141 in 2019, trough 681 in 2016' },
      { value: '69 / 28 / 3.4%', label: 'shallow / intermediate / deep', note: 'Under 70 km, 70 to 300 km, over 300 km' },
    ],
    findings: [
      { label: 'Largest in catalog', value: 'M 7.8', note: '7 June 2026, Mindanao, depth 57 km' },
      { label: 'Largest in Indonesia', value: 'M 7.6', note: 'Tanimbar Islands, 9 Jan 2023, depth 105 km' },
      { label: 'Busiest month', value: '233 events', note: 'June 2026, an aftershock sequence' },
      { label: 'Long-term trend', value: 'None', note: 'Annual counts move between 680 and 1,140 with no drift' },
    ],
    lessons: [
      'A b-value near 1 is the textbook value for tectonic regions, and it carries a concrete meaning: every one-unit step down in magnitude brings roughly ten times more earthquakes. The fit is not the finding, the exponent is.',
      'The spikes in monthly activity are aftershock sequences, not seasonality. Resisting the urge to read a cycle into a time series is most of the work in catalog analysis.',
    ],
    stack: [
      { group: 'Data', items: ['USGS FDSN API', 'Chunked collection', 'Committed snapshot'] },
      { group: 'Analysis', items: ['Python', 'pandas', 'NumPy', 'matplotlib'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/indonesia-earthquake-analysis', kind: 'github' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'fmcg-excel-dashboard': {
    tagline:
      '190,754 rows of FMCG sales turned into a real Excel dashboard, generated by a script instead of by hand.',
    role: 'Data analyst',
    context: [
      'A simulated FMCG company sells a 30-SKU portfolio across three channels and three regions. Management wants one workbook that answers how revenue is trending, where it comes from, and whether promotions actually pay off.',
      'Excel is the deliberate target, because it is where this audience already works. The interesting constraint was making an Excel dashboard that is fully reproducible rather than a hand-built file nobody can rebuild.',
    ],
    challenge:
      'Produce a genuinely interactive Excel dashboard with native charts, KPI cards and working filters, from a reproducible Python pipeline, with every insight computed rather than typed.',
    approach: [
      {
        title: 'Three scripts, one command each',
        body: 'Download the Kaggle dataset, clean and aggregate it, then generate the workbook with XlsxWriter. Anyone can rebuild the whole dashboard from raw data with three commands.',
      },
      {
        title: 'Make the cleaning decisions explicit',
        body: 'Dropped 3 rows with negative units sold, floored negative stock and delivery values at zero, derived revenue and calendar columns, and flagged stock-outs. All of it documented in an About sheet inside the workbook itself.',
      },
      {
        title: 'Build real interactivity, not pictures of it',
        body: 'Five KPI cards and six native Excel charts, with a dropdown-driven filter wired to SUMIFS and AVERAGEIFS formulas, so the workbook stays interactive long after the Python process has exited.',
      },
      {
        title: 'Compute the insights, do not write them',
        body: 'The Insights sheet holds seven written business findings, and the pipeline calculates every one of them from the data rather than having me type a conclusion.',
      },
      {
        title: 'Colour on purpose',
        body: 'An accessible, colourblind-validated palette. An ordinal blue ramp encodes year order and fixed categorical hues encode channel identity.',
      },
    ],
    results: [
      { value: '190,754', label: 'clean records', note: 'SKU × day × channel × region, 2022 to 2024' },
      { value: '1 script', label: 'to rebuild everything', note: 'Raw download, cleaned data, finished workbook' },
      { value: '6', label: 'native Excel charts', note: 'Plus 5 KPI cards and a working filter' },
      { value: '9', label: 'sheets in the workbook', note: 'Dashboard, Insights, 5 source tables, Data, About' },
    ],
    findings: [
      { label: 'Promotion impact', value: '+95%', note: 'Units per day. 25.6% of revenue from 14.9% of trading days' },
      { label: 'E-commerce growth', value: '+168%', note: '2024 against 2022, the fastest-growing channel' },
      { label: 'Yogurt revenue share', value: '41.2%', note: 'Top 3 categories account for 79.7%' },
      { label: 'Stock-outs', value: '2.0%', note: '3,860 SKU-days of lost-sales opportunity' },
      { label: '2024 vs 2023 revenue', value: '-1.0%', note: 'A decline after the 2022 to 2023 ramp' },
    ],
    lessons: [
      'Writing the caveat into the deliverable is part of the deliverable. 2022 starts on 21 January with a smaller active portfolio, so year-on-year totals are not directly comparable, and that belongs in the workbook rather than in a follow-up email.',
      'Reproducibility is what separates a dashboard from a screenshot. If rebuilding it means a person repeating forty clicks, the analysis has a shelf life.',
    ],
    stack: [
      { group: 'Pipeline', items: ['Python', 'pandas', 'XlsxWriter'] },
      { group: 'Delivery', items: ['Excel', 'SUMIFS / AVERAGEIFS', 'Native charts'] },
    ],
    links: [
      { label: 'Source on GitHub', href: 'https://github.com/yogaibhh/fmcg-dashboard-excel-testing', kind: 'github' },
    ],
  },
}

export function getCaseStudy(slug) {
  return caseStudies[slug] ?? null
}

export default caseStudies
