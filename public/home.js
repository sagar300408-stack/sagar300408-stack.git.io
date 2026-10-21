/* ==========================================================================
   ORIGINYX /home — Dedicated Interactivity & Logic
   Calculator, 5-Stage Stepper, Architecture Tabs, and Navigation
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initHomeNav();
    initRoiCalculator();
    initMethodStepper();
    initArchLayers();
    initHeroTilt();
    initBackToTop();
  });

  /* ==========================================================================
     1. NAVIGATION & ACCESSIBILITY
     ========================================================================== */
  function initHomeNav() {
    const nav = document.getElementById('home-navbar');
    const toggle = document.getElementById('home-nav-toggle');
    const drawer = document.getElementById('home-nav-drawer');
    const profileTrigger = document.getElementById('nav-profile-trigger');
    const profileDropdown = document.getElementById('nav-profile-dropdown');

    // Sticky nav shadow
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }
    });

    // Mobile Hamburger
    toggle?.addEventListener('click', () => {
      const isOpen = drawer?.classList.contains('open');
      if (isOpen) {
        drawer?.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      } else {
        drawer?.classList.add('open');
        toggle?.classList.add('open');
        toggle?.setAttribute('aria-expanded', 'true');
      }
    });

    // Close drawer on link click
    drawer?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer?.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      });
    });

    // Profile Dropdown Toggle
    profileTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown?.contains(e.target)) {
        profileDropdown?.classList.remove('open');
      }
      if (!drawer?.contains(e.target) && !toggle?.contains(e.target)) {
        drawer?.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });

    // Escape key closes menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        profileDropdown?.classList.remove('open');
        drawer?.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });

    // Sign in trigger click opens auth modal
    const navSignInBtn = document.getElementById('nav-sign-in-btn');
    navSignInBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal('login');
      } else {
        const modal = document.getElementById('auth-modal');
        const wrapper = document.getElementById('modal-wrapper');
        if (modal && wrapper) {
          wrapper.classList.remove('hidden');
          modal.classList.remove('hidden');
        }
      }
    });
  }

  /* ==========================================================================
     2. BUSINESS IMPACT & ROI CALCULATOR
     ========================================================================== */
  function initRoiCalculator() {
    let currency = 'USD';
    const currencySymbols = { USD: '$', INR: '₹' };
    const currencyRates = { USD: 1, INR: 84 };

    // DOM Elements
    const curUsdBtn = document.getElementById('calc-cur-usd');
    const curInrBtn = document.getElementById('calc-cur-inr');

    const employeesInput = document.getElementById('calc-employees');
    const employeesVal = document.getElementById('calc-employees-val');

    const hoursInput = document.getElementById('calc-hours');
    const hoursVal = document.getElementById('calc-hours-val');

    const costInput = document.getElementById('calc-cost');
    const costVal = document.getElementById('calc-cost-val');

    const savedInput = document.getElementById('calc-saved');
    const savedVal = document.getElementById('calc-saved-val');

    const implInput = document.getElementById('calc-impl');
    const opInput = document.getElementById('calc-op');

    // Result DOM Elements
    const resTaskHours = document.getElementById('res-task-hours');
    const resHoursRecovered = document.getElementById('res-hours-recovered');
    const resMonthlyHours = document.getElementById('res-monthly-hours');
    const resValueRecovered = document.getElementById('res-value-recovered');
    const resOperatingCost = document.getElementById('res-operating-cost');
    const resNetBenefit = document.getElementById('res-net-benefit');
    const resRoi = document.getElementById('res-roi');

    function formatNumber(num) {
      return new Intl.NumberFormat('en-US').format(Math.round(num));
    }

    function formatCurrency(val) {
      const sym = currencySymbols[currency];
      return `${sym}${formatNumber(val)}`;
    }

    function calculate() {
      const employees = Math.max(1, parseInt(employeesInput?.value || 5, 10));
      const weeklyHours = Math.max(1, parseInt(hoursInput?.value || 8, 10));
      const hourlyCost = Math.max(1, parseFloat(costInput?.value || (currency === 'USD' ? 35 : 1500)));
      const timeSavedPercent = Math.min(100, Math.max(1, parseFloat(savedInput?.value || 40)));
      const implementationCost = Math.max(0, parseFloat(implInput?.value || 0));
      const monthlyOperatingCost = Math.max(0, parseFloat(opInput?.value || 0));

      // Formulas as specified:
      // Annual task hours = employees × weekly hours per employee × 52
      const annualTaskHours = employees * weeklyHours * 52;

      // Annual labour cost attributable to the task = annual task hours × hourly employee cost
      const annualLabourCost = annualTaskHours * hourlyCost;

      // Estimated annual hours recovered = annual task hours × time-saving percentage
      const annualHoursRecovered = annualTaskHours * (timeSavedPercent / 100);

      // Monthly hours recovered = annual hours recovered / 12
      const monthlyHoursRecovered = annualHoursRecovered / 12;

      // Estimated annual value of time recovered = annual labour cost × time-saving percentage
      const annualValueRecovered = annualLabourCost * (timeSavedPercent / 100);

      // Annual operating cost = monthly operating cost × 12
      const annualOperatingCost = monthlyOperatingCost * 12;

      // Estimated first-year net benefit = annual value of time recovered − annual operating cost − implementation cost
      const firstYearNetBenefit = annualValueRecovered - annualOperatingCost - implementationCost;

      // Estimated first-year ROI = (first-year net benefit ÷ implementation cost) × 100
      let roiString = 'N/A';
      if (implementationCost > 0) {
        const roiPercent = Math.round((firstYearNetBenefit / implementationCost) * 100);
        roiString = `${roiPercent > 0 ? '+' : ''}${roiPercent}%`;
      } else {
        roiString = 'N/A (No upfront cap)';
      }

      // Update Slider Label Displays
      if (employeesVal) employeesVal.textContent = `${employees} people`;
      if (hoursVal) hoursVal.textContent = `${weeklyHours} hrs/wk`;
      if (costVal) costVal.textContent = `${currencySymbols[currency]}${hourlyCost}/hr`;
      if (savedVal) savedVal.textContent = `${timeSavedPercent}%`;

      // Update Results Cards
      if (resTaskHours) resTaskHours.textContent = `${formatNumber(annualTaskHours)} hrs`;
      if (resHoursRecovered) resHoursRecovered.textContent = `${formatNumber(annualHoursRecovered)} hrs/yr`;
      if (resMonthlyHours) resMonthlyHours.textContent = `${formatNumber(monthlyHoursRecovered)} hrs/mo`;
      if (resValueRecovered) resValueRecovered.textContent = formatCurrency(annualValueRecovered);
      if (resOperatingCost) resOperatingCost.textContent = formatCurrency(annualOperatingCost);
      if (resNetBenefit) resNetBenefit.textContent = formatCurrency(firstYearNetBenefit);
      if (resRoi) resRoi.textContent = roiString;
    }

    // Currency Switcher
    curUsdBtn?.addEventListener('click', () => {
      if (currency === 'USD') return;
      currency = 'USD';
      curUsdBtn.classList.add('active');
      curInrBtn.classList.remove('active');

      // Adjust defaults to USD scale
      if (costInput) {
        costInput.min = '10';
        costInput.max = '200';
        costInput.value = '35';
      }
      if (implInput) implInput.value = '4500';
      if (opInput) opInput.value = '250';
      calculate();
    });

    curInrBtn?.addEventListener('click', () => {
      if (currency === 'INR') return;
      currency = 'INR';
      curInrBtn.classList.add('active');
      curUsdBtn.classList.remove('active');

      // Adjust defaults to INR scale
      if (costInput) {
        costInput.min = '300';
        costInput.max = '10000';
        costInput.value = '1500';
      }
      if (implInput) implInput.value = '180000';
      if (opInput) opInput.value = '15000';
      calculate();
    });

    // Input Event Listeners
    [employeesInput, hoursInput, costInput, savedInput, implInput, opInput].forEach(elem => {
      elem?.addEventListener('input', calculate);
      elem?.addEventListener('change', calculate);
    });

    // Initialize initial calculations
    calculate();
  }

  /* ==========================================================================
     3. ORIGINYX METHOD (5-STAGE STEPPER)
     ========================================================================== */
  function initMethodStepper() {
    const stageButtons = document.querySelectorAll('.home-stage-btn');
    const badgeEl = document.getElementById('stage-detail-badge');
    const questionEl = document.getElementById('stage-detail-question');
    const descEl = document.getElementById('stage-detail-desc');
    const pointsListEl = document.getElementById('stage-detail-points');
    const visualContentEl = document.getElementById('stage-detail-visual');

    const stagesData = [
      {
        num: 1,
        title: 'Understand',
        badge: 'Stage 1 — Operational Discovery',
        question: 'What is happening today?',
        desc: 'Understand who performs the work, what tools are involved, and where delays or repetitive effort occur. We shadow existing workflows, document daily handoffs, and audit data fragmentation across spreadsheets, communication channels, and SaaS tools.',
        points: [
          'Detailed mapping of daily tasks and human touchpoints',
          'Audit of current software stack, APIs, and data silos',
          'Cataloging edge cases, manual workarounds, and error hotspots'
        ],
        visual: `
          <div style="text-align: center; max-width: 260px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">🔍</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Workflow Diagnostic</div>
            <p style="font-size: 0.825rem; color: #64748b; margin: 0;">Shadowing real human operations without disrupting existing daily client deliverables.</p>
          </div>
        `
      },
      {
        num: 2,
        title: 'Find Bottlenecks',
        badge: 'Stage 2 — Constraint Identification',
        question: 'Where is time or opportunity being lost?',
        desc: 'Identify the exact processes that consume excessive hours, introduce human error, or limit responsiveness. We quantify operational latency—such as delayed response to high-intent leads or hours spent transcribing data between systems.',
        points: [
          'Speed-to-lead and inquiry response time benchmarking',
          'Measurement of recurring hours wasted on administrative copying',
          'Prioritization matrix ranking friction points by business impact'
        ],
        visual: `
          <div style="text-align: center; max-width: 260px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">⏳</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Bottleneck Isolation</div>
            <p style="font-size: 0.825rem; color: #64748b; margin: 0;">Isolating high-friction steps that stall team capacity and customer conversion.</p>
          </div>
        `
      },
      {
        num: 3,
        title: 'Choose Approach',
        badge: 'Stage 3 — Architectural Blueprint',
        question: 'What is the simplest solution that addresses the problem?',
        desc: 'We don’t add AI for the sake of novelty. We evaluate workflow redesign, direct API integrations, event-driven webhooks, and purpose-built agentic intelligence to recommend the cleanest, most cost-effective architecture for your scale.',
        points: [
          'Objective evaluation: simple integration vs custom autonomous agent',
          'Data security architecture and privacy boundary verification',
          'Clear technical specification, milestone roadmap, and timeline'
        ],
        visual: `
          <div style="text-align: center; max-width: 260px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📐</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Pragmatic Architecture</div>
            <p style="font-size: 0.825rem; color: #64748b; margin: 0;">Selecting the minimal complexity required to completely eliminate the operational friction.</p>
          </div>
        `
      },
      {
        num: 4,
        title: 'Build & Connect',
        badge: 'Stage 4 — Engineering & Integration',
        question: 'How will the solution fit into the business?',
        desc: 'We build and deploy the system directly into your operational environment. Built using production-grade FastAPI microservices, Next.js, and Supabase PostgreSQL with robust fallback mechanisms and comprehensive error recovery.',
        points: [
          'Bi-directional integration with your existing CRM, database, and apps',
          'Strict tenant isolation, data encryption, and zero model training on company data',
          'End-to-end integration testing and automated regression checks'
        ],
        visual: `
          <div style="text-align: center; max-width: 260px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">⚡</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Seamless Deployment</div>
            <p style="font-size: 0.825rem; color: #64748b; margin: 0;">Zero workflow disruption. Your team continues work while the new system connects in background.</p>
          </div>
        `
      },
      {
        num: 5,
        title: 'Measure Impact',
        badge: 'Stage 5 — Continuous Validation',
        question: 'Did the improvement justify the investment?',
        desc: 'Review real performance against agreed business benchmarks: inquiry response times, hours recovered, data accuracy, and user adoption. We tune prompt behavior, optimize vector queries, and ensure lasting operational ROI.',
        points: [
          'Real-time observability dashboard tracking automated transactions',
          'Quantification of actual hours recovered and response latency improvements',
          'Post-deployment support, knowledge transfer, and scheduled optimization'
        ],
        visual: `
          <div style="text-align: center; max-width: 260px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">📊</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Verified ROI</div>
            <p style="font-size: 0.825rem; color: #64748b; margin: 0;">Live metrics proving turnaround speed, reduced overhead, and increased team output.</p>
          </div>
        `
      }
    ];

    function renderStage(index) {
      const data = stagesData[index];
      if (!data) return;

      // Update button active state
      stageButtons.forEach((btn, i) => {
        if (i === index) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });

      // Update text
      if (badgeEl) badgeEl.textContent = data.badge;
      if (questionEl) questionEl.textContent = data.question;
      if (descEl) descEl.textContent = data.desc;

      // Update bullet points
      if (pointsListEl) {
        pointsListEl.innerHTML = data.points
          .map(pt => `
            <div class="home-stage-point">
              <span class="home-stage-point-check">✓</span>
              <span>${pt}</span>
            </div>
          `)
          .join('');
      }

      // Update visual
      if (visualContentEl) {
        visualContentEl.innerHTML = data.visual;
      }
    }

    stageButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => renderStage(idx));
    });

    // Initialize with Stage 1
    renderStage(0);
  }

  /* ==========================================================================
     4. TECHNICAL SHOWCASE (5 ARCHITECTURE LAYERS)
     ========================================================================== */
  function initArchLayers() {
    const layerButtons = document.querySelectorAll('.home-arch-layer-btn');
    const headerTitleEl = document.getElementById('arch-detail-title');
    const headerBadgeEl = document.getElementById('arch-detail-badge');
    const descEl = document.getElementById('arch-detail-desc');
    const pillsContainerEl = document.getElementById('arch-detail-pills');
    const codeBoxEl = document.getElementById('arch-detail-code');
    const annotationEl = document.getElementById('arch-detail-annotation');
    const relationEl = document.getElementById('arch-detail-relation');

    const layersData = [
      {
        num: 1,
        title: 'Layer 1: Application & User Experience',
        statusText: 'Used in Production',
        statusClass: 'status-prod',
        desc: 'Delivers client and administrative portals using React and TypeScript within Next.js. Public landing pages utilize fast-loading vanilla HTML5 and custom Web Components (<ox-navbar>, <ox-footer>) to guarantee immediate First Contentful Paint (<0.6s) without JavaScript hydration delays.',
        pills: ['React 18', 'Next.js', 'TypeScript', 'Custom Web Components', 'Tailwind CSS', 'Vite Bundler'],
        code: `// Next.js & React Portal Entitlements Hook
export function useEntitlements(user: User | null) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role ?? 'member'));
  }, [user]);

  return { role, isOwner: role === 'owner', isAdmin: role === 'admin' };
}`,
        annotation: 'Plain Language: Manages user role-based permissions and interactive client portal views, dynamically adjusting navigation and view access after verifying session claims with the backend.',
        relation: 'Layer Relationship: Interacts with Layer 2 via authenticated HTTPS/WSS REST endpoints and Server-Sent Events (SSE).'
      },
      {
        num: 2,
        title: 'Layer 2: APIs & Application Logic',
        statusText: 'Used in Production',
        statusClass: 'status-prod',
        desc: 'Request routing, webhook verification, and core business application logic. Python FastAPI microservices handle asynchronous high-concurrency tasks with native Pydantic schema validation. Inbound webhooks from third-party services are verified, decoded, and dispatched into task queues within 35ms.',
        pills: ['Python 3.11+', 'FastAPI', 'Pydantic v2', 'Node.js Serverless', 'REST APIs', 'Webhooks'],
        code: `# FastAPI Webhook Ingestion with Async Task Hand-Off
@router.post("/v1/inbound/webhook", status_code=status.HTTP_202_ACCEPTED)
async def handle_inbound_lead(
    payload: InboundLeadPayload, 
    background_tasks: BackgroundTasks
):
    # Verify cryptographic signature from external gateway
    verify_webhook_signature(payload.raw_signature)
    
    # Offload heavy lead triage and CRM sync to background worker
    background_tasks.add_task(orchestrate_lead_triage, payload.data)
    
    return {"status": "enqueued", "event_id": payload.data.event_id}`,
        annotation: 'Plain Language: Instantly acknowledges incoming customer leads from external platforms, validates signature authenticity, and queues automated processing without keeping the client waiting.',
        relation: 'Layer Relationship: Receives verified requests from Layer 1, triggers Layer 4 decision workers, and commits persistent state into Layer 3.'
      },
      {
        num: 3,
        title: 'Layer 3: Data & Memory',
        statusText: 'Used in Production',
        statusClass: 'status-prod',
        desc: 'Multi-tenant relational database and embedding vector store. PostgreSQL (Supabase) acts as the primary system of record with Row-Level Security (RLS) policies enforcing complete tenant isolation at the database kernel level. Semantic embeddings reside in pgvector with HNSW indexing for rapid sub-15ms retrieval.',
        pills: ['PostgreSQL 15', 'Supabase RLS', 'pgvector (HNSW)', 'Redis', 'AES-256 Storage'],
        code: `-- PostgreSQL Kernel-Level Row Security & Vector Index
CREATE POLICY "tenant_data_isolation" ON public.client_records
FOR ALL USING (
  organization_id = (SELECT get_auth_org_id(auth.uid()))
);

-- Approximate Nearest Neighbor Index for Sub-15ms Vector Lookups
CREATE INDEX ON document_sections 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`,
        annotation: 'Plain Language: Enforces database security so that every customer only accesses their own records, and provides high-speed vector indexing to match queries with relevant documentation.',
        relation: 'Layer Relationship: Supplies persistent relational data and semantic context chunks to Layer 2 and Layer 4.'
      },
      {
        num: 4,
        title: 'Layer 4: Intelligence & Automation',
        statusText: 'Production & Active Dev',
        statusClass: 'status-prod',
        desc: 'Multi-model LLM orchestration with circuit breakers, strict output schema enforcement, and tool execution. If primary provider latency spikes or errors occur, the system fails over between Google Gemini, Claude, and OpenAI endpoints in under 200ms. All AI decisions pass through strict Pydantic parsers before execution.',
        pills: ['Google Gemini 2.0', 'Claude 3.5 Sonnet', 'OpenAI GPT-4o', 'Circuit Breakers', 'Structured Outputs', 'Celery Workers'],
        code: `# Resilient Multi-Provider Fallback with Schema Validation
class TriageDecision(BaseModel):
    intent: Literal['demo_request', 'quote', 'support']
    priority: int = Field(ge=1, le=5)
    requires_human_escalation: bool

async def evaluate_prospect(context: str) -> TriageDecision:
    try:
        # Primary low-latency model
        return await gemini_client.predict_structured(context, TriageDecision)
    except ProviderTimeoutException:
        # Instant circuit-breaker fallback to secondary provider
        return await claude_client.predict_structured(context, TriageDecision)`,
        annotation: 'Plain Language: Evaluates customer inquiries using enterprise AI models, automatically switching providers if one slows down, and forcing the output into structured data that business tools can rely on.',
        relation: 'Layer Relationship: Consumes knowledge context from Layer 3, executes tasks dispatched from Layer 2, and pushes streaming updates to Layer 1.'
      },
      {
        num: 5,
        title: 'Layer 5: Infrastructure & Operations',
        statusText: 'Used in Production',
        statusClass: 'status-prod',
        desc: 'Continuous integration, edge hosting, and operational telemetry. Deployed with automated static structure validation, GitHub Actions CI/CD workflows, Vercel edge caching, and centralized error logging to ensure production stability without manual intervention.',
        pills: ['Vercel Edge', 'GitHub Actions', 'Docker', 'Automated CI/CD', 'Sentry Logging', 'HTTPS / TLS 1.3'],
        code: `# GitHub Actions Production Verification & Static CI
name: Production Quality Check
on: [push, pull_request]
jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify DOM & Security Contracts
        run: node scripts/validate-dom-structure.js
      - name: Production Assembly
        run: npm run build`,
        annotation: 'Plain Language: Automatically tests every change, verifies security rules, and builds all application packages before deploying to global edge servers.',
        relation: 'Layer Relationship: Hosts, provisions, monitors, and secures Layers 1 through 4.'
      }
    ];

    function renderLayer(index) {
      const data = layersData[index];
      if (!data) return;

      // Update button selection
      layerButtons.forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });

      // Update Header
      if (headerTitleEl) headerTitleEl.textContent = data.title;
      if (headerBadgeEl) {
        headerBadgeEl.textContent = data.statusText;
        headerBadgeEl.className = `home-status-badge ${data.statusClass}`;
      }

      // Update Description
      if (descEl) descEl.textContent = data.desc;

      // Update Tech Pills
      if (pillsContainerEl) {
        pillsContainerEl.innerHTML = data.pills
          .map(pill => `<span class="home-arch-tech-pill">${pill}</span>`)
          .join('');
      }

      // Update Code Box
      if (codeBoxEl) {
        codeBoxEl.textContent = data.code;
      }

      // Update Annotation
      if (annotationEl) {
        annotationEl.textContent = data.annotation;
      }

      // Update Relationship
      if (relationEl) {
        relationEl.textContent = data.relation;
      }
    }

    layerButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => renderLayer(idx));
    });

    // Default to Layer 1
    renderLayer(0);
  }

  /* ==========================================================================
     5. 3D HERO TILT EFFECT
     ========================================================================== */
  function initHeroTilt() {
    const stage = document.querySelector('.home-ops-stage');
    if (!stage || window.innerWidth < 1024) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrapper = document.querySelector('.home-hero-visual-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 8;

      stage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    wrapper.addEventListener('mouseleave', () => {
      stage.style.transform = 'rotateY(-5deg) rotateX(4deg)';
    });
  }

  /* ==========================================================================
     6. BACK TO TOP
     ========================================================================== */
  function initBackToTop() {
    const btn = document.getElementById('home-back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

})();
