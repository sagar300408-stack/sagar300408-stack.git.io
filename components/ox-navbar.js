class OxNavbar extends HTMLElement {
  connectedCallback() {
    // Basic active state detection based on path
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html';
    const isServices = path.includes('/services');
    const isCaseStudies = path.includes('/case-studies');
    const isInsights = path.includes('/insights');
    const isAbout = path.includes('/about');
    const isContact = path.includes('/contact');

    this.innerHTML = `
      <nav class="navbar scrolled" id="navbar" role="navigation" aria-label="Main navigation">
        <div class="container">
          <a href="/index.html" class="nav-logo" id="nav-logo-link">
            <img decoding="async" src="/logo.png" alt="ORIGINYX Logo" class="logo-img" width="32" height="32">
            <img decoding="async" src="/brand.png" alt="ORIGINYX" class="brand-img" width="100" height="24">
          </a>

          <div class="nav-links" id="nav-links">
            <a href="/index.html" class="${isHome ? 'active' : ''}">Home</a>
            <a href="/services/" class="${isServices ? 'active' : ''}">Services</a>
            <a href="/case-studies/" class="${isCaseStudies ? 'active' : ''}">Case Studies</a>
            <a href="/insights/" class="${isInsights ? 'active' : ''}">Insights</a>
            <a href="/about/" class="${isAbout ? 'active' : ''}">About</a>
            <a href="/contact/" class="${isContact ? 'active' : ''}">Contact</a>
            
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
      </nav>
    `;

    // Re-bind navbar interactions since elements were freshly injected
    this.bindEvents();
  }

  bindEvents() {
    // If originyxAuth is already loaded, we dispatch an event to force it to re-bind the UI
    if (window.originyxAuth && window.originyxAuth.configured) {
      window.originyxAuth.dispatchStateChange();
    }
  }
}

customElements.define('ox-navbar', OxNavbar);
