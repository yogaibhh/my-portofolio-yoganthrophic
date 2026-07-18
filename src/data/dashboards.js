const dashboards = [
  {
    id: 'fmcg-sales-performance',
    name: 'FMCG Sales Performance',
    description: 'Interactive BI dashboard for FMCG distribution across Java — trailing-12-month revenue, YoY growth, category mix, and top SKUs, with a region filter. Synthetic demo data; the web sibling of the author\'s FMCG Excel dashboard.',
    tech: ['React', 'Recharts', 'BI', 'Data Visualization'],
    pipeline: [
      {
        step: 1,
        title: 'Transaction Data',
        description: 'Sales transactions across 5 categories, 4 regions, and 24 months'
      },
      {
        step: 2,
        title: 'Aggregation',
        description: 'Revenue, units, and order metrics rolled up per period and segment'
      },
      {
        step: 3,
        title: 'KPI & Trend Modeling',
        description: 'Trailing-12-month KPIs and year-over-year comparison'
      },
      {
        step: 4,
        title: 'Interactive Dashboard',
        description: 'Region-filterable React dashboard with live-recomputed charts'
      }
    ]
  },
  {
    id: 'customer-churn-monitor',
    name: 'Customer Churn Monitor',
    description: 'Retention analytics dashboard for a telco subscriber base — churn by tenure, contract, and internet service, plus deployed-model performance and at-risk segments. Numbers echo the author\'s telco-churn-prediction study (ROC-AUC 0.84).',
    tech: ['React', 'Recharts', 'Machine Learning', 'Analytics'],
    pipeline: [
      {
        step: 1,
        title: 'Customer Data',
        description: '7,043 subscribers with tenure, contract, and service attributes'
      },
      {
        step: 2,
        title: 'Churn Modeling',
        description: 'Logistic Regression scoring each customer\'s churn probability'
      },
      {
        step: 3,
        title: 'Segmentation',
        description: 'Cohort and driver analysis surfacing high-risk segments'
      },
      {
        step: 4,
        title: 'Monitoring Dashboard',
        description: 'Segment-filterable dashboard tracking churn drivers and model metrics'
      }
    ]
  },
  {
    id: 'seismic-activity-monitor',
    name: 'Seismic Activity Monitor',
    description: 'Geospatial earthquake monitor for the Sunda Arc & Banda Sea — a Leaflet map of events colored by depth and sized by magnitude, with magnitude/depth distributions and strongest-event tracking. Companion to the author\'s indonesia-earthquake-analysis study.',
    tech: ['React', 'Leaflet / OSM', 'Recharts', 'Geospatial'],
    pipeline: [
      {
        step: 1,
        title: 'Event Catalog',
        description: 'USGS-style M4.5+ seismic catalog along the Sunda subduction zone'
      },
      {
        step: 2,
        title: 'Classification',
        description: 'Events bucketed by depth class and Gutenberg-Richter magnitude bins'
      },
      {
        step: 3,
        title: 'Spatial Rendering',
        description: 'Leaflet map with depth-colored, magnitude-scaled markers'
      },
      {
        step: 4,
        title: 'Interactive Monitor',
        description: 'Magnitude-filterable dashboard with map, charts, and event ranking'
      }
    ]
  },
  {
    id: 'national-stability-index',
    name: 'National Stability Index (NPI)',
    description: 'National-scale predictive monitoring dashboard for stability index metrics',
    tech: ['Python', 'ETL Pipeline', 'React', 'Elasticsearch'],
    pipeline: [
      {
        step: 1,
        title: 'Data Source',
        description: 'Raw unstructured data collection from multiple national-scale sources'
      },
      {
        step: 2,
        title: 'ETL Processing',
        description: 'Python ETL parsing & normalization of unstructured data into structured formats'
      },
      {
        step: 3,
        title: 'Indexing',
        description: 'Elasticsearch indexing for fast query and retrieval'
      },
      {
        step: 4,
        title: 'Visualization',
        description: 'React dashboard with real-time queries and interactive monitoring'
      }
    ]
  },
  {
    id: 'netra-security-monitoring',
    name: 'NETRA Security Monitoring',
    description: 'Interactive security monitoring with geospatial visualization and network analysis',
    tech: ['React', 'Leaflet / OSM', 'Elasticsearch', 'Geospatial'],
    pipeline: [
      {
        step: 1,
        title: 'Data Ingestion',
        description: 'Multi-source security data collection and Elasticsearch ingestion'
      },
      {
        step: 2,
        title: 'Query Layer',
        description: 'Lucene query layer for fast filtering and aggregation'
      },
      {
        step: 3,
        title: 'Spatial Rendering',
        description: 'Mapbox GL spatial rendering + Sankey flow analysis'
      },
      {
        step: 4,
        title: 'Interactive Dashboard',
        description: 'Interactive React dashboard with real-time geospatial visualization'
      }
    ]
  },
  {
    id: 'karhutla-fire-risk',
    name: 'Karhutla (Fire Risk Prediction)',
    description: 'Regional fire risk prediction system using satellite and meteorological data',
    tech: ['Google Earth Engine', 'NASA POWER', 'Python', 'Predictive Modeling'],
    pipeline: [
      {
        step: 1,
        title: 'Data Acquisition',
        description: 'NASA POWER meteorological API + GEE satellite imagery collection'
      },
      {
        step: 2,
        title: 'Data Processing',
        description: 'Python data processing and feature engineering'
      },
      {
        step: 3,
        title: 'Model Training',
        description: 'Predictive risk model training and validation'
      },
      {
        step: 4,
        title: 'Risk Mapping',
        description: 'Geospatial risk map visualization with regional coverage'
      }
    ]
  },
  {
    id: 'geopolitical-simulation',
    name: 'Geopolitical Simulation Viz',
    description: 'Dynamic trade pattern and geopolitical trend visualization from multi-agent simulations',
    tech: ['PostgreSQL', 'Python', 'Interactive Charting'],
    pipeline: [
      {
        step: 1,
        title: 'Simulation Engine',
        description: 'Multi-agent simulation engine generating raw simulation logs'
      },
      {
        step: 2,
        title: 'Data Integration',
        description: 'PostgreSQL integration for structured storage'
      },
      {
        step: 3,
        title: 'Transformation',
        description: 'Python transformation and aggregation of simulation data'
      },
      {
        step: 4,
        title: 'Trend Visualization',
        description: 'Interactive trend visualizations with dynamic charting'
      }
    ]
  },
  {
    id: 'weather-modification',
    name: 'Weather Modification Analytics',
    description: 'Automated weather data processing and visualization for cloud seeding operations',
    tech: ['Python', 'Google Colab', 'Data Automation'],
    pipeline: [
      {
        step: 1,
        title: 'Raw Data',
        description: '480+ hours raw weather data from operational sources'
      },
      {
        step: 2,
        title: 'Automated Cleaning',
        description: 'Google Colab automated cleaning and quality checks'
      },
      {
        step: 3,
        title: 'Analysis',
        description: 'Python transformation & statistical analysis'
      },
      {
        step: 4,
        title: 'Reporting',
        description: 'Dynamic visualizations & trend reports for operations'
      }
    ]
  },
  {
    id: 'dki-jakarta-air-quality',
    name: 'DKI Jakarta Air Quality',
    description: 'Air quality monitoring map album across 20+ locations in Jakarta',
    tech: ['Excel', 'Data Processing', 'GIS Visualization'],
    pipeline: [
      {
        step: 1,
        title: 'Data Collection',
        description: '10-year hourly data (175K+ points) from monitoring stations'
      },
      {
        step: 2,
        title: 'Processing',
        description: 'Excel processing & structuring of raw time-series data'
      },
      {
        step: 3,
        title: 'Trend Analysis',
        description: 'Statistical trend analysis across temporal and spatial dimensions'
      },
      {
        step: 4,
        title: 'GIS Mapping',
        description: 'GIS mapping across 20+ monitoring locations'
      }
    ]
  }
]

export default dashboards
