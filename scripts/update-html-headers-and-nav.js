const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Helper to recursively find all HTML files excluding node_modules and .git
function findHtmlFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findHtmlFiles(fullPath, files);
      }
    } else if (file.endsWith('.html')) {
      files.push(fullPath);
    }
  });
  return files;
}

function updateHtmlFiles() {
  const htmlFiles = findHtmlFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files to update.\n`);

  htmlFiles.forEach(filePath => {
    const relativePath = path.relative(rootDir, filePath);
    const parts = relativePath.split(path.sep);
    const depth = parts.length - 1;
    const manifestPrefix = '../'.repeat(depth);
    const relativeManifestPath = manifestPrefix ? `${manifestPrefix}site.webmanifest` : 'site.webmanifest';

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Remove existing manifest link if any to avoid duplication
    const prevContent = content;
    content = content.replace(/<link rel="manifest" href="[^"]+">\s*/gi, '');
    content = content.replace(/<meta name="theme-color" content="[^"]+">\s*/gi, '');

    // 2. Insert viewport tags if not already present
    const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    const viewportRegex = /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/i;

    if (viewportRegex.test(content)) {
      const injection = `\n  <meta name="theme-color" content="#000000">\n  <link rel="manifest" href="${relativeManifestPath}">`;
      content = content.replace(viewportRegex, match => match + injection);
      modified = true;
    } else {
      console.warn(`[WARNING] No standard viewport tag found in ${relativePath}`);
    }

    // 3. Strip Blog link from <div class="nav-links" id="nav-links">
    const navLinksRegex = /(<div class="nav-links"[^>]*>)([\s\S]*?)(<\/div>)/gi;
    if (navLinksRegex.test(content)) {
      content = content.replace(navLinksRegex, (match, p1, p2, p3) => {
        // Strip out the anchor tag for Blog (exactly matching case-insensitively)
        const updatedP2 = p2.replace(/<a\s+[^>]*href="[^"]*"(?:\s+[^>]*)?>Blog<\/a>\s*/gi, '');
        return p1 + updatedP2 + p3;
      });
      modified = true;
    }

    if (content !== prevContent || modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[UPDATED] ${relativePath} (manifest: ${relativeManifestPath})`);
    } else {
      console.log(`[NO CHANGE] ${relativePath}`);
    }
  });

  console.log('\nHTML header and navigation updates completed.');
}

updateHtmlFiles();
