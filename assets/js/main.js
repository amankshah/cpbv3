(() => {
  'use strict';

  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  onReady(() => {
    // Navbar shadow on scroll
    const navbar = document.querySelector('.navbar');
    const updateNavbar = () => {
      if (!navbar) return;
      const scrolled = window.scrollY > 8;
      navbar.classList.toggle('navbar-scrolled', scrolled);
    };
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    // Smooth scroll for internal nav links (Bootstrap already prevents default collapse behavior)
    document.querySelectorAll('a.nav-link[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Current year in footer
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    // Fallback for any missing expert images
    document.querySelectorAll('img[data-fallback]').forEach((img) => {
      img.addEventListener('error', () => {
        img.removeAttribute('srcset');
        img.src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=60';
      }, { once: true });
    });

    // Services carousel (Swiper)
    if (window.Swiper) {
      const swiper = new Swiper('.services-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        loop: true,
        speed: 500,
        navigation: {
          prevEl: '.services-prev',
          nextEl: '.services-next'
        },
        breakpoints: {
          320: { slidesPerView: 1.2, spaceBetween: 16 },
          576: { slidesPerView: 1.5, spaceBetween: 16 },
          768: { slidesPerView: 2.5, spaceBetween: 18 },
          992: { slidesPerView: 3, spaceBetween: 20 },
          1200: { slidesPerView: 5, spaceBetween: 24 },
        },
        on: {
          // force reflow of transforms for smooth ladder transitions
          slideChangeTransitionStart() {
            document.querySelectorAll('.services-swiper .swiper-slide').forEach((el) => {
              // trigger CSS transitions reliably
              // eslint-disable-next-line no-unused-expressions
              el.offsetHeight;
            });
          }
        }
      });

      // Testimonials swiper
      const testi = new Swiper('.testi-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        autoHeight: true,
        navigation: {
          prevEl: '.testi-prev',
          nextEl: '.testi-next'
        }
      });
    }

    // Image accordion interactions (Experts section)
    const ia = document.querySelector('[data-image-accordion]');
    if (ia) {
      const items = Array.from(ia.querySelectorAll('.ia-item'));
      const activate = (el) => {
        items.forEach((item) => item.classList.toggle('active', item === el));
      };
      items.forEach((item) => {
        item.addEventListener('mouseenter', () => activate(item));
        item.addEventListener('focus', () => activate(item));
        item.addEventListener('click', () => activate(item));
      });
    }

    // Service card flip functionality
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-flip-card]')) {
        e.preventDefault();
        const card = e.target.closest('.service-card');
        if (card) {
          card.classList.add('flipped');
        }
      }
      
      if (e.target.matches('[data-flip-back]')) {
        e.preventDefault();
        const card = e.target.closest('.service-card');
        if (card) {
          card.classList.remove('flipped');
        }
      }
    });

    // Auto flip back on mouse leave
    document.addEventListener('mouseleave', (e) => {
      if (e.target.matches('.service-card.flipped')) {
        e.target.classList.remove('flipped');
      }
    }, true);

    // Inline YouTube player: replace thumbnail with iframe on click
    const playTargets = document.querySelectorAll('.play-btn');
    const createYouTubeIframe = (ytid) => {
      const params = new URLSearchParams({
        autoplay: '1',
        controls: '0',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
        mute: '0'
      });
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytid}?${params.toString()}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.title = 'YouTube video player';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      return iframe;
    };

    playTargets.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const wrapper = btn.closest('[data-ytid]');
        if (!wrapper) return;
        const ytid = wrapper.getAttribute('data-ytid');
        if (!ytid) return;
        const ratio = wrapper.querySelector('.ratio') || wrapper;
        // Mark as playing so overlays and buttons can hide
        wrapper.classList.add('is-playing');
        ratio.innerHTML = '';
        ratio.appendChild(createYouTubeIframe(ytid));
      });
    });
  });

  // Expose a simple theme updater so you can change colors later from JS
  // Example: window.setThemeColors({ primary: '#4f46e5', secondary: '#64748b' });
  window.setThemeColors = function setThemeColors(colors = {}) {
    const root = document.documentElement;
    const map = {
      primary: '--color-primary',
      secondary: '--color-secondary',
      accent: '--color-accent',
      text: '--color-text',
      background: '--color-background',
      surface: '--color-surface'
    };
    Object.entries(colors).forEach(([key, value]) => {
      if (map[key] && typeof value === 'string') {
        root.style.setProperty(map[key], value);
      }
    });
    // Keep Bootstrap variables in sync for components like .btn-primary
    const primary = colors.primary;
    const secondary = colors.secondary;
    if (typeof primary === 'string') root.style.setProperty('--bs-primary', primary);
    if (typeof secondary === 'string') root.style.setProperty('--bs-secondary', secondary);
  };
})();


