const dashboards = [
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
