import re
import json

file_path = r"C:\Users\acer\OneDrive\Documents\GitHub\sagar300408-stack.git.io\projects\mission-control\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Title, Meta, OG, Twitter
old_meta = """  <!-- SEO Meta Tags -->
  <title>Mission Control — Centralized AI Operations & Command Center | Originyx</title>
  <meta name="description" content="Mission Control is a centralized AI-driven command and operational intelligence platform designed by Originyx to monitor, manage, and optimize business processes in real-time.">
  <meta name="keywords" content="Mission Control, AI Operations, Command Center, Operational Intelligence, Sagar M Portfolio, Originyx">
  <meta name="author" content="Sagar M">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://originyx.in/projects/mission-control/">

  <!-- Search Console Verification Support -->
  <meta name="google-site-verification" content="GSC_VERIFICATION_TOKEN_HERE">
  <meta name="msvalidate.01" content="BING_VERIFICATION_TOKEN_HERE">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Mission Control — Centralized AI Operations & Command Center | Originyx">
  <meta property="og:description" content="Unify your operational data, monitor workflows, and drive decision-making in real-time with an AI-powered command center.">
  <meta property="og:url" content="https://originyx.in/projects/mission-control/">
  <meta property="og:image" content="https://originyx.in/thumbnails/missioncontrol-og.png">
  <meta property="og:site_name" content="Originyx">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Mission Control — Centralized AI Command Center | Originyx">
  <meta name="twitter:description" content="Integrate your fragmented business systems and orchestrate operational intelligence 24/7 with Mission Control by Originyx.">
  <meta name="twitter:image" content="https://originyx.in/thumbnails/missioncontrol-og.png">"""

new_meta = """  <!-- SEO Meta Tags -->
  <title>Mission Control - AI Operations & Command Center by Sagar M | Originyx</title>
  <meta name="description" content="Mission Control by Originyx, developed by Sagar M, is a centralized AI command center utilizing FastAPI and PostgreSQL to monitor, manage, and optimize real-time business operations.">
  <meta name="keywords" content="Mission Control, AI Operations, Command Center, Operational Intelligence, Sagar M Portfolio, Originyx, FastAPI, PostgreSQL">
  <meta name="author" content="Sagar M">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://originyx.in/projects/mission-control/">

  <!-- Search Console Verification Support -->
  <meta name="google-site-verification" content="GSC_VERIFICATION_TOKEN_HERE">
  <meta name="msvalidate.01" content="BING_VERIFICATION_TOKEN_HERE">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Mission Control - AI Operations & Command Center by Sagar M">
  <meta property="og:description" content="Unify your operational data, monitor workflows, and drive decision-making in real-time with an AI-powered command center. Engineered by Sagar M for Originyx.">
  <meta property="og:url" content="https://originyx.in/projects/mission-control/">
  <meta property="og:image" content="https://originyx.in/thumbnails/missioncontrol-og.png">
  <meta property="og:image:alt" content="Mission Control Dashboard Mockup">
  <meta property="og:site_name" content="Originyx">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@originyx">
  <meta name="twitter:creator" content="@sagar_m">
  <meta name="twitter:title" content="Mission Control - AI Operations & Command Center by Originyx">
  <meta name="twitter:description" content="Integrate your fragmented business systems and orchestrate operational intelligence 24/7 with Mission Control. Built by Sagar M.">
  <meta name="twitter:image" content="https://originyx.in/thumbnails/missioncontrol-og.png">"""

content = content.replace(old_meta, new_meta)

# 2. JSON-LD schema
old_schema_start = '  <!-- Structured Data: Breadcrumb, SoftwareApplication, and FAQ schemas -->\n  <script type="application/ld+json">'
old_schema_end = '  </script>'

# Extract the old schema to replace it
schema_pattern = re.compile(r'<!-- Structured Data: Breadcrumb, SoftwareApplication, and FAQ schemas -->\s*<script type="application/ld\+json">.*?</script>', re.DOTALL)

new_schema = """<!-- Structured Data: Comprehensive JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": "https://originyx.in/projects/mission-control/#breadcrumb",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://originyx.in/" },
          { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": "https://originyx.in/case-studies/" },
          { "@type": "ListItem", "position": 3, "name": "Mission Control", "item": "https://originyx.in/projects/mission-control/" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://originyx.in/projects/mission-control/#software",
        "name": "Mission Control",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "softwareVersion": "1.0.0",
        "description": "Centralized AI-driven operational command platform by Originyx using FastAPI and PostgreSQL to monitor, manage, and optimize business processes.",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD",
          "description": "Custom enterprise deployment and operational intelligence consulting"
        },
        "brand": {
          "@type": "Brand",
          "name": "Originyx"
        },
        "creator": {
          "@type": "Person",
          "name": "Sagar M",
          "url": "https://originyx.in/about/"
        }
      },
      {
        "@type": "TechArticle",
        "@id": "https://originyx.in/projects/mission-control/#article",
        "headline": "Mission Control - AI Operations & Command Center",
        "description": "Technical case study of Mission Control, an AI operational command platform built by Originyx.",
        "author": {
          "@type": "Person",
          "name": "Sagar M",
          "url": "https://originyx.in/about/"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Originyx",
          "logo": {
            "@type": "ImageObject",
            "url": "https://originyx.in/logo.png"
          }
        },
        "mainEntityOfPage": "https://originyx.in/projects/mission-control/",
        "about": [
          { "@type": "Thing", "name": "AI Operations" },
          { "@type": "ProgrammingLanguage", "name": "TypeScript" },
          { "@type": "ProgrammingLanguage", "name": "Python" },
          { "@type": "Thing", "name": "FastAPI" },
          { "@type": "Thing", "name": "PostgreSQL" }
        ]
      },
      {
        "@type": "CreativeWork",
        "name": "Mission Control Technical Architecture",
        "creator": {
          "@type": "Person",
          "name": "Sagar M"
        }
      }
    ]
  }
  </script>"""

content = schema_pattern.sub(new_schema, content)


# 3. Image SEO
# Navbar logos
content = content.replace(
    '<img src="../../logo.png" alt="ORIGINYX Logo" class="logo-img" width="32" height="32">',
    '<img src="../../logo.png" alt="Originyx Logo - AI Systems" class="logo-img" width="32" height="32" loading="lazy">'
)
content = content.replace(
    '<img src="../../brand.png" alt="ORIGINYX" class="brand-img" height="24">',
    '<img src="../../brand.png" alt="Originyx Brand Name" class="brand-img" width="100" height="24" loading="lazy">'
)

# Hero image
content = content.replace(
    '<img src="../../thumbnails/missioncontrol.png" alt="Mission Control Dashboard Mockup" style="width: 100%; height: auto;" fetchpriority="high">',
    '<img src="../../thumbnails/missioncontrol.png" alt="Mission Control Dashboard Mockup showing real-time AI operations and FastAPI backend integration" width="400" height="300" style="width: 100%; height: auto;" fetchpriority="high" loading="lazy">'
)

# 4. Expand HTML Content (Left Column Body)
old_body_start = '      <!-- Left Column: Case Study Details -->\n      <div class="project-body" style="display: flex; flex-direction: column; gap: var(--space-2xl);">'
old_body_end = '      <!-- Right Column: Tech Stack Panel -->'

body_pattern = re.compile(r'<!-- Left Column: Case Study Details -->\s*<div class="project-body" style="display: flex; flex-direction: column; gap: var(--space-2xl);">.*?</div>\s*<!-- Right Column: Tech Stack Panel -->', re.DOTALL)

new_body = """<!-- Left Column: Case Study Details -->
      <div class="project-body" style="display: flex; flex-direction: column; gap: var(--space-2xl);">
        
        <!-- The Problem -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--rose);">
          <h2 style="margin-top: 0; color: var(--rose); font-family: var(--font-serif);">Problem Statement</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-sm);">
            Modern scaling businesses use an average of ten to fifteen disconnected software tools to run daily operations. Sales activities live in CRM databases, engineering tasks are tracked in issue boards, marketing metrics accumulate in analytics suites, and customer support conversations reside in separate help desks. This software fragmentation creates extensive operational silos.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Because these tools do not natively communicate, organizations face significant friction. Important operational bottlenecks are identified too late. Reactive management becomes the standard mode of operation, causing customer churn and lost revenue opportunities.
          </p>
        </div>

        <!-- Business Context -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--accent);">
          <h2 style="margin-top: 0; color: var(--accent); font-family: var(--font-serif);">Business Context</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Developed by <strong>Sagar M</strong> at <strong>Originyx</strong>, Mission Control was conceived to solve this very disconnect. The goal was to build a comprehensive, AI-enhanced command center that delivers instant ROI by surfacing hidden workflow frictions, ultimately transitioning teams from reactive firefighting to proactive strategy.
          </p>
        </div>

        <!-- Technical Architecture -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Technical Architecture</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-md);">
            To maintain high data integrity and absolute responsiveness, <strong>Originyx</strong> engineered a multi-tier operational pipeline driven by modern technologies like <strong>FastAPI</strong> and <strong>PostgreSQL</strong>:
          </p>
          <div class="glass-card" style="padding: var(--space-xl); background: var(--bg-secondary); margin-bottom: var(--space-md);">
            <ol style="padding-left: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md);">
              <li>
                <strong>Unified Ingestion Engine</strong>: Powered by <strong>FastAPI</strong>, this async layer collects event payloads via webhook endpoints and scheduled API polling routines, filtering noise securely.
              </li>
              <li>
                <strong>Operational Event Ledger</strong>: A robust <strong>PostgreSQL</strong> database commits normalized events, tracking user actions and operational timestamps chronologically with optimized indexing.
              </li>
              <li>
                <strong>Real-Time Analytics Layer</strong>: Broadcasts critical metric updates instantly via WebSocket connections backed by Redis pub/sub.
              </li>
              <li>
                <strong>AI Inference Node</strong>: Runs background analysis jobs that compare current operational speeds against historical averages to locate lag and predict risks.
              </li>
            </ol>
          </div>
        </div>
        
        <!-- Workflow -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--green);">
          <h2 style="margin-top: 0; color: var(--green); font-family: var(--font-serif);">Workflow</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            The system acts as a digital nervous system. Instead of migrating teams to a new software package, Mission Control securely connects to existing stacks. Data streams continuously flow into the <strong>PostgreSQL</strong> ledger where background AI agents execute continuous anomaly detection, raising alerts and generating executive briefs via WebSocket channels instantly.
          </p>
        </div>

        <!-- Technology Stack -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Technology Stack</h2>
          <ul style="padding-left: var(--space-lg); list-style-type: disc; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);">
            <li><strong>Backend API</strong>: FastAPI, Python</li>
            <li><strong>Database</strong>: PostgreSQL, Redis</li>
            <li><strong>Frontend</strong>: TypeScript, Next.js / Vanilla HTML/CSS</li>
            <li><strong>Real-time Comm</strong>: WebSockets</li>
            <li><strong>AI Integration</strong>: LLM APIs (OpenAI/Anthropic)</li>
          </ul>
        </div>
        
        <!-- Implementation -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--accent-light);">
          <h2 style="margin-top: 0; color: var(--accent-light); font-family: var(--font-serif);">Implementation</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            <strong>Sagar M</strong> led the implementation by first establishing a rigid data contract using Pydantic models in <strong>FastAPI</strong>. This ensured all incoming webhooks from external tools (CRM, GitHub, Jira) were sanitized before hitting the <strong>PostgreSQL</strong> data warehouse. The frontend was then built utilizing persistent WebSocket connections to reflect state changes sub-second.
          </p>
        </div>

        <!-- Challenges -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Challenges</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-md);">
            The primary challenge was normalizing highly varied data schemas from multiple third-party SaaS products into a unified timeline in <strong>PostgreSQL</strong> without degrading the <strong>FastAPI</strong> ingestion layer's response times. This was solved through async background tasks and event-driven micro-batching.
          </p>
        </div>

        <!-- Results -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Results</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
            <div class="glass-card" style="padding: var(--space-xl); text-align: center;">
              <h3 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 2px;">15+ Hours</h3>
              <span style="font-size: 0.85rem; text-transform: uppercase; font-family: var(--font-mono); color: var(--text-secondary);">Saved Per Week</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: var(--space-sm);">Managers spend less time scheduling alignment meetings and compiling status updates.</p>
            </div>
            <div class="glass-card" style="padding: var(--space-xl); text-align: center;">
              <h3 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 2px;">40% Faster</h3>
              <span style="font-size: 0.85rem; text-transform: uppercase; font-family: var(--font-mono); color: var(--text-secondary);">Anomaly Resolution</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: var(--space-sm);">Operational anomalies, checkout errors, and ticket backlogs are resolved before escalation.</p>
            </div>
          </div>
        </div>

        <!-- Future Improvements -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--text-muted); margin-top: var(--space-lg);">
          <h2 style="margin-top: 0; color: var(--text-primary); font-family: var(--font-serif);">Future Improvements</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Upcoming iterations of Mission Control aim to introduce autonomous remediation agents capable of taking corrective actions directly in connected platforms, alongside enhanced predictive forecasting powered by deep learning models deployed over the <strong>PostgreSQL</strong> database.
          </p>
        </div>

      </div>

      <!-- Right Column: Tech Stack Panel -->"""

content = body_pattern.sub(new_body, content)

# 5. Strengthen entity graph in other places if missed
content = content.replace(
    'Mission Control by Originyx is a centralized, production-grade operational command platform designed to monitor, manage, and optimize business processes.',
    'Mission Control by Originyx, architected by Sagar M, is a centralized, production-grade operational command platform utilizing FastAPI and PostgreSQL to monitor, manage, and optimize business processes.'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications completed.")
