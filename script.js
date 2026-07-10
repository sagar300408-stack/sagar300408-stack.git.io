/* ============================================
   SAGAR M — Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Auth Helper Functions ---------- */
  function validatePasswordStrength(password) {
    if (password.length < 8) return false;
    if (password.length > 128) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  }

  function showAuthError(message, actions = null) {
    const errorEl = document.getElementById('auth-error-message');
    if (!errorEl) {
      alert(message);
      return;
    }
    errorEl.innerHTML = '';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    errorEl.appendChild(textSpan);
    
    if (actions) {
      const actionsDiv = document.createElement('div');
      actionsDiv.style.marginTop = 'var(--space-xs)';
      actionsDiv.style.display = 'flex';
      actionsDiv.style.justifyContent = 'center';
      actionsDiv.style.gap = 'var(--space-sm)';
      
      actions.forEach(action => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = action.text;
        link.style.color = 'var(--accent-light)';
        link.style.textDecoration = 'underline';
        link.style.fontSize = '0.85rem';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          action.callback();
        });
        actionsDiv.appendChild(link);
      });
      errorEl.appendChild(actionsDiv);
    }
    
    errorEl.style.color = 'var(--rose)';
    errorEl.style.backgroundColor = 'rgba(163, 42, 63, 0.05)';
    errorEl.style.borderColor = 'rgba(163, 42, 63, 0.2)';
    errorEl.style.display = 'block';
    errorEl.classList.remove('hidden');
  }

  function showAuthSuccess(message) {
    const errorEl = document.getElementById('auth-error-message');
    if (!errorEl) {
      alert(message);
      return;
    }
    errorEl.innerHTML = '';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    errorEl.appendChild(textSpan);
    
    errorEl.style.color = 'var(--green)';
    errorEl.style.backgroundColor = 'rgba(45, 94, 63, 0.05)';
    errorEl.style.borderColor = 'rgba(45, 94, 63, 0.2)';
    errorEl.style.display = 'block';
    errorEl.classList.remove('hidden');
  }

  function clearAuthError() {
    const errorEl = document.getElementById('auth-error-message');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.classList.add('hidden');
      errorEl.innerHTML = '';
    }
  }

  function switchToLoginTab() {
    const tabLogin = document.getElementById('tab-login');
    if (tabLogin) tabLogin.click();
  }

  function openForgotPasswordFlow(email = '') {
    clearAuthError();
    const authMainContainer = document.getElementById('auth-main-container');
    const forgotPasswordContainer = document.getElementById('auth-forgot-password-container');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authModalSubtitle = document.getElementById('auth-modal-subtitle');
    
    if (authMainContainer) authMainContainer.style.display = 'none';
    if (forgotPasswordContainer) {
      forgotPasswordContainer.style.display = 'block';
      const forgotEmailInput = document.getElementById('forgot-email');
      if (forgotEmailInput) {
        forgotEmailInput.value = email || document.getElementById('auth-email')?.value || '';
      }
    }
    if (authModalTitle) authModalTitle.textContent = 'Reset Password';
    if (authModalSubtitle) authModalSubtitle.textContent = 'Enter your email to receive a password reset link.';
  }

  function openUpdatePasswordFlow() {
    clearAuthError();
    const authMainContainer = document.getElementById('auth-main-container');
    const forgotPasswordContainer = document.getElementById('auth-forgot-password-container');
    const updatePasswordContainer = document.getElementById('auth-update-password-container');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authModalSubtitle = document.getElementById('auth-modal-subtitle');
    
    if (authMainContainer) authMainContainer.style.display = 'none';
    if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'none';
    if (updatePasswordContainer) updatePasswordContainer.style.display = 'block';
    
    if (authModalTitle) authModalTitle.textContent = 'Set New Password';
    if (authModalSubtitle) authModalSubtitle.textContent = 'Enter and confirm your new password below.';
    
    openModal('auth-modal');
  }

  const navLinksContainer = document.getElementById('nav-links');

  /* ---------- Loading Screen ---------- */
  const loader = document.getElementById('loader');
  let revealInitialized = false;
  
  function hideLoader() {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }
    if (!revealInitialized) {
      revealInitialized = true;
      initReveal();
    }
  }

  if (loader) {
    // Trigger when window fully loads
    window.addEventListener('load', () => {
      setTimeout(hideLoader, 1500); // Premium delay to show transition
    });

    // Fallback — dismiss loader after 3s max to prevent lockup
    setTimeout(hideLoader, 3000);
  } else {
    // No loader present — initialize reveal immediately!
    document.body.classList.remove('loading');
    initReveal();
    revealInitialized = true;
  }

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function onScroll() {
    const scrollY = window.scrollY;

    // Navbar background
   if (navbar) {
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
    // Back to top button
   if (backToTop) {
    if (scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
    backToTop.classList.remove('visible');
    } 
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
      try {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          // Close mobile nav if open
          closeMobileNav();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Error on smooth scroll:', err);
      }
    });
  });

  /* ---------- Mobile Navigation ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navOverlay = document.getElementById('nav-overlay');

  function openMobileNav() {
    if (navToggle) navToggle.classList.add('active');
    if (navLinksContainer) navLinksContainer.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (navToggle) navToggle.classList.remove('active');
    if (navLinksContainer) navLinksContainer.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (navLinksContainer && navLinksContainer.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileNav);
  }

  // Close mobile nav when a link is clicked
  if (navLinksContainer) {
    navLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Back to Top ---------- */
  if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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
  const modalWrapper = document.getElementById('modal-wrapper');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContainers = document.querySelectorAll('.modal-container');
  const modalCloseBtns = document.querySelectorAll('.modal-close');
  let pendingActionCallback = null;

  function storePendingAction(action, callback) {
    pendingActionCallback = callback || null;
    localStorage.setItem('originyx_pending_action', JSON.stringify(action));
  }

  function clearPendingAction() {
    pendingActionCallback = null;
    localStorage.removeItem('originyx_pending_action');
  }

  async function requireAuthentication(action, callback) {
    try {
      const session = await window.originyxAuth?.getCurrentSession();
      if (session) return true;

      storePendingAction(action, callback);
      if (window.originyxAuth?.configured) openModal('auth-modal');
      else openSetupError();
      return false;
    } catch (error) {
      console.error('Unable to validate the current session:', error);
      clearPendingAction();
      openModal('auth-modal');
      showAuthError('Your session could not be verified. Please sign in again.');
      return false;
    }
  }

  async function resumePendingAction() {
    const pendingActionStr = localStorage.getItem('originyx_pending_action');
    if (!pendingActionStr) return;

    let action;
    try {
      action = JSON.parse(pendingActionStr);
    } catch (error) {
      clearPendingAction();
      return;
    }

    const callback = pendingActionCallback;
    clearPendingAction();

    if (callback) {
      callback();
    } else if (action.kind === 'form' && action.formId) {
      document.getElementById(action.formId)?.requestSubmit();
    } else if (action.modalId) {
      openModal(action.modalId, action.projectName, action.leadSource);
    }
  }

  // Helper: prefill name+email from authenticated user into a modal
  function prefillUserFields(modal) {
    if (!window.originyxAuth || !window.originyxAuth.isAuthenticated()) return;
    const user = window.originyxAuth.user;
    if (!user) return;
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const userEmail = user.email || '';
    const nameField = modal.querySelector('input[name="name"]');
    const emailField = modal.querySelector('input[name="email"]');
    if (nameField) nameField.value = userName;
    if (emailField) {
      emailField.value = userEmail;
      emailField.removeAttribute('readonly');
      emailField.classList.remove('readonly-input');
    }
  }

  function openModal(modalId, projectName = null, leadSource = null) {
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

    if (modalId === 'auth-modal') {
      clearAuthError();
      const authMainContainer = document.getElementById('auth-main-container');
      const forgotPasswordContainer = document.getElementById('auth-forgot-password-container');
      const updatePasswordContainer = document.getElementById('auth-update-password-container');
      
      if (authMainContainer) authMainContainer.style.display = 'block';
      if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'none';
      if (updatePasswordContainer) updatePasswordContainer.style.display = 'none';
      
      // Reset all auth forms
      const emailForm = document.getElementById('form-auth-email');
      if (emailForm) emailForm.reset();
      const forgotForm = document.getElementById('form-forgot-password');
      if (forgotForm) forgotForm.reset();
      const updateForm = document.getElementById('form-update-password');
      if (updateForm) updateForm.reset();

      // Ensure tab returns to default Login tab
      const tabLogin = document.getElementById('tab-login');
      if (tabLogin) tabLogin.click();
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
        } else if (lowerProj.includes('engage')) {
          bizTextarea.value = "We want to automate incoming customer engagement, lead qualification, and appointment scheduling across WhatsApp and phone. Currently, follow-ups are manual and leads get cold.";
          outcomeTextarea.value = "Deploy a customized version of HunterOS Engage to automatically capture, qualify, and follow up with leads, and coordinate bookings inside a unified business dashboard.";
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
        } else if (lowerProj.includes('engage')) {
          textarea.value = "I am interested in getting a customer engagement automation audit based on the HunterOS Engage architecture. I'd like to analyze opportunities for integrating automatic lead qualification, WhatsApp support, automated follow-ups, and calendar scheduling.";
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

    // Inject lead_source hidden field
    if (form && leadSource) {
      let lsInput = form.querySelector('input[name="lead_source"]');
      if (!lsInput) {
        lsInput = document.createElement('input');
        lsInput.type = 'hidden';
        lsInput.name = 'lead_source';
        form.appendChild(lsInput);
      }
      lsInput.value = leadSource;
    }

    // Inject project_name hidden field for audit modal on project pages
    if (form && projectName && modalId === 'automation-audit-modal') {
      let pnInput = form.querySelector('input[name="project_name"]');
      if (!pnInput) {
        pnInput = document.createElement('input');
        pnInput.type = 'hidden';
        pnInput.name = 'project_name';
        form.appendChild(pnInput);
      }
      pnInput.value = projectName;
    }

    // Auto-fill authenticated user details
    prefillUserFields(targetModal);

    // Open wrapper and display container
    if (modalWrapper) {
      modalWrapper.classList.add('active');
      modalWrapper.setAttribute('aria-hidden', 'false');
    }
    targetModal.classList.add('active');
    targetModal.style.display = 'block';
    document.body.classList.add('loading'); // Reuse lock-scroll class
  }

  function closeModal() {
    if (modalWrapper) {
      modalWrapper.classList.remove('active');
      modalWrapper.setAttribute('aria-hidden', 'true');
    }
    modalContainers.forEach(c => {
      c.classList.remove('active');
      c.style.display = 'none';
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
  document.body.addEventListener('click', async (e) => {
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger) {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-target');
      const projectName = trigger.getAttribute('data-project-name');

      // Modal workflows are protected by default. Use data-auth-required="false"
      // only for a deliberately public modal.
      const isAuthRequired = trigger.getAttribute('data-auth-required') !== 'false' && modalId !== 'auth-modal';

      if (isAuthRequired) {
        // Gather context
        const sourcePage = window.location.pathname;
        const sourceCta = trigger.textContent.trim();

        // Map modal to lead_source
        const leadSourceMap = {
          'start-project-modal': 'Start Project',
          'project-interest-modal': 'Business Assessment',
          'automation-audit-modal': 'AI Automation Audit',
          'project-request-modal': 'Project Request'
        };
        const leadSource = leadSourceMap[modalId] || 'Lead Form';

        const action = { kind: 'modal', sourcePage, sourceCta, modalId, projectName, leadSource };
        if (await requireAuthentication(action)) {
          openModal(modalId, projectName, leadSource);
        }
      } else {
        openModal(modalId, projectName);
      }
    }
  });

  // Bind close triggers
  if (modalCloseBtns) {
  modalCloseBtns.forEach(btn =>
    btn.addEventListener('click', closeModal)
  );
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', closeModal);
}

document.querySelectorAll('.modal-success-close').forEach(btn =>
  btn.addEventListener('click', closeModal)
);

  // Press ESC to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalWrapper && modalWrapper.classList.contains('active')) {
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
      openModal('start-project-modal', null, 'Start Project');
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
    navSignInBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await window.originyxAuth?.init();
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
  const groupConfirmPassword = document.getElementById('group-confirm-password');
  const authPasswordGuidance = document.getElementById('auth-password-guidance');
  const authForgotPasswordLink = document.getElementById('auth-forgot-password-link');
  const authSubmitBtn = document.getElementById('btn-auth-submit');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');

  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      clearAuthError();
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      if (groupFullname) {
        groupFullname.style.display = 'none';
        const input = groupFullname.querySelector('input');
        if (input) input.removeAttribute('required');
      }
      if (groupConfirmPassword) {
        groupConfirmPassword.style.display = 'none';
        const input = groupConfirmPassword.querySelector('input');
        if (input) input.removeAttribute('required');
      }
      if (authPasswordGuidance) {
        authPasswordGuidance.style.display = 'none';
      }
      if (authForgotPasswordLink) {
        authForgotPasswordLink.style.display = 'inline-block';
      }
      const groupCompliance = document.getElementById('group-compliance');
      if (groupCompliance) {
        groupCompliance.style.display = 'none';
        const complianceCheck = groupCompliance.querySelector('input');
        if (complianceCheck) complianceCheck.removeAttribute('required');
      }
      if (authSubmitBtn) {
        const textEl = authSubmitBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Sign In';
      }
      if (authModalTitle) authModalTitle.textContent = 'Sign In';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Log in or create an account to start your project.';
    });

    tabSignup.addEventListener('click', () => {
      clearAuthError();
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      if (groupFullname) {
        groupFullname.style.display = 'flex';
        const input = groupFullname.querySelector('input');
        if (input) input.setAttribute('required', 'true');
      }
      if (groupConfirmPassword) {
        groupConfirmPassword.style.display = 'flex';
        const input = groupConfirmPassword.querySelector('input');
        if (input) input.setAttribute('required', 'true');
      }
      if (authPasswordGuidance) {
        authPasswordGuidance.style.display = 'block';
      }
      if (authForgotPasswordLink) {
        authForgotPasswordLink.style.display = 'none';
      }
      const groupCompliance = document.getElementById('group-compliance');
      if (groupCompliance) {
        groupCompliance.style.display = 'flex';
        const complianceCheck = groupCompliance.querySelector('input');
        if (complianceCheck) complianceCheck.setAttribute('required', 'true');
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
      
      const submitBtn = document.getElementById('btn-auth-submit');
      if (!submitBtn || submitBtn.disabled) return; // Prevent double submission

      const emailEl = document.getElementById('auth-email');
      const email = emailEl ? emailEl.value.trim() : '';
      const passwordEl = document.getElementById('auth-password');
      const password = passwordEl ? passwordEl.value : '';
      const fullNameInput = document.getElementById('auth-fullname');
      const fullName = fullNameInput ? fullNameInput.value.trim() : '';
      
      const isSignUp = tabSignup && tabSignup.classList.contains('active');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      clearAuthError();

      // Client-side validations for Sign Up
      if (isSignUp) {
        const confirmPasswordEl = document.getElementById('auth-confirm-password');
        const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

        if (password !== confirmPassword) {
          showAuthError('Passwords do not match.');
          return;
        }

        if (!validatePasswordStrength(password)) {
          showAuthError('Password must be 8-128 characters, including an uppercase letter, a lowercase letter, and a number.');
          return;
        }

        const complianceCheck = document.getElementById('auth-compliance');
        if (complianceCheck && !complianceCheck.checked) {
          showAuthError('You must agree to the Privacy Policy and Terms & Conditions.');
          return;
        }
      }

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        if (isSignUp) {
          const data = await window.originyxAuth.signUp(email, password, fullName);
          
          // Detect if user already registered (empty identities array)
          if (data && data.user && (!data.user.identities || data.user.identities.length === 0)) {
            showAuthError('This email is already registered. Sign in or reset your password.', [
              { text: 'Sign In', callback: switchToLoginTab },
              { text: 'Forgot Password', callback: () => openForgotPasswordFlow(email) }
            ]);
          } else if (!data.session) {
            showAuthSuccess('Sign up successful! Please check your email for verification instructions.');
            // Auto close after 4 seconds to let them read success message
            setTimeout(() => closeModal(), 4000);
          } else {
            closeModal();
          }
        } else {
          await window.originyxAuth.signIn(email, password);
        }
      } catch (err) {
        console.error('Auth action error:', err);
        const errMsg = err.message || '';
        if (errMsg.includes('already') || errMsg.includes('registered') || errMsg.includes('exists')) {
          showAuthError('This email is already registered. Sign in or reset your password.', [
            { text: 'Sign In', callback: switchToLoginTab },
            { text: 'Forgot Password', callback: () => openForgotPasswordFlow(email) }
          ]);
        } else {
          showAuthError(err.message || 'An error occurred during authentication.');
        }
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
      if (btnGoogle.disabled) return;
      btnGoogle.disabled = true;
      try {
        await window.originyxAuth.signInWithOAuth('google');
      } catch (err) {
        alert(err.message || 'Failed to start Google Sign In.');
        btnGoogle.disabled = false;
      }
    });
  }

  const btnMicrosoft = document.getElementById('btn-login-microsoft');
  if (btnMicrosoft) {
    btnMicrosoft.addEventListener('click', async (e) => {
      e.preventDefault();
      if (btnMicrosoft.disabled) return;
      btnMicrosoft.disabled = true;
      try {
        await window.originyxAuth.signInWithOAuth('azure');
      } catch (err) {
        alert(err.message || 'Failed to start Microsoft Sign In.');
        btnMicrosoft.disabled = false;
      }
    });
  }

  /* ---------- FORGOT PASSWORD FLOW ---------- */
  const forgotPasswordLink = document.getElementById('auth-forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      openForgotPasswordFlow();
    });
  }

  const backToSignInLink = document.getElementById('link-back-to-signin');
  if (backToSignInLink) {
    backToSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuthError();
      const forgotPasswordContainer = document.getElementById('auth-forgot-password-container');
      const authMainContainer = document.getElementById('auth-main-container');
      if (forgotPasswordContainer) forgotPasswordContainer.style.display = 'none';
      if (authMainContainer) authMainContainer.style.display = 'block';
      switchToLoginTab();
    });
  }

  const forgotForm = document.getElementById('form-forgot-password');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('btn-forgot-submit');
      if (!submitBtn || submitBtn.disabled) return; // Prevent double submission

      const emailEl = document.getElementById('forgot-email');
      const email = emailEl ? emailEl.value.trim() : '';
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      clearAuthError();

      if (!email) {
        showAuthError('Please enter a valid email address.');
        return;
      }

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        await window.originyxAuth.resetPassword(email);
        // Email Enumeration Protection: Always show success message
        showAuthSuccess('If an account exists for this email, a password reset link has been sent.');
      } catch (err) {
        console.error('Forgot password action error:', err);
        // Still always show success to protect against email enumeration, or show error if it is a system/connection failure (not email-existence related)
        if (err.message && (err.message.includes('valid') || err.message.includes('rate limit') || err.message.includes('network'))) {
          showAuthError(err.message);
        } else {
          showAuthSuccess('If an account exists for this email, a password reset link has been sent.');
        }
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  /* ---------- UPDATE PASSWORD FLOW (RECOVERY) ---------- */
  const updateForm = document.getElementById('form-update-password');
  if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('btn-update-submit');
      if (!submitBtn || submitBtn.disabled) return; // Prevent double submission

      const newPasswordEl = document.getElementById('update-password');
      const newPassword = newPasswordEl ? newPasswordEl.value : '';
      const confirmNewPasswordEl = document.getElementById('update-confirm-password');
      const confirmNewPassword = confirmNewPasswordEl ? confirmNewPasswordEl.value : '';
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      clearAuthError();

      if (newPassword !== confirmNewPassword) {
        showAuthError('Passwords do not match.');
        return;
      }

      if (!validatePasswordStrength(newPassword)) {
        showAuthError('Password must contain at least 8 characters, including an uppercase letter and a number.');
        return;
      }

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        await window.originyxAuth.updatePassword(newPassword);
        showAuthSuccess('Password updated successfully. You are now logged in.');
        setTimeout(() => {
          closeModal();
          // Reset auth modal states
          const updatePasswordContainer = document.getElementById('auth-update-password-container');
          const authMainContainer = document.getElementById('auth-main-container');
          if (updatePasswordContainer) updatePasswordContainer.style.display = 'none';
          if (authMainContainer) authMainContainer.style.display = 'block';
        }, 2000);
      } catch (err) {
        console.error('Update password action error:', err);
        showAuthError(err.message || 'Failed to update password.');
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  /* ---------- PROJECT REQUEST FORM SUBMISSION ---------- */
  const projectRequestForms = document.querySelectorAll('#form-project-request');
  projectRequestForms.forEach(projectRequestForm => {
    projectRequestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = projectRequestForm.querySelector('.form-submit-btn');
      if (!submitBtn) return;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const successState = projectRequestForm.parentNode.querySelector('.modal-success-state') || document.getElementById('request-success-state');

      const action = {
        kind: 'form',
        formId: projectRequestForm.id,
        sourcePage: window.location.pathname,
        sourceCta: btnText ? btnText.textContent.trim() : 'Project Request',
        modalId: 'project-request-modal',
        leadSource: 'Project Request'
      };
      if (!await requireAuthentication(action, () => projectRequestForm.requestSubmit())) return;
      const token = window.originyxAuth.session.access_token;

      // Enter loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      const formData = new FormData(projectRequestForm);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });
      //new element to identify form type on backend for routing (14 - 06 - 2026)
      payload.formType = 'project-consultation'

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
  });

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

    } else {
      if (navSignIn) navSignIn.classList.remove('hidden');
      if (navDropdown) navDropdown.classList.add('hidden');
    }
  }

  // Bind auth state change custom event
  window.addEventListener('originyx-auth-state-change', (e) => {
    const { configured, authenticated, user, event } = e.detail;
    updateAuthStateUI(configured, authenticated, user);
    
    if (event === 'SIGNED_OUT') {
      clearPendingAction();
      closeModal();
    }

    if (authenticated && ['SIGNED_IN', 'INITIAL_SESSION', 'INITIAL'].includes(event)) {
      closeModal();
      resumePendingAction();
    }
    
    if (event === 'PASSWORD_RECOVERY') {
      openUpdatePasswordFlow();
    }
  });

  // Re-dispatch current state on initialization in case scripts raced
  if (window.originyxAuth && window.originyxAuth.configured !== undefined) {
    updateAuthStateUI(window.originyxAuth.configured, window.originyxAuth.isAuthenticated(), window.originyxAuth.user);
  }

  /* ---------- ORIGINAL FORMS DISPATCH ---------- */
  // Handle generic modal forms (contact, project requests) but exclude all auth-related forms
  const modalForms = document.querySelectorAll('.modal-form:not(#form-auth-email):not(#form-project-request):not(#form-forgot-password):not(#form-update-password)');
  modalForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit-btn');
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
      const targetModal = form.closest('.modal-container');
      const successState = targetModal ? targetModal.querySelector('.modal-success-state') : (form.parentNode ? form.parentNode.querySelector('.modal-success-state') : null);

      const action = {
        kind: 'form',
        formId: form.id,
        sourcePage: window.location.pathname,
        sourceCta: btnText ? btnText.textContent.trim() : 'Form Submission',
        modalId: targetModal ? targetModal.id : null,
        leadSource: form.id
      };
      if (!await requireAuthentication(action, () => form.requestSubmit())) return;

      // Enter loading state
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.opacity = '0.5';
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      // Retrieve form values
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      if (form.id === 'form-contact-page-request') {
        payload.formType = 'project-consultation';
        payload.company = payload.businessName;
        payload.description = payload.workflowDescription;
        payload.outcome = payload.desiredOutcome;
      }

      console.log('Submitting payload:', payload);

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
        if (submitBtn) submitBtn.disabled = false;
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
  if (slides.length > 0) {
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopAutoplay);
      sliderContainer.addEventListener('mouseleave', startAutoplay);
    }
    // Initialize
    startAutoplay();
  }

  /* ---------- PASSWORD VISIBILITY TOGGLE ---------- */
  const togglePasswordBtns = document.querySelectorAll('.btn-toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = btn.closest('form');
      if (form) {
        const inputs = form.querySelectorAll('input[type="password"], input[type="text"].auth-pw-revealed');
        const btns = form.querySelectorAll('.btn-toggle-password');
        
        let currentlyHidden = false;
        if (inputs.length > 0 && inputs[0].type === 'password') {
          currentlyHidden = true;
        }

        inputs.forEach(input => {
          if (currentlyHidden) {
            input.type = 'text';
            input.classList.add('auth-pw-revealed');
          } else {
            input.type = 'password';
            input.classList.remove('auth-pw-revealed');
          }
        });

        btns.forEach(b => {
          b.textContent = currentlyHidden ? '👁 Hide' : '👁 Show';
        });
      }
    });
  });

});
