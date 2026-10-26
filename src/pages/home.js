/**
 * Home / Landing Page
 */

import { router } from '../router.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, APP_NAME, APP_TAGLINE } from '../utils/constants.js';
import { icon } from '../utils/icons.js';

export function createHomePage() {
  const page = document.createElement('div');
  page.className = 'home-page';
  
  // Selected capture mode
  let selectedMode = CAPTURE_MODE.SINGLE;

  page.innerHTML = `
    <!-- Background Effects -->
    <div class="home-bg">
      <div class="home-grid-pattern"></div>
    </div>
    <div class="home-particles" id="home-particles"></div>

    <!-- Content -->
    <div class="home-content">
      <div class="home-badge">
        <span class="badge">${icon('sparkles', 14)} Premium Photobooth</span>
      </div>

      <h1 class="home-title">
        <span class="gradient-text">${APP_NAME}</span>
      </h1>

      <p class="home-subtitle">
        ${APP_TAGLINE}<br/>
        Transform your moments with filters, stickers, and frames — all in your browser.
      </p>

      <div class="mode-selector" id="mode-selector">
        ${Object.entries(CAPTURE_CONFIG).map(([mode, config]) => `
          <div class="mode-option ${mode === selectedMode ? 'active' : ''}" data-mode="${mode}">
            <div class="mode-icon">${config.icon}</div>
            <div class="mode-text">
              <div class="mode-label">${config.label}</div>
              <div class="mode-desc">${config.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="home-cta">
        <button class="btn btn-primary btn-start ripple" id="btn-start">
          Start Capturing
          ${icon('arrowRight', 20)}
        </button>
      </div>
    </div>

    <div class="home-footer">
      Built with ✦ by Photo Studio
    </div>
  `;

  // Setup interactions
  requestAnimationFrame(() => {
    // Mode selector
    const modeSelector = page.querySelector('#mode-selector');
    modeSelector.addEventListener('click', (e) => {
      const option = e.target.closest('.mode-option');
      if (!option) return;
      
      selectedMode = option.dataset.mode;
      page.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });

    // Start button
    const startBtn = page.querySelector('#btn-start');
    startBtn.addEventListener('click', () => {
      router.navigate('camera', { mode: selectedMode });
    });

    // Generate particles
    createParticles(page.querySelector('#home-particles'));
  });

  return page;
}

/**
 * Create floating particles in the background
 */
function createParticles(container) {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dx = (Math.random() - 0.5) * 200;
    const dy = -(Math.random() * 300 + 100);
    const duration = 5 + Math.random() * 10;
    const delay = Math.random() * 10;
    const size = 2 + Math.random() * 4;
    
    particle.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --dx: ${dx}px;
      --dy: ${dy}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      background: ${Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent-secondary)'};
    `;
    
    container.appendChild(particle);
  }
}
