const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\acer\\OneDrive\\Documents\\GitHub\\sagar300408-stack.git.io';

const files = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'case-studies/index.html',
  'contact/index.html',
  'blog/index.html',
  'ai-workflow-automation/index.html',
  'autonomous-agents/index.html',
  'ai-receptionist/index.html',
  'enterprise-rag/index.html',
  'lead-generation-automation/index.html',
  'ai-for-real-estate/index.html',
  'ai-for-logistics/index.html',
  'ai-for-coaching-centers/index.html',
  'ai-automation-india/index.html',
  'projects/enterprise-rag/index.html',
  'projects/hunteros/index.html',
  'projects/hunteros-engage/index.html',
  'projects/lifeos/index.html',
  'projects/mission-control/index.html',
  'projects/ojas-ai/index.html',
  'projects/shadowos/index.html',
  'projects/sunny-ai-companion/index.html',
  'projects/swiftroute-ai/index.html'
];

function validate() {
  console.log(`Starting DOM static validation scan...\n`);
  let errorsTotal = 0;

  files.forEach(relPath => {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[MISSING] ${relPath}`);
      errorsTotal++;
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const issues = [];

    // 1. Check for duplicate IDs
    const idRegex = /id=["']([^"']+)["']/g;
    const idCount = {};
    let match;
    while ((match = idRegex.exec(content)) !== null) {
      const id = match[1];
      idCount[id] = (idCount[id] || 0) + 1;
    }
    const duplicateIds = Object.keys(idCount).filter(id => idCount[id] > 1);
    if (duplicateIds.length > 0) {
      issues.push(`Duplicate IDs found: ${duplicateIds.map(id => `"${id}" (${idCount[id]}x)`).join(', ')}`);
    }

    // 2. Verify existence of standard modals system IDs
    const requiredIds = [
      'modal-wrapper',
      'modal-backdrop',
      'start-project-modal',
      'automation-audit-modal',
      'project-interest-modal',
      'auth-modal',
      'project-request-modal',
      'navbar',
      'nav-links',
      'nav-sign-in-btn',
      'nav-profile-dropdown',
      'nav-profile-trigger',
      'dropdown-start-project',
      'dropdown-sign-out'
    ];

    requiredIds.forEach(id => {
      if (!idCount[id]) {
        issues.push(`Missing required element ID: "${id}"`);
      } else if (idCount[id] > 1) {
        // Already flagged under duplicate IDs, no need to duplicate error
      }
    });

    // 3. Verify modal target wiring
    const targetRegex = /data-modal-target=["']([^"']+)["']/g;
    while ((match = targetRegex.exec(content)) !== null) {
      const targetId = match[1];
      if (!idCount[targetId]) {
        issues.push(`CTA trigger points to non-existent modal ID: "${targetId}"`);
      }
    }

    // 4. Verify script loading paths and ordering
    const depth = relPath.split('/').filter(Boolean).length - 1;
    const prefix = '../'.repeat(depth);
    
    const expectedSupabase = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>';
    const expectedAuth = `<script src="${prefix}auth.js"></script>`;
    const expectedScript = `<script src="${prefix}script.js"></script>`;

    if (!content.includes(expectedSupabase)) {
      issues.push(`Missing or incorrect Supabase script loader. Expected: "${expectedSupabase}"`);
    }
    if (!content.includes(expectedAuth)) {
      issues.push(`Missing or incorrect auth.js script loader. Expected: "${expectedAuth}"`);
    }
    if (!content.includes(expectedScript)) {
      issues.push(`Missing or incorrect script.js script loader. Expected: "${expectedScript}"`);
    }

    // Check correct ordering
    const supabaseIdx = content.indexOf(expectedSupabase);
    const authIdx = content.indexOf(expectedAuth);
    const scriptIdx = content.indexOf(expectedScript);

    if (supabaseIdx !== -1 && authIdx !== -1 && authIdx < supabaseIdx) {
      issues.push('auth.js is loaded before Supabase CDN!');
    }
    if (authIdx !== -1 && scriptIdx !== -1 && scriptIdx < authIdx) {
      issues.push('script.js is loaded before auth.js!');
    }

    // 5. Verify SEO-friendly clean URLs in links
    const linkRegex = /href=["']([^"']+)["']/g;
    while ((match = linkRegex.exec(content)) !== null) {
      const href = match[1];
      // Skip external links, hashes, manifests, mailto, etc.
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.endsWith('.css') ||
        href.endsWith('.js') ||
        href.endsWith('.png') ||
        href.endsWith('.jpg') ||
        href.endsWith('.webmanifest') ||
        href.endsWith('.xml')
      ) {
        continue;
      }
      
      if (href.includes('.html')) {
        issues.push(`Found non-SEO-friendly URL extension in link: "${href}"`);
      }
    }

    if (issues.length > 0) {
      console.error(`[FAIL] ${relPath}:`);
      issues.forEach(iss => console.error(`  - ${iss}`));
      errorsTotal += issues.length;
    } else {
      console.log(`[PASS] ${relPath}`);
    }
  });

  console.log(`\nDOM static validation completed. Total issues found: ${errorsTotal}`);
  process.exit(errorsTotal > 0 ? 1 : 0);
}

validate();
