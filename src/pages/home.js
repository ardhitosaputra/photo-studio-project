/**
 * Home / Landing Page (Monochrome Edition)
 */

import { router } from '../router.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, APP_NAME, APP_TAGLINE } from '../utils/constants.js';
import { icon } from '../utils/icons.js';

export function createHomePage() {
  const page = document.createElement('div');
  page.className = 'home-page';
  
  // Selected capture mode (Default: Single Shot)
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
        <span class="badge">${icon('sparkles', 14)} Minimalist Photobooth</span>
      </div>

      <h1 class="home-title">
        <span class="gradient-text">${APP_NAME}</span>
      </h1>

      <p class="home-subtitle">
        ${APP_TAGLINE}<br/>
        Choose your session shots below. Layout and frame are styled at the end.
      </p>

      <!-- Shoot Mode Selector (1, 2, or 4 Shots) -->
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
      Built with ✦ by Photo Studio Noir
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

    // Generate monochrome floating particles
    createParticles(page.querySelector('#home-particles'));
  });

  return page;
}

/**
 * Create floating monochrome particles in the background
 */
function createParticles(container) {
  if (!container) return;
  const count = 24;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dx = (Math.random() - 0.5) * 160;
    const dy = -(Math.random() * 260 + 80);
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 6;
    const size = 1.5 + Math.random() * 3;
    
    particle.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --dx: ${dx}px;
      --dy: ${dy}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      background: ${Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(200, 200, 200, 0.4)'};
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    `;
    
    container.appendChild(particle);
  }
}
