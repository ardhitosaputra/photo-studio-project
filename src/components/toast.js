/**
 * Toast notification system
 */

let toastContainer = null;

export function initToast() {
  toastContainer = document.getElementById('toast-container');
}

/**
 * Show a toast notification
 * @param {string} message 
 * @param {'info'|'success'|'error'|'warning'} type 
 * @param {number} duration - in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) initToast();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    info: 'ℹ️',
    success: '✓',
    error: '✕',
    warning: '⚠',
  };
  
  toast.innerHTML = `<span>${iconMap[type] || ''}</span> ${message}`;
  
  toastContainer.appendChild(toast);
  
  // Auto dismiss
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
