/* ============================================
   SAGAR M — Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Dynamic Navbar Adaptation for Project Subpages
  const navLinksContainer = document.getElementById('nav-links');
  if (navLinksContainer && !document.getElementById('nav-sign-in-btn')) {
    const existingCta = navLinksContainer.querySelector('.nav-cta[data-modal-target="start-project-modal"]');
    if (existingCta) {
      const signInBtn = document.createElement('button');
      signInBtn.className = 'nav-cta';
      signInBtn.id = 'nav-sign-in-btn';
      signInBtn.textContent = 'Sign In';

      const profileDropdown = document.createElement('div');
      profileDropdown.className = 'nav-profile-dropdown hidden';
      profileDropdown.id = 'nav-profile-dropdown';
      profileDropdown.innerHTML = `
        <button class="nav-profile-trigger" id="nav-profile-trigger">
          <span id="nav-profile-name">Account</span> <span class="arrow">▼</span>
        </button>
        <div class="dropdown-menu">
          <button class="dropdown-item" id="dropdown-start-project">Start a Project</button>
          <button class="dropdown-item" id="dropdown-sign-out">Sign Out</button>
        </div>
      `;

      existingCta.parentNode.replaceChild(signInBtn, existingCta);
      signInBtn.parentNode.insertBefore(profileDropdown, signInBtn.nextSibling);
    }
  }

  // Dynamic Modal Injection for Authentication/Requests if missing
  const modalWrapper = document.getElementById('modal-wrapper');
  if (modalWrapper && !document.getElementById('auth-modal')) {
    const authModalHTML = `
    <!-- ============ AUTHENTICATION MODAL ============ -->
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
            <label for="auth-password">Password <span class="required">*</span></label>
            <input type="password" id="auth-password" name="password" required placeholder="••••••••" minlength="6">
          </div>
          
          <button type="submit" class="btn btn-primary form-submit-btn" id="btn-auth-submit">
            <span class="btn-text">Sign In</span>
            <span class="btn-spinner hidden"></span>
          </button>
        </form>
      </div>
    </div>
    `;

    const projectRequestModalHTML = `
    <!-- ============ PROJECT REQUEST MODAL ============ -->
    <div class="modal-container glass-card" id="project-request-modal">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      <div class="modal-header">
        <h3 class="gradient-text">Submit Project Request</h3>
        <p>Let's map out your autonomous AI architecture.</p>
      </div>
      <form class="modal-form" id="form-project-request">
        <!-- Hidden Context Fields -->
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
            <input type="email" id="req-email" name="email" required readonly class="readonly-input">
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
          <textarea id="req-challenges" name="challenges" required placeholder="What are the main bottlenecks, errors, or time wastes in the current workflow?"></textarea>
        </div>

        <div class="form-group">
          <label for="req-outcome">Desired Outcome <span class="required">*</span></label>
          <textarea id="req-outcome" name="desiredOutcome" required placeholder="Describe what successful automation looks like (e.g. Save 20 hours/week, automate client outreach...)"></textarea>
        </div>

        <div class="form-group">
          <label for="req-notes">Additional Notes <span class="optional">(Optional)</span></label>
          <textarea id="req-notes" name="notes" placeholder="Any other details, budget constraints, timeline expectations..."></textarea>
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
    `;

    modalWrapper.insertAdjacentHTML('beforeend', authModalHTML + projectRequestModalHTML);
  }

  /* ---------- Loading Screen ---------- */
  const loader = document.getElementById('loader');
  
  function hideLoader() {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      initReveal();
    }
  }

  // Trigger when window fully loads
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 1500); // Premium delay to show transition
  });

  // Fallback — dismiss loader after 3s max to prevent lockup
  setTimeout(hideLoader, 3000);

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        link.classList.remove('active');
        if (href === `#${current}`) {
          link.classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        // Close mobile nav if open
        closeMobileNav();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Mobile Navigation ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navOverlay = document.getElementById('nav-overlay');

  function openMobileNav() {
    navToggle.classList.add('active');
    navLinksContainer.classList.add('open');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    navToggle.classList.remove('active');
    navLinksContainer.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (navLinksContainer.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navOverlay.addEventListener('click', closeMobileNav);

  // Close mobile nav when a link is clicked
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  /* ---------- Back to Top ---------- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scroll Reveal ---------- */
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------- Particles Background ---------- */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(36, 66, 53, ${this.opacity * 0.4})`;
        ctx.fill();
      }
    }

    // Create particles — fewer on mobile
    const count = window.innerWidth < 768 ? 30 : 60;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(36, 66, 53, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  /* ---------- Typed effect for hero subtitle (optional flair) ---------- */
  const heroSubtext = document.getElementById('hero-subtext');
  if (heroSubtext) {
    const text = heroSubtext.textContent;
    heroSubtext.textContent = '';
    heroSubtext.style.visibility = 'visible';
    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        heroSubtext.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 18);
      }
    }
    // Start typing after loader
    setTimeout(typeWriter, 2200);
  }

  /* ---------- Counter animation for stats ---------- */
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = counter.getAttribute('data-count');
      const isNum = /^\d+$/.test(target);
      if (!isNum) {
        counter.textContent = target;
        return;
      }
      const targetNum = parseInt(target);
      let current = 0;
      const increment = targetNum / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 40);
    });
  }

  // Trigger counters when hero stats are visible
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  /* ---------- MODALS SYSTEM HANDLING ---------- */
  //const modalWrapper = document.getElementById('modal-wrapper');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContainers = document.querySelectorAll('.modal-container');
  const modalCloseBtns = document.querySelectorAll('.modal-close');

  function openModal(modalId, projectName = null) {
    // Hide all modal containers first
    modalContainers.forEach(c => {
      c.classList.remove('active');
      c.style.display = 'none';
    });

    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    // Reset standard form and success states inside this modal
    const form = targetModal.querySelector('form');
    const successState = targetModal.querySelector('.modal-success-state');
    if (form) {
      form.classList.remove('hidden');
      form.style.display = 'flex';
      form.reset();
    }
    if (successState) {
      successState.classList.add('hidden');
      successState.style.display = 'none';
    }

    // Auto-fill project interest fields if provided
    if (modalId === 'project-interest-modal' && projectName) {
      const displayStrong = document.getElementById('interest-project-display');
      const inputHidden = document.getElementById('interest-project-name');
      if (displayStrong) displayStrong.textContent = projectName;
      if (inputHidden) inputHidden.value = projectName;

      // Prefill businessInfo and outcome fields
      const bizTextarea = targetModal.querySelector('#interest-business');
      const outcomeTextarea = targetModal.querySelector('#interest-outcome');
      if (bizTextarea && outcomeTextarea) {
        const lowerProj = projectName.toLowerCase();
        if (lowerProj.includes('sunny')) {
          bizTextarea.value = "We are developing an educational or children's application and need a safe, age-appropriate conversational AI interface with content filtering and guided learning.";
          outcomeTextarea.value = "Integrate a child-friendly conversational assistant similar to Sunny AI, incorporating safety moderation guardrails, interactive storytelling, and kid-appropriate language models.";
        } else if (lowerProj.includes('hunter')) {
          bizTextarea.value = "We want to scale our outbound B2B sales development. We currently have a team of SDRs manually searching LinkedIn, scraping websites, and writing personalized cold emails.";
          outcomeTextarea.value = "Deploy a customized version of HunterOS to automate B2B lead generation, scraping, and personalized outreach, aiming to double our booked demo rate.";
        } else if (lowerProj.includes('life')) {
          bizTextarea.value = "I want to manage my personal daily routines, task scheduling, notes, and personal learning in a single unified AI-powered interface rather than using multiple disconnected apps.";
          outcomeTextarea.value = "Deploy a customized personal workspace modeled after LifeOS, utilizing local AI agents and cognitive memory search to help me manage my daily schedule and capture insights.";
        } else if (lowerProj.includes('rag')) {
          bizTextarea.value = "We have massive internal company documentation (PDFs, wikis, Notion pages) and need a secure internal AI chatbot. Data security, user permissions, and LLM API cost monitoring are critical for us.";
          outcomeTextarea.value = "Implement a secure Enterprise RAG chatbot that connects to our company knowledge base, enforces role-based access, and tracks LLM token usage/costs across departments.";
        } else if (lowerProj.includes('receptionist') || lowerProj.includes('ojas')) {
          bizTextarea.value = "We run an educational institute or service business with high volumes of incoming student and parent inquiries via web and phone. Staff spend hours manually answering FAQs and scheduling tours.";
          outcomeTextarea.value = "Deploy an AI receptionist and inquiry automation system based on Ojas.ai to automatically answer common questions, route leads, and schedule student bookings.";
        } else if (lowerProj.includes('shadow')) {
          bizTextarea.value = "We have complex operational processes across multiple legacy business systems. We want to identify inefficiencies and automatically map background operations to find opportunities for automation.";
          outcomeTextarea.value = "Set up an operation mapping system based on the ShadowOS framework to log workflow steps, trace bottlenecks, and identify potential automation targets.";
        } else if (lowerProj.includes('route') || lowerProj.includes('swift')) {
          bizTextarea.value = "We run a logistics and dispatch operation with multiple vehicles. We currently coordinate routes and assign tasks to drivers using manual spreadsheets and unstructured phone calls.";
          outcomeTextarea.value = "Deploy an intelligent dispatch dashboard like SwiftRoute AI to automate vehicle routing, parse operator messages into structured telemetry, and optimize driver delivery schedules.";
        } else if (lowerProj.includes('mission') || lowerProj.includes('control')) {
          bizTextarea.value = "We operate a high-volume system with real-time webhooks, event ingestion, and infrastructure metrics. We need a live, interactive operations dashboard with WebSockets connectivity.";
          outcomeTextarea.value = "Create a high-performance live operations console modeled after Mission Control, to monitor real-time infrastructure status and handle low-latency system telemetry.";
        } else {
          bizTextarea.value = `We are interested in adapting the architecture of the '${projectName}' system for our custom business requirements.`;
          outcomeTextarea.value = `Deploy a custom tailored solution based on the architecture of the '${projectName}' project.`;
        }
      }
    } else if (modalId === 'automation-audit-modal' && projectName) {
      const textarea = targetModal.querySelector('#audit-process');
      if (textarea) {
        const lowerProj = projectName.toLowerCase();
        if (lowerProj.includes('sunny')) {
          textarea.value = "I am interested in getting a workflow efficiency and automation audit for my project 'Sunny AI Companion'. I'd like to analyze opportunities for integrating age-appropriate LLMs and content moderation layers into an educational companion.";
        } else if (lowerProj.includes('hunter')) {
          textarea.value = "I am interested in getting a B2B sales automation audit based on the HunterOS architecture. I'd like to analyze opportunities for integrating autonomous B2B lead generation, deep company scraping, pain point detection, and personalized email outreach.";
        } else if (lowerProj.includes('life')) {
          textarea.value = "I am interested in getting a personal workflow efficiency and cognitive optimization audit based on the LifeOS framework. I'd like to explore how to integrate an Intelligence Hub and Agentic Scouts to automate my personal operating environment.";
        } else if (lowerProj.includes('rag')) {
          textarea.value = "I am interested in getting an enterprise AI audit based on the Enterprise RAG architecture. I'd like to explore how to safely implement secure role-based access controls (RBAC) and cost monitoring for our company knowledge base.";
        } else if (lowerProj.includes('receptionist') || lowerProj.includes('ojas')) {
          textarea.value = "I am interested in getting an AI receptionist audit based on the Ojas.ai architecture. I'd like to explore automating inbound customer inquiries, call scheduling, and lead routing for my education institute.";
        } else if (lowerProj.includes('shadow')) {
          textarea.value = "I am interested in getting an operational efficiency audit based on the ShadowOS framework. I'd like to analyze how we can map manual business operations and identify hidden automation opportunities using background intelligence.";
        } else if (lowerProj.includes('route') || lowerProj.includes('swift')) {
          textarea.value = "I am interested in getting a logistics automation audit based on the SwiftRoute AI dashboard. I'd like to explore how to convert unstructured operator inputs into structured telemetry and dispatch tasks automatically.";
        } else if (lowerProj.includes('mission') || lowerProj.includes('control')) {
          textarea.value = "I am interested in getting a real-time infrastructure audit based on the Mission Control platform. I'd like to analyze webhook ingestion speed, WebSockets pipelines, and custom operations dash indicators.";
        } else {
          textarea.value = `I am interested in getting an AI automation audit based on the '${projectName}' architecture.`;
        }
      }
    }

    // Auto-fill authenticated user details if available
    if (window.originyxAuth && typeof window.originyxAuth.isAuthenticated === 'function' && window.originyxAuth.isAuthenticated()) {
      const user = window.originyxAuth.user;
      if (user) {
        const nameField = targetModal.querySelector('input[name="name"]');
        const emailField = targetModal.querySelector('input[name="email"]');
        const phoneField = targetModal.querySelector('input[name="phone"]');
        if (nameField && !nameField.value) {
          nameField.value = user.user_metadata?.full_name || '';
        }
        if (emailField && !emailField.value) {
          emailField.value = user.email || '';
        }
        if (phoneField && !phoneField.value) {
          phoneField.value = user.phone || '';
        }
      }
    }

    // Open wrapper and display container
    modalWrapper.classList.add('active');
    modalWrapper.setAttribute('aria-hidden', 'false');
    targetModal.classList.add('active');
    targetModal.style.display = 'block';
    document.body.classList.add('loading'); // Reuse lock-scroll class
  }

  function closeModal() {
    modalWrapper.classList.remove('active');
    modalWrapper.setAttribute('aria-hidden', 'true');
    modalContainers.forEach(c => {
      c.classList.remove('active');
      setTimeout(() => { c.style.display = 'none'; }, 300);
    });
    document.body.classList.remove('loading');
  }

  // Helper to open setup error
  function openSetupError() {
    const setupError = document.getElementById('auth-setup-error');
    const mainAuth = document.getElementById('auth-main-container');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalSubtitle = document.getElementById('auth-modal-subtitle');

    if (setupError) setupError.classList.remove('hidden');
    if (mainAuth) mainAuth.classList.add('hidden');
    if (modalTitle) modalTitle.textContent = 'Setup Required';
    if (modalSubtitle) modalSubtitle.textContent = 'Authentication configuration is missing.';

    openModal('auth-modal');
  }

  // Helper to open Project Request modal
  function openProjectRequestModal(sourcePage, sourceCta, productInterest) {
    const user = window.originyxAuth.user;
    if (!user) return;

    // Reset success/form states
    const form = document.getElementById('form-project-request');
    const successState = document.getElementById('request-success-state');
    if (form) {
      form.classList.remove('hidden');
      form.style.display = 'flex';
      form.reset();
    }
    if (successState) {
      successState.classList.add('hidden');
      successState.style.display = 'none';
    }

    // Prefill fields
    const nameInput = document.getElementById('req-name');
    const emailInput = document.getElementById('req-email');
    const sourcePageInput = document.getElementById('req-source-page');
    const sourceCtaInput = document.getElementById('req-source-cta');
    const productInterestInput = document.getElementById('req-product-interest');

    if (nameInput) nameInput.value = user.user_metadata?.full_name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (sourcePageInput) sourcePageInput.value = sourcePage || '/';
    if (sourceCtaInput) sourceCtaInput.value = sourceCta || 'Start a Project';
    if (productInterestInput) productInterestInput.value = productInterest || 'Originyx';

    // Auto-select project type dropdown if relevant
    const typeSelect = document.getElementById('req-type');
    if (typeSelect) {
      if (productInterest === 'Free Audit') {
        typeSelect.value = 'AI Automation';
      } else if (productInterest === 'Consultation') {
        typeSelect.value = 'Enterprise AI System';
      } else if (productInterest && productInterest !== 'Originyx') {
        const lowerProj = productInterest.toLowerCase();
        if (lowerProj.includes('agent')) {
          typeSelect.value = 'AI Agent';
        } else if (lowerProj.includes('automation') || lowerProj.includes('ojas')) {
          typeSelect.value = 'AI Automation';
        } else if (lowerProj.includes('route') || lowerProj.includes('control') || lowerProj.includes('shadow') || lowerProj.includes('lifeos') || lowerProj.includes('hunteros')) {
          typeSelect.value = 'Internal Business Tool';
        } else {
          typeSelect.value = 'Other';
        }
      } else {
        typeSelect.value = '';
      }
    }

    openModal('project-request-modal');
  }

  // Intercept data-modal-target buttons for Protected Actions
  document.body.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger) {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-target');
      const projectName = trigger.getAttribute('data-project-name');

      // Check if this modal targets one of our protected forms
      const protectedModals = [
        'start-project-modal',
        'project-consultation-modal',
        'project-interest-modal',
        'automation-audit-modal'
      ];

      const isAuthSupported = window.originyxAuth && window.originyxAuth.configured && document.getElementById('auth-modal');

      if (isAuthSupported && protectedModals.includes(modalId)) {
        // Gather context
        const sourcePage = window.location.pathname;
        const sourceCta = trigger.textContent.trim();
        let productInterest = 'Originyx';

        if (modalId === 'project-consultation-modal') {
          productInterest = 'Consultation';
        } else if (modalId === 'project-interest-modal') {
          productInterest = projectName || 'Originyx';
        } else if (modalId === 'automation-audit-modal') {
          productInterest = 'Free Audit';
        }

        // Intercept action if user is not logged in
        if (!window.originyxAuth.isAuthenticated()) {
          if (window.originyxAuth.configured) {
            localStorage.setItem('originyx_pending_action', JSON.stringify({ sourcePage, sourceCta, productInterest }));
            openModal('auth-modal');
          } else {
            openSetupError();
          }
        } else {
          openProjectRequestModal(sourcePage, sourceCta, productInterest);
        }
      } else {
        // Open modal normally if not protected or if auth is not supported
        openModal(modalId, projectName);
      }
    }
  });

  // Bind close triggers
  modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));
  modalBackdrop.addEventListener('click', closeModal);
  document.querySelectorAll('.modal-success-close').forEach(btn => btn.addEventListener('click', closeModal));

  // Press ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalWrapper.classList.contains('active')) {
      closeModal();
    }
  });

  /* ---------- NAVBAR ACCOUNT DROPDOWN INTERACTIONS ---------- */
  const profileTrigger = document.getElementById('nav-profile-trigger');
  const profileDropdown = document.getElementById('nav-profile-dropdown');
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });
  }

  // Click outside dropdown to close it
  document.addEventListener('click', () => {
    if (profileDropdown) profileDropdown.classList.remove('active');
  });

  // Dropdown Start a Project
  const dropStartProject = document.getElementById('dropdown-start-project');
  if (dropStartProject) {
    dropStartProject.addEventListener('click', (e) => {
      e.preventDefault();
      if (profileDropdown) profileDropdown.classList.remove('active');
      openProjectRequestModal(window.location.pathname, 'Navbar Dropdown', 'Originyx');
    });
  }

  // Dropdown Sign Out
  const dropSignOut = document.getElementById('dropdown-sign-out');
  if (dropSignOut) {
    dropSignOut.addEventListener('click', async (e) => {
      e.preventDefault();
      if (profileDropdown) profileDropdown.classList.remove('active');
      closeModal();
      await window.originyxAuth.signOut();
    });
  }

  // Navbar Sign In
  const navSignInBtn = document.getElementById('nav-sign-in-btn');
  if (navSignInBtn) {
    navSignInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.originyxAuth.configured) {
        openModal('auth-modal');
      } else {
        openSetupError();
      }
    });
  }

  /* ---------- AUTH TABS STATE SELECTORS ---------- */
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const groupFullname = document.getElementById('group-fullname');
  const authSubmitBtn = document.getElementById('btn-auth-submit');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');

  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      if (groupFullname) {
        groupFullname.style.display = 'none';
        groupFullname.querySelector('input').removeAttribute('required');
      }
      if (authSubmitBtn) {
        const textEl = authSubmitBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Sign In';
      }
      if (authModalTitle) authModalTitle.textContent = 'Sign In';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Log in or create an account to start your project.';
    });

    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      if (groupFullname) {
        groupFullname.style.display = 'flex';
        groupFullname.querySelector('input').setAttribute('required', 'true');
      }
      if (authSubmitBtn) {
        const textEl = authSubmitBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Create Account';
      }
      if (authModalTitle) authModalTitle.textContent = 'Create Account';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Register an account with email to continue.';
    });
  }

  /* ---------- AUTH SUBMISSIONS ---------- */
  const authForm = document.getElementById('form-auth-email');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const fullNameInput = document.getElementById('auth-fullname');
      const fullName = fullNameInput ? fullNameInput.value : '';
      
      const isSignUp = tabSignup.classList.contains('active');
      const submitBtn = document.getElementById('btn-auth-submit');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        if (isSignUp) {
          const data = await window.originyxAuth.signUp(email, password, fullName);
          if (!data.session) {
            alert('Sign up successful! Please check your email for verification instructions.');
          } else {
            closeModal();
          }
        } else {
          await window.originyxAuth.signIn(email, password);
          closeModal();
        }
      } catch (err) {
        console.error('Auth action error:', err);
        alert(err.message || 'An error occurred during authentication.');
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  // Social Logins
  const btnGoogle = document.getElementById('btn-login-google');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.originyxAuth.signInWithOAuth('google');
      } catch (err) {
        alert(err.message || 'Failed to start Google Sign In.');
      }
    });
  }

  const btnMicrosoft = document.getElementById('btn-login-microsoft');
  if (btnMicrosoft) {
    btnMicrosoft.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.originyxAuth.signInWithOAuth('microsoft');
      } catch (err) {
        alert(err.message || 'Failed to start Microsoft Sign In.');
      }
    });
  }

  /* ---------- PROJECT REQUEST FORM SUBMISSION ---------- */
  const projectRequestForm = document.getElementById('form-project-request');
  if (projectRequestForm) {
    projectRequestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = projectRequestForm.querySelector('.form-submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const successState = document.getElementById('request-success-state');

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      const formData = new FormData(projectRequestForm);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      const token = window.originyxAuth.session?.access_token;
      if (!token) {
        alert('Session expired. Please log in again.');
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
        openModal('auth-modal');
        return;
      }

      try {
        const response = await fetch('/api/submit-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          projectRequestForm.classList.add('hidden');
          projectRequestForm.style.display = 'none';
          if (successState) {
            successState.classList.remove('hidden');
            successState.style.display = 'flex';
          }
        } else {
          alert(result.error || 'Failed to submit request. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting project request:', err);
        alert('A network error occurred. Please verify your connection and try again.');
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  /* ---------- AUTH STATE OBSERVER ---------- */
  function updateAuthStateUI(configured, authenticated, user) {
    const navSignIn = document.getElementById('nav-sign-in-btn');
    const navDropdown = document.getElementById('nav-profile-dropdown');
    const navProfileName = document.getElementById('nav-profile-name');
    const authSetupError = document.getElementById('auth-setup-error');
    const authMainContainer = document.getElementById('auth-main-container');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authModalSubtitle = document.getElementById('auth-modal-subtitle');

    // If auth is not configured, load error state triggers
    if (!configured) {
      if (navSignIn) navSignIn.classList.remove('hidden');
      if (navDropdown) navDropdown.classList.add('hidden');
      return;
    }

    // Reset configuration setup visual state
    if (authSetupError) authSetupError.classList.add('hidden');
    if (authMainContainer) authMainContainer.classList.remove('hidden');
    if (authModalTitle && authModalTitle.textContent === 'Setup Required') {
      authModalTitle.textContent = tabSignup.classList.contains('active') ? 'Create Account' : 'Sign In';
      authModalSubtitle.textContent = tabSignup.classList.contains('active') ? 'Register an account with email to continue.' : 'Log in or create an account to start your project.';
    }

    if (authenticated) {
      if (navSignIn) navSignIn.classList.add('hidden');
      if (navDropdown) navDropdown.classList.remove('hidden');
      if (navProfileName) {
        // Prefer full name, fallback to email prefix
        navProfileName.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
      }

      // Check for pending protected action
      const pendingActionStr = localStorage.getItem('originyx_pending_action');
      if (pendingActionStr) {
        localStorage.removeItem('originyx_pending_action');
        try {
          const pendingAction = JSON.parse(pendingActionStr);
          openProjectRequestModal(pendingAction.sourcePage, pendingAction.sourceCta, pendingAction.productInterest);
        } catch (e) {
          console.error('Error executing pending action:', e);
        }
      }
    } else {
      if (navSignIn) navSignIn.classList.remove('hidden');
      if (navDropdown) navDropdown.classList.add('hidden');
    }
  }

  // Bind auth state change custom event
  window.addEventListener('originyx-auth-state-change', (e) => {
    const { configured, authenticated, user } = e.detail;
    updateAuthStateUI(configured, authenticated, user);
  });

  // Re-dispatch current state on initialization in case scripts raced
  if (window.originyxAuth && window.originyxAuth.configured !== undefined) {
    updateAuthStateUI(window.originyxAuth.configured, window.originyxAuth.isAuthenticated(), window.originyxAuth.user);
  }

  /* ---------- ORIGINAL FORMS DISPATCH FALLBACK ---------- */
  const modalForms = document.querySelectorAll('.modal-form:not(#form-auth-email):not(#form-project-request)');
  modalForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const targetModal = form.closest('.modal-container');
      const successState = targetModal.querySelector('.modal-success-state');

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      // Retrieve form values
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success workflow
          form.classList.add('hidden');
          form.style.display = 'none';
          if (successState) {
            successState.classList.remove('hidden');
            successState.style.display = 'flex';
          }
        } else {
          // Failure workflow
          alert(result.error || 'Failed to submit request. Please try again or email Sagar directly.');
        }
      } catch (err) {
        console.error('Error submitting form payload:', err);
        alert('A network error occurred. Please verify your connection and try again.');
      } finally {
        // Exit loading state
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  });

  /* ---------- HERO FEATURED WORK SLIDER ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const sliderContainer = document.querySelector('.hero-slider-container');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    if (slides.length === 0) return;
    
    // Bounds wrapping
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    // Toggle active classes
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

  // Bind navigation dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoplay(); // Reset timer on click
    });
  });

  // Autoplay control on hover
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);
  }

  // Initialize
  startAutoplay();

});
