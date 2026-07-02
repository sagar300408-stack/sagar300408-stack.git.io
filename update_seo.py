import re

filepath = "case-studies/index.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update title and meta
content = re.sub(
    r'<title>AI Case Studies & Client Projects \| Originyx</title>\s*<meta name="description" content="Browse our portfolio of autonomous AI systems, custom agent workflows, logistics automation, and secure enterprise search engines built by Sagar M.">\s*<meta name="keywords" content="AI Portfolio, AI Case Studies, Sagar M Projects, HunterOS, ShadowOS, Tvira Receptionist, SwiftRoute AI">',
    '<title>AI Case Studies & Client Projects | Originyx</title>\n  <meta name="description" content="Explore Originyx\'s case studies on custom AI development. See how we\'ve built autonomous agent networks, enterprise RAG, and automated workflows for businesses.">\n  <meta name="keywords" content="AI Portfolio, AI Case Studies, Custom AI Development, AI Workflow Automation, Enterprise RAG Portfolio, Sagar M Projects">',
    content
)

# Fix brand.png
content = re.sub(
    r'<img src="\.\./brand\.png" alt="ORIGINYX" class="brand-img" height="24">',
    '<img src="../brand.png" alt="ORIGINYX" class="brand-img" width="100" height="24">',
    content
)

# Add schema
schema = """    ]
  }
  </script>

  <!-- Structured Data: CollectionPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Originyx AI Case Studies",
    "description": "Portfolio of AI workflow automation and custom AI agent projects by Originyx.",
    "url": "https://originyx.in/case-studies/",
    "publisher": {
      "@type": "Organization",
      "name": "Originyx",
      "url": "https://originyx.in/"
    }
  }
  </script>"""

content = content.replace("    ]\n  }\n  </script>", schema)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated case-studies/index.html")
