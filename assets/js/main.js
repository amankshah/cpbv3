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
    // Navbar shadow and logo size on scroll
    const navbar = document.querySelector('.navbar');
    const navbarLogo = document.querySelector('.navbar-logo');
    const updateNavbar = () => {
      if (!navbar) return;
      const scrolled = window.scrollY > 8;
      navbar.classList.toggle('navbar-scrolled', scrolled);
      
      // Update logo size based on scroll position
      if (navbarLogo) {
        navbarLogo.classList.toggle('scrolled', scrolled);
      }
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
      // Testimonials swiper - normal carousel with fixed height
      const testi = new Swiper('.testi-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        autoHeight: true,
        loop: true,
        speed: 600,
        effect: 'slide',
        navigation: {
          prevEl: '.testi-prev',
          nextEl: '.testi-next'
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        on: {
          resize(sw) { sw.updateAutoHeight(300); },
          imagesReady(sw) { sw.updateAutoHeight(300); }
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

    // Vertical Scroll Features Functionality
    const initVerticalScrollFeatures = () => {
      const visualItems = document.querySelectorAll('.visual-item');
      const carousel = document.querySelector('.vertical-scroll-container');
      const ytContainers = document.querySelectorAll('.visual-yt');
      
      console.log('Vertical scroll elements found:', {
        visualItems: visualItems.length,
        carousel: !!carousel,
        ytContainers: ytContainers.length
      });
      
      if (!visualItems.length || !carousel) {
        console.error('Required vertical scroll elements not found');
        return;
      }

      // Prepare YouTube API
      let YTReady = false;
      const players = [];

      const onYouTubeIframeAPIReadyLocal = () => {
        YTReady = true;
        ytContainers.forEach((container, i) => {
          const ytid = container.getAttribute('data-ytid');
          if (!ytid) return;
          const params = new URLSearchParams({
            autoplay: '1',
            controls: '0',
            mute: '1',
            loop: '1',
            rel: '0',
            modestbranding: '1',
            playsinline: '1',
            enablejsapi: '1',
            playlist: ytid
          });
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${ytid}?${params.toString()}`;
          iframe.allow = 'autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.setAttribute('allowfullscreen', '');
          container.innerHTML = '';
          container.appendChild(iframe);
        });
      };

      // Inject YT API script once
      if (!window._ytApiInjected) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        window._ytApiInjected = true;
      }

      // Global callback bridge
      const prevOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function() {
        if (typeof prevOnYouTubeIframeAPIReady === 'function') prevOnYouTubeIframeAPIReady();
        onYouTubeIframeAPIReadyLocal();
      };

      // Helper to set which video should be visible/playing
      let currentIndex = 0;
      const setActiveIndex = (index) => {
        currentIndex = index;
        visualItems.forEach((item, i) => {
          item.className = 'visual-item' + (i === index ? ' active' : '');
        });
      };

      // Handle scroll events - matching vs.html exactly
      const handleScroll = () => {
        let proportion = carousel.getBoundingClientRect().top / window.innerHeight;
        let index = Math.ceil(-1 * (proportion + 0.5));
        index = Math.max(0, Math.min(index, visualItems.length - 1));
        if (index !== currentIndex) setActiveIndex(index);
      };

      document.addEventListener('scroll', handleScroll, { passive: true });

      // Initialize
      setActiveIndex(0);

      // Cleanup
      return () => {
        document.removeEventListener('scroll', handleScroll);
      };
    };

          // Initialize vertical scroll features
      initVerticalScrollFeatures();

    // 3D Services Showcase (inspired by card.html)
    const initServices3D = () => {
      const container = document.querySelector('#services-3d');
      if (!container) {
        console.log('3D Services container not found');
        return;
      }

      const cards = container.querySelectorAll('.services3d-card');
      const dots = container.querySelectorAll('.services3d-dot');
      const leftArrow = container.querySelector('.services3d-arrow.left');
      const rightArrow = container.querySelector('.services3d-arrow.right');

      console.log('3D Services elements:', {
        cards: cards.length,
        dots: dots.length,
        leftArrow: !!leftArrow,
        rightArrow: !!rightArrow
      });

      if (!cards.length) return;

      let currentIndex = 0;
      let isAnimating = false;

      // Inject flip structure (front/back) if not present
      cards.forEach((card) => {
        if (!card.querySelector('.services3d-inner')) {
          const img = card.querySelector('img');
          const info = card.querySelector('.services3d-info');
          const backTitle = card.getAttribute('data-back-title') || 'More details';
          const backDesc = card.getAttribute('data-back-desc') || 'Click arrows or dots to browse other services.';

          const inner = document.createElement('div');
          inner.className = 'services3d-inner';

          const front = document.createElement('div');
          front.className = 'services3d-front';
          const frontWrap = document.createElement('div');
          frontWrap.style.position = 'absolute';
          frontWrap.style.inset = '0';
          if (img) front.appendChild(img);
          if (info) front.appendChild(info);

          const back = document.createElement('div');
          back.className = 'services3d-back';
          const backContent = document.createElement('div');
          backContent.className = 'services3d-back-content';
          const titleEl = document.createElement('div');
          titleEl.className = 'services3d-back-title';
          titleEl.textContent = backTitle;
          const descEl = document.createElement('div');
          descEl.className = 'services3d-back-desc';
          descEl.textContent = backDesc;
          backContent.appendChild(titleEl);
          backContent.appendChild(descEl);
          back.appendChild(backContent);

          inner.appendChild(front);
          inner.appendChild(back);

          // Move existing non-inner children into inner handled above, now clear and attach
          card.innerHTML = '';
          card.appendChild(inner);
        }
      });

      // Exact implementation from card.html
      function updateCarousel(newIndex) {
        if (isAnimating) return;
        isAnimating = true;

        currentIndex = (newIndex + cards.length) % cards.length;

        cards.forEach((card, i) => {
          const offset = (i - currentIndex + cards.length) % cards.length;

          card.classList.remove(
            "center",
            "left-1", 
            "left-2",
            "right-1",
            "right-2",
            "hidden"
          );

          if (offset === 0) {
            card.classList.add("center");
          } else if (offset === 1) {
            card.classList.add("right-1");
          } else if (offset === 2) {
            card.classList.add("right-2");
          } else if (offset === cards.length - 1) {
            card.classList.add("left-1");
          } else if (offset === cards.length - 2) {
            card.classList.add("left-2");
          } else {
            card.classList.add("hidden");
          }
        });

        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === currentIndex);
        });

        setTimeout(() => {
          isAnimating = false;
        }, 800);
      }

      // Flip behavior: only flip active (center) card on click; unflip on mouseleave
      function flipActiveCard(indexToFlip) {
        cards.forEach((card, i) => {
          if (i === indexToFlip) {
            card.classList.toggle('flipped');
          } else {
            card.classList.remove('flipped');
          }
        });
      }

      // Arrow events (like card.html)
      if (leftArrow) {
        leftArrow.addEventListener("click", () => {
          console.log('Left arrow clicked');
          updateCarousel(currentIndex - 1);
          // ensure flip reset on navigation
          cards.forEach((c) => c.classList.remove('flipped'));
        });
      }

      if (rightArrow) {
        rightArrow.addEventListener("click", () => {
          console.log('Right arrow clicked');
          updateCarousel(currentIndex + 1);
          cards.forEach((c) => c.classList.remove('flipped'));
        });
      }

      // Dot events (like card.html)
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          console.log('Dot clicked:', i);
          updateCarousel(i);
          cards.forEach((c) => c.classList.remove('flipped'));
        });
      });

      // Card click events (like card.html)
      cards.forEach((card, i) => {
        card.addEventListener("click", () => {
          console.log('Card clicked:', i);
          if (i === currentIndex) {
            flipActiveCard(i);
          } else {
            updateCarousel(i);
          }
        });

        // Flip back on mouse leave
        card.addEventListener('mouseleave', () => {
          card.classList.remove('flipped');
        });
      });

      // Keyboard events (like card.html)
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          updateCarousel(currentIndex - 1);
        } else if (e.key === "ArrowRight") {
          updateCarousel(currentIndex + 1);
        }
      });

      // Touch swipe (like card.html)
      let touchStartX = 0;
      let touchEndX = 0;

      container.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });

      container.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      });

      function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            updateCarousel(currentIndex + 1);
          } else {
            updateCarousel(currentIndex - 1);
          }
        }
      }

      // Initialize carousel (like card.html)
      updateCarousel(0);

      console.log('3D Services carousel initialized');
    };

    // Initialize 3D services showcase when DOM is ready
    initServices3D();

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


