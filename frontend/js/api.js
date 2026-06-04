/**
 * CareTrack Clinic - Shared API client & UI Helper
 */

const API_BASE = '/api';

class API {
  // Toggle loading overlay spinner
  static showLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('active');
  }

  static hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.remove('active');
  }

  // Toast Notification Generator
  static showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
      <div class="toast-content">
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 50);

    // Auto-remove
    const autoRemove = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    // Close button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoRemove);
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Generic Request Handler
  static async request(endpoint, options = {}) {
    this.showLoader();
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        // Handle Session Expiration
        if (response.status === 401 && token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.showToast('Session expired. Please login again.', 'error');
          setTimeout(() => window.location.href = '/login.html', 1500);
          return null;
        }
        
        // Extract validation errors if present
        if (result.errors && result.errors.length > 0) {
          const errMsg = result.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          throw new Error(errMsg);
        }
        
        throw new Error(result.message || 'An error occurred during the request');
      }

      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      this.showToast(error.message, 'error');
      throw error;
    } finally {
      this.hideLoader();
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Global hook
window.API = API;
