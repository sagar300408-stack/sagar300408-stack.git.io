import os
import re

filepath = r"C:\Users\acer\OneDrive\Documents\GitHub\sagar300408-stack.git.io\projects\shadowos\index.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Title and Meta Description
new_title = "<title>ShadowOS: AI-Powered Operational Intelligence & Process Mining by Originyx | Sagar M</title>"
new_desc = '<meta name="description" content="Discover ShadowOS by Originyx, engineered by Sagar M. An AI-powered Operational Intelligence platform utilizing FastAPI and PostgreSQL for workflow automation, process mining, and identifying automation targets.">'
content = re.sub(r'<title>.*?</title>', new_title, content)
content = re.sub(r'<meta name="description" content=".*?">', new_desc, content)

content = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{new_title.replace("<title>","").replace("</title>","")}">', content)
content = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{new_desc.split(\'content="\')[1][:-2]}">', content)
content = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{new_title.replace("<title>","").replace("</title>","")}">', content)
content = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{new_desc.split(\'content="\')[1][:-2]}">', content)

# 2. Add structured data JSON-LD schema
schema_str = """
  <!-- Structured Data: Breadcrumb, SoftwareApplication, TechArticle, CreativeWork, FAQ schemas -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": "https://originyx.in/projects/shadowos/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://originyx.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Case Studies",
            "item": "https://originyx.in/case-studies/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "ShadowOS",
            "item": "https://originyx.in/projects/shadowos/"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://originyx.in/projects/shadowos/#software",
        "name": "ShadowOS",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "softwareVersion": "1.0",
        "description": "ShadowOS is an AI-powered Operational Intelligence Platform designed by Originyx to analyze business workflows, uncover inefficiencies, and identify automation opportunities.",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD",
          "description": "Custom enterprise licensing and workflow automation consulting"
        },
        "brand": {
          "@type": "Brand",
          "name": "Originyx"
        },
        "author": {
          "@type": "Person",
          "name": "Sagar M"
        }
      },
      {
        "@type": "TechArticle",
        "@id": "https://originyx.in/projects/shadowos/#article",
        "headline": "ShadowOS: AI-Powered Operational Intelligence & Process Mining",
        "description": "Technical case study of ShadowOS, built by Sagar M and Originyx, exploring process mining, FastAPI, and workflow optimization.",
        "author": {
          "@type": "Person",
          "name": "Sagar M"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Originyx"
        }
      },
      {
        "@type": "CreativeWork",
        "@id": "https://originyx.in/projects/shadowos/#creativework",
        "name": "ShadowOS Case Study",
        "creator": {
          "@type": "Person",
          "name": "Sagar M"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://originyx.in/projects/shadowos/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is ShadowOS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ShadowOS is an AI-powered Operational Intelligence Platform designed by Originyx. It observes and analyzes business workflows, uncovers hidden inefficiencies, highlights bottleneck locations, and identifies high-impact automation opportunities before any revenue is lost."
            }
          },
          {
            "@type": "Question",
            "name": "How does ShadowOS discover operational inefficiencies?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ShadowOS connects to business datasets, systems, and workflow history. By mapping dependencies and tracing handoffs, it creates a visual simulation of the current process, identifies where friction is concentrated, and highlights manual loops that slow down growth."
            }
          },
          {
            "@type": "Question",
            "name": "Does ShadowOS integrate with existing systems?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, ShadowOS utilizes APIs and secure webhooks to integrate with core business platforms, CRMs like Salesforce and HubSpot, databases, and custom spreadsheets, ensuring clean data normalization without interrupting current business logic."
            }
          }
        ]
      }
    ]
  }
  </script>
"""
# Replace the existing script application/ld+json
content = re.sub(r'<script type="application/ld\+json">.*?</script>', schema_str, content, flags=re.DOTALL)

# 3. Update <img> tags to include alt, width, height, loading="lazy"
content = content.replace('<img src="../../brand.png" alt="ORIGINYX" class="brand-img" height="24">', '<img src="../../brand.png" alt="ORIGINYX" class="brand-img" width="100" height="24" loading="lazy">')
content = content.replace('<img src="../../thumbnails/shadowos.png" alt="ShadowOS Dashboard Mockup" style="width: 100%; height: auto;" fetchpriority="high">', '<img src="../../thumbnails/shadowos.png" alt="ShadowOS Dashboard Mockup" width="400" height="300" style="width: 100%; height: auto;" fetchpriority="high" loading="lazy">')
content = content.replace('<img src="../../logo.png" alt="ORIGINYX Logo" class="logo-img" width="32" height="32">', '<img src="../../logo.png" alt="ORIGINYX Logo" class="logo-img" width="32" height="32" loading="lazy">')

# 4. Expand HTML Content
new_body_content = """
        <!-- Problem -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--rose);">
          <h2 style="margin-top: 0; color: var(--rose); font-family: var(--font-serif);">Problem</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-sm);">
            Modern organizations are drowning in process complexity. While teams use modern SaaS platforms (like CRMs, accounting portals, and ticketing tools), a significant amount of day-to-day operations occurs in 'shadow workflows'—namely local spreadsheets, manual email copy-pasting, chat threads, and unrecorded personal checklists. This creates massive fragmentation where leadership has zero visibility into how work is actually executed.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-sm);">
            As explored by <strong style="color: var(--text-primary);">Sagar M</strong> and the team at <strong style="color: var(--text-primary);">Originyx</strong>, this lack of process clarity leads to silent revenue leakage due to process delays, double-handling of customer records, and unresolved bottlenecks. When companies try to automate workflows, they often target the wrong processes, wasting engineering capital.
          </p>
        </div>

        <!-- Business Context -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--accent);">
          <h2 style="margin-top: 0; color: var(--accent); font-family: var(--font-serif);">Business Context</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-sm);">
            The enterprise environment requires continuous operational intelligence. Without diagnostic data, automation initiatives fail because they build on top of broken, unoptimized workflows. Originyx designed ShadowOS as an observation and diagnostic layer to identify double-handling and repetitious data transfers.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Operations teams, growth-stage startups, and enterprise organizations in real estate and professional services need a platform like ShadowOS to compute financial waste and build clean transition blueprints for software developers.
          </p>
        </div>

        <!-- Technical Architecture -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Technical Architecture</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-md);">
            ShadowOS uses a secure, non-intrusive pipeline powered by robust backend technologies, spearheaded by Sagar M. The backend relies heavily on <strong style="color: var(--text-primary);">FastAPI</strong> for high-performance, asynchronous REST APIs and <strong style="color: var(--text-primary);">PostgreSQL</strong> for complex relational queries and event storage.
          </p>
          <div class="glass-card" style="padding: var(--space-xl); background: var(--bg-secondary); margin-bottom: var(--space-md);">
            <ul style="padding-left: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md);">
              <li>
                <strong>Event Ingestion Node (FastAPI):</strong> Connects securely to CDC systems and APIs. Uses Pydantic for data validation, transforming fragmented fields into a normalized schema.
              </li>
              <li>
                <strong>Relational Event Store (PostgreSQL):</strong> Scalable storage capable of handling massive volumes of system logs and workflow telemetry.
              </li>
              <li>
                <strong>Graph-Based Dependency Miner:</strong> Constructs hierarchical directed graphs mapping process pathways, detecting looping behaviors and parallel execution.
              </li>
            </ul>
          </div>
        </div>

        <!-- Workflow -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--green);">
          <h2 style="margin-top: 0; color: var(--green); font-family: var(--font-serif);">Workflow</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-md);">
            The workflow within ShadowOS is seamless and automated:
          </p>
          <ol style="padding-left: var(--space-lg); color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--space-xs);">
            <li><strong>Ingestion:</strong> Telemetry from CRMs and internal tools flows into the FastAPI endpoints.</li>
            <li><strong>Normalization:</strong> Pydantic models validate and structure data in PostgreSQL.</li>
            <li><strong>Analysis:</strong> AI reasoning engines flag operational waste and compliance risks.</li>
            <li><strong>Simulation:</strong> The platform runs 'what-if' automation scenarios.</li>
            <li><strong>Reporting:</strong> Executive intelligence reports are synthesized, detailing ROI and prioritizing development.</li>
          </ol>
        </div>

        <!-- Technology Stack -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Technology Stack</h2>
          <div class="features-detail-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-lg);">
            <div class="glass-card" style="padding: var(--space-lg);">
              <h3 style="margin-bottom: var(--space-xs); font-size: 1.15rem;">FastAPI & Python</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Powers the high-throughput ingestion APIs and AI orchestration layer.</p>
            </div>
            <div class="glass-card" style="padding: var(--space-lg);">
              <h3 style="margin-bottom: var(--space-xs); font-size: 1.15rem;">PostgreSQL</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Robust relational database for storing complex event logs and system metadata.</p>
            </div>
            <div class="glass-card" style="padding: var(--space-lg);">
              <h3 style="margin-bottom: var(--space-xs); font-size: 1.15rem;">TypeScript & React</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Drives the interactive dashboard for workflow simulations and insights.</p>
            </div>
            <div class="glass-card" style="padding: var(--space-lg);">
              <h3 style="margin-bottom: var(--space-xs); font-size: 1.15rem;">LLMs (OpenAI/Anthropic)</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Provides natural language synthesis and operational bottleneck reasoning.</p>
            </div>
          </div>
        </div>

        <!-- Implementation -->
        <div class="glass-card" style="padding: var(--space-2xl);">
          <h2 style="margin-top: 0; font-family: var(--font-serif);">Implementation</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            The implementation of ShadowOS by Originyx involved integrating numerous fragmented APIs into a unified event stream. Sagar M and the engineering team deployed FastAPI microservices to handle concurrent webhooks from platforms like Salesforce and Jira. Utilizing process mining algorithms, the system translates timestamped activities into visual workflow graphs.
          </p>
        </div>

        <!-- Challenges -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--rose);">
          <h2 style="margin-top: 0; color: var(--rose); font-family: var(--font-serif);">Challenges</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-sm);">
            A major challenge was dealing with unstructured, missing, or inconsistent event data across different enterprise tools. Normalizing this into PostgreSQL required dynamic schema mapping.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Additionally, performing graph analysis on millions of nodes in real-time posed latency issues. We introduced asynchronous processing and optimized graph queries to reduce analysis times by 80%.
          </p>
        </div>

        <!-- Results -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Results</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-md);">
            <div class="glass-card" style="padding: var(--space-xl); text-align: center;">
              <h3 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 2px;">65%</h3>
              <span style="font-size: 0.85rem; text-transform: uppercase; font-family: var(--font-mono); color: var(--text-secondary);">Cycle Time Reduction</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: var(--space-sm);">Operational workflows simplified by removing redundant steps.</p>
            </div>
            <div class="glass-card" style="padding: var(--space-xl); text-align: center;">
              <h3 style="font-size: 2.2rem; color: var(--accent); margin-bottom: 2px;">$120K+</h3>
              <span style="font-size: 0.85rem; text-transform: uppercase; font-family: var(--font-mono); color: var(--text-secondary);">Labor Cost Savings</span>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: var(--space-sm);">High-volume repetitive data entries eliminated per quarter.</p>
            </div>
          </div>
        </div>

        <!-- Future Improvements -->
        <div class="glass-card" style="padding: var(--space-2xl); border-left: 4px solid var(--green);">
          <h2 style="margin-top: 0; color: var(--green); font-family: var(--font-serif);">Future Improvements</h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 0;">
            Looking ahead, Originyx plans to introduce automated remediation agents. Once a bottleneck is identified, ShadowOS will not only simulate the fix but also generate and deploy the Python automation scripts directly into the client's environment. We are also expanding PostgreSQL integrations with vector databases to support semantic search over workflow archives.
          </p>
        </div>

        <!-- FAQ Section -->
        <div>
          <h2 style="font-family: var(--font-serif); margin-bottom: var(--space-md);">Frequently Asked Questions</h2>
          <div style="display: flex; flex-direction: column; gap: var(--space-md);">
            <div class="glass-card" style="padding: var(--space-lg);">
              <h4 style="margin-bottom: var(--space-xs); font-family: var(--font-serif);">What makes ShadowOS different from traditional business intelligence (BI) tools?</h4>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">
                Traditional BI platforms query static databases to display outcomes. ShadowOS tracks process behaviors. It maps the paths, sequence, timing, and transitions of actions across multiple systems to reconstruct how the work occurred, providing actionable automation targets.
              </p>
            </div>
            <div class="glass-card" style="padding: var(--space-lg);">
              <h4 style="margin-bottom: var(--space-xs); font-family: var(--font-serif);">Does implementing ShadowOS require installing tracking software?</h4>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0;">
                No. ShadowOS utilizes system-level event logs and API logs from platforms like Salesforce and Jira via secure FastAPI webhooks, ensuring a privacy-first, non-intrusive environment.
              </p>
            </div>
          </div>
        </div>
"""

start_marker = "<!-- The Problem -->"
end_marker = "</div>\\n\\n      <!-- Right Column: Tech Stack Panel -->"

# Let's find the indices manually using regex pattern search to be robust against spacing
pattern = re.compile(r'(<!-- The Problem -->.*?)(</div>\s*<!-- Right Column: Tech Stack Panel -->)', re.DOTALL)
content = pattern.sub(new_body_content + r'\n      \2', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("HTML file successfully optimized.")
