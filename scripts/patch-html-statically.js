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

// Complete standard modals block (path-adjusted template)
function getModalsHtml(prefix) {
  return `  <!-- ============ MODALS SYSTEM ============ -->
  <div class="modal-wrapper" id="modal-wrapper" aria-hidden="true" role="dialog">
    <div class="modal-backdrop" id="modal-backdrop"></div>
    
    <!-- Modal 1: Start a Project -->
    <div class="modal-container glass-card" id="start-project-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text">Start a Project</h3>
        <p>Let's map out your autonomous AI architecture.</p>
      </div>
      <form class="modal-form" id="form-start-project">
        <input type="hidden" name="formType" value="start-project">
        
        <div class="form-group">
          <label for="start-name">Full Name <span class="required">*</span></label>
          <input type="text" id="start-name" name="name" required placeholder="John Doe">
        </div>
        
        <div class="form-group">
          <label for="start-email">Email Address <span class="required">*</span></label>
          <input type="email" id="start-email" name="email" required placeholder="john@company.com">
        </div>
        
        <div class="form-group">
          <label for="start-phone">Phone Number (with Country Code) <span class="required">*</span></label>
          <input type="tel" id="start-phone" name="phone" required placeholder="+1 (555) 000-0000">
        </div>
        
        <div class="form-group">
          <label for="start-company">Company Name</label>
          <input type="text" id="start-company" name="company" placeholder="Acme Corp">
        </div>
        
        <div class="form-group">
          <label for="start-discussion">What would you like to discuss? <span class="required">*</span></label>
          <textarea id="start-discussion" name="discussion" required placeholder="Description of your bottlenecks or workflow objectives..."></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary form-submit-btn">
          <span class="btn-text">Submit Request</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </form>
      <div class="modal-success-state hidden">
        <div class="success-checkmark">✓</div>
        <h3>Strategy Call Requested!</h3>
        <p>Your request has been received. Sagar will reach out to you within 24 hours to schedule a deep-dive call.</p>
        <button class="btn btn-primary modal-success-close">Close Dashboard</button>
      </div>
    </div>

    <!-- Modal 2: Get Free AI Automation Audit -->
    <div class="modal-container glass-card" id="automation-audit-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text">Free Automation Audit</h3>
        <p>Expose hidden inefficiencies and map manual processes to digital agent targets.</p>
      </div>
      <form class="modal-form" id="form-automation-audit">
        <input type="hidden" name="formType" value="automation-audit">

        <div class="form-group">
          <label for="audit-name">Full Name <span class="required">*</span></label>
          <input type="text" id="audit-name" name="name" required placeholder="John Doe">
        </div>
        
        <div class="form-group">
          <label for="audit-email">Email Address <span class="required">*</span></label>
          <input type="email" id="audit-email" name="email" required placeholder="john@company.com">
        </div>
        
        <div class="form-group">
          <label for="audit-phone">Phone Number <span class="required">*</span></label>
          <input type="tel" id="audit-phone" name="phone" required placeholder="+1 (555) 000-0000">
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="audit-company">Company</label>
            <input type="text" id="audit-company" name="company" placeholder="Acme Corp">
          </div>
          
          <div class="form-group">
            <label for="audit-website">Website</label>
            <input type="url" id="audit-website" name="website" placeholder="https://company.com">
          </div>
        </div>

        <div class="form-group">
          <label for="audit-process">What process consumes the most time? <span class="required">*</span></label>
          <textarea id="audit-process" name="processTime" required placeholder="Describe the repetitive manual process you want to automate."></textarea>
        </div>

        <button type="submit" class="btn btn-primary form-submit-btn">
          <span class="btn-text">Get Free AI Automation Audit</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </form>
      <div class="modal-success-state hidden">
        <div class="success-checkmark">✓</div>
        <h3>Audit Request Submitted!</h3>
        <p>Thank you for submitting your process bottlenecks. Sagar will perform a workflow analysis and send your custom AI Automation blueprint via email.</p>
        <button class="btn btn-primary modal-success-close">Close Dashboard</button>
      </div>
    </div>

    <!-- Modal 3: Try This For My Business -->
    <div class="modal-container glass-card" id="project-interest-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text">Deploy Custom Solution</h3>
        <p>Request a custom system based on this architecture.</p>
      </div>
      <form class="modal-form" id="form-project-interest">
        <input type="hidden" name="formType" value="project-interest">
        <input type="hidden" id="interest-project-name" name="projectName" value="">

        <div class="form-group">
          <label for="interest-name">Full Name <span class="required">*</span></label>
          <input type="text" id="interest-name" name="name" required placeholder="John Doe">
        </div>
        
        <div class="form-group">
          <label for="interest-email">Email Address <span class="required">*</span></label>
          <input type="email" id="interest-email" name="email" required placeholder="john@company.com">
        </div>
        
        <div class="form-group">
          <label for="interest-phone">Phone Number <span class="required">*</span></label>
          <input type="tel" id="interest-phone" name="phone" required placeholder="+1 (555) 000-0000">
        </div>
        
        <div class="form-group">
          <label for="interest-company">Company Name</label>
          <input type="text" id="interest-company" name="company" placeholder="Acme Corp">
        </div>

        <div class="form-group">
          <label for="interest-business">Tell us about your business <span class="required">*</span></label>
          <textarea id="interest-business" name="businessInfo" required placeholder="What industry are you in? What is your current workflow?"></textarea>
        </div>

        <div class="form-group">
          <label for="interest-outcome">What outcome are you looking for? <span class="required">*</span></label>
          <textarea id="interest-outcome" name="outcome" required placeholder="e.g. Save 15 hours/week, automate company outreach leads..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary form-submit-btn">
          <span class="btn-text">Request Similar Solution</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </form>
      <div class="modal-success-state hidden">
        <div class="success-checkmark">✓</div>
        <h3>Solution Request Logged!</h3>
        <p>Your interest in this specific system has been documented. Sagar will reach out shortly to discuss adapting this architecture for your custom business requirements.</p>
        <button class="btn btn-primary modal-success-close">Close Dashboard</button>
      </div>
    </div>

    <!-- Modal 4: Authentication Modal -->
    <div class="modal-container glass-card" id="auth-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text" id="auth-modal-title">Sign In</h3>
        <p id="auth-modal-subtitle">Log in or create an account to start your project.</p>
      </div>

      <!-- Setup Error State (shown if Supabase keys are missing) -->
      <div class="auth-setup-error hidden" id="auth-setup-error">
        <div class="error-icon">⚠️</div>
        <h4>Configuration Incomplete</h4>
        <p>This platform's authentication is not configured yet. Please configure the <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> environment variables to activate this action.</p>
      </div>

      <!-- Inline Error/Success Message Banner -->
      <div class="auth-error-message hidden" id="auth-error-message" style="display: none; color: var(--rose); background: rgba(163, 42, 63, 0.05); border: 1px solid rgba(163, 42, 63, 0.2); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); margin-bottom: var(--space-md); font-size: 0.9rem; text-align: center;"></div>

      <!-- Main Auth Container -->
      <div id="auth-main-container">
        <!-- Social Login Buttons -->
        <div class="social-login-buttons">
          <button class="btn social-btn google-btn" id="btn-login-google">
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.79-5.79c2.485 0 4.542 1.54 5.38 3.737l3.657-2.84C20.67 3.518 16.71 1 12.24 1 6.03 1 1 6.03 1 12.24s5.03 11.24 11.24 11.24c6.07 0 11.135-4.4 11.135-11.24 0-.712-.082-1.396-.24-1.955H12.24z"/></svg>
            <span>Continue with Google</span>
          </button>
          <button class="btn social-btn microsoft-btn" id="btn-login-microsoft">
            <svg class="social-icon" viewBox="0 0 23 23" width="18" height="18"><path fill="#00a1f1" d="M12 0h11v11H12z"/><path fill="#f35325" d="M0 0h11v11H0z"/><path fill="#81bc06" d="M12 12h11v11H12z"/><path fill="#ffba08" d="M0 12h11v11H0z"/></svg>
            <span>Continue with Microsoft</span>
          </button>
        </div>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Auth Form Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="tab-login" data-mode="login">Sign In</button>
          <button class="auth-tab-btn" id="tab-signup" data-mode="signup">Create Account</button>
        </div>

        <!-- Email & Password Form -->
        <form class="modal-form" id="form-auth-email">
          <div class="form-group" id="group-fullname" style="display: none;">
            <label for="auth-fullname">Full Name <span class="required">*</span></label>
            <input type="text" id="auth-fullname" name="fullname" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label for="auth-email">Email Address <span class="required">*</span></label>
            <input type="email" id="auth-email" name="email" required placeholder="john@company.com">
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
              <label for="auth-password" style="margin-bottom: 0;">Password <span class="required">*</span></label>
              <a href="#" id="auth-forgot-password-link" style="font-size: 0.8rem; color: var(--accent-light); text-decoration: underline;">Forgot Password?</a>
            </div>
            <input type="password" id="auth-password" name="password" required placeholder="••••••••" minlength="8">
          </div>
          <div class="form-group" id="group-confirm-password" style="display: none;">
            <label for="auth-confirm-password">Confirm Password <span class="required">*</span></label>
            <input type="password" id="auth-confirm-password" name="confirmPassword" placeholder="••••••••" minlength="8">
          </div>
          <div class="form-group" id="auth-password-guidance" style="display: none; font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-sm);">
            Password must contain at least 8 characters, including an uppercase letter and a number.
          </div>
          
          <button type="submit" class="btn btn-primary form-submit-btn" id="btn-auth-submit">
            <span class="btn-text">Sign In</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </form>
      </div>

      <!-- Forgot Password Container -->
      <div id="auth-forgot-password-container" style="display: none;">
        <form class="modal-form" id="form-forgot-password">
          <div class="form-group">
            <label for="forgot-email">Email Address <span class="required">*</span></label>
            <input type="email" id="forgot-email" name="email" required placeholder="john@company.com">
          </div>
          
          <button type="submit" class="btn btn-primary form-submit-btn" id="btn-forgot-submit">
            <span class="btn-text">Send Reset Link</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </form>
        <div style="text-align: center; margin-top: var(--space-md);">
          <a href="#" id="link-back-to-signin" style="font-size: 0.9rem; color: var(--accent-light); text-decoration: underline;">Back to Sign In</a>
        </div>
      </div>

      <!-- Update Password Container (Recovery Flow) -->
      <div id="auth-update-password-container" style="display: none;">
        <form class="modal-form" id="form-update-password">
          <div class="form-group">
            <label for="update-password">New Password <span class="required">*</span></label>
            <input type="password" id="update-password" name="newPassword" required placeholder="••••••••" minlength="8">
          </div>
          <div class="form-group">
            <label for="update-confirm-password">Confirm New Password <span class="required">*</span></label>
            <input type="password" id="update-confirm-password" name="confirmNewPassword" required placeholder="••••••••" minlength="8">
          </div>
          <div class="form-group" id="auth-update-password-guidance" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-sm);">
            Password must contain at least 8 characters, including an uppercase letter and a number.
          </div>
          
          <button type="submit" class="btn btn-primary form-submit-btn" id="btn-update-submit">
            <span class="btn-text">Update Password</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </form>
      </div>
    </div>

    <!-- Modal 5: Project Request Modal -->
    <div class="modal-container glass-card" id="project-request-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text">Submit Project Request</h3>
        <p>Let's map out your autonomous AI architecture.</p>
      </div>
      <form class="modal-form" id="form-project-request">
        <input type="hidden" id="req-source-page" name="sourcePage" value="/">
        <input type="hidden" id="req-source-cta" name="sourceCta" value="Start a Project">
        <input type="hidden" id="req-product-interest" name="productInterest" value="Originyx">

        <div class="form-grid">
          <div class="form-group">
            <label for="req-name">Full Name <span class="required">*</span></label>
            <input type="text" id="req-name" name="name" required placeholder="John Doe">
          </div>
          <div class="form-group">
            <label for="req-business">Business Name <span class="required">*</span></label>
            <input type="text" id="req-business" name="businessName" required placeholder="Acme Corp">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="req-email">Email Address <span class="required">*</span></label>
            <input type="email" id="req-email" name="email" required placeholder="john@company.com">
          </div>
          <div class="form-group">
            <label for="req-phone">Phone Number <span class="optional">(Optional)</span></label>
            <input type="tel" id="req-phone" name="phone" placeholder="+1 (555) 000-0000">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="req-industry">Industry <span class="required">*</span></label>
            <input type="text" id="req-industry" name="industry" required placeholder="Logistics, Finance, Healthcare...">
          </div>
          <div class="form-group">
            <label for="req-type">Project Type <span class="required">*</span></label>
            <select id="req-type" name="projectType" required>
              <option value="" disabled selected>Select project type...</option>
              <option value="AI Agent">AI Agent</option>
              <option value="AI Automation">AI Automation</option>
              <option value="SaaS Platform">SaaS Platform</option>
              <option value="Internal Business Tool">Internal Business Tool</option>
              <option value="Enterprise AI System">Enterprise AI System</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="req-workflow">Current Workflow <span class="required">*</span></label>
          <textarea id="req-workflow" name="workflowDescription" required placeholder="Describe the manual steps and processes currently being used..."></textarea>
        </div>

        <div class="form-group">
          <label for="req-challenges">Challenges <span class="required">*</span></label>
          <textarea id="req-challenges" name="challenges" required placeholder="What are the main bottlenecks, errors, or time wastes in the current workflow..."></textarea>
        </div>

        <div class="form-group">
          <label for="req-outcome">Desired Outcome <span class="required">*</span></label>
          <textarea id="req-outcome" name="desiredOutcome" required placeholder="Describe what successful automation looks like..."></textarea>
        </div>

        <div class="form-group">
          <label for="req-notes">Additional Notes <span class="optional">(Optional)</span></label>
          <textarea id="req-notes" name="notes" placeholder="Any other details..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary form-submit-btn">
          <span class="btn-text">Submit Project Request</span>
          <span class="btn-spinner hidden"></span>
        </button>
      </form>
      <div class="modal-success-state hidden" id="request-success-state">
        <div class="success-checkmark">✓</div>
        <h3>Project Request Submitted!</h3>
        <p>Your request has been successfully recorded. Sagar will review your current workflow description, challenges, and desired outcomes and follow up with you within 24 hours.</p>
        <button class="btn btn-primary modal-success-close">Close</button>
      </div>
    </div>
  </div>`;
}

// Statically generate navigationLinks
function getNavbarHtml(prefix, activePage, isHome) {
  const logoHref = isHome ? '#home' : prefix;
  return `<nav class="navbar scrolled" id="navbar" role="navigation" aria-label="Main navigation">
    <div class="container">
      <a href="${logoHref}" class="nav-logo" id="nav-logo-link">
        <img src="${prefix}logo.png" alt="ORIGINYX Logo" class="logo-img" width="32" height="32">
        <img src="${prefix}brand.png" alt="ORIGINYX" class="brand-img" height="24">
      </a>

      <div class="nav-links" id="nav-links">
        <a href="${prefix}"${activePage === 'home' ? ' class="active"' : ''}>Home</a>
        <a href="${prefix}services/"${activePage === 'services' ? ' class="active"' : ''}>Services</a>
        <a href="${prefix}case-studies/"${activePage === 'case-studies' ? ' class="active"' : ''}>Case Studies</a>
        <a href="${prefix}about/"${activePage === 'about' ? ' class="active"' : ''}>About</a>
        <a href="${prefix}contact/"${activePage === 'contact' ? ' class="active"' : ''}>Contact</a>
        <button class="nav-cta" id="nav-sign-in-btn">Sign In</button>
        <div class="nav-profile-dropdown hidden" id="nav-profile-dropdown">
          <button class="nav-profile-trigger" id="nav-profile-trigger">
            <span id="nav-profile-name">Account</span> <span class="arrow">▼</span>
          </button>
          <div class="dropdown-menu">
            <button class="dropdown-item" id="dropdown-start-project">Start a Project</button>
            <button class="dropdown-item" id="dropdown-sign-out">Sign Out</button>
          </div>
        </div>
      </div>

      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>`;
}

function patchFiles() {
  files.forEach(relPath => {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[ERROR] File missing: ${relPath}`);
      return;
    }

    const depth = relPath.split('/').filter(Boolean).length - 1;
    const prefix = '../'.repeat(depth);
    const isHome = relPath === 'index.html';

    // Determine active page
    let activePage = 'none';
    if (isHome) activePage = 'home';
    else if (relPath.includes('services/')) activePage = 'services';
    else if (relPath.includes('case-studies/')) activePage = 'case-studies';
    else if (relPath.includes('about/')) activePage = 'about';
    else if (relPath.includes('contact/')) activePage = 'contact';

    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Navbar Replacement
    const navRegex = /<nav class="navbar[\s\S]*?<\/nav>/gi;
    const newNav = getNavbarHtml(prefix, activePage, isHome);
    content = content.replace(navRegex, newNav);

    // 2. Modals wrapper replacement or injection
    const newModals = getModalsHtml(prefix);
    const modalsAndScriptsRegex = /(?:<!--\s*={4,}\s*MODALS SYSTEM\s*={4,}\s*-->|<!--\s*={4,}\s*MODALS\s*={4,}\s*-->|<!--\s*Modals\s*-->|<div\s+class=["']modal-wrapper["']\s+id=["']modal-wrapper["'])[\s\S]*?(?=<!--\s*={4,}\s*SCRIPTS\s*={4,}\s*-->|<!--\s*Scripts\s*-->|<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase|<script\s+src="[^"]*auth\.js")/gi;

    if (modalsAndScriptsRegex.test(content)) {
      content = content.replace(modalsAndScriptsRegex, newModals + '\n\n  ');
    } else {
      // If no wrapper, inject it right before script tags
      const scriptCommentRegex = /(?=<!--\s*={4,}\s*SCRIPTS\s*={4,}\s*-->|<!--\s*Scripts\s*-->|<script\s+src="[^"]*(?:script|auth|supabase)[^"]*")/gi;
      if (scriptCommentRegex.test(content)) {
        // Replace only the first occurrence
        let first = true;
        content = content.replace(scriptCommentRegex, match => {
          if (first) {
            first = false;
            return newModals + '\n\n  ';
          }
          return match;
        });
      }
    }

    // 3. Scripts block standardization
    const scriptsRegex = /(?:<!--\s*={4,}\s*SCRIPTS\s*={4,}\s*-->|<!--\s*Scripts\s*-->)[\s\S]*?<\/body>/gi;
    const newScriptsBlock = `<!-- ============ SCRIPTS ============ -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="${prefix}auth.js"></script>
  <script src="${prefix}script.js"></script>
</body>`;

    content = content.replace(scriptsRegex, newScriptsBlock);

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[PATCHED] ${relPath} (depth: ${depth}, prefix: "${prefix}", active: "${activePage}")`);
  });

  console.log('\nAll HTML files statically patched and updated successfully!');
}

patchFiles();
