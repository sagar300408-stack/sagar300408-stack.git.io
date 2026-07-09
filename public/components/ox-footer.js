class OxFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer-content">
            <div class="footer-name">Originyx</div>
            <div class="footer-title">Enterprise Content Engine</div>
            <div class="footer-tagline">Building Agentic Systems & Autonomous SaaS</div>

            <div class="footer-links">
              <a href="/privacy-policy/" id="footer-privacy">Privacy Policy</a>
              <a href="/terms-and-conditions/" id="footer-terms">Terms &amp; Conditions</a>
              <a href="/cookie-policy/" id="footer-cookie">Cookie Policy</a>
              <a href="mailto:sagar@originyx.in" id="footer-email">Email</a>
              <a href="https://www.linkedin.com/company/originyx" target="_blank" rel="noopener noreferrer" id="footer-linkedin">LinkedIn</a>
              <a href="https://github.com/sagar300408-stack" target="_blank" rel="noopener noreferrer" id="footer-github">GitHub</a>
            </div>

            <div class="footer-copy">
              &copy; 2026 Originyx. All rights reserved. Built with precision.
            </div>
          </div>
        </div>
      </footer>

      <!-- ============ BACK TO TOP ============ -->
      <button class="back-to-top" id="back-to-top" aria-label="Back to top">↑</button>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const backToTopBtn = this.querySelector('#back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
}

customElements.define('ox-footer', OxFooter);
