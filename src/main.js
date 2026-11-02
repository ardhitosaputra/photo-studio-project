/**
 * Photo Studio — Main Entry Point
 */

import './styles/index.css';
import { router } from './router.js';
import { initToast } from './components/toast.js';
import { initModal } from './components/modal.js';
import { createHomePage } from './pages/home.js';
import { createCameraPage } from './pages/camera.js';
import { createEditorPage } from './pages/editor.js';

// Initialize core UI overlay components
initToast();
initModal();

// Register application routes
router.route('home', createHomePage);
router.route('camera', createCameraPage);
router.route('editor', createEditorPage);

// Mount router on #app container
const appContainer = document.getElementById('app');
if (appContainer) {
  router.init(appContainer);
} else {
  console.error('Root #app container not found in document');
}
