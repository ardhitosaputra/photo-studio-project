/**
 * Modal dialog component
 */

let overlay = null;

export function initModal() {
  overlay = document.getElementById('modal-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

/**
 * Show modal with custom content
 */
export function showModal(title, contentEl, footerEl = null) {
  if (!overlay) initModal();
  
  overlay.innerHTML = '';
  
  const modal = document.createElement('div');
  modal.className = 'modal-content';
  
  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h3>${title}</h3>`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-ghost btn-icon';
  closeBtn.innerHTML = '✕';
  closeBtn.onclick = closeModal;
  header.appendChild(closeBtn);
  
  modal.appendChild(header);
  
  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  if (typeof contentEl === 'string') {
    body.innerHTML = contentEl;
  } else {
    body.appendChild(contentEl);
  }
  modal.appendChild(body);
  
  // Footer
  if (footerEl) {
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    if (typeof footerEl === 'string') {
      footer.innerHTML = footerEl;
    } else {
      footer.appendChild(footerEl);
    }
    modal.appendChild(footer);
  }
  
  overlay.appendChild(modal);
  overlay.classList.add('active');
  
  // Trap focus
  document.body.style.overflow = 'hidden';
}

/**
 * Close the modal
 */
export function closeModal() {
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}
