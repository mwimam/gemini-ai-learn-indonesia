/**
 * API Client untuk komunikasi dengan backend
 */

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.currentController = null; // For cancelling requests
  }

  /**
   * Kirim pesan ke backend
   * @param {string} message - Pesan yang akan dikirim
   * @param {string} model - Model AI yang dipilih (optional)
   * @returns {Promise<object>} - Response dari server
   */
  async sendMessage(message, model = null) {
    try {
      // Cancel previous request if exists
      if (this.currentController) {
        this.currentController.abort();
      }

      // Create new AbortController for this request
      this.currentController = new AbortController();

      const payload = { message };
      if (model) {
        payload.model = model;
      }

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: this.currentController.signal, // Add abort signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan respons dari server.");
      }

      // Clear controller after successful request
      this.currentController = null;

      return {
        success: true,
        data: data.reply,
        model: data.model
      };
    } catch (error) {
      // Clear controller
      this.currentController = null;

      // Handle abort error
      if (error.name === 'AbortError') {
        return {
          success: false,
          cancelled: true,
          error: "Request dibatalkan"
        };
      }

      return {
        success: false,
        error: error.message || "Terjadi kesalahan saat menghubungi server."
      };
    }
  }

  /**
   * Cancel current request
   */
  cancelCurrentRequest() {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
      return true;
    }
    return false;
  }

  /**
   * Check if there's an active request
   * @returns {boolean}
   */
  hasActiveRequest() {
    return this.currentController !== null;
  }

  /**
   * Cek status server
   * @returns {Promise<boolean>} - True jika server aktif
   */
  async checkServerStatus() {
    try {
      const response = await fetch(this.baseUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export untuk digunakan di file lain
window.ApiClient = ApiClient;
