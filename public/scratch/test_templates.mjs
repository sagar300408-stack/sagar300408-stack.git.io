// Test: Template module structure and correctness
import { welcomeEmail, logoutEmail, verificationEmail, escapeHtml } from '../api/emails/templates.js';

let pass = 0, fail = 0;
function assert(label, cond) {
  if (cond) { console.log('  PASS:', label); pass++; }
  else       { console.error('  FAIL:', label); fail++; }
}

console.log('\n=== 1. Module Export Test ===');
assert('welcomeEmail exported', typeof welcomeEmail === 'function');
assert('logoutEmail exported', typeof logoutEmail === 'function');
assert('verificationEmail exported', typeof verificationEmail === 'function');
assert('escapeHtml exported', typeof escapeHtml === 'function');

console.log('\n=== 2. escapeHtml Tests ===');
assert('escapes <script>', escapeHtml('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;');
assert('escapes &', escapeHtml('a&b') === 'a&amp;b');
assert('escapes quotes', escapeHtml('"test"').includes('&quot;'));
assert('handles null', escapeHtml(null) === '');
assert('handles undefined', escapeHtml(undefined) === '');
assert('handles empty string', escapeHtml('') === '');
assert('clean email unchanged', escapeHtml('user@example.com') === 'user@example.com');

console.log('\n=== 3. Welcome Email Tests ===');
const w1 = welcomeEmail({ name: 'John', email: 'john@example.com', provider: 'email', needsVerification: true });
assert('correct subject', w1.subject === 'Welcome to Originyx | Your Account Is Ready');
assert('html is string', typeof w1.html === 'string');
assert('text is string', typeof w1.text === 'string');
assert('html > 1000 chars', w1.html.length > 1000);
assert('verification note present', w1.html.includes('Verify your email address'));
assert('no raw name injection in html', !w1.html.includes('<script>'));
assert('explore CTA present', w1.html.includes('Explore Originyx'));
assert('CTA points to originyx.in', w1.html.includes('https://originyx.in'));
assert('footer present', w1.html.includes('originyx.in/privacy-policy'));
assert('plain text has name', w1.text.includes('John'));
assert('plain text has explore link', w1.text.includes('https://originyx.in'));

const w2 = welcomeEmail({ name: '', email: 'anon@example.com', provider: 'google', needsVerification: false });
assert('google provider note present', w2.html.includes('Google'));
assert('no verification note when not needed', !w2.html.includes('Verify your email address'));
assert('fallback greeting when name empty', w2.text.includes('there'));

// XSS in name
const wXss = welcomeEmail({ name: '<img src=x onerror=alert(1)>', email: 'x@x.com', provider: 'email' });
assert('Raw XSS tag not in HTML', !wXss.html.includes('<img src=x'));
assert('XSS escaped form present', wXss.html.includes('&lt;img'));

console.log('\n=== 4. Logout Email Tests ===');
const l1 = logoutEmail({ name: 'Jane', email: 'jane@example.com', logoutTime: new Date().toISOString() });
assert('correct subject', l1.subject === "You've been Logged Out of Originyx");
assert('html is string', typeof l1.html === 'string');
assert('feedback CTA present', l1.html.includes('Share Your Feedback'));
assert('feedback URL is contact page', l1.html.includes('https://originyx.in/contact/'));
assert('session summary present', l1.html.includes('Signed out successfully'));
assert('account email shown', l1.html.includes('jane@example.com'));
assert('security notice present', l1.html.includes('did not initiate'));
assert('plain text feedback link', l1.text.includes('https://originyx.in/contact/'));

// XSS in email field
const lXss = logoutEmail({ name: 'x', email: '<script>alert(1)</script>@x.com', logoutTime: null });
assert('XSS in email is escaped in HTML', !lXss.html.includes('<script>alert'));

console.log('\n=== 5. Verification Email Tests ===');
const v1 = verificationEmail({ name: 'Bob', verificationUrl: 'https://test.supabase.co/verify?token=abc123test' });
assert('correct subject', v1.subject === 'Verify Your Originyx Account');
assert('verify URL in button href', v1.html.includes('abc123test'));
assert('fallback text link present', v1.html.includes('Button not working'));
assert('expiry info present', v1.html.includes('24 hours'));
assert('security notice present', v1.html.includes('did not create'));
assert('plain text has verify URL', v1.text.includes('abc123test'));

// No verificationUrl
const v2 = verificationEmail({ name: '', verificationUrl: '' });
assert('missing URL falls back to #', v2.html.includes('href="#"'));

console.log('\n=== 6. HTML Structure Tests ===');
assert('welcome has DOCTYPE', w1.html.startsWith('<!DOCTYPE html>'));
assert('welcome has viewport meta', w1.html.includes('viewport'));
assert('welcome has media query for mobile', w1.html.includes('@media only screen'));
assert('welcome uses table layout', w1.html.includes('role="presentation"'));
assert('welcome has inline background color', w1.html.includes('background-color'));
assert('logout has DOCTYPE', l1.html.startsWith('<!DOCTYPE html>'));
assert('verification has DOCTYPE', v1.html.startsWith('<!DOCTYPE html>'));

console.log('\n=== SUMMARY ===');
console.log('Total PASS:', pass, '/ Total FAIL:', fail);
if (fail > 0) process.exit(1);
