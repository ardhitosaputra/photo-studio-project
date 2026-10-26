/**
 * LocalStorage management
 */

const STORAGE_PREFIX = 'photo-studio:';

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

export function removeItem(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}
