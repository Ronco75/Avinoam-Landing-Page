/**
 * AVINOAM HATAL - MENTAL COACHING
 * Main JavaScript File
 */

(function() {
  'use strict';

  // ===================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ===================================

  /**
   * Initialize scroll animations using IntersectionObserver
   * Elements with .animate-in class will fade in and slide up when they enter viewport
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-in');

    if (!animatedElements.length) return;

    // Configuration for the observer
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
      threshold: 0.1 // Trigger when 10% of element is visible
    };

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add visible class to trigger animation
          entry.target.classList.add('visible');

          // Optional: Stop observing after animation (performance optimization)
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animated elements
    animatedElements.forEach(element => {
      observer.observe(element);
    });
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
        // Here you would normally send to your backend
        // For now, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

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
    const preferencesBtn = document.getElementById('cookie-preferences');

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

        if (target) {
          e.preventDefault();

          // Calculate offset for fixed header
          const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
          const targetPosition = target.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
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
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (!modal.hidden) {
        trapFocusInModal(modal);
      }
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

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add scrolled class when past top
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
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
            // Scroll to section
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            section.setAttribute('hidden', '');
            // Scroll back to footer
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // Initialize scroll animations
    initScrollAnimations();

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
