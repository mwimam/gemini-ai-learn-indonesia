/**
 * Security middleware dan utilities untuk backend
 */

/**
 * Validasi dan sanitasi input pesan
 * @param {any} userMessage - Input dari user
 * @returns {object} - {isValid: boolean, sanitizedMessage?: string, error?: string}
 */
function validateAndSanitizeMessage(userMessage) {
  // Validasi input untuk keamanan
  if (!userMessage) {
    return {
      isValid: false,
      error: "Pesan tidak boleh kosong."
    };
  }

  // Validasi tipe data
  if (typeof userMessage !== 'string') {
    return {
      isValid: false,
      error: "Format pesan tidak valid."
    };
  }

  // Validasi panjang pesan (maksimal 1000 karakter)
  if (userMessage.length > 1000) {
    return {
      isValid: false,
      error: "Pesan terlalu panjang. Maksimal 1000 karakter."
    };
  }

  // Sanitasi input - hapus karakter berbahaya
  const sanitizedMessage = userMessage
    .trim()
    .replace(/[<>]/g, '') // Hapus HTML tags
    .replace(/javascript:/gi, '') // Hapus javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Hapus event handlers
    .replace(/\0/g, ''); // Hapus null bytes

  // Validasi setelah sanitasi
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    return {
      isValid: false,
      error: "Pesan tidak valid setelah pembersihan."
    };
  }

  return {
    isValid: true,
    sanitizedMessage
  };
}

/**
 * Middleware untuk validasi request body
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function validateMessageMiddleware(req, res, next) {
  const validation = validateAndSanitizeMessage(req.body.message);
  
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }
  
  // Simpan sanitized message ke request untuk digunakan di route handler
  req.sanitizedMessage = validation.sanitizedMessage;
  next();
}

/**
 * Security headers middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function securityHeadersMiddleware(req, res, next) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

/**
 * Log security events
 * @param {string} event - Event type
 * @param {object} details - Event details
 */
function logSecurityEvent(event, details) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, details);
}

module.exports = {
  validateAndSanitizeMessage,
  validateMessageMiddleware,
  securityHeadersMiddleware,
  logSecurityEvent
};
