/**
 * Editor Transition & Preview Page (Phase 1 Stub)
 * Displays captured photos, mode details, and allows retake or next steps
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { CAPTURE_MODE, CAPTURE_CONFIG } from '../utils/constants.js';

export function createEditorPage(data = {}) {
  const routerData = router.getData();
  const photos = data.photos || routerData.photos || [];
  const mode = data.mode || routerData.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode] || CAPTURE_CONFIG[CAPTURE_MODE.SINGLE];

  const page = document.createElement('div');
  page.className = 'editor-page';

  if (!photos.length) {
    page.innerHTML = `
      <div class="editor-header">
        <button class="btn btn-ghost" id="btn-back">
          ${icon('arrowLeft', 20)}
          <span>Back</span>
        </button>
        <span class="editor-title">Photo Studio Editor</span>
        <div></div>
      </div>
      <div class="editor-canvas-area" style="flex-direction: column; gap: var(--space-4); text-align: center;">
        <div style="font-size: 48px;">📷</div>
        <h3 style="font-family: var(--font-display); font-size: var(--text-xl);">No Photos Captured Yet</h3>
        <p style="color: var(--text-secondary); max-width: 380px;">
          Please capture or upload photos from the camera screen first.
        </p>
        <button class="btn btn-primary" id="btn-go-camera" style="margin-top: var(--space-4);">
          ${icon('camera', 18)} Go to Camera
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      page.querySelector('#btn-back')?.addEventListener('click', () => router.navigate('home'));
      page.querySelector('#btn-go-camera')?.addEventListener('click', () => router.navigate('camera', { mode }));
    });

    return page;
  }

  page.innerHTML = `
    <!-- Editor Header -->
    <div class="editor-header">
      <button class="btn btn-ghost" id="btn-back">
        ${icon('arrowLeft', 20)}
        <span>Retake</span>
      </button>
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span class="editor-title">Phase 1 Preview</span>
        <span class="badge">${config.icon} ${config.label} (${photos.length} Shot)</span>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-done">
        ${icon('check', 18)}
        <span>Done</span>
      </button>
    </div>

    <!-- Preview Canvas Area -->
    <div class="editor-canvas-area" style="flex-direction: column; overflow-y: auto; padding: var(--space-6);">
      <div class="glass-card" style="padding: var(--space-6); max-width: 640px; width: 100%; display: flex; flex-direction: column; gap: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-family: var(--font-display); font-size: var(--text-base);">Captured Photo Gallery</h4>
          <span style="font-size: var(--text-xs); color: var(--text-muted);">${photos.length} photo(s) captured</span>
        </div>

        <div style="display: grid; grid-template-columns: ${photos.length > 1 ? 'repeat(2, 1fr)' : '1fr'}; gap: var(--space-3);">
          ${photos.map((src, index) => `
            <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 4/3; background: var(--bg-surface); border: 1px solid var(--glass-border);">
              <img src="${src}" alt="Captured shot ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;" />
              <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 2px 8px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 500;">
                Shot #${index + 1}
              </span>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-2); flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="btn-download-all">
            ${icon('download', 16)} Download Photo
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-retake">
            ${icon('undo', 16)} Retake Shots
          </button>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    // Back / Retake
    const retakeHandler = () => router.navigate('camera', { mode });
    page.querySelector('#btn-back')?.addEventListener('click', retakeHandler);
    page.querySelector('#btn-retake')?.addEventListener('click', retakeHandler);

    // Download photo
    page.querySelector('#btn-download-all')?.addEventListener('click', () => {
      photos.forEach((src, idx) => {
        const link = document.createElement('a');
        link.download = `photobooth-shot-${Date.now()}-${idx + 1}.png`;
        link.href = src;
        link.click();
      });
      showToast('Photo downloaded!', 'success');
    });

    // Done button
    page.querySelector('#btn-done')?.addEventListener('click', () => {
      showToast('Phase 1 completed! Ready for Phase 2 (Filters, Stickers & Frames).', 'success', 3500);
    });
  });

  return page;
}
