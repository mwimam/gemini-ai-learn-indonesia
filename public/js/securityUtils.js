/**
 * Security utilities untuk validasi dan sanitasi input
 */

class SecurityUtils {
  /**
   * Validasi dan sanitasi pesan user
   * @param {string} message - Pesan yang akan divalidasi
   * @returns {Object} - Result object dengan isValid, sanitizedMessage, dan error
   */
  static validateMessage(message) {
    // Check if message is string
    if (typeof message !== 'string') {
      return {
        isValid: false,
        error: 'Pesan harus berupa teks',
        sanitizedMessage: ''
      };
    }

    // Trim whitespace
    const trimmed = message.trim();

    // Check empty message
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Pesan tidak boleh kosong',
        sanitizedMessage: ''
      };
    }

    // Check message length
    const maxLength = 1000;
    if (trimmed.length > maxLength) {
      return {
        isValid: false,
        error: `Pesan terlalu panjang. Maksimal ${maxLength} karakter`,
        sanitizedMessage: ''
      };
    }

    // Check for potentially harmful content
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          error: 'Pesan mengandung konten yang tidak diizinkan',
          sanitizedMessage: ''
        };
      }
    }

    // Sanitize HTML entities
    const sanitized = this.sanitizeHtml(trimmed);

    // Check for excessive special characters (potential spam)
    const specialCharCount = (sanitized.match(/[!@#$%^&*()_+={}\[\]|\\:";'<>?,./]/g) || []).length;
    const specialCharRatio = specialCharCount / sanitized.length;
    
    if (specialCharRatio > 0.5 && sanitized.length > 10) {
      return {
        isValid: false,
        error: 'Pesan mengandung terlalu banyak karakter khusus',
        sanitizedMessage: ''
      };
    }

    // Check for repeated characters (potential spam)
    if (this.hasExcessiveRepeatedChars(sanitized)) {
      return {
        isValid: false,
        error: 'Pesan mengandung terlalu banyak karakter berulang',
        sanitizedMessage: ''
      };
    }

    return {
      isValid: true,
      sanitizedMessage: sanitized,
      error: null
    };
  }

  /**
   * Sanitize HTML entities
   * @param {string} text - Text to sanitize
   * @returns {string} - Sanitized text
   */
  static sanitizeHtml(text) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
  }

  /**
   * Check for excessive repeated characters
   * @param {string} text - Text to check
   * @returns {boolean} - True if has excessive repeated chars
   */
  static hasExcessiveRepeatedChars(text) {
    // Check for more than 5 consecutive identical characters
    const consecutivePattern = /(.)\1{5,}/;
    if (consecutivePattern.test(text)) {
      return true;
    }

    // Check for excessive repetition of short patterns
    const shortPatternRepeats = /(.{1,3})\1{10,}/;
    if (shortPatternRepeats.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Validate URL (if needed for future features)
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL
   */
  static isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Generate safe ID for messages
   * @returns {string} - Safe ID string
   */
  static generateSafeId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `msg_${timestamp}_${random}`;
  }

  /**
   * Check if text contains only safe characters
   * @param {string} text - Text to check
   * @returns {boolean} - True if contains only safe characters
   */
  static containsOnlySafeChars(text) {
    // Allow letters, numbers, common punctuation, and whitespace
    const safePattern = /^[a-zA-Z0-9\s\.,!?;:()\-_'"@#$%&+=\[\]{}|\\\/\n\r\t]*$/;
    return safePattern.test(text);
  }

  /**
   * Rate limiting helper (basic client-side check)
   * @param {string} key - Unique key for rate limiting
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if within rate limit
   */
  static checkClientRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `rateLimit_${key}`;
    
    try {
      const stored = localStorage.getItem(storageKey);
      const requests = stored ? JSON.parse(stored) : [];
      
      // Filter out old requests
      const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
      
      // Check if under limit
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      // Add current request
      validRequests.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validRequests));
      
      return true;
    } catch (error) {
      console.warn('Rate limiting check failed:', error);
      return true; // Fail open
    }
  }
}

// Export untuk digunakan di module lain
window.SecurityUtils = SecurityUtils;
