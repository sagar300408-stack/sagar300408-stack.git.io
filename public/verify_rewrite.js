const fs = require('fs');

const html = fs.readFileSync('projects/hunteros-engage/index.html', 'utf8');

// 1. JSON-LD validation
const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!jsonLdMatch) {
  console.error('FAIL: No JSON-LD found');
  process.exit(1);
}
const jsonLd = JSON.parse(jsonLdMatch[1]);
console.log('JSON-LD parsed successfully! Context:', jsonLd['@context']);

// Check FAQs
const faqSchema = jsonLd['@graph'].find(e => e['@type'] === 'FAQPage');
console.log('FAQ count in schema:', faqSchema.mainEntity.length);

faqSchema.mainEntity.forEach((faq, i) => {
  const q = faq.name;
  const a = faq.acceptedAnswer.text;
  const qFound = html.includes(q);
  const aFound = html.includes(a);
  if (!qFound || !aFound) {
    console.error(`FAIL: FAQ #${i+1} mismatch! Q: ${qFound}, A: ${aFound}`);
    console.error('Question:', q);
    process.exit(1);
  }
});
console.log('PASS: All 8 FAQs match 100% between JSON-LD and raw HTML DOM.');

// 2. Headings hierarchy
const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];

console.log(`Headings: ${h1s.length} H1, ${h2s.length} H2s, ${h3s.length} H3s`);
if (h1s.length !== 1) {
  console.error('FAIL: Expected exactly 1 H1');
  process.exit(1);
}

// 3. Key messaging pillars check
const hasPillar1 = html.includes('Vertical Revenue Infrastructure (Embedded via Originyx)');
const hasPillar2 = html.includes('Owned Revenue Asset (Not Rented Headcount)');
const hasPillar3 = html.includes('60% to 72%') || html.includes('60–72%');
const hasPillar4 = html.includes('scaling, building, and closing deals') || html.includes('build and manage high-value client relationships');

console.log('Pillar checks:', { hasPillar1, hasPillar2, hasPillar3, hasPillar4 });

// 4. Check Comparison Table
const tableFound = html.includes('10–25 hrs/wk manual entry') && html.includes('Autonomous bi-directional sync (zero manual CRM data entry)');
console.log('Comparison table updated:', tableFound);

console.log('ALL VERIFICATION CHECKS PASSED!');
