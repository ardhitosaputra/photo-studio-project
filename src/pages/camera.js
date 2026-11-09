/**
 * Camera Capture Page
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, CAMERA_DEFAULTS } from '../utils/constants.js';
import { playCountdownBeep, playShutterSound, playSuccessSound, isAudioMuted, toggleAudioMute } from '../utils/audio.js';

let stream = null;
let currentFacingMode = CAMERA_DEFAULTS.facingMode;
let activeCountdownSeconds = CAMERA_DEFAULTS.countdown;

export function createCameraPage(data = {}) {
  const mode = data.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode] || CAPTURE_CONFIG[CAPTURE_MODE.SINGLE];
  const totalShots = config.shots;
  
  const capturedPhotos = [];
  let isCapturing = false;

  const page = document.createElement('div');
  page.className = 'camera-page';

  page.innerHTML = `
    <!-- Header -->
    <div class="camera-header">
      <button class="btn btn-ghost" id="btn-back">
        ${icon('arrowLeft', 20)}
        <span>Back</span>
      </button>
      <div class="badge">${config.icon} ${config.label}</div>
      <div class="camera-header-actions">
        <button class="control-btn" id="btn-mute" title="Toggle Sound">
          ${icon(isAudioMuted() ? 'volumeX' : 'volume2', 20)}
        </button>
        <button class="control-btn" id="btn-flip" title="Flip Camera">
          ${icon('flipCamera', 20)}
        </button>
      </div>
    </div>

    <!-- Camera Viewport -->
    <div class="camera-viewport">
      <div class="camera-preview-wrapper" id="camera-wrapper">
        <video id="camera-video" autoplay playsinline muted></video>
        <canvas id="camera-canvas"></canvas>
        
        <!-- Guide corners -->
        <div class="camera-guide">
          <div class="camera-guide-corner tl"></div>
          <div class="camera-guide-corner tr"></div>
          <div class="camera-guide-corner bl"></div>
          <div class="camera-guide-corner br"></div>
        </div>

        <!-- Countdown -->
        <div class="countdown-overlay" id="countdown-overlay">
          <span class="countdown-number" id="countdown-number"></span>
        </div>

        <!-- Shutter flash -->
        <div class="shutter-flash" id="shutter-flash"></div>

        <!-- Shot counter for multi-shot -->
        ${totalShots > 1 ? `
          <div class="shot-counter" id="shot-counter">
            0 / ${totalShots}
          </div>
        ` : ''}

        <!-- Photo strip preview for multi-shot -->
        ${totalShots > 1 ? `
          <div class="photo-strip-preview" id="strip-preview">
            ${Array.from({ length: totalShots }, (_, i) => `
              <div class="photo-strip-thumb empty ${i === 0 ? 'current' : ''}" data-index="${i}">
                ${i + 1}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Permission fallback -->
      <div class="camera-permission" id="camera-permission" style="display:none;">
        ${icon('camera', 64)}
        <h3>Camera Access Required</h3>
        <p>Please allow camera access to use the photobooth. You can also upload a photo instead.</p>
        <button class="btn btn-primary" id="btn-retry-camera">Allow Camera</button>
        <button class="btn btn-secondary" id="btn-upload-photo" style="margin-top: 8px;">
          ${icon('upload', 18)} Upload Photo
        </button>
      </div>
      <input type="file" id="file-upload-input" accept="image/*" multiple style="display:none;" />
    </div>

    <!-- Controls -->
    <div class="camera-controls" id="camera-controls">
      <button class="control-btn" id="btn-timer" title="Toggle Timer (${activeCountdownSeconds}s)">
        ${icon('timer', 20)}
      </button>
      <button class="capture-btn ripple" id="btn-capture" title="Capture">
      </button>
      <button class="control-btn" id="btn-gallery" title="Upload Photos">
        ${icon('image', 20)}
      </button>
    </div>
  `;

  // Setup interactions
  requestAnimationFrame(() => {
    const video = page.querySelector('#camera-video');
    const canvas = page.querySelector('#camera-canvas');
    const wrapper = page.querySelector('#camera-wrapper');
    const permissionView = page.querySelector('#camera-permission');
    const controls = page.querySelector('#camera-controls');
    const flash = page.querySelector('#shutter-flash');
    const countdownOverlay = page.querySelector('#countdown-overlay');
    const countdownNumber = page.querySelector('#countdown-number');
    const fileInput = page.querySelector('#file-upload-input');
    const timerBtn = page.querySelector('#btn-timer');

    // Start camera
    startCamera(video, wrapper, permissionView, controls);

    // Back button
    const cleanupAndGo = (path, params) => {
      window.removeEventListener('keydown', handleKeyDown);
      stopCamera();
      router.navigate(path, params);
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
        e.preventDefault();
        page.querySelector('#btn-capture')?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    page.querySelector('#btn-back').addEventListener('click', () => {
      cleanupAndGo('home');
    });

    // Mute toggle
    const muteBtn = page.querySelector('#btn-mute');
    muteBtn?.addEventListener('click', () => {
      const muted = toggleAudioMute();
      muteBtn.innerHTML = icon(muted ? 'volumeX' : 'volume2', 20);
      showToast(muted ? 'Sound Muted' : 'Sound Enabled', 'info', 1500);
    });

    // Flip camera
    page.querySelector('#btn-flip').addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';
      startCamera(video, wrapper, permissionView, controls);
    });

    // Timer button toggle (3s -> 5s -> 0s -> 3s)
    timerBtn.addEventListener('click', () => {
      if (activeCountdownSeconds === 3) {
        activeCountdownSeconds = 5;
      } else if (activeCountdownSeconds === 5) {
        activeCountdownSeconds = 0;
      } else {
        activeCountdownSeconds = 3;
      }
      timerBtn.title = `Toggle Timer (${activeCountdownSeconds}s)`;
      showToast(`Timer set to: ${activeCountdownSeconds ? activeCountdownSeconds + ' seconds' : 'Instant (No timer)'}`, 'info', 2000);
    });

    // Retry camera
    page.querySelector('#btn-retry-camera').addEventListener('click', () => {
      startCamera(video, wrapper, permissionView, controls);
    });

    // Upload photo button(s)
    const setupUpload = (btnId) => {
      const btn = page.querySelector(btnId);
      if (btn) {
        btn.addEventListener('click', () => fileInput.click());
      }
    };
    setupUpload('#btn-upload-photo');
    setupUpload('#btn-gallery');

    // File upload handler (supports multiple files for strip/grid)
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      for (const file of files) {
        if (capturedPhotos.length >= totalShots) break;

        const dataUrl = await readFileAsDataURL(file);
        capturedPhotos.push(dataUrl);
        updateStripPreview(page, capturedPhotos, totalShots);
      }

      fileInput.value = '';

      if (capturedPhotos.length >= totalShots) {
        playSuccessSound();
        showToast('All photos uploaded successfully!', 'success');
        setTimeout(() => {
          cleanupAndGo('editor', { photos: capturedPhotos, mode });
        }, 500);
      } else {
        showToast(`Uploaded ${capturedPhotos.length}/${totalShots} photos — ${totalShots - capturedPhotos.length} remaining`, 'info');
      }
    });

    // Capture button
    page.querySelector('#btn-capture').addEventListener('click', async () => {
      if (isCapturing) return;
      isCapturing = true;
      
      // Countdown if timer > 0
      if (activeCountdownSeconds > 0) {
        await runCountdown(countdownOverlay, countdownNumber, activeCountdownSeconds);
      }
      
      // Shutter sound & flash
      playShutterSound();
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 300);
      
      // Capture frame from video or fallback canvas
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 960;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Mirror if front camera
      if (currentFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/png');
      capturedPhotos.push(dataUrl);
      
      // Update strip preview
      updateStripPreview(page, capturedPhotos, totalShots);
      
      if (capturedPhotos.length >= totalShots) {
        // All shots taken
        playSuccessSound();
        showToast('All photos captured!', 'success');
        setTimeout(() => {
          cleanupAndGo('editor', { photos: capturedPhotos, mode });
        }, 600);
      } else {
        showToast(`Photo ${capturedPhotos.length}/${totalShots} captured! Next shot ready.`, 'info', 1800);
      }
      
      isCapturing = false;
    });
  });

  return page;
}

/**
 * Start camera stream
 */
async function startCamera(video, wrapper, permissionView, controls) {
  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: CAMERA_DEFAULTS.width },
        height: { ideal: CAMERA_DEFAULTS.height },
      },
      audio: false,
    });
    
    video.srcObject = stream;
    video.style.display = 'block';
    permissionView.style.display = 'none';
    controls.style.display = '';
    
  } catch (err) {
    console.warn('Camera access denied or unavailable:', err);
    video.style.display = 'none';
    permissionView.style.display = 'flex';
    showToast('Camera access unavailable. You can upload a photo instead.', 'warning', 4000);
  }
}

/**
 * Stop camera stream
 */
export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

/**
 * Run countdown animation with audio feedback
 */
function runCountdown(overlay, numberEl, seconds = 3) {
  return new Promise((resolve) => {
    let count = seconds;
    overlay.classList.add('active');
    
    function tick() {
      if (count <= 0) {
        overlay.classList.remove('active');
        resolve();
        return;
      }
      
      // Play audio beep
      playCountdownBeep(count === 1 ? 1200 : 880);

      numberEl.textContent = count;
      numberEl.style.animation = 'none';
      // Force reflow
      void numberEl.offsetHeight;
      numberEl.style.animation = 'countdownPulse 1s var(--ease-out) both';
      
      count--;
      setTimeout(tick, 1000);
    }
    
    tick();
  });
}

/**
 * Update strip preview thumbnails
 */
function updateStripPreview(page, photos, total) {
  const thumbs = page.querySelectorAll('.photo-strip-thumb');
  if (!thumbs.length) return;
  
  thumbs.forEach((thumb, i) => {
    thumb.classList.remove('current', 'empty');
    
    if (i < photos.length) {
      thumb.innerHTML = `<img src="${photos[i]}" alt="Shot ${i + 1}" />`;
    } else if (i === photos.length) {
      thumb.classList.add('current', 'empty');
      thumb.textContent = i + 1;
    } else {
      thumb.classList.add('empty');
      thumb.textContent = i + 1;
    }
  });
  
  const counter = page.querySelector('#shot-counter');
  if (counter) {
    counter.textContent = `${photos.length} / ${total}`;
  }
}

/**
 * Helper to read File as DataURL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}
