/**
 * Export & Share Page
 * Features:
 * - Unified Photocard Layout Canvas Engine (Strip, Grid 2x2, Single)
 * - Customizer: Card theme colors & memo/caption text
 * - High-Res Unified Photocard PNG Download & Individual Shots Download
 * - Print-Ready Output with CSS @media print
 * - Social Media Sharing (Web Share API, Clipboard Copy, WhatsApp, Twitter, Facebook)
 * - Explicit Google Drive Cloud Sync: Sign-in status, profile display, direct upload, and account disconnection
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { showModal, closeModal } from '../components/modal.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, LAYOUTS } from '../utils/constants.js';
import { renderPhotocard, CARD_THEMES } from '../utils/photocard.js';
import {
  signInGoogleDrive,
  signOutGoogleDrive,
  isGoogleDriveConnected,
  getGoogleDriveUser,
  uploadFileToGoogleDrive,
  getStoredClientId,
  setStoredClientId,
  isGisLoaded,
} from '../utils/drive.js';

export function createExportPage(data = {}) {
  const routerData = router.getData();
  const finalPhotos = data.finalPhotos || routerData.finalPhotos || [];
  const mode = data.mode || routerData.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode] || CAPTURE_CONFIG[CAPTURE_MODE.SINGLE];

  const page = document.createElement('div');
  page.className = 'export-page';

  if (!finalPhotos.length) {
    page.innerHTML = `
      <div class="export-header">
        <button class="btn btn-ghost" id="btn-back">
          ${icon('arrowLeft', 20)}
          <span>Editor</span>
        </button>
        <span class="export-title">Export & Share</span>
        <div></div>
      </div>
      <div class="export-content" style="justify-content: center; text-align: center;">
        <div style="font-size: 48px;">🖼️</div>
        <h3 style="font-family: var(--font-display); font-size: var(--text-xl);">No Final Photos Found</h3>
        <p style="color: var(--text-secondary); max-width: 360px;">
          Please capture and edit your photos in the studio editor first.
        </p>
        <button class="btn btn-primary" id="btn-go-home" style="margin-top: var(--space-4);">
          ${icon('camera', 18)} Start New Session
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      page.querySelector('#btn-back')?.addEventListener('click', () => router.navigate('editor'));
      page.querySelector('#btn-go-home')?.addEventListener('click', () => router.navigate('home'));
    });

    return page;
  }

  // --- State ---
  let selectedLayout = mode === CAPTURE_MODE.STRIP ? 'strip' : (mode === CAPTURE_MODE.GRID ? 'grid' : 'single');
  let selectedThemeId = 'white';
  let memoText = '';
  let currentPhotocard = null; // { canvas, dataUrl, blob }
  let isGenerating = false;

  page.innerHTML = `
    <!-- Header -->
    <div class="export-header no-print">
      <button class="btn btn-ghost" id="btn-back">
        ${icon('arrowLeft', 20)}
        <span>Editor</span>
      </button>
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span class="export-title">Export & Share</span>
        <span class="badge">${config.icon} ${config.label}</span>
      </div>
      <button class="btn btn-ghost" id="btn-new">
        <span>New Photo</span>
      </button>
    </div>

    <!-- Content -->
    <div class="export-content">
      <!-- Photocard Preview Container (Print Target) -->
      <div class="export-preview print-content" id="export-preview-card" style="display: flex; justify-content: center; background: transparent; box-shadow: none; border: none;">
        <div id="preview-loading" class="skeleton" style="width: 320px; height: 500px; border-radius: var(--radius-xl);"></div>
        <img id="photocard-preview-img" alt="Generated Photocard" style="display: none; max-width: 100%; max-height: 68vh; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); object-fit: contain;" />
      </div>

      <!-- Layout Selector (if multiple photos) -->
      ${finalPhotos.length > 1 ? `
        <div class="layout-section no-print">
          <h3>Photocard Layout</h3>
          <div class="layout-options" id="layout-options">
            ${LAYOUTS.map(l => `
              <div class="layout-option ${l.id === selectedLayout ? 'active' : ''}" data-layout="${l.id}">
                <div class="layout-icon">${l.icon}</div>
                <div class="layout-label">${l.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Customizer: Color Theme & Memo Caption -->
      <div class="card-customizer no-print">
        <div class="customizer-row">
          <span class="customizer-label">Card Color Theme</span>
          <div class="theme-swatches" id="theme-swatches">
            ${CARD_THEMES.map(t => `
              <div class="theme-swatch ${t.id === selectedThemeId ? 'active' : ''}" 
                   data-theme="${t.id}" 
                   title="${t.name}" 
                   style="background-color: ${t.bg}; ${t.id === 'white' ? 'border: 1px solid #d1d5db;' : ''}">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="customizer-row">
          <span class="customizer-label">Custom Caption / Memo (Optional)</span>
          <input type="text" class="memo-input" id="memo-input" placeholder="e.g. Best day with besties ✨" maxlength="45" value="${memoText}" />
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="export-actions no-print">
        <button class="export-action-btn" id="btn-download" title="Save Photocard PNG">
          <div class="export-action-icon download">${icon('download', 24)}</div>
          <div class="export-action-label">Download</div>
          <div class="export-action-desc">High-Res PNG</div>
        </button>

        <button class="export-action-btn" id="btn-print" title="Print physical photocard">
          <div class="export-action-icon print">${icon('printer', 24)}</div>
          <div class="export-action-label">Print</div>
          <div class="export-action-desc">Ready for printer</div>
        </button>

        <button class="export-action-btn" id="btn-share" title="Share to social media">
          <div class="export-action-icon share">${icon('share', 24)}</div>
          <div class="export-action-label">Share</div>
          <div class="export-action-desc">Socials & copy</div>
        </button>
      </div>

      <!-- Dedicated Google Drive Sync Card -->
      <div class="gdrive-sync-card no-print" id="gdrive-card">
        <!-- Rendered dynamically -->
      </div>

      <!-- Secondary Download: Individual Raw Photos -->
      ${finalPhotos.length > 1 ? `
        <button class="secondary-download-btn no-print" id="btn-download-individual">
          Download individual photos separately (${finalPhotos.length} photos)
        </button>
      ` : ''}
    </div>
  `;

  requestAnimationFrame(() => {
    const previewImg = page.querySelector('#photocard-preview-img');
    const loadingEl = page.querySelector('#preview-loading');
    const layoutContainer = page.querySelector('#layout-options');
    const swatchesContainer = page.querySelector('#theme-swatches');
    const memoInput = page.querySelector('#memo-input');

    // Generate initial photocard
    updatePhotocard();

    // Render Google Drive UI state
    renderGDriveUI();

    // Re-render photocard function
    async function updatePhotocard() {
      if (isGenerating) return;
      isGenerating = true;

      try {
        currentPhotocard = await renderPhotocard({
          photos: finalPhotos,
          layout: selectedLayout,
          themeId: selectedThemeId,
          memoText: memoText,
        });

        if (previewImg && loadingEl) {
          previewImg.src = currentPhotocard.dataUrl;
          previewImg.style.display = 'block';
          loadingEl.style.display = 'none';
        }
      } catch (err) {
        console.error('Failed to generate photocard:', err);
        showToast('Error generating photocard layout', 'error');
      } finally {
        isGenerating = false;
      }
    }

    // --- Back to Editor ---
    page.querySelector('#btn-back')?.addEventListener('click', () => {
      router.navigate('editor');
    });

    // --- Start New Session ---
    page.querySelector('#btn-new')?.addEventListener('click', () => {
      if (confirm('Start a new photobooth session?')) {
        router.navigate('home');
      }
    });

    // --- Layout Switcher ---
    if (layoutContainer) {
      layoutContainer.addEventListener('click', (e) => {
        const option = e.target.closest('.layout-option');
        if (!option) return;

        selectedLayout = option.dataset.layout;
        layoutContainer.querySelectorAll('.layout-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');

        updatePhotocard();
      });
    }

    // --- Color Theme Swatches ---
    if (swatchesContainer) {
      swatchesContainer.addEventListener('click', (e) => {
        const swatch = e.target.closest('.theme-swatch');
        if (!swatch) return;

        selectedThemeId = swatch.dataset.theme;
        swatchesContainer.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        updatePhotocard();
      });
    }

    // --- Memo Input (Debounced) ---
    let debounceTimer = null;
    memoInput?.addEventListener('input', (e) => {
      memoText = e.target.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        updatePhotocard();
      }, 350);
    });

    // --- Download Compiled Photocard ---
    page.querySelector('#btn-download')?.addEventListener('click', () => {
      if (!currentPhotocard?.dataUrl) {
        showToast('Photocard is still rendering...', 'warning');
        return;
      }

      const filename = `PhotoStudio_${selectedLayout}_${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = currentPhotocard.dataUrl;
      link.click();

      showToast('Photocard downloaded in high resolution!', 'success');
    });

    // --- Download Individual Photos ---
    page.querySelector('#btn-download-individual')?.addEventListener('click', () => {
      finalPhotos.forEach((src, idx) => {
        const link = document.createElement('a');
        link.download = `PhotoStudio_shot_${Date.now()}_${idx + 1}.png`;
        link.href = src;
        link.click();
      });
      showToast(`Downloaded ${finalPhotos.length} individual shots!`, 'success');
    });

    // --- Print Photocard ---
    page.querySelector('#btn-print')?.addEventListener('click', () => {
      window.print();
    });

    // --- Share Action (Web Share or Fallback Modal) ---
    page.querySelector('#btn-share')?.addEventListener('click', async () => {
      if (!currentPhotocard?.blob) {
        showToast('Photocard is not ready yet', 'warning');
        return;
      }

      const file = new File([currentPhotocard.blob], `PhotoStudio_${Date.now()}.png`, { type: 'image/png' });

      // Check Mobile Native Web Share API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Photo Studio Photocard',
            text: 'Look at my aesthetic photocard! Made with Photo Studio #PhotoStudio #Photobooth',
            files: [file],
          });
          showToast('Shared successfully!', 'success');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.debug('Web share cancelled or unsupported:', err);
          } else {
            return; // User dismissed share dialog
          }
        }
      }

      // Desktop / Fallback Share Modal
      openShareModal(currentPhotocard);
    });

    // --- Google Drive UI Renderer & Handlers ---
    function renderGDriveUI() {
      const container = page.querySelector('#gdrive-card');
      if (!container) return;

      const connected = isGoogleDriveConnected();
      const user = getGoogleDriveUser();

      if (!connected) {
        container.innerHTML = `
          <div class="gdrive-header">
            <div class="gdrive-title-group">
              <div class="gdrive-icon-badge">${icon('cloud', 20)}</div>
              <div>
                <div class="gdrive-card-title">Google Drive Backup</div>
                <div class="gdrive-status-text">
                  <span class="status-dot disconnected"></span> Belum Terhubung
                </div>
              </div>
            </div>
            <button class="btn-config-client" id="btn-config-client" title="Pengaturan Client ID Google">⚙️</button>
          </div>
          <p class="gdrive-card-desc">
            Hubungkan akun Google Drive untuk menyimpan photocard langsung ke penyimpanan cloud pribadi Anda.
          </p>
          <div class="gdrive-card-actions">
            <button class="btn btn-secondary w-full" id="btn-gdrive-connect">
              ${icon('cloud', 18)} Hubungkan Google Drive
            </button>
          </div>
        `;

        container.querySelector('#btn-gdrive-connect')?.addEventListener('click', handleConnectDrive);
      } else {
        const userName = user?.name || user?.email || 'Google User';
        const userEmail = user?.email || '';

        container.innerHTML = `
          <div class="gdrive-header">
            <div class="gdrive-title-group">
              <div class="gdrive-icon-badge connected">${icon('cloud', 20)}</div>
              <div>
                <div class="gdrive-card-title">Google Drive Backup</div>
                <div class="gdrive-status-text">
                  <span class="status-dot connected"></span> Terhubung: <strong>${userName}</strong>
                </div>
              </div>
            </div>
            <button class="btn-config-client" id="btn-config-client" title="Pengaturan Client ID Google">⚙️</button>
          </div>
          ${userEmail ? `<div class="gdrive-email-subtext">${userEmail}</div>` : ''}
          <div class="gdrive-card-actions connected">
            <button class="btn btn-primary" id="btn-gdrive-upload" style="flex: 1;">
              ${icon('upload', 18)} <span id="gdrive-upload-text">Simpan ke Google Drive</span>
            </button>
            <button class="btn btn-ghost btn-sm" id="btn-gdrive-disconnect" title="Putuskan Akun">
              ${icon('logOut', 16)} Putuskan
            </button>
          </div>
        `;

        container.querySelector('#btn-gdrive-upload')?.addEventListener('click', handleUploadDrive);
        container.querySelector('#btn-gdrive-disconnect')?.addEventListener('click', handleDisconnectDrive);
      }

      container.querySelector('#btn-config-client')?.addEventListener('click', () => {
        promptClientIdModal((newId) => {
          setStoredClientId(newId);
          showToast('Client ID tersimpan. Klik hubungkan untuk masuk.', 'success');
        });
      });
    }

    async function handleConnectDrive() {
      let clientId = getStoredClientId();
      if (!clientId) {
        promptClientIdModal(async (newId) => {
          setStoredClientId(newId);
          await performConnect(newId);
        });
        return;
      }
      await performConnect(clientId);
    }

    async function performConnect(clientId) {
      const btn = page.querySelector('#btn-gdrive-connect');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width: 16px; height: 16px;"></div> Menghubungkan...`;
      }

      try {
        await signInGoogleDrive(clientId);
        showToast('Berhasil terhubung ke akun Google Drive!', 'success');
        renderGDriveUI();
      } catch (err) {
        console.error('Google Sign-in error:', err);
        showToast(`Gagal login: ${err.message || 'Error'}`, 'error', 4500);
        renderGDriveUI();
      }
    }

    async function handleUploadDrive() {
      if (!currentPhotocard?.blob) {
        showToast('Photocard belum siap', 'warning');
        return;
      }

      const uploadBtn = page.querySelector('#btn-gdrive-upload');
      const uploadText = page.querySelector('#gdrive-upload-text');
      if (uploadBtn) uploadBtn.disabled = true;
      if (uploadText) uploadText.textContent = 'Mengunggah...';

      try {
        const filename = `PhotoStudio_${selectedLayout}_${Date.now()}.png`;
        const result = await uploadFileToGoogleDrive({
          blob: currentPhotocard.blob,
          filename: filename,
        });

        showToast('Berhasil disimpan ke Google Drive!', 'success', 4000);

        // Show Success Modal with link
        const successBody = document.createElement('div');
        successBody.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-4); text-align: center;';
        successBody.innerHTML = `
          <div style="font-size: 48px;">☁️</div>
          <h4 style="font-family: var(--font-display); font-size: var(--text-lg);">Tersimpan di Google Drive!</h4>
          <p style="font-size: var(--text-sm); color: var(--text-secondary);">
            Photocard telah tersimpan secara aman di Google Drive Anda sebagai <strong>${result.name}</strong>.
          </p>
          <a href="${result.viewUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top: var(--space-2);">
            Buka di Google Drive ↗
          </a>
        `;

        showModal('Google Drive Backup', successBody);
      } catch (err) {
        console.error('Drive upload error:', err);
        showToast(`Gagal upload: ${err.message || 'Unknown error'}`, 'error', 4500);
      } finally {
        if (uploadBtn) uploadBtn.disabled = false;
        if (uploadText) uploadText.textContent = 'Simpan ke Google Drive';
      }
    }

    function handleDisconnectDrive() {
      if (confirm('Apakah Anda yakin ingin memutuskan akun Google Drive dari sesi ini?')) {
        signOutGoogleDrive();
        showToast('Akun Google Drive diputuskan.', 'info');
        renderGDriveUI();
      }
    }
  });

  return page;
}

/**
 * Open Desktop / Fallback Share Modal
 */
function openShareModal(photocard) {
  const shareText = encodeURIComponent('Look at my aesthetic photocard! Made with Photo Studio #PhotoStudio #Photobooth');
  const shareUrl = encodeURIComponent(window.location.origin);

  const modalBody = document.createElement('div');
  modalBody.className = 'share-options';
  modalBody.innerHTML = `
    <!-- Copy Image to Clipboard -->
    <div class="share-option" id="opt-copy-image">
      <div class="share-option-icon copy">${icon('image', 20)}</div>
      <div>
        <div class="share-option-name">Copy Image</div>
        <div style="font-size: 11px; color: var(--text-muted);">Paste in chat / Discord</div>
      </div>
    </div>

    <!-- WhatsApp Intent -->
    <a href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener noreferrer" class="share-option">
      <div class="share-option-icon whatsapp">💬</div>
      <div>
        <div class="share-option-name">WhatsApp</div>
        <div style="font-size: 11px; color: var(--text-muted);">Send to friend/status</div>
      </div>
    </a>

    <!-- Twitter / X Intent -->
    <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener noreferrer" class="share-option">
      <div class="share-option-icon twitter">🐦</div>
      <div>
        <div class="share-option-name">Twitter / X</div>
        <div style="font-size: 11px; color: var(--text-muted);">Post a tweet</div>
      </div>
    </a>

    <!-- Facebook Intent -->
    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer" class="share-option">
      <div class="share-option-icon facebook">📘</div>
      <div>
        <div class="share-option-name">Facebook</div>
        <div style="font-size: 11px; color: var(--text-muted);">Share to timeline</div>
      </div>
    </a>
  `;

  // Copy Image Event
  modalBody.querySelector('#opt-copy-image')?.addEventListener('click', async () => {
    if (navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': photocard.blob }),
        ]);
        showToast('Photocard image copied to clipboard! Ready to paste (Ctrl+V).', 'success', 3500);
        closeModal();
      } catch (err) {
        console.warn('Clipboard write image failed:', err);
        showToast('Browser blocked clipboard image write. Use Download instead.', 'warning');
      }
    } else {
      showToast('Clipboard image write not supported on this browser', 'info');
    }
  });

  showModal('Share Photocard', modalBody);
}

/**
 * Modal to input Google OAuth Client ID
 */
function promptClientIdModal(onSave) {
  const modalContent = document.createElement('div');
  modalContent.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-3);';
  modalContent.innerHTML = `
    <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5;">
      Untuk menyimpan foto ke Google Drive pribadi Anda, silakan masukkan <strong>Google Cloud OAuth 2.0 Client ID</strong> (Web application type).
    </p>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label style="font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary);">Google Client ID</label>
      <input type="text" id="input-client-id" class="memo-input" placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com" value="${getStoredClientId()}" />
    </div>
    <div style="font-size: 11px; color: var(--text-muted); background: var(--glass); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
      💡 Catatan: Client ID tersimpan secara aman di localStorage browser Anda dan hanya meminta otorisasi <code>drive.file</code>.
    </div>
  `;

  const footer = document.createElement('div');
  footer.style.cssText = 'display: flex; justify-content: flex-end; gap: var(--space-2);';
  footer.innerHTML = `
    <button class="btn btn-ghost btn-sm" id="btn-cancel-client">Batal</button>
    <button class="btn btn-primary btn-sm" id="btn-save-client">Simpan</button>
  `;

  footer.querySelector('#btn-cancel-client').onclick = closeModal;
  footer.querySelector('#btn-save-client').onclick = () => {
    const val = modalContent.querySelector('#input-client-id').value.trim();
    if (!val) {
      showToast('Silakan masukkan Google Client ID yang valid', 'warning');
      return;
    }
    closeModal();
    onSave(val);
  };

  showModal('Konfigurasi Google Drive', modalContent, footer);
}
