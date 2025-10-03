/**
 * Rate limiting middleware untuk backend
 */

// Rate limiting storage - dalam production gunakan Redis
const rateLimitStore = new Map();

const RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1 menit
  maxRequests: 10, // maksimal 10 request per menit per IP
  blockDuration: 300000 // block 5 menit jika melanggar
};

/**
 * Middleware untuk rate limiting berdasarkan IP
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function rateLimitMiddleware(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const now = Date.now();
  
  // Bersihkan data lama
  cleanupOldEntries(now);
  
  // Cek apakah IP sedang diblokir
  const ipData = rateLimitStore.get(clientIP);
  if (ipData && ipData.blocked && now < ipData.blockedUntil) {
    const remainingTime = Math.ceil((ipData.blockedUntil - now) / 1000);
    return res.status(429).json({ 
      error: `Terlalu banyak permintaan. Coba lagi dalam ${remainingTime} detik.` 
    });
  }
  
  // Reset jika periode block sudah habis
  if (ipData && ipData.blocked && now >= ipData.blockedUntil) {
    rateLimitStore.delete(clientIP);
  }
  
  // Inisialisasi atau update counter
  updateRequestCounter(clientIP, now, res);
  
  next();
}

/**
 * Bersihkan entries lama dari storage
 * @param {number} now - Current timestamp
 */
function cleanupOldEntries(now) {
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_CONFIG.windowMs) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Update request counter untuk IP
 * @param {string} clientIP - IP address
 * @param {number} now - Current timestamp
 * @param {object} res - Express response object
 */
function updateRequestCounter(clientIP, now, res) {
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now,
      blocked: false,
      blockedUntil: 0
    });
  } else {
    const data = rateLimitStore.get(clientIP);
    data.count++;
    
    // Cek apakah melebihi limit
    if (data.count > RATE_LIMIT_CONFIG.maxRequests) {
      data.blocked = true;
      data.blockedUntil = now + RATE_LIMIT_CONFIG.blockDuration;
      return res.status(429).json({ 
        error: "Terlalu banyak permintaan. Anda diblokir sementara." 
      });
    }
  }
}

/**
 * Get current rate limit stats (untuk debugging)
 * @returns {object} - Statistics
 */
function getRateLimitStats() {
  return {
    totalIPs: rateLimitStore.size,
    config: RATE_LIMIT_CONFIG,
    entries: Array.from(rateLimitStore.entries())
  };
}

module.exports = {
  rateLimitMiddleware,
  getRateLimitStats,
  RATE_LIMIT_CONFIG
};
