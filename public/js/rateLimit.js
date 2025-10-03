/**
 * Rate limiting utilities untuk mencegah spam
 */

class RateLimiter {
  constructor(config = {}) {
    this.config = {
      maxRequests: config.maxRequests || 5,
      timeWindow: config.timeWindow || 60000, // 1 menit
      ...config
    };
    
    this.requests = [];
    this.isBlocked = false;
    this.blockUntil = 0;
  }

  /**
   * Cek apakah request diizinkan berdasarkan rate limit
   * @returns {object} - {allowed: boolean, message?: string}
   */
  checkRateLimit() {
    const now = Date.now();

    // Hapus request lama yang sudah lewat time window
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.config.timeWindow
    );

    // Cek apakah masih dalam periode block
    if (this.isBlocked && now < this.blockUntil) {
      const remainingTime = Math.ceil((this.blockUntil - now) / 1000);
      return {
        allowed: false,
        message: `Terlalu banyak pesan. Coba lagi dalam ${remainingTime} detik.`,
      };
    }

    // Reset block jika sudah lewat
    if (this.isBlocked && now >= this.blockUntil) {
      this.isBlocked = false;
      this.requests = [];
    }

    // Cek apakah sudah mencapai limit
    if (this.requests.length >= this.config.maxRequests) {
      this.isBlocked = true;
      this.blockUntil = now + this.config.timeWindow;
      return {
        allowed: false,
        message: "Terlalu banyak pesan. Coba lagi dalam 1 menit.",
      };
    }

    // Tambah request baru
    this.requests.push(now);
    return { allowed: true };
  }

  /**
   * Reset rate limiter
   */
  reset() {
    this.requests = [];
    this.isBlocked = false;
    this.blockUntil = 0;
  }

  /**
   * Get current status
   * @returns {object} - Status informasi
   */
  getStatus() {
    return {
      requestCount: this.requests.length,
      maxRequests: this.config.maxRequests,
      isBlocked: this.isBlocked,
      remainingRequests: Math.max(0, this.config.maxRequests - this.requests.length)
    };
  }
}

// Export untuk digunakan di file lain
window.RateLimiter = RateLimiter;
