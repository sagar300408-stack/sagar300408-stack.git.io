/**
 * Authoritative Originyx Product Catalogue
 * 
 * Provides truthful, verified product information for the Originyx Client Portal.
 * Reflects exact business positioning, real product status, and clear capability delineation.
 */

export interface ProductPlan {
  name: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
}

export interface TechnicalArchitecture {
  backend: string;
  database: string;
  deployment: string;
  integrations: string[];
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: 'Live' | 'Beta';
  tagline: string;
  summary: string;
  description: string;
  frictionSolved: string;
  targetAudience: string[];
  capabilities: string[]; // Unified list for simple components
  availableCapabilities: string[];
  verificationCapabilities: string[];
  plannedCapabilities: string[];
  technicalArchitecture: TechnicalArchitecture;
  plans: ProductPlan[];
  mainSiteUrl: string;
}

export const AUTHORITATIVE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-hunteros-engage',
    slug: 'hunteros-engage',
    name: 'HunterOS Engage',
    category: 'Operational Event & Lead Intelligence',
    status: 'Live',
    tagline: 'HunterOS detects important operational events and helps teams respond before opportunities are lost.',
    summary: 'An operational event intelligence platform that captures inbound lead actions, identifies urgent conversion moments, and triggers timely response workflows across revenue operations.',
    description: 'Modern sales and revenue operations suffer when inbound leads and critical customer signals sit idle in disconnected queues. HunterOS Engage ingests high-value signals from CRM, web events, and communications, matching them against defined operational rules to surface urgent opportunities and orchestrate rapid follow-up.',
    frictionSolved: 'Eliminates multi-hour response delays to high-intent buyer actions and manual lead routing bottlenecks.',
    targetAudience: [
      'B2B SaaS and high-velocity sales teams',
      'Revenue operations managers',
      'Inbound qualification teams'
    ],
    capabilities: [
      'Real-time operational event ingestion and filtering',
      'Webhook-driven response dispatch to CRMs and communication channels',
      'Unified customer timeline and behavioral event indexing',
      'Configurable trigger rules for urgent lead follow-up',
      'Multi-channel notification routing (Slack, Email, Webhooks)',
      'Operational response latency tracking and audit trail'
    ],
    availableCapabilities: [
      'Real-time operational event ingestion via secure REST API & Webhooks',
      'Rule-based trigger evaluation for inbound lead alerts',
      'Customer timeline logging and operational audit logs',
      'Slack and Webhook dispatch adapters'
    ],
    verificationCapabilities: [
      'Autonomous lead qualification confidence scoring',
      'Dynamic multi-rep round-robin routing under high concurrency'
    ],
    plannedCapabilities: [
      'Predictive intent decay modeling based on historical response latency',
      'Cross-system bi-directional sync with legacy enterprise CRMs'
    ],
    technicalArchitecture: {
      backend: 'FastAPI (Python) event processing engine',
      database: 'PostgreSQL with indexed event streams',
      deployment: 'Cloud-hosted multi-tenant or private VPC deployment',
      integrations: ['Webhooks', 'REST API', 'Slack', 'PostgreSQL', 'Custom CRM endpoints']
    },
    plans: [
      {
        name: 'Pilot Evaluation',
        price: 'Structured Pilot',
        billing: '30-day evaluation',
        description: 'Guided pilot on staging or production data to measure operational response latency and qualification accuracy.',
        features: [
          'Full event ingestion access up to 50,000 monthly events',
          'Standard webhook and Slack integration channels',
          'Dedicated onboarding and latency audit review'
        ]
      },
      {
        name: 'Enterprise Deployment',
        price: 'Custom Proposal',
        billing: 'annual agreement',
        description: 'Full production deployment designed for scale, custom integrations, and dedicated enterprise support.',
        features: [
          'High-throughput event ingestion with sub-second processing',
          'Custom CRM and internal database connector setup',
          'Configurable SLA and priority engineering support',
          'Optional dedicated VPC or on-premise cloud deployment'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/hunteros-engage/'
  },
  {
    id: 'prod-hunteros',
    slug: 'hunteros',
    name: 'HunterOS',
    category: 'Autonomous Pipeline & Lead Operations',
    status: 'Beta',
    tagline: 'Automate high-intent prospect research, qualification, and outbound pipeline intelligence.',
    summary: 'A pipeline intelligence platform that automates target account enrichment, signals monitoring, and contextual outreach preparation for sales development teams.',
    description: 'Outbound sales teams waste hours manually searching company databases, verifying tech stacks, and drafting generic outreach messages. HunterOS aggregates verified firmographic and hiring signals to produce personalized, highly relevant pipeline opportunities.',
    frictionSolved: 'Reduces manual prospect research time and prevents generic, low-conversion outbound communications.',
    targetAudience: [
      'B2B Founders and revenue leaders',
      'Sales Development Representatives (SDRs)',
      'Growth marketing teams'
    ],
    capabilities: [
      'Automated company and tech-stack signal enrichment',
      'ICP fit scoring based on verifiable hiring and funding events',
      'Contextualized email angle generation grounded in prospect facts',
      'Pipeline hygiene monitoring and contact verification'
    ],
    availableCapabilities: [
      'Domain and tech-stack enrichment pipeline',
      'Rule-based ICP scoring engine',
      'Outbound message draft generation'
    ],
    verificationCapabilities: [
      'Multi-source contact verification reliability',
      'Real-time hiring intent trigger detection'
    ],
    plannedCapabilities: [
      'Autonomous CRM contact backfill with deduplication',
      'Closed-loop conversion attribution'
    ],
    technicalArchitecture: {
      backend: 'Node.js and Python microservices',
      database: 'PostgreSQL with Redis caching',
      deployment: 'Managed container cloud',
      integrations: ['Enrichment APIs', 'Email delivery providers', 'CRM webhooks']
    },
    plans: [
      {
        name: 'Early Access Pilot',
        price: 'Beta Program',
        billing: 'per evaluation cycle',
        description: 'Participate in the controlled beta program with direct engineering feedback channels.',
        features: [
          'Target account research queue',
          'ICP scoring rule customization',
          'Direct engineering team onboarding'
        ]
      },
      {
        name: 'Enterprise Outbound',
        price: 'Custom Proposal',
        billing: 'annual license',
        description: 'Dedicated instance configured for multi-seat SDR teams with enterprise CRM integration.',
        features: [
          'Custom data pipeline connectors',
          'Custom LLM temperature & tone compliance policies',
          'Enterprise SLA and security audit compliance'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/hunteros/'
  },
  {
    id: 'prod-shadowos',
    slug: 'shadowos',
    name: 'ShadowOS',
    category: 'Operational Observability & Workflow Shadowing',
    status: 'Beta',
    tagline: 'Observe operational processes passively to pinpoint bottlenecks before automating them.',
    summary: 'A non-intrusive operational observability system that shadows repetitive internal workflows to identify systemic latency and automate error-prone handoffs.',
    description: 'Before automating an enterprise workflow, teams need an accurate empirical map of what actually happens. ShadowOS monitors event timelines, task completion intervals, and handoff friction to surface high-ROI automation targets with empirical data.',
    frictionSolved: 'Eliminates blind automation guesses by capturing real-world workflow handoff latency.',
    targetAudience: [
      'Chief Operating Officers (COOs)',
      'Operations and business process architects',
      'Digital transformation leaders'
    ],
    capabilities: [
      'Non-intrusive operational event timeline shadowing',
      'Process bottleneck and wait-state identification',
      'Automated process flow map synthesis',
      'Empirical ROI modeling for prospective automation candidates'
    ],
    availableCapabilities: [
      'Event log ingestion from enterprise task trackers',
      'Wait-state duration computation across operational handoffs',
      'Visual process cycle time breakdown'
    ],
    verificationCapabilities: [
      'Cross-departmental correlation of unstructured task updates',
      'Anomaly detection in operational turnaround times'
    ],
    plannedCapabilities: [
      'One-click workflow synthesis into executable agent pipelines',
      'Predictive backlog risk warnings'
    ],
    technicalArchitecture: {
      backend: 'Go / Python event stream processor',
      database: 'Time-series event log store on PostgreSQL',
      deployment: 'Self-hosted or managed cloud',
      integrations: ['Jira', 'Slack', 'ERP Webhooks', 'Linear']
    },
    plans: [
      {
        name: 'Process Audit Pilot',
        price: 'Evaluation Tier',
        billing: 'single engagement',
        description: 'Analyze up to 3 core operational workflows to map bottlenecks and measure latency.',
        features: [
          'Up to 3 workflow streams monitored',
          'Comprehensive Bottleneck Diagnostic Report',
          'Specific automation blueprint recommendations'
        ]
      },
      {
        name: 'Continuous Observability',
        price: 'Custom Proposal',
        billing: 'annual agreement',
        description: 'Always-on operational shadowing across all enterprise systems with automated alerting.',
        features: [
          'Unlimited event logging and workflow streams',
          'Real-time SLA breach alerting',
          'Enterprise single sign-on and role-based permissions'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/shadowos/'
  },
  {
    id: 'prod-enterprise-rag',
    slug: 'enterprise-rag',
    name: 'Enterprise RAG System',
    category: 'Knowledge Architecture & Retrieval',
    status: 'Live',
    tagline: 'Sub-second, citation-backed knowledge retrieval across fragmented corporate documents.',
    summary: 'A production-grade Retrieval-Augmented Generation platform that connects to corporate data sources, enforces granular document permissions, and provides exact factual answers with verified source citations.',
    description: 'Employees waste hours searching internal wikis, PDFs, contracts, and knowledge bases for critical operational facts. Originyx Enterprise RAG indexes heterogeneous business documentation with hybrid vector and keyword search, returning precise answers with verified document citations.',
    frictionSolved: 'Removes knowledge discovery delays and stops AI hallucinations by grounding responses strictly in verified enterprise documents.',
    targetAudience: [
      'Knowledge management leaders',
      'Engineering and customer support teams',
      'Compliance and legal operations'
    ],
    capabilities: [
      'Hybrid semantic vector search + BM25 keyword retrieval',
      'Strict source citation with page-level excerpt links',
      'Role-based access control (RBAC) filtering at query time',
      'Automated document chunking and metadata enrichment',
      'Support for PDF, DOCX, Markdown, HTML, and database tables'
    ],
    availableCapabilities: [
      'Hybrid retrieval pipeline with reranking',
      'Document parsing and embedding generation pipeline',
      'Query-time permission boundary enforcement',
      'REST API and embeddable query widget'
    ],
    verificationCapabilities: [
      'Dynamic table extraction from scanned PDFs',
      'Complex multi-hop question answering across multiple sources'
    ],
    plannedCapabilities: [
      'Real-time incremental index sync with Google Drive and SharePoint',
      'Autonomous citation confidence auditing'
    ],
    technicalArchitecture: {
      backend: 'FastAPI (Python) retrieval server with LangChain / LlamaIndex core',
      database: 'PostgreSQL with pgvector & hybrid inverted index',
      deployment: 'VPC isolated, on-premise capable, zero-data-retention LLM endpoints',
      integrations: ['Notion', 'Google Drive', 'Confluence', 'Internal Document Storage']
    },
    plans: [
      {
        name: 'Team Knowledge Hub',
        price: 'Custom Pilot',
        billing: 'monthly or annual',
        description: 'For departmental knowledge bases up to 100,000 document pages.',
        features: [
          'Hybrid search with citation guarantees',
          'Standard SSO and user permissions',
          'REST API and internal search UI'
        ]
      },
      {
        name: 'Enterprise VPC Dedicated',
        price: 'Custom Proposal',
        billing: 'annual contract',
        description: 'Complete data isolation inside your AWS/GCP/Azure VPC with custom LLM endpoints.',
        features: [
          'Zero external data egress options',
          'Custom embedding model fine-tuning',
          'Dedicated engineering integration support',
          'Strict 99.9% uptime SLA'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/enterprise-rag/'
  },
  {
    id: 'prod-swiftroute-ai',
    slug: 'swiftroute-ai',
    name: 'SwiftRoute AI',
    category: 'Operational Logistics & Resource Routing',
    status: 'Live',
    tagline: 'Multi-stop route optimization and intelligent operational resource dispatch.',
    summary: 'A logistics and dispatch optimization engine that calculates optimal multi-stop routes under dynamic operational constraints including delivery time windows, vehicle capacities, and live traffic.',
    description: 'Field service fleets and delivery operations lose substantial operating margin on inefficient routes and delayed schedule updates. SwiftRoute AI evaluates complex combinatorial routing constraints in seconds to minimize travel time, balance driver workloads, and adapt to cancellations in real time.',
    frictionSolved: 'Eliminates manual route planning overhead and reduces operational mileage and transit delays.',
    targetAudience: [
      'Fleet managers and dispatch operations',
      'Field service providers',
      'Last-mile logistics operators'
    ],
    capabilities: [
      'Multi-vehicle routing with capacity and time-window constraints',
      'Dynamic re-optimization when stops are cancelled or added',
      'Driver workload balancing and rest period enforcement',
      'Turn-by-turn dispatch manifests via mobile web and API'
    ],
    availableCapabilities: [
      'Combinatorial routing optimization engine',
      'Geocoding and distance-matrix cache',
      'Dispatch manifest export and driver route links'
    ],
    verificationCapabilities: [
      'Dynamic real-time traffic delay rerouting in peak urban zones',
      'Multi-depot pickup and delivery balancing'
    ],
    plannedCapabilities: [
      'Driver telematics integration for predictive ETA calculations',
      'Autonomous fuel stop optimization'
    ],
    technicalArchitecture: {
      backend: 'High-performance C++ / Python optimization solver wrapped in FastAPI',
      database: 'PostgreSQL with PostGIS extensions',
      deployment: 'Containerized microservice on AWS / GCP',
      integrations: ['OpenStreetMap / Mapbox', 'Custom Fleet Management Systems', 'REST API']
    },
    plans: [
      {
        name: 'Fleet Starter',
        price: 'Volume Based',
        billing: 'monthly platform fee',
        description: 'For fleets up to 25 vehicles and 500 daily optimization stops.',
        features: [
          'Multi-vehicle constraint solver',
          'Standard dispatch manifests and driver route links',
          'Email and ticketing support'
        ]
      },
      {
        name: 'Enterprise Fleet',
        price: 'Custom Proposal',
        billing: 'annual agreement',
        description: 'High-volume routing solver with dedicated compute nodes and ERP/TMS integrations.',
        features: [
          'Unlimited vehicles and dynamic recalculations',
          'Custom TMS / ERP webhook integration',
          'Sub-second optimization compute SLAs',
          'Dedicated support engineer'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/swiftroute-ai/'
  },
  {
    id: 'prod-tvira-receptionist',
    slug: 'tvira-receptionist',
    name: 'Tvira Receptionist',
    category: 'Autonomous Voice & Front-Desk AI',
    status: 'Beta',
    tagline: 'Low-latency conversational voice agent for front-desk scheduling and inquiry routing.',
    summary: 'An autonomous voice receptionist that answers incoming phone calls, handles common business inquiries, qualifies customer needs, and books appointments directly into operational calendars.',
    description: 'Businesses lose inbound revenue every day because incoming calls go to voicemail or ring unanswered during peak hours. Tvira Receptionist operates 24/7 with human-like conversational voice latency, resolving customer questions and scheduling appointments according to business policies.',
    frictionSolved: 'Eliminates missed calls, unanswered inquiries, and manual front-desk scheduling friction.',
    targetAudience: [
      'Professional service clinics and practices',
      'Field service contractors and dispatch desks',
      'Hospitality and booking teams'
    ],
    capabilities: [
      'Sub-800ms natural conversational voice response',
      'Real-time calendar availability check and appointment booking',
      'Structured caller qualification and CRM logging',
      'Intelligent escalation and live transfer to on-duty staff'
    ],
    availableCapabilities: [
      'Telephony SIP trunking integration via Twilio',
      'Calendar booking integration with Google Calendar and Outlook',
      'Structured call transcript and summary dispatch'
    ],
    verificationCapabilities: [
      'Background noise suppression during cellular calls',
      'Accented speech phonetic recognition accuracy'
    ],
    plannedCapabilities: [
      'Multi-language simultaneous localization',
      'Outbound confirmation reminder calling'
    ],
    technicalArchitecture: {
      backend: 'WebRTC / WebSocket voice streaming pipeline on Python & Node.js',
      database: 'PostgreSQL for call records and analytics',
      deployment: 'Ultra-low latency regional edge nodes',
      integrations: ['Twilio / Vonage SIP', 'Google Calendar', 'Cal.com', 'Webhooks']
    },
    plans: [
      {
        name: 'Front Desk Pilot',
        price: 'Beta Evaluation',
        billing: 'per month',
        description: 'Single phone line setup with up to 500 monthly conversation minutes.',
        features: [
          'Standard voice persona and custom business knowledge prompt',
          'Calendar appointment booking',
          'SMS confirmation and call summary emails'
        ]
      },
      {
        name: 'Enterprise Multi-Desk',
        price: 'Custom Proposal',
        billing: 'annual license',
        description: 'Multi-line telephony routing for distributed offices with custom telephony SIP trunking.',
        features: [
          'Custom brand voice cloning and terminology fine-tuning',
          'Live agent cold/warm transfer integrations',
          'HIPAA / SOC-compliant recording retention options'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/tvira-receptionist/'
  },
  {
    id: 'prod-mission-control',
    slug: 'mission-control',
    name: 'Mission Control',
    category: 'System Observability & Operational Fleet Telemetry',
    status: 'Live',
    tagline: 'Unified operational telemetry, agent fleet monitoring, and real-time execution health.',
    summary: 'A centralized operational monitoring dashboard designed to oversee autonomous agents, background jobs, API latency, and data pipeline health from a single pane of glass.',
    description: 'When companies deploy automated systems, maintaining end-to-end visibility is critical to preventing silent failures. Mission Control aggregates metrics, error traces, and operational throughput across all deployed Originyx software systems, giving leadership immediate clarity on operational health.',
    frictionSolved: 'Eliminates fragmented monitoring across disconnected tools and surfaces silent automation failures before they impact business revenue.',
    targetAudience: [
      'Engineering leaders and VP of Technology',
      'DevOps and Site Reliability Engineers',
      'Operations directors managing automated systems'
    ],
    capabilities: [
      'Real-time system health and agent fleet telemetry',
      'Multi-service API latency and throughput monitoring',
      'Automated anomaly detection on background queue depths',
      'Audit logging of critical system state transitions'
    ],
    availableCapabilities: [
      'Centralized telemetry metrics aggregator',
      'Custom alert rules via Slack and Webhooks',
      'Interactive execution timeline and trace inspector'
    ],
    verificationCapabilities: [
      'Predictive queue saturation forecasting',
      'Cross-service distributed trace correlation'
    ],
    plannedCapabilities: [
      'Self-healing automated remediation triggers',
      'Long-term operational capacity cost forecasting'
    ],
    technicalArchitecture: {
      backend: 'Go telemetry collector with OpenTelemetry compliance',
      database: 'TimescaleDB / PostgreSQL for time-series metrics',
      deployment: 'High-availability Kubernetes / ECS cluster',
      integrations: ['OpenTelemetry', 'Prometheus', 'Slack', 'PagerDuty', 'Custom REST Webhooks']
    },
    plans: [
      {
        name: 'Portal Included',
        price: 'Included with Systems',
        billing: 'included with active subscription',
        description: 'Standard operational health telemetry included for all active Originyx software deployments.',
        features: [
          'Core system status and uptime monitoring',
          'Email and Slack incident notifications',
          '30-day telemetry metric retention'
        ]
      },
      {
        name: 'Enterprise Fleet Telemetry',
        price: 'Custom Proposal',
        billing: 'annual license',
        description: 'Advanced observability for high-throughput distributed fleets and hybrid on-premise nodes.',
        features: [
          'Sub-second telemetry ingestion and custom dashboards',
          '1-year audit and telemetry metric retention',
          'Custom SIEM export and SOC compliance logging'
        ]
      }
    ],
    mainSiteUrl: 'https://originyx.in/projects/mission-control/'
  }
];

export function getAuthoritativeCatalogue(): ProductItem[] {
  return AUTHORITATIVE_PRODUCTS;
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return AUTHORITATIVE_PRODUCTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
}
