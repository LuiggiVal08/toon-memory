// toon-memory Animations

// Scroll reveal animation
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  function update() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  update();
}

// Initialize counters when they come into view
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// Particle effect for hero
function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particlesContainer.appendChild(particle);
  }
  
  hero.appendChild(particlesContainer);
}

// Typing effect for terminal
function initTypingEffect() {
  const typingElements = document.querySelectorAll('.typing-effect');
  
  typingElements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    element.style.width = 'auto';
    
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, 50);
      }
    }
    
    // Start typing when element is in view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        type();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    
    observer.observe(element);
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Card tilt effect
function initCardTilt() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initParticles();
  initTypingEffect();
  initSmoothScroll();
  initCardTilt();
});
