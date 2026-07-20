/* ============================================
   BioViL — Main JavaScript
   ============================================ */

// --- Footer year (markup carries the current year as fallback) ---
document.querySelectorAll('.js-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

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

// --- Lazy-load background images (data-bg="url(...)") ---
const bgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const url = entry.target.dataset.bg;
      if (url) {
        entry.target.style.backgroundImage = url;
        bgObserver.unobserve(entry.target);
      }
    }
  });
}, { rootMargin: '300px' });

document.querySelectorAll('[data-bg]').forEach(el => bgObserver.observe(el));

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
  let hScrollActive = false;

  window.addEventListener('scroll', () => {
    const rect = hTrack.getBoundingClientRect();
    const trackTop = rect.top;

    const distance = rect.height - window.innerHeight;
    let p = -trackTop / distance;
    targetProgress = Math.max(0, Math.min(1, p));

    // (Re)start the render loop only when there is work to do;
    // it parks itself once the eased position settles.
    if (!hScrollActive) {
      hScrollActive = true;
      requestAnimationFrame(renderHScroll);
    }
  }, { passive: true });

  function renderHScroll() {
    const delta = targetProgress - currentProgress;
    if (Math.abs(delta) > 0.0005) {
      currentProgress += delta * 0.08;

      hContent.style.transform = `translateX(-${currentProgress * 75}vw)`;
      document.body.style.setProperty('--scroll-p', currentProgress);

      hPanels.forEach((panel, i) => {
        const centerProgress = i * (1 / (hPanels.length - 1 || 1));
        let localOffset = currentProgress - centerProgress;
        localOffset = Math.max(-1, Math.min(1, localOffset));
        panel.style.setProperty('--local-offset', localOffset);
        if (Math.abs(localOffset) < 0.4) {
          panel.classList.add('in-view');
        } else {
          panel.classList.remove('in-view');
        }
      });
      requestAnimationFrame(renderHScroll);
    } else {
      hScrollActive = false;
    }
  }
  requestAnimationFrame(renderHScroll);
  hScrollActive = true;
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

    // Encode form data for Netlify (application/x-www-form-urlencoded)
    const formData = new FormData(contactForm);
    const encoded = new URLSearchParams(formData).toString();

    fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded
    })
    .then(response => {
        if (response.ok) {
            contactForm.style.display = 'none';
            const success = document.querySelector('.form-success');
            if (success) {
                success.style.display = 'block';
                success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch((err) => {
        console.error('Contact form submission failed:', err);
        alert('Sorry — we could not send your message right now. Please email us directly at contact@biovil.co.in and we will get back to you within 48 hours.');
        let countdown = 5;
        submitBtn.innerHTML = `Try again in ${countdown}s`;
        const timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(timer);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            } else {
                submitBtn.innerHTML = `Try again in ${countdown}s`;
            }
        }, 1000);
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

/* ============================================
   CHATBOT LOGIC (Demo)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (!chatbotToggle || !chatbotWindow) return;

  const MAX_MESSAGES = 50;
  let messageCount = 1; // initial bot greeting counts as 1

  // Toggle Chat Window
  chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.add('open');
    chatbotToggle.setAttribute('aria-expanded', 'true');
    chatbotToggle.style.transform = 'scale(0)';
    setTimeout(() => chatbotInput.focus(), 300);
  });

  // Close Chat Window
  chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('open');
    chatbotToggle.setAttribute('aria-expanded', 'false');
    chatbotToggle.style.transform = 'scale(1)';
  });

  // Handle Form Submission
  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (!message) return;

    if (messageCount >= MAX_MESSAGES) {
      appendMessage('Chat limit reached. Please reload the page to start a new conversation.', 'bot-message');
      chatbotInput.disabled = true;
      chatbotForm.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    appendMessage(message, 'user-message');
    chatbotInput.value = '';

    // Lock input while "typing" so rapid submits can't stack indicators
    chatbotInput.disabled = true;
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const response = getBotResponse(message);
      appendMessage(response, 'bot-message');
      chatbotInput.disabled = false;
      chatbotInput.focus();
    }, 1500 + Math.random() * 1000);
  });

  function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${className}`;
    msgDiv.textContent = text;
    chatbotMessages.appendChild(msgDiv);
    messageCount++;
    scrollToBottom();
  }

  let typingIndicatorEl = null;

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages.appendChild(indicator);
    typingIndicatorEl = indicator;
    scrollToBottom();
  }

  function removeTypingIndicator() {
    if (typingIndicatorEl) {
      typingIndicatorEl.remove();
      typingIndicatorEl = null;
    }
  }

  function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Simple Keyword Matching for Demo Responses
  function getBotResponse(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('pay') || lowerInput.includes('euro')) {
      return "BioViL operates on a subsidized cooperative model. We received €3,000 in fellowship funding to build our first prototype. For farmers, the system is highly affordable as it pays for itself via energy savings and fertilizer generation within months. Interested in partnering or investing? Email us directly at contact@biovil.co.in.";
    }
    
    if (lowerInput.includes('biogas') || lowerInput.includes('how it works') || lowerInput.includes('technology')) {
      return "Our biodigesters use a process called anaerobic digestion. Microbes break down farm waste and animal dung in an oxygen-free environment, releasing methane gas which is piped directly to homes for clean, smoke-free cooking. It's safe, simple, and extremely reliable!";
    }

    if (lowerInput.includes('impact') || lowerInput.includes('health') || lowerInput.includes('smoke')) {
      return "Our primary impact is health and environment. By replacing firewood with biogas, we eliminate toxic indoor smoke that primarily harms women and children. We also stop deforestation and convert rotting waste into rich organic fertilizer (digestate) for the soil.";
    }
    
    if (lowerInput.includes('where') || lowerInput.includes('location') || lowerInput.includes('assam')) {
      return "We are currently implementing our first prototype in rural Assam, India, with plans to expand to 10 target villages by 2030.";
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput.includes('hey')) {
      return "Hello there! How can I assist you with BioViL today? You can ask about our biogas tech, our costs, or our mission in Assam.";
    }

    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('call')) {
      return "You can reach out to us at contact@biovil.co.in or visit our Contact Us page to fill out a partnership form.";
    }

    // Default Fallback
    return "That's a great question! I don't have all the specific details yet. I'd recommend checking out our 'Resource' or 'About Us' pages, or emailing contact@biovil.co.in for more info.";
  }
});
