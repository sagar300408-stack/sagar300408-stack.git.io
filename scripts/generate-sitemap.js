const fs = require('fs');
const path = require('path');

const domain = 'https://originyx.ai';
const rootDir = path.resolve(__dirname, '..');

// Hardcoded core pages and their configurations
const coreUrls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/case-studies/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/contact/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog/', priority: '0.7', changefreq: 'weekly' },
  { loc: '/ai-workflow-automation/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/autonomous-agents/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/ai-receptionist/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/enterprise-rag/', priority: '0.9', changefreq: 'monthly' },
  { loc: '/lead-generation-automation/', priority: '0.9', changefreq: 'monthly' }
];

function generateSitemap() {
  const sitemapItems = [];
  const currentDate = new Date().toISOString().split('T')[0];

  // Add core pages
  coreUrls.forEach(item => {
    sitemapItems.push(`  <url>
    <loc>${domain}${item.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`);
  });

  // Scan projects directory
  const projectsDir = path.join(rootDir, 'projects');
  if (fs.existsSync(projectsDir)) {
    const projects = fs.readdirSync(projectsDir).filter(file => {
      const fullPath = path.join(projectsDir, file);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'index.html'));
    });

    projects.forEach(proj => {
      sitemapItems.push(`  <url>
    <loc>${domain}/projects/${proj}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems.join('\n')}
</urlset>`;

  const sitemapPath = path.join(rootDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Successfully generated sitemap at ${sitemapPath}`);
}

generateSitemap();
