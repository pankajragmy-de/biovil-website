/* ============================================
   BioViL — Main JavaScript
   ============================================ */

// --- Navbar scroll behavior ---
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// --- Mobile menu ---
const burger = document.querySelector('.nav-burger');
const mobileMenu = document.querySelector('.nav-mobile');
const mobileClose = document.querySelector('.nav-mobile-close');

function toggleMobileMenu(forceClose = false) {
  if (!mobileMenu) return;
  const isOpening = !forceClose && !mobileMenu.classList.contains('open');
  
  if (isOpening) {
    mobileMenu.classList.add('open');
    if (burger) burger.classList.add('open');
    if (navbar) navbar.classList.add('menu-open');
  } else {
    mobileMenu.classList.remove('open');
    if (burger) burger.classList.remove('open');
    if (navbar) navbar.classList.remove('menu-open');
  }
}

if (burger) {
  burger.addEventListener('click', () => toggleMobileMenu());
}
if (mobileClose) {
  mobileClose.addEventListener('click', () => toggleMobileMenu(true));
}

// Close mobile menu on link click (only for actual anchor tags)
document.querySelectorAll('.nav-mobile a.nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMobileMenu(true));
});

// Mobile dropdown toggle
const mobileDropdownToggle = document.querySelector('.nav-mobile-dropdown > span');
const mobileDropdown = document.querySelector('.nav-mobile-dropdown');
if (mobileDropdownToggle && mobileDropdown) {
  mobileDropdownToggle.addEventListener('click', (e) => {
    e.preventDefault();
    mobileDropdown.classList.toggle('open');
  });
}

// --- Active nav link ---
(function setActiveLink() {
  const path = window.location.pathname.replace(/\//g, '');
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const hrefClean = href.replace(/\//g, '').replace('.html', '');
    const pageClean = path.replace('.html', '');
    if ((pageClean === '' && hrefClean === '') || (pageClean !== '' && hrefClean === pageClean)) {
      link.classList.add('active');
    }
  });
})();

// --- Scroll reveal animations ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => {
  revealObserver.observe(el);
});

// --- Animated stat counters ---
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

// Wire counter animation to stat numbers
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.dataset.target) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item__number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

// --- Word-Tint Scroll Reveal (Collectif Parcelles technique) ---
// Watches the vision text container and lights up each word as the section enters view
const visionEl = document.getElementById('vision-text');
if (visionEl) {
  const wordSpans = visionEl.querySelectorAll('.word-tint');
  
  const wordObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger each word's activation
        wordSpans.forEach((span, i) => {
          setTimeout(() => span.classList.add('lit'), i * 80);
        });
        wordObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  
  wordObserver.observe(visionEl);
}

// --- Sticky Scroll Animation (Home) ---
const processTrack = document.getElementById("process-track");
if (processTrack && typeof gsap !== 'undefined') {
  const processCards = processTrack.querySelectorAll(".process-card");
  if (processCards.length > 0) {
  const tl = gsap.timeline({ repeat: -1 });
  const segmentTime = 1.8;
  const duration = segmentTime * processCards.length;

  // Progress bar animation
  const progressBar = processTrack.querySelector(".progress-bar");
  if (progressBar && window.innerWidth > 900) {
    tl.to(progressBar, {
      width: "100%",
      ease: "none",
      duration: duration - segmentTime + 0.5
    }, 0);
  } else {
    tl.to({}, { duration: duration }); // Dummy wait if no bar
  }

  let hoveredCard = null;

  // Track hover state for each card
  processCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      hoveredCard = card;
      if (card.classList.contains("is-active")) {
        tl.pause();
      }
    });

    card.addEventListener("mousemove", () => {
      // Robustness: ensure hoveredCard is set if mouse is moving over it
      if (hoveredCard !== card) {
        hoveredCard = card;
        if (card.classList.contains("is-active")) tl.pause();
      }
    });

    card.addEventListener("mouseleave", () => {
      if (hoveredCard === card) {
        hoveredCard = null;
        tl.play();
      }
    });
  });

  // Sequentially highlight cards
  processCards.forEach((card, i) => {
    const startTime = i * segmentTime;
    tl.call(() => {
      processCards.forEach(c => c.classList.remove("is-active"));
      card.classList.add("is-active");

      // Pause if the card that just became active is currently being hovered
      if (hoveredCard === card) {
        tl.pause();
      }
    }, null, startTime);
  });

  // Reset at end
  tl.to({}, { duration: segmentTime }); // hold last card
  tl.call(() => processCards[processCards.length - 1].classList.remove("is-active"), null, duration);
  if (window.innerWidth > 900) tl.set(".progress-bar", { width: "0%" });
  }
}



// --- Horizontal Scroll (Resource) ---
const hTrack = document.getElementById('h-scroll-track');
const hContent = document.getElementById('h-scroll-content');
const hPanels = document.querySelectorAll('.h-panel');

if (hTrack && hContent) {
  let targetProgress = 0;
  let currentProgress = 0;
  
  window.addEventListener('scroll', () => {
    const rect = hTrack.getBoundingClientRect();
    const trackTop = rect.top;
    
    const distance = rect.height - window.innerHeight;
    let p = -trackTop / distance;
    targetProgress = Math.max(0, Math.min(1, p));
  });

  function renderHScroll() {
    currentProgress += (targetProgress - currentProgress) * 0.08;
    
    // Always apply transform to keep it butter smooth
    hContent.style.transform = `translateX(-${currentProgress * 75}vw)`;
    document.body.style.setProperty('--scroll-p', currentProgress);

    // Calculate per-panel progress (-1 to 1 relative to center screen)
    hPanels.forEach((panel, i) => {
      // Each panel represents 0.25 of the total progress (4 panels)
      // Panel 0 is centered at progress 0, Panel 1 at 0.333, Panel 2 at 0.666, Panel 3 at 1.0
      const centerProgress = i * (1 / (hPanels.length - 1 || 1));
      let localOffset = currentProgress - centerProgress; 
      
      // Clamp between -1 and 1
      localOffset = Math.max(-1, Math.min(1, localOffset));
      
      // Pass to CSS for per-panel parallax, opacity, blur, etc.
      panel.style.setProperty('--local-offset', localOffset);
      
      // Optional: add an 'in-view' class when it's close to center
      if (Math.abs(localOffset) < 0.4) {
        panel.classList.add('in-view');
      } else {
        panel.classList.remove('in-view');
      }
    });
    
    requestAnimationFrame(renderHScroll);
  }
  requestAnimationFrame(renderHScroll);
}

// --- Accordion ---
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
    // Open clicked (if it wasn't already open)
    if (!isOpen) item.classList.add('open');
  });
});

// --- Tabs (Resource page) ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) {
      panel.classList.add('active');
      // Force-reveal all .reveal items inside the newly shown panel
      // (they were hidden before and never observed by IntersectionObserver)
      panel.querySelectorAll('.reveal, .timeline-item').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 60);
      });
    }
  });
});


// --- Contact form ---
const contactForm = document.getElementById('biovil-contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic validation check
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // UI Feedback: Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Use StaticForms for email handling
    fetch('https://api.staticforms.xyz/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            contactForm.style.display = 'none';
            const success = document.querySelector('.form-success');
            if (success) {
                success.style.display = 'block';
                success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            alert('Error: ' + (result.message || 'Oops! There was a problem submitting your form. Please try again.'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    })
    .catch(error => {
        alert('Oops! There was a problem submitting your form. Please check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
  });
}

// --- Audience pathway cards scroll to form ---
document.querySelectorAll('[data-scroll-to]').forEach(el => {
  el.addEventListener('click', () => {
    const target = document.querySelector(el.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
