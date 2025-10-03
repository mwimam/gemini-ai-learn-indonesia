/**
 * Security utilities untuk validasi dan sanitasi input
 */

class SecurityUtils {
  /**
   * Validasi panjang pesan
   * @param {string} message - Pesan yang akan divalidasi
   * @param {number} maxLength - Panjang maksimal (default: 1000)
   * @returns {object} - {isValid: boolean, error?: string}
   */
  static validateMessageLength(message, maxLength = 1000) {
    if (message.length > maxLength) {
      return {
        isValid: false,
        error: `Pesan terlalu panjang. Maksimal ${maxLength} karakter.`
      };
    }
    return { isValid: true };
  }

  /**
   * Sanitasi pesan untuk tampilan yang aman
   * @param {string} message - Pesan yang akan disanitasi
   * @returns {string} - Pesan yang sudah disanitasi
   */
  static sanitizeForDisplay(message) {
    return message
      .replace(/[<>]/g, "") // Hapus HTML tags
      .replace(/javascript:/gi, "") // Hapus javascript: protocol
      .replace(/on\w+\s*=/gi, ""); // Hapus event handlers
  }

  /**
   * Validasi tipe data pesan
   * @param {any} message - Data yang akan divalidasi
   * @returns {object} - {isValid: boolean, error?: string}
   */
  static validateMessageType(message) {
    if (typeof message !== 'string') {
      return {
        isValid: false,
        error: "Format pesan tidak valid."
      };
    }
    return { isValid: true };
  }

  /**
   * Validasi pesan kosong
   * @param {string} message - Pesan yang akan divalidasi
   * @returns {object} - {isValid: boolean, error?: string}
   */
  static validateMessageEmpty(message) {
    if (!message || message.trim().length === 0) {
      return {
        isValid: false,
        error: "Pesan tidak boleh kosong."
      };
    }
    return { isValid: true };
  }

  /**
   * Validasi lengkap untuk pesan
   * @param {any} message - Pesan yang akan divalidasi
   * @param {number} maxLength - Panjang maksimal
   * @returns {object} - {isValid: boolean, error?: string, sanitizedMessage?: string}
   */
  static validateMessage(message, maxLength = 1000) {
    // Validasi tipe data
    const typeCheck = this.validateMessageType(message);
    if (!typeCheck.isValid) return typeCheck;

    // Validasi pesan kosong
    const emptyCheck = this.validateMessageEmpty(message);
    if (!emptyCheck.isValid) return emptyCheck;

    // Validasi panjang
    const lengthCheck = this.validateMessageLength(message, maxLength);
    if (!lengthCheck.isValid) return lengthCheck;

    // Sanitasi untuk tampilan
    const sanitizedMessage = this.sanitizeForDisplay(message);

    return {
      isValid: true,
      sanitizedMessage
    };
  }
}

// Export untuk digunakan di file lain
window.SecurityUtils = SecurityUtils;
