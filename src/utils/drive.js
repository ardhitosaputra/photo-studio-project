/**
 * Google Drive API Sync Module
 * Client-side OAuth 2.0 (Google Identity Services) & REST API v3 File Upload
 * Supports explicit user sign-in, account profile retrieval, sign-out, and direct cloud sync.
 */

import { getItem, setItem, removeItem } from './storage.js';

const CLIENT_ID_STORAGE_KEY = 'google_drive_client_id';
const USER_PROFILE_STORAGE_KEY = 'google_drive_user_profile';

let currentAccessToken = null;
let tokenExpirationTime = 0;
let currentUserProfile = null;

// Initialize user profile from storage if available
try {
  const savedProfile = getItem(USER_PROFILE_STORAGE_KEY, null);
  if (savedProfile) {
    currentUserProfile = typeof savedProfile === 'string' ? JSON.parse(savedProfile) : savedProfile;
  }
} catch {
  currentUserProfile = null;
}

/**
 * Get stored Google Client ID or empty string
 */
export function getStoredClientId() {
  return getItem(CLIENT_ID_STORAGE_KEY, '');
}

/**
 * Set Google Client ID in local storage
 */
export function setStoredClientId(clientId) {
  setItem(CLIENT_ID_STORAGE_KEY, clientId ? clientId.trim() : '');
}

/**
 * Check if Google Identity Services (GIS) library is loaded in window
 */
export function isGisLoaded() {
  return Boolean(window.google?.accounts?.oauth2);
}

/**
 * Check if user is currently connected to Google Drive
 */
export function isGoogleDriveConnected() {
  return Boolean(currentAccessToken && Date.now() < tokenExpirationTime);
}

/**
 * Get connected user profile details
 * @returns {{ name: string, email: string, picture: string } | null}
 */
export function getGoogleDriveUser() {
  return currentUserProfile;
}

/**
 * Request OAuth 2.0 Sign In with Google Drive permissions
 * @param {string} clientId
 * @returns {Promise<{ accessToken: string, user: Object }>}
 */
export function signInGoogleDrive(clientId) {
  return new Promise((resolve, reject) => {
    if (!isGisLoaded()) {
      return reject(new Error('Google Identity Services script is not loaded. Check your internet connection.'));
    }

    if (!clientId) {
      return reject(new Error('Google Client ID is missing. Please enter your Client ID.'));
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }

          if (response.access_token) {
            currentAccessToken = response.access_token;
            const expiresIn = parseInt(response.expires_in, 10) || 3600;
            tokenExpirationTime = Date.now() + (expiresIn - 60) * 1000;

            // Fetch user profile info
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${currentAccessToken}` },
              });

              if (userRes.ok) {
                const info = await userRes.json();
                currentUserProfile = {
                  name: info.name || info.email || 'Google User',
                  email: info.email || '',
                  picture: info.picture || '',
                };
                setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(currentUserProfile));
              }
            } catch (userErr) {
              console.warn('Failed to fetch user profile info:', userErr);
              currentUserProfile = { name: 'Google Account', email: '', picture: '' };
            }

            resolve({ accessToken: currentAccessToken, user: currentUserProfile });
          } else {
            reject(new Error('Failed to obtain access token from Google.'));
          }
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sign out / Revoke Google Drive token
 */
export function signOutGoogleDrive() {
  if (currentAccessToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(currentAccessToken, () => {
        console.debug('Google token revoked');
      });
    } catch (err) {
      console.warn('Error revoking token:', err);
    }
  }

  currentAccessToken = null;
  tokenExpirationTime = 0;
  currentUserProfile = null;
  removeItem(USER_PROFILE_STORAGE_KEY);
}

/**
 * Backwards-compatible access token requester
 */
export async function requestGoogleAccessToken(clientId) {
  if (isGoogleDriveConnected()) {
    return currentAccessToken;
  }
  const result = await signInGoogleDrive(clientId);
  return result.accessToken;
}

/**
 * Upload image blob to Google Drive using REST API v3 multipart upload
 * @param {Object} options
 * @param {Blob} options.blob - Image blob to upload
 * @param {string} [options.filename] - File name for Drive
 * @param {string} [options.accessToken] - Optional OAuth2 Access Token (uses active token if omitted)
 * @returns {Promise<{ id: string, name: string, viewUrl: string }>}
 */
export async function uploadFileToGoogleDrive({ blob, filename, accessToken }) {
  const token = accessToken || currentAccessToken;

  if (!token) {
    throw new Error('Please sign in to Google Drive first.');
  }

  const metadata = {
    name: filename || `PhotoStudio_${Date.now()}.png`,
    mimeType: 'image/png',
    description: 'Captured and styled with Photo Studio Web App',
  };

  const boundary = '-------PhotoStudioMultipartBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const metaHeader = 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata);
  const mediaHeader = 'Content-Type: image/png\r\n\r\n';

  const encoder = new TextEncoder();
  const part1 = encoder.encode(delimiter + metaHeader + delimiter + mediaHeader);
  const part2 = bytes;
  const part3 = encoder.encode(closeDelimiter);

  const fullPayload = new Uint8Array(part1.length + part2.length + part3.length);
  fullPayload.set(part1, 0);
  fullPayload.set(part2, part1.length);
  fullPayload.set(part3, part1.length + part2.length);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: fullPayload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Upload failed with status ${response.status}`;
    try {
      const errJson = JSON.parse(errorText);
      message = errJson.error?.message || message;
    } catch {}
    throw new Error(message);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    viewUrl: `https://drive.google.com/file/d/${result.id}/view`,
  };
}
