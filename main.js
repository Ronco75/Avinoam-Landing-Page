/**
 * AVINOAM HATAL - MENTAL COACHING
 * Main JavaScript File
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Tell motion.js the page height changed (FAQ, legal sections, etc.)
   */
  function notifyLayoutChange() {
    window.dispatchEvent(new CustomEvent('layoutchange'));
  }

  // ===================================
  // FORM VALIDATION & SUBMISSION
  // ===================================

  /**
   * Validate form inputs
   */
  function validateForm(form) {
    const name = form.querySelector('#contact-name');
    const phone = form.querySelector('#contact-phone');
    const email = form.querySelector('#contact-email');
    const consent = form.querySelector('#contact-consent');

    let isValid = true;

    // Validate name
    if (!name.value.trim()) {
      showError(name, 'נא להזין שם מלא');
      isValid = false;
    } else {
      clearError(name);
    }

    // Validate phone (Israeli phone format)
    const phonePattern = /^0\d{1,2}-?\d{7}$/;
    if (!phone.value.trim()) {
      showError(phone, 'נא להזין מספר טלפון');
      isValid = false;
    } else if (!phonePattern.test(phone.value.replace(/\s/g, ''))) {
      showError(phone, 'מספר טלפון לא תקין');
      isValid = false;
    } else {
      clearError(phone);
    }

    // Validate email (optional, but must be valid if provided)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() && !emailPattern.test(email.value)) {
      showError(email, 'כתובת אימייל לא תקינה');
      isValid = false;
    } else {
      clearError(email);
    }

    // Validate consent
    if (!consent.checked) {
      showError(consent, 'נא לאשר את תנאי השימוש');
      isValid = false;
    } else {
      clearError(consent);
    }

    return isValid;
  }

  /**
   * Show error message for input
   */
  function showError(input, message) {
    input.classList.add('error');
    const errorElement = document.getElementById(input.id.replace('contact-', '') + '-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /**
   * Clear error message for input
   */
  function clearError(input) {
    input.classList.remove('error');
    const errorElement = document.getElementById(input.id.replace('contact-', '') + '-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  /**
   * Handle form submission
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check honeypot (spam protection)
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        // Bot detected, silently fail
        return;
      }

      // Validate form
      if (!validateForm(form)) {
        return;
      }

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Collect form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email')
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/avinoamhattal18@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: 'ליד חדש מהאתר - ' + data.name,
            _template: 'table',
            _captcha: 'false',
            'שם': data.name,
            'טלפון': data.phone,
            'אימייל': data.email || 'לא צוין'
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === 'false' || result.success === false) {
          throw new Error(result.message || 'Form submission failed');
        }

        // Success - hide form, show success message
        form.hidden = true;
        formSuccess.hidden = false;

        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Track conversion (if analytics is set up)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', {
            currency: 'ILS',
            value: 250
          });
        }

      } catch (error) {
        // Error handling
        formStatus.textContent = 'אירעה שגיאה. נא לנסות שוב או ליצור קשר בוואטסאפ.';
        formStatus.className = 'form-status error';

        console.error('Form submission error:', error);
      } finally {
        // Reset loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    // Real-time validation on blur
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value.trim()) {
          validateForm(form);
        }
      });
    });
  }

  // ===================================
  // COOKIE BANNER
  // ===================================

  /**
   * Handle cookie banner
   */
  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const preferencesBtn = document.getElementById('cookie-preferences-btn');

    if (!banner) return;

    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');

    if (!cookiesAccepted) {
      // Show banner after short delay
      setTimeout(() => {
        banner.setAttribute('aria-hidden', 'false');
      }, 2000);
    }

    // Accept cookies
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.setAttribute('aria-hidden', 'true');

        // Initialize analytics if needed
        initAnalytics();
      });
    }

    // Open preferences modal
    if (preferencesBtn) {
      preferencesBtn.addEventListener('click', () => {
        const modal = document.getElementById('cookie-preferences');
        if (modal) {
          modal.hidden = false;
          trapFocusInModal(modal);
          modal.querySelector('button')?.focus();
        }
      });
    }

    // Close preferences modal
    const closePreferencesBtn = document.getElementById('close-preferences');
    if (closePreferencesBtn) {
      closePreferencesBtn.addEventListener('click', () => {
        const modal = document.getElementById('cookie-preferences');
        if (modal) {
          modal.hidden = true;
        }
      });
    }
  }

  /**
   * Initialize analytics (placeholder)
   */
  function initAnalytics() {
    // Initialize Google Analytics or other tracking here
    // This would be called after user accepts cookies
    console.log('Analytics initialized');
  }

  // ===================================
  // SMOOTH SCROLL FOR NAVIGATION
  // ===================================

  /**
   * Smooth scroll to anchors
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Skip empty anchors
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        closeMenu();

        // Legal sections start hidden
        if (target.hasAttribute('hidden') && target.classList.contains('legal-section')) {
          target.removeAttribute('hidden');
          notifyLayoutChange();
        }

        scrollToTarget(target);

        // Update URL without jumping
        history.pushState(null, '', href);
      });
    });
  }

  /**
   * Scroll to an element below the fixed header, via Lenis when it's running
   */
  function scrollToTarget(target) {
    const headerHeight = document.querySelector('.header')?.offsetHeight || 76;

    if (window.lenis) {
      window.lenis.scrollTo(target, { offset: -headerHeight + 1, duration: 1.4 });
      return;
    }

    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  // ===================================
  // MOBILE MENU
  // ===================================

  function closeMenu() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.menu-toggle');
    if (!header || !header.classList.contains('menu-open')) return;
    header.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'פתיחת תפריט');
    window.lenis?.start();
  }

  function initMobileMenu() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.menu-toggle');
    if (!header || !toggle) return;

    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'סגירת תפריט' : 'פתיחת תפריט');
      if (isOpen) {
        header.classList.remove('is-hidden');
        window.lenis?.stop();
      } else {
        window.lenis?.start();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===================================
  // ACTIVE NAV LINK
  // ===================================

  function initActiveNav() {
    const links = [...document.querySelectorAll('.nav-link')];
    const sections = links
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // ===================================
  // FAQ: SMOOTH OPEN / CLOSE
  // ===================================

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(details => {
      const summary = details.querySelector('summary');
      const answer = details.querySelector('.faq-item__answer');
      if (!summary || !answer) return;

      let animation = null;

      summary.addEventListener('click', (e) => {
        if (prefersReducedMotion || !answer.animate) {
          // Native toggle; just let listeners know the height changed
          requestAnimationFrame(notifyLayoutChange);
          return;
        }

        e.preventDefault();
        animation?.cancel();

        const opening = !details.open;
        const startHeight = opening ? 0 : answer.offsetHeight;
        if (opening) details.open = true;
        const endHeight = opening ? answer.offsetHeight : 0;

        animation = answer.animate(
          [
            { height: startHeight + 'px', opacity: opening ? 0 : 1 },
            { height: endHeight + 'px', opacity: opening ? 1 : 0 }
          ],
          { duration: opening ? 450 : 300, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );

        animation.onfinish = () => {
          if (!opening) details.open = false;
          animation = null;
          notifyLayoutChange();
        };
      });
    });
  }

  // ===================================
  // FLOATING WHATSAPP NUDGE
  // ===================================

  function initWhatsappNudge() {
    const button = document.querySelector('.floating-whatsapp');
    if (!button || prefersReducedMotion) return;
    setTimeout(() => button.classList.add('nudge'), 20000);
  }

  // ===================================
  // CURRENT YEAR IN FOOTER
  // ===================================

  /**
   * Set current year in footer
   */
  function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // ===================================
  // ACCESSIBILITY ENHANCEMENTS
  // ===================================

  /**
   * Trap focus in modal
   */
  function trapFocusInModal(modal) {
    if (modal.dataset.trapped) return;
    modal.dataset.trapped = 'true';

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        modal.hidden = true;
      }
    });
  }

  /**
   * Initialize modal accessibility
   */
  function initModalAccessibility() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.querySelector('.modal__overlay')?.addEventListener('click', () => {
        modal.hidden = true;
      });
    });
  }

  // ===================================
  // LAZY LOADING IMAGES
  // ===================================

  /**
   * Lazy load images with data-src attribute
   */
  function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // ===================================
  // HEADER SCROLL BEHAVIOR
  // ===================================

  /**
   * Add shadow to header on scroll
   */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const update = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ===================================
  // PERFORMANCE OPTIMIZATION
  // ===================================

  /**
   * Debounce function for performance
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===================================
  // INITIALIZATION
  // ===================================

  // ===================================
  // LEGAL SECTIONS TOGGLE
  // ===================================

  /**
   * Toggle legal sections (privacy, accessibility)
   */
  function initLegalToggles() {
    const toggleButtons = document.querySelectorAll('[data-toggle]');

    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const sectionId = button.dataset.toggle;
        const section = document.getElementById(sectionId);

        if (section) {
          // Toggle hidden attribute
          const isHidden = section.hasAttribute('hidden');

          if (isHidden) {
            section.removeAttribute('hidden');
            notifyLayoutChange();
            scrollToTarget(section);
          } else {
            section.setAttribute('hidden', '');
            notifyLayoutChange();
          }
        }
      });
    });
  }

  /**
   * Initialize all functionality when DOM is ready
   */
  function init() {
    // Set current year
    setCurrentYear();

    // Initialize form
    initContactForm();

    // Initialize cookie banner
    initCookieBanner();

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize lazy loading
    initLazyLoading();

    // Initialize header scroll behavior
    initHeaderScroll();

    // Initialize modal accessibility
    initModalAccessibility();

    // Initialize legal section toggles
    initLegalToggles();

    // Navigation & interactions
    initMobileMenu();
    initActiveNav();
    initFaq();
    initWhatsappNudge();

    console.log('✨ Avinoam Hattal - Mental Coaching - Initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===================================
  // TRACKING & ANALYTICS HELPERS
  // ===================================

  /**
   * Track CTA clicks
   */
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-track]');
    if (target && typeof gtag !== 'undefined') {
      const action = target.dataset.track;
      gtag('event', 'click', {
        event_category: 'CTA',
        event_label: action
      });
    }
  });

})();
