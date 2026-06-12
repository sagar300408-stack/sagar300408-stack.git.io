/* ============================================
   SAGAR M — Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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
  const navLinksContainer = document.getElementById('nav-links');
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
  const modalWrapper = document.getElementById('modal-wrapper');
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

      if (protectedModals.includes(modalId)) {
        // Gather context
        const sourcePage = window.location.pathname;
        const sourceCta = trigger.textContent.trim();
        let productInterest = 'Originyx';

        if (modalId === 'project-interest-modal' && projectName) {
          productInterest = projectName;
        } else if (modalId === 'automation-audit-modal') {
          productInterest = 'Free Audit';
        } else if (modalId === 'project-consultation-modal') {
          productInterest = 'Consultation';
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
        // Open other modal normally (e.g. auth-modal directly)
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
      openProjectRequestModal('/', 'Navbar Dropdown', 'Originyx');
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
