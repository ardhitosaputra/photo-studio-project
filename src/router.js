/**
 * Simple SPA Router
 * Hash-based routing for client-side navigation
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentPage = null;
    this.appContainer = null;
    this.onNavigate = null;
  }

  init(appContainer) {
    this.appContainer = appContainer;
    window.addEventListener('hashchange', () => this.handleRoute());
    // Handle initial route
    this.handleRoute();
  }

  /**
   * Register a route
   * @param {string} path - Route hash (e.g., 'home', 'camera')
   * @param {Function} handler - Function that returns the page DOM element
   */
  route(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Navigate to a route
   */
  navigate(path, data = {}) {
    this._pendingData = data;
    window.location.hash = path;
  }

  /**
   * Get current route data
   */
  getData() {
    return this._currentData || {};
  }

  /**
   * Handle route change
   */
  async handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const handler = this.routes[hash];

    if (!handler) {
      console.warn(`Route not found: ${hash}`);
      window.location.hash = 'home';
      return;
    }

    // Transition out current page
    if (this.currentPage) {
      this.currentPage.classList.add('page-exit');
      await new Promise(r => setTimeout(r, 200));
    }

    // Clear app container
    this.appContainer.innerHTML = '';
    
    // Store data
    this._currentData = this._pendingData || {};
    this._pendingData = null;

    // Create new page
    const page = await handler(this._currentData);
    if (page) {
      page.classList.add('page');
      this.appContainer.appendChild(page);
      this.currentPage = page;
    }

    if (this.onNavigate) {
      this.onNavigate(hash);
    }
  }
}

// Singleton
export const router = new Router();
