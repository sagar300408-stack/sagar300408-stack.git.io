const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Find modals block
const modalsStartStr = '<!-- ============ MODALS SYSTEM ============ -->';
const scriptsEndStr = '</body>';

const modalsStartIdx = indexHtml.indexOf(modalsStartStr);
const scriptsEndIdx = indexHtml.indexOf(scriptsEndStr, modalsStartIdx);

if (modalsStartIdx === -1 || scriptsEndIdx === -1) {
  console.error("Could not find modals or scripts block");
  process.exit(1);
}

// Extract modals + scripts block
let blockToInject = indexHtml.substring(modalsStartIdx, scriptsEndIdx).trim();

// Convert relative scripts to absolute
blockToInject = blockToInject.replace(/src="auth\.js"/g, 'src="/auth.js"');
blockToInject = blockToInject.replace(/src="script\.js"/g, 'src="/script.js"');

// Pages to patch
const dirs = ['insights', 'services', 'case-studies', 'about', 'contact', 'projects'];

// Recursive find
function getHtmlFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getHtmlFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.html')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const pages = [];
dirs.forEach(dir => {
  const dPath = path.join(root, dir);
  if (fs.existsSync(dPath)) {
    getHtmlFiles(dPath, pages);
  }
});

pages.forEach(p => {
  let content = fs.readFileSync(p, 'utf8');
  
  // Check if it already has the auth.js
  if (!content.includes('auth.js')) {
    // Find </body>
    const bodyEnd = content.indexOf('</body>');
    if (bodyEnd !== -1) {
      content = content.slice(0, bodyEnd) + '\n' + blockToInject + '\n' + content.slice(bodyEnd);
      fs.writeFileSync(p, content);
      console.log('Patched', p);
    }
  } else {
    // If it has auth.js but we need to ensure the block is there,
    // wait, we can just replace the old scripts block if needed.
    // For now, assume it's good if it has auth.js
    console.log('Already patched', p);
  }
});
