const fs = require('fs');
const path = require('path');

const excludeDirs = ['admin', 'node_modules', '.git'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!excludeDirs.some(ex => file.includes(path.sep + ex) || file.endsWith(ex))) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.html') && !file.includes('admin')) {
                results.push(file);
            }
        }
    });
    return results;
}

const htmlFiles = walk(__dirname + '/..');

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Inject scripts to head if not present
    if (!content.includes('ox-navbar.js')) {
        content = content.replace('</head>', '  <script src="/components/ox-navbar.js" defer></script>\n  <script src="/components/ox-footer.js" defer></script>\n</head>');
        changed = true;
    }

    // Replace navbar
    const navRegex = /<!-- ============ NAVIGATION ============ -->[\s\S]*?<\/nav>/;
    if (navRegex.test(content)) {
        content = content.replace(navRegex, '<ox-navbar></ox-navbar>');
        changed = true;
    }

    // Replace footer
    const footerRegex = /<!-- ============ FOOTER ============ -->[\s\S]*?<\/footer>[\s\S]*?<!-- ============ BACK TO TOP ============ -->[\s\S]*?<\/button>/;
    if (footerRegex.test(content)) {
        content = content.replace(footerRegex, '<ox-footer></ox-footer>');
        changed = true;
    }

    // Secondary fallback for footer without BACK TO TOP button just in case
    const footerRegex2 = /<!-- ============ FOOTER ============ -->[\s\S]*?<\/footer>/;
    if (footerRegex2.test(content) && !content.includes('<ox-footer></ox-footer>')) {
         content = content.replace(footerRegex2, '<ox-footer></ox-footer>');
         changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log('Done refactoring HTML files.');
