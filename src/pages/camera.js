/**
 * Camera Capture Page
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, CAMERA_DEFAULTS } from '../utils/constants.js';

let stream = null;
let currentFacingMode = CAMERA_DEFAULTS.facingMode;

export function createCameraPage(data = {}) {
  const mode = data.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode];
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
        <input type="file" id="file-upload-input" accept="image/*" style="display:none;" />
      </div>
    </div>

    <!-- Controls -->
    <div class="camera-controls" id="camera-controls">
      <button class="control-btn" id="btn-timer" title="Timer">
        ${icon('timer', 20)}
      </button>
      <button class="capture-btn ripple" id="btn-capture" title="Capture">
      </button>
      <button class="control-btn" id="btn-gallery" title="Upload Photo">
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

    // Start camera
    startCamera(video, wrapper, permissionView, controls);

    // Back button
    page.querySelector('#btn-back').addEventListener('click', () => {
      stopCamera();
      router.navigate('home');
    });

    // Flip camera
    page.querySelector('#btn-flip').addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      startCamera(video, wrapper, permissionView, controls);
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

    // File upload handler
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/png');
          capturedPhotos.push(dataUrl);
          
          if (capturedPhotos.length >= totalShots) {
            stopCamera();
            router.navigate('editor', { photos: capturedPhotos, mode });
          } else {
            updateStripPreview(page, capturedPhotos, totalShots);
            showToast(`Photo ${capturedPhotos.length}/${totalShots} captured!`, 'success');
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });

    // Capture button
    page.querySelector('#btn-capture').addEventListener('click', async () => {
      if (isCapturing) return;
      isCapturing = true;
      
      // Countdown
      await runCountdown(countdownOverlay, countdownNumber);
      
      // Flash
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 300);
      
      // Capture frame
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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
        showToast('All photos captured!', 'success');
        setTimeout(() => {
          stopCamera();
          router.navigate('editor', { photos: capturedPhotos, mode });
        }, 500);
      } else {
        showToast(`Photo ${capturedPhotos.length}/${totalShots} — ${totalShots - capturedPhotos.length} more`, 'info');
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
    // Stop existing stream
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
    console.warn('Camera access denied:', err);
    video.style.display = 'none';
    permissionView.style.display = 'flex';
    showToast('Camera access denied. You can upload a photo instead.', 'warning');
  }
}

/**
 * Stop camera stream
 */
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

/**
 * Run countdown animation
 */
function runCountdown(overlay, numberEl) {
  return new Promise((resolve) => {
    let count = CAMERA_DEFAULTS.countdown;
    overlay.classList.add('active');
    
    function tick() {
      if (count <= 0) {
        overlay.classList.remove('active');
        resolve();
        return;
      }
      
      numberEl.textContent = count;
      numberEl.style.animation = 'none';
      // Force reflow
      numberEl.offsetHeight;
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
