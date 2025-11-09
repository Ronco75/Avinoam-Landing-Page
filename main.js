// ===================================
// AVINOAM HATAL - MENTAL COACHING
// Hebrew RTL Landing Page JavaScript
// ===================================

(function() {
  'use strict';

  // ===================================
  // CONFIGURATION
  // ===================================
  const CONFIG = {
    // Form endpoint - replace with actual backend URL
    formEndpoint: window.FORM_ENDPOINT || '',

    // Analytics flag - set to true to enable cookie banner and analytics
    analyticsEnabled: window.ENABLE_ANALYTICS === true,

    // Israeli phone regex
    phoneRegex: /^0(5\d|[2-9])[-\s]?\d{7}$/,

    // Hebrew/Latin name regex
    nameRegex: /^[\u0590-\u05FFa-zA-Z\s'-]+$/,
  };

  // ===================================
  // ANALYTICS STUBS
  // ===================================
  const Analytics = {
    consentGiven: false,

    init() {
      // Check for existing consent
      const consent = localStorage.getItem('analytics_consent');
      if (consent === 'true') {
        this.consentGiven = true;
      }
    },

    track(eventName, data = {}) {
      if (CONFIG.analyticsEnabled && this.consentGiven) {
        console.log('[Analytics] Event tracked:', eventName, data);
        // TODO: Add actual analytics implementation (Google Analytics, etc.)
      } else {
        console.log('[Analytics] Event (not tracked):', eventName, data);
      }
    },

    setConsent(hasConsent) {
      this.consentGiven = hasConsent;
      localStorage.setItem('analytics_consent', hasConsent.toString());
      if (hasConsent) {
        console.log('[Analytics] Consent given, tracking enabled');
      }
    },
  };

  // ===================================
  // UTM PARAMETERS
  // ===================================
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
    };
  }

  // ===================================
  // SMOOTH SCROLL
  // ===================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if href is just "#"
        if (href === '#') {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Track navigation
          Analytics.track('navigation_click', { target: href });
        }
      });
    });
  }

  // ===================================
  // STICKY HEADER
  // ===================================
  function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  // ===================================
  // REVEAL ON SCROLL
  // ===================================
  function initRevealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach(reveal => observer.observe(reveal));
  }

  // ===================================
  // TESTIMONIALS SLIDER
  // ===================================
  function initTestimonialsSlider() {
    const track = document.getElementById('slider-track');
    const prevBtn = document.querySelector('.slider__btn--prev');
    const nextBtn = document.querySelector('.slider__btn--next');
    const dotsContainer = document.querySelector('.slider__dots');
    const statusElement = document.querySelector('.slider__status');

    if (!track) return;

    const slides = track.querySelectorAll('.testimonial-card');
    const totalSlides = slides.length;
    let currentIndex = 0;

    // Create dots
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('slider__dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `עדות ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      if (index === 0) dot.classList.add('active');

      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider__dot');

    function updateSlider() {
      // Update track position (RTL: use positive transform values)
      track.style.transform = `translateX(${currentIndex * 100}%)`;

      // Update dots
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });

      // Update buttons state
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === totalSlides - 1;

      // Update status for screen readers
      if (statusElement) {
        statusElement.textContent = `עדות ${currentIndex + 1} מתוך ${totalSlides}`;
      }

      // Track event
      Analytics.track('testimonial_view', { index: currentIndex });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      updateSlider();
    }

    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateSlider();
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Keyboard navigation
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        prevSlide(); // RTL: right arrow goes to previous
      } else if (e.key === 'ArrowLeft') {
        nextSlide(); // RTL: left arrow goes to next
      }
    });

    // Auto-advance (optional)
    let autoAdvanceTimer;
    function startAutoAdvance() {
      autoAdvanceTimer = setInterval(() => {
        if (currentIndex < totalSlides - 1) {
          nextSlide();
        } else {
          goToSlide(0);
        }
      }, 7000);
    }

    function stopAutoAdvance() {
      clearInterval(autoAdvanceTimer);
    }

    // Start auto-advance
    startAutoAdvance();

    // Pause on hover or focus
    track.addEventListener('mouseenter', stopAutoAdvance);
    track.addEventListener('mouseleave', startAutoAdvance);
    track.addEventListener('focusin', stopAutoAdvance);
    track.addEventListener('focusout', startAutoAdvance);

    // Initial update
    updateSlider();
  }

  // ===================================
  // FAQ TRACKING
  // ===================================
  function initFAQTracking() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          const faqId = item.getAttribute('data-faq-id');
          Analytics.track('faq_open', { id: faqId });
        }
      });
    });
  }

  // ===================================
  // FORM VALIDATION
  // ===================================
  const FormValidator = {
    validateName(value) {
      if (!value.trim()) {
        return 'נא להזין שם מלא';
      }
      if (value.trim().length < 2) {
        return 'השם חייב להכיל לפחות 2 תווים';
      }
      if (!CONFIG.nameRegex.test(value)) {
        return 'השם יכול להכיל רק אותיות בעברית/אנגלית, רווחים ומקפים';
      }
      return '';
    },

    validatePhone(value) {
      if (!value.trim()) {
        return 'נא להזין מספר טלפון';
      }
      if (!CONFIG.phoneRegex.test(value)) {
        return 'נא להזין מספר טלפון ישראלי תקין (10 ספרות)';
      }
      return '';
    },

    validateEmail(value) {
      // Email is optional, but if provided, must be valid
      if (!value.trim()) {
        return '';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'נא להזין כתובת אימייל תקינה';
      }
      return '';
    },

    validateConsent(checked) {
      if (!checked) {
        return 'יש לאשר את תנאי השימוש בפרטים';
      }
      return '';
    },
  };

  // ===================================
  // FORM SUBMISSION
  // ===================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const formSuccess = document.getElementById('form-success');

    if (!form) return;

    const inputs = {
      name: form.querySelector('[name="name"]'),
      phone: form.querySelector('[name="phone"]'),
      email: form.querySelector('[name="email"]'),
      consent: form.querySelector('[name="consent"]'),
      honeypot: form.querySelector('[name="website"]'),
    };

    const errors = {
      name: document.getElementById('name-error'),
      phone: document.getElementById('phone-error'),
      email: document.getElementById('email-error'),
      consent: document.getElementById('consent-error'),
    };

    // Real-time validation
    function validateField(fieldName) {
      let errorMsg = '';
      const input = inputs[fieldName];

      if (!input) return;

      switch(fieldName) {
        case 'name':
          errorMsg = FormValidator.validateName(input.value);
          break;
        case 'phone':
          errorMsg = FormValidator.validatePhone(input.value);
          break;
        case 'email':
          errorMsg = FormValidator.validateEmail(input.value);
          break;
        case 'consent':
          errorMsg = FormValidator.validateConsent(input.checked);
          break;
      }

      if (errors[fieldName]) {
        errors[fieldName].textContent = errorMsg;
        if (errorMsg) {
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      }

      return errorMsg === '';
    }

    // Add blur event listeners
    Object.keys(inputs).forEach(fieldName => {
      if (fieldName === 'honeypot') return;

      const input = inputs[fieldName];
      if (input) {
        input.addEventListener('blur', () => validateField(fieldName));
        input.addEventListener('input', () => {
          // Clear error on input
          if (errors[fieldName] && errors[fieldName].textContent) {
            validateField(fieldName);
          }
        });
      }
    });

    // Update submit button state based on consent
    inputs.consent.addEventListener('change', () => {
      validateField('consent');
      submitBtn.disabled = !inputs.consent.checked;
    });

    // Initial state
    submitBtn.disabled = !inputs.consent.checked;

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check honeypot (spam protection)
      if (inputs.honeypot.value) {
        console.warn('[Form] Honeypot triggered, possible spam');
        return;
      }

      // Validate all fields
      const isNameValid = validateField('name');
      const isPhoneValid = validateField('phone');
      const isEmailValid = validateField('email');
      const isConsentValid = validateField('consent');

      if (!isNameValid || !isPhoneValid || !isEmailValid || !isConsentValid) {
        formStatus.textContent = 'נא לתקן את השגיאות בטופס';
        formStatus.className = 'form-status error';
        return;
      }

      // Prepare form data
      const formData = {
        name: inputs.name.value.trim(),
        phone: inputs.phone.value.trim(),
        email: inputs.email.value.trim(),
        utm: getUTMParams(),
        ts: new Date().toISOString(),
      };

      // Set loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      formStatus.textContent = '';

      try {
        // If no endpoint configured, show demo success
        if (!CONFIG.formEndpoint) {
          console.log('[Form] Demo mode - no endpoint configured');
          console.log('[Form] Form data:', formData);

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          showSuccess();
          Analytics.track('form_submit', { demo: true });
          return;
        }

        // Make actual request
        const response = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('[Form] Success:', result);

        showSuccess();
        Analytics.track('form_submit', { success: true });

      } catch (error) {
        console.error('[Form] Error:', error);
        formStatus.textContent = 'אירעה שגיאה בשליחת הטופס. נא לנסות שוב או ליצור קשר ישירות בוואטסאפ.';
        formStatus.className = 'form-status error';
        Analytics.track('form_submit', { success: false, error: error.message });
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = !inputs.consent.checked;
      }
    });

    function showSuccess() {
      form.style.display = 'none';
      formSuccess.hidden = false;

      // Scroll to success message
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ===================================
  // COOKIE BANNER
  // ===================================
  function initCookieBanner() {
    if (!CONFIG.analyticsEnabled) return;

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const preferencesBtn = document.getElementById('cookie-preferences');
    const modal = document.getElementById('cookie-preferences');
    const closePreferencesBtn = document.getElementById('close-preferences');

    if (!banner) return;

    // Check if user already responded
    const consent = localStorage.getItem('analytics_consent');
    if (consent !== null) {
      return; // User already made a choice
    }

    // Show banner
    setTimeout(() => {
      banner.setAttribute('aria-hidden', 'false');
    }, 2000);

    // Accept cookies
    acceptBtn.addEventListener('click', () => {
      Analytics.setConsent(true);
      banner.setAttribute('aria-hidden', 'true');
      Analytics.track('cookie_consent', { accepted: true });
    });

    // Open preferences modal
    preferencesBtn.addEventListener('click', () => {
      modal.hidden = false;
      Analytics.track('cookie_preferences_open');
    });

    // Close preferences modal
    closePreferencesBtn.addEventListener('click', () => {
      modal.hidden = true;
    });

    // Close modal on overlay click
    modal.querySelector('.modal__overlay').addEventListener('click', () => {
      modal.hidden = true;
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) {
        modal.hidden = true;
      }
    });
  }

  // ===================================
  // WHATSAPP TRACKING
  // ===================================
  function initWhatsAppTracking() {
    document.querySelectorAll('[data-track="whatsapp_click"], [data-track="whatsapp_floating"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const location = e.currentTarget.getAttribute('data-track');
        Analytics.track('whatsapp_click', { location });
      });
    });
  }

  // ===================================
  // CTA TRACKING
  // ===================================
  function initCTATracking() {
    document.querySelectorAll('[data-track]').forEach(element => {
      element.addEventListener('click', (e) => {
        const eventName = e.currentTarget.getAttribute('data-track');
        Analytics.track(eventName);
      });
    });
  }

  // ===================================
  // SCROLL DEPTH TRACKING
  // ===================================
  function initScrollDepthTracking() {
    let maxDepth = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set();

    function calculateScrollDepth() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      return Math.min(scrollPercent, 100);
    }

    function trackScrollDepth() {
      const depth = calculateScrollDepth();

      if (depth > maxDepth) {
        maxDepth = depth;

        thresholds.forEach(threshold => {
          if (depth >= threshold && !tracked.has(threshold)) {
            tracked.add(threshold);
            Analytics.track('scroll_depth', { percent: threshold });
          }
        });
      }
    }

    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScrollDepth, 100);
    });
  }

  // ===================================
  // FOOTER YEAR
  // ===================================
  function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // ===================================
  // LEGAL SECTIONS MODAL
  // ===================================
  function initLegalSections() {
    const privacyLink = document.querySelector('a[href="#privacy"]');
    const accessibilityLink = document.querySelector('a[href="#accessibility"]');
    const privacySection = document.getElementById('privacy');
    const accessibilitySection = document.getElementById('accessibility');

    function showLegalSection(section) {
      if (!section) return;

      // Simple modal approach
      section.hidden = false;
      section.style.position = 'fixed';
      section.style.top = '0';
      section.style.left = '0';
      section.style.right = '0';
      section.style.bottom = '0';
      section.style.overflow = 'auto';
      section.style.zIndex = '100';
      section.style.backgroundColor = 'var(--bg)';

      // Add close button
      if (!section.querySelector('.close-legal')) {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'סגור';
        closeBtn.className = 'btn btn--primary close-legal';
        closeBtn.style.position = 'sticky';
        closeBtn.style.top = '20px';
        closeBtn.style.margin = '20px auto';
        closeBtn.style.display = 'block';
        closeBtn.addEventListener('click', () => {
          section.hidden = true;
        });
        section.querySelector('.container').appendChild(closeBtn);
      }
    }

    if (privacyLink && privacySection) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLegalSection(privacySection);
      });
    }

    if (accessibilityLink && accessibilitySection) {
      accessibilityLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLegalSection(accessibilitySection);
      });
    }
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  function init() {
    console.log('[App] Initializing...');

    // Initialize analytics
    Analytics.init();

    // Initialize all features
    updateFooterYear();
    initSmoothScroll();
    initStickyHeader();
    initRevealOnScroll();
    initTestimonialsSlider();
    initFAQTracking();
    initContactForm();
    initCookieBanner();
    initWhatsAppTracking();
    initCTATracking();
    initScrollDepthTracking();
    initLegalSections();

    console.log('[App] Ready!');

    // Track page load
    Analytics.track('page_load', {
      url: window.location.pathname,
      utm: getUTMParams(),
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
