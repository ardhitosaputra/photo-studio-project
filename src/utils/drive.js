/**
 * Google Drive API Sync Module
 * Client-side OAuth 2.0 (Google Identity Services) & REST API v3 File Upload
 */

import { getItem, setItem } from './storage.js';

const CLIENT_ID_STORAGE_KEY = 'google_drive_client_id';
const DEFAULT_CLIENT_ID = '334563760-photostudio.apps.googleusercontent.com'; // Placeholder template

let currentAccessToken = null;
let tokenExpirationTime = 0;

/**
 * Get stored Google Client ID or default
 */
export function getStoredClientId() {
  return getItem(CLIENT_ID_STORAGE_KEY, '');
}

/**
 * Set Google Client ID
 */
export function setStoredClientId(clientId) {
  setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
}

/**
 * Check if Google Identity Services (GIS) library is loaded in window
 */
export function isGisLoaded() {
  return Boolean(window.google?.accounts?.oauth2);
}

/**
 * Request OAuth 2.0 Access Token from user
 * @param {string} clientId
 * @returns {Promise<string>} Access Token
 */
export function requestGoogleAccessToken(clientId) {
  return new Promise((resolve, reject) => {
    if (!isGisLoaded()) {
      return reject(new Error('Google Identity Services script is not loaded. Check internet connection.'));
    }

    if (!clientId) {
      return reject(new Error('Google Client ID is missing. Please enter your Client ID.'));
    }

    // Reuse existing valid token if not expired
    if (currentAccessToken && Date.now() < tokenExpirationTime) {
      return resolve(currentAccessToken);
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else if (response.access_token) {
            currentAccessToken = response.access_token;
            // expires_in is in seconds, buffer 60 seconds
            const expiresIn = parseInt(response.expires_in, 10) || 3600;
            tokenExpirationTime = Date.now() + (expiresIn - 60) * 1000;
            resolve(currentAccessToken);
          } else {
            reject(new Error('Failed to obtain access token from Google.'));
          }
        },
      });

      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Upload image blob to Google Drive using REST API v3 multipart upload
 * @param {Object} options
 * @param {Blob} options.blob - Image blob to upload
 * @param {string} options.filename - File name for Drive
 * @param {string} options.accessToken - Valid OAuth2 Access Token
 * @returns {Promise<{ id: string, name: string, viewUrl: string }>}
 */
export async function uploadFileToGoogleDrive({ blob, filename, accessToken }) {
  const metadata = {
    name: filename || `PhotoStudio_${Date.now()}.png`,
    mimeType: 'image/png',
    description: 'Captured and styled with Photo Studio Web App',
  };

  const boundary = '-------PhotoStudioMultipartBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Convert blob to base64 or read as binary arrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Construct multipart body
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
      Authorization: `Bearer ${accessToken}`,
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

